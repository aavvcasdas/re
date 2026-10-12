# vcdmind-mcp.exe —— Go MCP 服务器事实清单

来源:`Vcdmind-0.4.15-x64.msi` → `app.cab` → `resources/bin/vcdmind-mcp.exe`
- 字节数:6,422,016
- SHA-256:`18aaf770f166332e02974e7f479f52ed2e249773b41f7c045c16ff39077da40f`
- PE32+ x86-64,8 个节区,无 Authenticode 签名

## Go 构建信息(从二进制内提取)

| 项目 | 值 |
| --- | --- |
| 模块路径 | `vcdmind.dev/mcp` |
| 入口包 | `vcdmind.dev/mcp/cmd/vcdmind-mcp` |
| Go 版本 | `go1.26.4` |
| 目标平台 | `GOOS=windows` `GOARCH=amd64` |
| CGO | `CGO_ENABLED=0` |
| 源码根 | `C:/Program Files/Go/src` |

## 包结构(来自符号表)

```
vcdmind.dev/mcp/cmd/vcdmind-mcp        # main
vcdmind.dev/mcp/internal/config        # Load / File / readFile / envMap / firstNonEmpty
vcdmind.dev/mcp/internal/rpc           # ReadMessage / WriteMessage / Request / NewResult / NewError
vcdmind.dev/mcp/internal/server        # Server
vcdmind.dev/mcp/internal/api           # Client / Template / Document / ImageJob / WebSearchResult ...
vcdmind.dev/mcp/internal/tools         # Catalog / Handler / *Args / objectSchema / stringProp ...
```

传输层为 `rpc.ReadMessage` / `rpc.WriteMessage`(stdio JSON-RPC),配置来自
`VCDMIND_CONFIG` 环境变量或配置文件(`internal/config.Load`)。

## 对外工具目录(5 个)

工具名与描述字符串均直接来自二进制(`Handler.*` 为对应处理函数):

| 工具名 | 处理函数 | 描述(原文) |
| --- | --- | --- |
| `web_search` | `Handler.webSearch` | Optional paid web search via vcdmind. Skip this tool if the user does not want platform search. |
| `image_generate` | `Handler.imageGenerate` + `Handler.waitImageJob` | Optional paid image generation via vcdmind. Skip this tool if the user does not want platform images. |
| `list_templates` | `Handler.listTemplates` | List published vcdmind creation templates. Does not include paid prompts or workflow internals. |
| `save_document` | `Handler.saveDocument` | Save a finished manuscript into the user's vcdmind creation library so it can be used as a video workflow manuscript. Call only when the user explicitly asks to keep the manuscript or start video creation. asset_type must be copywriting or script. |
| `start_video_creation` | `Handler.startVideoCreation` | Return a desktop deep link that opens vcdmind with a saved document and a creation template. The document must already exist in the creation library. |

工具注册表:`tools.Catalog`;参数声明辅助函数:`objectSchema` / `stringProp` /
`integerProp` / `enumProp`;参数结构体:`webSearchArgs`、`imageGenerateArgs`、
`listTemplatesArgs`、`saveDocumentArgs`、`startVideoArgs`、`decodeManuscriptArgs`。
错误路径:`unknown tool`、`unknown method`。

## 关键否定结论

对 `skill`(大小写不敏感)、`load_skill`、`run_skill_script`、`SKILL.md`、
`vcdmind-skills` 做全量字符串检索:**命中数均为 0**。

也就是说,MSI 里的这个 Go MCP 服务器**不承载任何技能(Skill)能力**;
技能体系完全位于桌面端 Tauri 应用 `vcdmind-desktop.exe` 中。
