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
错误路径:`unknown tool`、`unknown method`、`insufficient_balance`、`platform_failed`。

### 参数 schema(观察值,已逐字段解出)

方法是反汇编 `tools.Catalog`(6784 B),识别 `mapassign_faststr` 的键字面量与
静态字符串头 `(ptr,len)`;轨迹见 `evidence/mcp-schema-trace.txt`,
`start_video_creation` 的专项报告见 `evidence/mcp-tool-start_video_creation.md`。

| 工具 | 参数(类型) | 说明原文 | required |
| --- | --- | --- | --- |
| `web_search` | `query`(string)、`max_results`(integer)、`time_range`(string) | "Search query" / "Maximum results, default 5" / "Optional time range such as week or month" | `query` |
| `image_generate` | `prompt`(string)、`model`(string)、`size`(string)、`count`(integer) | "Image prompt" / "Optional platform image model code" / "Optional size such as 1024x1024" / "Number of images, default 1" | `prompt` |
| `list_templates` | `keyword`、`category`、`platform`、`output_type`(均 string) | "Optional keyword" / "Optional category" / "Optional platform such as douyin" / "Optional output type such as mp4" | — |
| `save_document` | `title`、`content`、`asset_type`(**enum: copywriting, script**)、`space_id` | "Document title" / "Markdown manuscript body" / "Asset type" / "Optional creation space id; omitted uses the personal space" | `title`,`content`,`asset_type` |
| `start_video_creation` | `document_id`、`template_code`(均 string) | "Creation document id from save_document" / "Creation template code from list_templates" | `document_id`,`template_code` |

4 个 schema 均含 `type=object`、`properties`、`required`、`additionalProperties=false`。

### `start_video_creation` 的执行链(观察值)

`tools.Handler.startVideoCreation`(2496 B)调用轨迹:
`tools.decodeArgs` → `strings.TrimSpace` ×4 → `encoding/json.MarshalIndent`,
随后 **POST `/api/creation/launches`**;本地校验文案 `document_id and template_code required`;
返回 `api.Launch`(`model`/`count`/`documentId`/`sourceType`/`title`/`desktopUrl`)。
桌面端同区字符串:`deep_link.create`、`vcdmind-create-launch`、`document_id=`、`template_code=`、
`deep-link://new-url` → 深链 `vcdmind://create-launch?document_id=…&template_code=…`。
**它本身不渲染视频**,只产出深链交给桌面应用继续。

## 关键否定结论

对 `skill`(大小写不敏感)、`load_skill`、`run_skill_script`、`SKILL.md`、
`vcdmind-skills` 做全量字符串检索:**命中数均为 0**。

也就是说,MSI 里的这个 Go MCP 服务器**不承载任何技能(Skill)能力**;
技能体系完全位于桌面端 Tauri 应用 `vcdmind-desktop.exe` 中。
