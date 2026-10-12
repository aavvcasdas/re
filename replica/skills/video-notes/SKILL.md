---
name: video-notes
description: 从视频里抽帧并生成带时间戳的笔记草稿(示例技能)
enabled: true
official: false
label: 视频笔记
category: creation
scenes: video, notes
---

# 视频笔记技能

把一段视频变成"时间戳 + 画面说明"的笔记草稿,供后续写作/剪辑使用。

## 什么时候用

- 用户给了一个本地视频文件,想快速得到结构化笔记。
- 需要给剪辑稿补时间戳索引。

## 怎么做

1. 读取 [抽帧约定](references/notes.md),确认帧率、文件名与输出目录约定。
2. 用 `run_skill_script` 执行 `scripts/frame_plan.py`,参数为视频路径与抽帧间隔(秒)。
   该脚本只做计划计算与文件检查,**不要**把它的源码读进对话。
3. 把脚本输出的时间戳清单整理成笔记草稿,写回用户的项目目录。

## 边界

- 只处理用户明确指定的本地文件,不访问网络。
- 视频解码交给本机 ffmpeg;若缺失,脚本会返回非零退出码与提示。
