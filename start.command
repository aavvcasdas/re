#!/bin/sh
# 潮汐 / 生日快乐 —— 本地渲染。
# macOS:在 Finder 里右键 → 打开(第一次要这样,之后双击即可)。
# Linux:chmod +x start.command && ./start.command
cd "$(dirname "$0")" || exit 1
exec python3 start.py "$@"
