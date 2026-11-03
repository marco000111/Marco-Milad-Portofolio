import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollDirector() {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.gsap-reveal').forEach((scene) => {
          const heading = scene.querySelector('.section-heading h2, .contact-heading h2');
          const kicker = scene.querySelector('.section-kicker');
          const intro = scene.querySelector('.section-heading > p:last-child, .contact-heading > p');
          const targets = [kicker, heading, intro].filter(Boolean);

          if (targets.length) {
            gsap.fromTo(targets,
              { y: 22, opacity: 0, clipPath: 'inset(0 0 18% 0)' },
              {
                y: 0,
                opacity: 1,
                clipPath: 'inset(0 0 0% 0)',
                duration: 0.82,
                stagger: 0.09,
                ease: 'power3.out',
                immediateRender: false,
                scrollTrigger: {
                  trigger: scene,
                  start: 'top 81%',
                  toggleActions: 'play none none reverse',
                },
              });
          }

          if (scene.matches('.about-section, .contact-section')) {
            gsap.fromTo(scene, { '--scene-glow': 0 }, {
              '--scene-glow': 1,
              ease: 'none',
              scrollTrigger: {
                trigger: scene,
                start: 'top bottom',
                end: 'center center',
                scrub: 0.7,
              },
            });
          }

          if (scene.matches('.contact-section')) {
            const links = scene.querySelectorAll('.social-card');
            const form = scene.querySelector('.contact-form-wrap');
            gsap.fromTo(links, { opacity: 0.62 }, {
              opacity: 1,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power2.out',
              immediateRender: false,
              scrollTrigger: { trigger: scene, start: 'top 68%', once: true },
            });
            if (form) {
              gsap.fromTo(form, { y: 20, opacity: 0.72 }, {
                y: 0,
                opacity: 1,
                duration: 0.78,
                ease: 'power2.out',
                immediateRender: false,
                scrollTrigger: { trigger: scene, start: 'top 68%', once: true },
              });
            }
          }
        });

        const portraitEcho = document.querySelector('.hero-portrait-echo');
        if (portraitEcho) {
          gsap.fromTo(portraitEcho, { y: 0, opacity: 0.12 }, {
            y: -24,
            opacity: 0.22,
            ease: 'none',
            scrollTrigger: {
              trigger: '#home',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          });
        }
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('portfolio:languagechange', refresh);
      return () => {
        window.removeEventListener('portfolio:languagechange', refresh);
        context.revert();
      };
    });

    return () => media.revert();
  }, []);

  return null;
}
