# Rendering this film on a machine with no GPU

This box has 2 vCPUs, 3 GB RAM and no GPU, so Chromium renders the film on
**SwiftShader** (software WebGL). A full-length film is still affordable, but only after
two findings — both are in `src/core.js`, and both are worth knowing before writing scenes.

Everything below is measured, not guessed: `tools/bench.cjs` runs one page and times the
real pipeline (`redraw → composite → readback → encode`) per element type.

## 1. The 3-second readback (fixed in `core.js`)

`canvas.toDataURL()` cost **0.8–3 s per frame**, which alone would have made a 3965-frame
film impossible. It is not the PNG/JPEG encode (a 1×1 `getImageData` before the encode
takes the *encode* from 3.1 s to 14 ms) and it is not the canvas size — it is the
**compositor's frame**. Any readback forces SwiftShader to execute every queued WebGL
command, so the cost is the frame's content, and `toBlob()` pays it either way.

What that means in practice:

- The number that matters is **how many brush dabs the frame stamps**, not how many pixels
  it has. Halving the resolution did not halve the frame (1080p 51 s → 540p 24 s at the
  time), because the dabs dominate.
- Measure with the real pipeline. Timing `redraw()` alone says 17 ms and is meaningless.

## 2. What each element costs (960×540, ms/frame)

| frame contains | cost | per element |
|---|---|---|
| paper + grain + composite + readback | **594 ms** (the floor) | — |
| + 8 flat `wash` shapes | 599 ms | **+0.6 ms** |
| + 16 thin `inkLine`s (sw ≈ 1) | 871 ms | **+17 ms** |
| + 5 × `glow()` | 792 ms | +40 ms |
| + 2 watercolour `fill` shapes | 6949 ms | **+3.2 s** |
| + 1 stock `clawd()` | 9494 ms | **+8.9 s** |
| + 4 strokes at sw = 25 | 3133 ms | +630 ms |
| + 4 strokes at sw = 60 | 12883 ms | +3.1 s |

Cost follows **path length ÷ brush spacing** (how many dabs a stroke stamps), which is why
weight matters so much: `weight 60` covers ~5× the area of `weight 12` for ~5× the cost.

So the whole film is built the other way round:

- **Backgrounds are flat `wash` shapes** — sky/sea/sand bands, shafts, foam, pools. A
  "gradient" is 3–5 stacked bands with a pale veil laid across the seams (the veils also
  hide the band edges, which is why they are there at all).
- **Linework is thin and few.** `ink` / `inkfine` for the horizon, wave lines, footprints,
  hair, the drawn figures in shot 7. Never a fat brush.
- **No watercolour `fill`** anywhere in the film (that one call is 2000 washes).
- **The character is painted by hand** (`girl()` in `_lib.js`) rather than with the kit's
  `clawd()`: eight flat shapes plus a dozen thin strokes, ~0.2 s instead of 8.9 s.
- `glow()` is used sparingly — the sun, the moon, the lamp, the shell.

## 3. Two engine gotchas worth writing down

- **`brush.add()` with a new brush name does not resolve in the bundled p5.brush build**
  (`Cannot read properties of undefined (reading 'type')` inside p5.brush when the stroke is
  drawn). Only the built-ins draw: `ink`, `inkfine`, `dry`, `2B`, `HB`, `charcoal`,
  `marker`, `pen`, `cpencil`, `rotring`, `spray`. This is why the film uses flat washes for
  broad areas instead of a fat custom brush — which turned out to be much cheaper anyway.
- **Scene files must not call p5 globals at load time.** `brush.add(...)`/`brush.set(...)`
  outside a shot function runs before p5's setup and leaves the stroke state broken for
  every frame after it.

## 4. Rendering the film here

```bash
export CHROME_PATH=/home/user/.toolchain/chrome-root/chrome      # Chromium 153 (see below)
export LD_LIBRARY_PATH=/home/user/.toolchain/al2023/lib          # NSS libs for it
export PATH=/home/user/.toolchain/bin:$PATH                      # static ffmpeg 7

node render.mjs --sheet=0,20,40,60 --soft-gl --out=out/check/a.jpg   # look at it
node render.mjs --frames --workers=2 --soft-gl                       # ~1.6 s/frame here
node render.mjs --encode --out=out/video.mp4                         # ffmpeg → MP4
```

`--soft-gl` selects `--use-angle=swiftshader --enable-unsafe-swiftshader`. Two workers is
what 2 vCPUs and 3 GB support; the frame writer is resumable, so a stopped run continues.

`render.mjs` needed one change to work at all here: `openPage()` used Puppeteer's
`networkidle0` (30 s default) and the first page load takes ~45 s under SwiftShader, so it
now waits on `domcontentloaded` plus `window.ready` with a 10-minute budget.

Getting a browser at all on this box: no Chrome/Chromium and no apt network, so Chromium
comes from the `@sparticuz/chromium` npm package (its `al2023.tar.br` also supplies the
`libnss3`/`libnspr4` that the binary needs), and ffmpeg is the static build inside the
`imageio-ffmpeg` wheel. `setup.sh` in this directory records the whole toolchain.
