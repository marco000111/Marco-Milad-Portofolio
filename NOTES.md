# Portfolio v2

## Structure

- The site is static HTML, CSS and JavaScript; it does not require a build step or framework.
- `content.js` is the bilingual source for portfolio copy, service cards, project case studies, app captions and contact-form labels. Edit the English and Arabic entries together.
- `js/site.js` renders the copy and handles the language switch, screenshot carousel, mobile navigation, contact form, clipboard feedback and scroll progress.
- `css/style.css` contains the navy, blue and cyan identity, glass card treatments, spacing and responsive rules. The three concept sites keep their own styles in `demos/demo.css`.
- The portfolio has six services and six skills. Testimonials are hidden until real approved quotes are added.
- When `assets/images/marco.jpg` is available, wire it into the About portrait frame; until then the page uses the MM monogram. The CV link remains hidden until `assets/cv.pdf` is added and enabled in `js/site.js`.

## Concept screenshots

- The carousel and case-study covers use real Playwright screenshots saved as WebP in `assets/images/concept-*.webp`.
- The current demo previews use fresh 1440 × 900 WebP screenshots generated from local Playwright captures. Save any future captures as `concept-restaurant.webp`, `concept-clinic.webp` and `concept-store.webp`.

## Local preview and verification

- Run `node server.mjs` from this folder. The local preview is `http://localhost:8000/`; nested demo URLs map to their `index.html` files.
- Earlier Lighthouse scores above were from the previous portfolio build; current scores are recorded in the demo redesign section below.
- Earlier demo Lighthouse scores above were from the previous demos; current scores are recorded in the demo redesign section below.
- English and Arabic layouts were captured and inspected at 360, 390, 768, 1024 and 1440 px. Automated checks found no horizontal overflow or browser-console errors at those sizes.
- Interaction checks covered preview dots, hover pause and reduced-motion behavior, the bilingual switch and WhatsApp form, plus the restaurant menu/reservation, clinic booking and store filter/cart flows.
- Internal anchors resolve, and the external WhatsApp, Instagram and hosted-app links returned successful responses during the link check.

## Before sharing

- Add Marco's real portrait and CV; enable the CV link after the PDF exists.
- Add genuine testimonials and permission for each quote and attribution.
- Review the first-person biography and 24-hour response expectation.
- Push `portfolio-v2` before sharing the GitHub links for the concept demos.
- Run Lighthouse against the deployed site to record production scores.

## Demo redesign · creative direction V2

- Rebuilt the restaurant, dental clinic and Common Goods concept pages as three separate visual systems: firelit charcoal and brass; airy white and teal; warm off-white and forest green. Kept `/demos/clinic/` working and added `/demos/dental/` as the requested dental route alias.
- Added locally stored, compressed WebP photography. Images are lazy-loaded below the hero and include dimensions and descriptive alt text. The concept sites do not fetch their photography from third-party hosts at runtime.
- Added Arabic/English direction switching to each demo, including filters and product/cart content. The restaurant has category filters and a validated reservation form that creates a WhatsApp message link; the clinic has service/date/time appointment requests and expandable FAQs; the store has 12 products, bilingual search, category and sort controls, product options, quantity controls, a local-storage bag, checkout feedback and newsletter feedback. The forms are front-end concept interactions; they do not contact a clinic, process payments or subscribe an address.

### Design review rounds

1. **Visual and image-content pass:** matched food captions to the photographed dishes, used distinct clinician portraits, checked the three different art directions against their real demo content, and trimmed the mobile layouts around their respective hero imagery and cards.
2. **RTL and interaction pass:** checked both directions at 360, 390, 768, 1024, 1440 and 1920 px. Fixed the store bag heading so locale updates retain its live item count, made store search match either language, and corrected the phone input pattern for current browser validation. Playwright found no horizontal overflow or page/console errors at those viewports after the fixes.

### Photo credits

All images are licensed for free use by their source platforms. The local optimized WebP files retain their original photographer credit here.

- **Restaurant:** [Diego Arenas de Rodrigo, warmly lit restaurant interior](https://unsplash.com/photos/warmly-lit-restaurant-interior-with-exposed-brick-walls-jJiPAKkY_-o) (hero); [Alexandr Popadin, dim restaurant table setting](https://unsplash.com/photos/a-dimly-lit-restaurant-table-setting-with-place-settings-DtfzqdgC7AQ) (story); [Ludovic Avice, hummus](https://unsplash.com/photos/a-bowl-of-hummus-with-chickpeas-on-the-side-rvhyL02EAWo); [Riccardo Bergamini, pasta](https://unsplash.com/photos/pasta-on-plate-Xe14NrSK9io); [Mark Ashford, grilled chicken salad](https://unsplash.com/photos/grilled-chicken-salad-with-strawberries-and-blueberries-TD6yFvWiOpk); [Diego Arenas de Rodrigo, grilled meat](https://unsplash.com/photos/grilled-meat-with-roasted-potatoes-and-salad-a5iJxpJwNlI); [Ella Olsson, cooked food](https://unsplash.com/photos/cooked-food-on-plate-n368kMQR1b0); [Kateryna Hliznitsova, plated cake](https://unsplash.com/photos/a-piece-of-cake-sitting-on-top-of-a-white-plate-WV7h7Si20W0); [Sara Dubler, grilled meats](https://unsplash.com/photos/grilled-meats-on-plate-lOaXEG1tVUM).
- **Noura Dental:** [Harold Hizon, dentist speaking with a patient](https://unsplash.com/photos/dentist-talking-to-patient-in-a-modern-dental-office-Bg81yWKZlMg) (hero); [Ozkan Guner, dental room](https://unsplash.com/photos/a-dental-room-with-a-blue-chair-and-dental-equipment-KRJwZrjuKpE); [Ozkan Guner, dentist examining a patient](https://unsplash.com/photos/a-dentist-examining-a-patient-rRgjO2Y1g1E); [Emily Gaibor, female dentist](https://www.pexels.com/photo/female-dentist-in-modern-dental-clinic-37458351/) (Dr. Noura); [Emily Gaibor, dentist portrait](https://www.pexels.com/photo/professional-dentist-in-modern-dental-office-37458045/) (Dr. Karim).
- **Common Goods:** [Margaret Jaszowska, ceramic cup](https://unsplash.com/photos/white-ceramic-mug-with-coffee-on-white-ceramic-saucer-ANZhUNpHT-s); [Eric Human, linen and ceramic table](https://unsplash.com/photos/stack-of-linen-napkins-and-ceramic-cups-on-table-IIXtlWowNpQ); [Veronika Martinelli, ceramic vase](https://unsplash.com/photos/white-ceramic-vase-on-white-book-ePUuKfAUwtA); [Jonathan Cosens, ceramic vessels](https://unsplash.com/photos/row-of-ceramic-vases-on-a-radiator-MTCHVzNlSL0); [Martin Baron, ceramic bowls](https://unsplash.com/photos/ceramic-bowls-and-vases-on-a-shelf-EgRT1F8VOTs); [Khanh Do, handmade ceramics](https://unsplash.com/photos/assortment-of-handmade-ceramic-bowls-and-dishes-on-shelves-1FPwnKpLeOE); [Magdalena Raczka, ceramic bowls](https://unsplash.com/photos/various-ceramic-bowls-and-kitchen-utensils-arranged-decoratively-BU25z-gf4N4); [Jocelyn Morales, candle](https://unsplash.com/photos/white-candle-on-white-table-th0b5nMt2MY); [Alex Quezada, plant in woven basket](https://unsplash.com/photos/green-plant-in-brown-woven-basket-aQgpwEqDfsI); [Adil Murshed, candle and tray](https://unsplash.com/photos/decorations-on-a-wooden-tray-with-a-candle-and-plant-2DBvJvSEhiE); [Nataliya Melnychuk, woven texture](https://unsplash.com/photos/close-up-of-woven-wicker-basket-texture-TD8uHixHjOk); [American Cleaning Institute, woven storage](https://unsplash.com/photos/woman-placing-woven-basket-into-cabinet-j4rDt1pF6ug).

- The finished home-page previews are refreshed 1440 × 900 WebP screenshots in `assets/images/concept-restaurant.webp`, `assets/images/concept-clinic.webp` and `assets/images/concept-store.webp`.
- The two review rounds and current Lighthouse v12.8.2 mobile scores are recorded here. Scores describe the local build, not a deployed production site.
- **Current mobile scores:** portfolio **99 / 100 / 100 / 100** (Performance / Accessibility / Best Practices / SEO), LCP 2.3 s, CLS 0.021; restaurant **98 / 100 / 100 / 100**, LCP 2.5 s, CLS 0; clinic **100 / 100 / 100 / 100**, LCP 1.4 s, CLS 0; Common Goods **99 / 100 / 100 / 100**, LCP 2.2 s, CLS 0.
