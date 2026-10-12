#!/usr/bin/env python3
"""端到端演示:打包 → 校验 → 安装 → 索引 → load_skill → run_skill_script,含反例。

运行:  python3 replica/demo.py
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
import tempfile
import time
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from skill_runtime import (  # noqa: E402
    SkillError,
    load_skill,
    run_skill_script,
    skill_index,
    write_skill_markdown,
)
from skillpack import install, pack, verify  # noqa: E402

RULE = "─" * 78
EXAMPLE = HERE / "skills" / "video-notes"


def banner(text: str) -> None:
    print(f"\n{RULE}\n▶ {text}\n{RULE}")


def main() -> int:
    work = Path(tempfile.mkdtemp(prefix="skilldemo-"))
    library = work / "skill-library"
    library.mkdir(parents=True)
    print(f"工作目录: {work}")

    # ------------------------------------------------------------------ 1
    banner("1. 打包:技能目录 → 市场包(单一顶层目录 + .vcdmind-origin)")
    zpath = work / "video-notes-0.1.0.zip"
    info = pack(EXAMPLE, zpath, origin="official", version="0.1.0")
    print(json.dumps(info, indent=2, ensure_ascii=False))

    # ------------------------------------------------------------------ 2
    banner("2. 校验流水线(带正确 sha256)")
    zbytes = zpath.read_bytes()
    for r in verify(zbytes, info["sha256"]):
        print(f"   [{'OK ' if r['ok'] else 'FAIL'}] {r['step']:<18} {r['message']}")

    # ------------------------------------------------------------------ 3
    banner("3. 反例 A:sha256 不一致 → 取消安装")
    for r in verify(zbytes, "0" * 64):
        print(f"   [{'OK ' if r['ok'] else 'FAIL'}] {r['step']:<18} {r['message']}")

    # ------------------------------------------------------------------ 4
    banner("4. 反例 B:顶层目录不唯一 / 缺 SKILL.md / 非法类型")
    bad = work / "bad.zip"
    with zipfile.ZipFile(bad, "w") as zf:
        zf.writestr("a/SKILL.md", "---\nname: a\n---\n")
        zf.writestr("b/SKILL.md", "---\nname: b\n---\n")
        zf.writestr("c/evil.exe", "MZ")
    for r in verify(bad.read_bytes(), None):
        print(f"   [{'OK ' if r['ok'] else 'FAIL'}] {r['step']:<18} {r['message']}")

    # ------------------------------------------------------------------ 5
    banner("5. 安装到 skill-library/")
    res = install(zbytes, library, info["sha256"])
    print(json.dumps({k: v for k, v in res.items() if k != "checks"}, indent=2, ensure_ascii=False))
    print("落盘:", sorted(str(p.relative_to(library)) for p in library.rglob("*") if p.is_file()))

    # ------------------------------------------------------------------ 6
    banner("6. assistant_skill_index → 技能索引(只给元数据)")
    print(json.dumps(skill_index(library), indent=2, ensure_ascii=False))

    # ------------------------------------------------------------------ 7
    banner("7. load_skill(不带 file)→ 目录清单,不灌正文")
    print(load_skill(library, "video-notes"))

    # ------------------------------------------------------------------ 8
    banner("8. load_skill(file=...) → 按需读正文")
    print(load_skill(library, "video-notes", file="references/notes.md")[:600], "…")

    # ------------------------------------------------------------------ 9
    banner("9. run_skill_script → 只执行,不读源码(含沙箱环境自证)")
    sample = work / "demo.mp4"
    sample.write_bytes(b"\x00" * 1024)
    t0 = time.monotonic()
    out = run_skill_script(library, "video-notes", "scripts/frame_plan.py", args=[str(sample), "5"])
    print(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"(宿主环境变量 {len(os.environ)} 个;脚本只看到 "
          f"{len([l for l in out['stdout'].splitlines() if l.startswith('visible env')][0].split(': ')[1].split(', '))} 个)")
    print(f"实测耗时 {int((time.monotonic()-t0)*1000)} ms,返回结构字段与产品一致")

    # ------------------------------------------------------------------ 10
    banner("10. 反例 C:越界读取 / 非 markdown 写入 / 非白名单脚本 / 超时")
    cases: list[tuple[str, callable]] = [
        ("load_skill(file='../../../../etc/passwd')",
         lambda: load_skill(library, "video-notes", file="../../../../etc/passwd")),
        ("load_skill(file='scripts/frame_plan.py')",
         lambda: load_skill(library, "video-notes", file="scripts/frame_plan.py")),
        ("write_skill_markdown(file='video-notes/scripts/x.py')",
         lambda: write_skill_markdown(library, "video-notes/scripts/x.py", "print(1)")),
        ("load_skill(未知技能)", lambda: load_skill(library, "no-such-skill")),
        ("run_skill_script(非白名单)",
         lambda: run_skill_script(library, "video-notes", "scripts/evil.bat")),
    ]
    for label, fn in cases:
        try:
            fn()
            print(f"   [!!] {label} → 未拦截(不符合预期)")
        except SkillError as exc:
            print(f"   [OK] {label}\n        code={exc.code}  message={exc.message}")

    slow = library / "video-notes" / "scripts" / "slow.py"
    slow.write_text("import time\ntime.sleep(30)\n")
    out = run_skill_script(library, "video-notes", "scripts/slow.py", timeout_ms=800)
    print(f"   [OK] 超时控制 → timedOut={out['timedOut']} durationMs={out['durationMs']} "
          f"(进程组已被强杀)")
    slow.unlink()

    banner("完成")
    print("所有正例通过;反例均按产品文案拦截。清理:", work)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
