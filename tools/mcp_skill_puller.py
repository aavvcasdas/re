#!/usr/bin/env python3
"""从 MCP 服务器拉取技能(list_skills / load_skill)到本地技能库。

适用于任何把技能暴露成工具面的 MCP 服务器(本仓库的参考实现即如此)。
注意:load_skill 只允许读 markdown,所以**脚本不会被拉取**——这是产品面的设计,
脚本只能通过"技能包(zip + sha256)"通道分发,本脚本会如实报告哪些文件跳过了。

用法:
    # 只探测对方有没有技能面
    python3 tools/mcp_skill_puller.py --server "~/vcdmind-replica/bin/vcdmind-skills" --probe

    # 拉取到本地技能库
    python3 tools/mcp_skill_puller.py --server "./replica/mcp_stdio_server.py" \
        --out ./pulled-library
"""

from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
import sys
from pathlib import Path

SKILL_TOOL_NAMES = ("list_skills", "load_skill", "run_skill_script")


class MCPSession:
    """最小 MCP stdio 客户端:按行 JSON(与 vcdmind-mcp.exe 的线格式一致)。"""

    def __init__(self, command: str, env: dict | None = None):
        argv = shlex.split(os.path.expanduser(command))
        self.proc = subprocess.Popen(
            argv, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, bufsize=1, env=env or os.environ.copy(),
        )
        self._id = 0

    def rpc(self, method: str, params: dict | None = None) -> dict:
        self._id += 1
        payload = {"jsonrpc": "2.0", "id": self._id, "method": method}
        if params is not None:
            payload["params"] = params
        self.proc.stdin.write(json.dumps(payload) + "\n")
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line:
            err = self.proc.stderr.read()[:400]
            raise RuntimeError(f"服务器无响应(已退出?)。stderr: {err}")
        return json.loads(line)

    def tools(self) -> list[dict]:
        return self.rpc("tools/list").get("result", {}).get("tools", [])

    def call(self, name: str, args: dict) -> dict:
        return self.rpc("tools/call", {"name": name, "arguments": args}).get("result", {})

    def close(self) -> None:
        try:
            self.proc.stdin.close()
            self.proc.terminate()
        except Exception:
            pass


def _text_of(result: dict) -> str:
    for part in result.get("content", []):
        if part.get("type") == "text":
            return part.get("text", "")
    return ""


def _listing_from_text(text: str) -> list[str]:
    """兜底:从"目录清单"文本里解析路径。"""
    paths: list[str] = []
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith(("目录清单", "正文点到", "脚本用", "(", "（")):
            continue
        if "/" in line or line.endswith((".md", ".py", ".sh", ".mjs", ".cjs")):
            paths.append(line)
    return paths


def pull(server_cmd: str, out_dir: Path, probe_only: bool = False, skill_filter: str | None = None) -> int:
    session = MCPSession(server_cmd)
    try:
        tools = session.tools()
        names = [t["name"] for t in tools]
        print(f"==> 服务器工具面({len(names)} 个):{', '.join(names)}")

        skill_tools = [n for n in names if n in SKILL_TOOL_NAMES]
        if not skill_tools:
            print("\n!! 该服务器**没有技能工具**(无 list_skills / load_skill / run_skill_script)。")
            print("   这正是 MSI 里 vcdmind-mcp.exe 的样子:5 个平台工具,技能不在 MCP 面内;")
            print("   官方技能走的是平台 HTTP 接口 /api/assistant/skills(且需登录)——见 tools/pull_skills_http.py")
            return 2
        print(f"==> 检测到技能面:{', '.join(skill_tools)}")

        if probe_only:
            return 0

        if "list_skills" not in names:
            print("!! 服务器没有 list_skills,无法枚举技能名(只有 load_skill 时需已知技能名)。")
            return 3

        listing = session.call("list_skills", {})
        skills = (listing.get("structuredContent") or {}).get("skills", [])
        if not skills and listing.get("content"):
            print("!! list_skills 未返回 structuredContent,无法结构化拉取;原文:", _text_of(listing)[:200])
            return 4
        if skill_filter:
            skills = [s for s in skills if s["name"] == skill_filter]
        print(f"==> 技能库:{len(skills)} 个 → {', '.join(s['name'] for s in skills) or '(空)'}")

        out_dir.mkdir(parents=True, exist_ok=True)
        report: list[dict] = []
        for entry in skills:
            name = entry["name"]
            manifest = session.call("load_skill", {"name": name})
            structured = manifest.get("structuredContent") or {}
            md_files = structured.get("markdownFiles") or _listing_from_text(_text_of(manifest))
            scripts = structured.get("scripts", [])

            md_files = [f for f in md_files if str(f).lower().endswith((".md", ".markdown"))]
            dest = out_dir / name
            pulled: list[str] = []
            for rel in md_files:
                got = session.call("load_skill", {"name": name, "file": rel})
                text = (got.get("structuredContent") or {}).get("text") or _text_of(got)
                if got.get("isError"):
                    print(f"    [跳过] {name}/{rel}: {text[:80]}")
                    continue
                target = dest / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(text, encoding="utf-8")
                pulled.append(rel)
                print(f"    [拉取] {name}/{rel}  {len(text.encode())} B")

            for rel in scripts:
                print(f"    [跳过] {name}/{rel}(脚本不经 load_skill 暴露,需走技能包 zip 通道)")

            report.append({
                "skill": name,
                "description": entry.get("description", ""),
                "origin": entry.get("origin"),
                "pulledMarkdown": pulled,
                "skippedScripts": list(scripts),
                "note": "脚本未拉取:产品面只允许 load_skill 读 markdown",
            })

        (out_dir / "_pull-report.json").write_text(
            json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\n==> 完成:{len(report)} 个技能 → {out_dir}")
        print(f"    拉取到的 markdown:{sum(len(r['pulledMarkdown']) for r in report)} 个文件")
        print(f"    未拉取的脚本:{sum(len(r['skippedScripts']) for r in report)} 个(设计如此)")
        print(f"    报告:{out_dir}/_pull-report.json")
        return 0
    finally:
        session.close()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--server", required=True, help="启动 MCP stdio 服务器的命令")
    ap.add_argument("--out", type=Path, default=Path("pulled-library"))
    ap.add_argument("--probe", action="store_true", help="只探测技能面,不拉取")
    ap.add_argument("--skill", default=None, help="只拉某个技能")
    args = ap.parse_args()
    sys.exit(pull(args.server, args.out, args.probe, args.skill))


if __name__ == "__main__":
    main()
