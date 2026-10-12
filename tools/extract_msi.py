#!/usr/bin/env python3
"""Vcdmind MSI 静态提取器(只读,不执行目标)

用途:
  1. 解析 MSI 的 OLE 复合文档结构,还原被 "MIME base64" 编码的流名
  2. 用 pymsi 读取 MSI 数据库表(Property / File / Component / Directory ...)
  3. 导出内嵌 cabinet(app.cab) 并解包出真实载荷文件

依赖:
  pip install --break-system-packages olefile pymsi cabarchive

用法:
  python3 tools/extract_msi.py Vcdmind-0.4.15-x64.msi --out work/
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

import cabarchive
import olefile
import pymsi
from pymsi import streamname

# File 表主键 -> 真实文件名(取自 MSI File 表的 FileName 字段)
FILE_NAME_FALLBACK = {
    "Path": "vcdmind-desktop.exe",
    "PathFile_Ia1efe2d2bafd4b44896a1f69296da31f": "vcdmind-mcp.exe",
    "PathFile_Ie234ab51935c4439ba4543cb6bc428a6": "README.md",
    "PathFile_I09791eabc3d448e5bc13fc5086b03605": ".gitkeep",
    "PathFile_Ie1081c85f0944f1f83ad729323d0959b": ".gitkeep",
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def list_streams(msi: Path) -> list[tuple[str, int]]:
    """返回 (解码后的流名, 字节数),按大小倒序。"""
    ole = olefile.OleFileIO(str(msi))
    rows = []
    for entry in ole.listdir():
        raw = entry[-1]
        try:
            decoded, is_table = streamname.decode_unicode(raw)
        except Exception:
            decoded, is_table = raw, False
        name = f"[table] {decoded}" if is_table else decoded
        rows.append((name, ole.get_size(entry)))
    ole.close()
    return sorted(rows, key=lambda r: -r[1])


def dump_tables(msi: Path, tables: list[str]) -> dict:
    pkg = pymsi.Package(str(msi))
    out: dict[str, list] = {}
    for name in tables:
        try:
            rows = pkg.get(name)
        except Exception as exc:  # 表不存在
            out[name] = [{"error": str(exc)}]
            continue
        out[name] = [
            {k: (v.hex() if isinstance(v, bytes) else v) for k, v in row.items()}
            for row in (rows or [])
        ]
    return out


def extract_payload(msi: Path, out_dir: Path) -> dict:
    """导出 app.cab 并解包其中的载荷文件。"""
    ole = olefile.OleFileIO(str(msi))
    target = None
    for entry in ole.listdir():
        decoded, _ = streamname.decode_unicode(entry[-1])
        if decoded.endswith(".cab"):
            target = entry
            cab_name = decoded
    if target is None:
        raise SystemExit("未在 MSI 中找到 cabinet 流")

    cab_bytes = ole.openstream(target).read()
    ole.close()

    out_dir.mkdir(parents=True, exist_ok=True)
    cab_path = out_dir / cab_name.lstrip("#")
    cab_path.write_bytes(cab_bytes)

    manifest = {
        "cabinet_stream": cab_name,
        "cabinet_bytes": len(cab_bytes),
        "cabinet_sha256": sha256(cab_bytes),
        "members": [],
    }

    cab = cabarchive.CabArchive(cab_bytes)
    for key in cab:
        data = cab[key].buf
        name = FILE_NAME_FALLBACK.get(key, key)
        dest = out_dir / f"{name}"
        dest.write_bytes(data)
        manifest["members"].append(
            {
                "cab_key": key,
                "installed_name": name,
                "bytes": len(data),
                "sha256": sha256(data),
            }
        )
    return manifest


TABLES = [
    "Property", "Media", "Directory", "Component", "Feature", "File",
    "FeatureComponents", "Shortcut", "Registry", "Icon", "CustomAction",
    "InstallExecuteSequence", "InstallUISequence", "Upgrade", "AppSearch",
    "RegLocator", "RemoveFile", "CreateFolder", "MsiFileHash", "Binary",
    "UIText", "Dialog", "Control",
]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("msi", type=Path)
    ap.add_argument("--out", type=Path, default=Path("work"))
    args = ap.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    print(f"[*] MSI: {args.msi}  bytes={args.msi.stat().st_size}  sha256={sha256(args.msi.read_bytes())}")

    streams = list_streams(args.msi)
    (args.out / "streams.txt").write_text(
        "\n".join(f"{size:>12,}  {name}" for name, size in streams) + "\n", encoding="utf-8"
    )
    print(f"[*] OLE 流: {len(streams)} 个(已还原名称)-> {args.out/'streams.txt'}")

    tables = dump_tables(args.msi, TABLES)
    (args.out / "msi-tables.json").write_text(
        json.dumps(tables, indent=2, ensure_ascii=False, default=str), encoding="utf-8"
    )
    print(f"[*] 数据库表: {len(tables)} 张 -> {args.out/'msi-tables.json'}")

    manifest = extract_payload(args.msi, args.out / "payload")
    (args.out / "payload-manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print("[*] cabinet 载荷:")
    for member in manifest["members"]:
        print(f"      {member['bytes']:>12,}  {member['installed_name']}  sha256={member['sha256'][:16]}…")


if __name__ == "__main__":
    main()
