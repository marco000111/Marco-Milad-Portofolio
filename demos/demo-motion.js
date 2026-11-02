(() => {
  'use strict';

  if (window.__demoMotionLoaded) return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger || !document.body) return;

  window.__demoMotionLoaded = true;
  const demo = document.body.dataset.demo;
  let media;
  let observer;
  let refreshFrame = 0;

  const setupAnimations = () => {
    try {
      media?.revert();
      media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const compact = window.matchMedia('(max-width: 700px)').matches;
        const rtl = document.documentElement.dir === 'rtl';
        const inlineOffset = rtl ? 14 : -14;
        const context = gsap.context(() => {
          const reveal = (targets, trigger, config = {}) => {
            if (!targets.length || !trigger) return;
            gsap.fromTo(targets, config.from || { y: 18, opacity: 0.76 }, {
              ...(config.to || {}), y: 0, opacity: 1,
              duration: config.duration || 0.8,
              stagger: config.stagger || 0,
              ease: config.ease || 'power2.out',
              immediateRender: false,
              clearProps: 'transform,opacity',
              scrollTrigger: { trigger, start: 'top 86%', once: true },
            });
          };

          if (demo === 'restaurant') {
            const heroCopy = [...document.querySelectorAll('.r-hero-content > *')];
            if (heroCopy.length) gsap.fromTo(heroCopy, { x: inlineOffset, opacity: 0.76 }, { x: 0, opacity: 1, duration: compact ? 0.72 : 1.02, stagger: 0.105, ease: 'power2.out', clearProps: 'transform,opacity' });
            document.querySelectorAll('.r-section').forEach(section => {
              reveal([...section.querySelectorAll('.section-intro, .visit-heading')].slice(0, 1), section, { duration: 0.9 });
              reveal([...section.querySelectorAll('.reservation-card')], section, { duration: 0.9 });
            });
            const story = document.querySelector('.r-story');
            if (story) {
              reveal([...story.querySelectorAll('.story-photo-wrap')], story, { from: { x: inlineOffset * -1, opacity: 0.8 }, to: { x: 0 }, duration: 1.05 });
              reveal([...story.querySelectorAll('.story-copy')], story, { from: { x: inlineOffset, opacity: 0.8 }, to: { x: 0 }, duration: 1.05 });
            }
          } else if (demo === 'clinic') {
            const heroCopy = [...document.querySelectorAll('.c-hero-copy > *')];
            if (heroCopy.length) gsap.fromTo(heroCopy, { y: compact ? 12 : 16, opacity: 0.78 }, { y: 0, opacity: 1, duration: 0.76, stagger: 0.075, ease: 'power2.out', clearProps: 'transform,opacity' });
            document.querySelectorAll('.c-care-section, .c-team-section, .c-faq-section').forEach(section => {
              reveal([...section.querySelectorAll('.section-heading')].slice(0, 1), section, { duration: 0.72 });
              reveal([...section.querySelectorAll('.care-card, .team-card, .faq-list details')], section, { duration: 0.72, stagger: compact ? 0.04 : 0.08 });
            });
            const approach = document.querySelector('.c-approach');
            if (approach) {
              reveal([...approach.querySelectorAll('.approach-image')], approach, { from: { x: -inlineOffset, opacity: 0.82 }, to: { x: 0 }, duration: 0.82 });
              reveal([...approach.querySelectorAll('.approach-copy')], approach, { from: { x: inlineOffset, opacity: 0.82 }, to: { x: 0 }, duration: 0.82 });
            }
            const booking = document.querySelector('.c-booking');
            if (booking) {
              reveal([...booking.querySelectorAll('.booking-copy')], booking, { from: { y: 14, opacity: 0.78 }, duration: 0.76 });
              reveal([...booking.querySelectorAll('.booking-form')], booking, { from: { y: 18, opacity: 0.84 }, duration: 0.8 });
            }
          } else if (demo === 'store') {
            const heroCopy = [...document.querySelectorAll('.s-hero-copy > *')];
            if (heroCopy.length) gsap.fromTo(heroCopy, { y: 13, opacity: 0.78 }, { y: 0, opacity: 1, duration: 0.68, stagger: 0.065, ease: 'power3.out', clearProps: 'transform,opacity' });
            const shop = document.querySelector('.s-shop-section');
            if (shop) {
              reveal([...shop.querySelectorAll('.shop-heading, .shop-toolbar')], shop, { duration: 0.65, stagger: 0.045 });
            }
            const story = document.querySelector('.s-story');
            if (story) {
              reveal([...story.querySelectorAll('.story-image')], story, { from: { y: 14, opacity: 0.84 }, duration: 0.72 });
              reveal([...story.querySelectorAll('.s-story-copy')], story, { from: { y: 14, opacity: 0.78 }, duration: 0.72 });
            }
            const newsletter = document.querySelector('.newsletter-section');
            if (newsletter) reveal([...newsletter.children], newsletter, { from: { y: 12, opacity: 0.82 }, duration: 0.68, stagger: 0.08 });
          }
        }, document.body);

        return () => context.revert();
      });
    } catch (error) {
      media?.revert();
      console.error(`[${demo}-motion] Animation setup failed; continuing without motion.`, error);
    }
  };

  const init = () => {
    try {
      gsap.registerPlugin(ScrollTrigger);
      setupAnimations();
      observer = new MutationObserver(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(setupAnimations);
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
      window.addEventListener('pagehide', () => {
        media?.revert();
        observer?.disconnect();
        cancelAnimationFrame(refreshFrame);
      }, { once: true });
    } catch (error) {
      media?.revert();
      console.error(`[${demo}-motion] Motion initialization failed; continuing without motion.`, error);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
