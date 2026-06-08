from __future__ import annotations

from pathlib import Path
from typing import Any


class ImageConverter:
    """图片格式互转，基于 Pillow。"""

    src_format = "image"
    requires: list[str] = []

    def __init__(self, dst_format: str) -> None:
        self.dst_format = dst_format

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        from PIL import Image

        quality = int((options or {}).get("image_quality", 90))
        with Image.open(input_path) as im:
            # RGBA → JPG 时需要先合成到 RGB（白底）
            target = self.dst_format.upper()
            if target in {"JPG", "JPEG"} and im.mode in {"RGBA", "LA", "P"}:
                im = im.convert("RGB")
            save_kwargs: dict[str, Any] = {}
            if target in {"JPG", "JPEG", "WEBP"}:
                save_kwargs["quality"] = quality
            im.save(output_path, **save_kwargs)
