# Marco Milad immersive motion implementation

This upgrade keeps the approved page composition and adds motion to its existing scenes. It uses the installed Framer Motion, GSAP/ScrollTrigger, and Lenis packages; no 3D engine or additional runtime dependency was added.

## Scene map

| Existing scene | Implementation | Evidence |
| --- | --- | --- |
| Opening | A 2.37 second maximum portrait/name sequence, blue particles and drawn light paths. Skip and Escape dismiss it; session storage limits it to once per tab session. Reduced motion skips it. | [Intro capture](../.work/immersive/proof/desktop-intro.png) |
| Hero | Existing portrait and layout stay in place. A restrained pointer-driven perspective, blue depth echo, particles, light and staggered headline remain CSS/image based, preserving the supplied face. | [Desktop](../.work/immersive/proof/desktop-home.png), [mobile RTL](../.work/immersive/proof/360-home-rtl.png) |
| Projects | The existing horizontal project rail, filters, details dialog, previews and links remain. Pointer tilt, image zoom and a pointer-following highlight add depth on mouse; touch retains the existing tap-to-open flow. | [Project scene](../.work/immersive/proof/desktop-projects.png) |
| About | Scroll-triggered kicker/headline reveal with a subdued blue light wash, alongside the existing stat reveal. | [About scene](../.work/immersive/proof/desktop-about.png) |
| Manifesto | Existing masked statement and continuously moving oversized marquee provide a pause between content scenes. Reduced motion makes the marquee still. | [Manifesto scene](../.work/immersive/proof/desktop-manifesto.png) |
| Skills | Existing technology tiles keep their orbital CSS motion, with offscreen pause, in-view activation, a small perspective hover and the existing category filter. | [Skills scene](../.work/immersive/proof/desktop-skills.png) |
| Resume | Existing interactive timeline and download remain; ScrollTrigger adds the same timed heading reveal. | [Resume scene](../.work/immersive/proof/desktop-resume.png) |
| Contact finale | Scroll-linked lighting, headline and social-link reveals, refined hover states, and the existing validated contact flow. | [Contact scene](../.work/immersive/proof/desktop-contact.png) |

## Motion and accessibility

- ScrollTrigger coordinates heading reveals, the about/contact light wash and hero depth echo. A language-change event refreshes trigger measurements after English/Arabic layout changes.
- Lenis follows the live `prefers-reduced-motion` setting, pauses when the tab is hidden, and is removed on unmount. GSAP timelines and listeners are reverted with their component lifecycle.
- Pointer effects are limited to fine pointers, use animation frames, and are disabled under reduced motion. Native touch interactions remain available.
- Arabic strings remain whole words/lines; no character-level split animation is used. Page `lang` and `dir` continue to follow the selected language.
- Depth is an image echo and CSS perspective, not a real 3D portrait model. This avoids face deformation and keeps rendering light. The project lighting is CSS based.
- The intro is intentionally short and dismissible. Its overlay does not intercept page input; important page content is rendered underneath it.

## Visual review passes

1. Initial capture review checked the intro crop, hero portrait scale, project image treatment, floating technology field, and mobile RTL composition against the baseline captures in `../.work/immersive/baseline/`.
2. The refinement pass fixed particle positions to use broadly supported CSS values, centered the custom cursor correctly, aligned the project reflection to the pointer hook's variables, and removed transform-property overlap between GSAP and existing Framer Motion effects. The final screenshots and recording below were captured after these changes.

## Verification artifacts

- [Browser interaction results](../.work/immersive/proof/browser-results.json)
- [Desktop scroll-through recording](../.work/immersive/proof/marco-milad-immersive-experience.webm)
- Screenshots in `../.work/immersive/proof/` include the intro, all seven page scenes, Arabic desktop, 360px RTL, and 768px RTL.
- `npm run build` passed. The project has no configured test script; the browser run exercised intro visibility/skip/session/reduced-motion, project filter/dialog/rail/tilt, skill filter, required contact validation, language direction and overflow at mobile widths.
- The browser environment blocked Google Fonts network requests. System font fallbacks rendered the page. It also recorded the expected missing favicon response on the temporary recording page; no application runtime exceptions were reported.
