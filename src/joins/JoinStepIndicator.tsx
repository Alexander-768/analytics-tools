import { AnimatePresence, motion } from 'framer-motion';
import type { JoinStep } from './model';
import { VennJoinBadge } from './VennJoinBadge';
import type { WorkingJoinKind } from './model';
export function JoinStepIndicator({step,index,total,kind}:{step:JoinStep;index:number;total:number;kind:WorkingJoinKind}){const leftOnly=kind==='left'&&step.appendNull;return <div className="join-step panel"><div className="join-step-number"><span>Current step</span><b>{String(index+1).padStart(2,'0')} <em>/ {String(total).padStart(2,'0')}</em></b></div><AnimatePresence mode="wait"><motion.div className="join-step-copy" key={index} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}><h3>{step.title}</h3><p>{step.detail}</p></motion.div></AnimatePresence><div className={`join-step-venn ${leftOnly?'left-only-active':''}`}><VennJoinBadge kind={kind}/><span>{leftOnly?'A only → keep':kind==='inner'?'Intersection only':'All of A'}</span></div></div>}
