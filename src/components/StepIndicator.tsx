import { AnimatePresence, motion } from 'framer-motion';
import type { VisualizationStep } from '../types';
import { useLanguage } from '../i18n';

export function StepIndicator({ step, index, total }: { step: VisualizationStep; index: number; total: number }) {
  const {t}=useLanguage();
  const equation = step.equation ?? (step.values ? `${step.values.join(' + ')} = ${step.result}` : null);
  return <section className="step-panel panel">
    <div className="step-count"><span>{t('Current step')}</span><b>{String(index + 1).padStart(2, '0')} <em>/ {String(total).padStart(2, '0')}</em></b></div>
    <AnimatePresence mode="wait"><motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="step-copy">
      <h3>{t(step.title)}</h3><p>{t(step.description)}</p>
    </motion.div></AnimatePresence>
    <div className="calc-slot">
      <AnimatePresence mode="wait">{equation && <motion.div key={equation} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="equation"><span>{t('CALCULATION')}</span><code>{equation}</code></motion.div>}</AnimatePresence>
    </div>
  </section>;
}
