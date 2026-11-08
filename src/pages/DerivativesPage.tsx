import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n';

type Pt={x:number;y:number};
const W=760,H=260,P=34;
const sample=(fn:(x:number)=>number,a:number,b:number,n=180)=>Array.from({length:n+1},(_,i)=>{const x=a+(b-a)*i/n;return{x,y:fn(x)}});
const path=(pts:Pt[],xmin:number,xmax:number,ymin:number,ymax:number)=>{
  const sx=(x:number)=>P+(x-xmin)/(xmax-xmin)*(W-P*2);
  const sy=(y:number)=>H-P-(y-ymin)/(ymax-ymin)*(H-P*2);
  return pts.map((p,i)=>`${i?'L':'M'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ');
};

function Plot({curves,xmin,xmax,ymin,ymax,markers=[],line,lines=[]}:{
  curves:{pts:Pt[];kind?:string}[];xmin:number;xmax:number;ymin:number;ymax:number;
  markers?:{x:number;y:number;label?:string;kind?:string}[];
  line?:{x1:number;y1:number;x2:number;y2:number;kind?:string}; lines?:{x1:number;y1:number;x2:number;y2:number;kind?:string}[];
}){
  const sx=(x:number)=>P+(x-xmin)/(xmax-xmin)*(W-P*2);
  const sy=(y:number)=>H-P-(y-ymin)/(ymax-ymin)*(H-P*2);
  return <svg className="deriv-plot" viewBox={`0 0 ${W} ${H}`}>
    <line x1={P} x2={W-P} y1={sy(0)} y2={sy(0)} className="deriv-axis"/>
    <line x1={sx(0)} x2={sx(0)} y1={P} y2={H-P} className="deriv-axis"/>
    {curves.map((c,i)=><path key={i} d={path(c.pts,xmin,xmax,ymin,ymax)} className={`deriv-curve ${c.kind||'primary'}`}/>)}
    {line&&<line x1={sx(line.x1)} y1={sy(line.y1)} x2={sx(line.x2)} y2={sy(line.y2)} className={`deriv-tangent ${line.kind||''}`}/>} {lines.map((l,i)=><line key={`l-${i}`} x1={sx(l.x1)} y1={sy(l.y1)} x2={sx(l.x2)} y2={sy(l.y2)} className={`deriv-tangent ${l.kind||''}`}/>)}
    {markers.map((m,i)=><g key={i}><circle cx={sx(m.x)} cy={sy(m.y)} r="4.8" className={`deriv-marker ${m.kind||'primary'}`}/>{m.label&&<text x={sx(m.x)+7} y={sy(m.y)-7}>{m.label}</text>}</g>)}
  </svg>;
}

function MiniDerivativePlot({title,formula,value,x,fn,ymin,ymax}:{title:string;formula:string;value:number;x:number;fn:(x:number)=>number;ymin:number;ymax:number}){
  const pts=sample(fn,-2.4,2.4,180);
  return <section className="deriv-mini panel"><div className="deriv-mini-head"><div><span>{title}</span><code>{formula}</code></div><b>{value.toFixed(2)}</b></div><Plot curves={[{pts}]} xmin={-2.4} xmax={2.4} ymin={ymin} ymax={ymax} markers={[{x,y:fn(x),label:`x=${x.toFixed(2)}`}]} /></section>
}


function Surface3D({pointLabel,fn,pointValue,extent,zAxisMax,zScale}:{pointLabel:string;fn:(x:number,y:number)=>number;pointValue:[number,number,number];extent:number;zAxisMax:number;zScale:number}){
  const [yaw,setYaw]=useState(-.72);
  const [pitch,setPitch]=useState(.62);
  const [zoom,setZoom]=useState(1);
  const [showLabels,setShowLabels]=useState(true);
  const drag=useRef<{x:number;y:number;yaw:number;pitch:number}|null>(null);
  const project=(x:number,y:number,z:number)=>{
    const zScaled=z*zScale;
    const cy=Math.cos(yaw),sy=Math.sin(yaw);
    const x1=x*cy-y*sy;
    const y1=x*sy+y*cy;
    const cp=Math.cos(pitch),sp=Math.sin(pitch);
    const y2=y1*cp-zScaled*sp;
    const z2=y1*sp+zScaled*cp;
    return {x:360+x1*72*zoom,y:235-y2*72*zoom,depth:z2};
  };
  const grid=Array.from({length:11},(_,i)=>-extent+i*(2*extent/10));
  const linePoints=(fixed:number,alongX:boolean)=>Array.from({length:41},(_,i)=>{
    const v=-extent+i*(2*extent)/40;
    const x=alongX?v:fixed,y=alongX?fixed:v,z=fn(x,y);
    return project(x,y,z);
  });
  const point=project(pointValue[0],pointValue[1],pointValue[2]);
  const origin=project(0,0,0),xAxis=project(extent*1.1,0,0),yAxis=project(0,extent*1.1,0),zAxis=project(0,0,zAxisMax);
  const axisTick=Math.max(1,Math.round(extent/2));
  const xTicks=[-2,-1,0,1,2].map(v=>v*axisTick).filter(v=>Math.abs(v)<=extent);
  const yTicks=[-2,-1,0,1,2].map(v=>v*axisTick).filter(v=>Math.abs(v)<=extent);
  const zTicks=[0,.25,.5,.75,1].map(v=>Math.round(v*zAxisMax));
  return <div className="surface3d-wrap">
    <svg className="surface3d" viewBox="0 0 720 470"
      onPointerDown={e=>{(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,yaw,pitch}}}
      onPointerMove={e=>{if(!drag.current)return;setYaw(drag.current.yaw+(e.clientX-drag.current.x)*.01);setPitch(drag.current.pitch+(e.clientY-drag.current.y)*.01)}}
      onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}
      onWheel={e=>{e.preventDefault();setZoom(z=>Math.max(.55,Math.min(2.6,z*(e.deltaY<0?1.1:.9))))}}>
      <rect x="0" y="0" width="720" height="470" className="surface-bg"/>
      {grid.map(v=><polyline key={'x'+v} points={linePoints(v,true).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="surface-line xline"/>)}
      {grid.map(v=><polyline key={'y'+v} points={linePoints(v,false).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="surface-line yline"/>)}

      <line x1={origin.x} y1={origin.y} x2={xAxis.x} y2={xAxis.y} className="surface-axis"/>
      <line x1={origin.x} y1={origin.y} x2={yAxis.x} y2={yAxis.y} className="surface-axis"/>
      <line x1={origin.x} y1={origin.y} x2={zAxis.x} y2={zAxis.y} className="surface-axis"/>
      {showLabels&&<>
        <text x={xAxis.x+7} y={xAxis.y}>x</text><text x={yAxis.x+7} y={yAxis.y}>y</text><text x={zAxis.x+7} y={zAxis.y}>z</text>
        {xTicks.map(v=>{const p=project(v,0,0);return <g key={'xt'+v}><circle cx={p.x} cy={p.y} r="2" className="surface-tick"/><text x={p.x+5} y={p.y-5} className="surface-tick-label">{v}</text></g>})}
        {yTicks.map(v=>{const p=project(0,v,0);return <g key={'yt'+v}><circle cx={p.x} cy={p.y} r="2" className="surface-tick"/><text x={p.x+5} y={p.y-5} className="surface-tick-label">{v}</text></g>})}
        {zTicks.map(v=>{const p=project(0,0,v);return <g key={'zt'+v}><circle cx={p.x} cy={p.y} r="2" className="surface-tick"/><text x={p.x+5} y={p.y-5} className="surface-tick-label">{v}</text></g>})}
      </>}
      <circle cx={point.x} cy={point.y} r="7" className="surface-point"/>
      <circle cx={point.x} cy={point.y} r="13" className="surface-point-ring"/>
      <text x={point.x+13} y={point.y-12} className="surface-point-label">{pointLabel}</text>
    </svg>
    <div className="surface3d-hint">↔ {pointLabel.includes('Точка')?'тащи — вращение · колесо/трекпад — масштаб':'drag to rotate · wheel/trackpad to zoom'}</div>
    <div className="surface-label-toggle">
      <span>{pointLabel.includes('Точка')?'Подписи осей':'Axis labels'}</span>
      <button type="button" className={showLabels?'on':''} aria-pressed={showLabels} onClick={()=>setShowLabels(v=>!v)}><i/></button>
    </div>
    <div className="surface-controls">
      <button type="button" onClick={()=>setZoom(z=>Math.max(.55,z/1.18))}>−</button>
      <span>{Math.round(zoom*100)}%</span>
      <button type="button" onClick={()=>setZoom(z=>Math.min(2.6,z*1.18))}>+</button>
      <button type="button" className="surface-reset" onClick={()=>{setYaw(-.72);setPitch(.62);setZoom(1)}}>↺</button>
    </div>
  </div>
}


function GradientContour({angle,mode}:{angle:number;mode:'axes'|'gradient'|'sweep'}){
  const W=720,H=440,P=42,xmin=-3.2,xmax=3.8,ymin=-3.2,ymax=3.8;
  const sx=(x:number)=>P+(x-xmin)/(xmax-xmin)*(W-P*2);
  const sy=(y:number)=>H-P-(y-ymin)/(ymax-ymin)*(H-P*2);
  const p={x:2,y:2};
  const grad={x:12,y:4};
  const gnorm=Math.hypot(grad.x,grad.y);
  const unitGrad={x:grad.x/gnorm,y:grad.y/gnorm};
  const u={x:Math.cos(angle),y:Math.sin(angle)};
  const arrow=(dx:number,dy:number,len:number,cls:string,label:string)=>{
    const n=Math.hypot(dx,dy)||1,ex=p.x+dx/n*len,ey=p.y+dy/n*len;
    return <g className={cls}>
      <line x1={sx(p.x)} y1={sy(p.y)} x2={sx(ex)} y2={sy(ey)} markerEnd="url(#gradArrow)"/>
      <text x={sx(ex)+8} y={sy(ey)-7}>{label}</text>
    </g>;
  };
  const levels=[2,5,10,16,24,34,46];
  return <svg className="gradient-contour" viewBox={`0 0 ${W} ${H}`}>
    <defs><marker id="gradArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
    <rect width={W} height={H} className="gradient-bg"/>
    <line x1={sx(xmin)} y1={sy(0)} x2={sx(xmax)} y2={sy(0)} className="gradient-axis"/>
    <line x1={sx(0)} y1={sy(ymin)} x2={sx(0)} y2={sy(ymax)} className="gradient-axis"/>
    {[-3,-2,-1,0,1,2,3].map(v=><g key={'gx'+v}><line x1={sx(v)} y1={sy(ymin)} x2={sx(v)} y2={sy(ymax)} className="gradient-grid"/><text x={sx(v)+3} y={sy(0)+14}>{v}</text></g>)}
    {[-3,-2,-1,1,2,3].map(v=><g key={'gy'+v}><line x1={sx(xmin)} y1={sy(v)} x2={sx(xmax)} y2={sy(v)} className="gradient-grid"/><text x={sx(0)+5} y={sy(v)-4}>{v}</text></g>)}
    {levels.map(c=>{const rx=Math.sqrt(c/3),ry=Math.sqrt(c);return <ellipse key={c} cx={sx(0)} cy={sy(0)} rx={Math.abs(sx(rx)-sx(0))} ry={Math.abs(sy(ry)-sy(0))} className="gradient-level"/>})}
    <circle cx={sx(p.x)} cy={sy(p.y)} r="6" className="gradient-point"/><text x={sx(p.x)+9} y={sy(p.y)-10} className="gradient-point-label">(2,2)</text>
    {mode==='axes'&&<>{arrow(1,0,1.15,'gradient-arrow x-only','x-only')}{arrow(0,1,1.15,'gradient-arrow y-only','y-only')}</>}
    {mode==='gradient'&&arrow(unitGrad.x,unitGrad.y,1.55,'gradient-arrow best','∇f = (12,4)')}
    {mode==='sweep'&&<>{arrow(u.x,u.y,1.55,'gradient-arrow sweep','u')}{arrow(unitGrad.x,unitGrad.y,1.1,'gradient-arrow ghost','∇f')}</>}
  </svg>;
}

function DirectionDerivativePlot({angle}:{angle:number}){
  const W=720,H=220,P=38;
  const ymin=-13.5,ymax=13.5;
  const sx=(x:number)=>P+x/(Math.PI*2)*(W-P*2);
  const sy=(y:number)=>H-P-(y-ymin)/(ymax-ymin)*(H-P*2);
  const val=(a:number)=>12*Math.cos(a)+4*Math.sin(a);
  const pts=Array.from({length:181},(_,i)=>{const a=i*Math.PI*2/180;return {a,v:val(a)}});
  const d=pts.map((p,i)=>`${i?'L':'M'} ${sx(p.a).toFixed(2)} ${sy(p.v).toFixed(2)}`).join(' ');
  const current=val(angle),max=Math.sqrt(160);
  return <svg className="direction-plot" viewBox={`0 0 ${W} ${H}`}>
    <line x1={P} y1={sy(0)} x2={W-P} y2={sy(0)} className="gradient-axis"/>
    <path d={d} className="direction-curve"/>
    <line x1={sx(angle)} y1={P} x2={sx(angle)} y2={H-P} className="direction-guide"/>
    <circle cx={sx(angle)} cy={sy(current)} r="5" className="direction-dot"/>
    <text x={sx(angle)+8} y={sy(current)-8}>{current.toFixed(2)}</text>
    <text x={sx(Math.atan2(4,12))} y={sy(max)-9} className="direction-max-label">max ≈ {max.toFixed(2)}</text>
  </svg>;
}

export function DerivativesPage(){
  const {t}=useLanguage();
  const [x0,setX0]=useState(1);
  const [h,setH]=useState(1);
  const [slopeX,setSlopeX]=useState(-1.4);
  const [comboX,setComboX]=useState(-1.4);
  const [maxX,setMaxX]=useState(-1.4);
  const [partialExample,setPartialExample]=useState<1|2>(1);
  const [gradientMode,setGradientMode]=useState<'axes'|'gradient'|'sweep'>('axes');
  const [gradientAngle,setGradientAngle]=useState(0);
  const [gradientPlaying,setGradientPlaying]=useState(false);

  const square=useMemo(()=>sample(x=>x*x,-2.5,2.5),[]);
  const cubic=useMemo(()=>sample(x=>x*x*x-3*x,-2.4,2.4),[]);
  const secSlope=((x0+h)**2-x0*x0)/h;
  const tangentSlope=2*x0;
  const f0=x0*x0, f1=(x0+h)**2;
  const secLine={x1:-2.3,y1:f0+secSlope*(-2.3-x0),x2:2.3,y2:f0+secSlope*(2.3-x0)};
  const tangentLine={x1:-2.3,y1:f0+tangentSlope*(-2.3-x0),x2:2.3,y2:f0+tangentSlope*(2.3-x0)};

  const f=(x:number)=>x*x*x-3*x;
  const fp=(x:number)=>3*x*x-3;
  const fpp=(x:number)=>6*x;
  const v1=fp(comboX),v2=fpp(comboX);
  const state=v1>=0?(v2>=0?'grow-fast':'grow-slow'):(v2>=0?'fall-slow':'fall-fast');
  const maxX0=-1;
  const maxF=f;
  const maxFp=fp;
  const maxFpp=fpp;
  const stateLabel:Record<string,string>={
    'grow-slow':t('Growing, but slowing down'),
    'grow-fast':t('Growing and accelerating'),
    'fall-fast':t('Falling and accelerating'),
    'fall-slow':t('Falling, but slowing down')
  };
  const partial=partialExample===1
    ? {formula:'z = x² + y²',point:[1,2,5] as [number,number,number],dx:'2x',dy:'2y',dxVal:2,dyVal:4,fn:(x:number,y:number)=>x*x+y*y,extent:2.5,zAxisMax:8,zScale:.28}
    : {formula:'z = 3x² + y²',point:[1,4,19] as [number,number,number],dx:'6x',dy:'2y',dxVal:6,dyVal:8,fn:(x:number,y:number)=>3*x*x+y*y,extent:4.5,zAxisMax:80,zScale:.035};
  const gradientValue=12*Math.cos(gradientAngle)+4*Math.sin(gradientAngle);
  const gradientBestAngle=Math.atan2(4,12);
  useEffect(()=>{
    if(!gradientPlaying)return;
    let frame=0,last=performance.now();
    const tick=(now:number)=>{
      if(now-last>30){setGradientAngle(a=>(a+.025)%(Math.PI*2));last=now}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[gradientPlaying]);

  return <main className="derivatives-page">
    <section className="derivatives-hero">
      <div><span className="kicker">{t('Basic Math · Interactive lab')}</span><h1>{t('Derivatives')}</h1><p>{t('See how the slope of a function changes and how the first and second derivatives work together.')}</p></div>
    </section>

    <section className="deriv-lab panel">
      <div className="deriv-copy"><span className="limit-index">01</span><h2>{t('What is a derivative?')}</h2><p>{t('A derivative is the limit of secant slopes as h approaches 0.')}</p>
        <div className="deriv-formula">f′(x₀) = lim<sub>h→0</sub> [f(x₀+h)−f(x₀)] / h</div>
        <label><span>x₀</span><input type="range" min="-1.8" max="1.8" step=".05" value={x0} onChange={e=>setX0(+e.target.value)}/><b>{x0.toFixed(2)}</b></label>
        <label><span>h</span><input type="range" min=".05" max="2" step=".05" value={h} onChange={e=>setH(+e.target.value)}/><b>{h.toFixed(2)}</b></label>
        <div className="deriv-stats"><span>{t('Secant slope')} <b>{secSlope.toFixed(3)}</b></span><span>{t('Tangent slope')} <b>{tangentSlope.toFixed(3)}</b></span></div>
        <button className="deriv-action" onClick={()=>setH(.05)}>{t('Make h very small')}</button>
        <p className="limit-note">{t('As h approaches 0, the secant slope approaches the tangent slope.')}</p>
      </div>
      <div className="deriv-viz"><Plot curves={[{pts:square}]} xmin={-2.5} xmax={2.5} ymin={-1} ymax={6.5} lines={[{...secLine,kind:'secant'},{...tangentLine,kind:'tangent'}]} markers={[{x:x0,y:f0,label:'x₀'},{x:x0+h,y:f1,label:'x₀+h',kind:'accent'}]}/></div>
    </section>

    <section className="deriv-lab panel">
      <div className="deriv-copy"><span className="limit-index">02</span><h2>{t('The first derivative shows the slope')}</h2><p>{t('Move along the curve and watch the tangent change direction and steepness.')}</p>
        <input type="range" min="-2.2" max="2.2" step=".02" value={slopeX} onChange={e=>setSlopeX(+e.target.value)}/>
        <div className="deriv-stats"><span>x <b>{slopeX.toFixed(2)}</b></span><span>f′(x) <b>{fp(slopeX).toFixed(2)}</b></span></div>
        <div className={`deriv-state ${fp(slopeX)>=0?'positive':'negative'}`}>{fp(slopeX)>0?t('The function is increasing'):fp(slopeX)<0?t('The function is decreasing'):t('The tangent is horizontal')}</div>
      </div>
      <div className="deriv-viz"><Plot curves={[{pts:cubic}]} xmin={-2.4} xmax={2.4} ymin={-5} ymax={5} markers={[{x:slopeX,y:f(slopeX),label:`f′=${fp(slopeX).toFixed(2)}`}]} line={{x1:slopeX-.8,y1:f(slopeX)+fp(slopeX)*(-.8),x2:slopeX+.8,y2:f(slopeX)+fp(slopeX)*(.8)}}/></div>
    </section>

    <section className="deriv-combo">
      <div className="deriv-core-banner">
        <span>{t('Core intuition')}</span>
        <strong>{t('How to read the first and second derivatives together')}</strong>
        <p>{t('This is the central idea: the first derivative tells you the direction, the second tells you how the slope is changing.')}</p>
      </div>
      <div className="deriv-combo-head"><span className="limit-index">03</span><h2>{t('How to read the first and second derivatives together')}</h2><p>{t('The first derivative tells you where the function is going. The second derivative tells you how the slope itself is changing.')}</p></div>
      <input className="combo-slider" type="range" min="-2.2" max="2.2" step=".02" value={comboX} onChange={e=>setComboX(+e.target.value)}/>
      <div className="deriv-current panel"><span>x <b>{comboX.toFixed(2)}</b></span><span>f(x) <b>{f(comboX).toFixed(2)}</b></span><span>f′(x) <b>{v1.toFixed(2)}</b></span><span>f″(x) <b>{v2.toFixed(2)}</b></span><strong>{stateLabel[state]}</strong></div>

      <div className="deriv-triple">
        <MiniDerivativePlot title="f(x)" formula="x³ − 3x" value={f(comboX)} x={comboX} fn={f} ymin={-5} ymax={5}/>
        <MiniDerivativePlot title="f′(x)" formula="3x² − 3" value={v1} x={comboX} fn={fp} ymin={-4} ymax={14}/>
        <MiniDerivativePlot title="f″(x)" formula="6x" value={v2} x={comboX} fn={fpp} ymin={-15} ymax={15}/>
      </div>

      <section className="deriv-matrix panel">
        <div className="matrix-corner"></div><div className="matrix-head">f″ &lt; 0</div><div className="matrix-head">f″ &gt; 0</div>
        <div className="matrix-side">f′ &gt; 0</div>
        <div className={`matrix-cell ${state==='grow-slow'?'active':''}`}><b>{t('Growing, but slowing down')}</b><span>{t('Slope is positive, but decreasing.')}</span></div>
        <div className={`matrix-cell ${state==='grow-fast'?'active':''}`}><b>{t('Growing and accelerating')}</b><span>{t('Slope is positive and increasing.')}</span></div>
        <div className="matrix-side">f′ &lt; 0</div>
        <div className={`matrix-cell ${state==='fall-fast'?'active':''}`}><b>{t('Falling and accelerating')}</b><span>{t('Slope is negative and becoming more negative.')}</span></div>
        <div className={`matrix-cell ${state==='fall-slow'?'active':''}`}><b>{t('Falling, but slowing down')}</b><span>{t('Slope is negative, but becoming less negative.')}</span></div>
      </section>

      <section className="deriv-examples panel">
        <div><b>f′(x)=5, f″(x)=−2</b><p>{t('The function is increasing, but its slope is getting smaller — so the growth is slowing down.')}</p></div>
        <div><b>f′(x)=−5, f″(x)=+2</b><p>{t('The function is decreasing, but the slope becomes less negative — so the decline is slowing down.')}</p></div>
      </section>
    </section>

    <section className="deriv-maximum">
      <div className="deriv-combo-head"><span className="limit-index">04</span><h2>{t('Why does f′(x₀)=0 and f″(x₀)<0 mean a local maximum?')}</h2><p>{t('A negative second derivative alone does not mean the original function is decreasing. It means the first derivative is decreasing.')}</p></div>

      <section className="maximum-logic panel">
        <div className="maximum-condition"><span>f′(x₀)=0</span><span>f″(x₀)&lt;0</span></div>
        <p>{t('At x₀ the slope is zero. Because the slope is decreasing, it passes through zero from positive to negative.')}</p>
        <div className="sign-flow">
          <div><b>f′ &gt; 0</b><span>{t('increasing')}</span></div>
          <i>→</i>
          <div className="peak"><b>f′ = 0</b><span>{t('top')}</span></div>
          <i>→</i>
          <div><b>f′ &lt; 0</b><span>{t('decreasing')}</span></div>
        </div>
        <strong>{t('So the function rises before x₀ and falls after x₀ — that is exactly a local maximum.')}</strong>
      </section>

      <input className="combo-slider" type="range" min="-1.8" max="-0.2" step=".02" value={maxX} onChange={e=>setMaxX(+e.target.value)}/>
      <div className="deriv-current panel maximum-current"><span>x <b>{maxX.toFixed(2)}</b></span><span>f(x) <b>{maxF(maxX).toFixed(2)}</b></span><span>f′(x) <b>{maxFp(maxX).toFixed(2)}</b></span><span>f″(x) <b>{maxFpp(maxX).toFixed(2)}</b></span><strong>{maxX<maxX0-.02?t('Before x₀: the function is increasing'):maxX>maxX0+.02?t('After x₀: the function is decreasing'):t('At x₀: horizontal tangent, local maximum')}</strong></div>

      <div className="deriv-triple maximum-triple">
        <section className="deriv-mini panel"><div className="deriv-mini-head"><div><span>f(x)</span><code>x³ − 3x</code></div><b>{maxF(maxX).toFixed(2)}</b></div><Plot curves={[{pts:sample(maxF,-2.4,2.4)}]} xmin={-2.4} xmax={2.4} ymin={-5} ymax={5} markers={[{x:maxX,y:maxF(maxX),label:`x=${maxX.toFixed(2)}`},{x:maxX0,y:maxF(maxX0),label:'x₀ = −1',kind:'accent'}]}/></section>
        <section className="deriv-mini panel"><div className="deriv-mini-head"><div><span>f′(x)</span><code>3x² − 3</code></div><b>{maxFp(maxX).toFixed(2)}</b></div><Plot curves={[{pts:sample(maxFp,-2.4,2.4)}]} xmin={-2.4} xmax={2.4} ymin={-4} ymax={14} markers={[{x:maxX,y:maxFp(maxX),label:`f′=${maxFp(maxX).toFixed(2)}`},{x:maxX0,y:0,label:'f′(−1)=0',kind:'accent'}]}/></section>
        <section className="deriv-mini panel"><div className="deriv-mini-head"><div><span>f″(x)</span><code>6x</code></div><b>{maxFpp(maxX).toFixed(2)}</b></div><Plot curves={[{pts:sample(maxFpp,-2.4,2.4)}]} xmin={-2.4} xmax={2.4} ymin={-15} ymax={15} markers={[{x:maxX,y:maxFpp(maxX),label:`f″=${maxFpp(maxX).toFixed(2)}`},{x:maxX0,y:maxFpp(maxX0),label:'f″(−1)=−6',kind:'accent'}]}/></section>
      </div>

      <section className="maximum-note panel">
        <b>{t('Key idea')}</b>
        <p>{t('f″(x₀)<0 does not directly say “the function decreases”. It says the slope f′ is decreasing near x₀. If that decreasing slope is exactly 0 at x₀, then just before x₀ it is positive and just after x₀ it is negative.')}</p>
        <code>f′&gt;0 → f′=0 → f′&lt;0</code>
      </section>
    </section>

    <section className="partial-section">
      <div className="deriv-core-banner partial-banner">
        <span>{t('New dimension')}</span>
        <strong>{t('Partial derivatives')}</strong>
        <p>{t('Now the function has two inputs. A partial derivative asks: what happens to z if I change only one of them?')}</p>
      </div>

      <div className="partial-example-switch segmented">
        <button className={partialExample===1?'active':''} onClick={()=>setPartialExample(1)}>{t('Example 1')} · x² + y²</button>
        <button className={partialExample===2?'active':''} onClick={()=>setPartialExample(2)}>{t('Example 2')} · 3x² + y²</button>
      </div>

      <div className="partial-grid">
        <section className="partial-copy panel">
          <span className="limit-index">05</span>
          <h2>{t('One surface, two directions')}</h2>
          <p>{partialExample===1?t('For z = f(x,y) = x² + y², keep one variable fixed and move only along the other direction.'):t('For z = f(x,y) = 3x² + y², compare the local effect of the same tiny step in x and y.')}</p>
          <div className="partial-formula"><code>{partial.formula}</code><span>∂f/∂x = {partial.dx}</span><span>∂f/∂y = {partial.dy}</span></div>
          <div className="partial-point-values"><span>x <b>{partial.point[0]}</b></span><span>y <b>{partial.point[1]}</b></span><span>z <b>{partial.point[2]}</b></span></div>
          <div className="partial-point-values derivatives"><span>∂f/∂x <b>{partial.dxVal}</b></span><span>∂f/∂y <b>{partial.dyVal}</b></span></div>
          <p className="limit-note">{partialExample===1?t('At (1,2), the surface is locally about twice as steep in the y direction as in the x direction.'):t('At (1,4), changing y a little has a larger local impact on z than changing x by the same amount: 8 versus 6.')}</p>
          {partialExample===2&&<div className="partial-sensitivity-note">
            <b>{t('Think of 6x and 2y as a local sensitivity map')}</b>
            <p>{t('They do not say that the function is always more sensitive to x or always more sensitive to y. In any point (x,y), plug in the current x and y and you immediately see how strongly z reacts right there to a tiny move in each direction.')}</p>
          </div>}
        </section>
        <section className="partial-surface panel">
          <div className="partial-surface-head"><span>{partial.formula}</span><b>{t('Point')} ({partial.point.join(', ')})</b></div>
          <Surface3D pointLabel={t('Point')+` (${partial.point.join(',')})`} fn={partial.fn} pointValue={partial.point} extent={partial.extent} zAxisMax={partial.zAxisMax} zScale={partial.zScale}/>
        </section>
      </div>

      <section className="partial-explain panel">
        <div className="partial-explain-head"><span>{t('Local meaning')}</span><h3>{t('A partial derivative is the local rate of change in one chosen direction.')}</h3></div>
        <div className="partial-cards">
          <article>
            <span className="partial-tag">x</span>
            <h4>{t('Change x a little, keep y fixed')}</h4>
            <div className="partial-equation">Δz ≈ (∂f/∂x) · Δx</div>
            <p>{partialExample===1?t('At (1,2), ∂f/∂x = 2. If Δx = 0.01, then'):t('At (1,4), ∂f/∂x = 6. If Δx = 0.01, then')}</p>
            <strong>Δz ≈ {partial.dxVal} · 0.01 = {(partial.dxVal*.01).toFixed(2)}</strong>
            <small>{partialExample===1?t('So a tiny increase in x raises z by about 0.02.'):t('So a tiny increase in x raises z by about 0.06.')}</small>
          </article>
          <article>
            <span className="partial-tag">y</span>
            <h4>{t('Change y a little, keep x fixed')}</h4>
            <div className="partial-equation">Δz ≈ (∂f/∂y) · Δy</div>
            <p>{partialExample===1?t('At (1,2), ∂f/∂y = 4. If Δy = 0.01, then'):t('At (1,4), ∂f/∂y = 8. If Δy = 0.01, then')}</p>
            <strong>Δz ≈ {partial.dyVal} · 0.01 = {(partial.dyVal*.01).toFixed(2)}</strong>
            <small>{partialExample===1?t('So the same tiny increase in y raises z by about 0.04.'):t('So the same tiny increase in y raises z by about 0.08.')}</small>
          </article>
        </div>
        <div className="partial-summary">
          <b>{t('The intuition')}</b>
          <p>{partialExample===1?t('∂f/∂x tells how fast z changes when only x moves. ∂f/∂y tells how fast z changes when only y moves. Multiplying that local rate by a tiny step gives the approximate change in z.'):t('Here ∂f/∂x = 6 and ∂f/∂y = 8. So for the same tiny step, changing y produces the larger increase in z.')}</p>
        </div>
      </section>
    </section>

    <section className="gradient-section">
      <div className="deriv-core-banner gradient-banner">
        <span>{t('Next step')}</span>
        <strong>{t('Gradient: the direction of maximum increase')}</strong>
        <p>{t('Partial derivatives tell us how profitable each coordinate is locally. The gradient combines them and tells us how to move all arguments together for the fastest local growth.')}</p>
      </div>

      <div className="deriv-combo-head">
        <span className="limit-index">06</span>
        <h2>{t('If both x and y can move, where should we go?')}</h2>
        <p>{t('Use f(x,y)=3x²+y² at the point (2,2). Here ∂f/∂x=12 and ∂f/∂y=4.')}</p>
      </div>

      <div className="gradient-values panel">
        <span>x <b>2</b></span><span>y <b>2</b></span><span>f(x,y) <b>16</b></span><span>∂f/∂x <b>12</b></span><span>∂f/∂y <b>4</b></span><strong>∇f = (12,4)</strong>
      </div>

      <div className="gradient-modes segmented">
        <button className={gradientMode==='axes'?'active':''} onClick={()=>{setGradientMode('axes');setGradientPlaying(false)}}>{t('1 · One axis at a time')}</button>
        <button className={gradientMode==='gradient'?'active':''} onClick={()=>{setGradientMode('gradient');setGradientPlaying(false)}}>{t('2 · Gradient')}</button>
        <button className={gradientMode==='sweep'?'active':''} onClick={()=>setGradientMode('sweep')}>{t('3 · Try every direction')}</button>
      </div>

      <div className="gradient-grid-layout">
        <section className="gradient-visual panel">
          <div className="gradient-visual-head"><span>f(x,y)=3x²+y²</span><b>{t('Contour map')}</b></div>
          <GradientContour angle={gradientAngle} mode={gradientMode}/>
          <a className="deriv-action gradient-3d-link" href="https://www.desmos.com/3d/rzzz43e9pk" target="_blank" rel="noreferrer">{t('How it looks in 3D')}</a>
        </section>
        <section className="gradient-explain panel">
          {gradientMode==='axes'&&<>
            <span className="gradient-step">01</span><h3>{t('First, imagine that only one coordinate can move')}</h3>
            <p>{t('If we can move only x, choose x: the local growth rate is 12, while along y it is only 4.')}</p>
            <div className="gradient-mini"><b>x-only</b><span>rate = 12</span></div><div className="gradient-mini"><b>y-only</b><span>rate = 4</span></div>
          </>}
          {gradientMode==='gradient'&&<>
            <span className="gradient-step">02</span><h3>{t('Now allow both coordinates to move')}</h3>
            <p>{t('We no longer have to spend the whole move on x or y. We combine both local sensitivities: more movement in x because 12 is larger, but some movement in y because 4 is still positive.')}</p>
            <div className="gradient-formula">∇f(2,2) = (12,4)</div>
            <p className="gradient-emphasis">{t('The gradient is a local compass: it points in the direction where the whole function increases fastest.')}</p>
          </>}
          {gradientMode==='sweep'&&<>
            <span className="gradient-step">03</span><h3>{t('Check every possible direction')}</h3>
            <p>{t('Rotate the direction u. Its growth rate is the directional derivative Dᵤf = ∇f · u. The maximum appears when u points in the same direction as the gradient.')}</p>
            <div className="gradient-speed"><span>{t('Current growth rate')}</span><b>{gradientValue.toFixed(2)}</b></div>
            <div className="gradient-speed"><span>{t('Best possible rate')}</span><b>{Math.sqrt(160).toFixed(2)}</b></div>
            <p className={Math.abs(((gradientAngle-gradientBestAngle+Math.PI)%(2*Math.PI))-Math.PI)<.08?'gradient-hit':''}>{t('Maximum when u is aligned with ∇f.')}</p>
          </>}
        </section>
      </div>

      {gradientMode==='sweep'&&<section className="direction-panel panel">
        <div className="direction-head">
          <div><b>{t('Directional derivative')}</b><span>Dᵤf = 12 cos θ + 4 sin θ</span></div>
          <div className="direction-actions">
            <button onClick={()=>setGradientPlaying(v=>!v)}>{gradientPlaying?t('Pause'):t('Run visualization')}</button>
            <button onClick={()=>{setGradientPlaying(false);setGradientAngle(gradientBestAngle)}}>{t('Show maximum')}</button>
            <button onClick={()=>{setGradientPlaying(false);setGradientAngle(0)}}>{t('Reset')}</button>
          </div>
        </div>
        <input type="range" min="0" max={Math.PI*2} step=".01" value={gradientAngle} onChange={e=>{setGradientPlaying(false);setGradientAngle(+e.target.value)}}/>
        <div className="direction-meta"><span>θ = {(gradientAngle*180/Math.PI).toFixed(0)}°</span><span>u = ({Math.cos(gradientAngle).toFixed(2)}, {Math.sin(gradientAngle).toFixed(2)})</span><span>Dᵤf = {gradientValue.toFixed(2)}</span></div>
        <DirectionDerivativePlot angle={gradientAngle}/>
      </section>}

      <section className="gradient-summary panel">
        <b>{t('Simple intuition')}</b>
        <p>{t('At one point, the partial derivatives are just two local speeds: 12 along x and 4 along y. If only one axis is allowed, x wins. If both are allowed, the best move uses both — in the ratio 12:4. That direction is the gradient.')}</p>
      </section>
    </section>
  </main>;
}
