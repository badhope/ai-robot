from __future__ import annotations

import shutil
from dataclasses import dataclass


try:
    import rapidocr_onnxruntime  # noqa: F401

    _HAS_RAPIDOCR = True
except ImportError:
    _HAS_RAPIDOCR = False


@dataclass
class ExternalTools:
    libreoffice: bool
    tesseract: bool

    def office_available(self) -> bool:
        return self.libreoffice

    def ocr_available(self) -> bool:
        if self.tesseract:
            return True
        return _HAS_RAPIDOCR

    def summary(self) -> str:
        rapidocr = "✓" if _HAS_RAPIDOCR else "✗"
        return (
            f"LibreOffice: {'✓' if self.libreoffice else '✗'}  "
            f"Tesseract: {'✓' if self.tesseract else '✗'}  "
            f"RapidOCR: {rapidocr}"
        )


def _which(name: str) -> bool:
    return shutil.which(name) is not None


def detect_all() -> ExternalTools:
    return ExternalTools(
        libreoffice=_which("libreoffice") or _which("soffice"),
        tesseract=_which("tesseract"),
    )
