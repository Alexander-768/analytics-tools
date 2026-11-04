import { ChevronDown } from 'lucide-react';
import { examples } from '../data/examples';
import type { ExampleId } from '../types';
import { useLanguage } from '../i18n';

export function ExampleSelector({ selected, onSelect }: { selected: ExampleId; onSelect(id: ExampleId): void }) {
  const {t}=useLanguage();
  return <div className="example-strip">{['Window examples', 'Ranking functions', 'Offset functions'].map(group => <div className="example-group" key={group}><span className="example-label">{t(group)}</span>{examples.filter(e => e.group === group).map(e => <button key={e.name} onClick={() => onSelect(e.id as ExampleId)} className={e.id === selected ? 'active-example' : ''}><span>{e.name}<small>{t(e.detail)}</small></span>{e.id === selected && <ChevronDown size={14}/>}</button>)}</div>)}</div>;
}
