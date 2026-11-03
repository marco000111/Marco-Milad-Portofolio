import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Github, X } from 'lucide-react';

export default function ProjectModal({ project, ui, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!project) return undefined;
    const previousFocus = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('a[href], button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('modal-open');
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
      previousFocus?.focus?.();
    };
  }, [onClose, project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="modal-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.article
            ref={dialogRef}
            className="project-modal glass-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, y: 26, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label={ui.close}>
              <X size={19} />
            </button>
            <div className="modal-image">
              <img src={project.image} alt={project.imageAlt} width="1280" height="800" />
              <span className="modal-image-type">{project.type}</span>
            </div>
            <div className="modal-content">
              <p className="section-kicker"><span>PROJECT / {project.id.toUpperCase()}</span></p>
              <h2 id="project-modal-title">{project.title}</h2>
              <div className="modal-fact">
                <h3>{ui.projectBrief}</h3>
                <p>{project.brief}</p>
              </div>
              <div className="modal-fact">
                <h3>{ui.projectBuild}</h3>
                <p>{project.description}</p>
              </div>
              {project.stack.length > 0 && (
                <div className="modal-fact">
                  <h3>{ui.projectStack}</h3>
                  <ul className="tag-list">
                    {project.stack.map((item) => <li key={item}><Check size={12} />{item}</li>)}
                  </ul>
                </div>
              )}
              <div className="modal-actions">
                <a className="button button-primary" href={project.liveUrl} target={project.liveUrl.startsWith('/') ? undefined : '_blank'} rel={project.liveUrl.startsWith('/') ? undefined : 'noreferrer'}>
                  {ui.liveDemo}<ArrowUpRight size={16} />
                </a>
                {project.sourceUrl ? (
                  <a className="button button-secondary" href={project.sourceUrl} target="_blank" rel="noreferrer">
                    <Github size={16} />{ui.sourceCode}
                  </a>
                ) : (
                  <a className="button button-secondary" href="https://github.com/marco000111" target="_blank" rel="noreferrer">
                    <Github size={16} />{ui.githubProfile}
                  </a>
                )}
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
