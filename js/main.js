import { translations } from './translations.js';

const root = document.documentElement;
const body = document.body;
const supportsObserver = 'IntersectionObserver' in window;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (supportsObserver) body.classList.add('js-ready');
const langButton = document.querySelector('.language-toggle');
const nav = document.querySelector('.site-nav');
const menuButton = document.querySelector('.menu-toggle');
let language = 'en';
try { language = localStorage.getItem('portfolio-language') === 'ar' ? 'ar' : 'en'; } catch (_) { /* Storage is optional. */ }

function setLanguage(next, persist = true) {
  const currentY = window.scrollY;
  body.classList.add('language-changing');
  language = next;
  root.lang = next;
  root.dir = next === 'ar' ? 'rtl' : 'ltr';
  body.classList.toggle('rtl-mode', next === 'ar');
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const value = translations[next][node.dataset.i18n];
    if (value !== undefined) node.innerHTML = value;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
    node.setAttribute('aria-label', translations[next][node.dataset.i18nAria]);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((node) => {
    node.setAttribute('alt', translations[next][node.dataset.i18nAlt]);
  });
  langButton.innerHTML = next === 'en' ? 'AR <span>/</span> EN' : 'EN <span>/</span> AR';
  langButton.setAttribute('aria-label', next === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية');
  document.title = next === 'en' ? 'Marco Milad — Front-end Developer' : 'ماركو ميلاد — مطور واجهات أمامية';
  if (persist) { try { localStorage.setItem('portfolio-language', next); } catch (_) { /* Continue without persistence. */ } }
  requestAnimationFrame(() => {
    window.scrollTo({ top: currentY, behavior: 'instant' });
    window.setTimeout(() => body.classList.remove('language-changing'), 180);
  });
}

setLanguage(language, false);
langButton.addEventListener('click', () => setLanguage(language === 'en' ? 'ar' : 'en'));
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', translations[language][open ? 'menuClose' : 'menuOpen']);
  nav.classList.toggle('is-open', open);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', translations[language].menuOpen);
}));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menuButton.getAttribute('aria-expanded') !== 'true') return;
  nav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', translations[language].menuOpen);
  menuButton.focus();
});

document.querySelectorAll('.skill-group').forEach((group) => {
  group.querySelectorAll('.skill-word').forEach((button) => {
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      group.querySelectorAll('.skill-word').forEach((item) => {
        const detail = document.getElementById(item.getAttribute('aria-controls'));
        item.setAttribute('aria-expanded', 'false');
        detail.hidden = true;
      });
      if (opening) {
        button.setAttribute('aria-expanded', 'true');
        document.getElementById(button.getAttribute('aria-controls')).hidden = false;
      }
    });
  });
});

const sections = [...document.querySelectorAll('[data-section]')];
const navLinks = [...nav.querySelectorAll('a')];
const marker = document.querySelector('.nav-marker');
const sceneCurrent = document.querySelector('#scene-current');
const sceneTotal = document.querySelector('#scene-total');
if (sceneTotal) sceneTotal.textContent = String(sections.length).padStart(2, '0');
function setActive(id) {
  navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${id}`));
  const active = navLinks.find((link) => link.hash === `#${id}`);
  if (active && marker && window.innerWidth > 760) {
    marker.style.width = `${active.offsetWidth}px`;
    marker.style.transform = `translateX(${active.offsetLeft}px)`;
  }
}
if (supportsObserver) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

const progress = document.querySelector('.scroll-progress span');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}
let sceneFrame = 0;
function updateScrollScenes() {
  sceneFrame = 0;
  const height = window.innerHeight || 1;
  let activeScene = 0;
  let activeProgress = 0;
  sections.forEach((scene, index) => {
    const bounds = scene.getBoundingClientRect();
    const progressInScene = Math.max(0, Math.min(1, (height - bounds.top) / (height + bounds.height)));
    const motionPhase = reduceMotion.matches ? 0 : progressInScene - .5;
    scene.style.setProperty('--scene-progress', progressInScene.toFixed(3));
    if (scene.id === 'about') {
      scene.querySelector('.about-art')?.style.setProperty('--about-art-lift', `${(-motionPhase * 18).toFixed(2)}px`);
      scene.querySelector('.signal-ring-three')?.style.setProperty('--about-orbit', `${(motionPhase * 46).toFixed(2)}deg`);
    }
    if (scene.id === 'skills') {
      scene.querySelectorAll('.skill-group').forEach((group, item) => {
        const direction = item % 2 ? 1 : -1;
        group.style.setProperty('--skill-shift', `${(-direction * motionPhase * 20).toFixed(2)}px`);
        group.style.setProperty('--skill-tilt', `${(-direction * motionPhase * 8).toFixed(2)}deg`);
      });
    }
    if (scene.id === 'work') {
      scene.querySelectorAll('.project-preview').forEach((preview, item) => {
        const direction = item % 2 ? 1 : -1;
        preview.style.setProperty('--work-lift', `${(-motionPhase * 24).toFixed(2)}px`);
        preview.style.setProperty('--work-tilt', `${(-direction * motionPhase * 7).toFixed(2)}deg`);
      });
    }
    if (scene.id === 'process') {
      scene.querySelectorAll('.process-list li').forEach((step, item) => {
        const direction = item % 2 ? 1 : -1;
        step.style.setProperty('--step-shift', `${(-direction * motionPhase * 14).toFixed(2)}px`);
        step.style.setProperty('--step-turn', `${(-direction * motionPhase * 5).toFixed(2)}deg`);
      });
    }
    if (scene.id === 'contact') {
      scene.querySelectorAll('.contact-option').forEach((option, item) => {
        const direction = item % 2 ? -1 : 1;
        option.style.setProperty('--contact-shift', `${(-direction * motionPhase * 18).toFixed(2)}px`);
      });
    }
    if (bounds.top <= height * .55 && bounds.bottom > height * .55) {
      activeScene = index;
      activeProgress = progressInScene;
    }
  });
  if (sceneCurrent) sceneCurrent.textContent = String(activeScene + 1).padStart(2, '0');
  const sceneCounter = document.querySelector('.scene-counter');
  sceneCounter?.style.setProperty('--scene-meter', ((activeScene + activeProgress) / Math.max(sections.length, 1)).toFixed(3));
  const heroProgress = reduceMotion.matches ? 0 : Math.max(0, Math.min(1, window.scrollY / height));
  const scrollShift = `${(-heroProgress * 42).toFixed(2)}px`;
  const heroScene = document.querySelector('.hero');
  heroScene?.style.setProperty('--hero-progress', heroProgress.toFixed(3));
  heroScene?.style.setProperty('--content-scroll-shift', `${(-heroProgress * 16).toFixed(2)}px`);
  heroScene?.style.setProperty('--content-opacity', (1 - heroProgress * .12).toFixed(3));
  heroScene?.style.setProperty('--scroll-hint-opacity', (1 - heroProgress).toFixed(3));
  heroScene?.querySelector('.hero-grid')?.style.setProperty('--scroll-shift', scrollShift);
  heroScene?.querySelector('.hero-visual')?.style.setProperty('--scroll-shift', `${(-heroProgress * 23).toFixed(2)}px`);
  heroScene?.querySelector('.code-window')?.style.setProperty('--scroll-shift', `${(-heroProgress * 32).toFixed(2)}px`);
  heroScene?.querySelector('.hero-tech-floats')?.style.setProperty('--scroll-shift', `${(-heroProgress * 38).toFixed(2)}px`);
  updateProgress();
}
function requestSceneFrame() {
  if (!sceneFrame) sceneFrame = requestAnimationFrame(updateScrollScenes);
}
window.addEventListener('scroll', requestSceneFrame, { passive: true });
window.addEventListener('resize', requestSceneFrame, { passive: true });
updateScrollScenes();
document.getElementById('current-year').textContent = new Date().getFullYear();
body.classList.add('is-entered');

document.addEventListener('visibilitychange', () => {
  body.classList.toggle('page-hidden', document.hidden);
});

const hero = document.querySelector('.hero');
const heroVisual = document.querySelector('.hero-visual');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (hero && heroVisual && finePointer.matches && !reduceMotion.matches) {
  let frame = 0;
  const parallaxLayers = [
    { element: hero.querySelector('.hero-grid'), factor: -7 },
    { element: heroVisual, factor: 10 },
    { element: hero.querySelector('.code-window'), factor: -7 },
    { element: hero.querySelector('.hero-tech-floats'), factor: 13 }
  ].filter((layer) => layer.element);
  hero.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches) return;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      parallaxLayers.forEach(({ element, factor }) => {
        element.style.setProperty('--parallax-x', `${(x * factor).toFixed(2)}px`);
        element.style.setProperty('--parallax-y', `${(y * factor).toFixed(2)}px`);
      });
      frame = 0;
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    parallaxLayers.forEach(({ element }) => {
      element.style.removeProperty('--parallax-x');
      element.style.removeProperty('--parallax-y');
    });
  }, { passive: true });
}

const copyTimers = new WeakMap();
async function copyValue(value) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(value); return true; } catch (_) { /* Try the local fallback below. */ }
  }
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
  field.remove();
  return copied;
}

document.querySelectorAll('.copy-contact').forEach((button) => {
  button.addEventListener('click', async () => {
    const feedback = button.querySelector('.copy-state');
    if (!await copyValue(button.dataset.copy)) return;
    feedback.textContent = translations[language].copiedValue;
    button.classList.add('is-copied');
    window.clearTimeout(copyTimers.get(button));
    const timer = window.setTimeout(() => {
      feedback.textContent = translations[language].copyValue;
      button.classList.remove('is-copied');
    }, 1600);
    copyTimers.set(button, timer);
  });
});
