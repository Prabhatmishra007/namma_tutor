#!/usr/bin/env python3
"""
Inlines assets/styles.css into every page and copies the JS modules,
brand assets and PDFs into dist/.

Edit assets/styles.css and assets/js/*.js as the single source of truth,
then run:  python3 build.py

Deploy the contents of dist/. Each page then works on its own — in a preview
pane, opened from a phone, emailed as an attachment, or on GitHub Pages.
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"

CSS = (ROOT / "assets" / "styles.css").read_text()

PAGES = sorted(p.name for p in ROOT.glob("*.html")) + [
    "samples/class-10-interactive-demo.html",
    "samples/class-12-interactive-demo.html",
]

COPY = ["robots.txt", "sitemap.xml", "CNAME", "README.md", "favicon.ico", "site.webmanifest"]
JS_FILES = [str(p.relative_to(ROOT)) for p in (ROOT / "assets" / "js").glob("*.js")]
BRAND_FILES = [str(p.relative_to(ROOT)) for p in (ROOT / "assets" / "brand").iterdir() if p.is_file()]
COPY += [str(p.relative_to(ROOT)) for p in (ROOT / "samples").glob("*.pdf")]

if DIST.exists():
    shutil.rmtree(DIST)
(DIST / "samples").mkdir(parents=True)

for page in PAGES:
    html = (ROOT / page).read_text()

    # stylesheet link -> inline <style>
    html = re.sub(
        r'<link rel="stylesheet" href="(?:\.\./)?assets/styles\.css">',
        "<style>\n" + CSS + "\n</style>",
        html,
    )
    # JS stays as separate files (copied below) — only CSS is inlined
    (DIST / page).write_text(html)
    print("built", page)

(DIST / "assets" / "js").mkdir(parents=True, exist_ok=True)
(DIST / "assets" / "brand").mkdir(parents=True, exist_ok=True)
for item in COPY + JS_FILES + BRAND_FILES:
    src = ROOT / item
    if src.exists():
        shutil.copy(src, DIST / item)

print("\nDone. Deploy the dist/ folder.")
