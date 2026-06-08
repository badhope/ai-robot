from pathlib import Path

import pytest

from converters.base import ConverterRegistry, ConvertResult


class _StubConverter:
    def __init__(self, src: str, dst: str) -> None:
        self.src_format = src
        self.dst_format = dst
        self.requires: list[str] = []

    async def convert(self, input_path, output_path, *, options=None):
        output_path.write_text("# ok", encoding="utf-8")


def test_registry_register_and_find():
    reg = ConverterRegistry()
    c = _StubConverter("txt", "md")
    reg.register(c)
    assert reg.find("txt", "md") is c
    assert reg.find("txt", "pdf") is None


def test_registry_available_dsts():
    reg = ConverterRegistry()
    reg.register(_StubConverter("txt", "md"))
    reg.register(_StubConverter("txt", "pdf"))
    assert set(reg.available_dsts("txt")) == {"md", "pdf"}
    assert reg.available_dsts("docx") == []


def test_smart_default_pdf_with_text():
    reg = ConverterRegistry()
    reg.register(_StubConverter("pdf", "docx"))
    reg.register(_StubConverter("pdf", "txt"))
    reg.register(_StubConverter("pdf", "md"))
    # has_text=True → 优先 docx
    assert reg.find_smart_default("pdf", has_text=True) == "docx"


def test_smart_default_pdf_without_text():
    reg = ConverterRegistry()
    reg.register(_StubConverter("pdf", "docx"))
    reg.register(_StubConverter("pdf", "txt"))
    reg.register(_StubConverter("pdf", "md"))
    # has_text=False（扫描件）→ 走 txt（OCR）
    assert reg.find_smart_default("pdf", has_text=False) == "txt"


def test_smart_default_docx_to_pdf():
    reg = ConverterRegistry()
    reg.register(_StubConverter("docx", "pdf"))
    reg.register(_StubConverter("docx", "txt"))
    assert reg.find_smart_default("docx", has_text=True) == "pdf"


def test_smart_default_image_to_png():
    reg = ConverterRegistry()
    reg.register(_StubConverter("image", "png"))
    reg.register(_StubConverter("image", "jpg"))
    assert reg.find_smart_default("image", has_text=False) == "png"


def test_smart_default_no_dst():
    reg = ConverterRegistry()
    assert reg.find_smart_default("xyz", has_text=True) is None


def test_convert_result_dataclass():
    r = ConvertResult(success=True, output_path=Path("a.md"), message="ok")
    assert r.success is True
    assert r.message == "ok"
