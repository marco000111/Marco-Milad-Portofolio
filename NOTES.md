# Portfolio v2

## Decisions and structure

- Kept the existing static HTML, CSS and JavaScript stack. The new portfolio does not require a build step or framework.
- `content.js` is the bilingual source for the main portfolio copy, service cards, project case studies, app captions and form labels. Edit both `en` and `ar` entries together when changing the page copy.
- `js/site.js` renders that content and handles language and theme persistence, the preview carousel, menu, contact form, copy feedback and optional CV visibility.
- `demos/restaurant`, `demos/clinic` and `demos/store` are independent static concept demos. Open their `index.html` files locally or deploy as-is.
- Add a real portrait at `assets/images/marco.jpg`, a CV at `assets/cv.pdf`, and genuine client quotes to the `testimonials` array in `js/site.js` when available. Testimonials stay hidden while that array is empty.
- After adding `assets/cv.pdf`, set `cvAvailable: true` in the English entry of `content.js`; the site checks the file before showing the download link.
- Add project source links in the project card template in `js/site.js`; demo links currently point to this repository's `portfolio-v2` branch.
- Color, typography, spacing and responsive rules are in `css/style.css`. Demo-specific styles are in `demos/demo.css`.

## Verification notes

- The portfolio and each demo respond over the included local preview server at `http://localhost:8000/`.
- The preview server maps directory URLs to `index.html` so nested demo routes work.
- Lighthouse 12.8.2 mobile audits against the local static server scored **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO** for the main page and all three demos. These are local audit scores, not a deployed production measurement.
- Main-page screenshots were captured at 360, 390, 768, 1024, 1280 and 1920 px in both languages and themes. Local smoke checks covered the restaurant language/menu/reservation flow, clinic booking validation, store filtering/cart/checkout, and the portfolio language/theme/contact links.
- All static routes and asset paths used by the demos returned successfully from the preview server. `server.mjs` supports nested directory indexes and gzip for text assets.

## TODO for Marco

- Supply a portrait photo and CV.
- Add real testimonials, with permission to publish each quote and attribution.
- Verify whether Git, Responsive Design, and Performance & SEO basics are skills you want to claim. These are marked `VERIFY WITH MARCO` in the skills content.
- Review the first-person biography and the stated 24-hour reply expectation.
- Push `portfolio-v2` before sharing the GitHub source links for the new demos.
- Re-run Lighthouse on the Vercel deployment to record production results.
