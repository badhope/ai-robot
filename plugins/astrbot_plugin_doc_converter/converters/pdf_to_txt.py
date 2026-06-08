from __future__ import annotations

from pathlib import Path
from typing import Any


class PdfToTextConverter:
    """PDF → 纯文本，基于 pymupdf。"""

    src_format = "pdf"
    dst_format = "txt"
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
            parts = [page.get_text() for page in doc]
        finally:
            doc.close()
        output_path.write_text("\n\n".join(parts), encoding="utf-8")
