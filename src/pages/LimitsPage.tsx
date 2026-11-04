import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n';

type Point = { x: number; y: number };
type CurveProps = { points: Point[]; className: string };

const W = 760;
const H = 300;
const PAD = 36;

function pathFrom(points: Point[], xMin: number, xMax: number, yMin: number, yMax: number) {
  const sx = (x: number) => PAD + (x - xMin) / (xMax - xMin) * (W - PAD * 2);
  const sy = (y: number) => H - PAD - (y - yMin) / (yMax - yMin) * (H - PAD * 2);
  return points.map((p, i) => `${i ? 'L' : 'M'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ');
}

function sample(fn: (x:number)=>number, from: number, to: number, steps = 180, skip?: (x:number)=>boolean) {
  const pts: Point[] = [];
  for (let i=0;i<=steps;i++) {
    const x = from + (to-from)*i/steps;
    if (!skip?.(x)) pts.push({x,y:fn(x)});
  }
  return pts;
}

function Plot({ curves, xMin, xMax, yMin, yMax, markers = [], guides = [] }:{
  curves: CurveProps[]; xMin:number; xMax:number; yMin:number; yMax:number;
  markers?: {x:number;y:number;label?:string;open?:boolean;className?:string}[];
  guides?: {axis:'x'|'y';value:number;label?:string}[];
}) {
  const sx = (x:number) => PAD + (x - xMin)/(xMax-xMin)*(W-PAD*2);
  const sy = (y:number) => H-PAD-(y-yMin)/(yMax-yMin)*(H-PAD*2);
  return <svg className="limit-plot" viewBox={`0 0 ${W} ${H}`} role="img">
    <line x1={PAD} x2={W-PAD} y1={sy(0)} y2={sy(0)} className="limit-axis"/>
    <line x1={sx(0)} x2={sx(0)} y1={PAD} y2={H-PAD} className="limit-axis"/>
    {guides.map((g,i)=> g.axis==='x'
      ? <g key={i}><line x1={sx(g.value)} x2={sx(g.value)} y1={PAD} y2={H-PAD} className="limit-guide"/>{g.label && <text x={sx(g.value)+5} y={PAD+12}>{g.label}</text>}</g>
      : <g key={i}><line x1={PAD} x2={W-PAD} y1={sy(g.value)} y2={sy(g.value)} className="limit-guide"/>{g.label && <text x={PAD+5} y={sy(g.value)-6}>{g.label}</text>}</g>
    )}
    {curves.map((c,i)=><path key={i} d={pathFrom(c.points,xMin,xMax,yMin,yMax)} className={c.className}/>)}
    {markers.map((m,i)=><g key={i}><circle cx={sx(m.x)} cy={sy(m.y)} r="5" className={`${m.className||'limit-marker'} ${m.open?'open':''}`}/>{m.label&&<text x={sx(m.x)+8} y={sy(m.y)-8}>{m.label}</text>}</g>)}
  </svg>;
}

export function LimitsPage() {
  const [x, setX] = useState(1.2);
  const [side, setSide] = useState<'left'|'right'>('left');
  const [jumpX, setJumpX] = useState(0.8);
  const [continuity, setContinuity] = useState<'continuous'|'hole'|'jump'>('continuous');
  const [ratioX, setRatioX] = useState(1.4);
  const [inftyX, setInftyX] = useState(3);
  const { t } = useLanguage();

  const xSq = useMemo(()=>sample(v=>v*v,-1,4),[]);
  const holeLeft = useMemo(()=>sample(v=>v+2,-1,1.98,120),[]);
  const holeRight = useMemo(()=>sample(v=>v+2,2.02,5,120),[]);
  const jumpLeft = useMemo(()=>sample(()=>1,-3,-.02,100),[]);
  const jumpRight = useMemo(()=>sample(()=>3,.02,3,100),[]);

  const oneSideY = side==='left' ? 1 : 3;
  const currentX = side==='left' ? -Math.abs(jumpX) : Math.abs(jumpX);

  return <main className="limits-page">
    <section className="limits-hero">
      <div><span className="kicker">{t('Basic Math · Interactive lab')}</span><h1>{t('Limits')}</h1><p>{t('See what a function approaches — not just what it equals at one point.')}</p></div>
    </section>

    <section id="meaning" className="limit-lab panel">
      <div className="limit-copy"><span className="limit-index">01</span><h2>{t('What does a limit mean?')}</h2><p>{t('Move x toward 2. Watch f(x)=x² approach 4.')}</p>
        <div className="limit-readout"><span>x <b>{x.toFixed(2)}</b></span><span>f(x) <b>{(x*x).toFixed(3)}</b></span><strong>lim x→2 f(x) = 4</strong></div>
        <input type="range" min="-1" max="4" step=".01" value={x} onChange={e=>setX(+e.target.value)}/>
        <div className="limit-actions"><button onClick={()=>setX(1.99)}>{t('Approach from left')}</button><button onClick={()=>setX(2.01)}>{t('Approach from right')}</button></div>
      </div>
      <div className="limit-viz"><Plot curves={[{points:xSq,className:'limit-curve primary'}]} xMin={-1} xMax={4} yMin={-1} yMax={16} guides={[{axis:'x',value:2,label:'x = 2'},{axis:'y',value:4,label:'L = 4'}]} markers={[{x,y:x*x,label:`(${x.toFixed(2)}, ${(x*x).toFixed(2)})`,className:'limit-marker primary'}]}/></div>
    </section>

    <section id="sides" className="limit-lab panel">
      <div className="limit-copy"><span className="limit-index">02</span><h2>{t('Left and right limits')}</h2><p>{t('A two-sided limit exists only when both sides approach the same value.')}</p>
        <div className="segmented"><button className={side==='left'?'active':''} onClick={()=>setSide('left')}>{t('From left')}</button><button className={side==='right'?'active':''} onClick={()=>setSide('right')}>{t('From right')}</button></div>
        <input type="range" min=".05" max="2.5" step=".01" value={jumpX} onChange={e=>setJumpX(+e.target.value)}/>
        <div className="limit-equation"><span>lim x→0{side==='left'?'⁻':'⁺'} f(x)</span><b>{oneSideY}</b></div>
        <p className="limit-note">{t('Left limit = 1, right limit = 3 → the overall limit does not exist.')}</p>
      </div>
      <div className="limit-viz"><Plot curves={[{points:jumpLeft,className:'limit-curve primary'},{points:jumpRight,className:'limit-curve accent'}]} xMin={-3} xMax={3} yMin={0} yMax={4} guides={[{axis:'x',value:0,label:'x = 0'}]} markers={[{x:currentX,y:oneSideY,label:t('current x'),className:side==='left'?'limit-marker primary':'limit-marker accent'},{x:0,y:1,open:true,className:'limit-marker primary'},{x:0,y:3,open:true,className:'limit-marker accent'}]}/></div>
    </section>

    <section id="continuity" className="limit-lab panel">
      <div className="limit-copy"><span className="limit-index">03</span><h2>{t('Continuity and breaks')}</h2><p>{t('Compare a continuous curve, a removable hole, and a jump.')}</p>
        <div className="segmented three"><button className={continuity==='continuous'?'active':''} onClick={()=>setContinuity('continuous')}>{t('Continuous')}</button><button className={continuity==='hole'?'active':''} onClick={()=>setContinuity('hole')}>{t('Hole')}</button><button className={continuity==='jump'?'active':''} onClick={()=>setContinuity('jump')}>{t('Jump')}</button></div>
        {continuity==='continuous' && <p className="limit-note">{t('At x=2: f(2)=4 and the limit is also 4.')}</p>}
        {continuity==='hole' && <p className="limit-note">{t('The point is missing, but values from both sides still approach 4. The limit exists.')}</p>}
        {continuity==='jump' && <p className="limit-note">{t('The left and right sides approach different values. The limit does not exist.')}</p>}
      </div>
      <div className="limit-viz">
        {continuity==='continuous' && <Plot curves={[{points:xSq,className:'limit-curve primary'}]} xMin={-1} xMax={4} yMin={-1} yMax={16} guides={[{axis:'x',value:2,label:'x = 2'}]} markers={[{x:2,y:4,label:'f(2)=4',className:'limit-marker primary'}]}/>}
        {continuity==='hole' && <Plot curves={[{points:holeLeft,className:'limit-curve primary'},{points:holeRight,className:'limit-curve primary'}]} xMin={-1} xMax={5} yMin={0} yMax={7} guides={[{axis:'x',value:2,label:'x = 2'}]} markers={[{x:2,y:4,label:t('hole, limit = 4'),open:true,className:'limit-marker primary'}]}/>}
        {continuity==='jump' && <Plot curves={[{points:jumpLeft,className:'limit-curve primary'},{points:jumpRight,className:'limit-curve accent'}]} xMin={-3} xMax={3} yMin={0} yMax={4} guides={[{axis:'x',value:0,label:t('jump')}]} markers={[{x:0,y:1,open:true,className:'limit-marker primary'},{x:0,y:3,open:true,className:'limit-marker accent'}]}/>}
      </div>
    </section>

    <section id="indeterminate" className="limit-lab panel">
      <div className="limit-copy"><span className="limit-index">04</span><h2>{t('Indeterminate form 0/0')}</h2><p>{t('Direct substitution can fail even when the limit is perfectly defined.')}</p>
        <div className="limit-formula-block"><code>(x² − 4) / (x − 2)</code><span>= (x−2)(x+2)/(x−2)</span><strong>= x + 2, {t('for x ≠ 2')}</strong></div>
        <input type="range" min="-1" max="5" step=".01" value={ratioX} onChange={e=>setRatioX(+e.target.value)}/>
        <div className="limit-readout"><span>x <b>{ratioX.toFixed(2)}</b></span><span>{t('value')} <b>{(ratioX+2).toFixed(3)}</b></span><strong>lim x→2 = 4</strong></div>
      </div>
      <div className="limit-viz"><Plot curves={[{points:holeLeft,className:'limit-curve primary'},{points:holeRight,className:'limit-curve primary'}]} xMin={-1} xMax={5} yMin={0} yMax={7} guides={[{axis:'x',value:2,label:'0/0 here'},{axis:'y',value:4,label:'limit = 4'}]} markers={[{x:2,y:4,open:true,className:'limit-marker primary'},{x:ratioX,y:ratioX+2,label:t('current'),className:'limit-marker accent'}]}/></div>
    </section>

    <section id="infinity" className="limit-lab panel">
      <div className="limit-copy"><span className="limit-index">05</span><h2>{t('Indeterminate form ∞/∞')}</h2><p>{t('For large x, compare the dominant terms instead of the raw huge numbers.')}</p>
        <div className="limit-formula-block"><code>(2x² + 3x) / (x² + 1)</code><span>{t('divide numerator and denominator by x²')}</span><strong>→ (2 + 3/x) / (1 + 1/x²) → 2</strong></div>
        <input type="range" min="1" max="100" step="1" value={inftyX} onChange={e=>setInftyX(+e.target.value)}/>
        <div className="limit-readout"><span>x <b>{inftyX}</b></span><span>{t('value')} <b>{((2*inftyX*inftyX+3*inftyX)/(inftyX*inftyX+1)).toFixed(4)}</b></span><strong>lim x→∞ = 2</strong></div>
      </div>
      <div className="limit-viz"><Plot curves={[{points:sample(v=>(2*v*v+3*v)/(v*v+1),1,100),className:'limit-curve primary'}]} xMin={1} xMax={100} yMin={1.8} yMax={3} guides={[{axis:'y',value:2,label:'limit = 2'}]} markers={[{x:inftyX,y:(2*inftyX*inftyX+3*inftyX)/(inftyX*inftyX+1),label:t('current'),className:'limit-marker accent'}]}/></div>
    </section>

    <section className="limit-cheatsheet panel">
      <span className="kicker">{t('Quick mental model')}</span>
      <div><b>1</b><p>{t('Substitute first.')}</p></div><div><b>2</b><p>{t('If you get a normal number — you are done.')}</p></div><div><b>3</b><p>{t('If you get 0/0 or ∞/∞ — transform the expression.')}</p></div><div><b>4</b><p>{t('For a two-sided limit, compare left and right behavior.')}</p></div>
    </section>
  </main>;
}
