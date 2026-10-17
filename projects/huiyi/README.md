# 《把回忆拼好给你》— a hand-painted Clawd music video (2:22)

把 **椰子水很甜《把回忆拼好给你(纯享Beat)》**(142.13 s)做成一部 **Clawd** 主角的歌词 MV:
每一帧都由代码逐帧画出来(p5.js + p5.brush,平涂水粉块面 + 细笔水墨线条 + 纸纹),
无头 Chromium 渲染,ffmpeg 编码,卡拉 OK 唱词逐字填充。

| | |
|---|---|
| 歌 | 《把回忆拼好给你》(原唱 王贰浪,改编自 当山みれい《愿い~あの顷のキミへ~》) |
| 伴奏 | 椰子水很甜《把回忆拼好给你(纯享Beat)》(本仓库自带 `assets/song.mp3`) |
| 唱词 | 手写 LRC([assets/song.lrc](assets/song.lrc)),逐字金色填充 |
| 网格 | 95 BPM / 4/4,第一个正拍 0.62 s;**每一句歌词落在小节线上,镜头就在这些点切** |
| 规模 | 28 个镜头 / 8 章,12 fps(手绘「拍二」),1706 帧 |
| 分镜 | [STORYBOARD.md](STORYBOARD.md)(每一镜的「读点」和转场) |

![poster](docs/poster.jpg)

## 复现

```bash
# 依赖:Python 3 + Node;Chrome/ffmpeg 缺什么用仓库根的 start.py 自动补
python3 ../../start.py --project=huiyi            # 全片渲染 + 编码 → out/video.mp4
python3 ../../start.py --project=huiyi --check    # 只体检环境
python3 ../../start.py --project=huiyi --sheet=20.8,30.9,35.5,57   # 先看几帧
```

或者直接用本目录的 render.mjs(需要 `CHROME_PATH` 指向 Chrome/Chromium,`ffmpeg` 在 PATH 上):

```bash
node render.mjs --sheet=41,46,56 --cols=3 --out=out/check/a.jpg      # 缩略图
node render.mjs --strip=28.4:29.4 --out=out/check/throw.jpg          # 一个动作的每一帧
node render.mjs --frames --workers=2 [--soft-gl] [--fps=12]          # 逐帧(可断点续渲)
node render.mjs --encode --out=out/video.mp4 --audio=assets/song.mp3 [--fps=12]   # 编码
```

`--soft-gl` 用于没有 GPU 的机器(SwiftShader 软件渲染);`--fps=12` 是本片的成片帧率
(手绘「拍二」,和 12 fps 的线条 boil 正好一致)。想更顺滑就 `--fps=24`,时间乘二。

## 看片

- 成片:`out/video.mp4`(渲染完成后)
- 拖时间轴调画面:`studio.html`(浏览器直接打开,`?t=52` 跳到 52 秒;`?loop=emotions` 看表情表)

## 这个片子怎么做出来的

1. **先测拍子。** `beat_grid.py` 扫伴奏的 onset 梳子:BPM 95.00(半速 47.5),4/4;
   对着 LRC 一查,每一句都落在小节线上 —— 于是「卡点」就有了一张天然的表:
   **句首 = 切点,动作压正拍**。扔纸鹤(t≈29.03)、烟花(35.73/36.33/36.87/37.17)全在拍子上。
2. **一章一文件。** `src/scenes/_lib.js` 是共享的美术词汇(街角、小屋、纸鹤、纸花、烟花、
   转场),`c1.js`–`c8.js` 每章一个 IIFE,结尾 `shots([...])`;`studio.html` 按顺序挂进去。
3. **先写 STORYBOARD.md,再写代码。** 每一镜列「读点」(观众按顺序要看懂什么),读点决定时长。
4. **渲染-看-改。** 每镜至少一张 contact sheet、每个关键动作一条 strip、每个讲故事的脸一张
   crop,对着 ANIMATION_GUIDE.md 的检查单改。

### 这台机器上的性能

没有 GPU,SwiftShader 软件渲染。几条经验(和 `projects/happy-birthday/tools/README-perf.md`
一致,另加两条):

- `canvas.toBlob()` 前先 `getImageData(0,0,1,1)` 把光栅化提前做完;**2D 画布要
  `getContext('2d', { willReadFrequently: true })`,否则每次 readback 都走慢路径**(浏览器会自己提示)。
- `pixelDensity(.75)`:颜料层的光栅像素少一半,放大到 960×540 后看不出来(纸纹和唱词都是在
  合成器里以全分辨率叠上去的)。本片实测 2.3 s/帧 → 1.0–1.5 s/帧。
- 12 fps 成片把帧数砍半,正好是手绘动画的「拍二」,风格反而更对。

## 版权

歌词与曲:童子-T / Shingo.S / 一只然(改编自《愿い~あの顷のキミへ~》,当山みれい);
伴奏:椰子水很甜《把回忆拼好给你(纯享Beat)》。本项目只做个人学习用途,不主张任何权利;
`assets/song.mp3` 由使用者自己的合法拷贝放入。角色 Clawd 与引擎:
[JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)(MIT);
方法:`painted-animation` skill(上游 MIT,见 `.claude/skills/painted-animation/LICENSE.upstream`)。
故事、分镜、28 个镜头与全部场景代码属于本项目。
