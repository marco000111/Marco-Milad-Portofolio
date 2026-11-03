import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { resumeFacts } from '../data/portfolio.js';

const translations = {
  en: {
    kicker: 'Career & selected projects',
    title: <>A project-led path to <em>better digital experiences.</em></>,
    intro: 'A snapshot of my front-end development and graphic design practice, grounded in real project work.',
    timelineLabel: 'PROJECT-LED EXPERIENCE',
    selectedLabel: 'Selected focus',
    download: 'Download dark CV',
    downloadLoading: 'Preparing CV…',
    downloaded: 'CV downloaded',
    downloadError: 'Could not create the CV. Please try again.',
    pdfNote: 'DARK EDITION · 1 PAGE · PDF',
    explore: 'Explore selected projects',
    stages: [
      {
        label: 'INDEPENDENT CONCEPTS',
        title: 'Business website concepts',
        description: 'Saffron & Stone, Noura Dental and Common Goods. Each concept is designed around clear customer journeys, responsive layouts and practical business features.',
        highlights: resumeFacts.websites,
      },
      {
        label: 'LIVE APPLICATIONS',
        title: 'Product-focused web apps',
        description: 'Muslim Daily Routine, Daily Goal Tracker and Orbit Workspace are live web application projects shaped around focused everyday workflows.',
        highlights: resumeFacts.applications,
      },
      {
        label: 'CORE PRACTICE',
        title: 'Front-end development & graphic design',
        description: resumeFacts.summary,
        highlights: resumeFacts.skills.slice(0, 6),
      },
    ],
  },
  ar: {
    kicker: 'المسار المهني ومشروعات مختارة',
    title: <>مسار عملي نحو <em>تجارب رقمية أفضل.</em></>,
    intro: 'لمحة عن عملي في تطوير الواجهات الأمامية والتصميم الجرافيكي، من خلال مشروعات فعلية.',
    timelineLabel: 'خبرة عملية قائمة على المشروعات',
    selectedLabel: 'مجال مختار',
    download: 'تحميل السيرة الداكنة',
    downloadLoading: 'جارٍ إعداد السيرة…',
    downloaded: 'اكتمل تحميل السيرة',
    downloadError: 'تعذر إنشاء السيرة. يرجى المحاولة مرة أخرى.',
    pdfNote: 'نسخة داكنة · صفحة واحدة · PDF بالإنجليزية',
    explore: 'استكشف المشروعات',
    stages: [
      {
        label: 'مفاهيم مستقلة',
        title: 'مواقع إلكترونية للأعمال',
        description: 'سافرون آند ستون، نورا دنتال، وكومون جودز. يركز كل نموذج على رحلة واضحة للعميل، وتصميم متجاوب، وميزات عملية للأعمال.',
        highlights: resumeFacts.websites,
      },
      {
        label: 'تطبيقات منشورة',
        title: 'تطبيقات ويب عملية',
        description: 'مسلم ديلي روتين، ديلي جول تراكر، وأوربت وورك سبيس؛ تطبيقات ويب مباشرة تساعد على تنظيم مهام يومية مركزة.',
        highlights: resumeFacts.applications,
      },
      {
        label: 'مجالات العمل',
        title: 'تطوير الواجهات والتصميم الجرافيكي',
        description: 'مطور واجهات أمامية في مصر، أصمم مواقع وتطبيقات عملية ومتجاوبة باستخدام HTML وCSS وJavaScript وReact.',
        highlights: resumeFacts.skills.slice(0, 6),
      },
    ],
  },
};

export default function Resume({ language }) {
  const copy = translations[language] || translations.en;
  const [selected, setSelected] = useState(0);
  const [downloadState, setDownloadState] = useState('idle');
  const resetTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const downloadResume = async () => {
    if (downloadState === 'loading') return;
    setDownloadState('loading');
    try {
      const { createResumePdf } = await import('../lib/createResume.js');
      const file = await createResumePdf();
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Marco-Milad-Dark-CV.pdf';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setDownloadState('success');
    } catch (error) {
      console.error('[portfolio] CV generation failed.', error);
      setDownloadState('error');
    }

    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setDownloadState('idle'), 3000);
  };

  const downloadLabel = downloadState === 'loading'
    ? copy.downloadLoading
    : downloadState === 'success'
      ? copy.downloaded
      : downloadState === 'error'
        ? copy.downloadError
        : copy.download;

  return (
    <motion.section
      id="resume"
      layout="position"
      className="resume-section page-shell section-block gsap-reveal"
      aria-labelledby="resume-heading"
    >
      <div className="resume-heading-row">
        <div className="section-heading">
          <p className="section-kicker"><span>02</span> / {copy.kicker}</p>
          <h2 id="resume-heading">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        <div className="resume-download-wrap">
          <button
            type="button"
            className="button button-primary resume-download"
            onClick={downloadResume}
            disabled={downloadState === 'loading'}
          >
            {downloadState === 'success' ? <Check size={17} /> : <ArrowDownToLine size={17} />}
            {downloadLabel}
          </button>
          <span>{copy.pdfNote}</span>
        </div>
      </div>

      <div className="resume-layout glass-panel">
        <div className="resume-timeline">
          <div className="resume-panel-topline">
            <span><Sparkles size={14} aria-hidden="true" />{copy.timelineLabel}</span>
            <span className="resume-location" dir="ltr">EGYPT · MM</span>
          </div>
          <ol className="resume-stages">
            {copy.stages.map((stage, index) => (
              <motion.li
                key={stage.label}
                initial={{ opacity: 0, x: language === 'ar' ? 12 : -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <button
                  type="button"
                  className={selected === index ? 'resume-stage is-selected' : 'resume-stage'}
                  aria-expanded={selected === index}
                  aria-controls="resume-detail"
                  onClick={() => setSelected(index)}
                >
                  <span className="resume-stage-node" aria-hidden="true" />
                  <span className="resume-stage-copy">
                    <span className="resume-stage-label">{stage.label}</span>
                    <strong>{stage.title}</strong>
                  </span>
                  <span className="resume-stage-number">0{index + 1}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="resume-detail-wrap">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              id="resume-detail"
              key={`${language}-${selected}`}
              className="resume-detail"
              aria-live="polite"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <span className="resume-detail-index" dir="ltr">0{selected + 1} / 03</span>
              <p className="resume-detail-label">{copy.selectedLabel}</p>
              <h3>{copy.stages[selected].title}</h3>
              <p className="resume-detail-description">{copy.stages[selected].description}</p>
              <ul className="resume-highlight-list">
                {copy.stages[selected].highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
              <a className="resume-project-link" href="#projects">
                {copy.explore}<ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
