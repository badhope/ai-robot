from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Any

from converters.ocr_image import run_ocr


class OcrPdfConverter:
    """扫描件 PDF → 纯文本（渲染每页为图后 OCR）。"""

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

        lang = (options or {}).get("ocr_lang", "chi_sim+eng")
        doc = fitz.open(input_path)
        try:
            all_text: list[str] = []
            with tempfile.TemporaryDirectory() as tmp:
                tmpdir = Path(tmp)
                for i, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=200)
                    img_path = tmpdir / f"p{i}.png"
                    pix.save(str(img_path))
                    text = run_ocr(img_path, lang)
                    all_text.append(text)
        finally:
            doc.close()
        output_path.write_text("\n\n".join(all_text), encoding="utf-8")
