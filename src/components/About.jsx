import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowDownToLine, ArrowUpRight, Sparkles } from 'lucide-react';
import { resumeFacts } from '../data/portfolio.js';

const statValues = [
  { number: 3, suffix: '', index: 0 },
  { number: 3, suffix: '', index: 1 },
  { number: 2, suffix: '', index: 2 },
];

const resumeCopy = {
  en: {
    eyebrow: 'PROJECT TIMELINE',
    title: 'A practical path from concept to launch.',
    intro: 'Selected work and the tools behind it, grounded in the projects shown here.',
    stages: [
      {
        title: 'Business website concepts',
        detail: 'Three original website concepts for hospitality, dental care, and retail.',
      },
      {
        title: 'Live web applications',
        detail: 'Three deployed applications presented with their real interfaces and project details.',
      },
      {
        title: 'Frontend toolkit',
        detail: 'A practical mix of interface development, styling, collaboration, and deployment tools.',
      },
    ],
    explore: 'Explore selected projects',
  },
  ar: {
    eyebrow: 'مسار المشروعات',
    title: 'من الفكرة إلى تجربة جاهزة للاستخدام.',
    intro: 'نماذج من الأعمال والأدوات المستخدمة فيها، وفق المشروعات المعروضة هنا.',
    stages: [
      {
        title: 'نماذج مواقع الأعمال',
        detail: 'ثلاثة نماذج مواقع أصلية للمطاعم وطب الأسنان وتجارة التجزئة.',
      },
      {
        title: 'تطبيقات ويب مباشرة',
        detail: 'ثلاثة تطبيقات منشورة مع واجهاتها الحقيقية وتفاصيل المشروعات.',
      },
      {
        title: 'أدوات الواجهة الأمامية',
        detail: 'مزيج عملي من تطوير الواجهات والتنسيق والتعاون والنشر.',
      },
    ],
    explore: 'استكشف المشروعات المختارة',
  },
};

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

export default function About({ content, ui, language, projects }) {
  const statsRef = useRef(null);
  const statsVisible = useInView(statsRef, { once: true, amount: 0.35 });
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [resumeState, setResumeState] = useState('idle');
  const localizedResume = resumeCopy[language] || resumeCopy.en;
  const milestoneItems = [
    projects.filter((project) => project.category === 'Website').map((project) => project.title),
    projects.filter((project) => project.category === 'Web app').map((project) => project.title),
    resumeFacts.skills.slice(0, 6),
  ];

  const downloadResume = async () => {
    if (resumeState === 'loading') return;
    setResumeState('loading');
    try {
      const { createResumePdf } = await import('../lib/createResume.js');
      const file = await createResumePdf();
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Marco-Milad-CV.pdf';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setResumeState('success');
      window.setTimeout(() => setResumeState('idle'), 2600);
    } catch (error) {
      console.error('[portfolio] CV generation failed.', error);
      setResumeState('error');
    }
  };

  const statusText = resumeState === 'loading'
    ? ui.resumeLoading
    : resumeState === 'success'
      ? language === 'ar' ? 'اكتمل التحميل' : 'CV downloaded'
      : resumeState === 'error'
        ? ui.resumeError
        : ui.resume;

  return (
    <section id="about" className="about-section page-shell section-block gsap-reveal">
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
        <motion.section
          id="resume"
          className="resume-panel glass-panel"
          aria-labelledby="resume-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.65, delay: 0.08 }}
        >
          <div className="resume-heading">
            <p className="resume-eyebrow"><span />{localizedResume.eyebrow}</p>
            <h3 id="resume-heading">{localizedResume.title}</h3>
            <p>{localizedResume.intro}</p>
          </div>
          <ol className="resume-timeline" aria-label={localizedResume.eyebrow}>
            {localizedResume.stages.map((stage, index) => (
              <li className={activeMilestone === index ? 'is-active' : ''} key={stage.title}>
                <button
                  type="button"
                  aria-pressed={activeMilestone === index}
                  aria-controls="resume-milestone"
                  onClick={() => setActiveMilestone(index)}
                >
                  <span className="resume-node" aria-hidden="true">
                    {activeMilestone === index
                      ? <motion.i layoutId="resume-active-node" />
                      : <i />}
                  </span>
                  <span className="resume-stage-number">0{index + 1}</span>
                  <span className="resume-stage-title">{stage.title}</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
          <motion.div
            id="resume-milestone"
            className="resume-milestone"
            key={activeMilestone}
            role="region"
            aria-live="polite"
            aria-label={localizedResume.stages[activeMilestone].title}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
          >
            <p>{localizedResume.stages[activeMilestone].detail}</p>
            <ul className="resume-tags">
              {milestoneItems[activeMilestone].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </motion.div>
          <a className="resume-project-link" href="#projects">
            {localizedResume.explore}<ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="button button-primary resume-button"
            onClick={downloadResume}
            disabled={resumeState === 'loading'}
          >
            <ArrowDownToLine size={17} aria-hidden="true" />
            {statusText}
          </button>
        </motion.section>
      </div>
    </section>
  );
}
