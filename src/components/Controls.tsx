import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';

type Props = { running: boolean; index: number; last: number; speed: number; onRun(): void; onReset(): void; onPrev(): void; onNext(): void; onSpeed(v: number): void };
export function Controls(p: Props) {
  return <div className="controls panel">
    <button className="run" onClick={p.onRun}>{p.running ? <Pause size={15}/> : <Play size={15}/>} {p.index === 0 ? 'Run visualization' : p.running ? 'Pause' : 'Play'}</button>
    <div className="separator" />
    <button className="icon-btn" onClick={p.onPrev} disabled={p.index === 0} title="Previous step"><ChevronLeft size={17}/></button>
    <button className="icon-btn" onClick={p.onNext} disabled={p.index === p.last} title="Next step"><ChevronRight size={17}/></button>
    <button className="reset" onClick={p.onReset}><RotateCcw size={14}/> Reset</button>
    <div className="speed" aria-label="Playback speed">{[.5, 1, 1.5, 2].map(v => <button className={p.speed === v ? 'selected' : ''} onClick={() => p.onSpeed(v)} key={v}>{v}x</button>)}</div>
  </div>;
}
