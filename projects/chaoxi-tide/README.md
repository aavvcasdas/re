# 《潮汐(Natural)》— 32 秒手绘 Clawd 歌词 MV

用 **椰子水很甜同款管线**(p5.js + p5.brush 平涂水粉 + 水墨线 + 纸纹,无头 Chromium 逐帧渲染)
把上传的 `潮汐.MP3`(31.84 s,**原样使用不改**)做成一部 **Clawd** 主角的歌词 MV:
11 行唱词逐字金色填充(卡拉 OK),14 个镜头全部切在拍子上。

| | |
|---|---|
| 歌 | 《潮汐(Natural)》— 安苏羽 / 傅梦彤,词 安苏羽 / 舒心 |
| 音频 | 上传的 `潮汐.MP3`,byte-for-byte 作为 `assets/song.mp3` 打进成片 |
| 唱词 | 用户给的 11 行(内部 13 个唱段时间,见 [assets/song.lrc](assets/song.lrc)) |
| 网格 | **118 BPM / 4/4,第一正拍 0.456 s**(底鼓 comb + 唱句拟合);唱句全落拍上,**切点=拍点** |
| 规模 | 14 镜 / 4 章,12 fps(手绘「拍二」),382 帧,31.8 s |
| 分镜 | [STORYBOARD.md](STORYBOARD.md) |

![poster](docs/poster.jpg)

## 复现

```bash
source /tmp/env.sh   # 或自行准备 Chrome + ffmpeg(CHROME_PATH 指向 Chrome)
npm install
node render.mjs --sheet=5,13,20,27 --cols=4 --soft-gl --out=out/check/a.jpg   # 先看几帧
node render.mjs --frames --workers=2 --soft-gl --fps=12                       # 逐帧(~6 min,可续渲)
node render.mjs --encode --out=out/video.mp4 --audio=assets/song.mp3 --fps=12 # 编码
```

注意:render.mjs 的 `--frames` 是**断点续渲**的(已有帧直接跳过)——改了场景代码要重渲,
先删 `out/frames/` 再跑。

## 卡点与唱词

- 节拍是量出来的:底鼓包络 comb → 118 BPM、相位 0.456;13 个唱句起点与拍网格吻合在 ±0.1 s 内
  (其中两句在半拍上)。所有镜头切点 = 唱句起点所在拍。
- 唱词显示按用户给的 11 行排版;「蓝色的海底 远山的风景」这类两口气的行,金色填充按两个子句
  各自的起唱时间推进;上一句 hold 时缩小抬升,像 KTV 双行。
- 时间轴里 `src/karaoke.js` 的 `LY` 表就是逐字填充的真相来源;`assets/song.lrc` 留档同一批时间。
