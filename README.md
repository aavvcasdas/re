# 用代码手绘的动画短片

几部完全由代码逐帧绘制的短片:**平涂水粉块面 + 细笔水墨线条 + 纸纹**,按歌曲的小节网格
编排。没有生成模型、没有剪辑软件、没有素材库:`p5.js` + `p5.brush` 把每一帧写成时间的
纯函数,无头 Chromium 渲染,ffmpeg 编码。

| 片 | 歌 | 时长 | 成片(随仓库提交) |
|---|---|---|---|
| **把回忆拼好给你** | 椰子水很甜《把回忆拼好给你(纯享Beat)》,95 BPM,4/4 | 2:22,28 个镜头 | [`projects/huiyi/out/video.mp4`](projects/huiyi/out/video.mp4),38 MB |
| **潮汐** | 《潮汐(Natural)》— 安苏羽 / 傅梦彤,118 BPM,4/4 | 0:32,14 个镜头 | [`projects/chaoxi-tide/out/video.mp4`](projects/chaoxi-tide/out/video.mp4),7 MB |
| **潮汐 · 夜蓝** | 同一首歌的完整 56 s 音轨(从 `潮汐.mp4` 抽出),118 BPM | 0:56,20 个镜头 | [`projects/chaoxi-yelan/out/video.mp4`](projects/chaoxi-yelan/out/video.mp4) |

三部片的主角都是 **Clawd** —— 引擎自带角色库里的方盒子(`src/clawd.js`)。前两部带
**卡拉 OK 唱词**(逐字填充,`src/karaoke.js`),切镜与动作全部卡在小节线上;《夜蓝》同一套网格,
但纸换成深蓝夜纸、光全部用 glow 画、每个镜头都有运镜 —— 参照的三个上游项目见
[它的 README](projects/chaoxi-yelan/README.md#潮汐--夜蓝56-秒夜色粉彩歌词-mv)。

节拍不是听出来的:`tools/beat_grid.py` 一次量好 BPM / 相位 / 唱句 / 能量(参照 lemo-opuscar 的
audiomap 做法),输出 `audiomap.json`,场景、卡拉 OK、切点都只读这一张表。

![把回忆拼好给你](projects/huiyi/docs/poster.jpg)
![潮汐](projects/chaoxi-tide/docs/poster.jpg)

## 在自己机器上渲染(`start.py`)

只要 Python 3,别的不需要。缺什么它自己装(Chromium、ffmpeg、npm 依赖 → `.toolchain/`,
已 gitignore):

```bash
python3 start.py                 # 渲染 projects/chaoxi-tide,编码出 out/video.mp4
python3 start.py --list          # 仓库里有哪几部片
python3 start.py --check         # 只检查环境(Node / Chrome / ffmpeg)
python3 start.py --project=chaoxi-tide
python3 start.py --sheet=6.5,20  # 先出缩略图看画风(按秒给时间点)
python3 start.py --range=0:8     # 只渲染一段;可随时 Ctrl-C,重跑接着上次继续
python3 start.py --audio=~/song.mp3
python3 start.py --workers=4     # 并行浏览器数(默认 3)
```

Windows 用 `python start.py …`(或 `py start.py …`),macOS / Linux 用 `python3 start.py …`;

- **Windows**:双击 `start.bat`(没装 Python 它会提示去哪儿装),或 `py start.py`
- **macOS**:双击 `start.command`(第一次在 Finder 里右键 →「打开」),或 `python3 start.py`
- **Linux**:`./start.command`,或 `python3 start.py`

有 GPU 就走 GPU,没有会自动退回软件渲染;这个判断只探测一次并缓存(`.toolchain/render.json`),
不会每次都慢。exe 需要在 Windows 上打包(PyInstaller 不能跨平台交叉编译),所以这里给的是
py —— 任何装了 Python 3 的机器都能直接跑。

## 目录

```
start.py                            本地渲染包(见上)
projects/huiyi/                     《把回忆拼好给你》:28 镜头歌词 MV,卡拉 OK 唱词
projects/chaoxi-tide/               《潮汐(Natural)》:32 秒歌词 MV,14 镜头(日间水粉)
projects/chaoxi-yelan/              《潮汐·夜蓝》:56 秒歌词 MV,20 镜头(夜色粉彩,完整音轨)
tools/beat_grid.py                  节拍量测:一首歌 → audiomap.json(BPM/相位/唱句/能量/爆点)
.claude/skills/painted-animation/   所用的 skill(上游 MIT,见其 LICENSE)
```

- 分镜与每镜的「读点」:[把回忆拼好给你](projects/huiyi/STORYBOARD.md) · [潮汐](projects/chaoxi-tide/STORYBOARD.md) · [夜蓝](projects/chaoxi-yelan/STORYBOARD.md)
- 复现步骤 / 渲染与版权说明:[把回忆拼好给你](projects/huiyi/README.md) · [潮汐](projects/chaoxi-tide/README.md)

**Skill 来源**:`painted-animation` by **tuzhechen2005**(仓库 `tuzhechen2005/opus-video-skills`,
技能目录 `skills/painted-animation/`),引擎来自 **John Heibel** 的
[ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)(MIT)。
技能提供方法、引擎与「渲染-看-改」的循环;故事、美术语言与十五个镜头属于本项目。

**版权**:歌词归原作者(潮汐:词 安苏羽 · 舒心,曲 IN-K);本仓库不分发任何歌曲录音,两部
成片都是无声影像 —— 把自己的一份音频放进来,`--audio=` 即可合成。
