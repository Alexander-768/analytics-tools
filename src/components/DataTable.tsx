import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { Employee, VisualizationExample, VisualizationStep } from '../types';
import { useLanguage } from '../i18n';

const departments: Employee['department'][] = ['Analytics', 'Product'];

export function DataTable({ step, stepIndex, example }: { step: VisualizationStep; stepIndex: number; example: VisualizationExample }) {
  const {t}=useLanguage();
  const grouped = step.phase !== 'initial';
  const sorted = example.sorted && ['sort', 'calculate', 'complete'].includes(step.phase);
  const showResult = ['calculate', 'complete'].includes(step.phase);
  const rows = sorted ? example.sortedRows : example.rows;
  const completedIds = new Set(step.phase === 'complete' ? example.rows.map(row => row.id) : example.steps.slice(0, stepIndex + 1).flatMap(item => item.phase === 'calculate' ? item.resultIds ?? [] : []));

  const renderRow = (row: Employee) => {
    const inFrame = step.frameIds?.includes(row.id);
    const current = step.rowId === row.id;
    const source = step.sourceRowId === row.id;
    const arrow = current && step.direction ? step.direction === 'backward' ? '↑ '+t('Previous row') : step.direction === 'forward' ? '↓ '+t('Next row') : step.direction === 'first' ? '↑ '+t('First in partition') : '↓ '+t('Last in full frame') : null;
    return <motion.div layout="position" transition={{ type: 'spring', stiffness: 320, damping: 32 }} key={row.id} className={`data-row ${inFrame ? 'in-frame' : ''} ${current ? 'current' : ''} ${source ? 'source-row' : ''}`}>
      <span className="frame-rail" />
      <div className="avatar">{row.employee[0]}</div>
      <div className="employee"><b>{row.employee}</b><small>EMP-{row.id.slice(0, 3).toUpperCase()}</small></div>
      <div className="department"><span>{row.department}</span></div>
      <div className="salary"><span>${row.salary}</span>{arrow && <motion.em className="offset-arrow" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>{arrow}</motion.em>}</div>
      <AnimatePresence>{showResult && <motion.div className="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence mode="wait">{completedIds.has(row.id) ? <motion.b key={String(example.results[row.id])} initial={{ opacity: 0, y: 5, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }}>{example.results[row.id] === null ? 'NULL' : <>{example.resultPrefix}{example.results[row.id]}</>}</motion.b> : <span className="pending">—</span>}</AnimatePresence>
      </motion.div>}</AnimatePresence>
    </motion.div>;
  };

  return <section className="table-card panel">
    <div className="table-title"><div><span className="eyebrow">{t('Visualization')}</span><h2>{t('Employee data')}</h2></div><div className="legend"><span><i className="frame-key"/>{t('Source / peers')}</span><span><i className="row-key"/>{t('Current row')}</span></div></div>
    <div className={`table-head ${showResult ? 'with-result' : ''}`}><span>{t('Employee')}</span><span>{t('Department')}</span><span>{t('Salary')}</span>{showResult && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{t(example.resultLabel)}</motion.span>}</div>
    <LayoutGroup><motion.div layout className="table-body">
      {!grouped ? rows.map(renderRow) : departments.map(dept => <motion.div layout key={dept} className={`partition ${step.partition === dept ? 'active-partition' : ''}`}>
        <div className="partition-label"><span>{t('Partition')}</span><b>{dept}</b><em>{rows.filter(r => r.department === dept).length} {t('rows')}</em></div>
        {rows.filter(r => r.department === dept).map(renderRow)}
      </motion.div>)}
    </motion.div></LayoutGroup>
    <div className="table-foot"><span>{example.rows.length} {t('rows')}</span><span>{t('Window resets at each partition boundary')}</span></div>
  </section>;
}
