import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, Github, Layers3 } from 'lucide-react';
import usePointerTilt from '../hooks/usePointerTilt.js';
import ProjectModal from './ProjectModal.jsx';

const filters = ['All', 'Website', 'Web app'];

function ProjectArtwork({ project, ui, index, onOpen }) {
  const { onPointerMove, onPointerLeave } = usePointerTilt();
  return (
    <button
      type="button"
      className="project-art"
      onClick={onOpen}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-label={`${ui.viewDetails}: ${project.title}`}
    >
      <img
        src={project.image}
        alt={project.imageAlt}
        width="1280"
        height="800"
        loading={index > 1 ? 'lazy' : 'eager'}
        decoding="async"
      />
      <span className="project-art-shade" />
      <span className="project-art-meta"><Layers3 size={14} />{project.type}</span>
      <span className="project-image-action"><ArrowUpRight size={18} /></span>
    </button>
  );
}

export default function Projects({ projects, ui, language }) {
  const [filter, setFilter] = useState(filters[0]);
  const [selectedProject, setSelectedProject] = useState(null);
  const railRef = useRef(null);
  const closeModal = useCallback(() => setSelectedProject(null), []);
  const visibleProjects = useMemo(
    () => filter === 'All' ? projects : projects.filter((project) => project.category === filter),
    [filter, projects],
  );

  const chooseFilter = (index) => setFilter(filters[index] || 'All');
  const moveRail = (direction) => railRef.current?.scrollBy({
    left: direction * railRef.current.clientWidth * (language === 'ar' ? -0.78 : 0.78),
    behavior: 'smooth',
  });

  return (
    <motion.section id="projects" layout="position" className="projects-section page-shell section-block gsap-reveal">
      <div className="projects-header">
        <div className="section-heading">
          <p className="section-kicker"><span>04</span> / {ui.projectsKicker}</p>
          <h2>
            {language === 'ar' ? 'مختارة بعناية، <em>مبنية لغرض</em>' : <>Selected with purpose, <em>built to work</em></>}
          </h2>
          <p>{ui.projectsIntro}</p>
        </div>
        <div className="filter-rail project-filter" role="group" aria-label={ui.projectsKicker}>
          {ui.projectFilters.map((label, index) => (
            <button
              type="button"
              aria-pressed={filter === filters[index]}
              key={label}
              className={filter === filters[index] ? 'filter-chip is-selected' : 'filter-chip'}
              onClick={() => chooseFilter(index)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="project-rail-controls" dir="ltr">
        <button type="button" onClick={() => moveRail(-1)} aria-label={language === 'ar' ? 'المشاريع السابقة' : 'Previous projects'}><ArrowLeft size={17} /></button>
        <button type="button" onClick={() => moveRail(1)} aria-label={language === 'ar' ? 'المشاريع التالية' : 'Next projects'}><ArrowRight size={17} /></button>
      </div>
      {visibleProjects.length > 0 ? (
        <motion.div ref={railRef} className="projects-grid" layout tabIndex={0} aria-label={ui.projectsKicker}>
          {visibleProjects.map((project, index) => (
            <motion.article
              className={`project-card glass-panel project-card-${index % 3}`}
              layout
              key={project.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: (index % 3) * 0.07 }}
            >
              <ProjectArtwork project={project} ui={ui} index={index} onOpen={() => setSelectedProject(project)} />
              <div className="project-card-content">
                <div className="project-title-line">
                  <div>
                    <span className="project-category">{project.category === 'Website' ? ui.projectConcept : ui.webApplication}</span>
                    <h3>{project.title}</h3>
                  </div>
                  <span className="project-index">0{projects.indexOf(project) + 1}</span>
                </div>
                <p>{project.brief}</p>
                <ul className="project-tags" aria-label={ui.projectStack}>
                  {(project.stack.length ? project.stack.slice(0, 3) : [project.category]).map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="project-actions">
                  <a
                    className="project-action-live"
                    href={project.liveUrl}
                    target={project.liveUrl.startsWith('/') ? undefined : '_blank'}
                    rel={project.liveUrl.startsWith('/') ? undefined : 'noreferrer'}
                  >
                    {ui.liveDemo}<ExternalLink size={14} />
                  </a>
                  <button type="button" className="project-action-detail" onClick={() => setSelectedProject(project)}>
                    {ui.viewDetails}<ArrowUpRight size={15} />
                  </button>
                  {project.sourceUrl && (
                    <a className="project-action-github" href={project.sourceUrl} target="_blank" rel="noreferrer" aria-label={ui.sourceCode}>
                      <Github size={17} />
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      ) : (
        <p className="empty-projects">{ui.noProjects}</p>
      )}
      <ProjectModal project={selectedProject} ui={ui} onClose={closeModal} />
    </motion.section>
  );
}
