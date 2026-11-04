import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '../i18n';

type Props = { running: boolean; index: number; last: number; speed: number; onRun(): void; onReset(): void; onPrev(): void; onNext(): void; onSpeed(v: number): void };
export function Controls(p: Props) {
  const {t}=useLanguage();
  return <div className="controls panel">
    <button className="run" onClick={p.onRun}>{p.running ? <Pause size={15}/> : <Play size={15}/>} {p.index === 0 ? t('Run visualization') : p.running ? t('Pause') : t('Play')}</button>
    <div className="separator" />
    <button className="icon-btn" onClick={p.onPrev} disabled={p.index === 0} title={t('Previous step')}><ChevronLeft size={17}/></button>
    <button className="icon-btn" onClick={p.onNext} disabled={p.index === p.last} title={t('Next step')}><ChevronRight size={17}/></button>
    <button className="reset" onClick={p.onReset}><RotateCcw size={14}/> {t('Reset')}</button>
    <div className="speed" aria-label="Playback speed">{[.5, 1, 1.5, 2].map(v => <button className={p.speed === v ? 'selected' : ''} onClick={() => p.onSpeed(v)} key={v}>{v}x</button>)}</div>
  </div>;
}
