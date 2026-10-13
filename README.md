# 用代码手绘的两部动画短片

两部完全由代码逐帧绘制的短片:**平涂水粉块面 + 细笔水墨线条 + 纸纹**,按歌曲的小节网格
编排。没有生成模型、没有剪辑软件、没有素材库:`p5.js` + `p5.brush` 把每一帧写成时间的
纯函数,无头 Chromium 渲染,ffmpeg 编码。

| 片 | 歌 | 时长 | 成片(随仓库提交) |
|---|---|---|---|
| **潮汐** | 《潮汐 (Natural)》— IN-K / 安苏羽 / 傅梦彤,93 BPM,4/4 | 2:45,9 个镜头 | [`projects/chaoxi-tide/out/video.mp4`](projects/chaoxi-tide/out/video.mp4),47 MB |
| **生日快乐** | 《生日快乐》(Happy Birthday) | 0:36,6 个镜头 | [`projects/happy-birthday/out/video.mp4`](projects/happy-birthday/out/video.mp4),17 MB |

两部片的主角都是 **Clawd** —— 引擎自带角色库里的方盒子(`src/clawd.js`,同一套代码画出了
`projects/chaoxi-tide/docs/views.jpg` 与 `projects/chaoxi-tide/docs/emotions.jpg` 那两张模型表)。

![潮汐](projects/chaoxi-tide/docs/poster.jpg)
![生日快乐](projects/happy-birthday/docs/poster.jpg)

## 在自己机器上渲染(`start.py`)

只要 Python 3,别的不需要。缺什么它自己装(Chromium、ffmpeg、npm 依赖 → `.toolchain/`,
已 gitignore):

```bash
python3 start.py                 # 渲染 projects/chaoxi-tide,编码出 out/video.mp4
python3 start.py --list          # 仓库里有哪几部片
python3 start.py --check         # 只检查环境(Node / Chrome / ffmpeg)
python3 start.py --project=happy-birthday
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
projects/chaoxi-tide/               《潮汐》:分镜、九个镜头的代码、素材、成片
projects/happy-birthday/            《生日快乐》:六个镜头的代码、素材、成片
.claude/skills/painted-animation/   所用的 skill(上游 MIT,见其 LICENSE)
```

- 分镜与每镜的「读点」:[潮汐](projects/chaoxi-tide/STORYBOARD.md)
- 复现步骤 / 渲染与版权说明:[潮汐](projects/chaoxi-tide/README.md) · [生日快乐](projects/happy-birthday/README.md)

**Skill 来源**:`painted-animation` by **tuzhechen2005**(仓库 `tuzhechen2005/opus-video-skills`,
技能目录 `skills/painted-animation/`),引擎来自 **John Heibel** 的
[ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)(MIT)。
技能提供方法、引擎与「渲染-看-改」的循环;故事、美术语言与十五个镜头属于本项目。

**版权**:歌词归原作者(潮汐:词 安苏羽 · 舒心,曲 IN-K);本仓库不分发任何歌曲录音,两部
成片都是无声影像 —— 把自己的一份音频放进来,`--audio=` 即可合成。
