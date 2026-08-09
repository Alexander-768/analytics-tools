import { LockKeyhole } from 'lucide-react';
import { VennJoinBadge, type JoinKind } from './VennJoinBadge';
import type { WorkingJoinKind } from './model';
const types: {kind:JoinKind; label:string; note:string; ready:boolean}[] = [
  {kind:'inner',label:'INNER JOIN',note:'Matching rows',ready:true},
  {kind:'left',label:'LEFT JOIN',note:'Keep all left rows',ready:true},
  {kind:'full',label:'FULL OUTER JOIN',note:'Coming soon',ready:false},
  {kind:'cross',label:'CROSS JOIN',note:'Coming soon',ready:false},
];
export function JoinTypeSelector({selected,onSelect}:{selected:WorkingJoinKind;onSelect(kind:WorkingJoinKind):void}){return <div className="join-selector"><span>Join type</span>{types.map(type=><button className={type.kind===selected?'selected':''} disabled={!type.ready} onClick={()=>type.ready&&onSelect(type.kind as WorkingJoinKind)} key={type.kind}><VennJoinBadge kind={type.kind}/><span>{type.label}<small>{type.note}</small></span>{!type.ready&&<LockKeyhole size={10}/>}</button>)}</div>}
