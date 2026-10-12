#!/usr/bin/env python3
"""示例技能脚本:计算抽帧计划并自证沙箱环境。

用 run_skill_script 调用,不要把源码读进对话。
    args: <video_path> [interval_sec]
"""

import os
import shutil
import sys

PLAN_HEADER = "HH:MM:SS  frame-000000.png"


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: frame_plan.py <video_path> [interval_sec]", file=sys.stderr)
        return 1
    video = sys.argv[1]
    try:
        interval = float(sys.argv[2]) if len(sys.argv) > 2 else 5.0
    except ValueError:
        print("invalid interval", file=sys.stderr)
        return 3
    if interval <= 0:
        print("invalid interval", file=sys.stderr)
        return 3
    if not os.path.isfile(video):
        print(f"video not found: {video}", file=sys.stderr)
        return 2

    size_mb = os.path.getsize(video) / 1024 / 1024
    print(f"video      : {video} ({size_mb:.2f} MB)")
    print(f"interval   : {interval:g}s")
    print(f"output dir : {os.path.splitext(video)[0]}.frames/")
    print(PLAN_HEADER)

    # 沙箱自证:打印实际可见的环境变量键
    visible = sorted(os.environ.keys())
    print(f"visible env: {', '.join(visible)}")

    if shutil.which("ffmpeg") is None:
        print("ffmpeg missing", file=sys.stderr)
        return 4
    print("ffmpeg     : ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
