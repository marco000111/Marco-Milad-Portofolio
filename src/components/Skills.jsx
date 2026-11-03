import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Boxes, Braces, Code2, Terminal } from 'lucide-react';

const categoryIcons = [Boxes, Braces, Code2, Terminal];
const categoryKeys = ['All', 'Frontend', 'Styling', 'Tools'];

export default function Skills({ skills, categories, ui, language }) {
  const [selected, setSelected] = useState(categoryKeys[0]);
  const filtered = useMemo(
    () => selected === 'All' ? skills : skills.filter((skill) => skill.category === selected),
    [selected, skills],
  );

  const selectCategory = (index) => setSelected(categoryKeys[index] || 'All');

  return (
    <motion.section id="skills" layout="position" className="skills-section page-shell section-block gsap-reveal">
      <div className="section-heading section-heading-centered">
        <p className="section-kicker"><span>03</span> / {ui.skillsKicker}</p>
        <h2>
          {language === 'ar'
            ? <>تقنيات لواجهات <em>تعمل بجمال</em></>
            : <>Technologies for interfaces that <em>work beautifully</em></>}
        </h2>
        <p>{ui.skillsIntro}</p>
      </div>
      <div className="filter-rail skill-filter" role="group" aria-label={ui.skillsKicker}>
        {categories.map((category, index) => {
          const Icon = categoryIcons[index];
          const active = selected === categoryKeys[index];
          return (
            <button
              type="button"
              aria-pressed={active}
              key={category}
              className={active ? 'filter-chip is-selected' : 'filter-chip'}
              onClick={() => selectCategory(index)}
            >
              <Icon size={15} aria-hidden="true" />
              {category}
            </button>
          );
        })}
      </div>
      <motion.div className="skills-grid" layout>
        {filtered.map((skill, index) => (
          <motion.article
            className="skill-card glass-panel"
            key={skill.name}
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.035, 0.25), duration: 0.35 }}
            whileHover={{ scale: 1.045, y: -4 }}
            style={{ '--skill-color': skill.color }}
          >
            <span className="skill-mark" aria-hidden="true">{skill.mark}</span>
            <span className="skill-label">{skill.name}</span>
            <ArrowUpRight size={14} className="skill-arrow" aria-hidden="true" />
            <span className="skill-category">
              {categories[categoryKeys.indexOf(skill.category)] || skill.category}
            </span>
          </motion.article>
        ))}
      </motion.div>
      <p className="skills-note">
        <span className="availability-pulse" aria-hidden="true" />
        {language === 'ar'
          ? 'أختار الأدوات وفق احتياجات كل مشروع.'
          : 'Tools are selected to fit each project.'}
      </p>
    </motion.section>
  );
}
