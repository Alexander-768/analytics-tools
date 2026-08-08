import { motion } from 'framer-motion';
import type { Phase } from '../types';

const Line = ({ n, children, active = false }: { n: number; children: React.ReactNode; active?: boolean }) => (
  <motion.div animate={{ backgroundColor: active ? 'rgba(124, 129, 255, .12)' : 'rgba(0,0,0,0)' }} className={`code-line ${active ? 'active' : ''}`}>
    <span className="line-no">{n}</span><span>{children}</span>
  </motion.div>
);

export function SqlCode({ phase }: { phase: Phase }) {
  const partition = phase === 'partition';
  const order = phase === 'sort';
  const calc = phase === 'calculate' || phase === 'complete';
  return <section className="sql-card panel">
    <div className="panel-head"><div><span className="eyebrow">SQL query</span><h2>employees.sql</h2></div><span className="status-dot">Predefined</span></div>
    <div className="code" aria-label="SQL query">
      <Line n={1}><b>SELECT</b></Line>
      <Line n={2}>  employee,</Line>
      <Line n={3}>  department,</Line>
      <Line n={4}>  salary,</Line>
      <Line n={5} active={calc}>  <strong>SUM</strong>(salary) <i>OVER</i> (</Line>
      <Line n={6} active={partition || calc}>    <i>PARTITION BY</i> department</Line>
      <Line n={7} active={order || calc}>    <i>ORDER BY</i> salary</Line>
      <Line n={8} active={calc}>  ) <i>AS</i> running_salary</Line>
      <Line n={9}><b>FROM</b> employees;</Line>
    </div>
    <div className="code-note"><span>Frame</span><code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code></div>
  </section>;
}
