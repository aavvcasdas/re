#!/usr/bin/env python3
"""技能包(skill package)打包与校验的参考实现。

复刻依据:skill_market.rs 的安装流水线报错文案(见 复刻方案.md §5)。
`verify()` 会把观察到的每一步都跑成显式检查,并返回逐条结果。

用法:
    python3 skillpack.py pack   <技能目录> <输出.zip> [--origin official]
    python3 skillpack.py verify <技能.zip> [--sha256 <期望值>]
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from skill_runtime import (  # noqa: E402
    ALLOWED_SCRIPT_EXTS,
    MARKDOWN_EXTS,
    ORIGIN_MARKER,
    SKILL_ENTRY_FILE,
    parse_skill_md,
)

# 观测到的硬上限;"文件数上限"未在字符串中出现(N 为格式化占位),取可配置默认值。
MAX_UNPACKED_BYTES = 128 * 1024 * 1024
MAX_FILE_BYTES = 32 * 1024 * 1024
MAX_FILE_COUNT = 512
IGNORED_TOP_LEVEL = ("__MACOSX",)
IGNORED_NAMES = (".DS_Store",)

# 允许存在的文件类型(白名单)。正文/说明 md、脚本、来源标记、常见资源。
ALLOWED_SUFFIXES = set(ALLOWED_SCRIPT_EXTS) | set(MARKDOWN_EXTS) | {
    ".json", ".yaml", ".yml", ".toml", ".txt", ".csv",
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
    ".wav", ".mp3", ".mp4", ".mov", ".ttf", ".otf",
}


class ValidationError(Exception):
    pass


def _is_ignored(rel: Path) -> bool:
    parts = rel.parts
    if not parts:
        return True
    if parts[0] in IGNORED_TOP_LEVEL:
        return True
    return any(p in IGNORED_NAMES for p in parts)


def pack(skill_dir: Path, out_zip: Path, origin: str = "official", version: str = "0.1.0") -> dict:
    """把技能目录打成市场包:单一顶层目录 = 技能名,并写入 .vcdmind-origin。"""
    skill_dir = Path(skill_dir).resolve()
    entry = skill_dir / SKILL_ENTRY_FILE
    if not entry.is_file():
        raise ValidationError(f"技能包顶层目录缺少 {SKILL_ENTRY_FILE}。")
    meta, _ = parse_skill_md(entry.read_text(encoding="utf-8"))
    name = meta.name or skill_dir.name
    if name != skill_dir.name:
        raise ValidationError(f"技能名不一致:目录是 {skill_dir.name},说明里写的是 {name}。")

    out_zip.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        files = sorted(p for p in skill_dir.rglob("*") if p.is_file())
        zf.writestr(f"{name}/{ORIGIN_MARKER}", json.dumps(
            {"origin": origin, "version": version, "packedBy": "skillpack.py"}, ensure_ascii=False))
        for p in files:
            if p.name == ORIGIN_MARKER:
                continue
            zf.write(p, f"{name}/{p.relative_to(skill_dir)}")
    data = out_zip.read_bytes()
    return {
        "package": str(out_zip),
        "skill": name,
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "files": len(files) + 1,
    }


def verify(zip_bytes: bytes, expected_sha256: str | None = None) -> list[dict]:
    """按观察到的顺序执行全部校验,返回逐条结果(ok / message)。"""
    checks: list[dict] = []

    def add(step: str, ok: bool, message: str = "") -> None:
        checks.append({"step": step, "ok": ok, "message": message})

    add("sha256", True, "")
    if expected_sha256:
        actual = hashlib.sha256(zip_bytes).hexdigest()
        if actual.lower() != expected_sha256.lower():
            add("sha256", False, "技能包校验失败:sha256 不一致,已取消安装。")
            return checks
    else:
        add("sha256", False, "技能包缺少 sha256,已取消安装。")

    try:
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        bad = zf.testzip()
    except zipfile.BadZipFile as exc:
        add("zip", False, f"技能包不是有效 zip:{exc}")
        return checks
    add("zip", bad is None, "" if bad is None else f"读取技能包条目失败:{bad}")
    if bad is not None:
        return checks

    names = [n for n in zf.namelist() if not _is_ignored(Path(n))]
    tops = {n.split("/")[0] for n in names if n.split("/")[0]}
    if len(tops) != 1:
        add("top_level", False, "技能包必须只包含一个顶层目录。")
        return checks
    top = tops.pop()
    add("top_level", True, top)

    inner = [n for n in names if n != top and n != f"{top}/"]
    if not inner:
        add("top_level_content", False, "技能包解压后缺少顶层目录。")
        return checks
    entry = f"{top}/{SKILL_ENTRY_FILE}"
    if entry not in names:
        add("entry", False, f"技能包顶层目录缺少 {SKILL_ENTRY_FILE}。")
        return checks
    add("entry", True, entry)
    if ORIGIN_MARKER not in " ".join(Path(n).name for n in names):
        add("origin_marker", False, f"技能包顶层目录缺少 {ORIGIN_MARKER}。")
    else:
        add("origin_marker", True, "")

    meta, _ = parse_skill_md(zf.read(entry).decode("utf-8", errors="replace"))
    declared = meta.name or top
    if declared != top:
        add("name_match", False, f"技能名不一致:目录是 {top},说明里写的是 {declared}。")
        return checks
    add("name_match", True, declared)

    infos = [i for i in zf.infolist() if not _is_ignored(Path(i.filename)) and not i.is_dir()]
    total = sum(i.file_size for i in infos)
    if total > MAX_UNPACKED_BYTES:
        add("unpacked_size", False, "技能包解压后超过 128MB 上限。")
    else:
        add("unpacked_size", True, f"{total} bytes")

    big = [i.filename for i in infos if i.file_size > MAX_FILE_BYTES]
    if big:
        add("file_size", False, f"技能包含超过 32MB 的文件:{big[0]}")
    else:
        add("file_size", True, "")

    if len(infos) > MAX_FILE_COUNT:
        add("file_count", False, f"技能包文件数超过 {MAX_FILE_COUNT} 上限。")
    else:
        add("file_count", True, f"{len(infos)} files")

    bad_ext = sorted({Path(i.filename).suffix.lower() for i in infos} - ALLOWED_SUFFIXES - {""})
    if bad_ext:
        add("file_types", False, f"技能包含不支持类型的文件:{bad_ext}")
    else:
        add("file_types", True, "")

    # 路径安全:拒绝绝对路径与 .. 越界
    escapes = [i.filename for i in infos if Path(i.filename).is_absolute() or ".." in Path(i.filename).parts]
    if escapes:
        add("path_safety", False, f"技能包含非法路径:{escapes[0]}")
    else:
        add("path_safety", True, "")

    return checks


def install(zip_bytes: bytes, library_root: Path, expected_sha256: str | None = None) -> dict:
    """校验通过后解压安装到 skill-library/<技能名>/。"""
    checks = verify(zip_bytes, expected_sha256)
    failed = [c for c in checks if not c["ok"]]
    if failed:
        return {"installed": False, "checks": checks, "error": failed[-1]["message"]}
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        names = [n for n in zf.namelist() if not _is_ignored(Path(n))]
        top = names[0].split("/")[0]
        dest = Path(library_root) / top
        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True, exist_ok=True)
        for info in zf.infolist():
            rel = Path(info.filename)
            if info.is_dir() or _is_ignored(rel):
                continue
            out = dest / Path(*rel.parts[1:])
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(zf.read(info))
    return {"installed": True, "skill": top, "checks": checks}


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("pack")
    p.add_argument("skill_dir", type=Path)
    p.add_argument("out_zip", type=Path)
    p.add_argument("--origin", default="official")
    v = sub.add_parser("verify")
    v.add_argument("zip", type=Path)
    v.add_argument("--sha256", default=None)
    args = ap.parse_args()

    if args.cmd == "pack":
        print(json.dumps(pack(args.skill_dir, args.out_zip, args.origin), indent=2, ensure_ascii=False))
        return

    results = verify(args.zip.read_bytes(), args.sha256)
    for r in results:
        print(f"  [{'OK ' if r['ok'] else 'FAIL'}] {r['step']:<18} {r['message']}")
    sys.exit(0 if all(r["ok"] for r in results) else 1)


if __name__ == "__main__":
    main()
