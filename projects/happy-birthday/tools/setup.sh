#!/usr/bin/env bash
# setup.sh — put a browser and ffmpeg on a box that has neither, without root.
#
# This sandbox has no Chrome/Chromium, no ffmpeg, and no package-manager network, so:
#   * Chromium comes from the @sparticuz/chromium npm package. Its `al2023.tar.br`
#     carries the libnss3 / libnspr4 / libexpat the binary links against (Amazon Linux
#     2023 builds), and `swiftshader.tar.br` carries the software GL libraries.
#   * ffmpeg is the static build inside the `imageio-ffmpeg` wheel on PyPI.
# The libraries live in $TOOLCHAIN; render.mjs needs both env vars set (see the bottom).
set -euo pipefail

TOOLCHAIN="${TOOLCHAIN:-$HOME/.toolchain}"
mkdir -p "$TOOLCHAIN/bin"

echo "== ffmpeg (static, from the imageio-ffmpeg wheel on PyPI)"
if [ ! -x "$TOOLCHAIN/bin/ffmpeg" ]; then
  tmp=$(mktemp -d)
  python3 -m pip download --no-deps -q -d "$tmp" imageio-ffmpeg
  python3 -m zipfile -e "$tmp"/imageio_ffmpeg-*.whl "$tmp/x"
  cp "$tmp"/x/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-* "$TOOLCHAIN/bin/ffmpeg"
  chmod +x "$TOOLCHAIN/bin/ffmpeg"
  rm -rf "$tmp"
fi
"$TOOLCHAIN/bin/ffmpeg" -version | head -1

echo "== Chromium (@sparticuz/chromium) + puppeteer-core"
cd "$TOOLCHAIN"
# npm refuses to initialise a package whose name is a dotfile directory (".toolchain"),
# so write the manifest by hand instead of `npm init -y`.
[ -f package.json ] || printf '{\n  "name": "render-toolchain",\n  "version": "1.0.0",\n  "private": true\n}\n' > package.json
npm i --silent @sparticuz/chromium puppeteer-core

# chrome-root must hold the browser AND the software-GL libraries (libvk_swiftshader.so et al),
# so the guard tests for both: a run that only unpacked the browser would render nothing.
if [ ! -x "$TOOLCHAIN/chrome-root/chrome" ] || [ ! -f "$TOOLCHAIN/chrome-root/libvk_swiftshader.so" ]; then
  cat > extract.mjs <<'EOF'
import chromium from '@sparticuz/chromium';
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
const root = new URL('.', import.meta.url).pathname.replace(/\/$/, '');
const bin = `${root}/node_modules/@sparticuz/chromium/bin`;
// the browser binary (lambdafs-style brotli blob → tar → `chrome`)
const p = await chromium.executablePath();
mkdirSync(`${root}/chrome-root`, { recursive: true });
copyFileSync(p, `${root}/chrome-root/chrome`);
// the shared libs it links against (NSS) and the software GL
for (const [name, dir] of [['al2023', 'al2023/lib'], ['swiftshader', 'chrome-root']]) {
  const src = `${bin}/${name}.tar.br`;
  const tar = `/tmp/${name}.tar`;
  writeFileSync(tar, zlib.brotliDecompressSync(readFileSync(src)));
  mkdirSync(`${root}/${dir}`, { recursive: true });
  // al2023 carries an `al2023/lib/...` prefix, the swiftshader tar is flat: strip only the former,
  // or tar silently drops every member of the flat one (that is how this box lost software GL once).
  execFileSync('tar', ['-xf', tar, '-C', `${root}/${dir}`, ...(name === 'al2023' ? ['--strip-components=1'] : [])]);
}
console.log('  chrome:', `${root}/chrome-root/chrome`, (statSync(`${root}/chrome-root/chrome`).size / 1048576).toFixed(0) + ' MB');
EOF
  node extract.mjs
fi
chmod +x "$TOOLCHAIN/chrome-root/chrome"

echo "== check"
LD_LIBRARY_PATH="$TOOLCHAIN/al2023/lib" "$TOOLCHAIN/chrome-root/chrome" --version
LD_LIBRARY_PATH="$TOOLCHAIN/al2023/lib" ldd "$TOOLCHAIN/chrome-root/chrome" 2>/dev/null | grep -c "not found" | sed 's/^/  missing libs: /'
ls "$TOOLCHAIN/chrome-root"/libvk_swiftshader.so >/dev/null && echo "  software GL: ok ($(ls "$TOOLCHAIN"/chrome-root/*.so | wc -l) libs)"

cat <<EOF

ready. For render.mjs:

  export CHROME_PATH=$TOOLCHAIN/chrome-root/chrome
  export LD_LIBRARY_PATH=$TOOLCHAIN/al2023/lib
  export PATH=$TOOLCHAIN/bin:\$PATH          # ffmpeg

EOF
