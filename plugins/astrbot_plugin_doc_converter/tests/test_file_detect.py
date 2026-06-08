from pathlib import Path

from utils.file_detect import detect


def test_detect_pdf(tmp_path: Path):
    p = tmp_path / "a.pdf"
    p.write_bytes(b"%PDF-1.4\n%fake\n")
    fmt, has_text = detect(p)
    assert fmt == "pdf"
    assert has_text is True


def _make_office(tmp_path: Path, name: str, members: list[str]) -> Path:
    """Create a real minimal ZIP file (used for office detection)."""
    import zipfile
    p = tmp_path / name
    with zipfile.ZipFile(p, "w") as z:
        for m in members:
            z.writestr(m, b"<root/>")
    return p


def test_detect_docx(tmp_path: Path):
    p = _make_office(tmp_path, "a.docx", ["word/document.xml", "_rels/.rels"])
    fmt, has_text = detect(p)
    assert fmt == "docx"


def test_detect_xlsx(tmp_path: Path):
    p = _make_office(tmp_path, "a.xlsx", ["xl/worksheets/sheet1.xml", "[Content_Types].xml"])
    fmt, has_text = detect(p)
    assert fmt == "xlsx"


def test_detect_pptx(tmp_path: Path):
    p = _make_office(tmp_path, "a.pptx", ["ppt/slides/slide1.xml", "[Content_Types].xml"])
    fmt, has_text = detect(p)
    assert fmt == "pptx"


def test_detect_png(tmp_path: Path):
    p = tmp_path / "a.png"
    p.write_bytes(b"\x89PNG\r\n\x1a\n" + b"x" * 100)
    fmt, has_text = detect(p)
    assert fmt == "image"
    assert has_text is False


def test_detect_jpg(tmp_path: Path):
    p = tmp_path / "a.jpg"
    p.write_bytes(b"\xff\xd8\xff\xe0" + b"x" * 100)
    fmt, has_text = detect(p)
    assert fmt == "image"


def test_detect_md(tmp_path: Path):
    p = tmp_path / "a.md"
    p.write_text("# hi", encoding="utf-8")
    fmt, has_text = detect(p)
    assert fmt == "md"
    assert has_text is True


def test_detect_html(tmp_path: Path):
    p = tmp_path / "a.html"
    p.write_text("<html></html>", encoding="utf-8")
    fmt, has_text = detect(p)
    assert fmt == "html"
    assert has_text is True


def test_detect_txt(tmp_path: Path):
    p = tmp_path / "a.txt"
    p.write_text("plain", encoding="utf-8")
    fmt, has_text = detect(p)
    assert fmt == "txt"
    assert has_text is True


def test_detect_unknown_suffix(tmp_path: Path):
    p = tmp_path / "a.xyz"
    p.write_text("xxx", encoding="utf-8")
    fmt, has_text = detect(p)
    assert fmt is None


def test_detect_avif_by_suffix(tmp_path: Path):
    """AVIF magic 不在表里，但后缀可识别。"""
    p = tmp_path / "a.avif"
    p.write_bytes(b"\x00\x00\x00" + b"ftypavif" + b"x" * 100)
    fmt, has_text = detect(p)
    # magic 不识别时回退到后缀
    assert fmt == "image"


def test_detect_webp_by_magic(tmp_path: Path):
    p = tmp_path / "a.webp"
    p.write_bytes(b"RIFF" + b"\x10\x00\x00\x00" + b"WEBP" + b"x" * 100)
    fmt, has_text = detect(p)
    assert fmt == "image"
