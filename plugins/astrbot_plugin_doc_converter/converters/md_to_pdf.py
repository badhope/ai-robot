from __future__ import annotations

from pathlib import Path
from typing import Any

from converters.md_html import _BASE_CSS


class MdToPdfConverter:
    """Markdown → PDF，经 HTML + weasyprint。"""

    src_format = "md"
    dst_format = "pdf"
    requires: list[str] = []

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        import markdown
        from weasyprint import HTML

        text = input_path.read_text(encoding="utf-8")
        body = markdown.markdown(
            text, extensions=["fenced_code", "tables", "toc", "sane_lists"]
        )
        html = (
            "<!doctype html><html><head><meta charset='utf-8'>"
            f"<style>{_BASE_CSS}</style>"
            f"</head><body>{body}</body></html>"
        )
        HTML(string=html).write_pdf(str(output_path))
