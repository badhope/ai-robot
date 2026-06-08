from __future__ import annotations

from pathlib import Path
from typing import Any


_BASE_CSS = (
    "body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
    "max-width:780px;margin:2em auto;line-height:1.6;padding:0 1em;color:#222;}"
    "h1,h2,h3{border-bottom:1px solid #eee;padding-bottom:.3em;}"
    "pre{background:#f6f8fa;padding:1em;overflow:auto;border-radius:6px;}"
    "code{background:#f6f8fa;padding:.1em .3em;border-radius:3px;font-size:90%;}"
    "table{border-collapse:collapse;margin:1em 0;}"
    "th,td{border:1px solid #ddd;padding:.4em .8em;}"
    "img{max-width:100%;}"
    "blockquote{border-left:4px solid #ddd;color:#666;margin:1em 0;"
    "padding:0 1em;}"
)


class MdToHtmlConverter:
    """Markdown → HTML，附带简洁样式。"""

    src_format = "md"
    dst_format = "html"
    requires: list[str] = []

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        import markdown

        text = input_path.read_text(encoding="utf-8")
        body = markdown.markdown(
            text, extensions=["fenced_code", "tables", "toc", "sane_lists"]
        )
        html = (
            "<!doctype html><html><head><meta charset='utf-8'>"
            f"<style>{_BASE_CSS}</style>"
            f"</head><body>{body}</body></html>"
        )
        output_path.write_text(html, encoding="utf-8")
