from __future__ import annotations

from pathlib import Path
from typing import Any


class PdfToImageConverter:
    """PDF → 图片（首页），基于 pymupdf。"""

    src_format = "pdf"
    dst_format = "image"
    requires: list[str] = []

    def convert(
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
            dpi = int((options or {}).get("dpi", 150))
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat)
            pix.save(str(output_path))
        finally:
            doc.close()
