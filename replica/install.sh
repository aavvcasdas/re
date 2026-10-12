#!/usr/bin/env bash
# 把技能栈"安装"到本机(不碰系统目录,全部落在 PREFIX 下,可整体删除)
#
#   ./replica/install.sh [PREFIX]        # 默认 ~/vcdmind-replica
#
# 做三件事:
#   1) 落盘运行时(MCP stdio 服务器 + 技能运行时 + 打包校验器)
#   2) 走一遍真实打包流水线安装示例技能到 skill-library/
#   3) 生成启动器与 MCP 注册配置片段
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PREFIX="${1:-$HOME/vcdmind-replica}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> 安装到 $PREFIX"
mkdir -p "$PREFIX/bin" "$PREFIX/lib" "$PREFIX/share" "$PREFIX/skill-library"

# 1) 运行时
cp "$HERE/skill_runtime.py" "$HERE/skillpack.py" "$HERE/mcp_stdio_server.py" "$PREFIX/lib/"
echo "    运行时: $(cd "$PREFIX/lib" && ls | tr '\n' ' ')"

# 2) 真实流水线:打包 -> 校验 -> 安装示例技能
python3 "$HERE/skillpack.py" pack "$HERE/skills/video-notes" "$TMP/video-notes.zip" > "$TMP/pack.json"
SHA="$(python3 -c "import json;print(json.load(open('$TMP/pack.json'))['sha256'])")"
echo "==> 技能包 sha256=$SHA"
python3 "$HERE/skillpack.py" verify "$TMP/video-notes.zip" --sha256 "$SHA" | sed 's/^/    /'
PREFIX="$PREFIX" TMP="$TMP" SHA="$SHA" python3 - <<'PY'
import os, pathlib, sys
prefix = os.environ["PREFIX"]
sys.path.insert(0, os.path.join(prefix, "lib"))
from skillpack import install
data = open(os.path.join(os.environ["TMP"], "video-notes.zip"), "rb").read()
r = install(data, pathlib.Path(prefix) / "skill-library", os.environ["SHA"])
print("    安装:", r["installed"], r.get("skill"))
PY

# 3) 启动器 + 注册片段
cat > "$PREFIX/bin/vcdmind-skills" <<EOF
#!/usr/bin/env bash
# 技能栈 MCP 服务器(stdio,按行 JSON)
export VCDMIND_SKILL_LIBRARY="\${VCDMIND_SKILL_LIBRARY:-$PREFIX/skill-library}"
exec python3 "$PREFIX/lib/mcp_stdio_server.py" "\$@"
EOF
chmod +x "$PREFIX/bin/vcdmind-skills"

cat > "$PREFIX/share/mcp-registration.md" <<EOF
# 把技能栈注册给你的 Agent(三选一)

## Claude Code
    claude mcp add vcdmind-skills -- $PREFIX/bin/vcdmind-skills

## Codex(~/.codex/config.toml 或等价配置)
    [mcp_servers.vcdmind-skills]
    command = "$PREFIX/bin/vcdmind-skills"

## Cursor / VS Code 风格(mcp.json)
    { "mcpServers": { "vcdmind-skills": { "command": "$PREFIX/bin/vcdmind-skills" } } }

可选环境变量:VCDMIND_API_BASE_URL / VCDMIND_API_TOKEN / VCDMIND_IMAGE_POLL_TIMEOUT
(仅 web_search、image_generate 等平台工具需要;技能工具不需要网络)
EOF

echo "==> 完成"
echo "    技能库   : $PREFIX/skill-library"
echo "    启动器   : $PREFIX/bin/vcdmind-skills"
echo "    注册说明 : $PREFIX/share/mcp-registration.md"
echo -n "    自测     : "
printf '{"jsonrpc":"2.0","id":1,"method":"tools/list"}\n' | "$PREFIX/bin/vcdmind-skills" | head -c 120
echo
