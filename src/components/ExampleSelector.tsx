import { ChevronDown } from 'lucide-react';
import { examples } from '../data/examples';
import type { ExampleId } from '../types';

export function ExampleSelector({ selected, onSelect }: { selected: ExampleId; onSelect(id: ExampleId): void }) {
  return <div className="example-strip">{['Window examples', 'Ranking functions', 'Offset functions'].map(group => <div className="example-group" key={group}><span className="example-label">{group}</span>{examples.filter(e => e.group === group).map(e => <button key={e.name} onClick={() => onSelect(e.id as ExampleId)} className={e.id === selected ? 'active-example' : ''}><span>{e.name}<small>{e.detail}</small></span>{e.id === selected && <ChevronDown size={14}/>}</button>)}</div>)}</div>;
}
