# Marco Milad cinematic motion implementation

## Audit: what was missing

The app is a single-page React/Vite site, with no client router. `framer-motion`, `gsap`/`ScrollTrigger`, and `lenis` were already installed, so no dependency was needed. The prior pass rendered a short `Preloader`, but it had no development replay switch and only faded away. The hero rotated one portrait plate with a blurred duplicate; there were no independent moving scene planes. ScrollTrigger only revealed headings, and project artwork tilted without separate image and metadata depth.

## What is implemented now

| Scene or interaction | Implementation | Proof |
| --- | --- | --- |
| Cinematic intro | Dedicated `CinematicIntro` plays a near-black opening, electric-blue beam, particles and linework, assembled Three.js name, light-wiped real portrait, and a 400ms handoff. The browser run observed 2.90s from intro insertion to removal. | [Intro still](../.work/immersive/proof/cinematic-intro.png) Â· [Full intro video](../.work/immersive/proof/full-cinematic-intro.webm) |
| Replay and accessibility | Skip button and Escape dismiss the intro. `sessionStorage` prevents ordinary repeats. In Vite development, append `?intro=force` to replay it. Reduced-motion skips the sequence and leaves the hero lettering static. | Browser verification results below |
| Real 3D lettering | `ThreeNameScene` loads the bundled Helvetiker Bold font with `FontLoader` and builds ten beveled `TextGeometry` meshes with 0.2 world-unit extrusion, reflective material, environment reflections, blue/cyan lights, moving sweep, particles and a perspective camera. The hero title remains interactive with pointer movement. | [Intro still](../.work/immersive/proof/cinematic-intro.png) Â· [Hero still](../.work/immersive/proof/hero-3d-interaction.png) Â· [Pointer video](../.work/immersive/proof/hero-3d-interaction.webm) |
| Project showcase | The existing real previews, rail, filters, detail dialog, and live/source links remain. Pointer tilt changes card pitch/yaw; preview image, shade, metadata, and action use separate Z depths. The radial highlight follows pointer coordinates. Coarse pointer devices keep tap-to-open with no hover transform. | [Project hover still](../.work/immersive/proof/projects-3d-interaction.png) Â· [Project hover video](../.work/immersive/proof/project-3d-interaction.webm) |
| Scroll story | Existing headings use masked, staggered ScrollTrigger reveals. The manifesto pins on desktop for 62% of viewport height with a scrubbed light field and whole-line scale treatment. Project previews receive scroll-linked image grading; the hero echo shifts with scroll. | [Full scroll video](../.work/immersive/proof/full-page-scroll.webm) |
| Mobile and touch | Touch emulation at 390Ã—844 opens project details and the document stays within viewport width. The touch fallback drops pointer tilt but preserves previews and controls. | [Mobile capture](../.work/immersive/proof/mobile-touch-390.png) |

## 3D lettering

The name is real Three.js geometry: ten individual beveled `TextGeometry` letters use a local Helvetiker Bold font, 0.2 world-unit extrusion, reflective physical material, a generated environment map, blue/cyan lighting, a moving light sweep, and a perspective camera. The scene calculates a uniform scale and camera distance from the assembled glyph bounding box and refits on resize. The desktop hero places the name beside the portrait; tablet and mobile stack the wordmark above it so the face remains clear. The supplied portrait remains the original photograph.

## Verification

- Production `npm run build`: passed.
- Browser checks used an actual Edge DevTools session against the running Vite app with WebGL enabled. The intro and hero each reported a live Three.js canvas, ten `TextGeometry` letters, beveled edges, and 0.2 extrusion depth. The 3D name responded to pointer movement. WebGL-disabled fallback, fresh intro, existing-session suppression, forced replay, skip, intro-to-hero transition, touch project opening, viewport overflow, reduced-motion suppression, and pinned-scene geometry were checked.
- `verification-results.json` records the intro and hero geometry, pointer input, touch behavior, reduced motion, WebGL fallback, all scroll samples, and captured frame counts.
- The project has no configured `npm test` script. Browser resource logs can include blocked Google Fonts requests in this isolated browser; the app renders using its existing system font fallback.

## Files changed

`index.html`; `package.json` and `package-lock.json`; `vite.config.mjs`; `assets/fonts/helvetiker_bold.typeface.json`; `src/App.jsx`; `src/components/CinematicIntro.jsx` (replaces `src/components/Preloader.jsx`); `src/components/ThreeNameScene.jsx`; `src/components/Hero.jsx`; `src/components/ManifestoScene.jsx`; `src/components/ScrollDirector.jsx`; `src/hooks/usePointerTilt.js`; and `src/reference-experience.css`. The browser proof harness is `.work/immersive/verify-and-record.mjs`; screenshots, WebM recordings, and results are in `.work/immersive/proof/`.

