import utils.external_tools as et
from utils.external_tools import ExternalTools, detect_all


def test_detect_all_returns_object():
    tools = detect_all()
    assert isinstance(tools, ExternalTools)
    assert isinstance(tools.libreoffice, bool)
    assert isinstance(tools.tesseract, bool)


def test_office_available_with_libreoffice():
    t = ExternalTools(libreoffice=True, tesseract=False)
    assert t.office_available() is True


def test_ocr_available_with_tesseract():
    t = ExternalTools(libreoffice=False, tesseract=True)
    assert t.ocr_available() is True


def test_ocr_via_rapidocr_flag(monkeypatch):
    """If rapidocr is importable, OCR is always available even without tesseract."""
    monkeypatch.setattr(et, "_HAS_RAPIDOCR", True)
    t = ExternalTools(libreoffice=False, tesseract=False)
    assert t.ocr_available() is True


def test_ocr_unavailable_without_anything(monkeypatch):
    monkeypatch.setattr(et, "_HAS_RAPIDOCR", False)
    t = ExternalTools(libreoffice=False, tesseract=False)
    assert t.ocr_available() is False


def test_summary_format():
    t = ExternalTools(libreoffice=True, tesseract=False)
    s = t.summary()
    assert "LibreOffice" in s
    assert "Tesseract" in s
