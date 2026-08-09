export type Alternative = 'TWO_SIDED' | 'ONE_SIDED';
export type SampleSizeInputs = { variance:number; mde:number; alpha:number; power:number; alternative:Alternative };

// Peter J. Acklam's rational approximation of the inverse standard normal CDF.
export function normalQuantile(p:number){
  const a=[-39.6968302866538,220.946098424521,-275.928510446969,138.357751867269,-30.6647980661472,2.50662827745924];
  const b=[-54.4760987982241,161.585836858041,-155.698979859887,66.8013118877197,-13.2806815528857];
  const c=[-.00778489400243029,-.322396458041136,-2.40075827716184,-2.54973253934373,4.37466414146497,2.93816398269878];
  const d=[.00778469570904146,.32246712907004,2.445134137143,3.75440866190742];
  if(p<=0||p>=1)return NaN; const low=.02425,high=1-low; let q:number,r:number;
  if(p<low){q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}
  if(p>high){q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}
  q=p-.5;r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)
}
export function calculateSampleSize(input:SampleSizeInputs){
  const alpha=input.alpha/100,power=input.power/100;
  const zAlpha=normalQuantile(1-(input.alternative==='TWO_SIDED'?alpha/2:alpha));
  const zBeta=normalQuantile(power);
  const raw=2*input.variance*(zAlpha+zBeta)**2/input.mde**2;
  const perGroup=Math.ceil(raw);return {zAlpha,zBeta,beta:100-input.power,perGroup,total:perGroup*2,se:Math.sqrt(2*input.variance/perGroup)};
}
export function validInputs(v:SampleSizeInputs){return v.variance>0&&v.mde>0&&v.alpha>0&&v.alpha<100&&v.power>0&&v.power<100}
