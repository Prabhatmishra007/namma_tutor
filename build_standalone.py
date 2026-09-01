#!/usr/bin/env python3
"""
Builds a FLAT, fully self-contained version of the site into standalone/.

Every page has its CSS, its JavaScript and its logo embedded directly inside
the .html file. There is no assets/ folder and no subfolders — so a page keeps
working even if it is downloaded on its own, emailed as an attachment, opened
from a phone, or dragged out of the folder.

Trade-off: pages are bigger and the browser can't cache shared CSS/JS between
them. For deploying to a real domain, use build.py (dist/) instead — it is
faster for visitors. Use this build for sharing single files.

Run:  python3 build_standalone.py
"""
import base64
import io
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "standalone"

CSS = (ROOT / "assets" / "styles.css").read_text(encoding="utf-8")
JS_CONFIG = (ROOT / "assets" / "js" / "config.js").read_text(encoding="utf-8")
JS_THEME = (ROOT / "assets" / "js" / "theme.js").read_text(encoding="utf-8")
JS_UI = (ROOT / "assets" / "js" / "ui.js").read_text(encoding="utf-8")
JS_DEMO = {
    "class-10-interactive-demo.html": (ROOT / "assets" / "js" / "demo-reflection.js").read_text(encoding="utf-8"),
    "class-12-interactive-demo.html": (ROOT / "assets" / "js" / "demo-electricity.js").read_text(encoding="utf-8"),
}

FAVICON_SVG = (ROOT / "assets" / "brand" / "favicon.svg").read_text(encoding="utf-8")


def data_uri_svg(svg: str) -> str:
    import urllib.parse
    return "data:image/svg+xml," + urllib.parse.quote(svg, safe="")


def small_logo_data_uri() -> str:
    """Header logo at 2x display size, embedded — keeps pages light."""
    try:
        from PIL import Image
        im = Image.open(ROOT / "assets" / "brand" / "logo-mark.png").convert("RGB")
        w = 76
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "PNG", optimize=True)
        return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return data_uri_svg(FAVICON_SVG)


LOGO_URI = small_logo_data_uri()
FAVICON_URI = data_uri_svg(FAVICON_SVG)

PAGES = sorted(p.name for p in ROOT.glob("*.html"))
DEMOS = ["samples/class-10-interactive-demo.html", "samples/class-12-interactive-demo.html"]
PDFS = sorted(ROOT.glob("samples/*.pdf"))

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()


def build(src: Path, flat_name: str):
    html = src.read_text(encoding="utf-8")
    demo_js = JS_DEMO.get(flat_name, "")

    # --- inline the stylesheet ---
    html = re.sub(r'<link rel="stylesheet" href="(?:\.\./)?assets/styles\.css">',
                  "<style>\n" + CSS + "\n</style>", html)

    # --- inline all JavaScript, in load order ---
    bundle = "\n".join([JS_CONFIG, JS_THEME, JS_UI, demo_js])
    html = re.sub(r'<script src="(?:\.\./)?assets/js/config\.js"></script>\s*'
                  r'<script src="(?:\.\./)?assets/js/theme\.js"></script>\s*'
                  r'<script src="(?:\.\./)?assets/js/ui\.js"></script>'
                  r'(?:\s*<script src="(?:\.\./)?assets/js/demo-[a-z]+\.js"></script>)?',
                  "<script>\n" + bundle + "\n</script>", html)

    # --- embed the logo ---
    html = re.sub(r'src="(?:\.\./)?assets/brand/logo-mark\.png"', f'src="{LOGO_URI}"', html)

    # --- favicon as a data URI; drop files that won't exist in a flat folder ---
    html = re.sub(r'<link rel="icon" href="(?:\.\./)?favicon\.ico" sizes="any">',
                  f'<link rel="icon" href="{FAVICON_URI}">', html)
    html = re.sub(r'<link rel="icon" type="image/svg\+xml" href="[^"]*">', "", html)
    html = re.sub(r'<link rel="icon" type="image/png"[^>]*>', "", html)
    html = re.sub(r'<link rel="apple-touch-icon"[^>]*>', "", html)
    html = re.sub(r'<link rel="manifest"[^>]*>', "", html)

    # --- flatten links: samples/foo -> foo, ../foo -> foo ---
    html = re.sub(r'(href|src)="samples/([^"]+)"', r'\1="\2"', html)
    html = re.sub(r'(href|src)="\.\./([^"]+)"', r'\1="\2"', html)

    (OUT / flat_name).write_text(html, encoding="utf-8")
    return len(html)


total = 0
for name in PAGES:
    total += build(ROOT / name, name)
    print(f"  {name}")
for rel in DEMOS:
    flat = rel.split("/")[-1]
    total += build(ROOT / rel, flat)
    print(f"  {flat}")

for pdf in PDFS:
    shutil.copy(pdf, OUT / pdf.name)
    print(f"  {pdf.name}")

print(f"\n{len(PAGES) + len(DEMOS)} self-contained pages + {len(PDFS)} PDFs -> standalone/")
print(f"average page size: {total // (len(PAGES) + len(DEMOS)) // 1024} KB")
print("Every file works on its own. No assets folder needed.")
