from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from converters.base import ConverterRegistry, run_converter
from converters.html_to_pdf import HtmlToPdfConverter
from converters.image_convert import ImageConverter
from converters.md_html import MdToHtmlConverter
from converters.md_to_pdf import MdToPdfConverter
from converters.ocr_image import OcrImageConverter, OcrImageToMarkdownConverter
from converters.ocr_pdf import OcrPdfConverter
from converters.office_to_pdf import OfficeToPdfConverter
from converters.pdf_to_docx import PdfToDocxConverter
from converters.pdf_to_image import PdfToImageConverter
from converters.pdf_to_md import PdfToMarkdownConverter
from converters.pdf_to_txt import PdfToTextConverter
from converters.txt_md import TxtToMdConverter
from utils.external_tools import ExternalTools, detect_all
from utils.file_detect import detect, has_text_layer

from astrbot.api import logger
from astrbot.api.event import AstrMessageEvent, filter
from astrbot.api.star import Context, Star, register


@register("doc_converter", "badhope", "通用文档/图片转换器", "0.1.0")
class DocConverterPlugin(Star):
    def __init__(self, context: Context, config: dict | None = None) -> None:
        super().__init__(context)
        self.config = config or {}
        self.handler = ConvertHandler.from_config(self.config)

    async def terminate(self) -> None:
        if self.handler is not None:
            self.handler.cleanup()

    @filter.command("convert", alias={"转换", "文档转换"})
    async def convert(self, event: AstrMessageEvent):
        async for result in self.handler.handle(event):
            yield result


# ============== core logic (testable) ==============


@dataclass
class ConvertArgs:
    to: str | None = None
    formats: bool = False
    tools: bool = False
    help: bool = False


class ConvertHandler:
    """独立可测的转换处理逻辑。"""

    IMAGE_DSTS = ("png", "jpg", "webp", "gif", "bmp")

    def __init__(
        self,
        tmp_root: Path,
        tools: ExternalTools,
        *,
        timeout_seconds: int = 120,
        max_file_size_mb: int = 50,
        image_quality: int = 90,
        ocr_lang: str = "chi_sim+eng",
        auto_cleanup: bool = True,
    ) -> None:
        self.tmp_root = tmp_root
        self.tmp_root.mkdir(parents=True, exist_ok=True)
        self.tools = tools
        self.timeout_seconds = timeout_seconds
        self.max_file_size_mb = max_file_size_mb
        self.image_quality = image_quality
        self.ocr_lang = ocr_lang
        self.auto_cleanup = auto_cleanup
        self.registry = self._build_registry(tools)

    @classmethod
    def from_config(cls, config: dict[str, Any]) -> ConvertHandler:
        return cls(
            tmp_root=Path(config.get("tmp_dir") or "data/plugin_tmp/doc_converter"),
            tools=detect_all(),
            timeout_seconds=int(config.get("timeout_seconds", 120)),
            max_file_size_mb=int(config.get("max_file_size_mb", 50)),
            image_quality=int(config.get("image_quality", 90)),
            ocr_lang=str(config.get("ocr_lang", "chi_sim+eng")),
            auto_cleanup=bool(config.get("auto_cleanup", True)),
        )

    def _build_registry(self, tools: ExternalTools) -> ConverterRegistry:
        reg = ConverterRegistry()
        reg.register(PdfToDocxConverter())
        reg.register(PdfToMarkdownConverter())
        reg.register(PdfToTextConverter())
        reg.register(PdfToImageConverter())
        reg.register(OcrPdfConverter())
        for src in ("docx", "xlsx", "pptx"):
            reg.register(OfficeToPdfConverter(src, tools))
        reg.register(MdToHtmlConverter())
        reg.register(MdToPdfConverter())
        reg.register(TxtToMdConverter())
        reg.register(HtmlToPdfConverter())
        for dst in self.IMAGE_DSTS:
            reg.register(ImageConverter(dst))
        reg.register(OcrImageConverter())
        reg.register(OcrImageToMarkdownConverter())
        return reg

    def cleanup(self) -> None:
        import shutil

        if self.auto_cleanup and self.tmp_root.exists():
            shutil.rmtree(self.tmp_root, ignore_errors=True)

    async def handle(self, event: Any):
        """Generator that yields result tuples for each message piece."""
        args = self._parse_args(getattr(event, "message_str", ""))
        if args.help:
            yield event.plain_result(self._help_text())
            return
        if args.tools:
            yield event.plain_result(
                f"环境工具检测：\n{self.tools.summary()}\n\nOCR 备用：rapidocr-onnxruntime",
            )
            return

        file_msg = self._find_file(event)
        if file_msg is None:
            yield event.plain_result(
                "请在指令后附带一个文件（图片/PDF/Word/Excel/PPT/Markdown/HTML）。",
            )
            return

        src_path = await self._download_file(file_msg)
        if src_path is None:
            yield event.plain_result("文件下载失败，请重试。")
            return

        try:
            src_format, has_text = detect(src_path)
            if src_format is None:
                yield event.plain_result("无法识别文件类型。")
                return

            if args.formats:
                dsts = self.registry.available_dsts(src_format)
                yield event.plain_result(
                    f"检测到 {src_format} 文件，可转换为：{', '.join(dsts) or '（无）'}",
                )
                return

            if src_format == "pdf" and not has_text:
                has_text = has_text_layer(src_path)

            dst = args.to or self.registry.find_smart_default(src_format, has_text)
            if dst is None:
                yield event.plain_result(f"暂不支持 {src_format} 格式。")
                return

            converter = self.registry.find(src_format, dst)
            if converter is None:
                yield event.plain_result(f"不支持 {src_format} → {dst}。")
                return

            yield event.plain_result(f"开始转换 {src_format} → {dst}…")

            out_path = self._tmp_output(src_path, dst)
            options = {
                "image_quality": self.image_quality,
                "ocr_lang": self.ocr_lang,
            }

            try:
                await asyncio.wait_for(
                    run_converter(converter, src_path, out_path, options=options),
                    timeout=self.timeout_seconds,
                )
            except asyncio.TimeoutError:
                yield event.plain_result(f"转换超时（>{self.timeout_seconds}s）。")
                return
            except Exception as exc:
                logger.exception("转换失败")
                yield event.plain_result(f"转换失败：{exc}")
                return

            if not out_path.exists():
                yield event.plain_result("转换未产生输出文件。")
                return

            suffix = out_path.suffix.lower()
            if suffix in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"}:
                yield event.image_result(str(out_path))
            else:
                yield event.file_result(str(out_path))
        finally:
            src_path.unlink(missing_ok=True)

    def _parse_args(self, msg: str) -> ConvertArgs:
        a = ConvertArgs()
        for p in msg.split()[1:]:
            if p.startswith("--to="):
                a.to = p.split("=", 1)[1]
            elif p == "--formats":
                a.formats = True
            elif p == "--tools":
                a.tools = True
            elif p in {"--help", "-h"}:
                a.help = True
        return a

    def _find_file(self, event: Any):
        for m in event.get_messages():
            if getattr(m, "type", None) == "file" or getattr(m, "file", None):
                return m
        return None

    async def _download_file(self, msg: Any) -> Path | None:
        url = getattr(msg, "url", None) or getattr(msg, "file", None)
        name = getattr(msg, "name", "file") or "file"
        if not url:
            return None
        # 优先用 msg.path（AstrBot 通常会把下载好的文件放在这里）
        local = getattr(msg, "path", None)
        if local and Path(local).exists():
            src = Path(local)
        else:
            # 退化为复制 url 到 tmp
            try:
                target = (
                    self.tmp_root / f"{int(time.time())}_{uuid.uuid4().hex[:8]}_{name}"
                )
                target.parent.mkdir(parents=True, exist_ok=True)
                from urllib.request import urlretrieve

                await asyncio.to_thread(urlretrieve, url, str(target))
                return target
            except Exception as exc:
                logger.warning(f"下载文件失败：{exc}")
                return None
        # 复制到 tmp
        target = self.tmp_root / f"{int(time.time())}_{uuid.uuid4().hex[:8]}_{src.name}"
        await asyncio.to_thread(_copy_file, src, target)
        return target

    def _tmp_output(self, src: Path, dst_format: str) -> Path:
        return self.tmp_root / f"{src.stem}_to_{uuid.uuid4().hex[:6]}.{dst_format}"

    def _help_text(self) -> str:
        return (
            "文档转换器用法：\n"
            "/convert + 文件 → 智能转换\n"
            "/convert --to=<fmt> + 文件 → 显式指定目标\n"
            "/convert --formats + 文件 → 列出可转换格式\n"
            "/convert --tools → 查看环境依赖\n"
            "/convert --help → 帮助\n\n"
            "支持：PDF↔Word/Excel/PPT/Markdown/HTML、Markdown↔HTML、"
            "图片格式互转、OCR（图片/扫描PDF）"
        )


def _copy_file(src: Path, dst: Path) -> None:
    import shutil

    shutil.copy2(src, dst)
