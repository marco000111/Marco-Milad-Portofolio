import { motion, useReducedMotion } from 'framer-motion';

export default function ManifestoScene({ language }) {
  const reducedMotion = useReducedMotion();
  const isArabic = language === 'ar';
  const phrase = isArabic ? 'كل فكرة تستحق أن ترى النور' : 'An idea deserves to become real';
  const loop = isArabic ? 'اصنع شيئًا له معنى' : 'MAKE SOMETHING THAT MATTERS';

  return (
    <section className="manifesto-scene" aria-label={isArabic ? 'رؤية ماركو' : 'Marco’s point of view'}>
      <motion.p
        className="manifesto-statement"
        initial={false}
        whileInView={{ y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {phrase}
      </motion.p>
      <div className={`manifesto-marquee${reducedMotion ? ' is-still' : ''}`} aria-hidden="true" dir="ltr">
        <div className="manifesto-marquee-track">
          {Array.from({ length: 4 }, (_, index) => <span key={index}>{loop}<i>✳</i></span>)}
        </div>
      </div>
    </section>
  );
}
