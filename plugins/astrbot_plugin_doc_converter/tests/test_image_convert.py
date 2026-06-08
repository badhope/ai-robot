import asyncio
from pathlib import Path

import pytest
from PIL import Image

from converters.base import run_converter
from converters.image_convert import ImageConverter


def _png(tmp_path: Path) -> Path:
    p = tmp_path / "in.png"
    Image.new("RGB", (10, 10), (255, 0, 0)).save(p)
    return p


def _rgba_png(tmp_path: Path) -> Path:
    p = tmp_path / "rgba.png"
    Image.new("RGBA", (10, 10), (255, 0, 0, 128)).save(p)
    return p


def test_png_to_jpg(tmp_path: Path):
    c = ImageConverter("jpg")
    out = tmp_path / "out.jpg"
    asyncio.run(run_converter(c, _png(tmp_path), out))
    assert out.exists()
    assert Image.open(out).format == "JPEG"


def test_png_to_webp(tmp_path: Path):
    c = ImageConverter("webp")
    out = tmp_path / "out.webp"
    asyncio.run(run_converter(c, _png(tmp_path), out))
    assert out.exists()
    assert out.stat().st_size > 0


def test_png_to_bmp(tmp_path: Path):
    c = ImageConverter("bmp")
    out = tmp_path / "out.bmp"
    asyncio.run(run_converter(c, _png(tmp_path), out))
    assert out.exists()
    assert Image.open(out).format == "BMP"


def test_rgba_to_jpg_removes_transparency(tmp_path: Path):
    """RGBA → JPG 时应把 alpha 合成到白底上，避免 ValueError。"""
    c = ImageConverter("jpg")
    out = tmp_path / "out.jpg"
    asyncio.run(run_converter(c, _rgba_png(tmp_path), out))
    assert out.exists()
    assert Image.open(out).mode == "RGB"


def test_custom_image_quality(tmp_path: Path):
    c = ImageConverter("jpg")
    out = tmp_path / "out.jpg"
    asyncio.run(run_converter(c, _png(tmp_path), out, options={"image_quality": 50}))
    assert out.exists()
