# Claude Code 生日歌词动画

一支约 26 秒、16:9 的手绘水彩/墨线风格生日歌词短片。主角是按 `painted-animation` 角色设定绘制的 Claude Code 吉祥物 **Clawd**：陶土橙色方块身体、两只竖眼、短手脚。画面、角色、蛋糕、礼物、灯笼、纸屑和歌词进度条全部由代码生成，不依赖外部图片素材。

**成片预览：** [`preview.mp4`](preview.mp4)（1280×720，24 fps；内置合成乐器伴奏，无人声）。

## 本地渲染

需要 Python 3.10 或更新版本。无需单独安装 Chrome 或系统 ffmpeg；视频编码器由 `imageio-ffmpeg` 提供。

Windows：

```powershell
cd projects/claude-birthday
py -m pip install -r requirements.txt
py render_birthday.py --output birthday.mp4
```

macOS / Linux：

```bash
cd projects/claude-birthday
python3 -m pip install -r requirements.txt
python3 render_birthday.py --output birthday.mp4
```

默认输出 1280×720、24 fps、约 26 秒的 `birthday.mp4`。快速试渲染：

```bash
py render_birthday.py --width 640 --height 360 --fps 12 --output preview.mp4
```

导出单帧检查构图：

```bash
py render_birthday.py --width 640 --height 360 --still 14.0 --output frame.png
```

### 音频

默认音轨是程序合成的轻柔生日旋律伴奏，**不含人声**。如果你有自己的演唱/伴奏录音，可替换音轨：

```bash
py render_birthday.py --audio "my-birthday-recording.mp3" --output birthday-with-vocals.mp4
```

输入录音默认延后 0.65 秒，让第一句对齐到歌词起点；若录音已经含有相同前奏，可用 `--audio-delay 0`。歌词按每句约 3 秒安排；若你的录音速度不同，需要在 `render_birthday.py` 中调整 `PHRASE`、`EN_ONSETS` / `ZH_ONSETS` 和 `MELODY`。

其他选项：

```text
--width / --height    输出分辨率（偶数、16:9）
--fps                 帧率，8–60
--crf                 H.264 质量，15–28，越小质量越高
--silent              不输出音轨
--still SECONDS       只渲染指定时间的一帧
```

## 这支短片的设计

- **一个连续世界**：月色下的纸艺工作室，背景从淡紫逐步转为蜂蜜金；圆窗、生日蛋糕和星形烛光贯穿全片。
- **Clawd 的情绪线**：发现蛋糕 → 点亮蜡烛 → 收到礼物、害羞戴上派对帽 → 吹熄蜡烛 → 在中文段落里挥手、起舞 → 回到安静的暖光收尾。
- **歌词同步**：英文逐词高亮，中文逐字高亮；只在歌词出现时显示字幕。
- **动画方式**：每帧由时间直接计算，线条以 12 fps 轻微“沸动”，动作包含预备、弹性回落和停顿。开头用圆形显影，英文转中文处用笔刷擦拭，结尾以圆形收拢呼应开场。

分镜与逐句读点见 [`STORYBOARD.md`](STORYBOARD.md)，对 `painted-animation` 的阅读和实现取舍见 [`PAINTED_ANIMATION_REVIEW.md`](PAINTED_ANIMATION_REVIEW.md)。

## 和上游 painted-animation 的关系

上游技能及完整 p5.js / p5.brush 模板保存在仓库的 [`skills/painted-animation/`](../../skills/painted-animation/)，并已复制到 [`../../.claude/skills/painted-animation/`](../../.claude/skills/painted-animation/) 作为本仓库内的 Claude Code 技能。本交付的 `render_birthday.py` 是为“下载一个 Python 脚本即可本地渲染”的需求制作的独立 Pillow 实现；它遵循上游的分镜、时间纯函数、2D 手绘、节奏、转场与逐帧检查方法，但**不是**对 p5.brush 引擎的封装，也不需要 Node/Chrome。官方引擎的完整用法和代码仍在上游目录中。

中文字形使用只包含本歌词所需汉字的 Ma Shan Zheng 子集字体；字体遵循 SIL Open Font License，许可证随文件附在 `assets/`。
