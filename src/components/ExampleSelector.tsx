import { ChevronDown, LockKeyhole } from 'lucide-react';
import { examples } from '../data/examples';

export function ExampleSelector() {
  return <div className="example-strip"><span className="example-label">Examples</span>{examples.map((e, i) => <button key={e.name} disabled={!e.available} className={i === 0 ? 'active-example' : ''}><span>{e.name}<small>{e.detail}</small></span>{e.available ? i === 0 && <ChevronDown size={14}/> : <LockKeyhole size={12}/>}</button>)}</div>;
}
