import { useEffect, useState } from 'react';
import { Braces } from 'lucide-react';
import { Controls } from './components/Controls';
import { DataTable } from './components/DataTable';
import { ExampleSelector } from './components/ExampleSelector';
import { SqlCode } from './components/SqlCode';
import { StepIndicator } from './components/StepIndicator';
import { steps } from './data/examples';

export function App() {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!running) return;
    if (index >= steps.length - 1) { setRunning(false); return; }
    const timer = window.setTimeout(() => setIndex(i => i + 1), 1500 / speed);
    return () => window.clearTimeout(timer);
  }, [running, index, speed]);
  const run = () => { if (index >= steps.length - 1) setIndex(0); setRunning(v => !v); };
  const reset = () => { setRunning(false); setIndex(0); };
  const move = (by: number) => { setRunning(false); setIndex(i => Math.max(0, Math.min(steps.length - 1, i + by))); };

  return <div className="app-shell">
    <header><div className="brand"><Braces size={18}/><span>Queryflow</span><em>LAB</em></div><div className="header-meta"><span>SQL visualizer</span><i/>Interactive mode</div></header>
    <main>
      <div className="hero"><div><span className="kicker">Learn by seeing</span><h1>Window Functions</h1><p>See how SQL window functions transform your data.</p></div><div className="phase-pills"><span className={index >= 1 ? 'done' : ''}>1 Partition</span><i/><span className={index >= 2 ? 'done' : ''}>2 Order</span><i/><span className={index >= 3 ? 'done' : ''}>3 Calculate</span></div></div>
      <ExampleSelector />
      <div className="workspace">
        <aside><SqlCode phase={steps[index].phase}/><Controls running={running} index={index} last={steps.length - 1} speed={speed} onRun={run} onReset={reset} onPrev={() => move(-1)} onNext={() => move(1)} onSpeed={setSpeed}/></aside>
        <div className="visual"><StepIndicator step={steps[index]} index={index} total={steps.length}/><DataTable step={steps[index]} stepIndex={index}/></div>
      </div>
    </main>
  </div>;
}
