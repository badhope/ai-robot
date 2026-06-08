from __future__ import annotations

from pathlib import Path
from typing import Any


class TxtToMdConverter:
    """纯文本 → Markdown：按行加 `# ` 标题判断，保留原文。"""

    src_format = "txt"
    dst_format = "md"
    requires: list[str] = []

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        text = input_path.read_text(encoding="utf-8", errors="replace")
        lines = text.splitlines() or [""]
        out: list[str] = ["```text"]
        out.extend(lines)
        out.append("```")
        output_path.write_text("\n".join(out) + "\n", encoding="utf-8")
