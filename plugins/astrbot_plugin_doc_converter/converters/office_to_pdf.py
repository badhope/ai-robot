from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from typing import Any

from utils.external_tools import ExternalTools


class OfficeToPdfConverter:
    """docx / xlsx / pptx → pdf，通过 LibreOffice headless 模式。"""

    dst_format = "pdf"
    requires: list[str] = ["libreoffice"]

    def __init__(self, src_format: str, tools: ExternalTools) -> None:
        self.src_format = src_format
        self._tools = tools

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        *,
        options: dict[str, Any] | None = None,
    ) -> None:
        if not self._tools.libreoffice:
            raise RuntimeError(
                "需要 LibreOffice 才能将 Office 文档转换为 PDF。"
                "请访问 https://www.libreoffice.org/ 下载安装。"
            )
        binary = "libreoffice" if shutil.which("libreoffice") else "soffice"
        with tempfile.TemporaryDirectory() as tmp:
            tmpdir = Path(tmp)
            cmd = [
                binary,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(tmpdir),
                str(input_path),
            ]
            proc = subprocess_run(cmd)
            if proc.returncode != 0:
                raise RuntimeError(
                    f"LibreOffice 转换失败 (code={proc.returncode}): {proc.stderr}"
                )
            produced = tmpdir / (input_path.stem + ".pdf")
            if not produced.exists():
                raise RuntimeError(f"LibreOffice 未生成 PDF，stdout: {proc.stdout}")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(produced), str(output_path))


def subprocess_run(cmd: list[str]) -> _ProcResult:
    """Run subprocess synchronously and return result."""
    import subprocess

    completed = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    return _ProcResult(
        returncode=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
    )


class _ProcResult:
    def __init__(self, returncode: int, stdout: str, stderr: str) -> None:
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr
