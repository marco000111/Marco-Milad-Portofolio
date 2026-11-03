import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollDirector() {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.gsap-reveal').forEach((section) => {
          const targets = section.querySelectorAll('.section-heading, .projects-header, .skill-card, .project-card, .social-card, .contact-form-wrap');
          if (!targets.length) return;
          gsap.fromTo(
            targets,
            { y: 18, opacity: 0.72 },
            {
              y: 0,
              opacity: 1,
              duration: 0.72,
              stagger: 0.055,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: 'top 83%',
                once: true,
              },
            },
          );
        });
      });
      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return null;
}
