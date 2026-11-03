# Marco Milad Portfolio

A bilingual React portfolio built with Vite, Tailwind CSS, Framer Motion, GSAP, Lenis, and Lucide icons. The main page is responsive and supports English and Arabic/RTL. The three standalone demo websites remain under `/demos/`.

## Development

```sh
npm install
npm run dev
```

Vite starts at <http://localhost:5173>.

## Production

```sh
npm run build
npm run preview
```

The build outputs the React application and copies the standalone demo sites, local image assets, icons, and crawler files into `dist/`.

## Portfolio content and assets

- Update bilingual site content in `content.js` and app labels/project mappings in `src/data/portfolio.js`.
- The contact links and phone number are defined in `src/components/Contact.jsx`.
- The hero ID badge uses the local cyberpunk portrait at `assets/images/marco-cyberpunk-avatar.jpeg`.
- The interactive bilingual project timeline is in `src/components/Resume.jsx`; its matching dark, one-page PDF is generated in `src/lib/createResume.js`.
- Project screenshots and demo photography are stored locally under `assets/images/`.
