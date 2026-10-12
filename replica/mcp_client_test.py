#!/usr/bin/env python3
"""MCP stdio 客户端测试:对着 mcp_stdio_server.py 走一遍真实会话。

验证:initialize → tools/list → tools/call(load_skill / run_skill_script / 平台桩工具)
以及 unknown method / unknown tool 的错误路径。
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from demo import EXAMPLE  # noqa: E402  复用示例技能
from skillpack import install, pack  # noqa: E402


def main() -> int:
    work = Path(tempfile.mkdtemp(prefix="mcprep-"))
    library = work / "skill-library"
    library.mkdir(parents=True)
    zpath = work / "video-notes.zip"
    meta = pack(EXAMPLE, zpath, origin="official")
    install(zpath.read_bytes(), library, meta["sha256"])

    env = dict(os.environ)
    env["VCDMIND_SKILL_LIBRARY"] = str(library)
    env["VCDMIND_API_BASE_URL"] = "https://api.example.com"
    env["VCDMIND_IMAGE_POLL_TIMEOUT"] = "90"

    proc = subprocess.Popen(
        [sys.executable, str(HERE / "mcp_stdio_server.py")],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, env=env, text=True, bufsize=1,
    )

    def rpc(obj: dict) -> dict:
        proc.stdin.write(json.dumps(obj) + "\n")
        proc.stdin.flush()
        return json.loads(proc.stdout.readline())

    print("── initialize ──")
    print(json.dumps(rpc({"jsonrpc": "2.0", "id": 1, "method": "initialize",
                          "params": {"protocolVersion": "2025-06-18",
                                     "clientInfo": {"name": "test-client", "version": "0"}}}),
                     indent=2, ensure_ascii=False))

    print("\n── tools/list ──")
    tools = rpc({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})["result"]["tools"]
    for t in tools:
        print(f"   {t['name']:<22} {t['description'][:64]}…")
    print(f"   共 {len(tools)} 个工具;schema 字段: {sorted(tools[0]['inputSchema'].keys())}")

    print("\n── tools/call: load_skill(目录清单) ──")
    r = rpc({"jsonrpc": "2.0", "id": 3, "method": "tools/call",
             "params": {"name": "load_skill", "arguments": {"name": "video-notes"}}})
    print(r["result"]["content"][0]["text"])

    print("\n── tools/call: load_skill(file) ──")
    r = rpc({"jsonrpc": "2.0", "id": 4, "method": "tools/call",
             "params": {"name": "load_skill",
                        "arguments": {"name": "video-notes", "file": "references/notes.md"}}})
    print(r["result"]["content"][0]["text"].splitlines()[0], "…")

    print("\n── tools/call: run_skill_script ──")
    sample = work / "a.mp4"
    sample.write_bytes(b"\x00" * 2048)
    r = rpc({"jsonrpc": "2.0", "id": 5, "method": "tools/call",
             "params": {"name": "run_skill_script",
                        "arguments": {"skill": "video-notes", "script": "scripts/frame_plan.py",
                                      "args": [str(sample), "3"], "timeoutMs": 5000}}})
    structured = r["result"]["structuredContent"]
    print(f"   exitCode={structured['exitCode']} timedOut={structured['timedOut']} "
          f"interpreter={structured['interpreter']}")
    print(f"   content[0].type = {r['result']['content'][0]['type']}")

    print("\n── tools/call: 平台桩工具 ──")
    for tool, a in [("list_templates", {}),
                    ("web_search", {"query": "测试", "max_results": 3}),
                    ("image_generate", {"prompt": "a cat", "size": "1024x1024"})]:
        r = rpc({"jsonrpc": "2.0", "id": 6, "method": "tools/call",
                 "params": {"name": tool, "arguments": a}})
        text = r["result"]["content"][0]["text"]
        print(f"   {tool:<16} isError={r['result'].get('isError', False)}  {text[:70]}")

    print("\n── 错误路径 ──")
    r = rpc({"jsonrpc": "2.0", "id": 7, "method": "tools/call",
             "params": {"name": "no_such_tool", "arguments": {}}})
    print("   unknown tool ->", r["error"])
    r = rpc({"jsonrpc": "2.0", "id": 8, "method": "resources/list"})
    print("   unknown method ->", r["error"])
    r = rpc({"jsonrpc": "2.0", "id": 9, "method": "tools/call",
             "params": {"name": "save_document",
                        "arguments": {"title": "t", "content": "c", "asset_type": "bad"}}})
    print("   save_document(坏 asset_type) ->", r["error"]["message"])

    proc.stdin.close()
    proc.terminate()
    print(f"\n会话结束,工作目录 {work}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
