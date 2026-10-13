# `painted-animation` 用法阅读与本项目取舍

本仓库已安装完整上游合集：[`skills/painted-animation/`](../../skills/painted-animation/)；同时将同一技能副本放在 [`../../.claude/skills/painted-animation/`](../../.claude/skills/painted-animation/) 供仓库级 Claude Code 使用。上游快照来自 `tuzhechen2005/opus-video-skills`，Git commit `59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1`。

## 阅读的上游资料

- `skills/painted-animation/SKILL.md`：端到端制作流程、歌曲项目规范、逐镜头检查与引擎注意事项。
- `skills/painted-animation/README.md` 和 `README.zh-CN.md`：技能定位、安装和“小镇姑娘”示例。
- `skills/painted-animation/references/music-video.md`：节拍网格、LRC、歌词时长、章节分配和长片渲染。
- `skills/painted-animation/template/ANIMATION_GUIDE.md`：完整动画原则、Clawd 造型/表情、绘画 API、转场与检查清单。
- `template/src/core.js`、`clawd.js`、`timeline.js`、`karaoke.js`、`render.mjs` 和 `examples/xiaozhen/`：核对实现接口与完整歌词 MV 示例；角色参考图见 `template/docs/emotions.jpg`、`views.jpg`。

## 上游工作方式摘要

1. **先分镜再写代码**：定一个连续世界、统一调色板、主角情绪线、视觉母题；每个镜头列出观众要依次读懂的内容（reads），据此决定镜头时长。
2. **音乐先对时**：有真实歌曲时，先用音频与 LRC 测 BPM/相位，歌词时间换算到裁剪后片段；每句对应具体镜头，必要时让视觉动作跨句延续。
3. **逐帧纯函数**：同一个时间点应总能得到同一画面，不能依赖帧顺序、累计物理状态或无种子的随机数；用固定种子隔离线条的手绘“沸动”。
4. **手绘 2D**：上游引擎用 p5.js + p5.brush 的 `paint()` / `inkLine()`，避免普通几何 UI、3D 投影、纯黑/纯白和不必要文字；角色用稳定模型与表演变化，而非每镜头换造型。
5. **动作要有因果**：预备、快速动作、停顿、反应、跟随动作分开安排；镜头间有符合故事的转场；结尾与开头形成视觉押韵。
6. **必须渲染后检查**：上游提供 `--sheet`（关键帧）、`--strip`（动作区间）、`--crop`（表情/接触细节），检查可读性、脚脚接地、手持道具接触、动作连续、镜头接缝和文字/颜色问题后再编码。
7. **引擎工具链**：官方模板通常需要 Node.js、Google Chrome、ffmpeg；`new_project.sh` 会复制模板、卸载 demo、安装 npm 依赖并检查工具链；短片可 `node render.mjs --clip`，长片用 `--frames` 后 `--encode`。

## 本片如何套用

- 故事板在 [`STORYBOARD.md`](STORYBOARD.md)：单一工作室、淡紫到蜜金的色彩弧、贯穿的五角星、Clawd 的情绪变化；每句 3 秒并列明逐句读点。
- `render_birthday.py` 用绝对时间计算每一帧，使用固定时间桶种子让线稿按 12 fps 轻微变化；画面保持平面 2D，利用不规则水彩块、软边洗色、干笔/墨线、纸张颗粒和圆形/笔刷转场。
- 歌词属于歌词视频允许的字幕例外：英文逐词、中文逐字高亮。烛光、星形、礼物、灯笼等视觉元素承担叙事，不另加对白或说明文字。
- 渲染后用关键时间静帧检查英语句、中文句、星火、开头/结尾圆形转场；最终再完整编码，并检查视频帧数、时长、分辨率、字幕字符和音频。

## 为什么 Python 实现不是上游 p5.brush 引擎

用户明确希望拿到一个可在本地运行的 `.py`（无需安装 Node/Chrome/系统 ffmpeg）。因此成片脚本使用 Pillow 绘制程序化水彩与墨线，并由 `imageio-ffmpeg` 的随包编码器生成 MP4。它采用上游分镜和动画原则，但**并非 p5.brush 的逐像素复刻，也不调用上游 `render.mjs`**；原始 p5.js / p5.brush 模板已完整保留，适合想继续用官方工具链深化修改的人。

默认音轨是合成乐器演奏的生日旋律，不包含真人/合成演唱。输入自己的录音可用 `--audio` 替换；当前歌词网格假设每句约 3 秒。
