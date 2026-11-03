import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';

const statValues = [
  { number: 3, suffix: '', index: 0 },
  { number: 3, suffix: '', index: 1 },
  { number: 2, suffix: '', index: 2 },
];

function StatCounter({ number, index, label, active }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const start = performance.now();
    const duration = 900;
    let frame = 0;
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * number));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [active, number]);

  return (
    <div className="stat-item">
      <span className="stat-number" aria-label={String(number)}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="stat-label">{label}</span>
      <span className="stat-index">0{index + 1}</span>
    </div>
  );
}

export default function About({ content, ui, language }) {
  const statsRef = useRef(null);
  const statsVisible = useInView(statsRef, { once: true, amount: 0.35 });

  return (
    <motion.section id="about" layout="position" className="about-section page-shell section-block gsap-reveal">
      <div className="section-heading">
        <p className="section-kicker"><span>01</span> / {ui.aboutKicker}</p>
        <h2>{content.aboutTitle}</h2>
        <p>{content.about}</p>
        <div className="about-extra">
          <span className="about-mark"><Sparkles size={16} /></span>
          <span>{content.trust[2]}</span>
          <a href="#contact" className="text-link">
            {ui.contactMe}<ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="about-side">
        <motion.div
          ref={statsRef}
          className="stats-panel glass-panel"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="stats-topline">
            <span>AT A GLANCE</span>
            <span className="stats-live"><i /> {language === 'ar' ? 'موثق' : 'VERIFIED'}</span>
          </div>
          <div className="stats-grid">
            {statValues.map((stat) => (
              <StatCounter
                key={stat.index}
                number={stat.number}
                index={stat.index}
                label={ui.stats[stat.index]}
                active={statsVisible}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
