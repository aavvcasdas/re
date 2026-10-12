# 抽帧约定(供 SKILL.md 正文按需引用)

## 输入

- `video_path`:本地视频绝对路径(必填)
- `interval_sec`:抽帧间隔秒数,默认 5(必填可不填)

## 输出

- 时间戳清单:`HH:MM:SS  frame-000123.png`
- 输出目录:与视频同级的 `<视频名>.frames/`

## 命名规则

- 帧文件名固定 `frame-%06d.png`,从 `000001` 起。
- 时间戳取该帧的展示时间,四舍五入到整秒。

## 失败情形

| 情形 | 表现 |
| --- | --- |
| 视频不存在 | 退出码 2,stderr 输出 `video not found` |
| 间隔非法(≤0) | 退出码 3,stderr 输出 `invalid interval` |
| 缺少 ffmpeg | 退出码 4,stderr 输出 `ffmpeg missing`(计划仍会打印) |

> 本文件是"正文点到的说明":`load_skill` 只在被点名时才读取它,避免一次性灌满上下文。
