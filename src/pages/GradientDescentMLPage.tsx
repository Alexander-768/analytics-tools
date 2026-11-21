import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';

type GdPoint={step:number;x:number;y:number;z:number;gx:number;gy:number};
type RegStep={step:number;b0:number;b1:number;mse:number;rss:number;g0:number;g1:number};

function GDBowl3D({trajectory,currentStep}:{trajectory:GdPoint[];currentStep:number}){
  const [yaw,setYaw]=useState(-.72);
  const [pitch,setPitch]=useState(.62);
  const [zoom,setZoom]=useState(1);
  const drag=useRef<{x:number;y:number}|null>(null);
  const extent=2.5,zScale=.28;
  const project=(x:number,y:number,z:number)=>{
    const zs=z*zScale,cy=Math.cos(yaw),sy=Math.sin(yaw);
    const x1=x*cy-y*sy,y1=x*sy+y*cy,cp=Math.cos(pitch),sp=Math.sin(pitch);
    const y2=y1*cp-zs*sp;
    return {x:360+x1*72*zoom,y:235-y2*72*zoom};
  };
  const grid=Array.from({length:11},(_,i)=>-extent+i*(2*extent/10));
  const linePoints=(fixed:number,alongX:boolean)=>Array.from({length:41},(_,i)=>{
    const v=-extent+i*(2*extent)/40;
    const x=alongX?v:fixed,y=alongX?fixed:v;
    return project(x,y,x*x+y*y);
  });
  const points=trajectory.map(p=>({...p,screen:project(p.x,p.y,p.z)}));
  const active=points.slice(0,currentStep+1);
  const current=points[Math.min(currentStep,points.length-1)];
  const origin=project(0,0,0),xAxis=project(2.7,0,0),yAxis=project(0,2.7,0),zAxis=project(0,0,7);
  return <div className="gd3d-wrap">
    <svg className="gd3d" viewBox="0 0 720 470"
      onPointerDown={e=>{(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY}}}
      onPointerMove={e=>{if(!drag.current)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;drag.current={x:e.clientX,y:e.clientY};setYaw(v=>v+dx*.012);setPitch(v=>v+dy*.012)}}
      onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}
      onWheel={e=>{e.preventDefault();setZoom(z=>Math.max(.6,Math.min(2.4,z*(e.deltaY<0?1.1:.9))))}}>
      <rect width="720" height="470" className="surface-bg"/>
      {grid.map(v=><polyline key={'x'+v} points={linePoints(v,true).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="surface-line xline"/>)}
      {grid.map(v=><polyline key={'y'+v} points={linePoints(v,false).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="surface-line yline"/>)}
      <line x1={origin.x} y1={origin.y} x2={xAxis.x} y2={xAxis.y} className="surface-axis"/>
      <line x1={origin.x} y1={origin.y} x2={yAxis.x} y2={yAxis.y} className="surface-axis"/>
      <line x1={origin.x} y1={origin.y} x2={zAxis.x} y2={zAxis.y} className="surface-axis"/>
      <text x={xAxis.x+7} y={xAxis.y} className="gd-axis-label">x</text>
      <text x={yAxis.x+7} y={yAxis.y} className="gd-axis-label">y</text>
      <text x={zAxis.x+7} y={zAxis.y} className="gd-axis-label">loss</text>
      <polyline points={points.map(p=>`${p.screen.x},${p.screen.y}`).join(' ')} className="gd-path ghost"/>
      <polyline points={active.map(p=>`${p.screen.x},${p.screen.y}`).join(' ')} className="gd-path active"/>
      {points.map((p,i)=><circle key={i} cx={p.screen.x} cy={p.screen.y} r={i===currentStep?6:3} className={i<=currentStep?'gd-step-dot active':'gd-step-dot'}/>)}
      <circle cx={origin.x} cy={origin.y} r="5" className="gd-minimum"/>
      <text x={origin.x+8} y={origin.y-8} className="gd-label">min (0,0)</text>
      {current&&<><circle cx={current.screen.x} cy={current.screen.y} r="10" className="gd-current-ring"/><text x={current.screen.x+12} y={current.screen.y-12} className="gd-current-label">step {current.step}</text></>}
    </svg>
    <div className="surface3d-hint">↔ drag to rotate · wheel/trackpad to zoom</div>
  </div>;
}

function RegressionFit({b0,b1}:{b0:number;b1:number}){
  const W=620,H=390,P=44,xmin=.5,xmax=3.5,ymin=0,ymax=6;
  const sx=(x:number)=>P+(x-xmin)/(xmax-xmin)*(W-P*2);
  const sy=(y:number)=>H-P-(y-ymin)/(ymax-ymin)*(H-P*2);
  const data=[{x:1,y:2},{x:2,y:4},{x:3,y:5}];
  const line=(bb0:number,bb1:number)=>({x1:sx(xmin),y1:sy(bb0+bb1*xmin),x2:sx(xmax),y2:sy(bb0+bb1*xmax)});
  const cur=line(b0,b1),ols=line(2/3,1.5);
  return <svg className="reg-fit-plot" viewBox={`0 0 ${W} ${H}`}>
    <rect width={W} height={H} className="gradient-bg"/>
    {[1,2,3].map(v=><g key={'x'+v}><line x1={sx(v)} y1={sy(ymin)} x2={sx(v)} y2={sy(ymax)} className="gradient-grid"/><text x={sx(v)-3} y={H-18}>{v}</text></g>)}
    {[0,1,2,3,4,5,6].map(v=><g key={'y'+v}><line x1={sx(xmin)} y1={sy(v)} x2={sx(xmax)} y2={sy(v)} className="gradient-grid"/><text x={16} y={sy(v)+3}>{v}</text></g>)}
    <line x1={ols.x1} y1={ols.y1} x2={ols.x2} y2={ols.y2} className="reg-ols-line"/>
    <line x1={cur.x1} y1={cur.y1} x2={cur.x2} y2={cur.y2} className="reg-current-line"/>
    {data.map((p,i)=><g key={i}><circle cx={sx(p.x)} cy={sy(p.y)} r="6" className="reg-data-point"/><text x={sx(p.x)+8} y={sy(p.y)-8}>({p.x},{p.y})</text></g>)}
  </svg>;
}

function RegressionLoss3D({trajectory,currentStep}:{trajectory:RegStep[];currentStep:number}){
  const [yaw,setYaw]=useState(-.72);
  const [pitch,setPitch]=useState(.62);
  const [zoom,setZoom]=useState(1);
  const drag=useRef<{x:number;y:number}|null>(null);
  const loss=(b0:number,b1:number)=>{const xs=[1,2,3],ys=[2,4,5];let rss=0;for(let i=0;i<3;i++){const e=b0+b1*xs[i]-ys[i];rss+=e*e}return rss/3};
  const min=0,max=2.2,paramCenter=1.1,paramScale=2.2,zScale=.22;
  const project=(b0:number,b1:number,z:number)=>{
    const x=(b0-paramCenter)*paramScale,y=(b1-paramCenter)*paramScale,zs=z*zScale;
    const cy=Math.cos(yaw),sy=Math.sin(yaw),x1=x*cy-y*sy,y1=x*sy+y*cy,cp=Math.cos(pitch),sp=Math.sin(pitch);
    const y2=y1*cp-zs*sp;
    return {x:360+x1*75*zoom,y:230-y2*75*zoom};
  };
  const grid=Array.from({length:11},(_,i)=>min+i*(max-min)/10);
  const lineB0=(fixed:number)=>Array.from({length:41},(_,i)=>{const b0=min+i*(max-min)/40;return project(b0,fixed,loss(b0,fixed))});
  const lineB1=(fixed:number)=>Array.from({length:41},(_,i)=>{const b1=min+i*(max-min)/40;return project(fixed,b1,loss(fixed,b1))});
  const points=trajectory.map(p=>({...p,screen:project(p.b0,p.b1,p.mse)}));
  const active=points.slice(0,currentStep+1),current=points[Math.min(currentStep,points.length-1)];
  const origin=project(0,0,0),b0Axis=project(2.2,0,0),b1Axis=project(0,2.2,0),zAxis=project(0,0,30),ols=project(2/3,1.5,loss(2/3,1.5));
  return <div className="reg-loss3d-wrap">
    <svg className="reg-loss3d" viewBox="0 0 720 470"
      onPointerDown={e=>{(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY}}}
      onPointerMove={e=>{if(!drag.current)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;drag.current={x:e.clientX,y:e.clientY};setYaw(v=>v+dx*.012);setPitch(v=>v+dy*.012)}}
      onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}
      onWheel={e=>{e.preventDefault();setZoom(z=>Math.max(.6,Math.min(2.4,z*(e.deltaY<0?1.1:.9))))}}>
      <rect width="720" height="470" className="surface-bg"/>
      {grid.map(v=><polyline key={'a'+v} points={lineB0(v).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="surface-line xline"/>)}
      {grid.map(v=><polyline key={'b'+v} points={lineB1(v).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="surface-line yline"/>)}
      <line x1={origin.x} y1={origin.y} x2={b0Axis.x} y2={b0Axis.y} className="surface-axis"/>
      <line x1={origin.x} y1={origin.y} x2={b1Axis.x} y2={b1Axis.y} className="surface-axis"/>
      <line x1={origin.x} y1={origin.y} x2={zAxis.x} y2={zAxis.y} className="surface-axis"/>
      <text x={b0Axis.x+7} y={b0Axis.y} className="gd-axis-label">b₀</text><text x={b1Axis.x+7} y={b1Axis.y} className="gd-axis-label">b₁</text><text x={zAxis.x+7} y={zAxis.y} className="gd-axis-label">MSE</text>
      {[0,.5,1,1.5,2,2.2].map(v=>{const p=project(v,0,0);return <text key={'t0'+v} x={p.x+4} y={p.y-5} className="surface-tick-label">{v.toFixed(1)}</text>})}
      {[0,.5,1,1.5,2,2.2].map(v=>{const p=project(0,v,0);return <text key={'t1'+v} x={p.x+4} y={p.y-5} className="surface-tick-label">{v.toFixed(1)}</text>})}
      {[0,5,10,15,20,25,30].map(v=>{const p=project(0,0,v);return <text key={'tz'+v} x={p.x+4} y={p.y-5} className="surface-tick-label">{v}</text>})}
      <polyline points={points.map(p=>`${p.screen.x},${p.screen.y}`).join(' ')} className="reg-3d-path ghost"/>
      <polyline points={active.map(p=>`${p.screen.x},${p.screen.y}`).join(' ')} className="reg-3d-path active"/>
      {points.map((p,i)=><circle key={i} cx={p.screen.x} cy={p.screen.y} r={i===currentStep?6:3} className={i<=currentStep?'gd-step-dot active':'gd-step-dot'}/>)}
      <circle cx={ols.x} cy={ols.y} r="6" className="reg-ols-point"/>
      <text x={ols.x+9} y={ols.y-9} className="gd-label">OLS minimum</text>
      {current&&<circle cx={current.screen.x} cy={current.screen.y} r="10" className="gd-current-ring"/>}
    </svg>
    <div className="surface3d-hint">↔ drag to rotate · wheel/trackpad to zoom</div>
  </div>;
}

export function GradientDescentMLPage(){
  const {t}=useLanguage();
  const [lr,setLr]=useState(.1);
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(false);
  const gdTrajectory=useMemo(()=>{
    const out:GdPoint[]=[];let x=1,y=2;
    for(let i=0;i<=15;i++){const z=x*x+y*y,gx=2*x,gy=2*y;out.push({step:i,x,y,z,gx,gy});x-=lr*gx;y-=lr*gy}
    return out;
  },[lr]);
  useEffect(()=>{setStep(0);setPlaying(false)},[lr]);
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setStep(s=>{if(s>=gdTrajectory.length-1){setPlaying(false);return s}return s+1}),600);return()=>window.clearInterval(timer)},[playing,gdTrajectory.length]);
  const gdCurrent=gdTrajectory[Math.min(step,gdTrajectory.length-1)];

  const [regStep,setRegStep]=useState(0);
  const [regPlaying,setRegPlaying]=useState(false);
  const regTrajectory=useMemo(()=>{
    const xs=[1,2,3],ys=[2,4,5],n=3,out:RegStep[]=[];let b0=0,b1=0;
    for(let step=0;step<=35;step++){let rss=0,g0=0,g1=0;for(let i=0;i<n;i++){const e=b0+b1*xs[i]-ys[i];rss+=e*e;g0+=2*e/n;g1+=2*e*xs[i]/n}out.push({step,b0,b1,mse:rss/n,rss,g0,g1});b0-=.05*g0;b1-=.05*g1}
    return out;
  },[]);
  useEffect(()=>{if(!regPlaying)return;const timer=window.setInterval(()=>setRegStep(s=>{if(s>=regTrajectory.length-1){setRegPlaying(false);return s}return s+1}),500);return()=>window.clearInterval(timer)},[regPlaying,regTrajectory.length]);
  const regCurrent=regTrajectory[Math.min(regStep,regTrajectory.length-1)];

  return <main className="derivatives-page ml-page">
    <section className="ml-bridge panel">
      <div>
        <span className="kicker">{t('New branch')}</span>
        <h1>{t('Machine Learning starts from the math we already know')}</h1>
        <p>{t('In Basic Math → Derivatives we studied derivatives, partial derivatives, gradients, and gradient descent as mathematical ideas. Here we keep that foundation and switch the question: how do these ideas train a model?')}</p>
      </div>
      <Link className="deriv-action" to="/basic-math/derivatives">{t('Review derivatives and gradients')}</Link>
    </section>

    <section className="ml-foundation-grid">
      <article className="panel"><span>01</span><b>{t('Derivative')}</b><p>{t('How fast does a function change locally?')}</p></article>
      <article className="panel"><span>02</span><b>{t('Gradient')}</b><p>{t('In which direction does a multivariable function increase fastest?')}</p></article>
      <article className="panel"><span>03</span><b>{t('Gradient Descent')}</b><p>{t('Move against the gradient to reduce a loss function.')}</p></article>
      <article className="panel ml-next"><span>04</span><b>{t('Machine Learning')}</b><p>{t('Treat model parameters as coordinates and optimize them to fit data.')}</p></article>
    </section>

    <section className="gd-section">
      <div className="deriv-core-banner gd-banner"><span>{t('ML optimization')}</span><strong>{t('Gradient Descent')}</strong><p>{t('Same mechanism as before, but now we read it as an optimizer: parameters move to reduce the loss.')}</p></div>
      <div className="deriv-combo-head"><span className="limit-index">01</span><h2>{t('First, keep the simple bowl')}</h2><p>{t('L(x,y)=x²+y² is our clean training ground. It lets us focus only on the update rule before adding a model and real data.')}</p></div>
      <div className="gd-controls panel">
        <label><span>{t('Learning rate')}</span><input type="range" min=".02" max=".9" step=".01" value={lr} onChange={e=>setLr(+e.target.value)}/><b>{lr.toFixed(2)}</b></label>
        <div className="gd-actions"><button onClick={()=>setPlaying(v=>!v)}>{playing?t('Pause'):t('Run visualization')}</button><button onClick={()=>{setPlaying(false);setStep(s=>Math.min(s+1,gdTrajectory.length-1))}}>{t('Step forward')}</button><button onClick={()=>{setPlaying(false);setStep(0)}}>{t('Reset')}</button></div>
      </div>
      <div className="gd-current panel"><span>{t('Iteration')} <b>{gdCurrent.step}</b></span><span>x <b>{gdCurrent.x.toFixed(3)}</b></span><span>y <b>{gdCurrent.y.toFixed(3)}</b></span><span>loss <b>{gdCurrent.z.toFixed(3)}</b></span><strong>∇L = ({gdCurrent.gx.toFixed(2)}, {gdCurrent.gy.toFixed(2)})</strong></div>
      <section className="gd-visual panel"><div className="gradient-visual-head"><span>L(x,y)=x²+y²</span><b>{t('3D descent')}</b></div><GDBowl3D trajectory={gdTrajectory} currentStep={step}/></section>
    </section>

    <section className="reg-gd-section">
      <div className="deriv-core-banner reg-gd-banner"><span>{t('Now add a model')}</span><strong>{t('Linear regression with Gradient Descent')}</strong><p>{t('The optimizer stays the same. What changes is the meaning of the coordinates: now they are the model coefficients b₀ and b₁.')}</p></div>
      <div className="deriv-combo-head"><span className="limit-index">02</span><h2>{t('From a loss surface to model training')}</h2><p>{t('Data are fixed: x=[1,2,3], y=[2,4,5]. We change b₀ and b₁, which changes the fitted line and therefore the MSE.')}</p></div>
      <div className="reg-data-strip panel"><span>x <b>[1,2,3]</b></span><span>y <b>[2,4,5]</b></span><span>{t('Model')} <b>ŷ=b₀+b₁x</b></span><span>OLS <b>b₀≈0.667, b₁=1.5</b></span></div>
      <div className="reg-current panel"><span>{t('Iteration')} <b>{regCurrent.step}</b></span><span>b₀ <b>{regCurrent.b0.toFixed(3)}</b></span><span>b₁ <b>{regCurrent.b1.toFixed(3)}</b></span><span>MSE <b>{regCurrent.mse.toFixed(4)}</b></span><span>∂L/∂b₀ <b>{regCurrent.g0.toFixed(3)}</b></span><span>∂L/∂b₁ <b>{regCurrent.g1.toFixed(3)}</b></span></div>
      <div className="gd-actions ml-reg-actions"><button onClick={()=>setRegPlaying(v=>!v)}>{regPlaying?t('Pause'):t('Run visualization')}</button><button onClick={()=>{setRegPlaying(false);setRegStep(s=>Math.min(s+1,regTrajectory.length-1))}}>{t('Step forward')}</button><button onClick={()=>{setRegPlaying(false);setRegStep(0)}}>{t('Reset')}</button></div>
      <div className="reg-visual-grid">
        <section className="panel reg-visual"><div className="gradient-visual-head"><span>{t('Data space')}</span><b>{t('How the fitted line changes')}</b></div><RegressionFit b0={regCurrent.b0} b1={regCurrent.b1}/></section>
        <section className="panel reg-visual"><div className="gradient-visual-head"><span>L(b₀,b₁)</span><b>{t('3D loss surface')}</b></div><RegressionLoss3D trajectory={regTrajectory} currentStep={regStep}/></section>
      </div>
      <section className="reg-loss-meaning panel">
        <div className="reg-loss-meaning-head"><span className="gradient-step">03</span><div><b>{t('This is where ML begins conceptually')}</b><p>{t('The dataset stays fixed. The model parameters move. The loss measures how bad the current parameters are, and gradient descent tells us how to update them. Training is just repeating this loop.')}</p></div></div>
        <div className="reg-loss-formulas"><div><span>{t('Model')}</span><code>ŷᵢ=b₀+b₁xᵢ</code></div><div><span>{t('Loss')}</span><code>L(b₀,b₁)=(1/n)Σ[yᵢ−(b₀+b₁xᵢ)]²</code></div></div>
      </section>
    </section>
  </main>;
}
