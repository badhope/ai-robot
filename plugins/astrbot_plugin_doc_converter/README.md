# astrbot_plugin_doc_converter

一个面向聊天场景的通用文档 / 图片转换器插件，通过一条 `/convert` 指令即可在 AstrBot 中完成绝大多数常见格式互转与 OCR 识别。

支持 PDF ↔ Word / Excel / PPT / Markdown / 图片，Markdown ↔ HTML，图片格式互转（PNG / JPG / WebP / AVIF / GIF / BMP），以及图片与扫描 PDF 的 OCR。

## 功能特性

- 一条指令搞定：`/convert + 文件` 自动选择最佳目标格式
- 显式控制：`/convert --to=<fmt> + 文件` 强制指定目标格式
- 智能默认：PDF 含文字层时优先转 Word；扫描件自动 OCR 出文本
- 纯 Python 优先：无外部依赖时仍可工作，LibreOffice / Tesseract 可选安装以解锁更完整能力
- 自动降级：OCR 同时支持 Tesseract 与 RapidOCR（ONNX），按环境自动选择
- 配置项可在 AstrBot WebUI 中调整

## 快速开始

在聊天中发送 `/convert` 指令并附带一个文件：

```
/convert                  # 智能转换
/convert --to=md          # 强制转换为 Markdown
/convert --formats        # 列出当前文件可转换的所有格式
/convert --tools          # 查看环境依赖检测结果
/convert --help           # 帮助
```

支持的文件类型：PDF、Word（docx）、Excel（xlsx）、PPT（pptx）、Markdown / txt、HTML、PNG、JPG、WebP、GIF、BMP、AVIF、TIFF。

## 支持的转换

| 源格式  | 目标格式                                      | 依赖                          |
| ------- | --------------------------------------------- | ----------------------------- |
| pdf     | docx, md, txt, png, jpg                       | pdf2docx, pymupdf, pymupdf4llm |
| docx    | pdf                                           | LibreOffice（缺失则失败）      |
| xlsx    | pdf                                           | LibreOffice                   |
| pptx    | pdf                                           | LibreOffice                   |
| md      | html, pdf                                     | markdown, weasyprint          |
| html    | pdf                                           | weasyprint                    |
| txt     | md                                            | 内置                          |
| image   | png, jpg, webp, gif, bmp                      | Pillow                        |
| image   | txt（OCR）, md（OCR）                         | Tesseract 或 RapidOCR          |
| pdf（扫描） | txt（OCR）, md（OCR）                     | Tesseract 或 RapidOCR          |

智能默认规则：

- PDF（含文字层）→ docx
- PDF（扫描件） → txt
- Word / Excel / PPT → pdf
- Markdown → html
- HTML → pdf
- 图片 → png
- txt → md

## 安装

### 1. 放置插件

将本目录放置到 AstrBot 的插件目录，或在 WebUI 的"插件市场 → 上传插件"中上传压缩包。

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. （可选）安装外部工具以解锁更多能力

- **LibreOffice**：用于 `docx/xlsx/pptx → pdf`。下载：<https://www.libreoffice.org/>
- **Tesseract + 中文语言包**：用于 OCR 备用。下载：<https://github.com/UB-Mannheim/tesseract/wiki>

插件启动时会在日志中自动检测上述工具的可用性，并通过 `/convert --tools` 实时查看。

## 配置项

可在 AstrBot WebUI 的插件配置面板调整（首次启动后自动生成 `_conf_schema.json`）：

| 键                | 说明                            | 默认值                          |
| ----------------- | ------------------------------- | ------------------------------- |
| `tmp_dir`         | 临时文件目录                    | `data/plugin_tmp/doc_converter` |
| `timeout_seconds` | 单次转换超时（秒）              | `120`                            |
| `max_file_size_mb`| 允许处理的最大文件（MB）        | `50`                             |
| `image_quality`   | 图片输出质量（1-100）           | `90`                             |
| `ocr_lang`        | Tesseract OCR 语言（`+`连接多语种） | `chi_sim+eng`               |
| `auto_cleanup`    | 插件关闭时是否清理临时目录      | `true`                           |

## 常见问题

- **docx 转 pdf 失败？** 通常是没安装 LibreOffice，或 LibreOffice 不在 PATH 中。运行 `/convert --tools` 检查。
- **OCR 中文识别效果差？** 确认 Tesseract 已安装并下载了 `chi_sim.traineddata` 语言包。
- **大文件超时？** 调高 `timeout_seconds`，或将 `tmp_dir` 设置到读写更快的磁盘。

## 开发与测试

```bash
cd astrbot_plugin_doc_converter
uv run pytest tests/ -v
```

测试覆盖：注册表、文件识别、外部工具检测、转换器主流程、图片转换、参数解析。

## 许可

MIT
