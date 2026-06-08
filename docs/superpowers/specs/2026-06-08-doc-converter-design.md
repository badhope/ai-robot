# 文档转换器插件设计 (AstrBot Doc Converter)

> 状态：设计中 · 日期：2026-06-08 · 作者：brainstorming session

## 1. 背景与目标

为 AstrBot 用户提供一个**聊天指令式**的通用文档转换器，覆盖三大场景：

1. **办公文档格式互转**：PDF ↔ Word/Excel/PPT、Markdown ↔ HTML/PDF、Word/Excel/PPT → PDF
2. **图片格式互转**：PNG / JPG / WebP / AVIF / GIF / BMP
3. **OCR**：图片、PDF 扫描件 → 纯文本

### 1.1 目标用户

- 在 QQ/微信/Telegram 等聊天场景中临时需要转换文档的普通用户
- 不想打开 Office 或在线工具的机器人管理员

### 1.2 非目标 (YAGNI)

- ❌ 不做 LLM 工具（仅聊天指令触发）
- ❌ 不做独立 Web 页面
- ❌ 不做批量转换
- ❌ 不做文件加密/解密
- ❌ 不做水印
- ❌ 不依赖 Pandoc 外部程序

## 2. 竞品分析

| 插件 | 定位 | 关系 |
|---|---|---|
| `Clhikari/astrbot_plugin_office_assistant` (36★) | LLM 生成 Office + 读取 + 转换 | 互补：他们偏 AI 生成和读取；我们偏纯格式互转 + 图片 + OCR |
| 多个 `markdown → image` 插件 | Markdown 转图 | 我们也覆盖，但合并到统一的 `/convert` 指令 |
| `Soffd/astrbot_plugin_baiduocr` (0★) | 百度云 OCR API | 我们用本地 OCR（rapidocr-onnxruntime / tesseract），无需联网 |
| `astrbot_plugin_novel` | EPUB/PDF 导出 | 业务场景完全不同 |

**结论**：没有功能完全重叠的插件，差异化明确：**"通用聊天式文档/图片转换器"** 尚未被覆盖。

## 3. 架构

### 3.1 模块图

```
astrbot_plugin_doc_converter/
├── metadata.yaml
├── main.py                    # 入口 + 指令注册 + ConverterRegistry 初始化
├── _conf_schema.json          # 配置
├── README.md
├── requirements.txt
├── converters/
│   ├── __init__.py
│   ├── base.py                # Converter 抽象 + Registry
│   ├── pdf_to_docx.py         # pdf2docx
│   ├── pdf_to_md.py           # pymupdf4llm
│   ├── pdf_to_txt.py          # pymupdf
│   ├── pdf_to_image.py        # pymupdf
│   ├── docx_to_pdf.py         # libreoffice / weasyprint(经HTML)
│   ├── xlsx_to_pdf.py         # libreoffice
│   ├── pptx_to_pdf.py         # libreoffice
│   ├── md_to_html.py          # markdown
│   ├── md_to_pdf.py           # markdown + weasyprint
│   ├── html_to_pdf.py         # weasyprint
│   ├── image_convert.py       # Pillow + pillow-avif-plugin
│   ├── ocr_image.py           # rapidocr-onnxruntime / tesseract
│   └── ocr_pdf.py             # pymupdf 渲图 + ocr_image
└── utils/
    ├── __init__.py
    ├── file_detect.py         # MIME + 后缀
    ├── external_tools.py      # 检测 libreoffice / tesseract
    └── smart_route.py         # 智能默认目标格式
```

### 3.2 核心抽象

```python
# converters/base.py
class Converter(Protocol):
    src_format: str          # "pdf" / "docx" / "image" / "md" ...
    dst_format: str          # "docx" / "pdf" / "txt" ...
    requires: list[str] = [] # 外部依赖：["libreoffice", "tesseract"]

    async def convert(
        self, input_path: Path, output_path: Path, *, options: dict
    ) -> None: ...

class ConverterRegistry:
    def find(self, src: str, dst: str) -> Converter | None: ...
    def available_dsts(self, src: str) -> list[str]: ...
    def find_smart_default(self, src: str, has_text: bool) -> str | None: ...
```

### 3.3 数据流

```
用户发文件 + 触发 /convert
  ↓
保存到 data/plugin_tmp/doc_converter/<timestamp>_<basename>
  ↓
utils/file_detect.detect(path) → (src_format, has_text)
  ↓
解析 --to 参数（若有），否则 smart_route.pick_default()
  ↓
ConverterRegistry.find(src, dst) → Converter
  ↓
asyncio.to_thread(converter.convert, ...)  # CPU 密集任务放线程
  ↓
检查输出文件存在 + 大小
  ↓
event.file_result(output_path) / image_result(...) 发送
  ↓
terminate 时清理临时目录
```

## 4. 指令设计

| 指令 | 行为 |
|---|---|
| `/convert` (附文件) | 智能默认转换 |
| `/convert --to=md` (附文件) | 显式指定目标格式 |
| `/convert --to=txt` (附图片) | 对图片 OCR |
| `/convert --formats` (附文件) | 列出该文件可转换成的所有格式 |
| `/convert --tools` | 显示系统检测到的外部工具（libreoffice / tesseract） |
| `/convert --help` | 帮助 |

支持的中文别名：`/转换`、`/文档转换`

### 4.1 智能默认规则

| 源格式 | 默认目标 | 说明 |
|---|---|---|
| `pdf` (含文字层) | `docx` | 可编辑优先 |
| `pdf` (无文字层，扫描件) | `txt` | OCR |
| `docx` | `pdf` | 阅读优先 |
| `xlsx` | `pdf` | 阅读优先 |
| `pptx` | `pdf` | 阅读优先 |
| `md` | `html` | 可分享 |
| `html` | `pdf` | 可打印 |
| `image` (任意) | `png` | 通用格式 |

PDF 文字层检测：`pymupdf` 提取 `len(text.strip()) < 10` 视为扫描件。

## 5. 错误处理

| 场景 | 行为 |
|---|---|
| 文件超过 `max_file_size_mb` | 提示「文件过大，限制 XMB」 |
| 格式不支持 | 提示「不支持的格式，可转换格式：xxx」 |
| 目标格式不可达（缺工具） | 提示「需要 LibreOffice / Tesseract，请安装」 |
| 转换超时 (>120s) | 返回失败信息，清理临时文件 |
| PDF 加密 | 捕获异常，提示「PDF 已加密，无法转换」 |
| 转换异常 | 打印 traceback，提示「转换失败：xxx」 |

## 6. 配置项

`_conf_schema.json`：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `max_file_size_mb` | int | 50 | 单文件最大尺寸 |
| `timeout_seconds` | int | 120 | 单次转换超时 |
| `image_quality` | int | 90 | JPEG 质量 1-100 |
| `ocr_lang` | string | `chi_sim+eng` | Tesseract 语言包 |
| `auto_cleanup` | bool | true | 退出时自动清理临时目录 |
| `libreoffice_path` | string | 空 | 自定义 LibreOffice 可执行路径 |

## 7. 依赖

### 7.1 Python 库（自动装）

- `pdf2docx` (PDF → Word)
- `pymupdf` (PDF 解析、PDF → 图、PDF → 文字)
- `pymupdf4llm` (PDF → Markdown)
- `python-docx` (Word 读取，备用)
- `Pillow` + `pillow-avif-plugin` (图片格式)
- `weasyprint` (HTML → PDF)
- `markdown` (Markdown → HTML)
- `rapidocr-onnxruntime` (离线 OCR，纯 Python 回退)
- `pytesseract` (Tesseract OCR 接口)

### 7.2 外部程序（可选，检测后用）

- `libreoffice` — Office → PDF 转换（macOS/Linux：`brew install / apt install`；Windows：从 libreoffice.org 下载）
- `tesseract` — OCR 备用引擎（macOS：`brew install tesseract tesseract-lang`；Linux：`apt install tesseract-ocr tesseract-ocr-chi-sim`；Windows：UB-Mannheim 构建）

`utils/external_tools.py` 在 `__init__` 时探测；缺则用 Python 库回退，并在 `/convert --tools` 中提示。

## 8. 测试策略

每个 Converter 单元测试：

- `pdf_to_docx`：用 `tests/fixtures/sample.pdf`（含文字层）
- `image_convert`：构造 PNG，验证可转 JPG/WebP
- `ocr_image`：用印刷体中文图，断言非空字符串
- `smart_route`：单测所有 (src, has_text) 组合

集成测试：mock `event` 跑 `/convert` 指令。

## 9. 发布流程

1. 仓库名：`badhope/astrbot_plugin_doc_converter`（用模板 `Soulter/helloworld`）
2. 推到 GitHub main 分支
3. 访问 https://plugins.astrbot.app → 右下角 `+` → 填写信息
4. 提交后跳转 AstrBotDevs/AstrBot 仓库的 Issue 提交页面 → Create
5. 限制：zip ≤ 16MB

## 10. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 依赖体积大，zip 超 16MB | `requirements.txt` 按需分；pymupdf / weasyprint 体积大，必要时引导用户单独装 |
| LibreOffice 未装 → Office→PDF 失败 | 显式提示，提供安装链接 |
| Tesseract OCR 精度低 | 默认 rapidocr-onnxruntime（中英混合），tesseract 作备选 |
| 用户上传大文件拖垮 Bot | `max_file_size_mb` 限制 + 超时 + 线程隔离 |
| 与 Office 助手定位冲突 | README 明确"专注纯格式互转，不做 AI 生成" |

## 11. 验收标准

- ✅ 用户发 PDF → 默认收到可编辑的 docx
- ✅ 用户发图片 → 默认收到 PNG；`--to=txt` 收到 OCR 文本
- ✅ 用户发扫描件 PDF → 默认收到 OCR txt
- ✅ `/convert --formats` 正确列出可转换目标
- ✅ 安装到 AstrBot 后立即可用，无需复杂配置
- ✅ README 清晰，安装步骤明确
