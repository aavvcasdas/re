# 《潮汐 · 夜蓝》— 56 秒夜色粉彩歌词 MV

用 **ClaudeAnimationBase 同一条渲染管线**(p5.js + p5.brush,逐帧纯函数,无头 Chromium + ffmpeg),
把 `潮汐.mp4` 里抽出的**完整 56 s 音轨**(`assets/song.mp3`)做成一部 **Clawd** 主角的歌词 MV:
11 行唱词逐字填充(卡拉 OK),20 个镜头全部切在拍子上。

和 sister project [`projects/chaoxi-tide`](../chaoxi-tide)(同一首歌的 31.8 s 剪辑版、日间水粉画风)
相比,这一部是**参照三个上游项目重做的一版**:

| 参照 | 学来的东西 | 落在这里的哪 |
|---|---|---|
| [JohnHeibel/ClaudeAnimationBase](https://github.com/ClaudeAnimationBase) | 引擎本体:逐帧纯函数、boil 种子、`paint()` 包装、模型表循环 | `src/core.js` / `src/clawd.js`(引擎层只加了一件事:**夜纸模式**,见下) |
| [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 「时间轴是唯一事实源;一次量好,处处复用」的 audiomap 做法 | `tools/beat_grid.py` → `audiomap.json`:BPM/相位/唱句/能量/爆点候选一张表,场景、卡拉OK、切点都只读它 |
| [edenfunf/reelmimic](https://github.com/edenfunf/reelmimic) | 渲染器的工程化:帧缓存(按镜头文件哈希)、渲染槽位、tv-range 编码、断点续渲;以及「逐镜渲染-看-改」的循环 | `render.mjs`(从 reelmimic 的 crayon-storybook 模板移植,并加了 `.toolchain/chrome` 离线 Chromium 探测);开发过程就是逐镜 sheet → 改 → 再 sheet |

| | |
|---|---|
| 歌 | 《潮汐(Natural)》— 安苏羽 / 傅梦彤,词 安苏羽 / 舒心 |
| 音频 | `潮汐.mp4` → `ffmpeg -vn -c:a libmp3lame -b:a 192k` → `assets/song.mp3`(55.99 s,原样进成片) |
| 唱词 | 用户确认的 11 行(0–31.8 s;31.8 s 后无词,纯画面终章) |
| 网格 | **118 BPM / 4/4,第一正拍 0.456 s**(13 个唱句起点校准,残差 ±5 ms;两处半拍) |
| 规模 | 20 镜 / 5 章,12 fps(手绘「拍二」),672 帧,56.0 s |
| 分镜 | [STORYBOARD.md](STORYBOARD.md) |

## 画风:夜色粉彩

上一部是「白天画在米色水彩纸上的 Clawd」;这一部整个翻到**深夜**:

- **深蓝纸**:`config.js` 里 `night: true`,`core.js` 换一套纸纹(蓝灰纤维 + 月端微光)、
  颗粒用 **screen** 叠(亮处的粉笔齿感),暗角用冷黑 —— 日间项目不受影响(全部按 `NIGHT` 分支)。
- **光是画出来的**:发光的东西(月、灯、水母、浮游生物、眼睛)一律走 `glow()`(加法混合),
  不用颜料 —— p5.brush 是颜料混合,黄叠蓝会变绿,画不出光。
- **浅色粉笔线**替代墨线;角色描边减淡(`swMul .8`),不然深底会「吃掉」轮廓。
- 记号从「纸」换成「**灯**」:回忆里的人变成发光的纸灯,「你」是一团光做的人形(带一对发光的眼)。
- 转场不用毛笔横扫(那是上一部的语言),改用 **tideWipe**(一道浪扫过全屏)/ **moonIris**(月牙吞画面)。
- **每个镜头都有运镜**(推/拉/摇/移/手持抖),没有死镜 —— 这是参照 reelmimic 的 motion-doctrine。

## 复现

```bash
# 1) 量节拍(一次性;产出 audiomap.json,场景和卡拉OK都只读它)
python3 -m pip install librosa numpy soundfile
python3 ../../tools/beat_grid.py assets/song.mp3 \
        --anchors 0.04,1.98,4.02,6.05,8.08,10.12,12.15,14.69,16.73,19.02,22.83,24.86,26.64 \
        --bpm-min 100 --bpm-max 140 -o audiomap.json --print

# 2) 依赖(或直接用仓库根的 start.py,它会自己装)
npm install

# 3) 先看几张,再渲染
node render.mjs --sheet=1,9,17,30,49 --cols=5 --w=380 --soft-gl --out=out/check/a.jpg
node render.mjs --frames --fps=12 --workers=4 --soft-gl      # 672 帧,断点续渲,改镜头只重渲那一镜
node render.mjs --encode --fps=12 --out=out/video.mp4        # 编码(音频自动从 PROJECT.audio 读)
```

`--soft-gl` 只在没有 GPU 的机器上需要。改了某个 `src/scenes/cN.js` 再跑 `--frames`,
**只有那个镜头的帧会重画**(帧键 = 共享文件哈希 + 该镜头文件哈希,manifest 在 `out/frames/manifest.json`);
想全部重画加 `--no-cache` 或删掉 `out/frames/`。

## 卡点与唱词

- 节拍是量出来的:`tools/beat_grid.py` comb + 锚点校准(13 个唱句起点),`audiomap.json` 里
  每一拍的时刻、每个唱段的起止、半拍标记、能量曲线和爆点候选都在;镜头切点 = 唱句起点所在拍。
- 唱词逐字填充按每个子句的实际起唱推进(`src/karaoke.js` 的 `LY` 表是真相来源);
  这一部没有墨色牌子 —— 字直接落在夜上,底下是一道随唱词生长的**月光线**,线头挂一弯小月牙当游标。
- 31.8 s 之后这条音频还有 24 s 唱段,但没拿到那一段的词,所以终章(15–20 镜)是纯画面。

## 已知取舍

- `PROJECT.flat` 仍是开的(软件 GL 渲染预算):`core.js` 把水彩 fill 折叠进 wash。夜纸模式下
  这反而更对味 —— 夜色本来就该是「大块平涂 + 局部光」,不是满纸水渍。
- 水下戏的色板压到 4 层椭圆带,没画焦散细节:12 fps + 平涂语言下,多画只会糊。
- 第 14 镜的潮墙和第 18 镜的巨涌都是「椭圆带」叠出来的:大多边形路径在 p5.brush 里偶尔整块消失
  (见 c4.js 里 S14 的注释),带子永远可靠。
