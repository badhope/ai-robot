from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import Any


class OcrImageConverter:
    """图片 → 纯文本（OCR）。"""

    src_format = "image"
    dst_format = "txt"
    requires: list[str] = []

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        lang = (options or {}).get("ocr_lang", "chi_sim+eng")
        text = run_ocr(input_path, lang)
        output_path.write_text(text, encoding="utf-8")


class OcrImageToMarkdownConverter:
    """图片 → Markdown 包装（OCR 后包成代码块）。"""

    src_format = "image"
    dst_format = "md"
    requires: list[str] = []

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        lang = (options or {}).get("ocr_lang", "chi_sim+eng")
        text = run_ocr(input_path, lang)
        output_path.write_text(f"```\n{text}\n```\n", encoding="utf-8")


def run_ocr(image_path: Path, lang: str) -> str:
    """Run OCR; prefer tesseract, fall back to rapidocr-onnxruntime."""
    if shutil.which("tesseract"):
        return _tesseract(image_path, lang)
    return _rapidocr(image_path)


def _tesseract(image_path: Path, lang: str) -> str:
    cmd = ["tesseract", str(image_path), "-", "-l", lang]
    completed = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if completed.returncode != 0:
        raise RuntimeError(f"tesseract 失败: {completed.stderr}")
    return completed.stdout


def _rapidocr(image_path: Path) -> str:
    from rapidocr_onnxruntime import RapidOCR

    engine = RapidOCR()
    result, _ = engine(str(image_path))
    if not result:
        return ""
    lines = [line[1] for line in result if line and len(line) > 1]
    return "\n".join(lines)
