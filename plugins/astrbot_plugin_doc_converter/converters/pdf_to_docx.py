from __future__ import annotations

from pathlib import Path
from typing import Any


class PdfToDocxConverter:
    """PDF → Word (.docx)，基于 pdf2docx 库。"""

    src_format = "pdf"
    dst_format = "docx"
    requires: list[str] = []

    def convert(
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
