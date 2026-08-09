import { useEffect, useState } from 'react';
import { Controls } from '../components/Controls';
import { JoinQueryPanel } from '../joins/JoinQueryPanel';
import { JoinStepIndicator } from '../joins/JoinStepIndicator';
import { SourceTables, ResultTable } from '../joins/JoinTables';
import { JoinTypeSelector } from '../joins/JoinTypeSelector';
import { createJoinSteps, type WorkingJoinKind } from '../joins/model';

export function JoinsPage(){
  const [kind,setKind]=useState<WorkingJoinKind>('inner');const [index,setIndex]=useState(0);const [running,setRunning]=useState(false);const [speed,setSpeed]=useState(1);const steps=createJoinSteps(kind);const step=steps[index];
  useEffect(()=>{if(!running)return;if(index>=steps.length-1){setRunning(false);return}const timer=window.setTimeout(()=>setIndex(i=>i+1),1500/speed);return()=>clearTimeout(timer)},[running,index,speed,steps.length]);
  const run=()=>{if(index===steps.length-1)setIndex(0);setRunning(v=>!v)};const reset=()=>{setRunning(false);setIndex(0)};const move=(n:number)=>{setRunning(false);setIndex(i=>Math.max(0,Math.min(steps.length-1,i+n)))};const select=(next:WorkingJoinKind)=>{setRunning(false);setIndex(0);setKind(next)};
  return <main className="joins-page"><div className="hero"><div><span className="kicker">Match and combine</span><h1>SQL JOINs</h1><p>See how rows from two tables are matched and combined.</p></div><div className="phase-pills"><span className={index>=2?'done':''}>1 Select row</span><i/><span className={index>=2?'done':''}>2 Match key</span><i/><span className={index>=3?'done':''}>3 Append</span></div></div><JoinTypeSelector selected={kind} onSelect={select}/><div className="joins-workspace"><aside><JoinQueryPanel phase={step.phase} kind={kind}/><Controls running={running} index={index} last={steps.length-1} speed={speed} onRun={run} onReset={reset} onPrev={()=>move(-1)} onNext={()=>move(1)} onSpeed={setSpeed}/></aside><div className="join-visual"><JoinStepIndicator step={step} index={index} total={steps.length} kind={kind}/><SourceTables step={step}/><ResultTable steps={steps} stepIndex={index} complete={step.phase==='complete'} kind={kind}/></div></div></main>
}
