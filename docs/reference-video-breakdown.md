# Marco Milad reference-video implementation

## Full-clip review

The supplied `Download.mp4` runs for 67 seconds at 1024 × 576. I reviewed the full clip and sampled the page from its opening through its final platform end card. The last TikTok-branded frame is the video outro, rather than a website section.

### Scene breakdown

| Time | Reference scene and motion | Implementation |
|---|---|---|
| 0–8s | A warm, dark panoramic hero. A centered portrait sits between very large Arabic name lettering. A compact black icon bar floats at the top. The next content is already visible below the hero. | A panoramic navy portrait scene puts Marco's name on both sides of his supplied portrait. The compact fixed icon rail and project previews sit in the same opening composition. The portrait enters with a restrained clip reveal. |
| 9–33s | The hero holds while a row of three large browser or folder previews settles into view. Scrolling is the main way to explore the portfolio. | A horizontal, snap-scrolling showcase places the three website concepts immediately after the hero. Live demos, project details, category filters, and previous/next controls remain available. |
| 35–42s | The page moves to a near-empty white canvas. One centered, multi-line Arabic statement carries the scene; the compact navigation remains fixed. | A pale-blue editorial scene centers Marco's statement at display scale. The light surface and dark type preserve the reference's abrupt tonal change while keeping the requested blue identity. |
| 50–54s | A very large phrase enters across the viewport, with repeated Arabic characters moving laterally and soft shapes at the edges. | A continuous, oversized type track crosses a full-width light canvas. The message and pace are adapted to Marco's identity; reduced-motion settings stop the track. |
| 57–60s | Floating app marks frame a centered Arabic statement on a white field. The marks drift gently and create depth around the text. | A dark skills scene places the existing technology marks around the central headline. Small CSS transforms provide a light floating motion without introducing a 3D rendering dependency. |
| 63–67s | TikTok's logo and loading bar close the captured clip. | Omitted because this is the platform's end card, not part of the portfolio website. |

### Motion and interaction notes

- The page is explored by vertical scrolling. The compact icon bar stays fixed while the content changes beneath it.
- The sampled opening already shows the page; there is no separate loading or intro scene.
- The project previews become more prominent as the page is explored. The later scenes rely on a large change in scale and background tone, rather than ordinary card grids.
- The clip does not show a custom cursor or a clear hover state. It shows a standard pointer and scrolling, so no custom cursor behavior was inferred.
- The hero uses a static photograph in the source clip. Marco's existing realistic portrait is used in its place, retaining his curly hair and black sunglasses.
- The source uses a warm brown hero and white later scenes. This implementation uses deep navy, electric blue, and cyan in the hero and skill scene, with a pale blue-white for the editorial scenes, as requested.
- The reference's floating marks have a rendered 3D look. CSS-lit skill marks are the lightweight equivalent here; they are not 3D models.

### Representative reference frames

- [00s — opening portrait and first previews](../.work/reference-video/time-00.png)
- [09s — project previews settled into view](../.work/reference-video/time-09.png)
- [35s — centered statement](../.work/reference-video/time-35.png)
- [50s — oversized moving type](../.work/reference-video/time-50.png)
- [57s — floating marks and centered statement](../.work/reference-video/time-57.png)
- [63s — platform outro, excluded from the website](../.work/reference-video/time-63.png)

## Reference-to-implementation checklist

- [x] Panoramic portrait-led opening, with oversized name set on both sides.
- [x] Compact, fixed icon navigation and accessible language controls.
- [x] Project previews directly follow the opening; they use a horizontal reel instead of a conventional grid.
- [x] Vertical scroll leads into distinct scenes with clear changes in color, scale, and composition.
- [x] Large, centered editorial statement on a light background.
- [x] Repeating, oversized horizontal type motion.
- [x] Floating marks surrounding the closing skills statement.
- [x] Project preview zoom, detail modal, category filters, and working rail controls.
- [x] English LTR, Arabic RTL, responsive layouts, and reduced-motion handling.
- [x] Intro overlay removed so the opening appears immediately.
- [x] The ending TikTok card is excluded from the website implementation.

## Implementation screenshots and recording

All captures were made from the running site with Edge DevTools screencast and a 1440 × 1000 desktop or mobile emulation viewport.

- [Desktop opening](../.work/proof/desktop-home.png)
- [Project reel](../.work/proof/desktop-projects.png)
- [About statement](../.work/proof/desktop-about.png)
- [Moving type scene](../.work/proof/desktop-manifesto.png)
- [Skills constellation](../.work/proof/desktop-skills.png)
- [Resume scene](../.work/proof/desktop-resume.png)
- [Contact scene](../.work/proof/desktop-contact.png)
- [Arabic RTL opening](../.work/proof/desktop-arabic-home.png)
- [360px RTL opening](../.work/proof/360-home-rtl.png)
- [768px RTL opening](../.work/proof/768-home-rtl.png)
- [Animated desktop scroll recording (WebM)](../.work/proof/marco-milad-reference-experience.webm)

## Visual review passes

1. The first desktop/mobile capture exposed a two-line desktop name and an off-canvas RTL nav at 360px. The name is now kept on one line and the mobile icon rail is shown and centered in RTL.
2. The second capture confirmed the photo, name, and project previews share the opening composition; the light statement and ticker remain legible; the RTL nav stays in frame; and the sampled 360px and 768px layouts have no horizontal overflow.
