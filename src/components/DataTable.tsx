import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { employees, results, sortedEmployees } from '../data/examples';
import type { Employee, VisualizationStep } from '../types';

const departments: Employee['department'][] = ['Analytics', 'Product'];

export function DataTable({ step, stepIndex }: { step: VisualizationStep; stepIndex: number }) {
  const grouped = step.phase !== 'initial';
  const sorted = ['sort', 'calculate', 'complete'].includes(step.phase);
  const showResult = ['calculate', 'complete'].includes(step.phase);
  const rows = sorted ? sortedEmployees : employees;
  const completedIds = new Set(sortedEmployees.filter((_, i) => step.phase === 'complete' || i <= stepIndex - 3).map(r => r.id));

  const renderRow = (row: Employee) => {
    const inFrame = step.frameIds?.includes(row.id);
    const current = step.rowId === row.id;
    return <motion.div layout="position" transition={{ type: 'spring', stiffness: 320, damping: 32 }} key={row.id} className={`data-row ${inFrame ? 'in-frame' : ''} ${current ? 'current' : ''}`}>
      <span className="frame-rail" />
      <div className="avatar">{row.employee[0]}</div>
      <div className="employee"><b>{row.employee}</b><small>EMP-{row.id.slice(0, 3).toUpperCase()}</small></div>
      <div className="department"><span>{row.department}</span></div>
      <div className="salary">${row.salary}</div>
      <AnimatePresence>{showResult && <motion.div className="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence mode="wait">{completedIds.has(row.id) ? <motion.b key={results[row.id]} initial={{ opacity: 0, y: 5, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }}>${results[row.id]}</motion.b> : <span className="pending">—</span>}</AnimatePresence>
      </motion.div>}</AnimatePresence>
    </motion.div>;
  };

  return <section className="table-card panel">
    <div className="table-title"><div><span className="eyebrow">Visualization</span><h2>Employee salary data</h2></div><div className="legend"><span><i className="frame-key"/>Window frame</span><span><i className="row-key"/>Current row</span></div></div>
    <div className={`table-head ${showResult ? 'with-result' : ''}`}><span>Employee</span><span>Department</span><span>Salary</span>{showResult && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Running salary</motion.span>}</div>
    <LayoutGroup><motion.div layout className="table-body">
      {!grouped ? rows.map(renderRow) : departments.map(dept => <motion.div layout key={dept} className={`partition ${step.partition === dept ? 'active-partition' : ''}`}>
        <div className="partition-label"><span>Partition</span><b>{dept}</b><em>{rows.filter(r => r.department === dept).length} rows</em></div>
        {rows.filter(r => r.department === dept).map(renderRow)}
      </motion.div>)}
    </motion.div></LayoutGroup>
    <div className="table-foot"><span>{employees.length} rows</span><span>Window resets at each partition boundary</span></div>
  </section>;
}
