# 潮汐 — 一部用代码手绘的动画短片

**《潮汐 (Natural)》**(IN-K / 安苏羽 / 傅梦彤,93 BPM,4/4)的动画短片:
165 秒、9 个镜头、24 fps,全部由代码逐帧绘制 —— 平涂水粉块面 + 细笔水墨线条 + 纸纹,
按歌曲的小节网格编排。没有生成模型、没有剪辑软件、没有素材库:
`p5.js` + `p5.brush` 把每一帧写成时间的纯函数,无头 Chromium 渲染,ffmpeg 编码。

```
projects/chaoxi-tide/     ← 影片本体(分镜、镜头代码、素材、工具、成片)
.claude/skills/painted-animation/   ← 所用的 skill(上游 MIT,见其 LICENSE)
```

- 分镜与每镜的"读点":[`projects/chaoxi-tide/STORYBOARD.md`](projects/chaoxi-tide/STORYBOARD.md)
- 项目说明 / 复现步骤 / 版权说明:[`projects/chaoxi-tide/README.md`](projects/chaoxi-tide/README.md)
- 成片:**`projects/chaoxi-tide/out/video.mp4`**(45.9 MB,已随仓库提交;
  本沙箱访问不到 `uploads.github.com`,所以无法作为 Release 附件上传,直接入库)

**Skill 来源**:`painted-animation` by **tuzhechen2005**(仓库 `tuzhechen2005/opus-video-skills`,
技能目录 `skills/painted-animation/`),引擎来自 **John Heibel** 的
[ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)(MIT)。
技能提供方法、引擎与"渲染-看-改"的循环;故事、美术语言与九个镜头属于本项目。

**歌词版权**归原作者(词 安苏羽 · 舒心,曲 IN-K);本仓库不分发歌曲录音,
成片为无声影像 —— 把自己的一份音频放进 `assets/song.mp3` 再
`node render.mjs --encode --audio=assets/song.mp3` 即可合成。
