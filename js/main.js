import { translations } from './translations.js';

const root = document.documentElement;
const body = document.body;
const supportsObserver = 'IntersectionObserver' in window;
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

const sections = [...document.querySelectorAll('[data-section]')];
const navLinks = [...nav.querySelectorAll('a')];
const marker = document.querySelector('.nav-marker');
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
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
document.getElementById('current-year').textContent = new Date().getFullYear();
body.classList.add('is-entered');

document.addEventListener('visibilitychange', () => {
  body.classList.toggle('page-hidden', document.hidden);
});

const hero = document.querySelector('.hero');
const heroVisual = document.querySelector('.hero-visual');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (hero && heroVisual && finePointer.matches && !reduceMotion.matches) {
  let frame = 0;
  hero.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches) return;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      heroVisual.style.transform = `translate3d(${x * 9}px, ${y * 9}px, 0)`;
      frame = 0;
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    heroVisual.style.transform = '';
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
