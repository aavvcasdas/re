#!/usr/bin/env python3
"""从平台 HTTP 接口拉取官方技能 —— 复刻观察到的技能分发流程。

流程(依据静态证据,报错文案逐字取自二进制):
    GET  {api_base}/api/assistant/skills                              列出技能(需登录)
    POST {api_base}/api/assistant/skills/{name}/versions/{ver}/download  取下载地址 + sha256
    下载 zip → 校验 sha256 → 走技能包校验流水线 → 安装到本地 skill-library/

凭证:必须由**你自己**提供(Bearer token),脚本不会去猜、不会绕过登录:
    --token / 环境变量 VCDMIND_API_TOKEN

用法:
    # 自测:起一个本地假平台,验证"列表→下载→校验→安装"全流程(不需要真实账号)
    python3 tools/pull_skills_http.py --self-test

    # 真用:在你自己的机器上,带上你自己的 token
    python3 tools/pull_skills_http.py --api-base https://api-vcdmind.bokecity.com \
        --token "$VCDMIND_API_TOKEN" --out ~/skill-library [--skill video-notes] [--version 0.1.0]
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import threading
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "replica"))
from skillpack import install  # noqa: E402

DEFAULT_BASE = "https://api-vcdmind.bokecity.com"


class PullError(Exception):
    def __init__(self, message: str, code: str = "pull_failed"):
        super().__init__(message)
        self.code = code
        self.message = message


def _request(url: str, token: str, method: str = "GET", body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json" if data else "application/json",
        "X-Workflow-Studio-Protocol-Version": "1",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read()
    except urllib.error.HTTPError as exc:
        detail = exc.read(300).decode("utf-8", "replace")
        if exc.code in (401, 403):
            raise PullError(f"鉴权失败(HTTP {exc.code})——登录后才能查看官方技能。", "unauthorized") from exc
        raise PullError(f"平台返回 HTTP {exc.code}:{detail}", "platform_failed") from exc
    except urllib.error.URLError as exc:
        raise PullError(f"无法连接平台({exc.reason})。若在受限网络里,出网会被拦截。", "network_unreachable") from exc
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise PullError(f"技能目录返回格式不正确:{raw[:200]!r}", "invalid_response") from exc


def _items(payload) -> list[dict]:
    if isinstance(payload, list):
        return payload
    for key in ("items", "data", "skills", "list"):
        if isinstance(payload.get(key), list):
            return payload[key]
    return []


def list_skills(api_base: str, token: str) -> list[dict]:
    payload = _request(f"{api_base.rstrip('/')}/api/assistant/skills", token)
    items = _items(payload)
    if not items and isinstance(payload, dict):
        raise PullError(f"技能目录返回格式不正确,顶层键:{sorted(payload.keys())}", "invalid_response")
    return items


def download_package(api_base: str, token: str, name: str, version: str) -> tuple[bytes, str]:
    api_base = api_base.rstrip("/")
    payload = _request(
        f"{api_base}/api/assistant/skills/{name}/versions/{version}/download",
        token, method="POST", body={},
    )
    url = None
    for key in ("url", "download_url", "downloadUrl", "package_url"):
        if payload.get(key):
            url = payload[key]
            break
    if not url:
        raise PullError(f"技能包下载地址为空。返回键:{sorted(payload.keys())}", "invalid_response")
    if url.startswith("/"):
        url = api_base + url
    expected = None
    for key in ("sha256", "checksum", "hash"):
        if payload.get(key):
            expected = str(payload[key]).lower()
            break
    if not expected:
        raise PullError("技能包缺少 sha256,已取消安装。", "missing_sha256")

    try:
        with urllib.request.urlopen(url, timeout=120) as resp:
            data = resp.read()
    except urllib.error.URLError as exc:
        raise PullError(f"技能包下载失败({exc.reason})。", "download_failed") from exc
    actual = hashlib.sha256(data).hexdigest()
    if actual != expected:
        raise PullError("技能包校验失败:sha256 不一致,已取消安装。", "sha256_mismatch")
    return data, actual


def pull(api_base: str, token: str, out_dir: Path, only: str | None, version: str | None) -> int:
    if not token:
        raise PullError("需要 token(登录后才能查看官方技能)。用 --token 或 VCDMIND_API_TOKEN 提供你自己的凭证。",
                        "unauthorized")
    skills = list_skills(api_base, token)
    print(f"==> 技能目录:{len(skills)} 个")
    if skills:
        print(f"    条目字段示例:{sorted(skills[0].keys())}")
    for entry in skills:
        name = entry.get("name") or entry.get("skill") or entry.get("id")
        ver = version or entry.get("version") or entry.get("latest_version")
        if only and name != only:
            continue
        if not name or not ver:
            print(f"    [跳过] 条目缺少 name/version:{entry}")
            continue
        print(f"    [下载] {name}@{ver} …")
        data, sha = download_package(api_base, token, name, ver)
        result = install(data, out_dir, sha)
        if result["installed"]:
            print(f"    [安装] {result['skill']}  sha256={sha[:16]}…  ({len(data)} B)")
        else:
            print(f"    [失败] {result['error']}")
    print(f"==> 技能库:{out_dir}")
    return 0


# --------------------------------------------------------------------------- #
# 自测:本地假平台(仅用于验证本脚本的流程实现)
# --------------------------------------------------------------------------- #

def _self_test() -> int:
    from skillpack import pack

    here = Path(__file__).resolve().parent.parent
    work = Path("/tmp/pull-skills-selftest")
    if work.exists():
        import shutil
        shutil.rmtree(work)
    work.mkdir(parents=True)

    zip_path = work / "video-notes-0.1.0.zip"
    meta = pack(here / "replica/skills/video-notes", zip_path, origin="official", version="0.1.0")
    pkg_bytes = zip_path.read_bytes()

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):  # 静音
            pass

        def _json(self, obj, code=200):
            body = json.dumps(obj).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if self.path == "/api/assistant/skills":
                if self.headers.get("Authorization") != "Bearer self-test-token":
                    return self._json({"message": "unauthorized"}, 401)
                return self._json({"items": [{
                    "name": "video-notes", "version": "0.1.0",
                    "description": "示例技能", "file_count": meta["files"],
                    "release_notes": "自测包",
                }]})
            if self.path.startswith("/pkg/"):
                self.send_response(200)
                self.send_header("Content-Type", "application/zip")
                self.send_header("Content-Length", str(len(pkg_bytes)))
                self.end_headers()
                self.wfile.write(pkg_bytes)
                return
            self._json({"message": "not found"}, 404)

        def do_POST(self):
            if self.path.startswith("/api/assistant/skills/") and self.path.endswith("/download"):
                port = self.server.server_address[1]
                return self._json({
                    "url": f"http://127.0.0.1:{port}/pkg/video-notes-0.1.0.zip",
                    "sha256": meta["sha256"],
                    "file_count": meta["files"],
                    "release_notes": "自测包",
                })
            self._json({"message": "not found"}, 404)

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{port}"
    print(f"(假平台已启动:{base})")

    ok = True

    print("\n── 用例 1:正常拉取 ──")
    try:
        library = work / "skill-library"
        pull(base, "self-test-token", library, only=None, version=None)
        files = sorted(str(p.relative_to(library)) for p in library.rglob("*") if p.is_file())
        print("    落盘:", files)
    except PullError as exc:
        ok = False
        print(f"    [失败] {exc.message}")

    print("\n── 用例 2:sha256 不一致 → 取消安装 ──")
    original = meta["sha256"]
    Handler.do_POST = lambda self: self._json({
        "url": f"http://127.0.0.1:{port}/pkg/video-notes-0.1.0.zip", "sha256": "0" * 64})
    try:
        pull(base, "self-test-token", work / "lib2", None, None)
        ok = False
        print("    [!!] 未拦截")
    except PullError as exc:
        print(f"    [OK] {exc.code}: {exc.message}")

    print("\n── 用例 3:缺少 sha256 → 取消安装 ──")
    Handler.do_POST = lambda self: self._json({
        "url": f"http://127.0.0.1:{port}/pkg/video-notes-0.1.0.zip"})
    try:
        pull(base, "self-test-token", work / "lib3", None, None)
        ok = False
        print("    [!!] 未拦截")
    except PullError as exc:
        print(f"    [OK] {exc.code}: {exc.message}")

    print("\n── 用例 4:无 token → 拒绝 ──")
    try:
        pull(base, "", work / "lib4", None, None)
        ok = False
        print("    [!!] 未拦截")
    except PullError as exc:
        print(f"    [OK] {exc.code}: {exc.message}")

    print("\n── 用例 5:错误 token → 401 ──")
    try:
        pull(base, "wrong-token", work / "lib5", None, None)
        ok = False
        print("    [!!] 未拦截")
    except PullError as exc:
        print(f"    [OK] {exc.code}: {exc.message}")

    server.shutdown()
    print(f"\n自测{'全部通过' if ok else '有失败'}(工作目录 {work})")
    return 0 if ok else 1


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--api-base", default=os.environ.get("VCDMIND_API_BASE_URL", DEFAULT_BASE))
    ap.add_argument("--token", default=os.environ.get("VCDMIND_API_TOKEN", ""))
    ap.add_argument("--out", type=Path, default=Path.home() / "skill-library")
    ap.add_argument("--skill", default=None, help="只拉某个技能")
    ap.add_argument("--version", default=None, help="指定版本(默认用列表返回的版本)")
    ap.add_argument("--self-test", action="store_true", help="用本地假平台验证流程实现")
    args = ap.parse_args()

    if args.self_test:
        sys.exit(_self_test())
    try:
        sys.exit(pull(args.api_base, args.token, args.out, args.skill, args.version))
    except PullError as exc:
        print(f"!! {exc.code}: {exc.message}")
        sys.exit(1)


if __name__ == "__main__":
    main()
