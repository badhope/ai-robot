import asyncio
from dataclasses import dataclass, field
from pathlib import Path

import pytest

from main import ConvertHandler
from utils.external_tools import ExternalTools


# ---------------- helpers ----------------

def make_event(*, message_str: str, file_url: str | None = None, file_name: str = "a.bin"):
    e = type("E", (), {})()
    e.message_str = message_str
    e.unified_msg_origin = "test:0"

    captured: list[tuple[str, object]] = []

    def plain(s: str):
        captured.append(("plain", s))

    def image(s: str):
        captured.append(("image", s))

    def file(s: str):
        captured.append(("file", s))

    e.plain_result = plain
    e.image_result = image
    e.file_result = file
    e.get_sender_name = lambda: "tester"

    msgs: list[object] = []
    if file_url:
        m = type("M", (), {})()
        m.type = "file"
        m.url = file_url
        m.file = file_url
        m.name = file_name
        m.path = file_url
        msgs.append(m)
    e.get_messages = lambda: msgs
    e._captured = captured
    return e


def make_handler(tmp_path: Path, **kwargs) -> ConvertHandler:
    return ConvertHandler(
        tmp_root=tmp_path / "tmp",
        tools=ExternalTools(libreoffice=False, tesseract=False),
        **kwargs,
    )


async def _collect(handler, event):
    return [r async for r in handler.handle(event)]


def _run(coro):
    return asyncio.run(coro)


# ---------------- tests ----------------

def test_help_message(tmp_path: Path):
    h = make_handler(tmp_path)
    e = make_event(message_str="/convert --help")
    _run(_collect(h, e))
    texts = [s for kind, s in e._captured if kind == "plain"]
    assert any("用法" in t for t in texts)


def test_tools_message(tmp_path: Path):
    h = make_handler(tmp_path)
    e = make_event(message_str="/convert --tools")
    _run(_collect(h, e))
    texts = [s for kind, s in e._captured if kind == "plain"]
    assert any("LibreOffice" in t for t in texts)


def test_no_file(tmp_path: Path):
    h = make_handler(tmp_path)
    e = make_event(message_str="/convert")
    _run(_collect(h, e))
    texts = [s for kind, s in e._captured if kind == "plain"]
    assert any("文件" in t for t in texts)


def test_formats_command(tmp_path: Path):
    h = make_handler(tmp_path)
    p = tmp_path / "a.txt"
    p.write_text("hi", encoding="utf-8")
    e = make_event(message_str="/convert --formats", file_url=str(p), file_name="a.txt")
    _run(_collect(h, e))
    texts = [s for kind, s in e._captured if kind == "plain"]
    assert any("txt" in t for t in texts)


def test_convert_txt_to_md(tmp_path: Path):
    h = make_handler(tmp_path)
    p = tmp_path / "a.txt"
    p.write_text("hello world", encoding="utf-8")
    e = make_event(message_str="/convert", file_url=str(p), file_name="a.txt")
    _run(_collect(h, e))
    # 至少有一条 plain 和一条 file
    kinds = [k for k, _ in e._captured]
    assert "plain" in kinds
    assert "file" in kinds


def test_convert_png_to_png_smart_default(tmp_path: Path):
    """PNG 智能默认转 PNG（同格式）。"""
    from PIL import Image
    h = make_handler(tmp_path)
    p = tmp_path / "a.png"
    Image.new("RGB", (10, 10), (0, 255, 0)).save(p)
    e = make_event(message_str="/convert", file_url=str(p), file_name="a.png")
    _run(_collect(h, e))
    # 文件成功转换 + 发送
    file_results = [s for k, s in e._captured if k in ("file", "image")]
    assert file_results


def test_unsupported_format(tmp_path: Path):
    h = make_handler(tmp_path)
    p = tmp_path / "a.xyz"
    p.write_text("xxx", encoding="utf-8")
    e = make_event(message_str="/convert", file_url=str(p), file_name="a.xyz")
    _run(_collect(h, e))
    texts = [s for kind, s in e._captured if kind == "plain"]
    assert any("无法识别" in t or "不支持" in t for t in texts)


def test_parse_args():
    h = make_handler(Path("/tmp"))
    a = h._parse_args("/convert --to=md --formats")
    assert a.to == "md"
    assert a.formats is True
    assert a.help is False


def test_parse_args_help():
    h = make_handler(Path("/tmp"))
    a = h._parse_args("/转换 --help")
    assert a.help is True
