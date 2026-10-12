#!/usr/bin/env python3
"""MCP stdio 服务器骨架 —— 复刻 vcdmind-mcp.exe 的线格式与配置约定。

线格式依据:二进制中的 JSON tag 字面量(见 复刻方案.md §3/§6):
  jsonrpc / id / method / params        -> JSON-RPC 2.0 请求
  protocolVersion                       -> initialize 结果
  name / description / inputSchema      -> tools/list 条目
  content[{type,text}] / structuredContent / isError -> tools/call 结果
  error{code,message} / result          -> 响应外壳
  配置:VCDMIND_CONFIG(配置文件路径)/ VCDMIND_API_BASE_URL / VCDMIND_API_TOKEN
        VCDMIND_IMAGE_POLL_TIMEOUT / image_poll_timeout / max_results / api_base_url / api_token

5 个平台工具按观测到的描述原文注册;平台调用在此为桩实现(可选走真实 HTTP)。
技能工具(load_skill / run_skill_script)只是**示例扩展**,用于演示同样的协议接进来自研能力。

运行:
    echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | python3 mcp_stdio_server.py
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from skill_runtime import (  # noqa: E402
    SkillError,
    load_skill,
    run_skill_script,
    skill_detail,
    skill_index,
)

PROTOCOL_VERSION = "2025-06-18"   # 形态参考 MCP 规范;产品内协议串未在二进制中出现,属复刻假设
SERVER_NAME = "vcdmind-mcp-replica"

SKILL_LIBRARY = Path(os.environ.get("VCDMIND_SKILL_LIBRARY", Path.home() / "skill-library"))
# VCDMIND_SKILL_TOOLS=off 时只暴露 5 个平台工具 —— 用于模拟 MSI 里 vcdmind-mcp.exe 的真实工具面
SKILL_TOOLS_ENABLED = os.environ.get("VCDMIND_SKILL_TOOLS", "on").lower() not in ("off", "0", "false")


def _config() -> dict:
    """配置解析顺序:VCDMIND_CONFIG 指向的 JSON 文件 → 环境变量 → 默认值。"""
    cfg: dict = {}
    cfg_path = os.environ.get("VCDMIND_CONFIG")
    if cfg_path and Path(cfg_path).is_file():
        try:
            cfg.update(json.loads(Path(cfg_path).read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError):
            pass
    env_map = {
        "VCDMIND_API_BASE_URL": "api_base_url",
        "VCDMIND_API_TOKEN": "api_token",
        "VCDMIND_IMAGE_POLL_TIMEOUT": "image_poll_timeout",
    }
    for env_key, field in env_map.items():
        if os.environ.get(env_key):
            cfg[field] = os.environ[env_key]
    cfg.setdefault("api_base_url", "")
    cfg.setdefault("api_token", "")
    cfg.setdefault("image_poll_timeout", "120")
    return cfg


# --------------------------------------------------------------------------- #
# 工具目录(名称与描述逐字取自二进制)
# --------------------------------------------------------------------------- #

def _skill_tools() -> list[dict]:
    return [
        {
            "name": "list_skills",
            "description": "列出本机技能库里的技能(只给元数据与文件清单路径,不给正文)。",
            "inputSchema": {"type": "object", "properties": {}},
        },
        {
            "name": "load_skill",
            "description": "读取技能的目录清单;带 file 时只读那一个文件的正文。",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "技能名"},
                    "file": {"type": "string", "description": "技能目录内的相对路径(通常是 markdown)"},
                },
                "required": ["name"],
            },
        },
        {
            "name": "run_skill_script",
            "description": "执行技能里的脚本(白名单扩展名 mjs/cjs/py/sh),不要把脚本源码读进对话。",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "skill": {"type": "string"},
                    "script": {"type": "string"},
                    "args": {"type": "array", "items": {"type": "string"}},
                    "stdin": {"type": "string"},
                    "timeoutMs": {"type": "integer"},
                },
                "required": ["skill", "script"],
            },
        },
    ]


def catalog() -> list[dict]:
    return [
        {
            "name": "web_search",
            "description": "Optional paid web search via vcdmind. Skip this tool if the user does not want platform search.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_results": {"type": "integer"},
                    "time_range": {"type": "string"},
                },
                "required": ["query"],
            },
        },
        {
            "name": "image_generate",
            "description": "Optional paid image generation via vcdmind. Skip this tool if the user does not want platform images.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "prompt": {"type": "string"},
                    "size": {"type": "string"},
                    "aspect_ratio": {"type": "string"},
                    "count": {"type": "integer"},
                },
                "required": ["prompt"],
            },
        },
        {
            "name": "list_templates",
            "description": "List published vcdmind creation templates. Does not include paid prompts or workflow internals.",
            "inputSchema": {
                "type": "object",
                "properties": {"category": {"type": "string"}, "platform": {"type": "string"}},
            },
        },
        {
            "name": "save_document",
            "description": "Save a finished manuscript into the user's vcdmind creation library so it can be used as a video workflow manuscript. Call only when the user explicitly asks to keep the manuscript or start video creation. asset_type must be copywriting or script.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "content": {"type": "string"},
                    "asset_type": {"type": "string", "enum": ["copywriting", "script"]},
                },
                "required": ["title", "content", "asset_type"],
            },
        },
        {
            "name": "start_video_creation",
            "description": "Return a desktop deep link that opens vcdmind with a saved document and a creation template. The document must already exist in the creation library.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "document_id": {"type": "string"},
                    "template_code": {"type": "string"},
                    "platform": {"type": "string"},
                },
                "required": ["document_id"],
            },
        },
    ] + (_skill_tools() if SKILL_TOOLS_ENABLED else [])


# --------------------------------------------------------------------------- #
# 调用分发
# --------------------------------------------------------------------------- #

def ok(text: str, structured: dict | None = None) -> dict:
    result: dict = {"content": [{"type": "text", "text": text}]}
    if structured is not None:
        result["structuredContent"] = structured   # 观测到的字段
    return {"jsonrpc": "2.0", "id": None, "result": result}


def fail(text: str, code: str = "tool_error") -> dict:
    return {
        "jsonrpc": "2.0",
        "id": None,
        "result": {"content": [{"type": "text", "text": text}], "isError": True},
        "error": {"code": code, "message": text},
    }


def call_tool(name: str, args: dict) -> dict:
    cfg = _config()

    if name == "list_skills":
        skills = skill_index(SKILL_LIBRARY)
        return ok(json.dumps(skills, ensure_ascii=False), {"skills": skills})

    if name == "load_skill":
        try:
            text = load_skill(SKILL_LIBRARY, args["name"], args.get("file"))
        except SkillError as exc:
            return fail(exc.message, exc.code)
        if args.get("file"):
            structured = {"skill": args["name"], "file": args["file"], "text": text}
        else:
            try:
                detail = skill_detail(SKILL_LIBRARY, args["name"])
            except SkillError:
                detail = {}
            structured = {
                "skill": args["name"],
                "description": detail.get("description", ""),
                "origin": detail.get("origin"),
                "markdownFiles": detail.get("markdownFiles", []),
                "scripts": detail.get("scripts", []),
            }
        return ok(text, structured)

    if name == "run_skill_script":
        try:
            out = run_skill_script(
                SKILL_LIBRARY,
                args["skill"],
                args["script"],
                args=args.get("args") or [],
                stdin=args.get("stdin", ""),
                timeout_ms=int(args.get("timeoutMs") or 120_000),
            )
            return ok(json.dumps(out, ensure_ascii=False), out)
        except SkillError as exc:
            return fail(exc.message, exc.code)

    if name == "list_templates":
        return ok(
            "（桩实现)需要 api_base_url/api_token 才能返回真实模板目录",
            {"items": [], "api_base_url": cfg["api_base_url"] or None, "source": cfg},
        )

    if name == "web_search":
        if not cfg["api_token"]:
            return fail("insufficient_balance: 未配置 VCDMIND_API_TOKEN")
        return ok("（桩实现)POST " + cfg["api_base_url"].rstrip("/") + "/v1/search",
                  {"query": args.get("query"), "max_results": args.get("max_results"),
                   "estimated_credits": None, "actual_credits": None})

    if name == "image_generate":
        return ok("（桩实现)已提交图像任务,随后按 image_poll_timeout 轮询",
                  {"job": {"id": "job_stub", "status": "queued"},
                   "estimated_credits": None, "actual_credits": None,
                   "outputs": [], "image_poll_timeout": cfg["image_poll_timeout"]})

    if name == "save_document":
        if args.get("asset_type") not in ("copywriting", "script"):
            return fail("asset_type must be copywriting or script")
        return ok("（桩实现)已保存到写作库", {"document": {"id": "doc_stub", "title": args.get("title")}})

    if name == "start_video_creation":
        return ok("（桩实现)返回桌面深链", {"url": "vcdmind://create?document_id=doc_stub",
                                            "documentId": "doc_stub"})

    return fail(f"unknown tool: {name}", "unknown_tool")


# --------------------------------------------------------------------------- #
# stdio 传输
# --------------------------------------------------------------------------- #

def handle(req: dict) -> dict:
    method = req.get("method", "")
    rid = req.get("id")

    if method == "initialize":
        result = {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {"listChanged": False}},
            "serverInfo": {"name": SERVER_NAME, "version": "0.1.0"},
        }
        return {"jsonrpc": "2.0", "id": rid, "result": result}

    if method in ("notifications/initialized", "initialized"):
        return {}

    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": rid, "result": {"tools": catalog()}}

    if method == "tools/call":
        params = req.get("params") or {}
        out = call_tool(params.get("name", ""), params.get("arguments") or {})
        out["id"] = rid
        return out

    return {"jsonrpc": "2.0", "id": rid,
            "error": {"code": "unknown_method", "message": f"unknown method: {method}"}}


def main() -> None:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError as exc:
            sys.stdout.write(json.dumps({"jsonrpc": "2.0", "id": None,
                                         "error": {"code": "parse_error", "message": str(exc)}}) + "\n")
            sys.stdout.flush()
            continue
        resp = handle(req)
        if resp:
            sys.stdout.write(json.dumps(resp, ensure_ascii=False) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
