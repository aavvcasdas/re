# 用代码手绘的动画短片

这里的短片由代码逐帧绘制：`p5.js` + `p5.brush` + 纸纹与手绘线条，无生成视频模型、剪辑软件或素材库。镜头时长和动作跟随歌曲节拍；无头 Chromium 渲染、ffmpeg 编码。

| 片 | 音乐 | 时长 / 镜头 | 画面 / 成片 |
|---|---|---|---|
| **把回忆拼好给你** | 椰子水很甜《把回忆拼好给你（纯享Beat）》· 95 BPM | 2:22 · 28 镜 | 水粉水墨 Clawd MV · [`projects/huiyi/out/video.mp4`](projects/huiyi/out/video.mp4) |
| **潮汐·留灯** | 用户新上传的 [`潮汐.mp4`](潮汐.mp4) 内嵌音轨 · 约 70.3 BPM | 0:56 · 14 镜 | 盐版画 / 折纸潮汐图 · [`projects/chaoxi-tide/out/video.mp4`](projects/chaoxi-tide/out/video.mp4) |

《把回忆拼好给你》沿用 Clawd 方盒角色与水粉线稿；《潮汐·留灯》换成原创的梨形潮种、折纸海燕、盐蚀版画和浅色纸条歌词。潮汐音轨已从新 MP4 提取为 [`潮汐_提取.mp3`](潮汐_提取.mp3)，成片使用这份提取音频。

![把回忆拼好给你](projects/huiyi/docs/poster.jpg)
![潮汐·留灯](projects/chaoxi-tide/docs/poster.jpg)

## 在自己机器上渲染（`start.py`）

只要 Python 3；启动器会按需准备 Chromium / ffmpeg，并在项目目录安装 npm 依赖；工具缓存位于 `.toolchain/`（已 gitignore）：

```bash
python3 start.py                 # 渲染默认项目
python3 start.py --list          # 列出项目
python3 start.py --check         # 检查环境
python3 start.py --project=chaoxi-tide --fps=12
python3 start.py --sheet=6.5,20  # 按秒查看缩略图
python3 start.py --range=0:8     # 只渲染一段，可续渲
python3 start.py --audio=~/song.mp3
python3 start.py --workers=4
```

Windows 用 `python start.py …`（或 `py start.py`），macOS / Linux 用 `python3 start.py …`。

- **Windows**：双击 `start.bat` 或运行 `py start.py`
- **macOS**：双击 `start.command`（首次在 Finder 右键 →「打开」）
- **Linux**：`./start.command`

有 GPU 就走 GPU；没有会自动退回软件渲染，并缓存探测结果到 `.toolchain/render.json`。

## 目录

```
start.py                            本地渲染包
projects/huiyi/                     《把回忆拼好给你》：28 镜 Clawd 歌词 MV
projects/chaoxi-tide/               《潮汐·留灯》：56 秒、14 镜原创剪纸盐版 MV
潮汐.mp4                            用户提供的节奏 / 音轨参考
潮汐_提取.mp3                       从潮汐.mp4 转码提取的音轨
.claude/skills/painted-animation/   手绘动画 skill 与引擎模板
```

- 分镜与读点：[把回忆拼好给你](projects/huiyi/STORYBOARD.md) · [潮汐·留灯](projects/chaoxi-tide/STORYBOARD.md)
- 参考视频拆解：[潮汐参考分析](projects/chaoxi-tide/REFERENCE_ANALYSIS.md)
- 重渲染说明：[把回忆拼好给你](projects/huiyi/README.md) · [潮汐·留灯](projects/chaoxi-tide/README.md)

《潮汐·留灯》的制作流程借鉴了 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)、[Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) 和 [ReelMimic](https://github.com/edenfunf/reelmimic)：先拆节奏 / 构图 / 调色与情绪，再写分镜、逐镜渲染检查；只借鉴方法，不复用参考片角色、镜头或素材。底层手绘引擎来自 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)（MIT）；绘制、故事和分镜属于本项目。

**版权说明：**《潮汐》音频和歌词来自用户上传视频；音乐、歌词的相关权利仍归原权利人。请在获得必要授权后传播或公开使用成片。
