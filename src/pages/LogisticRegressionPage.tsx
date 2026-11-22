import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';

type ClientRow={name:string;salary:number;x:number;y:number};
type LogStep={step:number;b0:number;b1:number;loss:number;g0:number;g1:number};

const baseClients=[
  {name:'A',salary:30,y:0},
  {name:'B',salary:50,y:1},
  {name:'C',salary:70,y:0},
  {name:'D',salary:90,y:1},
];

const sigmoid=(z:number)=>1/(1+Math.exp(-z));
const safeLog=(v:number)=>Math.log(Math.max(1e-9,Math.min(1-1e-9,v)));

function calcLoss(rows:ClientRow[],b0:number,b1:number){
  return rows.reduce((sum,r)=>{
    const p=sigmoid(b0+b1*r.x);
    return sum-(r.y*safeLog(p)+(1-r.y)*safeLog(1-p));
  },0)/rows.length;
}

function calcGrad(rows:ClientRow[],b0:number,b1:number){
  let g0=0,g1=0;
  for(const r of rows){
    const p=sigmoid(b0+b1*r.x);
    const e=p-r.y;
    g0+=e;
    g1+=e*r.x;
  }
  return {g0:g0/rows.length,g1:g1/rows.length};
}

function SigmoidPlot({b0,b1,rows,scaled}:{b0:number;b1:number;rows:ClientRow[];scaled:boolean}){
  const W=760,H=390,P=48,xmin=scaled?-2:20,xmax=scaled?2:100,ymin=0,ymax=1;
  const xTicks=scaled?[-2,-1,0,1,2]:[20,40,60,80,100];
  const sx=(x:number)=>P+(x-xmin)/(xmax-xmin)*(W-P*2);
  const sy=(y:number)=>H-P-(y-ymin)/(ymax-ymin)*(H-P*2);
  const curve=Array.from({length:181},(_,i)=>{
    const x=xmin+(xmax-xmin)*i/180;
    return {x,p:sigmoid(b0+b1*x)};
  });
  const d=curve.map((p,i)=>`${i?'L':'M'} ${sx(p.x).toFixed(1)} ${sy(p.p).toFixed(1)}`).join(' ');
  return <svg className="logreg-sigmoid" viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} className="gradient-bg"/>
    {xTicks.map(v=><g key={'x'+v}><line x1={sx(v)} y1={sy(0)} x2={sx(v)} y2={sy(1)} className="gradient-grid"/><text x={sx(v)-5} y={H-18}>{v}</text></g>)}
    {[0,.25,.5,.75,1].map(v=><g key={'y'+v}><line x1={sx(xmin)} y1={sy(v)} x2={sx(xmax)} y2={sy(v)} className={v===.5?'logreg-threshold':'gradient-grid'}/><text x={13} y={sy(v)+3}>{v.toFixed(2)}</text></g>)}
    <path d={d} className="logreg-sigmoid-curve"/>
    {rows.map((r)=>{
      const p=sigmoid(b0+b1*r.x);
      return <g key={r.name}>
        <line x1={sx(r.x)} y1={sy(r.y)} x2={sx(r.x)} y2={sy(p)} className="logreg-residual"/>
        <circle cx={sx(r.x)} cy={sy(r.y)} r="7" className={r.y?'logreg-class-one':'logreg-class-zero'}/>
        <circle cx={sx(r.x)} cy={sy(p)} r="5" className="logreg-pred-point"/>
        <text x={sx(r.x)+8} y={sy(p)-8}>p={p.toFixed(2)}</text>
      </g>
    })}
    <text x={W-148} y={sy(.5)-8} className="logreg-threshold-label">threshold 0.5</text>
    <text x={W-48} y={H-18}>x</text><text x={16} y={22}>p</text>
  </svg>;
}

function LossContour({trajectory,currentStep,rows,scaled}:{trajectory:LogStep[];currentStep:number;rows:ClientRow[];scaled:boolean}){
  const W=720,H=430,P=48;
  const b0min=scaled?-2.5:-5,b0max=scaled?2.5:1.5,b1min=scaled?-1.5:-.03,b1max=scaled?2.8:.12;
  const b0Ticks=scaled?[-2,-1,0,1,2]:[-5,-4,-3,-2,-1,0,1];
  const b1Ticks=scaled?[-1,0,1,2]:[-.02,0,.02,.04,.06,.08,.1,.12];
  const optimum=scaled?{b0:0,b1:.908}:{b0:-2.725,b1:.0454};
  const sx=(v:number)=>P+(v-b0min)/(b0max-b0min)*(W-P*2);
  const sy=(v:number)=>H-P-(v-b1min)/(b1max-b1min)*(H-P*2);
  const nx=30,ny=26;
  const cells=[] as {b0:number;b1:number;loss:number}[];
  let maxLoss=0,minLoss=Infinity;
  for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){
    const b0=b0min+(b0max-b0min)*(ix+.5)/nx;
    const b1=b1min+(b1max-b1min)*(iy+.5)/ny;
    const loss=calcLoss(rows,b0,b1);
    minLoss=Math.min(minLoss,loss);maxLoss=Math.max(maxLoss,loss);
    cells.push({b0,b1,loss});
  }
  const active=trajectory.slice(0,currentStep+1);
  const current=trajectory[Math.min(currentStep,trajectory.length-1)];
  return <svg className="logreg-contour" viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} className="gradient-bg"/>
    {cells.map((c,i)=>{
      const t=(c.loss-minLoss)/(maxLoss-minLoss||1);
      const cw=(W-P*2)/nx+1,ch=(H-P*2)/ny+1;
      return <rect key={i} x={sx(c.b0)-cw/2} y={sy(c.b1)-ch/2} width={cw} height={ch} className="logreg-heat-cell" style={{opacity:.08+.42*t}}/>
    })}
    {b0Ticks.map(v=><g key={'x'+v}><line x1={sx(v)} y1={sy(b1min)} x2={sx(v)} y2={sy(b1max)} className="gradient-grid"/><text x={sx(v)-5} y={H-18}>{v}</text></g>)}
    {b1Ticks.map(v=><g key={'y'+v}><line x1={sx(b0min)} y1={sy(v)} x2={sx(b0max)} y2={sy(v)} className="gradient-grid"/><text x={14} y={sy(v)+3}>{v}</text></g>)}
    <polyline points={trajectory.map(p=>`${sx(p.b0)},${sy(p.b1)}`).join(' ')} className="reg-param-path ghost"/>
    <polyline points={active.map(p=>`${sx(p.b0)},${sy(p.b1)}`).join(' ')} className="reg-param-path active"/>
    {trajectory.map((p,i)=><circle key={i} cx={sx(p.b0)} cy={sy(p.b1)} r={i===currentStep?6:2.5} className={i<=currentStep?'gd-step-dot active':'gd-step-dot'}/>)}
    <circle cx={sx(optimum.b0)} cy={sy(optimum.b1)} r="6" className="reg-ols-point"/>
    <text x={sx(optimum.b0)+9} y={sy(optimum.b1)-9} className="gd-label">min ≈ ({optimum.b0.toFixed(2)}, {optimum.b1.toFixed(scaled?2:3)})</text>
    {current&&<text x={sx(current.b0)+8} y={sy(current.b1)+15} className="gd-current-label">step {current.step}</text>}
    <text x={W-30} y={H-18}>b₀</text><text x={16} y={22}>b₁</text>
  </svg>;
}

function LogLoss3D({trajectory,currentStep,rows,scaled}:{trajectory:LogStep[];currentStep:number;rows:ClientRow[];scaled:boolean}){
  const [yaw,setYaw]=useState(-.78);
  const [pitch,setPitch]=useState(.58);
  const [zoom,setZoom]=useState(1);
  const drag=useRef<{x:number;y:number}|null>(null);
  const b0min=scaled?-2.5:-5,b0max=scaled?2.5:1.5,b1min=scaled?-1.5:-.03,b1max=scaled?2.8:.12,zScale=1.8;
  const optimum=scaled?{b0:0,b1:.908}:{b0:-2.725,b1:.0454};
  const project=(b0:number,b1:number,z:number)=>{
    const x=scaled?b0*.9:(b0+1.75)*.75;
    const y=scaled?(b1-.65)*.9:(b1-.045)*30;
    const zs=z*zScale;
    const cy=Math.cos(yaw),sy=Math.sin(yaw),x1=x*cy-y*sy,y1=x*sy+y*cy,cp=Math.cos(pitch),sp=Math.sin(pitch);
    const y2=y1*cp-zs*sp;
    return {x:360+x1*72*zoom,y:235-y2*72*zoom};
  };
  const g0=Array.from({length:11},(_,i)=>b0min+i*(b0max-b0min)/10);
  const g1=Array.from({length:11},(_,i)=>b1min+i*(b1max-b1min)/10);
  const line0=(fixed:number)=>Array.from({length:45},(_,i)=>{const b0=b0min+i*(b0max-b0min)/44;return project(b0,fixed,calcLoss(rows,b0,fixed))});
  const line1=(fixed:number)=>Array.from({length:45},(_,i)=>{const b1=b1min+i*(b1max-b1min)/44;return project(fixed,b1,calcLoss(rows,fixed,b1))});
  const pts=trajectory.map(p=>({...p,screen:project(p.b0,p.b1,p.loss)}));
  const active=pts.slice(0,currentStep+1),current=pts[Math.min(currentStep,pts.length-1)];
  const min=project(optimum.b0,optimum.b1,calcLoss(rows,optimum.b0,optimum.b1));
  const origin=project(0,0,0),xAxis=project(b0max,0,0),xAxisNeg=project(b0min,0,0),yAxis=project(0,b1max,0),yAxisNeg=project(0,b1min,0),zAxis=project(0,0,2.2);
  const b0Ticks=scaled?[-2,-1,0,1,2]:[-5,-4,-3,-2,-1,0,1];
  const b1Ticks=scaled?[-1,0,1,2]:[-.02,0,.02,.04,.06,.08,.1,.12];
  const lossTicks=[0,.5,1,1.5,2];
  return <div className="reg-loss3d-wrap">
    <svg className="reg-loss3d" viewBox="0 0 720 470"
      onPointerDown={e=>{(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY}}}
      onPointerMove={e=>{if(!drag.current)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;drag.current={x:e.clientX,y:e.clientY};setYaw(v=>v+dx*.012);setPitch(v=>v+dy*.012)}}
      onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}
      onWheel={e=>{e.preventDefault();setZoom(z=>Math.max(.6,Math.min(2.4,z*(e.deltaY<0?1.1:.9))))}}>
      <rect width="720" height="470" className="surface-bg"/>
      {g1.map(v=><polyline key={'a'+v} points={line0(v).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="surface-line xline"/>)}
      {g0.map(v=><polyline key={'b'+v} points={line1(v).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="surface-line yline"/>)}
      <line x1={xAxisNeg.x} y1={xAxisNeg.y} x2={xAxis.x} y2={xAxis.y} className="surface-axis"/>
      <line x1={yAxisNeg.x} y1={yAxisNeg.y} x2={yAxis.x} y2={yAxis.y} className="surface-axis"/>
      <line x1={origin.x} y1={origin.y} x2={zAxis.x} y2={zAxis.y} className="surface-axis"/>
      <text x={xAxis.x+7} y={xAxis.y} className="gd-axis-label">b₀</text><text x={yAxis.x+7} y={yAxis.y} className="gd-axis-label">b₁</text><text x={zAxis.x+7} y={zAxis.y} className="gd-axis-label">log loss</text>
      {b0Ticks.map(v=>{const p=project(v,0,0);return <g key={'lb0'+v}><circle cx={p.x} cy={p.y} r="2" className="surface-tick"/><text x={p.x+5} y={p.y-5} className="surface-tick-label">{Math.abs(v)<1?v.toFixed(2):v}</text></g>})}
      {b1Ticks.map(v=>{const p=project(0,v,0);return <g key={'lb1'+v}><circle cx={p.x} cy={p.y} r="2" className="surface-tick"/><text x={p.x+5} y={p.y-5} className="surface-tick-label">{v}</text></g>})}
      {lossTicks.map(v=>{const p=project(0,0,v);return <g key={'lloss'+v}><circle cx={p.x} cy={p.y} r="2" className="surface-tick"/><text x={p.x+5} y={p.y-5} className="surface-tick-label">{v.toFixed(1)}</text></g>})}
      <polyline points={pts.map(p=>`${p.screen.x},${p.screen.y}`).join(' ')} className="reg-3d-path ghost"/><polyline points={active.map(p=>`${p.screen.x},${p.screen.y}`).join(' ')} className="reg-3d-path active"/>
      {pts.map((p,i)=><circle key={i} cx={p.screen.x} cy={p.screen.y} r={i===currentStep?6:2.5} className={i<=currentStep?'gd-step-dot active':'gd-step-dot'}/>)}
      <circle cx={min.x} cy={min.y} r="6" className="reg-ols-point"/><text x={min.x+9} y={min.y-9} className="gd-label">min log loss</text>
      {current&&<><circle cx={current.screen.x} cy={current.screen.y} r="10" className="gd-current-ring"/><text x={current.screen.x+12} y={current.screen.y-12} className="gd-current-label">step {current.step}</text></>}
    </svg>
    <div className="surface3d-hint">↔ drag to rotate · wheel/trackpad to zoom</div>
  </div>;
}

export function LogisticRegressionPage(){
  const {t}=useLanguage();
  const [featureMode,setFeatureMode]=useState<'raw'|'scaled'>('raw');
  const [lrB0,setLrB0]=useState(1.0);
  const [lrB1,setLrB1]=useState(.001);
  const [scaledLr,setScaledLr]=useState(.6);
  const [steps,setSteps]=useState(300);
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(false);

  const scaled=featureMode==='scaled';
  const clients=useMemo<ClientRow[]>(()=>baseClients.map(r=>({...r,x:scaled?(r.salary-60)/20:r.salary})),[scaled]);

  const trajectory=useMemo(()=>{
    const out:LogStep[]=[];let b0=0,b1=0;
    for(let i=0;i<=steps;i++){
      const loss=calcLoss(clients,b0,b1),{g0,g1}=calcGrad(clients,b0,b1);
      out.push({step:i,b0,b1,loss,g0,g1});
      const eta0=scaled?scaledLr:lrB0;
      const eta1=scaled?scaledLr:lrB1;
      b0-=eta0*g0;b1-=eta1*g1;
    }
    return out;
  },[clients,scaled,scaledLr,lrB0,lrB1,steps]);

  useEffect(()=>{setStep(0);setPlaying(false)},[featureMode,scaledLr,lrB0,lrB1,steps]);
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setStep(s=>{if(s>=trajectory.length-1){setPlaying(false);return s}return s+1}),520);return()=>window.clearInterval(timer)},[playing,trajectory.length]);

  const current=trajectory[Math.min(step,trajectory.length-1)];
  const rows=clients.map(r=>{
    const z=current.b0+current.b1*r.x,p=sigmoid(z);
    const individual=-(r.y*safeLog(p)+(1-r.y)*safeLog(1-p));
    return {...r,z,p,individual};
  });

  return <main className="derivatives-page logreg-page">
    <section className="ml-bridge panel">
      <div><span className="kicker">{t('Machine Learning · Classification')}</span><h1>{t('Logistic Regression')}</h1><p>{t('Linear regression predicted a number. Logistic regression predicts a probability. The bridge is simple: build a linear score, pass it through a sigmoid, then choose b₀ and b₁ so the observed 0/1 outcomes are as likely as possible.')}</p></div>
      <Link className="deriv-action" to="/machine-learning/gradient-descent">{t('Review Gradient Descent')}</Link>
    </section>

    <section className="logreg-flow panel">
      <div><span>01</span><b>x</b><small>{t('feature')}</small></div><i>→</i>
      <div><span>02</span><b>z=b₀+b₁x</b><small>{t('linear score')}</small></div><i>→</i>
      <div><span>03</span><b>σ(z)</b><small>{t('probability')}</small></div><i>→</i>
      <div><span>04</span><b>Log Loss</b><small>{t('fit quality')}</small></div><i>→</i>
      <div><span>05</span><b>Gradient Descent</b><small>{t('update b₀,b₁')}</small></div>
    </section>

    <section className="logreg-mle panel">
      <div><span className="limit-index">01</span><h2>{t('From maximum likelihood to logistic regression')}</h2><p>{t('With a coin, one parameter p explains every toss. In logistic regression each client gets their own probability pᵢ, but all probabilities are generated by the same coefficients b₀ and b₁.')}</p></div>
      <div className="logreg-mle-grid">
        <article><span>{t('Coin example')}</span><code>L(p)=p⁸(1−p)²</code><p>{t('For 8 heads and 2 tails, MLE chooses p=0.8 because that value makes the observed data most likely.')}</p></article>
        <article><span>{t('Logistic regression')}</span><code>pᵢ=σ(b₀+b₁xᵢ)</code><p>{t('Now we choose b₀ and b₁ so that the full set of observed client outcomes becomes as likely as possible.')}</p></article>
      </div>
      <div className="logreg-equivalence"><b>maximize likelihood</b><i>⇔</i><b>maximize log-likelihood</b><i>⇔</i><b>minimize log loss</b></div>
    </section>

    <section className="logreg-feature-mode panel">
      <div>
        <span className="kicker">{t('Feature scale')}</span>
        <h3>{t('Compare raw and scaled salary')}</h3>
      </div>
      <div className="segmented">
        <button className={!scaled?'active':''} onClick={()=>{setFeatureMode('raw');setSteps(300)}}>{t('Raw salary')}</button>
        <button className={scaled?'active':''} onClick={()=>{setFeatureMode('scaled');setSteps(50)}}>{t('Scaled salary')}</button>
      </div>
      <div className="logreg-mode-note">
        <b>{scaled?'x = (salary − 60) / 20':'x = salary'}</b>
        <p>{scaled?t('Same clients and targets, but x becomes −1.5, −0.5, 0.5, 1.5. A single shared learning rate works well because the gradients are now on a similar numerical scale.'):t('x is 30, 50, 70, 90. This is easiest to interpret, but the b₁ gradient is much larger because it is multiplied by salary, so separate step sizes are useful.')}</p>
      </div>
    </section>

    <section className="logreg-data panel">
      <div className="gradient-visual-head"><span>{t('Tiny credit example')}</span><b>{t('4 clients')}</b></div>
      <div className="logreg-client-grid">{clients.map(r=><article key={r.name}><strong>{r.name}</strong><span>{t('Salary')} <b>{r.salary}k</b></span><span>x <b>{r.x.toFixed(1)}</b></span><span>{t('Repaid')} <b>{r.y}</b></span></article>)}</div>
      <p className="limit-note">{scaled?t('Scaled x values: −1.5, −0.5, 0.5, 1.5. Salary itself stays visible in the table.'):t('Here x is the salary itself: 30, 50, 70, 90. We do not rescale or center the feature in this mode.')}</p>
    </section>

    <section className="logreg-separation panel">
      <span className="gradient-step">01.5</span>
      <h3>{t('Why are the outcomes not perfectly separable?')}</h3>
      <p>{t('If the data were 30→0, 50→0, 70→1, 90→1, one threshold between 50 and 70 could classify every client perfectly. Logistic regression could then keep making the sigmoid steeper and steeper: probabilities would move closer to 0,0,1,1 and log loss would keep approaching 0.')}</p>
      <p>{t('In that perfectly separable case, without regularization there is no finite best pair of coefficients: |b₀| and |b₁| can keep growing while the loss keeps improving. So there is no single finite point on the 3D surface where optimization naturally stops.')}</p>
      <p>{t('For this teaching example we intentionally use 30→0, 50→1, 70→0, 90→1. No single threshold can classify all four clients correctly, so the model has to find a compromise. That gives log loss a real finite minimum, which we can show as one point on the 3D surface.')}</p>
    </section>

    <section className="logreg-sigmoid-section">
      <div className="deriv-combo-head"><span className="limit-index">02</span><h2>{t('Sigmoid turns a score into probability')}</h2><p>{t('The linear score z can be any real number. Sigmoid compresses it into 0<p<1, so we can interpret the output as a probability of y=1.')}</p></div>
      <div className="reg-current panel">
        <span>b₀ <b>{current.b0.toFixed(3)}</b></span><span>b₁ <b>{current.b1.toFixed(3)}</b></span><span>log loss <b>{current.loss.toFixed(4)}</b></span><span>∂L/∂b₀ <b>{current.g0.toFixed(3)}</b></span><span>∂L/∂b₁ <b>{current.g1.toFixed(3)}</b></span><span>{t('Iteration')} <b>{current.step}</b></span>
      </div>
      <section className="panel reg-visual"><div className="gradient-visual-head"><span>p=σ(b₀+b₁x)</span><b>{t('Current probability curve')}</b></div><SigmoidPlot b0={current.b0} b1={current.b1} rows={clients} scaled={scaled}/></section>
    </section>

    <section className="logreg-loss-section">
      <div className="deriv-combo-head"><span className="limit-index">03</span><h2>{t('Log loss rewards the right probability')}</h2><p>{t('For y=1 the contribution is −log(p). For y=0 it is −log(1−p). A confident wrong prediction gets a very large penalty.')}</p></div>
      <div className="reg-loss-formulas">
        <div><span>{t('Likelihood')}</span><code>L = ∏ pᵢʸⁱ(1−pᵢ)¹⁻ʸⁱ</code></div>
        <div><span>Log Loss</span><code>−(1/n)Σ[yᵢ log pᵢ +(1−yᵢ)log(1−pᵢ)]</code></div>
      </div>
      <div className="logreg-loss-intuition panel">
        <article><b>y=1</b><span>p=0.9 → {(-Math.log(.9)).toFixed(3)}</span><span>p=0.1 → {(-Math.log(.1)).toFixed(3)}</span></article>
        <article><b>y=0</b><span>p=0.1 → {(-Math.log(.9)).toFixed(3)}</span><span>p=0.9 → {(-Math.log(.1)).toFixed(3)}</span></article>
      </div>
    </section>

    <section className="logreg-train-section">
      <div className="deriv-combo-head"><span className="limit-index">04</span><h2>{t('Now optimize b₀ and b₁')}</h2><p>{t('The dataset is fixed. Gradient descent moves only the model parameters. Every step changes all four probabilities, which changes the total log loss.')}</p></div>
      <div className="gd-controls panel logreg-two-lr">
        {scaled
          ? <label><span>{t('Learning rate')}</span><input type="range" min=".05" max="1.0" step=".05" value={scaledLr} onChange={e=>setScaledLr(+e.target.value)}/><b>{scaledLr.toFixed(2)}</b></label>
          : <><label><span>η₀ · b₀</span><input type="range" min=".05" max="1.2" step=".05" value={lrB0} onChange={e=>setLrB0(+e.target.value)}/><b>{lrB0.toFixed(2)}</b></label>
          <label><span>η₁ · b₁</span><input type="range" min=".0001" max=".0015" step=".0001" value={lrB1} onChange={e=>setLrB1(+e.target.value)}/><b>{lrB1.toFixed(4)}</b></label></>}
        <label><span>{t('Steps')}</span><input type="range" min={scaled?20:50} max={scaled?120:500} step={scaled?5:10} value={steps} onChange={e=>setSteps(+e.target.value)}/><b>{steps}</b></label>
        <div className="gd-actions"><button onClick={()=>setPlaying(v=>!v)}>{playing?t('Pause'):t('Run visualization')}</button><button onClick={()=>{setPlaying(false);setStep(s=>Math.min(s+1,trajectory.length-1))}}>{t('Step forward')}</button><button onClick={()=>{setPlaying(false);setStep(0)}}>{t('Reset')}</button></div>
      </div>
      <div className="logreg-gradient-formula panel"><code>∂L/∂b₀ = (1/n)Σ(pᵢ−yᵢ)</code><code>∂L/∂b₁ = (1/n)Σ(pᵢ−yᵢ)xᵢ</code><strong>{scaled?'b ← b − η∇L':'b₀ ← b₀ − η₀∂L/∂b₀ · b₁ ← b₁ − η₁∂L/∂b₁'}</strong></div>
      <div className="logreg-scale-note panel">
        <b>{scaled?t('Why one learning rate works now?'):t('Why two learning rates here?')}</b>
        <p>{scaled?t('After scaling, x is around −1.5…1.5 instead of 30…90. The gradients for b₀ and b₁ are now much closer in numerical scale, so one shared learning rate can move both parameters efficiently.'):t('Because we kept salary in raw units, the gradient for b₁ is multiplied by x=30…90 and is numerically much larger than the gradient for b₀. One shared learning rate either makes b₁ unstable or makes b₀ move painfully slowly. Using separate step sizes lets us keep the raw salary feature and still see the optimizer reach the same finite minimum.')}</p>
      </div>
      <div className="reg-visual-grid">
        <section className="panel reg-visual"><div className="gradient-visual-head"><span>(b₀,b₁)</span><b>{t('Top view of log loss')}</b></div><LossContour trajectory={trajectory} currentStep={step} rows={clients} scaled={scaled}/></section>
        <section className="panel reg-visual"><div className="gradient-visual-head"><span>L(b₀,b₁)</span><b>{t('3D log-loss surface')}</b></div><LogLoss3D trajectory={trajectory} currentStep={step} rows={clients} scaled={scaled}/></section>
      </div>
    </section>

    <section className="logreg-predictions panel">
      <div className="gd-table-head"><b>{t('What each client contributes right now')}</b><span>{t('The row probabilities and losses update with the animation')}</span></div>
      <div className="gd-table-scroll"><table><thead><tr><th>{t('Client')}</th><th>{t('Salary')}</th><th>x</th><th>y</th><th>z=b₀+b₁x</th><th>p</th><th>{t('individual loss')}</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.name}><td>{r.name}</td><td>{r.salary}k</td><td>{r.x.toFixed(1)}</td><td>{r.y}</td><td>{r.z.toFixed(3)}</td><td>{r.p.toFixed(3)}</td><td>{r.individual.toFixed(4)}</td></tr>)}</tbody></table></div>
    </section>

    <section className="gradient-summary panel logreg-summary">
      <b>{t('The bridge to remember')}</b>
      <p>{t('Logistic regression does not first fit OLS and then transform it. It directly chooses b₀ and b₁. Those coefficients create a linear score z, sigmoid turns z into probabilities, likelihood evaluates how plausible the observed 0/1 outcomes are, and minimizing log loss finds the coefficients that make the data most likely.')}</p>
    </section>
  </main>;
}
