#!/usr/bin/env python3
"""Inline style.css, data/*.js and app.js into one self-contained HTML file.

Usage:
  python3 scripts/build-single-file.py            # writes dist/montado-metabolism.html (full document)
  python3 scripts/build-single-file.py --fragment # writes dist/montado-metabolism.fragment.html
                                                  # (no doctype/html/head/body, for hosts that add their own)
"""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text()

css = (root / "style.css").read_text()
html = html.replace('<link rel="stylesheet" href="style.css">', f"<style>\n{css}\n</style>")


def inline(match):
    src = match.group(1)
    return f"<script>\n{(root / src).read_text()}\n</script>"


html = re.sub(r'<script src="([^"]+)"></script>', inline, html)

if "--fragment" in sys.argv:
    head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
    head = re.sub(r'<meta charset[^>]*>\s*', "", head)
    head = re.sub(r'<meta name="viewport"[^>]*>\s*', "", head)
    body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
    html = head.strip() + "\n" + body.strip() + "\n"
    out = root / "dist" / "montado-metabolism.fragment.html"
else:
    out = root / "dist" / "montado-metabolism.html"

out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(f"wrote {out} ({len(html) // 1024} KB)")
