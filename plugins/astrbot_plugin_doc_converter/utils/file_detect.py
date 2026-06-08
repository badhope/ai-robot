from __future__ import annotations

import zipfile
from pathlib import Path

# (magic_bytes_prefix, detected_format) ; format=None 表示需进一步检查 ZIP 内容
_MAGIC = [
    (b"%PDF", "pdf"),
    (b"PK\x03\x04", None),  # ZIP-based: docx/xlsx/pptx
    (b"\x89PNG\r\n\x1a\n", "image"),
    (b"\xff\xd8\xff", "image"),  # JPEG/JFIF/Exif
    (b"GIF87a", "image"),
    (b"GIF89a", "image"),
    (b"RIFF", "image"),  # WEBP
]

_ZIP_MEMBER = {
    "word/": "docx",
    "xl/": "xlsx",
    "ppt/": "pptx",
}

_TEXT_SUFFIXES = {
    "md": "md",
    "markdown": "md",
    "txt": "txt",
    "html": "html",
    "htm": "html",
    "csv": "csv",
    "json": "json",
    "xml": "xml",
    "yaml": "yaml",
    "yml": "yaml",
}

_SUFFIX_FALLBACK = {
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
    "tiff": ("image", False),
}


def detect(path: Path) -> tuple[str | None, bool]:
    """Return (format, has_text_layer).

    format: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'md' | 'html' | 'image' | 'txt' | None
    has_text_layer: bool，仅对 pdf 有意义（其他地方用 True）
    """
    suffix = path.suffix.lower().lstrip(".")
    if suffix in _TEXT_SUFFIXES:
        return _TEXT_SUFFIXES[suffix], True

    try:
        head = path.read_bytes()[:16]
    except OSError:
        return _suffix_fallback(suffix)

    for magic, fmt in _MAGIC:
        if head.startswith(magic):
            if fmt == "image":
                return "image", False
            if magic == b"PK\x03\x04":
                return _detect_office(path), True
            if fmt is not None:
                return fmt, True

    return _suffix_fallback(suffix)


def _suffix_fallback(suffix: str) -> tuple[str | None, bool]:
    return _SUFFIX_FALLBACK.get(suffix, (None, False))


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
    except Exception:
        return True
    try:
        total = 0
        for page in doc:
            total += len(page.get_text().strip())
            if total > 20:
                return True
        return False
    finally:
        doc.close()
