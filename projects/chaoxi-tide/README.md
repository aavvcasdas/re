# 《潮汐·留灯》— 56 秒剪纸盐版歌词 MV

以新上传的 [`潮汐.mp4`](../../潮汐.mp4) 为音乐与节奏参考，抽取内嵌 AAC 音轨转成 MP3，再用本仓库的 p5.js + p5.brush 渲染器重做一支原创 2D 歌词 MV。画面改为**盐蚀版画 × 折纸潮汐图**：梨形潮种与折纸海燕穿过潮线、浅滩和盐珊瑚；不复用参考片的球形小世界、方盒角色、具体镜头或黑底字幕牌。

| | |
|---|---|
| 时长 | 55.983 秒（源视频 56 秒） |
| 声音 | `assets/song.mp3`：从 MP4 的 HE-AACv2 音轨抽取并转码为 MP3；根目录另存 `潮汐_提取.mp3` |
| 节拍 | 约 70.3 BPM，0.8535 秒 / 拍；首个强拍 0.430 秒 |
| 唱词 | 13 条，按从视频读取的唱词与节拍点写入 [`assets/song.lrc`](assets/song.lrc) |
| 画面 | 14 镜；12 fps（手绘 on twos）；双色套印、偏移描边、等高线、纸纹 |
| 分镜 | [`STORYBOARD.md`](STORYBOARD.md)；参考拆解见 [`REFERENCE_ANALYSIS.md`](REFERENCE_ANALYSIS.md) |
| 成片 | [`out/video.mp4`](out/video.mp4)（随仓库提交，56 秒 / 14 镜 / 12 fps） |

![《潮汐·留灯》海报](docs/poster.jpg)

[查看 14 镜 contact sheet](docs/shot-sheet.jpg) · [参考视频拆解](REFERENCE_ANALYSIS.md) · [完整读点 / 分镜](STORYBOARD.md)

## 重渲染

环境需要 Node.js、Chrome / Chromium 与 ffmpeg。依赖装好后：

```bash
npm install
node render.mjs --sheet=2.5,6.4,10.0,14.4,18.5,22.4 --cols=3 --w=480 --soft-gl --fps=12 --out=out/check/keyframes.jpg
node render.mjs --frames --workers=2 --soft-gl --fps=12
node render.mjs --encode --out=out/video.mp4 --audio=assets/song.mp3 --fps=12
```

`--frames` 可续渲；若修改场景代码，先清理 `out/frames/` 再重渲，避免旧帧混入。也可直接运行 `node render.mjs --clip --fps=12 --out=out/video.mp4`，它会从 `src/config.js` 读取默认音轨。

## 参考项目如何用在这支片里

- [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)：保持逐帧纯函数、动作有预备和回弹、逐镜做接触表检查。
- [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar)：先定美术媒介、情绪弧线、镜头节奏与每镜读点，再进入绘制。
- [ReelMimic](https://github.com/edenfunf/reelmimic)：先拆时长、构图、调色和字幕，再只借鉴剪辑方法，不搬用参考片资产。

完整参考拆解、选择性保留与主动避开的视觉元素写在 [`REFERENCE_ANALYSIS.md`](REFERENCE_ANALYSIS.md)。歌词与音乐来自用户上传素材；相关使用权仍归原权利人。
