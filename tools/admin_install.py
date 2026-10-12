#!/usr/bin/env python3
"""管理安装(administrative install):按 MSI 的 Directory/Component/File 表还原安装树。

等价于 Windows 上的 `msiexec /a <pkg> TARGETDIR=<root>`,但完全离线、不执行任何程序、
不写注册表、不建快捷方式 —— 只做"文件落位 + 安装清单"。

产出:
  <root>/Program Files/Vcdmind/vcdmind-desktop.exe
  <root>/Program Files/Vcdmind/resources/bin/vcdmind-mcp.exe
  <root>/Program Files/Vcdmind/resources/assistant-skills/README.md
  <root>/install-manifest.json      文件/功能/快捷方式/注册表/环境变量 全清单
  <root>/registry.reg               可在 Windows 上导入的注册表等价物(可选)

用法:
  python3 tools/admin_install.py Vcdmind-0.4.15-x64.msi --root ./install-root
"""

from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path

import cabarchive
import olefile
import pymsi
from pymsi import streamname

# 目录属性 -> 安装后根(本包内 INSTALLDIR 父级是 ProgramFiles64Folder)
DIR_ROOTS = {
    "ProgramFiles64Folder": "Program Files",
    "ProgramFilesFolder": "Program Files (x86)",
    "DesktopFolder": "Desktop",
    "ProgramMenuFolder": "ProgramData/Microsoft/Windows/Start Menu/Programs",
}

HIVE = {0: "HKEY_CLASSES_ROOT", 1: "HKEY_CURRENT_USER", 2: "HKEY_LOCAL_MACHINE", 3: "HKEY_USERS"}
REG_TYPES = {0: "REG_SZ", 2: "REG_EXPAND_SZ", 3: "REG_BINARY", 4: "REG_DWORD", 7: "REG_MULTI_SZ"}


def long_name(field: str) -> str:
    """MSI 的 'short|long' 文件名取长名。"""
    return field.split("|")[-1] if field else field


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def build_dir_map(rows: list[dict]) -> dict[str, str]:
    """Directory 表 -> {目录 ID: 绝对路径}。

    Windows Installer 的标准文件夹 ID(ProgramFiles64Folder、ProgramMenuFolder …)的真实路径
    由标准属性给出,Directory 表里的 DefaultDir(如 "PFiles")只是短名,必须覆盖掉;
    TARGETDIR 是安装根,不产生路径层级。
    """
    parent = {r["Directory"]: r.get("Directory_Parent") for r in rows}
    default = {r["Directory"]: (r.get("DefaultDir") or "") for r in rows}

    def resolve(did: str, seen: frozenset[str] = frozenset()) -> str:
        if did in DIR_ROOTS:                        # 标准文件夹:直接用真实路径
            return DIR_ROOTS[did]
        if did == "TARGETDIR" or did in seen or did not in parent:
            return ""
        p = parent.get(did)
        seg = long_name(default.get(did, ""))
        if seg in (".", "SourceDir", ""):           # 不新增层级
            return resolve(p, seen | {did})
        base = resolve(p, seen | {did})
        return f"{base}/{seg}" if base else seg

    return {d: resolve(d) for d in parent}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("msi", type=Path)
    ap.add_argument("--root", type=Path, default=Path("install-root"))
    ap.add_argument("--reg", action="store_true", help="额外写出 registry.reg")
    ap.add_argument("--windows-install-dir", default=r"C:\Program Files\Vcdmind",
                    help="用于注册表/快捷方式清单的 Windows 侧安装路径")
    args = ap.parse_args()

    msi_bytes = args.msi.read_bytes()
    pkg = pymsi.Package(str(args.msi))
    tables = {t: (pkg.get(t) or []) for t in
              ["Directory", "Component", "File", "Feature", "FeatureComponents",
               "Shortcut", "Registry", "CreateFolder", "RemoveFile", "Property"]}
    dir_map = build_dir_map(tables["Directory"])
    component_dir = {c["Component"]: c.get("Directory_") for c in tables["Component"]}
    feature_of = {fc["Component_"]: fc["Feature_"] for fc in tables["FeatureComponents"]}

    # ---- 解出 cabinet 载荷 -------------------------------------------------
    ole = olefile.OleFileIO(str(args.msi))
    cab_stream = cab_bytes = None
    for entry in ole.listdir():
        decoded, _ = streamname.decode_unicode(entry[-1])
        if decoded.endswith(".cab"):
            cab_stream, cab_bytes = decoded, ole.openstream(entry).read()
    ole.close()
    if cab_bytes is None:
        raise SystemExit("MSI 内未找到 cabinet")
    cab = cabarchive.CabArchive(cab_bytes)

    # ---- 文件落位 ---------------------------------------------------------
    args.root.mkdir(parents=True, exist_ok=True)
    files: list[dict] = []
    for row in sorted(tables["File"], key=lambda r: r["Sequence"]):
        key = row["File"]
        name = long_name(row["FileName"])
        comp = row["Component_"]
        rel_dir = dir_map.get(component_dir.get(comp, ""), "")
        data = cab[key].buf
        dest = args.root / rel_dir / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        files.append({
            "file_key": key,
            "installed_path": str(Path(rel_dir) / name).replace("\\", "/"),
            "host_path": f"{args.root}/{rel_dir}/{name}",
            "bytes": len(data),
            "sha256": sha256(data),
            "component": comp,
            "feature": feature_of.get(comp),
            "is_pe": data[:2] == b"MZ",
        })

    # ---- 快捷方式 / 注册表 / 环境变量(清单,不实际生效)--------------------
    install_dir = f"{args.root}/Program Files/Vcdmind"
    win_dir = args.windows_install_dir.rstrip("\\")
    props = {p["Property"]: p["Value"] for p in tables["Property"]}

    def expand(v: str) -> str:
        if v is None:
            return ""
        out = (v.replace("[INSTALLDIR]", win_dir)
                .replace("[!Path]", f"{win_dir}\\vcdmind-desktop.exe")
                .replace("[System64Folder]", "C:\\Windows\\System32\\"))
        for fmt, val in (("[ProductCode]", props.get("ProductCode", "")),
                         ("[ProductVersion]", props.get("ProductVersion", ""))):
            out = out.replace(fmt, str(val))
        return out

    shortcuts = [{
        "name": long_name(s["Name"]),
        "location": dir_map.get(s["Directory_"], s["Directory_"]),
        "target": expand(s.get("Target", "")),
        "arguments": expand(s.get("Arguments", "")),
        "description": s.get("Description", ""),
        "working_dir": s.get("WkDir", ""),
    } for s in tables["Shortcut"]]

    registry = [{
        "hive": HIVE.get(r["Root"], str(r["Root"])),
        "key": expand(r["Key"]),
        "name": r.get("Name") or "(默认值)",
        "type": "REG_DWORD" if str(r.get("Value", "")).startswith("#") else "REG_SZ",
        "value": (int(str(r["Value"])[1:]) if str(r.get("Value", "")).startswith("#")
                  else expand(r.get("Value"))),
        "component": r["Component_"],
    } for r in tables["Registry"]]

    env_features = [f for f in tables["Feature"] if "Environment" in f["Feature"]]

    manifest = {
        "source_msi": str(args.msi),
        "source_sha256": sha256(msi_bytes),
        "cabinet": {"stream": cab_stream, "bytes": len(cab_bytes), "sha256": sha256(cab_bytes)},
        "product": {k: props.get(k) for k in
                    ["ProductName", "ProductVersion", "Manufacturer", "ProductCode", "UpgradeCode"]},
        "install_root": str(args.root),
        "windows_install_dir": win_dir,
        "files": files,
        "features": [{k: f.get(k) for k in ["Feature", "Title", "Description", "Level", "Feature_Parent"]}
                     for f in tables["Feature"]],
        "shortcuts": shortcuts,
        "registry": registry,
        "environment": {"feature": env_features[0]["Feature"] if env_features else None,
                        "effect": "把安装目录加入 PATH 系统环境变量(由 MSI Environment 功能实现)"},
        "preconditions_on_windows": {
            "webview2": "缺失时安装程序会执行 DownloadAndInvokeBootstrapper,从 go.microsoft.com 下载 WebView2 引导器",
            "os": "x64 Windows;本清单在 Linux 上生成,注册表/快捷方式/环境变量均未生效",
        },
        "not_performed": ["执行安装序列", "写注册表", "创建快捷方式", "修改 PATH", "启动程序"],
    }
    (args.root / "install-manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    if args.reg:
        lines = ["Windows Registry Editor Version 5.00", ""]
        for r in registry:
            hive = {"HKEY_CLASSES_ROOT": "HKEY_CLASSES_ROOT",
                    "HKEY_CURRENT_USER": "HKEY_CURRENT_USER",
                    "HKEY_LOCAL_MACHINE": "HKEY_LOCAL_MACHINE"}[r["hive"]]
            key = r["key"]
            if hive == "HKEY_LOCAL_MACHINE":
                key = key.replace("SOFTWARE\\Classes", "SOFTWARE\\Classes")
            lines.append(f"[{hive}\\{key}]")
            val = r["value"]
            if r["type"] == "REG_DWORD":
                lines.append(f'"{r["name"]}"=dword:{val:08x}')
            else:
                lines.append(f'"{r["name"]}"="{str(val).replace(chr(92), chr(92)*2)}"')
            lines.append("")
        (args.root / "registry.reg").write_text("\r\n".join(lines), encoding="utf-8")

    print(f"[*] 管理安装完成 → {args.root}")
    for f in files:
        print(f"      {f['bytes']:>12,}  {f['installed_path']}")
    print(f"[*] 清单:{args.root}/install-manifest.json"
          f"({len(files)} 文件 / {len(shortcuts)} 快捷方式 / {len(registry)} 注册表项)")
    print("[*] 未执行:安装序列、注册表写入、快捷方式、PATH 修改、程序启动")


if __name__ == "__main__":
    main()
