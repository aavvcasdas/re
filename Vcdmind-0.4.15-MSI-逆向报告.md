# Vcdmind 0.4.15 (x64 MSI) 逆向分析报告 —— 技能(Skill)体系是如何构成的

> 分析对象:`Vcdmind-0.4.15-x64.msi`(21,200,896 B,SHA-256 `74747ddf…0a08b`)
> 分析方式:纯静态、只读。**未安装、未运行** MSI 或其中任何可执行文件。
> 所用工具:[morluto/rea](https://github.com/morluto/rea) 6.4.0(`npm i -g rea-agents`)+ `pymsi` / `olefile` / `cabarchive` / `brotli`。

---

## 0. 结论速览(TL;DR)

1. **这个 MSI 里几乎没有技能本体。** 安装包只带一个 287 字节的说明文件 `resources/assistant-skills/README.md`,它明确写着:官方技能**只从服务端拉取**,该资源目录已不再作为安装源。
2. **技能的内容形态是"目录 + SKILL.md + 脚本"**:`skill-library/<技能名>/SKILL.md`,可执行脚本白名单扩展名为 `mjs | cjs | py | sh`,并用 `.vcdmind-origin` 文件标记来源(官方/市场安装)。
3. **技能有完整的一套元数据与市场模型**:`name / description / enabled / official / label / category / scenes`,市场侧还有 `version / fileCount / releaseNotes / installed / installedVersion / updatable / canUninstall`。
4. **安装技能包是一个被严格校验的 zip**:必须只有一个顶层目录、目录名必须与 `SKILL.md` 里的技能名一致、必须带 `.vcdmind-origin`、必须通过 `sha256` 校验;解压后 ≤128 MB、单文件 ≤32 MB、文件数有上限、扩展名白名单。
5. **给 AI 助手用的工具是 `load_skill` 和 `run_skill_script`**,而不是"把所有技能塞进提示词"。二进制里保存了注入给模型的原文:目录清单只列路径、正文要点到的说明用 `load_skill` 的 `file` 再读、脚本用 `run_skill_script` 执行、**不要把脚本源码读进对话**。
6. **MCP 与 Skill 是两条独立通道**:MSI 里的 `vcdmind-mcp.exe` 是 Go 写的平台 MCP 服务器(模块 `vcdmind.dev/mcp`,5 个工具:`web_search` / `image_generate` / `list_templates` / `save_document` / `start_video_creation`),**全量检索 `skill` 命中 0 次**——技能体系完全在 Tauri 桌面端 `vcdmind-desktop.exe` 内实现。
7. **安装包与两个载荷均未做 Authenticode 签名**(MSI 无 `\x05DigitalSignature` 流、两个 PE 的证书目录为 0)。

---

## 1. 分析环境与工具链

| 组件 | 版本 / 说明 |
| --- | --- |
| rea CLI | 6.4.0(`npm install -g rea-agents`),127 条 CLI 命令 / 170 个 MCP 工具 / 6 个 prompt;期望 skill 版本 37 |
| Python 依赖 | `olefile`、`pymsi`(解析 MSI 数据库)、`cabarchive`(解 cabinet)、`brotli` |
| 平台限制 | 沙箱为 Debian 12,REA 的 Hopper/Ghidra/IDA 深度分析引擎不可用(`rea doctor` 显示 `unsupported_host` + `missing_analysis_engine`),因此本次为**离线静态分析**(PE 结构、资源、字符串、OLE/MSI 数据库),**不做反编译** |

`rea` 在本任务中的实际表现(顺带验证了它自己的技能文档):

```bash
rea inspect-artifact ./Vcdmind-0.4.15-x64.msi --json
# -> {"code":"target_unavailable","message":"Cannot open artifact: unsupported binary format..."}
#    REA 的归档/包清单(DMG/ZIP/APK/IPA/MSIX/AppX)不含 MSI,MSI 需要自己先解 OLE/CAB

rea inspect-pe-resources ./extracted/Path --json
# -> 成功:返回 evidence_id、sha256、资源目录表、6 个图标组(RT_GROUP_ICON)等结构化证据
```

> 注:REA 技能文档(SKILL.md)提到 `inspect_go_binary`,但该子命令不在 6.4.0 的 CLI 命令面内(CLI 129 项里无 `go`)——它的 SKILL.md 自己也提醒过"仓库 main 上的技能可能描述比 npm 发行版更新的能力"。

### 复现脚本

仓库内 `tools/extract_msi.py` 可一键复现全部提取(不执行目标):

```bash
python3 tools/extract_msi.py Vcdmind-0.4.15-x64.msi --out work/
# [*] MSI sha256=74747ddf…  48 个 OLE 流 -> work/streams.txt
# [*] 23 张数据库表 -> work/msi-tables.json
# [*] cabinet 载荷 -> work/payload/{vcdmind-desktop.exe, vcdmind-mcp.exe, README.md, .gitkeep×2}
```

---

## 2. MSI 静态结构

MSI 是 OLE 复合文档,内部流名被 Windows Installer 的"MIME base64"方案编码(如 `䓤䞳䄦䠥` 实为 `app.cab`)。用 `pymsi.streamname.decode_unicode` 还原后共 48 个流:

| 大小 | 流名 | 说明 |
| --- | --- | --- |
| 20,823,703 | `app.cab` | 唯一载荷 cabinet |
| 135,440 | `Binary.WixUIWixca` | WiX UI 自定义动作 DLL |
| 68,468 / 2,746 | `Binary.WixUI_Bmp_Dialog` / `_Banner` | 安装界面位图 |
| 62,654 | `Icon.ProductIcon` | ARPPRODUCTICON |
| … | 各 `TABLE xxx` | `_StringPool`、`Control`、`_Validation` 等数据库表 |

### 2.1 包元数据(SummaryInformation)

| 字段 | 值 |
| --- | --- |
| 打包工具 | **Windows Installer XML Toolset 3.14.1.8722 (WiX v3)** |
| 构建时间 | 2026-10-09 04:04:34 UTC |
| 标题 / 主题 | Vcdmind / vcdmind |
| 模板 | `x64;0`(64 位) |
| 代码页 | 936(简体中文 GBK),`ProductLanguage = 2052` |
| 修订号 / schema | 450 |

### 2.2 产品与安装行为

| 项目 | 值 |
| --- | --- |
| ProductName / Version | `Vcdmind` / `0.4.15` |
| Manufacturer | `vcdmind` |
| ProductCode | `{81FEB1BD-6A64-4702-80EF-FB297C593688}` |
| UpgradeCode | `{4C5A7743-46B5-5D28-A49F-038AB01E5DC8}` |
| PackageCode | `{35840546-4AF8-4581-8AC5-E6A636358713}` |
| 安装目录 | `Program Files\Vcdmind` |
| 功能(Feature) | `MainProgram`(Application)、`ShortcutsFeature`、`Environment`(写入 PATH)、`External` |
| 快捷方式 | 开始菜单 + 桌面 `Vcdmind`;`Uninstall Vcdmind`(msiexec /x) |
| 协议注册 | `vcdmind://`(HKCU `Software\Classes\vcdmind`,`"<安装路径>" "%1"`) |
| 注册表 | `HKLM\Software\vcdmind\Vcdmind`(`InstallDir`、快捷方式标记) |
| 升级策略 | `RemoveExistingProducts` @1501、`WIX_UPGRADE_DETECTED`、SecureCustomProperties |
| WebView2 | `AppSearch` 探测 `{F3017226-…}` 版本;缺失则执行 CA `DownloadAndInvokeBootstrapper`(Type 1058 PowerShell)从 `https://go.microsoft.com/fwlink/p/?LinkId=2124703` 下载 `MicrosoftEdgeWebview2Setup.exe` 静默安装 |
| 安装完成 | CA `LaunchApplication`(`[LAUNCHAPPARGS]`,条件 `AUTOLAUNCHAPP AND NOT Installed`) |
| 签名 | **无**:MSI 无 `\x05DigitalSignature` 流 |

### 2.3 File 表 → 真实载荷(共 5 个)

| File 主键 | 安装后路径 | 字节数 | SHA-256(前 16) |
| --- | --- | --- | --- |
| `Path` | `vcdmind-desktop.exe` | 40,869,376 | `2c9fb63a73ef32c5…` |
| `PathFile_Ia1efe…` | `resources\bin\vcdmind-mcp.exe` | 6,422,016 | `18aaf770f166332e…` |
| `PathFile_Ie234a…` | `resources\assistant-skills\README.md` | 287 | `cc15d64bc56dd2ed…` |
| `PathFile_I0979…` | `resources\bin\.gitkeep` | 0 | `e3b0c442…`(空文件) |
| `PathFile_Ie1081…` | `resources\assistant-skills\.gitkeep` | 0 | `e3b0c442…`(空文件) |

> 两个 `.gitkeep` 说明这两级目录原本是 **git 仓库镜像**;官方技能的"正文"确实没有随包发货。

---

## 3. 两个载荷的技术指纹

| | `vcdmind-desktop.exe` | `vcdmind-mcp.exe` |
| --- | --- | --- |
| 体积 / 格式 | 40.9 MB,PE32+ x64,6 节区 | 6.4 MB,PE32+ x64,8 节区 |
| 时间戳 | 1791518670 ≈ 2026-10-09 | 0(被抹除) |
| 技术栈 | **Tauri 2.11.1 + Rust + React/Vite SPA**(WebView2) | **Go 1.26.4**(`GOOS=windows GOARCH=amd64 CGO_ENABLED=0`) |
| 关键内嵌资源 | 292 个 `/assets/*` 前端资源(React 页面 + Monaco 语言包) | — |
| 插件 | `tauri-plugin-updater 2.10.1`、`deep-link 2.4.9`、`clipboard-manager 2.3.3`、`muda 0.19.1` | — |
| 自签名 | 无 | 无 |

桌面端内嵌前端页面(节选命名即可看出产品形态):`AssistantSessionPanel`、`AssistantPanelHost`、`AssistantModelPanel`(AI 助手)、`SmartEditorPage`、`WorkspaceMonacoPane`、`CreationSpacePage`、`DocumentEditorPage`、`WorkflowCatalogPage / WorkflowDetailPage / WorkflowWorkbench / WorkflowPackageDownloadModal`、`CourseAcademyPage` 系列、`ProjectsPage`、`WritingHomePage`、`ProductionValidationPage`,以及 `mermaid.min.js`、`echarts.min.js`、约 40 个 Monaco 语法包(`abap…vhdl`)。

> 限制:前端资源内容为压缩态(brotli/zlib/gzip/raw-deflate/zstd/lzma 在路径后各偏移均无法解出),**未能反编译前端源码**,因此技能市场 UI 只能从字符串与字段名侧写。

---

## 4. 核心:技能(Skill)体系逆向

### 4.1 先划边界——MCP ≠ Skill

| 通道 | 二进制 | 能力 |
| --- | --- | --- |
| 平台 MCP 服务器 | `vcdmind-mcp.exe`(Go) | 5 个工具:`web_search`、`image_generate`、`list_templates`、`save_document`、`start_video_creation`。全量检索 `skill`(不分大小写)= **0 命中** |
| 应用内技能体系 | `vcdmind-desktop.exe`(Rust) | 技能库、技能市场、技能编辑、脚本执行、注入助手的中文工具说明 |

桌面端亦**没有 MCP 协议特征串**(`mcpServers`、`protocolVersion`、`tools/call`、`2025-06-18`、`2024-11-05`、`notifications/initialized` 全部 0 命中;`jsonrpc` 的 41 次命中全部来自内嵌的 Monaco/vscode-jsonrpc JS)。结论:**技能工具是桌面应用内置 AI 助手(会话 `assistant-session`)的内部工具**,经由 Tauri 命令实现,而不是通过 MCP 暴露给外部 Agent。

### 4.2 一个技能(Skill)的构成

Rust 侧源码模块位置(字符串泄漏):`src\assistant\skills.rs`、`src\assistant\skill_script.rs`、`src\assistant\skill_market.rs`。

从二进制中提取到的技能定义要素(偏移见 §7):

```
SKILL.md          ← 技能唯一必需文件(技能本体/说明书)
mjs cjs py sh     ← 允许作为技能脚本的扩展名白名单
.vcdmind-origin   ← 来源标记文件(市场/官方安装写入)
name description enabled official label category scenes   ← 技能索引元数据字段
skill-library                                  ← 本地技能库根目录名
```

目录形态推断为:

```
<应用数据目录>/skill-library/
└── <技能名>/                 # 目录名必须与 SKILL.md 中的技能名一致
    ├── SKILL.md              # 必需:技能说明书(正文)
    ├── <其他>.md             # 可选:被正文引用的补充说明(按需读取)
    ├── <脚本>.mjs|cjs|py|sh  # 可选:白名单扩展名(脚本子目录名未在静态证据中出现,推断与正文同级或由代码拼装)
    └── .vcdmind-origin       # 来源标记
```

技能名一致性校验的原文报错是:

> `技能名不一致:目录是 X,说明里写的是 Y。`

写入限制的原文报错是:

> `只能修改技能里的 markdown 文件。`

即:用户/AI 可以改技能的说明书 markdown,但**不能改脚本**——脚本是甲方签名交付物的一部分。

### 4.3 技能包的安装校验流水线(最强证据)

`skill_market.rs` 中保留了整条流水线的中文报错,可逐条还原校验顺序:

| 顺序 | 报错原文 | 含义 |
| --- | --- | --- |
| 1 | `打开技能包失败:` / `读取技能包条目失败:` | 打开 zip、逐条读条目 |
| 2 | `技能包不是有效 zip:` | 非法 zip |
| 3 | `技能包必须只包含一个顶层目录。` | 必须单一顶层目录 |
| 4 | `技能包解压后缺少顶层目录。` / `技能包顶层目录缺少 <X>。` | 缺顶层目录或缺必需文件 |
| 5 | `技能包顶层目录(X)与目录条目(Y)不一致。` | 顶层目录名与技能条目名不一致(对应的严格校验见下行) |
| 5b | `技能名不一致:目录是 X,说明里写的是 Y。` | 目录名必须等于 SKILL.md 里声明的技能名 |
| 6 | `技能包解压后超过 128MB 上限。` | 解压体积 ≤128 MB |
| 7 | `技能包含超过 32MB 的文件:` | 单文件 ≤32 MB |
| 8 | `技能包文件数超过 <N> 上限。` | 文件数量上限 |
| 9 | `技能包含不支持类型的文件:` | 扩展名/类型白名单 |
| 10 | `技能包缺少 sha256,已取消安装。` / `技能包校验失败:sha256 不一致,已取消安装。` | 强校验下载包完整性 |
| 11 | `技能安装忙,请稍后重试。` | 并发安装互斥 |
| — | 代码层还跳过 `__MACOSX`、`.DS_Store`(`__MACOSX` / `.DS_Stor` 出现在同一段校验代码的机器码中) | zip 垃圾条目过滤 |
| — | `技能名不合法。` | 技能名规范化校验 |

市场接口与鉴权(同段字符串):

```
GET  /api/assistant/skills
POST /api/assistant/skills/{技能}/versions/{版本}/download
登录后才能查看官方技能。
登录后才能安装官方技能。
版本不能为空。                 (安装时 version 必填)
技能包下载地址为空。 / 技能目录返回格式不正确(file_count、release_notes)
-.zip
```

技能列表项字段:`label`、`category`、`description`、`scripts`、`interpreter`、`fileCount`、`releaseNotes`、`installed`、`installedVersion`、`updatable`、`canUninstall`、`version`,以及解压临时目录标记 `-extract-`。

### 4.4 运行时:助手如何"用"技能

技能不是整篇塞进上下文,而是**按需两步取用**。二进制里保存了注入给模型的中文说明原文:

```
目录清单:没有正文以外的文件。
目录清单(只列路径,文件正文没有读入):
正文点到的说明,用 load_skill 的 file 再读那一个文件。
脚本用 run_skill_script 执行,不要把脚本源码读进对话。
(含 N 个脚本)
文件超过 N 字节上限。
技能不存在:
其他脚本说明
需要 shell
需要 Python
```

配套的 Tauri 命令(桌面端 IPC)与参数:

| 命令 | 参数 | 作用 |
| --- | --- | --- |
| `assistant_skill_index` | — | 技能索引(目录清单,只列路径) |
| `assistant_skill_detail` | — | 单个技能详情 |
| `assistant_skill_markdown_files` | `name` | 列出技能内 markdown 文件 |
| `assistant_skill_scripts` | — | 列出可执行脚本 |
| `assistant_skill_run_script` | `skill`、`script`、`args`、`stdin`、`timeoutMs` | 执行技能脚本 |
| `assistant_skill_write_markdown` | `file`、`body` | 修改技能 markdown(仅 markdown) |
| `assistant_skill_editor_read_file` | — | 技能编辑器读文件 |
| `assistant_skill_market_list` | — | 市场列表 |
| `assistant_skill_market_install` | `version` | 安装/升级 |
| `assistant_skill_market_uninstall` | — | 卸载 |

> 注:上表中 `assistant_skill_index` 由字符串池的交错片段还原(该命令名在二进制里与其他命令名首尾重叠存储),
> 其余命令名均有完整字面量可直接引用。

对应模型可见的两个工具名:**`load_skill`(带 `file` 参数)** 与 **`run_skill_script`**,即"读说明书"和"跑脚本"分离——这也解释了为什么说明里强调"不要把脚本源码读进对话"(脚本看源码既费 token 又有注入风险,只执行)。

### 4.5 脚本执行细节

```
skill_script.rs:
  where                ← 用 where 探测解释器
  python3 / python     ← Python 解释器探测
  sh / bash            ← shell 探测
  taskkill /PID /T /F  ← Windows 上按进程树强杀(超时/取消)
  错误码:skill_not_found、script_failed、interpreter_missing
  报错:启动脚本失败: / 等待脚本失败: / 读取脚本输出失败:
  报错:脚本需要 Python,但本机没有找到 python3 / python。
  报错:脚本需要 shell,但本机没有找到 sh / bash。
  报错:不认识的脚本扩展名:.        (白名单外)
  报错:技能 X 里没有可执行的脚本 Y(只允许白名单扩展名)。
  报错:该技能没有可执行脚本、该技能可执行的脚本:
  报错:选择项目保存目录  /  ./
```

技能库在启动时会被"准备",失败则上报事件:

```
desktop.assistant.skills.prepare_failed
failed to prepare assistant skill library:
```

脚本执行时会**收窄环境变量**(沙箱化):只透传
`PATH`、`HOME`、`TMPDIR`、`TEMP`、`TMP`、`LANG`、`LC_ALL`、`USERPROFILE`;
执行结果结构为 `exitCode`、`stdout`、`stderr`、`stdoutTruncated`、`stderrTruncated`、
`timedOut`、`durationMs`、`interpreter`(即输出有截断标记、有超时标记、并回填解释器身份);
另有错误码 `script_not_allowed`(白名单外脚本)。

### 4.6 技能在文件系统中的位置与 AI 助手的虚拟文件系统

助手侧文件访问是**按根名收口的虚拟文件系统**(VFS),相关原文:

```
/workspace   /skills   /creation   /project        ← 可用根
路径必须以根名开头,例如 /workspace/notes.md
未知根 :可用根为 / /
路径越界:只能访问根内文件
路径必须是根内的相对路径
路径不能包含 ..(根外不可达)
不能写入符号链接
不能读写资料夹系统目录
读取 /project 需要先打开一个剪辑项目
写作库写入请用 save_document:/creation 在文件系统里是只读的
```

即:本地 `skill-library/` 被挂载成助手的 **`/skills`** 根;项目剪辑 `/project`、写作库 `/creation`(只读)、工作区 `/workspace` 各占一个根。技能 = "给 AI 的一份可执行说明书目录",通过 `/skills` 暴露。

### 4.7 MSI 自带的技能说明(原文,287 字节)

`resources\assistant-skills\README.md` 全文:

```markdown
# 官方助手技能

技能源码在平台仓旁边的 `vcdmind-skills`。桌面「官方技能」只从服务端拉取,不再使用这份资源目录作为安装源。

发布流程:Admin 新建技能条目 → 在技能仓 `make upload SKILL=<id>` → 详情页发布并上架。
```

并且 `assistant-skills` 这个目录名在 `vcdmind-desktop.exe` 中 **0 命中**——印证了"已废弃"的说法:技能的发货渠道是**服务端 + 桌面端技能市场**,不是安装包。

### 4.8 与 REA 自身 skill 结构的对照

| 维度 | Vcdmind(本次逆向对象) | REA(morluto/rea,对照) |
| --- | --- | --- |
| 文件载体 | `skill-library/<name>/SKILL.md` + 脚本 | `.agents/skills/<name>/SKILL.md` + `references/*.md` |
| 元数据 | `name/description/enabled/official/label/category/scenes` + 市场字段 | YAML frontmatter(`name`、`description`、`metadata.version`) |
| 扩展内容 | **可执行脚本**(`mjs/cjs/py/sh`),白名单 + 解释器探测 + 超时强杀 | 纯说明文档 + 按需读取的参考文档 |
| 分发 | 服务端技能市场(zip + sha256 + 体积/数量/类型校验) | 仓库内随包发布(`npx rea-agents setup` 安装技能) |
| 给模型的用法 | `load_skill(file=…)` 按需读说明;`run_skill_script(...)` 跑脚本且**不读脚本源码** | 建议加载 SKILL.md,再按引用读取 references |
| 共同点 | 都用 **SKILL.md 作为技能入口**、都强调**按需/渐进加载**、都把"说明"与"可执行能力"分层 | 同 |

---

## 5. 安全与隐私观察(供参考)

1. **供应链**:MSI、`vcdmind-desktop.exe`、`vcdmind-mcp.exe` 均**无 Authenticode 签名**;安装过程不做签名校验,技能包仅校验 sha256(可被中间人替换下载地址后进行一致替换)。
2. **安装期外联**:仅在缺少 WebView2 时访问 `go.microsoft.com` 下载官方引导器。
3. **运行期外联**:`https://api-vcdmind.bokecity.com`(另有开发/预发 `http://127.0.0.1:3009`、`.vcdmind-dev`、`.vcdmind-staging` 判定),凭据落盘于 `credentials.json`,设置落盘于 `vcdmind-desktop-settings.json`(`vcdmind-desktop-settings-v1`),含 `assistantByokApiKey`(BYOK)、`dshEnabledSkills` 等字段。
4. **本地回环服务**:`src\workflow_runtime\tool_bridge.rs` 会在 `127.0.0.1:0`(随机端口)起 HTTP + SSE 服务(`text/event-stream`),用于本地工具桥接(`tool_requirements.json`、`adapter_ref`、`draftkit.compose/verify/install`、`video.render`),并有协议头 `X-Workflow-Studio-Protocol-Version: 2026-05-03`。
5. **脚本执行面**:技能脚本会在用户机器上以 `python3` / `sh` / `node` 执行,超时后用 `taskkill /PID /T /F` 结束进程树;白名单扩展名(`mjs/cjs/py/sh`)与"只执行不读源码"是主要的收敛手段。
6. **可执行能力边界**:技能可以驱动 ffmpeg/ffprobe、Python 图像/动画渲染、Chromium 截图等本地能力(见 `video.render`、`python-animation` 等字符串),因此"安装第三方技能"等价于**在本机引入可执行代码**,风险等级应按此评估。

---

## 6. 复现步骤

```bash
# 1) 安装 REA 工具
npm install -g rea-agents@latest && rea --version     # 6.4.0

# 2) REA 能直接做的:PE 资源清单(带 evidence_id / sha256)
rea inspect-pe-resources work/payload/vcdmind-desktop.exe --json

# 3) MSI 本体需先自解析(OLE + MIME-base64 流名 + cabinet)
pip install --break-system-packages olefile pymsi cabarchive
python3 tools/extract_msi.py Vcdmind-0.4.15-x64.msi --out work/

# 4) 技能体系字符串取证
strings -n 6 work/payload/vcdmind-desktop.exe | grep -E 'skill|SKILL'
python3 - <<'PY'
d=open("work/payload/vcdmind-desktop.exe","rb").read()
print(d.count(b"load_skill"), d.count(b"run_skill_script"))   # -> 1 1
print(d.count(b"skill"))                                      # 见证据文件
PY
```

---

## 7. 证据索引(仓库内 `evidence/`)

| 文件 | 内容 |
| --- | --- |
| `evidence/hashes.json` | MSI / app.cab / 两个 exe / README.md 的字节数与 SHA-256 |
| `evidence/msi-tables.json` | Property、File、Component、Directory、Feature、CustomAction、Registry、AppSearch、Upgrade 等 17 张表的完整行 |
| `evidence/desktop-skill-strings.txt` | `vcdmind-desktop.exe` 中技能相关字符串(带文件偏移),共 35 条 |
| `evidence/mcp-catalog.md` | Go MCP 服务器事实清单(模块、构建参数、包结构、5 个工具与描述原文、否定结论) |

关键偏移速查(`vcdmind-desktop.exe`,SHA-256 `2c9fb63a…`):

| 偏移 | 内容 |
| --- | --- |
| `0x19a4b90`–`0x19a4f00` | 技能定义要素与注入模型的中文说明(`SKILL.md`、`mjs cjs py sh`、`load_skill`、`run_skill_script`、`name description enabled official label category scenes`、`.vcdmind-origin`、"不要把脚本源码读进对话") |
| `0x19bca90`–`0x19bcd00` | 脚本执行与解释器探测(`interpreter_missing`、`taskkill /PID /T /F`、Python/shell 报错) |
| `0x19b4d18`–`0x19b4e30` | 官方技能鉴权与下载(`GET /api/assistant/skills`、"登录后才能查看/安装官方技能") |
| `0x2032198`–`0x2032600` | 技能包校验流水线(`128MB`、`32MB`、`sha256`、顶层目录、`.vcdmind-origin`) |
| `0x2040718` / `0x2040d63` / `0x2040e7c` | Tauri 命令名:`assistant_skill_market_list` / `assistant_skill_run_script` / `assistant_skill_detail` |

---

## 8. 未解事项(诚实声明)

1. `dshEnabledSkills` 中的 `dsh` 前缀含义未确定(疑似产品内部对助手/门控位的叫法)。
2. 前端技能市场 UI 的具体交互未能反编译(前端资源为压缩态,标准解压格式均未命中)——本报告的字段名与流程来自 Rust 侧字符串与命令签名。
3. `load_skill` / `run_skill_script` 是否为**外部 Agent**(Claude Code/Codex 等)可调用的 MCP 工具,证据倾向"否"(Go MCP 无技能字符串、桌面端无 MCP 协议串),但不能排除桌面端用非标准协议把技能转接给外部 Agent。
4. 未执行安装程序,故未观测运行时行为(注册表、网络请求、技能库真实落盘路径);分析全部来自静态证据。
