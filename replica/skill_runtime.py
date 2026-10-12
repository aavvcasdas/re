#!/usr/bin/env python3
"""技能(Skill)运行时的参考实现 —— 复刻 Vcdmind 的 load_skill / run_skill_script 语义。

本文件不是从原二进制"还原出来的源码",而是依据静态证据(字符串、命令签名、
报错文案、最小环境变量集合等)重写的**行为等价实现**,可直接运行、可被测试。

证据来源见 复刻方案.md §4 与 evidence/desktop-skill-strings.txt。

核心不变量(全部来自观察到的原文):
  * 技能库根目录名           : skill-library
  * 必需文件                 : SKILL.md
  * 脚本白名单扩展名         : mjs / cjs / py / sh
  * 来源标记文件             : .vcdmind-origin
  * 索引只给路径,不给正文   : "目录清单(只列路径,文件正文没有读入):"
  * 正文引用需二次读取       : "正文点到的说明,用 load_skill 的 file 再读那一个文件。"
  * 脚本只执行不读源码       : "脚本用 run_skill_script 执行,不要把脚本源码读进对话。"
  * 只能改 markdown          : "只能修改技能里的 markdown 文件。"
  * 目录名必须等于 SKILL.md  : "技能名不一致:目录是 X,说明里写的是 Y。"
  * 读文件限定技能目录内     : "只能读取技能目录内的文件。" / "不是文件:"
  * 脚本沙箱                 : 仅透传 PATH/HOME/TMPDIR/TEMP/TMP/LANG/LC_ALL/USERPROFILE
  * 脚本错误码               : skill_not_found / script_not_allowed / script_failed / interpreter_missing
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

SKILL_LIBRARY_DIRNAME = "skill-library"
SKILL_ENTRY_FILE = "SKILL.md"
ORIGIN_MARKER = ".vcdmind-origin"

ALLOWED_SCRIPT_EXTS = (".mjs", ".cjs", ".py", ".sh")
MARKDOWN_EXTS = (".md", ".markdown")

# 解释器探测表:候选命令按顺序探测(对应 "where" 探测 + python3/python、sh/bash)
INTERPRETERS: dict[str, list[str]] = {
    ".py": ["python3", "python"],
    ".sh": ["sh", "bash"],
    ".mjs": ["node"],
    ".cjs": ["node"],
}

# 观测到的最小环境透传集合
ENV_ALLOWLIST = ("PATH", "HOME", "TMPDIR", "TEMP", "TMP", "LANG", "LC_ALL", "USERPROFILE")

DEFAULT_READ_LIMIT_BYTES = 200_000   # "文件超过 N 字节上限。"
DEFAULT_SCRIPT_TIMEOUT_MS = 120_000


class SkillError(Exception):
    """带错误码的技能异常,对应 product 侧 {code, message} 结构。"""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


# --------------------------------------------------------------------------- #
# 元数据
# --------------------------------------------------------------------------- #

@dataclass
class SkillMeta:
    """对应二进制里的字段组:name description enabled official label category scenes"""

    name: str
    description: str = ""
    enabled: bool = True
    official: bool = False
    label: str = ""
    category: str = ""
    scenes: list[str] = field(default_factory=list)
    path: Path | None = None

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "enabled": self.enabled,
            "official": self.official,
            "label": self.label,
            "category": self.category,
            "scenes": self.scenes,
        }


_FRONTMATTER = re.compile(r"^---\s*\n(.*?)\n---\s*\n?", re.S)


def parse_skill_md(text: str) -> tuple[SkillMeta, str]:
    """解析 SKILL.md:可选 YAML 风格 frontmatter + 正文。返回 (元数据, 正文)。"""
    meta = SkillMeta(name="")
    body = text
    m = _FRONTMATTER.match(text)
    if m:
        body = text[m.end():]
        for line in m.group(1).splitlines():
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            key, _, value = line.partition(":")
            key, value = key.strip(), value.strip().strip("'\"")
            if key == "name":
                meta.name = value
            elif key == "description":
                meta.description = value
            elif key == "enabled":
                meta.enabled = value.lower() not in ("false", "0", "no")
            elif key == "official":
                meta.official = value.lower() in ("true", "1", "yes")
            elif key == "label":
                meta.label = value
            elif key == "category":
                meta.category = value
            elif key == "scenes":
                meta.scenes = [s.strip() for s in re.split(r"[,\[\]\s]+", value) if s.strip()]
    return meta, body


def read_origin(skill_dir: Path) -> str:
    marker = skill_dir / ORIGIN_MARKER
    if marker.is_file():
        return marker.read_text(encoding="utf-8", errors="replace").strip()
    return "local"


def iter_scripts(skill_dir: Path) -> list[Path]:
    return sorted(
        p for p in skill_dir.rglob("*")
        if p.is_file() and p.suffix.lower() in ALLOWED_SCRIPT_EXTS
    )


def _safe_skill_dir(root: Path, name: str) -> Path:
    """技能名 -> 目录,并做目录名/说明名一致性与越界校验。"""
    if not name or "/" in name or "\\" in name or name in (".", "..") or ".." in name:
        raise SkillError("skill_not_found", f"技能名不合法。{name}")
    root = root.resolve()
    skill_dir = (root / name).resolve()
    if root not in skill_dir.parents and skill_dir != root:
        raise SkillError("skill_not_found", "只能读取技能目录内的文件。")
    if not skill_dir.is_dir():
        raise SkillError("skill_not_found", f"技能不存在:{name}")
    entry = skill_dir / SKILL_ENTRY_FILE
    if not entry.is_file():
        raise SkillError("skill_not_found", f"技能不存在:{name}")
    meta, _ = parse_skill_md(entry.read_text(encoding="utf-8", errors="replace"))
    declared = meta.name or skill_dir.name
    if declared and declared != skill_dir.name:
        raise SkillError("skill_not_found", f"技能名不一致:目录是 {skill_dir.name},说明里写的是 {declared}。")
    return skill_dir


# --------------------------------------------------------------------------- #
# assistant_skill_index / assistant_skill_detail
# --------------------------------------------------------------------------- #

def skill_index(root: Path) -> list[dict]:
    """列出技能(只给元数据,不给正文)。对应 assistant_skill_index / market_list。"""
    root = Path(root)
    out: list[dict] = []
    if not root.is_dir():
        return out
    for child in sorted(root.iterdir()):
        if not child.is_dir() or child.name.startswith("."):
            continue
        entry = child / SKILL_ENTRY_FILE
        if not entry.is_file():
            continue
        meta, _ = parse_skill_md(entry.read_text(encoding="utf-8", errors="replace"))
        meta.name = meta.name or child.name
        meta.path = child
        d = meta.to_dict()
        d["origin"] = read_origin(child)
        d["scriptCount"] = len(iter_scripts(child))
        out.append(d)
    return out


def skill_detail(root: Path, name: str) -> dict:
    skill_dir = _safe_skill_dir(Path(root), name)
    meta, body = parse_skill_md((skill_dir / SKILL_ENTRY_FILE).read_text(encoding="utf-8", errors="replace"))
    meta.name = meta.name or skill_dir.name
    d = meta.to_dict()
    d["origin"] = read_origin(skill_dir)
    d["markdownFiles"] = [
        str(p.relative_to(skill_dir)) for p in sorted(skill_dir.rglob("*"))
        if p.is_file() and p.suffix.lower() in MARKDOWN_EXTS
    ]
    d["scripts"] = [str(p.relative_to(skill_dir)) for p in iter_scripts(skill_dir)]
    d["bodyBytes"] = len(body.encode("utf-8"))
    return d


# --------------------------------------------------------------------------- #
# load_skill / run_skill_script 的工具层
# --------------------------------------------------------------------------- #

def load_skill(root: Path, name: str, file: str | None = None, read_limit: int = DEFAULT_READ_LIMIT_BYTES) -> str:
    """模型可见工具 `load_skill`。

    file=None  -> 返回"目录清单"(只列路径),并附带使用说明;
    file=<相对路径> -> 返回该文件正文(超限截断)。
    """
    skill_dir = _safe_skill_dir(Path(root), name)

    if file is None or file == "":
        scripts = iter_scripts(skill_dir)
        lines: list[str] = []
        for p in sorted(skill_dir.rglob("*")):
            if p.is_file() and p.name != ORIGIN_MARKER:
                lines.append(str(p.relative_to(skill_dir)))
        if not lines:
            return "目录清单:没有正文以外的文件。"
        head = f"目录清单(只列路径,文件正文没有读入):\n" + "\n".join(lines)
        head += f"\n(含 {len(scripts)} 个脚本)"
        head += "\n正文点到的说明,用 load_skill 的 file 再读那一个文件。"
        head += "\n脚本用 run_skill_script 执行,不要把脚本源码读进对话。"
        return head

    target = (skill_dir / file).resolve()
    if skill_dir not in target.parents and target != skill_dir:
        raise SkillError("skill_not_found", "只能读取技能目录内的文件。")
    if not target.is_file():
        raise SkillError("skill_not_found", f"不是文件:{file}")
    if target.suffix.lower() not in MARKDOWN_EXTS:
        raise SkillError("skill_not_found", f"只能修改技能里的 markdown 文件。")
    data = target.read_bytes()
    truncated = len(data) > read_limit
    text = data[:read_limit].decode("utf-8", errors="replace")
    if truncated:
        text += f"\n（已截断，原文件 {len(data)} 字节）"
    return text


def which_interpreter(ext: str) -> tuple[str, str]:
    """返回 (扩展名, 解释器绝对路径);找不到抛 interpreter_missing。"""
    ext = ext.lower()
    if ext not in ALLOWED_SCRIPT_EXTS:
        raise SkillError("script_not_allowed", f"不认识的脚本扩展名:{ext}.")
    for candidate in INTERPRETERS[ext]:
        found = shutil.which(candidate)
        if found:
            return ext, found
    if ext == ".py":
        raise SkillError("interpreter_missing", "脚本需要 Python,但本机没有找到 python3 / python。")
    if ext == ".sh":
        raise SkillError("interpreter_missing", "脚本需要 shell,但本机没有找到 sh / bash。")
    raise SkillError("interpreter_missing", f"脚本需要 node,但本机没有找到 node。")


def run_skill_script(
    root: Path,
    skill: str,
    script: str,
    args: list[str] | None = None,
    stdin: str = "",
    timeout_ms: int = DEFAULT_SCRIPT_TIMEOUT_MS,
) -> dict:
    """模型可见工具 `run_skill_script`。

    返回结构与观察到的字段一致:
      exitCode / stdout / stderr / stdoutTruncated / stderrTruncated / timedOut / durationMs / interpreter
    """
    skill_dir = _safe_skill_dir(Path(root), skill)
    target = (skill_dir / script).resolve()
    if skill_dir not in target.parents and target != skill_dir:
        raise SkillError("skill_not_found", "只能读取技能目录内的文件。")
    if not target.is_file():
        raise SkillError("skill_not_found", f"技能 {skill} 里没有可执行的脚本 {script}(只允许白名单扩展名)。")

    ext, interpreter = which_interpreter(target.suffix)

    # 沙箱:最小环境变量集合 + 技能目录为工作目录
    env = {k: os.environ[k] for k in ENV_ALLOWLIST if k in os.environ}
    env.setdefault("PATH", os.defpath)

    started = time.monotonic()
    timed_out = False
    try:
        proc = subprocess.Popen(
            [interpreter, str(target), *(args or [])],
            cwd=str(skill_dir),
            env=env,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True,  # 等价于 Windows 侧 taskkill /PID /T /F 的进程组语义
        )
    except OSError as exc:
        raise SkillError("script_failed", f"启动脚本失败:{exc}") from exc

    try:
        out, err = proc.communicate(stdin.encode("utf-8"), timeout=max(timeout_ms, 1) / 1000)
    except subprocess.TimeoutExpired:
        timed_out = True
        _kill_tree(proc)
        out, err = proc.communicate()
    duration_ms = int((time.monotonic() - started) * 1000)

    limit = 64 * 1024
    return {
        "exitCode": proc.returncode,
        "stdout": out[:limit].decode("utf-8", errors="replace"),
        "stderr": err[:limit].decode("utf-8", errors="replace"),
        "stdoutTruncated": len(out) > limit,
        "stderrTruncated": len(err) > limit,
        "timedOut": timed_out,
        "durationMs": duration_ms,
        "interpreter": interpreter,
    }


def _kill_tree(proc: subprocess.Popen) -> None:
    """Windows 用 taskkill /PID <pid> /T /F;POSIX 用进程组 TERM→KILL。"""
    if sys.platform.startswith("win"):
        subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True)
        return
    try:
        os.killpg(os.getpgid(proc.pid), 15)
    except ProcessLookupError:
        return
    try:
        proc.wait(timeout=2)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(os.getpgid(proc.pid), 9)
        except ProcessLookupError:
            pass


# --------------------------------------------------------------------------- #
# 技能 markdown 写入(只允许 markdown)
# --------------------------------------------------------------------------- #

def write_skill_markdown(root: Path, file: str, body: str) -> dict:
    """对应 assistant_skill_write_markdown(file, body)。"""
    root = Path(root)
    # file 形如 <技能名>/<相对路径>
    parts = Path(file).parts
    if len(parts) < 2:
        raise SkillError("skill_not_found", "文件名不能为空。")
    skill_dir = _safe_skill_dir(root, parts[0])
    target = (skill_dir / Path(*parts[1:])).resolve()
    if skill_dir not in target.parents:
        raise SkillError("skill_not_found", "只能读取技能目录内的文件。")
    if target.suffix.lower() not in MARKDOWN_EXTS:
        raise SkillError("skill_not_allowed", "只能修改技能里的 markdown 文件。")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(body, encoding="utf-8")
    return {"path": str(target.relative_to(skill_dir)), "bytes": len(body.encode("utf-8"))}
