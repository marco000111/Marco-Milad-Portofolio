(() => {
  'use strict';

  if (window.__portfolioMotionLoaded) return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger || !document.body) return;

  window.__portfolioMotionLoaded = true;
  let media;
  let languageObserver;
  let refreshFrame = 0;
  let finishIntro = () => {};

  try {
    gsap.registerPlugin(ScrollTrigger);

    const hasMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasMotionPreference) {
      let canUseSessionStorage = false;
      try {
        canUseSessionStorage = sessionStorage.getItem('portfolio-intro-seen') === null;
        if (canUseSessionStorage) sessionStorage.setItem('portfolio-intro-seen', '1');
      } catch {
        canUseSessionStorage = false;
      }
      if (canUseSessionStorage) {
        const intro = document.createElement('div');
        intro.className = 'motion-intro';
        intro.setAttribute('role', 'group');
        intro.setAttribute('aria-label', document.documentElement.dir === 'rtl' ? 'مقدمة الموقع' : 'Site introduction');
        const mark = document.createElement('span');
        mark.className = 'logo-mark motion-intro-mark';
        mark.textContent = 'MM';
        mark.setAttribute('aria-hidden', 'true');
        const skip = document.createElement('button');
        skip.className = 'button secondary motion-intro-skip';
        skip.type = 'button';
        skip.textContent = document.documentElement.dir === 'rtl' ? 'تخطي المقدمة' : 'Skip intro';
        intro.append(mark, skip);
        document.body.append(intro);

        let finished = false;
        let introAnimation;
        let watchdog;
        const finish = () => {
          if (finished) return;
          finished = true;
          window.clearTimeout(watchdog);
          introAnimation?.kill();
          document.removeEventListener('keydown', onKeydown);
          intro.remove();
        };
        finishIntro = finish;
        const onKeydown = (event) => { if (event.key === 'Escape') finish(); };
        skip.addEventListener('click', (event) => {
          if (event.target.closest('a,input,select,textarea,[contenteditable="true"]') && !event.target.closest('.motion-intro-skip')) return;
          finish();
        }, { once: true });
        document.addEventListener('keydown', onKeydown);
        watchdog = window.setTimeout(finish, 1500);
        try {
          introAnimation = gsap.timeline({ onComplete: finish });
          introAnimation.fromTo(mark, { scale: 0.92, opacity: 0.78 }, { scale: 1, opacity: 1, duration: 0.42, ease: 'power2.out' })
            .to(mark, { opacity: 0, duration: 0.18, ease: 'power1.out' }, '+=0.08');
        } catch (error) {
          finish();
          console.error('[portfolio-motion] Intro animation failed; continuing without it.', error);
        }
        window.addEventListener('pagehide', finish, { once: true });
      }
    }

    const setupAnimations = () => {
      try {
        media?.revert();
        media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
          const compact = window.matchMedia('(max-width: 700px)').matches;
          const duration = compact ? 0.58 : 0.82;
          const distance = compact ? 11 : 18;

          const context = gsap.context(() => {
            const heroText = [...document.querySelectorAll('.hero-text > .availability, .hero-text > .overline, .hero-text > h1, .hero-text > .lead, .hero-text > .actions, .hero-text > .trust')];
            if (heroText.length) {
              gsap.fromTo(heroText, { y: distance, opacity: 0.72 }, {
                y: 0, opacity: 1, duration, stagger: 0.095, ease: 'power3.out',
                clearProps: 'transform,opacity',
              });
            }

            const reveal = (targets, trigger, stagger = 0) => {
              if (!targets.length || !trigger) return;
              gsap.fromTo(targets, { y: distance, opacity: 0.72 }, {
                y: 0, opacity: 1, duration: duration + 0.08, stagger,
                ease: 'power2.out', immediateRender: false, clearProps: 'transform,opacity',
                scrollTrigger: { trigger, start: 'top 86%', once: true },
              });
            };

            document.querySelectorAll('main > .section').forEach((section) => {
              reveal([...section.querySelectorAll('.section-head')].slice(0, 1), section);
              const cards = [...section.querySelectorAll('.service-card, .concept-card, .app-card, .about-card, .skills, .contact-card, .contact-form')];
              reveal(cards, section, compact ? 0.035 : 0.075);
            });
            const footer = document.querySelector('.footer');
            if (footer) reveal([footer], footer);
          }, document.body);

          return () => context.revert();
        });
      } catch (error) {
        media?.revert();
        console.error('[portfolio-motion] Animation setup failed; continuing without motion.', error);
      }
    };
    setupAnimations();

    languageObserver = new MutationObserver(() => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(setupAnimations);
    });
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });

    window.addEventListener('pagehide', () => {
      media?.revert();
      languageObserver?.disconnect();
      cancelAnimationFrame(refreshFrame);
    }, { once: true });
  } catch (error) {
    finishIntro();
    media?.revert();
    languageObserver?.disconnect();
    console.error('[portfolio-motion] Motion initialization failed; continuing without motion.', error);
  }
})();
