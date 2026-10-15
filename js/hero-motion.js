let activeCleanup = () => {};
let mountRevision = 0;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-motion-src="${src}"]`);
    if (existing?.dataset.loaded === 'true') { resolve(); return; }
    const script = existing || document.createElement('script');
    if (!existing) {
      script.src = src;
      script.defer = true;
      script.dataset.motionSrc = src;
    }
    if (existing?.dataset.failed === 'true') { reject(new Error(`Unable to load ${src}`)); return; }
    script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
    script.addEventListener('error', () => { script.dataset.failed = 'true'; reject(new Error(`Unable to load ${src}`)); }, { once: true });
    if (!existing) document.head.append(script);
  });
}

async function getMotionEngine() {
  if (!window.gsap) await loadScript('assets/vendor/gsap.min.js');
  if (!window.ScrollTrigger) await loadScript('assets/vendor/ScrollTrigger.min.js');
  return window.gsap && window.ScrollTrigger ? { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger } : null;
}

function splitTagline(tagline, language) {
  const text = tagline.textContent.trim();
  tagline.setAttribute('aria-label', text);
  tagline.replaceChildren();
  if (language === 'ar') {
    text.split(/(\s+)/u).filter(Boolean).forEach((part) => {
      if (/^\s+$/u.test(part)) tagline.append(document.createTextNode(' '));
      else {
        const word = document.createElement('span');
        word.className = 'motion-word';
        word.setAttribute('aria-hidden', 'true');
        word.textContent = part;
        tagline.append(word);
      }
    });
    return [...tagline.querySelectorAll('.motion-word')];
  }

  const segmenter = 'Segmenter' in Intl ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;
  const characters = segmenter ? [...segmenter.segment(text)].map((part) => part.segment) : [...text];
  characters.forEach((character) => {
    const span = document.createElement('span');
    span.className = 'motion-char';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = character === ' ' ? '\u00a0' : character;
    tagline.append(span);
  });
  return [...tagline.querySelectorAll('.motion-char')];
}

export function mountHeroMotion({ root, body }) {
  activeCleanup();
  activeCleanup = () => {};
  const revision = ++mountRevision;
  const hero = document.querySelector('.hero');
  const tagline = hero?.querySelector('.hero-tagline');
  if (!hero || !tagline) return;

  const taglineParts = splitTagline(tagline, root.lang);
  const nameLines = [...hero.querySelectorAll('.hero-name .name-line')];
  const nameChars = [...hero.querySelectorAll('.hero-name .name-char')];
  const eyebrow = hero.querySelector('.eyebrow');
  const copy = hero.querySelector('.hero-copy');
  const actions = hero.querySelector('.hero-actions');
  const visual = hero.querySelector('.hero-visual');
  const code = hero.querySelector('.code-window');
  const grid = hero.querySelector('.hero-grid');
  const floaties = [...hero.querySelectorAll('.tech-float')];
  const aboutHeading = document.querySelector('#about > .section-heading');
  const playEntrance = !body.classList.contains('hero-motion-ready');
  let entrancePending = playEntrance;

  getMotionEngine().then((engine) => {
    if (revision !== mountRevision) return;
    if (!engine) {
      body.classList.add('is-entered');
      return;
    }

    const { gsap, ScrollTrigger } = engine;
    body.classList.add('hero-motion-ready', 'is-entered');
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const movingChars = [...nameChars, ...taglineParts];
    let pointerCleanup = () => {};

    media.add({
      reduced: '(prefers-reduced-motion: reduce)',
    full: '(prefers-reduced-motion: no-preference)',
    small: '(max-width: 760px)'
    }, (context) => {
      if (context.conditions.reduced || !context.conditions.full) {
        gsap.set(movingChars, { clearProps: 'transform,opacity,visibility' });
        gsap.set([eyebrow, copy, actions, visual, code, grid, ...floaties], { clearProps: 'transform,opacity,visibility' });
        return;
      }

      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (entrancePending) {
        gsap.set(nameChars, { autoAlpha: 0, transformPerspective: 900, transformOrigin: '50% 55%' });
        gsap.set(taglineParts, { autoAlpha: 0, transformPerspective: 700, transformOrigin: '50% 90%' });
        gsap.set([eyebrow, copy, actions, visual, code, grid, ...floaties], { autoAlpha: 0 });
        entrance.fromTo(grid, { autoAlpha: 0 }, { autoAlpha: 1, duration: .65 }, 0);
        entrance.fromTo(visual, { autoAlpha: 0, scale: .7, rotationY: -24, rotationZ: 8 }, { autoAlpha: 1, scale: 1, rotationY: 0, rotationZ: 0, duration: 1.15 }, .14);
        entrance.fromTo(eyebrow, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .52 }, .24);
        entrance.fromTo(code, { x: 94, y: 24, rotationY: -22, rotationZ: 5, autoAlpha: 0 }, { x: 0, y: 0, rotationY: -5, rotationZ: -1, autoAlpha: 1, duration: .8 }, .54);
        entrance.fromTo(floaties, { x: (i) => i % 2 ? 38 : -34, y: (i) => i % 2 ? 32 : -28, rotation: (i) => i % 2 ? 15 : -18, scale: .45, autoAlpha: 0 }, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: .66, stagger: .09, ease: 'back.out(1.7)' }, .72);

        const arrivals = [
          { x: -82, y: 52, rotationX: -78, rotationY: -52, rotationZ: -15, scale: .52 },
          { x: 44, y: -86, rotationX: 62, rotationY: 48, rotationZ: 12, scale: .72 },
          { x: 74, y: 48, rotationX: -42, rotationY: 82, rotationZ: 16, scale: .58 },
          { x: -56, y: -64, rotationX: 74, rotationY: -72, rotationZ: -10, scale: .66 },
          { x: 98, y: 18, rotationX: -55, rotationY: 64, rotationZ: 8, scale: .5 }
        ];
        nameLines.forEach((line, lineIndex) => {
          [...line.querySelectorAll('.name-char')].forEach((character, index) => {
            const from = arrivals[(index + lineIndex * 2) % arrivals.length];
            entrance.fromTo(character, { ...from, autoAlpha: 0 }, {
              x: 0, y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, autoAlpha: 1,
              duration: .92, ease: 'back.out(1.4)'
            }, .43 + lineIndex * .46 + index * .052);
          });
        });
        const period = hero.querySelector('.name-period');
        if (period) entrance.fromTo(period, { scale: 0, rotation: -90, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: .46, ease: 'back.out(2.2)' }, 1.25);
        entrance.fromTo(taglineParts, { y: (i) => i % 2 ? 22 : -26, rotationX: (i) => i % 2 ? 65 : -70, rotationZ: (i) => i % 2 ? 8 : -8, scale: .75, autoAlpha: 0 }, {
          y: 0, rotationX: 0, rotationZ: 0, scale: 1, autoAlpha: 1, duration: .56,
          stagger: { each: .026, from: 'center' }, ease: 'back.out(1.35)'
        }, 1.48);
        entrance.fromTo(copy, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .58 }, 1.9);
        entrance.fromTo(actions, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5 }, 2.08);
        entrance.to(nameChars, { backgroundPosition: '0% 100%', duration: .72, stagger: .035, ease: 'sine.inOut' }, 1.72);
        entrancePending = false;
      } else {
        gsap.set([...nameChars, ...taglineParts], { clearProps: 'transform,opacity,visibility' });
      }

      const isSmall = context.conditions.small;
      const transition = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * (context.conditions.small ? .68 : .88))}`,
          scrub: .85,
          invalidateOnRefresh: true
        }
      });
      transition
        .to(nameLines[0], { yPercent: -112, xPercent: -8, scale: .64, rotationZ: -7, autoAlpha: .16, ease: 'none' }, 0)
        .to(nameLines[1], { yPercent: 94, xPercent: 7, scale: .68, rotationZ: 6, autoAlpha: .18, ease: 'none' }, 0)
        .to(taglineParts, { y: (i) => i % 2 ? 46 : -38, rotationX: (i) => i % 2 ? -55 : 50, autoAlpha: 0, stagger: { each: .012, from: 'edges' }, ease: 'none' }, .04)
        .to([copy, actions], { y: -34, autoAlpha: 0, stagger: .035, ease: 'none' }, .08)
        .to(visual, { xPercent: isSmall ? 8 : 22, yPercent: -17, scale: isSmall ? .78 : .68, rotationY: isSmall ? 8 : 18, autoAlpha: .16, ease: 'none' }, 0)
        .to(code, { xPercent: 16, y: -74, rotationY: -12, autoAlpha: 0, ease: 'none' }, .12)
        .to(floaties, { x: (i) => i % 2 ? 64 : -58, y: (i) => i % 2 ? -72 : 62, rotation: (i) => i % 2 ? 14 : -14, autoAlpha: 0, stagger: .025, ease: 'none' }, .05)
        .to(grid, { y: -75, autoAlpha: .16, ease: 'none' }, 0);
      if (aboutHeading) {
        transition.fromTo(aboutHeading, { y: 46, rotationX: -7, scale: .94, clipPath: 'inset(0 0 46% 0)' }, {
          y: 0, rotationX: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', ease: 'none'
        }, .72);
      }

      if (!isSmall && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const quickX = nameChars.map((character) => gsap.quickTo(character, 'x', { duration: .28, ease: 'power3.out' }));
        const quickY = nameChars.map((character) => gsap.quickTo(character, 'y', { duration: .28, ease: 'power3.out' }));
        const quickRotate = nameChars.map((character) => gsap.quickTo(character, 'rotationY', { duration: .32, ease: 'power3.out' }));
        let pointerFrame = 0;
        let pointerX = 0;
        let pointerY = 0;
        const move = (event) => {
          pointerX = event.clientX;
          pointerY = event.clientY;
          if (pointerFrame) return;
          pointerFrame = requestAnimationFrame(() => {
            pointerFrame = 0;
            const boxes = nameChars.map((character) => character.getBoundingClientRect());
            boxes.forEach((box, index) => {
              const dx = pointerX - (box.left + box.width / 2);
              const dy = pointerY - (box.top + box.height / 2);
              const distance = Math.hypot(dx, dy);
              const force = Math.max(0, 1 - distance / 132);
              const angle = Math.atan2(dy, dx);
              quickX[index](-Math.cos(angle) * force * 8);
              quickY[index](-Math.sin(angle) * force * 6);
              quickRotate[index](Math.sin(angle) * force * 7);
            });
          });
        };
        const reset = () => {
          if (pointerFrame) cancelAnimationFrame(pointerFrame);
          pointerFrame = 0;
          quickX.forEach((set) => set(0));
          quickY.forEach((set) => set(0));
          quickRotate.forEach((set) => set(0));
        };
        hero.addEventListener('pointermove', move, { passive: true });
        hero.addEventListener('pointerleave', reset, { passive: true });
        pointerCleanup = () => {
          hero.removeEventListener('pointermove', move);
          hero.removeEventListener('pointerleave', reset);
          reset();
        };
      }

      return () => {
        pointerCleanup();
        gsap.killTweensOf(nameChars);
        entrance.kill();
        transition.scrollTrigger?.kill();
        transition.kill();
      };
    });
    activeCleanup = () => media.revert();
  }).catch(() => {
    if (revision === mountRevision) body.classList.add('is-entered');
  });
}
