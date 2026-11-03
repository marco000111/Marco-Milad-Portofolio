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
  let introIsRunning = false;

  try {
    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reducedMotion.matches) {
      let canPlayIntro = false;
      try {
        canPlayIntro = sessionStorage.getItem('portfolio-intro-seen') === null;
        if (canPlayIntro) sessionStorage.setItem('portfolio-intro-seen', '1');
      } catch {
        canPlayIntro = false;
      }

      if (canPlayIntro) {
        const intro = document.createElement('div');
        intro.className = 'motion-intro';
        intro.setAttribute('role', 'group');
        intro.setAttribute('aria-label', document.documentElement.dir === 'rtl' ? 'مقدمة ماركو ميلاد' : 'Marco Milad introduction');
        intro.innerHTML = `
          <div class="motion-intro-content">
            <p class="motion-intro-kicker">INDEPENDENT CREATIVE DEVELOPER</p>
            <div class="motion-intro-name" aria-label="MARCO MILAD">
              <span class="motion-intro-mask"><span class="motion-intro-word">MARCO</span></span>
              <span class="motion-intro-mask"><span class="motion-intro-word motion-intro-word-accent">MILAD</span></span>
            </div>
            <p class="motion-intro-role">FRONT-END DEVELOPER</p>
          </div>
          <span class="motion-intro-sweep" aria-hidden="true"></span>`;
        const skip = document.createElement('button');
        skip.className = 'button secondary motion-intro-skip';
        skip.type = 'button';
        skip.textContent = document.documentElement.dir === 'rtl' ? 'تخطي المقدمة' : 'Skip intro';
        intro.append(skip);
        document.body.append(intro);
        introIsRunning = true;

        let finished = false;
        let introTimeline;
        let watchdog;
        const onKeydown = event => {
          if (event.key === 'Escape') finish();
        };
        const finish = () => {
          if (finished) return;
          finished = true;
          introIsRunning = false;
          window.clearTimeout(watchdog);
          introTimeline?.kill();
          document.removeEventListener('keydown', onKeydown);
          if (typeof reducedMotion.removeEventListener === 'function') {
            reducedMotion.removeEventListener('change', onReducedMotionChange);
          }
          intro.remove();
        };
        const onReducedMotionChange = event => {
          if (event.matches) finish();
        };
        finishIntro = finish;
        skip.addEventListener('click', finish, { once: true });
        document.addEventListener('keydown', onKeydown);
        if (typeof reducedMotion.addEventListener === 'function') {
          reducedMotion.addEventListener('change', onReducedMotionChange);
        }
        watchdog = window.setTimeout(finish, 1750);

        try {
          const words = [...intro.querySelectorAll('.motion-intro-word')];
          const kicker = intro.querySelector('.motion-intro-kicker');
          const role = intro.querySelector('.motion-intro-role');
          const sweep = intro.querySelector('.motion-intro-sweep');
          introTimeline = gsap.timeline({ onComplete: finish });
          introTimeline
            .fromTo(words, { yPercent: 112, opacity: 0.35 }, {
              yPercent: 0, opacity: 1, duration: 0.62, stagger: 0.12, ease: 'power3.out',
            }, 0.08)
            .fromTo(kicker, { y: 8, opacity: 0 }, {
              y: 0, opacity: 1, duration: 0.42, ease: 'power2.out',
            }, 0.16)
            .fromTo(sweep, { scaleX: 0 }, {
              scaleX: 1, duration: 0.68, ease: 'power2.inOut',
            }, 0.3)
            .fromTo(role, { y: 9, opacity: 0 }, {
              y: 0, opacity: 1, duration: 0.42, ease: 'power2.out',
            }, 0.72)
            .to(intro, {
              yPercent: -100, duration: 0.5, ease: 'power3.inOut',
            }, 1.02);
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
          const duration = compact ? 0.58 : 0.78;
          const distance = compact ? 10 : 17;
          const hero = document.querySelector('.hero');
          const heroArt = document.querySelector('.hero-art');
          const heroGrid = document.querySelector('.hero-grid');
          let ambientObserver;
          let ambientTween;
          let artFloat;
          let heroInView = true;

          const syncAmbientMotion = () => {
            const shouldPlay = !document.hidden && heroInView;
            if (shouldPlay) {
              ambientTween?.play();
              if (!compact && heroTimeline?.progress() === 1) artFloat?.play();
            } else {
              ambientTween?.pause();
              artFloat?.pause();
            }
          };
          let heroTimeline;

          const context = gsap.context(() => {
            const identityWords = [...document.querySelectorAll('.hero-name-word')];
            const identityRole = document.querySelector('.hero-identity-role');
            const availability = document.querySelector('.availability');
            const headline = document.querySelector('.hero h1');
            const lead = document.querySelector('.hero .lead');
            const actions = document.querySelector('.hero .actions');
            const trust = document.querySelector('.hero .trust');
            heroTimeline = gsap.timeline({ delay: introIsRunning ? 0.86 : 0.04 });
            if (identityWords.length) {
              heroTimeline.fromTo(identityWords, { yPercent: 108, opacity: 0.5 }, {
                yPercent: 0, opacity: 1, duration: duration, stagger: 0.13, ease: 'power3.out',
              }, 0);
            }
            if (identityRole) {
              heroTimeline.fromTo(identityRole, { y: 10, opacity: 0 }, {
                y: 0, opacity: 1, duration: duration * 0.8, ease: 'power2.out',
              }, 0.24);
            }
            if (availability) {
              heroTimeline.fromTo(availability, { y: distance, opacity: 0 }, {
                y: 0, opacity: 1, duration: duration, ease: 'power3.out',
              }, 0.34);
            }
            if (headline) {
              heroTimeline.fromTo(headline, { y: distance * 1.1, opacity: 0 }, {
                y: 0, opacity: 1, duration: duration + 0.08, ease: 'power3.out',
              }, 0.43);
            }
            if (lead) {
              heroTimeline.fromTo(lead, { y: distance * 0.75, opacity: 0 }, {
                y: 0, opacity: 1, duration: duration, ease: 'power2.out',
              }, 0.58);
            }
            if (actions) {
              heroTimeline.fromTo(actions, { y: 9, opacity: 0 }, {
                y: 0, opacity: 1, duration: duration * 0.78, ease: 'power2.out',
              }, 0.68);
            }
            if (trust) {
              heroTimeline.fromTo(trust, { y: 8, opacity: 0 }, {
                y: 0, opacity: 1, duration: duration * 0.78, ease: 'power2.out',
              }, 0.78);
            }
            if (heroArt) {
              heroTimeline.fromTo(heroArt, { y: compact ? 9 : 16, scale: 0.99 }, {
                y: 0, scale: 1, duration: duration + 0.16, ease: 'power3.out',
              }, 0.3);
              if (!compact) {
                artFloat = gsap.to(heroArt, {
                  y: -4, duration: 5.5, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
                });
                heroTimeline.eventCallback('onComplete', syncAmbientMotion);
              }
            }
            if (heroGrid && !compact) {
              ambientTween = gsap.to(heroGrid, {
                x: 7, y: 4, duration: 11, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
              });
            }

            const navLinks = [...document.querySelectorAll('#nav a')];
            const navSections = navLinks
              .map(link => document.querySelector(link.getAttribute('href')))
              .filter(Boolean);
            let navObserver;
            if (navSections.length && 'IntersectionObserver' in window) {
              navLinks.forEach(link => {
                link.classList.remove('is-active');
                link.removeAttribute('aria-current');
              });
              navObserver = new IntersectionObserver(entries => {
                const visible = entries.filter(entry => entry.isIntersecting);
                if (!visible.length) return;
                const activeId = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0].target.id;
                navLinks.forEach(link => {
                  const active = link.hash === `#${activeId}`;
                  link.classList.toggle('is-active', active);
                  if (active) link.setAttribute('aria-current', 'location');
                  else link.removeAttribute('aria-current');
                });
              }, { rootMargin: '-24% 0px -64% 0px', threshold: [0, 0.15, 0.4, 0.7] });
              navSections.forEach(section => navObserver.observe(section));
            }

            const reveal = (targets, trigger, stagger = 0) => {
              if (!targets.length || !trigger) return;
              gsap.fromTo(targets, { y: distance, opacity: 0.72 }, {
                y: 0, opacity: 1, duration: duration + 0.1, stagger,
                ease: 'power2.out', immediateRender: false, clearProps: 'transform,opacity',
                scrollTrigger: { trigger, start: 'top 86%', once: true },
              });
            };

            document.querySelectorAll('main > .section').forEach(section => {
              reveal([...section.querySelectorAll('.section-head')].slice(0, 1), section);
              const elements = [...section.querySelectorAll('.service-card, .concept-card, .app-card, .about-card, .skills, .contact-card, .contact-form')];
              reveal(elements, section, compact ? 0.035 : 0.065);
            });
            const footer = document.querySelector('.footer');
            if (footer) reveal([footer], footer);

            const onVisibilityChange = () => syncAmbientMotion();
            document.addEventListener('visibilitychange', onVisibilityChange);
            if (hero && 'IntersectionObserver' in window) {
              ambientObserver = new IntersectionObserver(entries => {
                heroInView = entries.some(entry => entry.isIntersecting);
                syncAmbientMotion();
              }, { threshold: 0.08 });
              ambientObserver.observe(hero);
            }

            return () => {
              document.removeEventListener('visibilitychange', onVisibilityChange);
              ambientObserver?.disconnect();
              navObserver?.disconnect();
              navLinks.forEach(link => {
                link.classList.remove('is-active');
                link.removeAttribute('aria-current');
              });
              artFloat?.kill();
              ambientTween?.kill();
            };
          }, document.body);

          return () => context.revert();
        });
      } catch (error) {
        media?.revert();
        document.querySelectorAll('.hero-identity-word, .hero-name-word, .hero-identity-role, .availability, .hero h1, .hero .lead, .hero .actions, .hero .trust, .hero-art')
          .forEach(element => {
            element.style.removeProperty('opacity');
            element.style.removeProperty('transform');
          });
        console.error('[portfolio-motion] Animation setup failed; continuing without motion.', error);
      }
    };
    setupAnimations();

    languageObserver = new MutationObserver(() => {
      const isArabic = document.documentElement.dir === 'rtl';
      const intro = document.querySelector('.motion-intro');
      if (intro) {
        intro.setAttribute('aria-label', isArabic ? 'مقدمة ماركو ميلاد' : 'Marco Milad introduction');
        const skip = intro.querySelector('.motion-intro-skip');
        if (skip) skip.textContent = isArabic ? 'تخطي المقدمة' : 'Skip intro';
      }
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
