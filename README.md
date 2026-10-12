# re

对 **Vcdmind 0.4.15 (x64 MSI)** 的静态逆向工作区。

任务:安装并借助 [morluto/rea](https://github.com/morluto/rea)(一个面向 Agent 的逆向工程 CLI/MCP),
对这个 MSI 安装包做逆向,弄清它的 **技能(Skill)体系是如何构成的**。

## 交付物

| 文件 | 内容 |
| --- | --- |
| [`Vcdmind-0.4.15-MSI-逆向报告.md`](Vcdmind-0.4.15-MSI-逆向报告.md) | **主报告**:MSI 结构、载荷指纹、技能体系(目录形态 / SKILL.md / 技能包校验 / 市场 API / 运行时工具 / 脚本沙箱)、安全观察、复现步骤 |
| [`evidence/`](evidence) | 证据:`hashes.json`、`msi-tables.json`(17 张 MSI 表)、`desktop-skill-strings.txt`(带偏移)、`mcp-catalog.md` |
| [`tools/extract_msi.py`](tools/extract_msi.py) | 可复现的只读提取脚本(OLE 流名还原 → MSI 表 → cabinet 解包),不执行目标 |
| `Vcdmind-0.4.15-x64.msi` | 被分析的样本(SHA-256 `74747ddf…0a08b`) |

## 一句话结论

安装包本身几乎不含技能内容(只有 287 B 的说明文件,指明官方技能**从服务端拉取**);
技能的真实形态是 `skill-library/<名称>/SKILL.md` + 白名单脚本(`mjs/cjs/py/sh`) + `.vcdmind-origin` 来源标记,
由桌面端 Tauri 应用(内置 AI 助手,工具为 `load_skill` / `run_skill_script`)消费,
技能包经服务端市场以 zip 分发并做 sha256、体积、文件数、扩展名、顶层目录名一致性等强校验。
MSI 内的 Go MCP 服务器(`vcdmind.dev/mcp`)**不含任何技能能力**。

## 复现

```bash
npm install -g rea-agents@latest
pip install --break-system-packages olefile pymsi cabarchive
python3 tools/extract_msi.py Vcdmind-0.4.15-x64.msi --out work/
rea inspect-pe-resources work/payload/vcdmind-desktop.exe --json
```

> 分析全程为**静态、只读**:未安装、未运行 MSI 及其中的可执行文件。
