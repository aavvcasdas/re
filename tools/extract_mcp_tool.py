#!/usr/bin/env python3
"""从 Go 二进制里提取某个 MCP 工具的真实契约(入参 schema / 调用顺序)。

做法:
  1. 解析 Go pclntab,按名字定位函数(vcdmind.dev/mcp/internal/tools.Handler.<X>)
  2. 用 capstone 反汇编该函数
  3. 解析所有 RIP 相对寻址,把目标地址映射回文件偏移,读出被引用的字符串字面量
     —— 这些字面量就是 schema 的属性名、属性说明、required 列表、API 路径

这样得到的是**观察值**,不是猜测值。

用法:
    python3 tools/extract_mcp_tool.py <二进制> --list                # 列出候选函数
    python3 tools/extract_mcp_tool.py <二进制> --func startVideoCreation [--asm]
"""

from __future__ import annotations

import argparse
import struct
import sys
from pathlib import Path

try:
    from capstone import CS_ARCH_X86, CS_MODE_64, Cs
    from capstone.x86 import X86_OP_MEM, X86_REG_RIP
except ImportError:
    print("需要 capstone:pip install capstone", file=sys.stderr)
    raise


# --------------------------------------------------------------------------- #
# PE 解析(拿到节区映射:.text 的文件偏移/虚拟地址)
# --------------------------------------------------------------------------- #

def pe_image_base(data: bytes) -> int:
    pe = struct.unpack_from("<I", data, 0x3C)[0]
    opt = pe + 24
    magic = struct.unpack_from("<H", data, opt)[0]
    if magic == 0x20B:            # PE32+
        return struct.unpack_from("<Q", data, opt + 24)[0]
    return struct.unpack_from("<I", data, opt + 28)[0]


def pe_sections(data: bytes) -> list[dict]:
    pe = struct.unpack_from("<I", data, 0x3C)[0]
    nsec = struct.unpack_from("<H", data, pe + 6)[0]
    opt_size = struct.unpack_from("<H", data, pe + 20)[0]
    base = pe + 24 + opt_size
    out = []
    for i in range(nsec):
        o = base + i * 40
        name = data[o:o + 8].rstrip(b"\0").decode("latin1")
        vsize, vaddr, rsize, raw = struct.unpack_from("<IIII", data, o + 8)
        out.append({"name": name, "vaddr": vaddr, "vsize": vsize, "raw": raw, "rsize": rsize})
    return out


def va_to_off(sections: list[dict], va: int, image_base: int = 0) -> int | None:
    rva = va - image_base
    for s in sections:
        if s["vaddr"] <= rva < s["vaddr"] + max(s["vsize"], s["rsize"]):
            delta = rva - s["vaddr"]
            if delta < s["rsize"]:
                return s["raw"] + delta
    return None


# --------------------------------------------------------------------------- #
# pclntab 解析(Go 1.18+ 格式)
# --------------------------------------------------------------------------- #

def parse_pclntab(data: bytes) -> tuple[dict[str, tuple[int, int]], int, int]:
    """返回 ({函数名: (文件偏移, 长度)}, text_start, text_raw)。"""
    magic = b"\xf1\xff\xff\xff\x00\x00"
    pos = data.find(magic)
    while pos >= 0:
        if data[pos + 6:pos + 8] == b"\x01\x08":     # minLC=1, ptrSize=8
            break
        pos = data.find(magic, pos + 1)
    if pos < 0:
        raise SystemExit("未找到 Go pclntab(magic 0xFFFFFFF1)")

    base = pos
    fields = struct.unpack_from("<8Q", data, base + 8)
    (nfunc, nfiles, text_start, funcname_off,
     cu_off, filetab_off, pctab_off, pcln_off) = fields
    pcln = base + pcln_off
    funcname = base + funcname_off

    sections = pe_sections(data)
    text_raw = None
    for s in sections:
        if s["name"] == ".text":
            text_raw = s["raw"]
    if text_raw is None:
        raise SystemExit("无法定位 .text 节")

    entries: list[tuple[int, int]] = []
    i = pcln
    while True:
        entry_off, func_off = struct.unpack_from("<II", data, i)
        if entry_off == 0 and func_off == 0:
            break
        entries.append((entry_off, func_off))
        i += 8
        if len(entries) > nfunc + 16:
            break
    entries.sort()

    def go_string(off: int) -> str:
        # funcnametab 里是 NUL 分隔的字符串
        end = data.find(b"\x00", off)
        return data[off:end].decode("utf-8", "replace")

    funcs: dict[str, tuple[int, int]] = {}
    for idx, (entry_off, func_off) in enumerate(entries):
        name_off = struct.unpack_from("<i", data, pcln + func_off + 4)[0]
        try:
            name = go_string(funcname + name_off)
        except Exception:
            continue
        end_off = entries[idx + 1][0] if idx + 1 < len(entries) else entry_off + 0x2000
        # PE 上 pclntab 的 textStart 常写 0;经验证 entryoff 以 .text 起址为基准,
        # 因此文件偏移 = entryoff + .text raw,虚拟地址 = image_base + .text vaddr + entryoff
        funcs[name] = (text_raw + entry_off, max(end_off - entry_off, 16))
    return funcs, text_start, text_raw


# --------------------------------------------------------------------------- #
# 反汇编 + 字符串引用提取
# --------------------------------------------------------------------------- #

def referenced_strings(data: bytes, sections: list[dict], file_off: int, size: int,
                      image_base: int) -> list[tuple[int, str]]:
    md = Cs(CS_ARCH_X86, CS_MODE_64)
    md.detail = True
    text = data[file_off:file_off + min(size, 0x4000)]
    # 链接期虚拟地址 = image_base + .text RVA + entryoff
    text_sec = next(s for s in sections if s["name"] == ".text")
    entry_va = image_base + text_sec["vaddr"] + (file_off - text_sec["raw"])

    out: list[tuple[int, str]] = []
    for insn in md.disasm(text, entry_va):
        for op in insn.operands:
            if op.type != X86_OP_MEM or op.mem.base != X86_REG_RIP:
                continue
            target = insn.address + insn.size + op.mem.disp
            off = va_to_off(sections, target, image_base)
            if off is None or off >= len(data):
                continue
            raw = data[off:off + 300]
            chunk = bytearray()
            for b in raw:
                if 0x20 <= b <= 0x7E:
                    chunk.append(b)
                else:
                    break
            s = chunk.decode("latin1")
            if len(s) >= 2:
                out.append((insn.address, s))
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("binary", type=Path)
    ap.add_argument("--func", help="函数名子串,如 startVideoCreation")
    ap.add_argument("--list", action="store_true", help="列出 mcp 相关函数名")
    ap.add_argument("--asm", action="store_true", help="同时打印反汇编")
    args = ap.parse_args()

    data = args.binary.read_bytes()
    sections = pe_sections(data)
    image_base = pe_image_base(data)
    funcs, text_start, text_raw = parse_pclntab(data)
    print(f"pclntab: {len(funcs)} 个函数;镜像基址=0x{image_base:x};.text 文件偏移=0x{text_raw:x}(pclntab textStart=0x{text_start:x})")

    mcp = sorted(n for n in funcs if "vcdmind.dev/mcp" in n)
    if args.list or not args.func:
        print(f"\nvcdmind.dev/mcp 下的函数({len(mcp)} 个,节选):")
        for n in mcp:
            if any(k in n for k in ("tools.", "server.", "rpc.", "config.", "api.")):
                print("   ", n)
        return

    hits = [n for n in mcp if args.func in n]
    if not hits:
        hits = [n for n in funcs if args.func in n]
    if not hits:
        raise SystemExit(f"未找到包含 {args.func!r} 的函数")
    print(f"\n匹配 {len(hits)} 个函数:")
    for h in hits:
        print("   ", h)

    for name in hits:
        off, size = funcs[name]
        print(f"\n===== {name} @file 0x{off:x} ({size} 字节) =====")
        refs = referenced_strings(data, sections, off, size, image_base)
        seen: set[str] = set()
        print("--- 引用的字符串字面量(按出现顺序,去重)---")
        for insn_addr, s in refs:
            if s in seen:
                continue
            seen.add(s)
            print(f"  0x{insn_addr:x}  {s[:220]}")
        if args.asm:
            md = Cs(CS_ARCH_X86, CS_MODE_64)
            text_sec = next(s for s in sections if s["name"] == ".text")
            entry_va = image_base + text_sec["vaddr"] + (off - text_sec["raw"])
            print("--- 反汇编(前 80 条)---")
            for k, insn in enumerate(md.disasm(data[off:off + size], entry_va)):
                if k >= 80:
                    break
                print(f"  0x{insn.address:x}  {insn.mnemonic} {insn.op_str}")


if __name__ == "__main__":
    main()
