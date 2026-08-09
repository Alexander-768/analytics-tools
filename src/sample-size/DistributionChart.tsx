import { motion } from 'framer-motion';
import type { Alternative } from './math';

type Props={mde:number;se:number;zAlpha:number;alpha:number;beta:number;alternative:Alternative};
export function DistributionChart({mde,se,zAlpha,alpha,beta,alternative}:Props){
  const W=900,H=330,L=54,R=22,T=28,B=48,base=H-B,plotH=210;
  const critical=zAlpha*se; const xmin=Math.min(-4*se,-critical-se),xmax=Math.max(mde+4*se,critical+se); const sx=(x:number)=>L+(x-xmin)/(xmax-xmin)*(W-L-R); const sy=(x:number,mu:number)=>base-Math.exp(-.5*((x-mu)/se)**2)*plotH;
  const points=Array.from({length:181},(_,i)=>xmin+(xmax-xmin)*i/180);
  const curve=(mu:number)=>points.map((x,i)=>`${i?'L':'M'}${sx(x).toFixed(1)},${sy(x,mu).toFixed(1)}`).join(' ');
  const area=(mu:number,keep:(x:number)=>boolean)=>{const p=points.filter(keep);if(!p.length)return'';return `M${sx(p[0])},${base} `+p.map(x=>`L${sx(x)},${sy(x,mu)}`).join(' ')+` L${sx(p[p.length-1])},${base} Z`};
  const betaLow=alternative==='TWO_SIDED'?-critical:xmin;
  return <div className="distribution-wrap"><div className="chart-legend"><span><i className="h0-dot"/>H₀ · no effect</span><span><i className="h1-dot"/>H₁ · MDE</span><span className="chart-formula">SE = {se.toFixed(3)}</span></div><svg className="distribution-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Null and alternative hypothesis distributions">
    <line x1={L} y1={base} x2={W-R} y2={base} className="chart-axis"/>
    <motion.path d={area(0,x=>x>critical)} className="alpha-area" animate={{opacity:.55}}/><motion.path d={area(0,x=>alternative==='TWO_SIDED'&&x<-critical)} className="alpha-area" animate={{opacity:.55}}/>
    <motion.path d={area(mde,x=>x>=betaLow&&x<=critical)} className="beta-area" animate={{opacity:.52}}/>
    <motion.path d={curve(0)} className="h0-curve" animate={{pathLength:1}} initial={{pathLength:0}}/><motion.path d={curve(mde)} className="h1-curve" animate={{pathLength:1}} initial={{pathLength:0}}/>
    {alternative==='TWO_SIDED'&&<><line x1={sx(-critical)} y1={T} x2={sx(-critical)} y2={base} className="critical-line"/><text x={sx(-critical)} y={base+23} textAnchor="middle">−C</text></>}
    <line x1={sx(critical)} y1={T} x2={sx(critical)} y2={base} className="critical-line"/><text x={sx(critical)} y={base+23} textAnchor="middle">C</text>
    <line x1={sx(0)} y1={base-7} x2={sx(0)} y2={base+7} className="mean-tick"/><text x={sx(0)} y={base+23} textAnchor="middle">0</text>
    <line x1={sx(mde)} y1={base-7} x2={sx(mde)} y2={base+7} className="mde-tick"/><text x={sx(mde)} y={base+23} textAnchor="middle">MDE</text>
    <text x={sx(0)} y={sy(0,0)-12} textAnchor="middle" className="h0-label">H₀</text><text x={sx(mde)} y={sy(mde,mde)-12} textAnchor="middle" className="h1-label">H₁</text>
    <text x={sx(critical)+8} y={base-18} className="alpha-label">α {alpha}%</text><text x={sx(critical)-8} y={base-42} textAnchor="end" className="beta-label">β {beta}%</text>
    <line x1={sx(0)} y1={T+8} x2={sx(mde)} y2={T+8} className="mde-arrow"/><text x={(sx(0)+sx(mde))/2} y={T} textAnchor="middle" className="mde-label">MDE = {mde}</text>
  </svg><div className="chart-caption"><span>Shaded blue: type I error (α)</span><span>Shaded amber: type II error (β)</span></div></div>
}
