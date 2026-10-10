# Review: cifellis redesign

Redesigned in `builtbysai/cifellis-redesign` (source on `main`, live static site on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/cifellis-redesign/ · Original: https://builtbysai.github.io/cifellis/

## What this is
Full restaurant system for Cifelli's Pizza (Lindenwold, NJ): marketing site (`index.html`), customer ordering kiosk (`order/`), staff hub (`staff/`, auth-gated POS/kitchen/driver tools), Supabase backend schema (`supabase/`).

## Changes made (marketing site)
- **Removed the dark-mode toggle** (checker: "adding a dark theme toggle to a pizza shop site is peak generator behavior"). Deleted the head pre-paint script, header button, toggle JS, and localStorage key. The site now has one confident design: warm paper body, dark ink bands.
- **Replaced the fake 5-star testimonial grid** (checker: "five stars from 'sarah m., marketing director'. sure.") with "Word Gets Around" — a chalkboard panel with 3 short overheard-at-the-counter quotes. No stars, no avatar circles, no job titles.
- **Printed-menu masthead** for the menu section: centered, double-rule border, "The Menu" in Rye — reads like a real menu board instead of another content section.
- **Em-dash scrub**: zero em dashes remain in index.html or order/index.html (was 12; 6 in user-visible kiosk strings like toasts/status messages, rest in comments).

## Changes made (kiosk)
- Removed the theme toggle; locked the kiosk to the warm paper light theme via static `data-theme="light"` (matches the marketing site; the no-JS default was dark and inconsistent).
- Zero functional changes: ordering flow, Supabase data layer, cart, promo codes, scheduling all untouched.

## Untouched
- `staff/` (auth-gated POS/kitchen/driver hub) — functionally complex, left as-is.
- All menu content, prices, specials, hours, phone, images, videos, PWA manifests, service workers.

## Bugs / flaws noted
- The kiosk shows "Database scripts failed to load" when Supabase is unreachable (no network) — pre-existing behavior, not introduced by this redesign.
- `staff/index.html` is 220KB single file; fine functionally, but theming there still has its own toggle (left alone deliberately — staff tool, not public face).

## Scores
- Original: 33% slop (five-star testimonials +9, dark-mode toggle +3).
- Redesign: pending parent re-check on the live URL. Both flagged patterns were designed out; positives (no filler words, chosen typeface Work Sans/Rye) preserved.
