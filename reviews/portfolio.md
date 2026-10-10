# Portfolio Review — builtbysai.github.io (redesign/unslop)

Reviewed 2026-10-10 during the unslop redesign. Original: 158 KB single-file `index.html` (terminal hero, dark-mode toggle, scroll engines). New: ~45 KB HTML + self-hosted fonts.

## Bugs / issues found

1. **Experience date overlap (data, needs Hans to verify).** Shoppers World & Forman Mills is listed Mar 2025 – Aug 2026 while Amazon is listed Jul 2026 – Present. That is a one-month overlap; either the Shoppers end date or the Amazon start date may be wrong. (The AF Reserve Jan 2021 – Present overlap with Amazon is expected for a reservist and was kept.)
2. **Degree naming discrepancy (needs Hans to verify).** The site says "B.S., Computer Science, Cybersecurity focus" (Liberty, May 2026); briefing notes said "B.S. Cybersecurity." The redesign kept the site's wording. Confirm which is accurate.
3. **404.html still uses the old dark theme.** It works, but it is now visually inconsistent with the redesigned light theme. Recommend restyling it to match (left untouched deliberately — task was to keep it working).
4. **No Open Graph / Twitter Card meta tags existed.** Link previews on LinkedIn/Twitter would render generic. FIXED in this redesign (og:title/description/image pointing at `headshot-web.webp`).
5. **manifest.json had dark theme colors** (`#0a0e14` background/theme). FIXED to paper `#FAF6ED`.
6. **Third-party render-blocking dependencies.** Old page pulled Google Fonts and Lenis (scroll easing) from CDNs. FIXED: all three typefaces self-hosted in `fonts/`; Lenis removed in favor of native smooth scroll.
7. **Ghost-Ball repo has no GitHub description.** No user impact (the portfolio hardcodes its one-liner), but the repo page itself looks unfinished.
8. **Reveal-on-scroll failure mode (found in my own new code during testing).** Elements with `.reveal` stayed at opacity 0 when IntersectionObserver callbacks never fired under headless timing. FIXED: above-the-fold elements are revealed synchronously on load; the observer only handles below-the-fold.
9. **README described the old design** (terminal hero, 3D gallery, Lenis). FIXED and rewritten for the new design.

## Flaws / areas of improvement

- **Stale remote branches** worth pruning: `redesign/hero-terminal-console`, `redesign/projects-aristide-inspired`, `cleanup/dead-code-audit`, `cleanup/remove-code-comments`, `fix/preloader-reload`, `fix/projects-scroll-engine-v2`, `polish/preloader-marquee`, `ccr-3cd334cb-5by52g`.
- **`screenshots/*.webp` no longer referenced** by the new design (kept in repo for reference). Could be deleted to slim the repo.
- **No robots.txt / sitemap.xml.** Minor SEO gap for a portfolio that should be discoverable.
- **No JSON-LD Person schema.** Cheap to add, helps search engines parse name/role/clearance-adjacent facts.
- **Accessibility** is improved (skip link, landmarks, focus-visible, aria on the mobile menu), but the mobile menu toggle was verified by code reading only, not by an interactive click test in headless Chromium.
- **Old page weight**: 158 KB HTML + heavy terminal/scroll JS. New page is ~45 KB HTML + ~250 KB self-hosted fonts (cached). Good.

## What was preserved and verified

- All factual content: name, positioning, clearance, Security+, education, location, availability, bio substance, all four experience roles with bullets, nine projects, six skill groups, certifications, resume/vCard/email/GitHub/LinkedIn links.
- All local asset paths resolve: `resume/Hans_Sai_Resume.pdf`, `files/Hans_Sai_Business_Card.vcf`, `certs/*.pdf` (3), `headshot-web.webp`, `favicon.ico`, `manifest.json`, `icons/*`, `CNAME`, `404.html`.
- All anchor targets (`#about #experience #work #skills #contact #top #main`) exist.
- Desktop 1280px and mobile 390px screenshots verified visually.
