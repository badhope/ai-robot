from __future__ import annotations

from pathlib import Path
from typing import Any


class PdfToMarkdownConverter:
    """PDF → Markdown，基于 pymupdf4llm。"""

    src_format = "pdf"
    dst_format = "md"
    requires: list[str] = []

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        import pymupdf4llm

        md = pymupdf4llm.to_markdown(str(input_path))
        output_path.write_text(md, encoding="utf-8")
