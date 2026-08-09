import { motion } from 'framer-motion';
import type { ExampleId, Phase } from '../types';

const Line = ({ n, children, active = false }: { n: number; children: React.ReactNode; active?: boolean }) => (
  <motion.div animate={{ backgroundColor: active ? 'rgba(124, 129, 255, .12)' : 'rgba(0,0,0,0)' }} className={`code-line ${active ? 'active' : ''}`}>
    <span className="line-no">{n}</span><span>{children}</span>
  </motion.div>
);

export function SqlCode({ phase, exampleId }: { phase: Phase; exampleId: ExampleId }) {
  const partition = phase === 'partition';
  const order = phase === 'sort';
  const calc = phase === 'calculate' || phase === 'complete';
  const isCount = exampleId === 'partition-count';
  const isOffset = ['lag', 'lead', 'first-value', 'last-value'].includes(exampleId);
  const isRanking = !isCount && exampleId !== 'running-sum' && !isOffset;
  const rankingName = exampleId === 'row-number' ? 'ROW_NUMBER' : exampleId === 'rank' ? 'RANK' : 'DENSE_RANK';
  const offsetName = exampleId === 'first-value' ? 'FIRST_VALUE' : exampleId === 'last-value' ? 'LAST_VALUE' : exampleId.toUpperCase();
  const offsetAlias = exampleId === 'lag' ? 'previous_salary' : exampleId === 'lead' ? 'next_salary' : exampleId === 'first-value' ? 'first_salary' : 'last_salary';
  return <section className="sql-card panel">
    <div className="panel-head"><div><span className="eyebrow">SQL query</span><h2>employees.sql</h2></div><span className="status-dot">Predefined</span></div>
    <div className="code" aria-label="SQL query">
      <Line n={1}><b>SELECT</b></Line>
      {isCount ? <>
        <Line n={2}>  id,</Line><Line n={3}>  employee,</Line><Line n={4}>  department,</Line>
        <Line n={5} active={calc}>  <strong>COUNT</strong>(<i>DISTINCT</i> id) <i>OVER</i> (</Line>
        <Line n={6} active={partition || calc}>    <i>PARTITION BY</i> department</Line>
        <Line n={7} active={calc}>  ) <i>AS</i> employees_in_department</Line>
        <Line n={8}><b>FROM</b> employees;</Line>
      </> : isOffset ? <>
        <Line n={2}>  employee,</Line><Line n={3}>  department,</Line><Line n={4}>  salary,</Line>
        <Line n={5} active={calc}>  <strong>{offsetName}</strong>(salary) <i>OVER</i> (</Line>
        <Line n={6} active={partition || calc}>    <i>PARTITION BY</i> department</Line>
        <Line n={7} active={order || calc}>    <i>ORDER BY</i> salary</Line>
        {exampleId === 'last-value' && <><Line n={8} active={calc}>    <i>ROWS BETWEEN UNBOUNDED PRECEDING</i></Line><Line n={9} active={calc}>      <i>AND UNBOUNDED FOLLOWING</i></Line></>}
        <Line n={exampleId === 'last-value' ? 10 : 8} active={calc}>  ) <i>AS</i> {offsetAlias}</Line>
        <Line n={exampleId === 'last-value' ? 11 : 9}><b>FROM</b> employees;</Line>
      </> : isRanking ? <>
        <Line n={2}>  employee,</Line><Line n={3}>  department,</Line><Line n={4}>  salary,</Line>
        <Line n={5} active={calc}>  <strong>{rankingName}</strong>() <i>OVER</i> (</Line>
        <Line n={6} active={partition || calc}>    <i>PARTITION BY</i> department</Line>
        <Line n={7} active={order || calc}>    <i>ORDER BY</i> salary</Line>
        <Line n={8} active={calc}>  ) <i>AS</i> {rankingName.toLowerCase()}</Line>
        <Line n={9}><b>FROM</b> employees;</Line>
      </> : <>
        <Line n={2}>  employee,</Line><Line n={3}>  department,</Line><Line n={4}>  salary,</Line>
        <Line n={5} active={calc}>  <strong>SUM</strong>(salary) <i>OVER</i> (</Line>
        <Line n={6} active={partition || calc}>    <i>PARTITION BY</i> department</Line>
        <Line n={7} active={order || calc}>    <i>ORDER BY</i> salary</Line>
        <Line n={8} active={calc}>  ) <i>AS</i> running_salary</Line>
        <Line n={9}><b>FROM</b> employees;</Line>
      </>}
    </div>
    <div className="code-note"><span>{isRanking ? 'Peer group' : isOffset ? 'Source lookup' : 'Window frame'}</span><code>{isCount ? 'ALL ROWS IN CURRENT PARTITION' : isRanking ? 'ROWS WITH THE SAME ORDER BY VALUE' : exampleId === 'last-value' ? 'FULL PARTITION: PRECEDING → FOLLOWING' : isOffset ? 'CURRENT ROW → SOURCE ROW' : 'UNBOUNDED PRECEDING → CURRENT ROW'}</code></div>
  </section>;
}
