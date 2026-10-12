# `start_video_creation` 完整契约(反汇编提取)

> 来源:`Vcdmind-0.4.15-x64.msi` → `app.cab` → `resources/bin/vcdmind-mcp.exe`
> SHA-256:`18aaf770f166332e02974e7f479f52ed2e249773b41f7c045c16ff39077da40f`
> 方法:解析 Go pclntab 定位函数 → capstone 反汇编 → 解出被引用的字符串字面量与静态字符串头。
> 提取器:`tools/extract_mcp_tool.py`;原始轨迹:`evidence/mcp-schema-trace.txt`。

## 1. 它是什么

`start_video_creation` 是 MCP 服务器暴露的 **5 个工具**之一,处在"平台创作流"的最后一步:

```
web_search        (可选)平台联网搜索
image_generate    (可选)平台生图      → 按 image_poll_timeout 轮询 /api/ai/images/jobs/{id}
list_templates    列出创作模板        → GET /api/creation/templates      → 得到 template_code
save_document     保存稿件到写作库    → POST /api/creation/documents     → 得到 document_id
start_video_creation  ★ 用「已有稿件 + 模板」生成一个**桌面深链**,交给 app 去发起视频创作
```

工具描述原文(二进制字面量,逐字):

> Return a desktop deep link that opens vcdmind with a saved document and a creation template.
> The document must already exist in the creation library.

**关键点:它自己不做视频渲染。** 它只负责把「稿件 + 模板」拼成一个**深链**,由桌面应用接管后续流程。
所以它必须与 `save_document` / `list_templates` 配套使用(参数说明里也是这么写的)。

## 2. 入参 schema(观察值,非推测)

来自 `tools.Catalog` 反汇编:`start_video_creation` 的 schema 由 `map[string]any` 静态构造,
属性名为字面量、说明为静态字符串头(ptr,len 对),均已被解出:

```json
{
  "type": "object",
  "properties": {
    "document_id": {
      "type": "string",
      "description": "Creation document id from save_document"
    },
    "template_code": {
      "type": "string",
      "description": "Creation template code from list_templates"
    }
  },
  "required": ["document_id", "template_code"],
  "additionalProperties": false
}
```

证据细节:

| 项 | 证据 |
| --- | --- |
| 属性名 `document_id` | `0x140261d8c  LEA len=11 "document_id"` → `mapassign_faststr` |
| 属性名 `template_code` | `0x140261e82  LEA len=13 "template_code"` → `mapassign_faststr` |
| 类型 | 两次 `"string"` 静态字符串头(`0x140261d2b` / `0x140261e1a`) |
| 说明 1 | `0x140261d72  STRVAL "Creation document id from save_document"` |
| 说明 2 | `0x140261e68  STRVAL "Creation template code from list_templates"` |
| `required` | `mov ebx,2; mov rcx,rbx` → `makeslice([]string,2,2)`;且属性表只有这两项,handler 校验文案即 `document_id and template_code required` |
| `additionalProperties` | 键名在 `0x14026202a`,值为静态布尔字节 `0x00`(= false) |

## 3. Handler 行为(`tools.Handler.startVideoCreation`,2496 字节 / 454 条指令)

调用轨迹(节选,按地址顺序):

```
0x14025f8c1  CALL tools.decodeArgs              # 参数解码进结构体
0x14025f9f1  CALL strings.TrimSpace             # ×4:对字符串参数去首尾空白
0x14025fa12  CALL strings.TrimSpace
0x14025fa37  CALL strings.TrimSpace
0x14025fa60  CALL strings.TrimSpace
0x14025fca3  LEA  "document_id"
0x14025fd1c  LEA  "asset_id"
0x14025fd94  LEA  "title"
0x14025fe0a  LEA  "template_code"
0x14025fe84  LEA  "template_name"
0x14025fefc  LEA  "desktop_url"
0x14025ff68  CALL encoding/json.MarshalIndent    # 组装 JSON 体
0x1402600df  LEA  "document_id and template_code required"   # 校验失败文案
```

- **校验**:两个字段去空白后都必须非空,否则报 `document_id and template_code required`。
- **请求**:组装 JSON 体并 POST 到 **`/api/creation/launches`**(该路径字面量在同一二进制的 API 层,
  紧邻错误串 `image job %s timed out`)。
- **返回**:`api.Launch` 结构体,字段(json tag)为
  `model,omitempty` / `count,omitempty` / `documentId` / `sourceType` / `title,omitempty` / **`desktopUrl`**。
  即工具返回的深链在 `desktopUrl`;桌面端另有 snake_case 形式 `desktop_url`(见 handler 引用)。

## 4. 深链契约(桌面端侧的证据)

`vcdmind-desktop.exe` 中同一区域内出现:

```
deep_link.create      desktop.shell      vcdmind-create-launch
document_id=  template_code=
event "deep-link://new-url"     payload: documentId  templateCode
```

配合 MSI 已注册的 `vcdmind://` 协议(`HKLM\Software\Classes\vcdmind`),可确定深链形态:

```
vcdmind://create-launch?document_id=<id>&template_code=<code>
```

> 说明:`scheme + action + 两个 query 参数`是观察到的;**具体分隔符与参数序列化顺序为推断**
> (桌面端以 `document_id=` / `template_code=` 前缀解析)。

## 5. 复刻实现(已在参考实现里落地)

`replica/mcp_stdio_server.py` 现已按观察值实现:

```python
if name == "start_video_creation":
    document_id = (args.get("document_id") or "").strip()
    template_code = (args.get("template_code") or "").strip()
    if not document_id or not template_code:
        return fail("document_id and template_code required", "invalid_args")
    deep_link = f"vcdmind://create-launch?document_id={document_id}&template_code={template_code}"
    return ok(json.dumps({"desktop_url": deep_link}), {"desktop_url": deep_link, ...})
```

配套命令:

```bash
# 看它的真实 schema(直接从二进制提取)
python3 tools/extract_mcp_tool.py msi-work/extracted/PathFile_Ia1efe2d2bafd4b44896a1f69296da31f \
        --func startVideoCreation

# 走一遍 MCP 会话(含正例与缺参反例)
python3 replica/mcp_client_test.py
```

## 6. 附:同一次提取得到的其余 4 个工具 schema(观察值)

| 工具 | 属性 | 类型 | 说明原文 |
| --- | --- | --- | --- |
| `save_document` | `title` / `content` / `asset_type` / `space_id` | string / string / string(**enum: copywriting, script**) / string | "Document title" / "Markdown manuscript body" / "Asset type" / "Optional creation space id; omitted uses the personal space" |
| `web_search` | `query` / `max_results` / `time_range` | string / integer / string | "Search query" / "Maximum results, default 5" / "Optional time range such as week or month" |
| `image_generate` | `prompt` / `model` / `size` / `count` | string / string / string / integer | "Image prompt" / "Optional platform image model code" / "Optional size such as 1024x1024" / "Number of images, default 1" |
| `list_templates` | `keyword` / `category` / `platform` / `output_type` | string ×4 | "Optional keyword" / "Optional category" / "Optional platform such as douyin" / "Optional output type such as mp4" |

4 个 schema 均带 `"type": "object"` + `"properties"` + `required` + `additionalProperties`(最后一项同 `start_video_creation`)。
其中 `save_document` 的 `asset_type` 是唯一的枚举(与工具描述里的 "asset_type must be copywriting or script" 一致)。
