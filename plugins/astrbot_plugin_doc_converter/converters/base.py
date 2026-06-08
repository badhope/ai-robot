from __future__ import annotations

import asyncio
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol


@dataclass
class ConvertResult:
    success: bool
    output_path: Path | None
    message: str = ""


class Converter(Protocol):
    src_format: str
    dst_format: str
    requires: list[str]

    async def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None: ...


class ConverterRegistry:
    def __init__(self) -> None:
        self._items: dict[tuple[str, str], Converter] = {}

    def register(self, converter: Converter) -> None:
        self._items[(converter.src_format, converter.dst_format)] = converter

    def find(self, src: str, dst: str) -> Converter | None:
        return self._items.get((src, dst))

    def available_dsts(self, src: str) -> list[str]:
        return sorted({d for (s, d) in self._items if s == src})

    def find_smart_default(self, src: str, has_text: bool) -> str | None:
        candidates = self.available_dsts(src)
        if not candidates:
            return None
        if src == "pdf":
            if has_text and "docx" in candidates:
                return "docx"
            if not has_text and "txt" in candidates:
                return "txt"
            return "docx" if "docx" in candidates else candidates[0]
        priority = {
            "docx": "pdf",
            "xlsx": "pdf",
            "pptx": "pdf",
            "md": "html",
            "html": "pdf",
            "image": "png",
            "txt": "md",
        }
        if src in priority and priority[src] in candidates:
            return priority[src]
        return candidates[0]


async def run_converter(
    converter: Converter,
    input_path: Path,
    output_path: Path,
    *,
    options: dict[str, Any] | None = None,
) -> None:
    """Run a converter. If the convert method is sync, wrap with to_thread.

    Most real converters (pdf2docx, pymupdf) are sync and CPU-bound;
    we run them in a thread to avoid blocking the event loop.
    """
    result = converter.convert(input_path, output_path, options=options)
    if asyncio.iscoroutine(result):
        await result
    else:
        # Sync implementation: run in default executor
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(
            None,
            _call_sync_convert,
            converter,
            input_path,
            output_path,
            options,
        )


def _call_sync_convert(converter, input_path, output_path, options) -> None:
    converter.convert(input_path, output_path, options=options)
