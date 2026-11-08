import { content } from '../content.js';

const $ = (selector) => document.querySelector(selector);
const root = document.documentElement;
const projectSlugs = ['restaurant', 'clinic', 'store'];
const projectScreens = projectSlugs.map((slug) => `assets/images/concept-${slug}.webp`);
let language;
try { language = localStorage.getItem('portfolio-language') || (/^ar/i.test(navigator.language) ? 'ar' : 'en'); } catch { language = 'en'; }
if (!content[language]) language = 'en';
let previewIndex = 0;
let previewTimer;

const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
const setHighlighted = (id, full, highlight) => {
  const element = document.getElementById(id);
  if (!element) return;
  const start = full.lastIndexOf(highlight);
  if (start < 0) { element.textContent = full; return; }
  element.replaceChildren(document.createTextNode(full.slice(0, start)));
  const em = document.createElement('em');
  em.textContent = highlight;
  element.append(em, document.createTextNode(full.slice(start + highlight.length)));
};
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function renderPreview(index) {
  previewIndex = (index + projectSlugs.length) % projectSlugs.length;
  const project = content[language].concepts[previewIndex];
  const image = $('#preview-image');
  image.src = projectScreens[previewIndex];
  image.alt = `${project[0]} website concept screenshot`;
  setText('preview-stamp', `0${previewIndex + 1} / 03 · ${project[0]}`);
  document.querySelectorAll('.preview-tabs button').forEach((button, i) => {
    button.classList.toggle('active', i === previewIndex);
    button.setAttribute('aria-pressed', String(i === previewIndex));
  });
}
function stopPreview() { window.clearInterval(previewTimer); previewTimer = undefined; }
function startPreview() {
  stopPreview();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden || $('.hero-art:hover') || $('.hero-art:focus-within')) return;
  previewTimer = window.setInterval(() => renderPreview(previewIndex + 1), 5200);
}
function setupPreview() {
  const tabs = $('#preview-tabs');
  tabs.innerHTML = projectSlugs.map((slug, i) => `<button type="button" data-preview="${i}" aria-label="${language === 'en' ? 'Show' : 'عرض'} ${escapeHTML(content[language].concepts[i][0])}" aria-controls="preview"></button>`).join('');
  tabs.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => { renderPreview(Number(button.dataset.preview)); startPreview(); }));
  renderPreview(previewIndex);
}

function render() {
  const copy = content[language];
  root.lang = language;
  root.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.title = copy.title;
  $('meta[name="description"]').content = copy.description;
  $('meta[name="theme-color"]').content = '#070b16';
  $('meta[property="og:title"]').content = copy.title;
  $('meta[property="og:description"]').content = copy.description;
  $('meta[name="twitter:title"]').content = copy.title;
  $('meta[name="twitter:description"]').content = copy.description;
  $('#nav').setAttribute('aria-label', copy.navLabel);
  $('#nav').innerHTML = copy.nav.map((label, index) => `<a href="#${['services', 'work', 'about', 'skills', 'contact'][index]}">${escapeHTML(label)}</a>`).join('');
  setText('skip', copy.skip);
  setText('available', copy.available);
  setHighlighted('headline', copy.hero, copy.heroHighlight);
  setText('intro', copy.intro);
  setText('hero-wa', copy.whatsapp);
  $('#hero-wa').href = `https://wa.me/201227925383?text=${encodeURIComponent(language === 'ar' ? 'مرحبًا ماركو، أود التحدث عن مشروع موقع.' : 'Hi Marco, I’d like to discuss a website project.')}`;
  setText('work-cta', copy.seeWork);
  $('#trust').innerHTML = copy.trust.map((value) => `<li>${escapeHTML(value)}</li>`).join('');
  setText('preview-caption', copy.previewCaption);
  setText('services-kicker', language === 'en' ? '01 / SERVICES' : '01 / الخدمات');
  setHighlighted('services-title', copy.servicesTitle, copy.servicesHighlight);
  setText('services-intro', copy.servicesIntro);
  $('#services-grid').innerHTML = copy.services.map((service, index) => `<article class="service-card"><span class="number">0${index + 1}</span><h3>${escapeHTML(service[0])}</h3><p>${escapeHTML(service[1])}</p><ul>${service[2].map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul><a href="#contact">${escapeHTML(copy.whatsapp)} <span aria-hidden="true">↗</span></a></article>`).join('');

  setText('work-kicker', language === 'en' ? '02 / SELECTED WORK' : '02 / نماذج من الأعمال');
  setHighlighted('work-title', copy.workTitle, copy.workHighlight);
  setText('work-intro', copy.workIntro);
  $('#concepts').innerHTML = copy.concepts.map((project, index) => `<article class="concept-card"><div class="concept-visual"><img src="${projectScreens[index]}" width="1280" height="800" loading="lazy" decoding="async" alt="${escapeHTML(project[0])} project screenshot"><small>${escapeHTML(copy.concept)}</small><h3>${escapeHTML(project[0])}</h3></div><div class="concept-body"><p class="concept-type">${escapeHTML(project[1])}</p>${project.slice(2, 6).map((value, item) => `<p class="case"><b>${escapeHTML(copy.caseLabels[item])}</b>${escapeHTML(value)}</p>`).join('')}<div class="concept-links"><a href="demos/${projectSlugs[index]}/">${escapeHTML(copy.demo)} <span aria-hidden="true">↗</span></a><a href="https://github.com/marco000111/Marco-Milad-Portofolio/tree/portfolio-v2/demos/${projectSlugs[index]}" target="_blank" rel="noopener noreferrer">${escapeHTML(copy.github)} <span aria-hidden="true">↗</span></a></div></div></article>`).join('');
  setText('apps-kicker', language === 'en' ? 'PERSONAL PROJECTS' : 'مشروعات شخصية');
  setText('apps-title', copy.appsTitle);
  $('#apps').innerHTML = copy.apps.map((app) => `<article class="app-card"><a href="${escapeHTML(app[3])}" target="_blank" rel="noopener noreferrer"><img src="${escapeHTML(app[2])}" width="1897" height="1018" loading="lazy" decoding="async" alt="${escapeHTML(app[0])} screenshot"></a><div class="app-copy"><h3>${escapeHTML(app[0])}</h3><p>${escapeHTML(app[1])}</p></div></article>`).join('');

  setText('about-kicker', language === 'en' ? '03 / ABOUT' : '03 / نبذة عني');
  setText('about-title', copy.aboutTitle);
  $('#about-photo').setAttribute('aria-label', copy.photoLabel);
  setText('about-copy', copy.about);
  setText('skills-kicker', language === 'en' ? '04 / CAPABILITIES' : '04 / المهارات');
  setText('skills-title', copy.skillsTitle);
  const marks = ['<>', '#', 'JS', 'R', 'N', 'UI'];
  $('#skills-grid').innerHTML = copy.skills.map((skill, index) => `<div class="skill-chip" data-mark="${marks[index]}" role="listitem">${escapeHTML(skill)}</div>`).join('');
  $('#skills-grid').setAttribute('role', 'list');

  setText('contact-kicker', language === 'en' ? '05 / CONTACT' : '05 / تواصل');
  setText('contact-title', copy.contactTitle);
  setText('contact-intro', copy.contactIntro);
  setText('reply', copy.reply);
  setText('name-label', copy.name);
  setText('need-label', copy.need);
  setText('budget-label', copy.budget);
  setText('message-label', copy.message);
  setText('send', copy.send);
  $('#contact-form').setAttribute('aria-label', copy.contactTitle);
  const form = $('#contact-form');
  form.elements.need.innerHTML = `<option value="">${escapeHTML(copy.choose)}</option>${copy.needs.map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join('')}`;
  form.elements.budget.innerHTML = `<option value="">${escapeHTML(copy.chooseBudget)}</option>${copy.budgets.map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join('')}`;
  $('#contact-cards').innerHTML = [
    [copy.wa, '+20 122 792 5383', 'https://wa.me/201227925383', '201227925383'],
    [copy.email, 'marcomilad707@gmail.com', 'mailto:marcomilad707@gmail.com', 'marcomilad707@gmail.com'],
    [copy.instagram, '@designsby_marco_', 'https://instagram.com/designsby_marco_', '@designsby_marco_'],
  ].map(([label, value, url, copyValue]) => `<article class="contact-card"><strong>${escapeHTML(label)}</strong><bdi dir="ltr">${escapeHTML(value)}</bdi><button type="button" data-copy="${escapeHTML(copyValue)}" aria-label="${language === 'en' ? 'Copy' : 'نسخ'} ${escapeHTML(label)}">${escapeHTML(copy.copy)}</button><a href="${url}" target="${url.startsWith('http') ? '_blank' : '_self'}" rel="noopener noreferrer">${language === 'en' ? `Open ${escapeHTML(label)}` : `افتح ${escapeHTML(label)}`} <span aria-hidden="true">↗</span></a></article>`).join('');

  $('#lang').textContent = language === 'en' ? 'العربية' : 'English';
  $('#lang').setAttribute('aria-label', copy.language);
  $('#menu').setAttribute('aria-label', $('#menu').getAttribute('aria-expanded') === 'true' ? copy.closeMenu : copy.openMenu);
  $('#floating-wa').setAttribute('aria-label', copy.whatsapp);
  setText('footer', copy.footer);
  setText('year', new Date().getFullYear());
  setupPreview();
  try { localStorage.setItem('portfolio-language', language); } catch { /* Storage can be unavailable in private browsing. */ }
}

render();
startPreview();
$('.hero-art').addEventListener('mouseenter', stopPreview);
$('.hero-art').addEventListener('mouseleave', startPreview);
$('.hero-art').addEventListener('focusin', stopPreview);
$('.hero-art').addEventListener('focusout', startPreview);
document.addEventListener('visibilitychange', () => document.hidden ? stopPreview() : startPreview());
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', startPreview);

$('#lang').addEventListener('click', () => {
  language = language === 'en' ? 'ar' : 'en';
  render();
  startPreview();
});
const menu = $('#menu');
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  menu.setAttribute('aria-label', expanded ? content[language].closeMenu : content[language].openMenu);
  $('#nav').classList.toggle('is-open', expanded);
});
$('#nav').addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', content[language].openMenu);
  $('#nav').classList.remove('is-open');
});

$('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const copy = content[language];
  const name = String(data.get('name') || '').trim();
  const need = String(data.get('need') || '');
  const message = String(data.get('message') || '').trim();
  if (!name || !need || !message) { setText('form-error', copy.formRequired); return; }
  const details = language === 'ar'
    ? `الاسم: ${name}\n${copy.need}: ${need}\n${copy.budget}: ${data.get('budget') || '—'}\n${copy.message}: ${message}`
    : `Name: ${name}\n${copy.need}: ${need}\n${copy.budget}: ${data.get('budget') || '—'}\n${copy.message}: ${message}`;
  const target = `https://wa.me/201227925383?text=${encodeURIComponent(details)}`;
  const opened = window.open(target, '_blank', 'noopener');
  if (!opened) window.location.href = `mailto:marcomilad707@gmail.com?subject=${encodeURIComponent(need)}&body=${encodeURIComponent(details)}`;
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  let copied = false;
  try { await navigator.clipboard.writeText(button.dataset.copy); copied = true; }
  catch {
    const field = document.createElement('textarea');
    field.value = button.dataset.copy;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    field.remove();
  }
  if (!copied) return;
  button.textContent = content[language].copied;
  window.setTimeout(() => { if (button.isConnected) button.textContent = content[language].copy; }, 1500);
});

// No CV or portrait is present in the assets directory. Keep the CV link hidden
// and show the MM monogram until the real files are added to the project.
$('#cv').hidden = true;

const progress = $('#scroll-progress-fill');
let progressFrame = 0;
const updateScrollProgress = () => {
  progressFrame = 0;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
};
window.addEventListener('scroll', () => { if (!progressFrame) progressFrame = requestAnimationFrame(updateScrollProgress); }, { passive: true });
window.addEventListener('resize', updateScrollProgress, { passive: true });
updateScrollProgress();
