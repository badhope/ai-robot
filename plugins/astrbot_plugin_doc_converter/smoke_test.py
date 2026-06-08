"""End-to-end smoke test: run real conversions without AstrBot.

Validates that the converters actually produce valid output for the
common happy paths (txt→md, png→jpg, md→html).
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

# Ensure the plugin root is on sys.path so `main` and `converters` import cleanly.
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from main import ConvertHandler  # noqa: E402
from utils.external_tools import ExternalTools  # noqa: E402


class _PlainEvent:
    """Minimal event stand-in that records the last 'sent' file path."""

    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []
        self.message_str = "/convert"
        self.unified_msg_origin = "smoke:0"
        self._msgs: list[object] = []

    def plain_result(self, s: str) -> tuple[str, str]:
        self.sent.append(("plain", s))
        return ("plain", s)

    def image_result(self, s: str) -> tuple[str, str]:
        self.sent.append(("image", s))
        return ("image", s)

    def file_result(self, s: str) -> tuple[str, str]:
        self.sent.append(("file", s))
        return ("file", s)

    def get_sender_name(self) -> str:
        return "smoke"

    def get_messages(self) -> list[object]:
        return self._msgs

    def attach(self, path: Path, name: str) -> None:
        m = type("M", (), {})()
        m.type = "file"
        m.url = str(path)
        m.file = str(path)
        m.name = name
        m.path = str(path)
        self._msgs.append(m)


def _run(handler: ConvertHandler, event: _PlainEvent) -> None:
    import asyncio

    async def _drive() -> None:
        async for _ in handler.handle(event):
            pass

    asyncio.run(_drive())


def case_txt_to_md(tmp: Path) -> None:
    src = tmp / "hello.txt"
    src.write_text("Hello, world!\nLine 2.\n", encoding="utf-8")
    handler = ConvertHandler(
        tmp_root=tmp / "tmp",
        tools=ExternalTools(libreoffice=False, tesseract=False),
    )
    ev = _PlainEvent()
    ev.attach(src, "hello.txt")
    _run(handler, ev)
    assert any(k == "plain" for k, _ in ev.sent), "expected a plain status message"
    assert any(k == "file" for k, _ in ev.sent), "expected an output file"
    out_path = Path([s for k, s in ev.sent if k == "file"][0])
    assert out_path.exists(), f"output file missing: {out_path}"
    body = out_path.read_text(encoding="utf-8")
    assert "Hello, world!" in body, f"content not preserved: {body!r}"
    print(f"[OK] txt -> md  -> {out_path.name} ({len(body)} bytes)")


def case_png_to_jpg(tmp: Path) -> None:
    from PIL import Image

    src = tmp / "in.png"
    Image.new("RGB", (40, 40), (255, 128, 0)).save(src)
    handler = ConvertHandler(
        tmp_root=tmp / "tmp",
        tools=ExternalTools(libreoffice=False, tesseract=False),
    )
    ev = _PlainEvent()
    ev.attach(src, "in.png")
    _run(handler, ev)
    assert any(k in ("image", "file") for k, _ in ev.sent), "expected an image output"
    kind, payload = next((k, s) for k, s in ev.sent if k in ("image", "file"))
    out_path = Path(payload)
    assert out_path.exists(), f"output file missing: {out_path}"
    assert out_path.suffix.lower() in {".png", ".jpg", ".jpeg"}, out_path.suffix
    with Image.open(out_path) as im:
        assert im.size == (40, 40)
    print(f"[OK] png -> smart default ({kind}) -> {out_path.name}")


def case_md_to_html(tmp: Path) -> None:
    try:
        import markdown  # noqa: F401
    except ImportError:
        print("[SKIP] md -> html (markdown not installed)")
        return
    src = tmp / "note.md"
    src.write_text("# Title\n\n- one\n- two\n", encoding="utf-8")
    handler = ConvertHandler(
        tmp_root=tmp / "tmp",
        tools=ExternalTools(libreoffice=False, tesseract=False),
    )
    ev = _PlainEvent()
    ev.attach(src, "note.md")
    _run(handler, ev)
    assert any(k == "file" for k, _ in ev.sent), "expected an output file"
    out_path = Path([s for k, s in ev.sent if k == "file"][0])
    assert out_path.exists()
    body = out_path.read_text(encoding="utf-8")
    assert "<h1" in body and "<li>" in body, f"html not produced: {body[:200]}"
    print(f"[OK] md -> html -> {out_path.name} ({len(body)} bytes)")


def case_no_file(tmp: Path) -> None:
    handler = ConvertHandler(
        tmp_root=tmp / "tmp",
        tools=ExternalTools(libreoffice=False, tesseract=False),
    )
    ev = _PlainEvent()
    _run(handler, ev)
    msgs = [s for k, s in ev.sent if k == "plain"]
    assert any("文件" in m for m in msgs), msgs
    print("[OK] no-file message path")


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        case_txt_to_md(tmp)
        case_png_to_jpg(tmp)
        case_md_to_html(tmp)
        case_no_file(tmp)
    print("All smoke cases passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
