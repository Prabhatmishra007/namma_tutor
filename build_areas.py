#!/usr/bin/env python3
"""
Generates one SEO landing page per Bangalore locality.

Each page is genuinely area-specific — its own H1, title, meta description,
intro copy, nearby-areas list and LocalBusiness/FAQ schema. Thin duplicated
pages get ignored by Google; these are differentiated on purpose.

Run:  python3 build_areas.py
Then: python3 build.py   (to refresh dist/)
"""
from pathlib import Path
import re

ROOT = Path(__file__).parent
DOMAIN = "https://nammatutor.in"

# locality: (display name, short descriptor, nearby areas, local context line)
AREAS = {
    "whitefield": (
        "Whitefield",
        "the IT corridor east of the city",
        ["Varthur", "Marathahalli", "Kadugodi", "Brookefield", "ITPL"],
        "Whitefield families often juggle long parent commutes, so evening and weekend slots book fastest here. "
        "We match tutors who already live on the east side, which keeps travel short and cancellations rare.",
    ),
    "koramangala": (
        "Koramangala",
        "central Bangalore's school and startup belt",
        ["BTM Layout", "HSR Layout", "Ejipura", "Indiranagar", "Jayanagar"],
        "Koramangala has one of the densest clusters of CBSE and ICSE schools in the city. "
        "Most of our requests here are subject-specific — Maths and Science for Class 9 to 12 rather than all-subject tuition.",
    ),
    "hsr-layout": (
        "HSR Layout",
        "a residential grid popular with young families",
        ["Koramangala", "BTM Layout", "Sarjapur Road", "Bellandur", "Agara"],
        "HSR's sector layout makes home visits straightforward, and tutors can usually reach two nearby students "
        "in one evening — which is why rates here sit at the lower end of each band.",
    ),
    "indiranagar": (
        "Indiranagar",
        "an established central neighbourhood",
        ["Domlur", "Ulsoor", "Koramangala", "CV Raman Nagar", "Jeevan Bhima Nagar"],
        "Indiranagar sees steady demand for IB and IGCSE support alongside CBSE, given the international schools nearby. "
        "Those tutors are fewer, so we ask for an extra day or two to shortlist.",
    ),
    "marathahalli": (
        "Marathahalli",
        "a fast-growing eastern suburb",
        ["Whitefield", "Bellandur", "Kundalahalli", "Brookefield", "HAL"],
        "Traffic on the Outer Ring Road shapes everything here. We deliberately match tutors who live on the same "
        "side of the ORR so a 7 pm class actually starts at 7 pm.",
    ),
    "electronic-city": (
        "Electronic City",
        "the southern tech hub",
        ["Bommanahalli", "Hosa Road", "Chandapura", "Anekal", "Begur"],
        "Electronic City is spread across two phases with limited crossover, so we match by phase. "
        "Online classes are also popular here for senior classes, where a specialist subject tutor matters more than proximity.",
    ),
    "jayanagar": (
        "Jayanagar",
        "one of south Bangalore's oldest planned neighbourhoods",
        ["Basavanagudi", "JP Nagar", "Banashankari", "BTM Layout", "Wilson Garden"],
        "Jayanagar has a long tuition culture and a strong State Board presence alongside CBSE and ICSE. "
        "We keep Kannada and Hindi second-language tutors on the roster specifically for this area.",
    ),
    "jp-nagar": (
        "JP Nagar",
        "a large residential belt in south Bangalore",
        ["Jayanagar", "Banashankari", "Bannerghatta Road", "BTM Layout", "Puttenahalli"],
        "JP Nagar spans nine phases, so we always confirm the phase before assigning a tutor — "
        "a mismatch there can mean forty minutes of extra travel each way.",
    ),
    "btm-layout": (
        "BTM Layout",
        "a dense, centrally-placed residential area",
        ["Koramangala", "HSR Layout", "JP Nagar", "Jayanagar", "Bommanahalli"],
        "BTM is well-connected to most of south and central Bangalore, so it has one of our largest tutor pools. "
        "Same-week starts are usually possible here.",
    ),
    "bellandur": (
        "Bellandur",
        "an eastern lakeside residential and tech pocket",
        ["Sarjapur Road", "HSR Layout", "Marathahalli", "Kadubeesanahalli", "Devarabisanahalli"],
        "Apartment complexes dominate here, and several families in the same complex often share a tutor's evening. "
        "If neighbours are also looking, mention it — scheduling gets easier and rates improve.",
    ),
    "rajajinagar": (
        "Rajajinagar",
        "a well-established west Bangalore neighbourhood",
        ["Malleshwaram", "Vijayanagar", "Basaveshwaranagar", "Mahalakshmi Layout", "Yeshwanthpur"],
        "West Bangalore has fewer tutoring agencies than the east and south, so availability here depends more on "
        "the specific subject. Senior Physics and Accountancy tutors are the ones worth booking early.",
    ),
    "yelahanka": (
        "Yelahanka",
        "the northern satellite township near the airport",
        ["Hebbal", "Jakkur", "Sahakar Nagar", "Vidyaranyapura", "Doddaballapur Road"],
        "Yelahanka is far enough north that we match strictly within the area. "
        "For senior specialist subjects, online classes are often the better call than a long tutor commute.",
    ),
}

FEES = [
    ("Class 1–5", "₹300–₹500"),
    ("Class 6–8", "₹400–₹600"),
    ("Class 9–10", "₹500–₹700"),
    ("Class 11–12", "₹550–₹800"),
]

TOGGLE = '''<button class="theme-btn" data-theme-toggle aria-pressed="false" aria-label="Switch to dark mode" title="Switch to dark mode">
        <svg class="moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>
        <span class="theme-btn__label">Dark</span>
      </button>'''


def page(slug, name, descriptor, nearby, context):
    url = f"{DOMAIN}/home-tuition-{slug}.html"
    nearby_li = "".join(f"<li>{n}</li>" for n in nearby)
    fee_rows = "".join(
        f'<div class="rung reveal" style="--step:{i}">'
        f'<div class="rung__class">{cls}</div>'
        f'<p class="rung__desc">One-to-one, at your home in {name} or online.</p>'
        f'<div class="rung__fee">{fee} <small>/ HOUR</small></div></div>'
        for i, (cls, fee) in enumerate(FEES)
    )

    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Home Tuition in {name}, Bangalore | NammaTutor</title>
<meta name="description" content="Verified home tutors in {name}, Bangalore for Class 1-12. CBSE, ICSE, State Board, IB and IGCSE. Free demo class, Rs 99 one-time registration.">
<meta name="keywords" content="home tuition {name}, home tutor {name} Bangalore, private tutor {name}, {name} tuition classes, maths tutor {name}, science tutor {name}, CBSE tuition {name}, ICSE tuition {name}, class 10 tuition {name}, class 12 tuition {name}, tuition near me {name}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="geo.region" content="IN-KA">
<meta name="geo.placename" content="{name}, Bengaluru">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="NammaTutor">
<meta property="og:title" content="Home Tuition in {name}, Bangalore — Class 1 to 12">
<meta property="og:description" content="Verified home and online tutors in {name}. Free demo class, Rs 99 one-time registration.">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="assets/brand/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/brand/icon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/brand/icon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/brand/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": ["EducationalOrganization", "LocalBusiness"],
      "@id": "{url}#org",
      "name": "NammaTutor — {name}",
      "url": "{url}",
      "description": "Home tuition in {name}, Bangalore for Class 1 to 12, covering CBSE, ICSE, State Board, IB and IGCSE.",
      "telephone": "+91-87138-47946",
      "priceRange": "₹300–₹800 per hour",
      "address": {{ "@type": "PostalAddress", "addressLocality": "{name}, Bengaluru", "addressRegion": "Karnataka", "addressCountry": "IN" }},
      "areaServed": {{ "@type": "Place", "name": "{name}, Bengaluru" }},
      "parentOrganization": {{ "@type": "Organization", "name": "NammaTutor", "url": "{DOMAIN}/" }}
    }},
    {{
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "{DOMAIN}/" }},
        {{ "@type": "ListItem", "position": 2, "name": "Areas", "item": "{DOMAIN}/#areas" }},
        {{ "@type": "ListItem", "position": 3, "name": "Home tuition in {name}", "item": "{url}" }}
      ]
    }},
    {{
      "@type": "FAQPage",
      "mainEntity": [
        {{ "@type": "Question", "name": "Do you have home tutors in {name}?",
          "acceptedAnswer": {{ "@type": "Answer", "text": "Yes. We have verified tutors covering {name} and the surrounding areas including {', '.join(nearby[:3])}. Tell us the class, board and subjects and we will send matching profiles within 24 hours." }} }},
        {{ "@type": "Question", "name": "How much does home tuition cost in {name}?",
          "acceptedAnswer": {{ "@type": "Answer", "text": "₹300–₹500 per hour for Class 1–5, ₹400–₹600 for Class 6–8, ₹500–₹700 for Class 9–10 and ₹550–₹800 for Class 11–12. The final rate depends on travel distance within {name} and the tutor's experience." }} }},
        {{ "@type": "Question", "name": "Is the first class free in {name}?",
          "acceptedAnswer": {{ "@type": "Answer", "text": "Yes. The first demo class is free, at your home in {name} or online. If the tutor is not the right fit we arrange another match at no cost." }} }}
      ]
    }}
  ]
}}
</script>
<meta name="theme-color" content="#01224B">
<script>(function(){{try{{var t=localStorage.getItem('nt-theme');if(!t){{t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}}document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}}})();</script>
</head>
<body>

<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="index.html">
      <span class="brand__mark"><img src="assets/brand/logo-mark.png" alt="NammaTutor logo" width="31" height="38"></span>
      <span><span class="brand__name">Namma<b>Tutor</b></span><span class="brand__tag">Bengaluru · Home &amp; Online</span></span>
    </a>
    <nav class="nav" id="nav" aria-label="Main">
      <a href="index.html">Home</a>
      <a href="index.html#fees">Fees</a>
      <a href="areas.html">Areas</a>
      <a href="resources.html">Study material</a>
      <a href="become-a-tutor.html">Teach with us</a>
    </nav>
    <div class="header-cta">
      {TOGGLE}
      <a class="btn btn--primary" href="hire-a-tutor.html">Find a tutor</a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>

<main>
<section class="page-head">
  <div class="wrap">
    <p class="crumbs"><a href="index.html">Home</a> / <a href="areas.html">Areas</a> / {name}</p>
    <p class="eyebrow">Home tuition · {name}, Bengaluru</p>
    <h1 style="font-size:clamp(2rem,4.4vw,3.1rem)">Home tutors in {name}</h1>
    <p class="lede" style="margin-top:1.1rem">One-to-one tuition for Class 1 to 12 across {name} and {descriptor}. CBSE, ICSE, Karnataka State Board, IB and IGCSE — taught at your dining table or online, whichever suits.</p>
    <div class="freebadge">
      <span class="freebadge__lead">One-time registration</span>
      <span class="freebadge__was">₹590</span>
      <span class="freebadge__main"><span class="cur">₹</span>99</span>
      <span class="freebadge__note">Most agencies charge ₹590 just to show you a profile. We're not that guy. No agency cut, no lock-in packages — you pay your tutor directly, per class.</span>
    </div>
    <div class="hero-actions">
      <a class="btn btn--primary btn--lg" href="hire-a-tutor.html">Book a free demo class</a>
      <a class="btn btn--ghost btn--lg" data-wa="Hi NammaTutor, I'm looking for a home tutor in {name}, Bangalore.">Chat on WhatsApp</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Why {name} is different</p>
      <h2>What we have learned matching tutors here.</h2>
    </div>
    <p class="lede">{context}</p>
  </div>
</section>

<section class="section section--paper2">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Subjects we cover in {name}</p>
      <h2>From tables and handwriting to board-year Physics.</h2>
    </div>
    <div class="grid grid--4">
      <article class="tile reveal"><span class="tile__k">Class 1–5</span><h3>Foundation</h3><p>All subjects with one tutor — reading fluency, tables, handwriting and a homework routine that holds.</p></article>
      <article class="tile reveal"><span class="tile__k">Class 6–8</span><h3>Middle school</h3><p>Maths and Science taught concept-first, so Class 9 does not come as a shock.</p></article>
      <article class="tile reveal"><span class="tile__k">Class 9–10</span><h3>Board preparation</h3><p>Maths, Science, Social Science and English with chapter tests and previous-year papers.</p></article>
      <article class="tile reveal"><span class="tile__k">Class 11–12</span><h3>Senior secondary</h3><p>Physics, Chemistry, Maths, Biology, Accountancy, Economics and Computer Science.</p></article>
    </div>
  </div>
</section>

<section class="section" id="fees">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Fees in {name}</p>
      <h2>Hourly rates, told to you before the demo.</h2>
      <p class="lede">Rates vary with how far the tutor travels within {name} and how experienced they are. Online classes sit at the lower end because there is no travel.</p>
    </div>
    <div class="ladder">{fee_rows}</div>
  </div>
</section>

<section class="section section--ink">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Also covering</p>
      <h2>Nearby areas we serve from {name}.</h2>
      <p class="lede">Tutors matched to {name} usually cover these neighbourhoods too, so travel stays short.</p>
    </div>
    <ul class="areas">{nearby_li}</ul>
    <div class="hero-actions" style="margin-top:2rem">
      <a class="btn btn--gold btn--lg" href="hire-a-tutor.html">Find a tutor in {name}</a>
      <a class="btn btn--ghost btn--lg" href="areas.html">See all areas</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Questions from {name} parents</p>
      <h2>Before you book.</h2>
    </div>
    <div class="faq">
      <details open><summary>Do you have tutors available in {name} right now?</summary>
        <p>Almost always, yes. Send the class, board and subjects and we will come back within 24 hours with two or three matching profiles, their experience and their hourly rate. If a specialist subject is scarce that week, we will tell you straight away rather than keep you waiting.</p></details>
      <details><summary>How much does home tuition cost in {name}?</summary>
        <p>₹300–₹500 an hour for Class 1–5, ₹400–₹600 for Class 6–8, ₹500–₹700 for Class 9–10 and ₹550–₹800 for Class 11–12. You are told the exact figure before the free demo, never after.</p></details>
      <details><summary>Can we start with online classes instead?</summary>
        <p>Yes. Many {name} families start online for senior subjects, where getting the right specialist matters more than the tutor's postcode, then switch to home classes if they prefer.</p></details>
      <details><summary>Are the tutors verified?</summary>
        <p>Every tutor is interviewed by us, and government ID plus qualification documents are checked before they are assigned a student. For home tuition you also get the tutor's name and photo before the first visit.</p></details>
      <details><summary>What if the tutor is not the right fit?</summary>
        <p>Tell us after the demo and we arrange another match at no cost. The same applies later — a bad fit helps nobody.</p></details>
    </div>
  </div>
</section>
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="index.html" style="margin-bottom:1rem">
          <span class="brand__mark"><img src="assets/brand/logo-mark.png" alt="NammaTutor logo" width="31" height="38"></span>
          <span><span class="brand__name">Namma<b>Tutor</b></span><span class="brand__tag">Bengaluru · Home &amp; Online</span></span>
        </a>
        <p style="max-width:30ch">Home tuition across Bangalore and online tutoring worldwide for Class 1 to 12.</p>
      </div>
      <div><h4>Site</h4><ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="hire-a-tutor.html">Find a tutor</a></li>
        <li><a href="become-a-tutor.html">Teach with us</a></li>
        <li><a href="resources.html">Study material</a></li>
        <li><a href="areas.html">All areas</a></li>
      </ul></div>
      <div><h4>Nearby</h4><ul>{"".join(f'<li>{n}</li>' for n in nearby[:4])}</ul></div>
      <div><h4>Contact</h4><ul>
        <li><a data-wa="Hi NammaTutor, I have a question about tuition in {name}.">WhatsApp <span data-phone></span></a></li>
        <li>Reply within 24 hours</li>
        <li>{name}, Bengaluru</li>
        <li>Mon–Sun, 8 am – 9 pm IST</li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year></span> NammaTutor. All rights reserved.</span>
      <span>Serving {name} and all of Bengaluru.</span>
    </div>
  </div>
</footer>

<a class="wa-float" data-wa="Hi NammaTutor, I'm looking for a tutor in {name}." aria-label="Chat on WhatsApp">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.4 2.5 1 3 .8 3.6.8.5 0 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.3c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg>
  <span>Chat with us</span>
</a>
<script src="assets/js/config.js"></script>
<script src="assets/js/theme.js"></script>
<script src="assets/js/ui.js"></script>
</body>
</html>
'''


def areas_index():
    cards = "".join(
        f'<a class="tile reveal" style="text-decoration:none; display:block" href="home-tuition-{slug}.html">'
        f'<span class="tile__k">Bengaluru</span><h3>{name}</h3>'
        f'<p>Home tutors for Class 1–12 in {name} and {descriptor}.</p></a>'
        for slug, (name, descriptor, _, _) in AREAS.items()
    )
    items = "".join(
        f'{{ "@type": "ListItem", "position": {i+1}, "name": "Home tuition in {n[0]}", "url": "{DOMAIN}/home-tuition-{s}.html" }}'
        + ("," if i < len(AREAS) - 1 else "")
        for i, (s, n) in enumerate(AREAS.items())
    )
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Home Tuition Areas in Bangalore | NammaTutor</title>
<meta name="description" content="Find verified home tutors in your Bangalore neighbourhood - Whitefield, Koramangala, HSR Layout, Indiranagar and more. Class 1-12, free demo class.">
<meta name="keywords" content="home tuition near me Bangalore, home tutor near me, tuition classes Bangalore areas, private tutor Bangalore locality">
<link rel="canonical" href="{DOMAIN}/areas.html">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="Home Tuition Areas Across Bangalore | NammaTutor">
<meta property="og:description" content="Find verified home tutors in your Bangalore neighbourhood. Class 1 to 12, free demo class.">
<meta property="og:url" content="{DOMAIN}/areas.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="assets/brand/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/brand/icon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/brand/icon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/brand/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<script type="application/ld+json">
{{ "@context": "https://schema.org", "@type": "ItemList", "name": "Home tuition areas in Bangalore", "itemListElement": [{items}] }}
</script>
<meta name="theme-color" content="#01224B">
<script>(function(){{try{{var t=localStorage.getItem('nt-theme');if(!t){{t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}}document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}}})();</script>
</head>
<body>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="index.html">
      <span class="brand__mark"><img src="assets/brand/logo-mark.png" alt="NammaTutor logo" width="31" height="38"></span>
      <span><span class="brand__name">Namma<b>Tutor</b></span><span class="brand__tag">Bengaluru · Home &amp; Online</span></span>
    </a>
    <nav class="nav" id="nav" aria-label="Main">
      <a href="index.html">Home</a>
      <a href="index.html#fees">Fees</a>
      <a href="areas.html" aria-current="page">Areas</a>
      <a href="resources.html">Study material</a>
      <a href="become-a-tutor.html">Teach with us</a>
    </nav>
    <div class="header-cta">
      {TOGGLE}
      <a class="btn btn--primary" href="hire-a-tutor.html">Find a tutor</a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<main>
<section class="page-head">
  <div class="wrap">
    <p class="crumbs"><a href="index.html">Home</a> / Areas</p>
    <p class="eyebrow">Where we teach</p>
    <h1 style="font-size:clamp(2rem,4.4vw,3.1rem">Home tuition across Bangalore</h1>
    <p class="lede" style="margin-top:1.1rem">Pick your neighbourhood to see tutors, fees and answers specific to that area. Outside Bangalore, everything runs online with the same tutors.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="grid grid--3">{cards}</div>
    <p class="lede" style="margin-top:2rem">Not listed? We cover most of Bengaluru — <a class="linkish" href="hire-a-tutor.html">send your area</a> and we will tell you honestly whether we have someone nearby.</p>
  </div>
</section>
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-bottom" style="margin-top:0; border-top:0; padding-top:0">
      <span>© <span data-year></span> NammaTutor. All rights reserved.</span>
      <span>Bengaluru, Karnataka, India</span>
    </div>
  </div>
</footer>
<script src="assets/js/config.js"></script>
<script src="assets/js/theme.js"></script>
<script src="assets/js/ui.js"></script>
</body>
</html>
'''


if __name__ == "__main__":
    for slug, (name, descriptor, nearby, context) in AREAS.items():
        out = ROOT / f"home-tuition-{slug}.html"
        out.write_text(page(slug, name, descriptor, nearby, context), encoding="utf-8")
        print("wrote", out.name)
    (ROOT / "areas.html").write_text(areas_index(), encoding="utf-8")
    print("wrote areas.html")
    print(f"\n{len(AREAS)} locality pages + 1 index. Now run: python3 build.py")
