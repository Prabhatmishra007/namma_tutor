# NammaTutor — website

Static site. No framework, no database, no build server. Drop `dist/` on GitHub Pages and it runs.

```
index.html                  Home — hero, fees ladder, areas, study material, both forms, FAQ
hire-a-tutor.html           Parent / student enquiry (full form)
become-a-tutor.html         Tutor application (full form + resume upload)
resources.html              PDF notes · interactive notes · guess papers
areas.html                  Hub linking all locality pages
home-tuition-*.html         12 SEO locality pages (Whitefield, Koramangala, HSR…)
thank-you.html              Shown after any form submits

assets/styles.css           Whole design system, incl. dark mode   <- edit here
assets/js/config.js         Phone, WhatsApp, hours                 <- edit here
assets/js/theme.js          Dark / light mode
assets/js/ui.js             Nav, tabs, WhatsApp links, reveal, forms
assets/js/demo-*.js         The two interactive-notes widgets
assets/brand/               Logo, favicons, OG image
samples/                    4 sample PDFs + 2 interactive demos
samples/sources/            Editable HTML that generates the PDFs

build.py                    Inlines CSS, copies JS + assets -> dist/
build_areas.py              Regenerates the locality pages
dist/                       <- DEPLOY THIS
```

---

## 1. Three things to change before you go live

**a) WhatsApp number** — `assets/js/config.js`. Every WhatsApp link, phone number and `tel:` on the site is generated from this one file.

```js
window.SITE = {
  WHATSAPP: "918713847946",        // country code + number, digits only
  PHONE_DISPLAY: "+91 87138 47946"
};
```

**b) Domain** — find and replace `nammatutor.in` across all files. It appears in canonical tags, Open Graph, schema, `sitemap.xml`, `robots.txt` and `CNAME`.

**c) Activate the forms** — see section 2. Until you do this, submissions go nowhere.

---

## 2. Forms to your inbox

Both forms post to **FormSubmit.co**, which forwards to `meprabhatmishra007@gmail.com`. No server, no signup, free.

**Activation, one time only:** after deploying, submit each form once yourself. FormSubmit emails you a confirmation link — click it. From then on every submission lands in your inbox as a formatted table.

| Form | Subject line in your inbox |
|---|---|
| Parent / student | `New PARENT enquiry — NammaTutor` |
| Tutor application | `New TUTOR application — NammaTutor` |

Set two Gmail filters on those subject lines. Parent leads are time-sensitive; tutor CVs are not.

**Your email is not displayed anywhere on the site** — no footer link, no mailto, not in the schema. It sits only in each form's `action` attribute, because FormSubmit needs a destination. To hide it there too, log into formsubmit.co, copy your hashed endpoint, and replace `formsubmit.co/meprabhatmishra007@gmail.com` with `formsubmit.co/your-hash` in all five form tags.

---

## 3. Registration fee — where the Rs 99 lives

The site advertises a **one-time Rs 99 registration fee**, shown as Rs 590 struck through next to Rs 99, with the line *"Most agencies charge Rs 590 just to show you a profile. We're not that guy."*

That figure appears in more places than the badge, so if it ever changes, update all of these:

- The `.freebadge` block on 14 parent-facing pages (homepage, hire-a-tutor, all 12 locality pages)
- The FAQ answer on `index.html` — both the visible `<details>` and the `FAQPage` JSON-LD schema above it
- The `form-note` line under both enquiry forms
- Meta descriptions ("Free demo class, Rs 99 one-time registration")
- The cover footer of the two notes PDFs (`samples/sources/bio-notes.html`, `chem-notes.html`)

`become-a-tutor.html` deliberately still says **"Free for tutors"** — the Rs 99 is charged to parents, not to the people teaching. Don't let the two get merged.

---

## 4. Dark mode

There's a toggle in every header. It remembers the visitor's choice in `localStorage`, follows their operating-system preference on a first visit, and uses a tiny inline script in `<head>` to set the theme *before* first paint, so there's no white flash.

Everything is driven by CSS variables, so re-theming means editing the `html[data-theme="dark"]` block near the bottom of `styles.css` — not hunting through rules. The SVG widgets in the interactive notes listen for a `themechange` event and redraw themselves in theme-appropriate colours.

---

## 5. Study material

Six finished samples in `samples/` — not placeholders:

| File | What it is |
|---|---|
| `class-10-biology-life-processes-notes.pdf` | Life Processes + Nutrition. Handwritten style, diagram-led. 5 pages |
| `class-12-chemistry-solutions-notes.pdf` | Solutions — concentration, Henry, Raoult, colligative, Van't Hoff. 5 pages |
| `class-10-guess-paper-arithmetic-progressions.pdf` | 14 questions, Sections A–E, full answer key with step marks. 4 pages |
| `class-12-guess-paper-current-electricity.pdf` | Same format, incl. a Wheatstone-bridge case study. 4 pages |
| `class-10-interactive-demo.html` | Reflection of Light — live ray diagrams driven by the mirror formula |
| `class-12-interactive-demo.html` | Current Electricity — Ohm's law, series/parallel, resistivity |

**The PDFs are built from HTML**, so you can edit and re-render rather than starting over:

```bash
pip install weasyprint --break-system-packages
cd samples/sources
python3 -c "from weasyprint import HTML; HTML('bio-notes.html').write_pdf('../class-10-biology-life-processes-notes.pdf')"
```

Swap the filename for whichever of the four you edited. `notes.css` styles the two topper-notes PDFs; `guess.css` styles the two papers.

The interactive demos are genuinely live — every ray is computed as you drag, not pre-drawn. To add a chapter, copy one and replace the `drawXxx()` functions; the slider, readout and quiz scaffolding is reusable.

> **Before sending to students:** the numeric answers in both keys were independently recomputed and verified. The descriptive answers (drift velocity, potentiometer, Kirchhoff derivations) are sound but are judgement calls — read them once yourself.

---

## 6. Deploy on GitHub Pages

```bash
python3 build_areas.py     # only if you changed the locality list
python3 build.py           # always — regenerates dist/
git init && git add . && git commit -m "NammaTutor site"
git remote add origin https://github.com/Prabhatmishra007/nammatutor.git
git push -u origin main
```

Settings → Pages → Source: `main` / root, then set the custom domain. **Deploy the `dist/` folder** (or set Pages to serve from it).

At your registrar:

```
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
CNAME www  prabhatmishra007.github.io
```

Tick **Enforce HTTPS** once the certificate issues.

---

## 7. SEO — done, and what's left for you

**Built in:** unique title + meta description + keywords per page; canonical tags; Open Graph with a real preview image; `LocalBusiness` + `EducationalOrganization` schema with Bangalore coordinates, hours and all four price bands; `FAQPage` schema (can appear directly in Google results); `BreadcrumbList` on inner pages; `ItemList` on the areas hub; 19-URL sitemap; semantic headings with exactly one H1 per page; alt text on every image; fast (no framework, no render-blocking JS).

**The 12 locality pages are the main SEO asset.** Each has its own H1, title, description, keywords, schema and — importantly — genuinely different body copy. Thin duplicated pages get ignored; these talk about ORR traffic in Marathahalli, JP Nagar's nine phases, IB demand in Indiranagar. To add or edit areas, change the `AREAS` dict at the top of `build_areas.py` and re-run it.

**Read the locality copy once.** I wrote plausible local claims about each neighbourhood. Correct anything that doesn't match how you actually operate.

**Only you can do these, and they matter more than anything on the page:**

1. **Google Business Profile** — this is what puts you in the map pack for "home tuition near me". Category: *Tutoring service*. Use a service area, not a street address, if you work from home.
2. **Google Search Console** — verify the domain, submit `sitemap.xml`, check the Performance tab monthly.
3. **Reviews.** Local ranking is driven by review count and recency more than by any markup.
4. **Directory listings** — JustDial, Sulekha, UrbanPro, IndiaMART. Keep name, address and phone identical everywhere.
5. **Blog posts** answering what parents actually type: "CBSE Class 10 deleted syllabus 2026", "how much does home tuition cost in Bangalore".

**Testimonials:** none on the site, deliberately. Inventing them is a bad start. Add a section once you have real ones, with first name and locality.

---

## 8. Brand

Logo and colours come from your official logo: navy `#01224B`, green `#198825`.

`assets/brand/logo-mark.png` (cap + N + book) is used in every header and footer, sitting on a small white rounded tile — the mark relies on white for the cap arc and book pages, so making white transparent gutted those details on dark backgrounds.

The **favicon is a simplified N monogram**, not the full mark. At 16px the cap, N and book blur into one shape; the monogram stays legible. It's `assets/brand/favicon.svg` (crisp at any size) rasterised to `.ico` plus 16/32/48/180/192/512 PNGs, with `apple-touch-icon.png` for iOS and `site.webmanifest` so the site installs as an app.

Typography: Newsreader (display), Public Sans (body), IBM Plex Mono (labels and prices).

The fee ladder on the home page is the signature element — each band steps further right as the class rises. If you change the rates, edit the four `.rung` blocks **and** the matching `makesOffer` entries in the schema at the top of `index.html`.

Responsive to 360px, keyboard focus visible throughout, honours `prefers-reduced-motion`.
