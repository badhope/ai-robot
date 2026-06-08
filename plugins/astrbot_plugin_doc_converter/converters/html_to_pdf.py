from __future__ import annotations

from pathlib import Path
from typing import Any


class HtmlToPdfConverter:
    """HTML → PDF，weasyprint。"""

    src_format = "html"
    dst_format = "pdf"
    requires: list[str] = []

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        from weasyprint import HTML

        HTML(filename=str(input_path)).write_pdf(str(output_path))
