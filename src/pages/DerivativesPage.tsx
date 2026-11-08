import { useMemo, useRef, useState } from 'react';
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


function Surface3D({pointLabel,fn,pointValue,extent,zAxisMax}:{pointLabel:string;fn:(x:number,y:number)=>number;pointValue:[number,number,number];extent:number;zAxisMax:number}){
  const [yaw,setYaw]=useState(-.72);
  const [pitch,setPitch]=useState(.62);
  const [zoom,setZoom]=useState(1);
  const [showLabels,setShowLabels]=useState(true);
  const drag=useRef<{x:number;y:number;yaw:number;pitch:number}|null>(null);
  const project=(x:number,y:number,z:number)=>{
    const zScaled=z;
    const cy=Math.cos(yaw),sy=Math.sin(yaw);
    const x1=x*cy-y*sy;
    const y1=x*sy+y*cy;
    const cp=Math.cos(pitch),sp=Math.sin(pitch);
    const y2=y1*cp-zScaled*sp;
    const z2=y1*sp+zScaled*cp;
    return {x:360+x1*72*zoom,y:235-y2*72*zoom,depth:z2};
  };
  const grid=Array.from({length:11},(_,i)=>-extent+i*(2*extent/10));
  const linePoints=(fixed:number,alongX:boolean)=>Array.from({length:81},(_,i)=>{
    const v=-extent+i*(2*extent)/80;
    const x=alongX?v:fixed,y=alongX?fixed:v,z=fn(x,y);
    return z<=zAxisMax?project(x,y,z):null;
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
      {grid.map(v=>{const pts=linePoints(v,true);const chunks:string[]=[];let cur:string[]=[];pts.forEach(p=>{if(p){cur.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`)}else if(cur.length){chunks.push(cur.join(' '));cur=[]}});if(cur.length)chunks.push(cur.join(' '));return chunks.map((points,i)=><polyline key={'x'+v+'-'+i} points={points} className="surface-line xline"/> )})}
      {grid.map(v=>{const pts=linePoints(v,false);const chunks:string[]=[];let cur:string[]=[];pts.forEach(p=>{if(p){cur.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`)}else if(cur.length){chunks.push(cur.join(' '));cur=[]}});if(cur.length)chunks.push(cur.join(' '));return chunks.map((points,i)=><polyline key={'y'+v+'-'+i} points={points} className="surface-line yline"/> )})}
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

export function DerivativesPage(){
  const {t}=useLanguage();
  const [x0,setX0]=useState(1);
  const [h,setH]=useState(1);
  const [slopeX,setSlopeX]=useState(-1.4);
  const [comboX,setComboX]=useState(-1.4);
  const [maxX,setMaxX]=useState(-1.4);
  const [partialExample,setPartialExample]=useState<1|2>(1);

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
    ? {formula:'z = x² + y²',point:[1,2,5] as [number,number,number],dx:'2x',dy:'2y',dxVal:2,dyVal:4,fn:(x:number,y:number)=>x*x+y*y,extent:4.5,zAxisMax:20}
    : {formula:'z = 3x² + y²',point:[1,4,19] as [number,number,number],dx:'6x',dy:'2y',dxVal:6,dyVal:8,fn:(x:number,y:number)=>3*x*x+y*y,extent:4.5,zAxisMax:20};

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
        </section>
        <section className="partial-surface panel">
          <div className="partial-surface-head"><span>{partial.formula}</span><b>{t('Point')} ({partial.point.join(', ')})</b></div>
          <Surface3D pointLabel={t('Point')+` (${partial.point.join(',')})`} fn={partial.fn} pointValue={partial.point} extent={partial.extent} zAxisMax={partial.zAxisMax}/>
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
  </main>;
}
