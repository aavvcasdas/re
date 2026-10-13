# 潮与回声｜中文歌词动画

一支约 **93.6 秒**、16:9 的手绘水彩与墨线风格歌词短片。Clawd 沿着退潮的海岸寻找昔日足迹；倒影、海螺与一抹将散的身影，把记忆和距离串成同一个故事。

**成片预览：** [`preview.mp4`](preview.mp4)（1280×720，24 fps；含原创氛围器乐伴奏，无人声）。

> 没有提供原曲、人声或旋律。本项目的默认音轨是为这支短片单独程序合成的器乐，不是原歌曲的伴奏或还原。

## 本地渲染

需要 Python 3.10 或更新版本。视频编码器由 `imageio-ffmpeg` 提供，无需另装系统 ffmpeg 或 Chrome。

Windows：

```powershell
cd projects/tide-and-echo
py -m pip install -r requirements.txt
py render_tide.py --output tide-and-echo.mp4
```

macOS / Linux：

```bash
cd projects/tide-and-echo
python3 -m pip install -r requirements.txt
python3 render_tide.py --output tide-and-echo.mp4
```

默认成片为 1280×720、24 fps。降低分辨率和帧率可加快测试：

```bash
python3 render_tide.py --width 640 --height 360 --fps 12 --output draft.mp4
```

单独导出一帧检查构图与歌词：

```bash
python3 render_tide.py --width 640 --height 360 --still 36.8 --output still.png
```

运行轻量回归测试：

```bash
python3 -m unittest -v
```

### 音频

默认音轨为原创合成的柔和氛围器乐，**不含人声，也不是原曲旋律**。若你有自己的演唱或伴奏录音，可以替换音轨：

```bash
python3 render_tide.py --audio "my-recording.mp3" --output tide-with-vocals.mp4
```

录音默认延后 1.43 秒（两拍前奏），然后按视频时长补齐或裁切。可用 `--audio-delay 0` 取消延迟，或传入其他秒数微调同步。

可选参数：

```text
--width / --height    输出尺寸；偶数、16:9，宽度至少 320
--fps                 帧率，8–60
--crf                 H.264 质量，15–28，越小画质越高
--silent              不输出音轨
--still SECONDS       只渲染指定时间的一帧
--audio PATH          用个人录音替换生成的氛围器乐
--audio-delay SECONDS 自定义录音延迟，范围 0–12 秒
```

## 视觉设计

- **一处海岸，四种情绪**：暖色暮光迎来汹涌潮汐，接着潜入蓝色海底、退到远山与夜色，最后在尾声里等到微弱晨光。
- **寻找与失去**：Clawd 沿湿沙追逐足迹；旧日倒影逐渐变成无脸的淡影，最后只留下海螺和回声般的水纹。
- **角色表演**：惊讶、奔跑、停步、倾听、伸手与放下的动作，按歌词情绪变化；造型沿用 `painted-animation` 的 Clawd 吉祥物设定。
- **逐字卡拉 OK**：每句中文歌词在手绘纸牌上逐字高亮；空格分隔的末两句按词组推进。
- **纯代码绘制**：画面、角色、海浪、远山、足迹、气泡与字幕都由 Python/Pillow 绘制；每帧由时间确定，可离线重渲染。

歌词以 84 BPM 安排：15 句为一段，完整重复一遍，最后再现末两句。逐句节拍、时间与场景见 [`STORYBOARD.md`](STORYBOARD.md)。渲染器与项目依赖见 [`render_tide.py`](render_tide.py) 和 [`requirements.txt`](requirements.txt)。

中文字形使用只包含本片歌词所需字形的 Ma Shan Zheng 子集字体，原字体由 [Ma Shan Zheng Project Authors](https://github.com/googlefonts/mashanzheng) 提供。字体和 SIL Open Font License 1.1 随项目放在 `assets/`；渲染器也内嵌同一子集作为离线回退，完整许可文本附在 Python 文件中。
