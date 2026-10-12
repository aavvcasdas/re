# re

对 **Vcdmind 0.4.15 (x64 MSI)** 的静态逆向工作区 —— 以及基于逆向结果的**复刻方案与可运行参考实现**。

任务:借助 [morluto/rea](https://github.com/morluto/rea)(面向 Agent 的逆向工程 CLI/MCP)对这个 MSI 做逆向,
弄清它的**技能(Skill)体系是如何构成的**,并给出**复刻路线**。

## 交付物

| 文件 | 内容 |
| --- | --- |
| [`Vcdmind-0.4.15-MSI-逆向报告.md`](Vcdmind-0.4.15-MSI-逆向报告.md) | **逆向报告**:MSI 结构、载荷指纹、技能体系(SKILL.md / 技能包校验 / 市场 API / 运行时工具 / 脚本沙箱)、证据偏移、复现步骤 |
| [`复刻方案.md`](复刻方案.md) | **复刻蓝图**:四层拆解、接口契约(MCP 线格式 / 平台 API / IPC 命令 / 本地工具桥 / VFS)、技能体系设计、里程碑与工作量、不确定项 |
| [`replica/`](replica) | **可运行参考实现**:技能运行时、技能包打包校验、MCP stdio 服务器、端到端 demo(全部实测通过) |
| [`evidence/`](evidence) | 证据:哈希、17 张 MSI 表、技能字符串(带偏移)、平台 API 路径、MCP 目录 |
| [`tools/extract_msi.py`](tools/extract_msi.py) | 只读提取脚本(OLE 流名还原 → MSI 表 → cabinet 解包) |
| `Vcdmind-0.4.15-x64.msi` | 被分析的样本(SHA-256 `74747ddf…0a08b`) |

## 一句话结论

安装包几乎不含技能内容(仅 287 B 说明文件,指明官方技能**从服务端拉取**);技能真实形态是
`skill-library/<名称>/SKILL.md` + 白名单脚本(`mjs/cjs/py/sh`)+ `.vcdmind-origin`,
由桌面端 Tauri 应用内置助手通过 **`load_skill` / `run_skill_script`** 按需消费
("目录清单只列路径"、"不要把脚本源码读进对话"),技能包经服务端市场以 zip 分发并做
sha256、体积、文件数、扩展名、顶层目录名一致性等强校验。
MSI 内的 Go MCP 服务器(`vcdmind.dev/mcp`)与技能体系无交集。

## 快速验证

```bash
python3 replica/demo.py             # 技能体系端到端 + 5 类反例(打包→校验→安装→索引→按需读取→执行)
python3 replica/mcp_client_test.py  # MCP stdio 会话:initialize → tools/list → tools/call
python3 tools/extract_msi.py Vcdmind-0.4.15-x64.msi --out work/   # 复现 MSI 提取
```

> 分析全程为**静态、只读**:未安装、未运行 MSI 及其中的可执行文件。
> 参考实现是依据接口与行为证据**重写**的原创代码,不是原二进制反编译产物。
