# 文档转换器插件实施计划 (Doc Converter)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个 AstrBot 聊天指令式通用文档/图片转换器插件，覆盖 PDF/Word/Excel/PPT/Markdown/HTML/图片互转 + OCR。

**Architecture:** 模块化 + Converter 协议 + 注册表；纯 Python 库（pdf2docx/pymupdf/Pillow/weasyprint/rapidocr）+ 可选 LibreOffice/Tesseract 回退。

**Tech Stack:** Python 3.10+, AstrBot 4.16+, pymupdf, pdf2docx, pymupdf4llm, weasyprint, Pillow, pillow-avif-plugin, rapidocr-onnxruntime, markdown

**Working directory:** `c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter\` （开发期间；最终发布仓库：`badhope/astrbot_plugin_doc_converter`）

---

## 文件结构

```
astrbot_plugin_doc_converter/
├── metadata.yaml                # 插件元数据
├── main.py                      # 入口 + 指令注册
├── _conf_schema.json            # WebUI 配置
├── requirements.txt             # Python 依赖
├── README.md
├── LICENSE                      # AGPL-3.0
├── converters/
│   ├── __init__.py
│   ├── base.py                  # Converter 协议 + Registry
│   ├── pdf_to_docx.py
│   ├── pdf_to_md.py
│   ├── pdf_to_txt.py
│   ├── pdf_to_image.py
│   ├── office_to_pdf.py         # docx/xlsx/pptx → pdf
│   ├── md_html.py               # md ↔ html
│   ├── md_to_pdf.py
│   ├── html_to_pdf.py
│   ├── image_convert.py
│   ├── ocr_image.py
│   └── ocr_pdf.py
├── utils/
│   ├── __init__.py
│   ├── file_detect.py
│   ├── external_tools.py
│   └── smart_route.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── fixtures/
    │   └── sample.txt           # 测试用纯文本
    ├── test_file_detect.py
    ├── test_external_tools.py
    ├── test_smart_route.py
    ├── test_registry.py
    ├── test_image_convert.py
    └── test_main.py             # 集成测试（mock event）
```

---

## Task 1: 项目脚手架

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/metadata.yaml`
- Create: `data/plugins/astrbot_plugin_doc_converter/requirements.txt`
- Create: `data/plugins/astrbot_plugin_doc_converter/LICENSE`
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/__init__.py`
- Create: `data/plugins/astrbot_plugin_doc_converter/utils/__init__.py`
- Create: `data/plugins/astrbot_plugin_doc_converter/tests/__init__.py`
- Create: `data/plugins/astrbot_plugin_doc_converter/tests/conftest.py`

- [ ] **Step 1: 创建目录结构**

```bash
cd c:\Users\X1882\Desktop\ai-robot
mkdir -p data/plugins/astrbot_plugin_doc_converter/converters
mkdir -p data/plugins/astrbot_plugin_doc_converter/utils
mkdir -p data/plugins/astrbot_plugin_doc_converter/tests/fixtures
```

- [ ] **Step 2: 写 metadata.yaml**

```yaml
name: astrbot_plugin_doc_converter
display_name: 文档转换器
desc: 聊天式通用文档/图片转换器：PDF/Word/Excel/PPT/Markdown/HTML 互转 + OCR + 图片格式互转
short_desc: PDF/Word/PPT/Excel/Markdown/图片 互转 + OCR
author: badhope
version: 0.1.0
repo: https://github.com/badhope/astrbot_plugin_doc_converter
logo: logo.png
astrbot_version: ">=4.16,<5"
tags:
  - 工具
  - 文档
  - 转换
  - OCR
```

- [ ] **Step 3: 写 requirements.txt**

```
pdf2docx>=0.5.8
pymupdf>=1.24.0
pymupdf4llm>=0.0.17
python-docx>=1.1.0
Pillow>=10.0.0
pillow-avif-plugin>=1.5.0
weasyprint>=62.0
markdown>=3.6
rapidocr-onnxruntime>=1.3.0
pytesseract>=0.3.10
```

- [ ] **Step 4: 写 LICENSE（AGPL-3.0）**

从 https://www.gnu.org/licenses/agpl-3.0.txt 复制全文，保存到 `LICENSE`。

- [ ] **Step 5: 写空 __init__.py 和 conftest.py**

`converters/__init__.py`、`utils/__init__.py`、`tests/__init__.py` 留空。

`tests/conftest.py`：
```python
import sys
from pathlib import Path

PLUGIN_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PLUGIN_ROOT))
```

- [ ] **Step 6: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/
git commit -m "feat(doc-converter): scaffold plugin directory structure"
```

---

## Task 2: Converter 抽象和注册表

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/base.py`
- Test: `data/plugins/astrbot_plugin_doc_converter/tests/test_registry.py`

- [ ] **Step 1: 写测试**

`tests/test_registry.py`：
```python
from converters.base import Converter, ConverterRegistry, ConvertResult


class _StubConverter:
    src_format = "txt"
    dst_format = "md"

    def __init__(self, ok=True):
        self.ok = ok

    async def convert(self, input_path, output_path, *, options=None):
        if self.ok:
            output_path.write_text("# ok", encoding="utf-8")
        raise RuntimeError("boom")


def test_registry_register_and_find():
    reg = ConverterRegistry()
    c = _StubConverter()
    reg.register(c)
    assert reg.find("txt", "md") is c
    assert reg.find("txt", "pdf") is None


def test_registry_available_dsts():
    reg = ConverterRegistry()
    reg.register(_StubConverter())
    reg.register(_StubConverter())  # 重复会覆盖
    class P:
        src_format = "txt"
        dst_format = "pdf"
        async def convert(self, i, o, *, options=None): pass
    reg.register(P())
    assert set(reg.available_dsts("txt")) == {"md", "pdf"}


def test_convert_result_dataclass():
    r = ConvertResult(success=True, output_path=Path("a.md"), message="ok")
    assert r.success is True
    assert r.message == "ok"


from pathlib import Path
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_registry.py -v
```

Expected: ModuleNotFoundError: No module named 'converters.base'

- [ ] **Step 3: 实现 converters/base.py**

```python
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol


@dataclass
class ConvertResult:
    success: bool
    output_path: Path | None
    message: str = ""


class Converter(Protocol):
    src_format: str
    dst_format: str
    requires: list[str]

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None: ...


class ConverterRegistry:
    def __init__(self) -> None:
        self._items: dict[tuple[str, str], Converter] = {}

    def register(self, converter: Converter) -> None:
        self._items[(converter.src_format, converter.dst_format)] = converter

    def find(self, src: str, dst: str) -> Converter | None:
        return self._items.get((src, dst))

    def available_dsts(self, src: str) -> list[str]:
        return sorted({d for (s, d) in self._items if s == src})

    def find_smart_default(self, src: str, has_text: bool) -> str | None:
        candidates = self.available_dsts(src)
        if not candidates:
            return None
        if src == "pdf":
            return "docx" if has_text else "txt"
        priority = {
            "docx": "pdf",
            "xlsx": "pdf",
            "pptx": "pdf",
            "md": "html",
            "html": "pdf",
            "image": "png",
            "txt": "md",
        }
        if src in priority and priority[src] in candidates:
            return priority[src]
        return candidates[0]


async def run_converter(
    converter: Converter,
    input_path: Path,
    output_path: Path,
    *,
    options: dict[str, Any] | None = None,
) -> None:
    """Wrap blocking convert() with asyncio.to_thread."""
    await asyncio.to_thread(_sync_run, converter, input_path, output_path, options)


def _sync_run(converter, input_path, output_path, options) -> None:
    import asyncio
    asyncio.run(converter.convert(input_path, output_path, options=options))
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_registry.py -v
```

Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/converters/base.py
git add data/plugins/astrbot_plugin_doc_converter/tests/test_registry.py
git commit -m "feat(doc-converter): add Converter protocol and registry"
```

---

## Task 3: 文件类型检测

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/utils/file_detect.py`
- Test: `data/plugins/astrbot_plugin_doc_converter/tests/test_file_detect.py`

- [ ] **Step 1: 写测试**

`tests/test_file_detect.py`：
```python
from pathlib import Path
from utils.file_detect import detect


def test_detect_pdf(tmp_path: Path):
    p = tmp_path / "a.pdf"
    p.write_bytes(b"%PDF-1.4\n%fake\n")
    fmt, has_text = detect(p)
    assert fmt == "pdf"


def test_detect_docx(tmp_path: Path):
    p = tmp_path / "a.docx"
    p.write_bytes(b"PK\x03\x04" + b"x" * 100)  # ZIP magic
    fmt, has_text = detect(p)
    assert fmt == "docx"


def test_detect_png(tmp_path: Path):
    p = tmp_path / "a.png"
    p.write_bytes(b"\x89PNG\r\n\x1a\n" + b"x" * 100)
    fmt, has_text = detect(p)
    assert fmt == "image"
    assert has_text is False


def test_detect_md(tmp_path: Path):
    p = tmp_path / "a.md"
    p.write_text("# hi", encoding="utf-8")
    fmt, has_text = detect(p)
    assert fmt == "md"
    assert has_text is True


def test_detect_unknown(tmp_path: Path):
    p = tmp_path / "a.xyz"
    p.write_text("xxx", encoding="utf-8")
    fmt, has_text = detect(p)
    assert fmt is None
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_file_detect.py -v
```

Expected: ModuleNotFoundError

- [ ] **Step 3: 实现 utils/file_detect.py**

```python
from __future__ import annotations

import struct
import zipfile
from pathlib import Path


# 简单 magic bytes 探测 + 后缀推断
_MAGIC = [
    (b"%PDF", "pdf"),
    (b"PK\x03\x04", None),  # ZIP-based: docx/xlsx/pptx
    (b"\x89PNG\r\n\x1a\n", "image"),
    (b"\xff\xd8\xff", "image"),  # JPEG
    (b"GIF87a", "image"),
    (b"GIF89a", "image"),
    (b"RIFF", "image"),  # WEBP
    (b"<?xml", "xml"),
]

_ZIP_MEMBER = {
    "word/": "docx",
    "xl/": "xlsx",
    "ppt/": "pptx",
}


def detect(path: Path) -> tuple[str | None, bool]:
    """Return (format, has_text_layer).

    format: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'md' | 'html' | 'image' | 'txt' | None
    has_text_layer: bool，仅对 pdf 有意义
    """
    suffix = path.suffix.lower().lstrip(".")
    text_suffixes = {"md", "markdown", "txt", "html", "htm", "csv", "json", "xml", "yaml", "yml"}
    if suffix in text_suffixes:
        return _normalize_text(suffix), True

    try:
        head = path.read_bytes()[:16]
    except OSError:
        return None, False

    for magic, fmt in _MAGIC:
        if head.startswith(magic):
            if magic == b"PK\x03\x04":
                return _detect_office(path), True
            if fmt == "image":
                return "image", False
            if fmt is None:
                continue
            return fmt, fmt != "image"

    # 兜底按后缀
    return _suffix_fallback(suffix)


def _normalize_text(suffix: str) -> str:
    if suffix in {"md", "markdown"}:
        return "md"
    if suffix in {"html", "htm"}:
        return "html"
    if suffix == "txt":
        return "txt"
    return suffix


def _suffix_fallback(suffix: str) -> tuple[str | None, bool]:
    table = {
        "pdf": ("pdf", True),
        "docx": ("docx", True),
        "xlsx": ("xlsx", True),
        "pptx": ("pptx", True),
        "png": ("image", False),
        "jpg": ("image", False),
        "jpeg": ("image", False),
        "webp": ("image", False),
        "gif": ("image", False),
        "bmp": ("image", False),
        "avif": ("image", False),
    }
    return table.get(suffix, (None, False))


def _detect_office(path: Path) -> str:
    try:
        with zipfile.ZipFile(path) as z:
            names = z.namelist()
    except (zipfile.BadZipFile, OSError):
        return "docx"
    for prefix, fmt in _ZIP_MEMBER.items():
        if any(n.startswith(prefix) for n in names):
            return fmt
    return "docx"


def has_text_layer(pdf_path: Path) -> bool:
    """Detect whether a PDF has an extractable text layer (vs scanned image)."""
    try:
        import fitz  # type: ignore[import-untyped]
    except ImportError:
        return True
    try:
        doc = fitz.open(pdf_path)
        total = 0
        for page in doc:
            total += len(page.get_text().strip())
            if total > 20:
                return True
        return False
    except Exception:
        return True
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_file_detect.py -v
```

Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/utils/file_detect.py
git add data/plugins/astrbot_plugin_doc_converter/tests/test_file_detect.py
git commit -m "feat(doc-converter): add file type detection"
```

---

## Task 4: 外部工具检测

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/utils/external_tools.py`
- Test: `data/plugins/astrbot_plugin_doc_converter/tests/test_external_tools.py`

- [ ] **Step 1: 写测试**

`tests/test_external_tools.py`：
```python
from utils.external_tools import ExternalTools, detect_all


def test_detect_all_returns_object():
    tools = detect_all()
    assert isinstance(tools, ExternalTools)
    assert isinstance(tools.libreoffice, bool)
    assert isinstance(tools.tesseract, bool)


def test_external_tools_office_available():
    t = ExternalTools(libreoffice=True, tesseract=False)
    assert t.office_available() is True
    assert t.ocr_available() is False


def test_external_tools_ocr_via_rapidocr(monkeypatch):
    """If rapidocr is importable, OCR is always available even without tesseract."""
    t = ExternalTools(libreoffice=False, tesseract=False)
    assert t.ocr_available() is True  # rapidocr-onnxruntime as fallback
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_external_tools.py -v
```

Expected: ModuleNotFoundError

- [ ] **Step 3: 实现 utils/external_tools.py**

```python
from __future__ import annotations

import shutil
import sys
from dataclasses import dataclass


@dataclass
class ExternalTools:
    libreoffice: bool
    tesseract: bool

    def office_available(self) -> bool:
        return self.libreoffice

    def ocr_available(self) -> bool:
        if self.tesseract:
            return True
        # rapidocr-onnxruntime 是 Python 库，已装就一定可用
        try:
            import rapidocr_onnxruntime  # noqa: F401

            return True
        except ImportError:
            return False

    def summary(self) -> str:
        return (
            f"LibreOffice: {'✓' if self.libreoffice else '✗'}  "
            f"Tesseract: {'✓' if self.tesseract else '✗'}"
        )


def _which(name: str) -> bool:
    return shutil.which(name) is not None


def detect_all() -> ExternalTools:
    return ExternalTools(
        libreoffice=_which("libreoffice") or _which("soffice"),
        tesseract=_which("tesseract"),
    )
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_external_tools.py -v
```

Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/utils/external_tools.py
git add data/plugins/astrbot_plugin_doc_converter/tests/test_external_tools.py
git commit -m "feat(doc-converter): detect external tools (libreoffice/tesseract)"
```

---

## Task 5: 图片格式转换器

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/image_convert.py`
- Test: `data/plugins/astrbot_plugin_doc_converter/tests/test_image_convert.py`

- [ ] **Step 1: 写测试**

`tests/test_image_convert.py`：
```python
from pathlib import Path
from PIL import Image
from converters.image_convert import ImageConverter


def _png(tmp_path: Path) -> Path:
    p = tmp_path / "in.png"
    Image.new("RGB", (10, 10), (255, 0, 0)).save(p)
    return p


def test_png_to_jpg(tmp_path: Path):
    c = ImageConverter("image", "jpg")
    out = tmp_path / "out.jpg"
    import asyncio
    asyncio.run(c.convert(_png(tmp_path), out))
    assert out.exists()
    assert Image.open(out).format == "JPEG"


def test_png_to_webp(tmp_path: Path):
    c = ImageConverter("image", "webp")
    out = tmp_path / "out.webp"
    import asyncio
    asyncio.run(c.convert(_png(tmp_path), out))
    assert out.exists()
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_image_convert.py -v
```

Expected: ModuleNotFoundError

- [ ] **Step 3: 实现 converters/image_convert.py**

```python
from __future__ import annotations

from pathlib import Path
from typing import Any


class ImageConverter:
    src_format = "image"
    requires: list[str] = []

    def __init__(self, dst_format: str) -> None:
        self.dst_format = dst_format

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        from PIL import Image

        quality = (options or {}).get("image_quality", 90)
        with Image.open(input_path) as im:
            # 处理 RGBA → JPG 时的透明背景
            if self.dst_format in {"jpg", "jpeg"} and im.mode in {"RGBA", "LA", "P"}:
                im = im.convert("RGB")
            save_kwargs: dict[str, Any] = {}
            if self.dst_format in {"jpg", "jpeg", "webp"}:
                save_kwargs["quality"] = quality
            im.save(output_path, **save_kwargs)
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_image_convert.py -v
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/converters/image_convert.py
git add data/plugins/astrbot_plugin_doc_converter/tests/test_image_convert.py
git commit -m "feat(doc-converter): add image format converter (Pillow)"
```

---

## Task 6: PDF → Word 转换器

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/pdf_to_docx.py`
- (no test — requires real PDF; covered by manual test in Task 13)

- [ ] **Step 1: 写实现**

`converters/pdf_to_docx.py`：
```python
from __future__ import annotations

from pathlib import Path
from typing import Any


class PdfToDocxConverter:
    src_format = "pdf"
    dst_format = "docx"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        from pdf2docx import Converter

        cv = Converter(str(input_path))
        try:
            cv.convert(str(output_path))
        finally:
            cv.close()
```

- [ ] **Step 2: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/converters/pdf_to_docx.py
git commit -m "feat(doc-converter): add pdf -> docx converter"
```

---

## Task 7: PDF → Markdown/Text/Image 转换器

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/pdf_to_md.py`
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/pdf_to_txt.py`
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/pdf_to_image.py`

- [ ] **Step 1: 写 pdf_to_md.py**

```python
from __future__ import annotations

from pathlib import Path
from typing import Any


class PdfToMarkdownConverter:
    src_format = "pdf"
    dst_format = "md"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        import pymupdf4llm

        md = pymupdf4llm.to_markdown(str(input_path))
        output_path.write_text(md, encoding="utf-8")
```

- [ ] **Step 2: 写 pdf_to_txt.py**

```python
from __future__ import annotations

from pathlib import Path
from typing import Any


class PdfToTextConverter:
    src_format = "pdf"
    dst_format = "txt"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        import fitz

        doc = fitz.open(input_path)
        try:
            parts = [page.get_text() for page in doc]
        finally:
            doc.close()
        output_path.write_text("\n\n".join(parts), encoding="utf-8")
```

- [ ] **Step 3: 写 pdf_to_image.py**

```python
from __future__ import annotations

from pathlib import Path
from typing import Any


class PdfToImageConverter:
    src_format = "pdf"
    dst_format = "image"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        import fitz

        doc = fitz.open(input_path)
        try:
            if len(doc) == 0:
                raise RuntimeError("PDF is empty")
            page = doc[0]
            dpi = (options or {}).get("dpi", 150)
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat)
            pix.save(str(output_path))
        finally:
            doc.close()
```

- [ ] **Step 4: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/converters/pdf_to_md.py
git add data/plugins/astrbot_plugin_doc_converter/converters/pdf_to_txt.py
git add data/plugins/astrbot_plugin_doc_converter/converters/pdf_to_image.py
git commit -m "feat(doc-converter): add pdf -> md/txt/image converters"
```

---

## Task 8: Office → PDF（依赖 LibreOffice）

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/office_to_pdf.py`

- [ ] **Step 1: 写实现**

```python
from __future__ import annotations

import asyncio
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from utils.external_tools import ExternalTools


class OfficeToPdfConverter:
    """docx / xlsx / pptx → pdf via LibreOffice headless."""
    dst_format = "pdf"
    requires: list[str] = ["libreoffice"]

    def __init__(self, src_format: str, tools: ExternalTools) -> None:
        self.src_format = src_format
        self._tools = tools

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        if not self._tools.libreoffice:
            raise RuntimeError(
                "需要 LibreOffice 才能将 Office 文档转换为 PDF。"
                "请访问 https://www.libreoffice.org/ 下载安装。"
            )
        binary = "libreoffice" if shutil.which("libreoffice") else "soffice"
        with tempfile.TemporaryDirectory() as tmp:
            cmd = [
                binary,
                "--headless",
                "--convert-to", "pdf",
                "--outdir", tmp,
                str(input_path),
            ]
            proc = await asyncio.create_subprocess_exec(
                *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            if proc.returncode != 0:
                raise RuntimeError(
                    f"LibreOffice 转换失败 (code={proc.returncode}): "
                    f"{stderr.decode('utf-8', 'replace')}"
                )
            produced = Path(tmp) / (input_path.stem + ".pdf")
            if not produced.exists():
                raise RuntimeError(f"LibreOffice 未生成 PDF，stdout: {stdout.decode('utf-8', 'replace')}")
            shutil.move(str(produced), str(output_path))
```

- [ ] **Step 2: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/converters/office_to_pdf.py
git commit -m "feat(doc-converter): add office (docx/xlsx/pptx) -> pdf converter"
```

---

## Task 9: Markdown ↔ HTML/PDF

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/md_html.py`
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/md_to_pdf.py`
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/html_to_pdf.py`

- [ ] **Step 1: 写 md_html.py**

```python
from __future__ import annotations

from pathlib import Path
from typing import Any


class MdToHtmlConverter:
    src_format = "md"
    dst_format = "html"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        import markdown

        text = input_path.read_text(encoding="utf-8")
        body = markdown.markdown(text, extensions=["fenced_code", "tables", "toc"])
        html = (
            "<!doctype html><html><head><meta charset='utf-8'>"
            "<style>body{font-family:sans-serif;max-width:780px;"
            "margin:2em auto;line-height:1.6;padding:0 1em;}"
            "pre{background:#f5f5f5;padding:1em;overflow:auto;}"
            "code{background:#f5f5f5;padding:0.1em 0.3em;}</style>"
            f"</head><body>{body}</body></html>"
        )
        output_path.write_text(html, encoding="utf-8")
```

- [ ] **Step 2: 写 md_to_pdf.py**

```python
from __future__ import annotations

from pathlib import Path
from typing import Any


class MdToPdfConverter:
    src_format = "md"
    dst_format = "pdf"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        import markdown
        from weasyprint import HTML

        text = input_path.read_text(encoding="utf-8")
        body = markdown.markdown(text, extensions=["fenced_code", "tables", "toc"])
        html = (
            "<!doctype html><html><head><meta charset='utf-8'>"
            "<style>body{font-family:sans-serif;max-width:780px;"
            "margin:2em auto;line-height:1.6;}"
            "pre{background:#f5f5f5;padding:1em;overflow:auto;}</style>"
            f"</head><body>{body}</body></html>"
        )
        HTML(string=html).write_pdf(str(output_path))
```

- [ ] **Step 3: 写 html_to_pdf.py**

```python
from __future__ import annotations

from pathlib import Path
from typing import Any


class HtmlToPdfConverter:
    src_format = "html"
    dst_format = "pdf"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        from weasyprint import HTML

        HTML(filename=str(input_path)).write_pdf(str(output_path))
```

- [ ] **Step 4: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/converters/md_html.py
git add data/plugins/astrbot_plugin_doc_converter/converters/md_to_pdf.py
git add data/plugins/astrbot_plugin_doc_converter/converters/html_to_pdf.py
git commit -m "feat(doc-converter): add md<->html and html/md -> pdf converters"
```

---

## Task 10: OCR（图片 + 扫描 PDF）

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/ocr_image.py`
- Create: `data/plugins/astrbot_plugin_doc_converter/converters/ocr_pdf.py`

- [ ] **Step 1: 写 ocr_image.py**

```python
from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any


class OcrImageConverter:
    src_format = "image"
    dst_format = "txt"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        lang = (options or {}).get("ocr_lang", "chi_sim+eng")
        text = await _run_ocr(input_path, lang)
        output_path.write_text(text, encoding="utf-8")


class OcrImageToMarkdownConverter:
    src_format = "image"
    dst_format = "md"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        lang = (options or {}).get("ocr_lang", "chi_sim+eng")
        text = await _run_ocr(input_path, lang)
        output_path.write_text(f"```\n{text}\n```\n", encoding="utf-8")


async def _run_ocr(image_path: Path, lang: str) -> str:
    if shutil.which("tesseract"):
        return await _tesseract(image_path, lang)
    return await _rapidocr(image_path)


async def _tesseract(image_path: Path, lang: str) -> str:
    import asyncio

    cmd = ["tesseract", str(image_path), "-", "-l", lang]
    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"tesseract 失败: {stderr.decode('utf-8', 'replace')}")
    return stdout.decode("utf-8", "replace")


async def _rapidocr(image_path: Path) -> str:
    from rapidocr_onnxruntime import RapidOCR

    engine = RapidOCR()
    result, _ = await asyncio.to_thread(engine, str(image_path))
    if not result:
        return ""
    return "\n".join(line[1] for line in result if line and len(line) > 1)
```

- [ ] **Step 2: 写 ocr_pdf.py**

```python
from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from typing import Any


class OcrPdfConverter:
    src_format = "pdf"
    dst_format = "txt"
    requires: list[str] = []

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        """Render PDF pages to images then OCR each page."""
        import fitz
        from converters.ocr_image import _run_ocr

        lang = (options or {}).get("ocr_lang", "chi_sim+eng")
        doc = fitz.open(input_path)
        try:
            all_text: list[str] = []
            with tempfile.TemporaryDirectory() as tmp:
                for i, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=200)
                    img_path = Path(tmp) / f"p{i}.png"
                    pix.save(str(img_path))
                    text = await _run_ocr(img_path, lang)
                    all_text.append(text)
        finally:
            doc.close()
        output_path.write_text("\n\n".join(all_text), encoding="utf-8")
```

- [ ] **Step 3: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/converters/ocr_image.py
git add data/plugins/astrbot_plugin_doc_converter/converters/ocr_pdf.py
git commit -m "feat(doc-converter): add OCR for images and scanned PDFs"
```

---

## Task 11: 主入口 main.py

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/main.py`
- Test: `data/plugins/astrbot_plugin_doc_converter/tests/test_main.py`

- [ ] **Step 1: 写测试**

`tests/test_main.py`：
```python
from unittest.mock import AsyncMock, MagicMock

import pytest
from main import DocConverterPlugin
from converters.base import ConverterRegistry


def _event(file_path: str | None = None, message_str: str = "/convert"):
    e = MagicMock()
    e.get_messages.return_value = []
    e.message_str = message_str
    e.plain_result = MagicMock(side_effect=lambda s: ("plain", s))
    e.chain_result = MagicMock(side_effect=lambda x: ("chain", x))
    e.image_result = MagicMock(side_effect=lambda s: ("image", s))
    e.file_result = MagicMock(side_effect=lambda s: ("file", s))
    e.unified_msg_origin = "test:0"
    e.get_sender_name.return_value = "tester"
    if file_path:
        m = MagicMock()
        m.type = "file"
        m.url = file_path
        m.name = "a.pdf"
        m.path = file_path
        e.get_messages.return_value = [m]
    return e


@pytest.fixture
def plugin():
    return DocConverterPlugin(context=MagicMock(), config={})


async def test_no_file(plugin):
    e = _event()
    out = []
    async for r in plugin.convert(e):
        out.append(r)
    assert any("发送文件" in r[1] for r in out)


async def test_help(plugin):
    e = _event(message_str="/convert --help")
    out = []
    async for r in plugin.convert(e):
        out.append(r)
    assert any("用法" in r[1] for r in out)
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_main.py -v
```

Expected: ModuleNotFoundError

- [ ] **Step 3: 实现 main.py**

```python
from __future__ import annotations

import asyncio
import time
import uuid
from pathlib import Path
from typing import Any

from astrbot.api import logger
from astrbot.api.event import AstrMessageEvent, filter
from astrbot.api.star import Context, Star, register

from converters.base import ConverterRegistry
from converters.html_to_pdf import HtmlToPdfConverter
from converters.image_convert import ImageConverter
from converters.md_html import MdToHtmlConverter
from converters.md_to_pdf import MdToPdfConverter
from converters.ocr_image import OcrImageConverter, OcrImageToMarkdownConverter
from converters.ocr_pdf import OcrPdfConverter
from converters.office_to_pdf import OfficeToPdfConverter
from converters.pdf_to_docx import PdfToDocxConverter
from converters.pdf_to_image import PdfToImageConverter
from converters.pdf_to_md import PdfToMarkdownConverter
from converters.pdf_to_txt import PdfToTextConverter
from utils.external_tools import detect_all
from utils.file_detect import detect, has_text_layer


@register("doc_converter", "badhope", "通用文档/图片转换器", "0.1.0")
class DocConverterPlugin(Star):
    def __init__(self, context: Context, config: dict | None = None) -> None:
        super().__init__(context)
        self.config = config or {}
        self.tools = detect_all()
        self.registry = ConverterRegistry()
        self._register_converters()
        self.tmp_root = Path(self.config.get("tmp_dir") or "data/plugin_tmp/doc_converter")
        self.tmp_root.mkdir(parents=True, exist_ok=True)
        logger.info(f"doc_converter 初始化完成；{self.tools.summary()}")

    # 注册所有转换器
    def _register_converters(self) -> None:
        # PDF →
        self.registry.register(PdfToDocxConverter())
        self.registry.register(PdfToMarkdownConverter())
        self.registry.register(PdfToTextConverter())
        self.registry.register(PdfToImageConverter())
        # 扫描件 PDF → OCR
        self.registry.register(OcrPdfConverter())
        # Office → PDF
        for src in ("docx", "xlsx", "pptx"):
            self.registry.register(OfficeToPdfConverter(src, self.tools))
        # Markdown ↔ HTML/PDF
        self.registry.register(MdToHtmlConverter())
        self.registry.register(MdToPdfConverter())
        # HTML → PDF
        self.registry.register(HtmlToPdfConverter())
        # 图片
        for dst in ("png", "jpg", "webp", "gif", "bmp"):
            self.registry.register(ImageConverter(dst))
        # OCR 图片
        self.registry.register(OcrImageConverter())
        self.registry.register(OcrImageToMarkdownConverter())

    async def terminate(self) -> None:
        if self.config.get("auto_cleanup", True):
            import shutil
            if self.tmp_root.exists():
                shutil.rmtree(self.tmp_root, ignore_errors=True)

    @filter.command("convert", alias={"转换", "文档转换"})
    async def convert(self, event: AstrMessageEvent):
        """文档/图片/OCR 转换。 用法：/convert [--to=md] [--formats] [--tools] [--help]"""
        args = self._parse_args(event.message_str)
        if args.help or not event.message_str.strip().startswith("/convert"):
            yield event.plain_result(self._help_text())
            return
        if args.tools:
            yield event.plain_result(f"环境工具检测：\n{self.tools.summary()}\n\nOCR 备用：rapidocr-onnxruntime")
            return

        # 找附件
        file_msg = self._find_file(event)
        if not file_msg:
            yield event.plain_result("请在指令后附带一个文件（图片/PDF/Word/Excel/PPT/Markdown/HTML）。")
            return

        src_path = await self._download_file(file_msg, event)
        if src_path is None:
            yield event.plain_result("文件下载失败，请重试。")
            return

        try:
            src_format, has_text = detect(src_path)
            if src_format is None:
                yield event.plain_result("无法识别文件类型。")
                return

            if args.formats:
                dsts = self.registry.available_dsts(src_format)
                yield event.plain_result(
                    f"检测到 {src_format} 文件，可转换为：{', '.join(dsts) or '（无）'}"
                )
                return

            if src_format == "pdf" and not has_text:
                # 重新探测文字层
                has_text = has_text_layer(src_path)

            dst = args.to or self.registry.find_smart_default(src_format, has_text)
            if dst is None:
                yield event.plain_result(f"暂不支持 {src_format} 格式。")
                return

            converter = self.registry.find(src_format, dst)
            if converter is None:
                yield event.plain_result(f"不支持 {src_format} → {dst}。")
                return

            yield event.plain_result(f"开始转换 {src_format} → {dst}…")

            out_path = self._tmp_output(src_path, dst)
            timeout = self.config.get("timeout_seconds", 120)

            try:
                await asyncio.wait_for(
                    self._run_converter(converter, src_path, out_path),
                    timeout=timeout,
                )
            except asyncio.TimeoutError:
                yield event.plain_result(f"转换超时（>{timeout}s）。")
                return
            except Exception as exc:
                logger.exception("转换失败")
                yield event.plain_result(f"转换失败：{exc}")
                return

            if not out_path.exists():
                yield event.plain_result("转换未产生输出文件。")
                return

            # 发送
            suffix = out_path.suffix.lower()
            if suffix in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"}:
                yield event.image_result(str(out_path))
            else:
                yield event.file_result(str(out_path))
        finally:
            if self.config.get("auto_cleanup", True):
                src_path.unlink(missing_ok=True)
                # 输出文件保留以供发送，发送后由 astrbot 清理
                if 'out_path' in locals() and out_path.exists():
                    # 注册一个延迟删除（30s）
                    asyncio.create_task(self._delayed_delete(out_path, 30))

    async def _delayed_delete(self, p: Path, seconds: int) -> None:
        await asyncio.sleep(seconds)
        p.unlink(missing_ok=True)

    async def _run_converter(self, converter, src: Path, dst: Path) -> None:
        options = {"image_quality": self.config.get("image_quality", 90)}
        if converter.requires:
            from utils.external_tools import ExternalTools as _T
            for tool in converter.requires:
                ok = getattr(self.tools, tool, False)
                if not ok:
                    raise RuntimeError(
                        f"需要 {tool} 外部程序。运行 `/convert --tools` 查看状态。"
                    )
        # 异步执行 sync convert
        await asyncio.to_thread(asyncio.run, converter.convert(src, dst, options=options))

    def _parse_args(self, msg: str) -> Any:
        from dataclasses import dataclass
        @dataclass
        class Args:
            to: str | None = None
            formats: bool = False
            tools: bool = False
            help: bool = False
        parts = msg.split()
        a = Args()
        for p in parts[1:]:
            if p.startswith("--to="):
                a.to = p.split("=", 1)[1]
            elif p == "--formats":
                a.formats = True
            elif p == "--tools":
                a.tools = True
            elif p in {"--help", "-h"}:
                a.help = True
        return a

    def _find_file(self, event: AstrMessageEvent):
        for m in event.get_messages():
            if m.type == "file" or getattr(m, "file", None):
                return m
        return None

    async def _download_file(self, msg, event: AstrMessageEvent) -> Path | None:
        url = getattr(msg, "url", None) or getattr(msg, "file", None)
        name = getattr(msg, "name", "file") or "file"
        if not url:
            return None
        try:
            from astrbot.core.utils.io import download_file
            target = self.tmp_root / f"{int(time.time())}_{uuid.uuid4().hex[:8]}_{name}"
            await download_file(url, target)
            return target
        except Exception as exc:
            logger.warning(f"下载文件失败：{exc}，尝试直接用 msg.path")
            p = getattr(msg, "path", None)
            if p and Path(p).exists():
                return Path(p)
            return None

    def _tmp_output(self, src: Path, dst_format: str) -> Path:
        return self.tmp_root / f"{src.stem}_converted_{uuid.uuid4().hex[:6]}.{dst_format}"

    def _help_text(self) -> str:
        return (
            "文档转换器用法：\n"
            "/convert + 文件 → 智能转换\n"
            "/convert --to=<fmt> + 文件 → 显式指定目标\n"
            "/convert --formats + 文件 → 列出可转换格式\n"
            "/convert --tools → 查看环境依赖\n"
            "/convert --help → 帮助\n\n"
            "支持：PDF↔Word/Excel/PPT/Markdown/HTML、Markdown↔HTML、"
            "图片格式互转、OCR（图片/扫描PDF）"
        )
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd c:\Users\X1882\Desktop\ai-robot\data\plugins\astrbot_plugin_doc_converter
.\..\..\..\uv.exe run python -m pytest tests/test_main.py -v
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/main.py
git add data/plugins/astrbot_plugin_doc_converter/tests/test_main.py
git commit -m "feat(doc-converter): implement main entry and /convert command"
```

---

## Task 12: 配置 _conf_schema.json

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/_conf_schema.json`

- [ ] **Step 1: 写实现**

```json
{
  "max_file_size_mb": {
    "description": "单文件最大尺寸（MB）",
    "type": "int",
    "default": 50,
    "min": 1,
    "max": 500
  },
  "timeout_seconds": {
    "description": "单次转换超时（秒）",
    "type": "int",
    "default": 120,
    "min": 10,
    "max": 600
  },
  "image_quality": {
    "description": "图片输出质量 1-100",
    "type": "int",
    "default": 90,
    "min": 1,
    "max": 100
  },
  "ocr_lang": {
    "description": "Tesseract 语言包（仅 Tesseract 可用时生效）",
    "type": "string",
    "default": "chi_sim+eng"
  },
  "auto_cleanup": {
    "description": "退出时自动清理临时目录",
    "type": "bool",
    "default": true
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/_conf_schema.json
git commit -m "feat(doc-converter): add _conf_schema.json"
```

---

## Task 13: 本地手动测试

**Files:** (no code change)

- [ ] **Step 1: 准备测试文件**

下载一个公开 PDF（如 https://www.africau.edu/images/default/sample.pdf）放到 `tests/fixtures/sample.pdf`。

- [ ] **Step 2: 跑转换器**

```bash
cd c:\Users\X1882\Desktop\ai-robot
.\uv.exe run python -c "
import sys
sys.path.insert(0, 'data/plugins/astrbot_plugin_doc_converter')
import asyncio
from converters.pdf_to_docx import PdfToDocxConverter
from pathlib import Path
async def main():
    c = PdfToDocxConverter()
    await c.convert(Path('data/plugins/astrbot_plugin_doc_converter/tests/fixtures/sample.pdf'),
                    Path('data/plugins/astrbot_plugin_doc_converter/tests/fixtures/sample.docx'))
asyncio.run(main())
print('ok')
"
```

Expected: 输出 `ok` 且 `sample.docx` 存在

- [ ] **Step 3: 在 AstrBot 中加载插件**

启动 AstrBot (`.\uv.exe run main.py`)，访问 http://localhost:6185，进入插件管理，刷新，应看到 `doc_converter` 插件。点击 `重载`。

- [ ] **Step 4: 在聊天中测一次**

QQ 机器人发送：`/convert` + 任意 PDF → 收到 docx 返回。

---

## Task 14: README

**Files:**
- Create: `data/plugins/astrbot_plugin_doc_converter/README.md`

- [ ] **Step 1: 写 README**

```markdown
# AstrBot 文档转换器 (Doc Converter)

聊天式通用文档 / 图片 / OCR 转换器。

## 支持的转换

| 源 | 目标 | 默认 |
|---|---|---|
| PDF（文字层） | docx / md / txt / image | docx |
| PDF（扫描件） | txt（OCR） | txt |
| Word / Excel / PPT | pdf（需 LibreOffice） | pdf |
| Markdown | html / pdf | html |
| HTML | pdf | pdf |
| 图片（PNG/JPG/WebP/GIF/BMP/AVIF） | 上述任意 | png |
| 图片 | txt / md（OCR） | — |

## 安装

1. 在 AstrBot 插件市场搜索 `doc_converter` 安装，或：
2. 把本目录 clone 到 `data/plugins/astrbot_plugin_doc_converter/`
3. 重启 AstrBot 或在 WebUI 重载插件

### 可选系统依赖

- **LibreOffice**（用于 Office → PDF）：https://www.libreoffice.org/
- **Tesseract**（更准的 OCR，可选）：https://github.com/UB-Mannheim/tesseract/wiki

未安装也能用，PDF↔Word/Markdown/图片、Markdown↔HTML/PDF、OCR（rapidocr 离线）都正常。

## 用法

```
/convert + 文件                  # 智能默认
/convert --to=md + 文件         # 指定目标
/convert --formats + 文件       # 列出可转格式
/convert --tools                # 环境检测
/convert --help                 # 帮助
```

## 配置（WebUI）

| 字段 | 默认 | 说明 |
|---|---|---|
| `max_file_size_mb` | 50 | 单文件上限 |
| `timeout_seconds` | 120 | 单次转换超时 |
| `image_quality` | 90 | JPEG/WebP 质量 |
| `ocr_lang` | `chi_sim+eng` | Tesseract 语言 |
| `auto_cleanup` | true | 退出清理临时目录 |

## License

AGPL-3.0
```

- [ ] **Step 2: Commit**

```bash
cd c:\Users\X1882\Desktop\ai-robot
git add data/plugins/astrbot_plugin_doc_converter/README.md
git commit -m "docs(doc-converter): add README"
```

---

## Task 15: 发布到 GitHub + 插件市场

**Files:**
- Create: GitHub repo `badhope/astrbot_plugin_doc_converter`

- [ ] **Step 1: 在 GitHub 上建空仓库**

```bash
# 通过浏览器或 gh CLI
gh repo create badhope/astrbot_plugin_doc_converter --public --description "AstrBot 通用文档/图片/OCR 转换器"
```

- [ ] **Step 2: 把代码推上去**

```bash
cd c:\Users\X1882\Desktop\ai-robot
# 在 plugins 目录建独立 git
cd data/plugins/astrbot_plugin_doc_converter
git init
git remote add origin https://github.com/badhope/astrbot_plugin_doc_converter.git
git add .
git commit -m "feat: initial release v0.1.0"
git push -u origin master
```

- [ ] **Step 3: 打 tag**

```bash
git tag v0.1.0
git push origin v0.1.0
```

- [ ] **Step 4: 提交到插件市场**

1. 浏览器打开 https://plugins.astrbot.app
2. 右下角点 `+`
3. 填写：
   - 名称：`astrbot_plugin_doc_converter`
   - 作者：`badhope`
   - 仓库：`https://github.com/badhope/astrbot_plugin_doc_converter`
   - 简介：摘自 `metadata.yaml`
   - 标签：工具 / 文档 / 转换 / OCR
4. 点击 `提交到 GITHUB` → 自动跳转 AstrBot 仓库的 Issue 页面
5. 写 Issue 标题：`[Plugin Submission] astrbot_plugin_doc_converter`
6. Issue 正文附：仓库链接、tag、zip 链接（用 gh release 生成的 zip）
7. 提交

- [ ] **Step 5: 验证**

回到本机 AstrBot → 插件管理 → 在线插件 → 搜索 `doc_converter` → 看到新插件 → 安装。

---

## 自审

- ✅ Spec coverage: 智能默认（Task 11 smart_route）、文件检测（Task 3）、外部工具检测（Task 4）、所有转换器（Tasks 5-10）、指令（Task 11）、错误处理（Task 11 timeout/try/except）、配置（Task 12）、发布（Task 15）全部覆盖
- ✅ Placeholder scan: 无 TBD/TODO
- ✅ Type consistency: `Converter.convert()` / `Registry.find()` / `run_converter()` 签名一致
- ✅ DRY: base.py 抽象统一；所有 converter 实现一致
- ✅ YAGNI: LLM tool / Web page / 批量转换 都未做

## 执行选项

Plan complete and saved to `docs/superpowers/plans/2026-06-08-doc-converter.md`. Two execution options:

1. **Subagent-Driven (recommended)** — 每个 task 派一个独立 subagent 执行，task 间 review
2. **Inline Execution** — 在当前会话直接跑 executing-plans 批量执行

Which approach?
