export type UserRow = { userId: number; name: string };
export type OrderRow = { orderId: number; userId: number; amount: number };
export type JoinResultRow = UserRow & OrderRow;
export type WorkingJoinKind = 'inner' | 'left';
export type JoinPhase = 'initial' | 'condition' | 'scan' | 'append' | 'no-match' | 'complete';
export type JoinStep = { phase: JoinPhase; title: string; detail: string; userId?: number; checkedOrderIds?: number[]; matchedOrderIds?: number[]; appendOrderId?: number; appendNull?: boolean };

export const users: UserRow[] = [{userId:1,name:'Alice'},{userId:2,name:'Bob'},{userId:3,name:'Charlie'},{userId:4,name:'Diana'}];
export const orders: OrderRow[] = [{orderId:101,userId:1,amount:120},{orderId:102,userId:2,amount:80},{orderId:103,userId:2,amount:140},{orderId:104,userId:5,amount:200}];

export function createJoinSteps(kind: WorkingJoinKind): JoinStep[] {
  const label = kind === 'inner' ? 'INNER JOIN' : 'LEFT JOIN';
  const steps: JoinStep[] = [{ phase:'initial', title:'Source tables', detail:'Start with users and orders as two independent tables.' },{ phase:'condition', title:'Read the join condition', detail:'Match rows where users.user_id equals orders.user_id.' }];
  users.forEach(user => {
    const matches = orders.filter(order => order.userId === user.userId);
    steps.push({ phase:'scan', userId:user.userId, checkedOrderIds:orders.map(o=>o.orderId), matchedOrderIds:matches.map(o=>o.orderId), title:`Find orders for ${user.name}`, detail:`Search Table B for user_id = ${user.userId}.` });
    if (matches.length) matches.forEach(order => steps.push({ phase:'append', userId:user.userId, checkedOrderIds:[order.orderId], matchedOrderIds:[order.orderId], appendOrderId:order.orderId, title:`Combine ${user.name} + order ${order.orderId}`, detail:`Keys match (${user.userId} = ${order.userId}). Append the combined row to Result.` }));
    else {
      steps.push({ phase:'no-match', userId:user.userId, checkedOrderIds:orders.map(o=>o.orderId), title:`No match for ${user.name}`, detail: kind === 'inner' ? `No order has user_id = ${user.userId}. INNER JOIN excludes this row.` : 'No matching row in Table B. Keep the left row.' });
      if (kind === 'left') steps.push({ phase:'append', userId:user.userId, appendNull:true, title:`Keep ${user.name} with NULLs`, detail:'LEFT JOIN preserves the Table A row and fills the right-side columns with NULL.' });
    }
  });
  steps.push({ phase:'complete', title:`${label} complete`, detail:kind==='inner'?'Only matched combinations appear in the result.':'Every Table A row appears; missing Table B values are NULL.' });
  return steps;
}

export type DisplayResultRow = { userId:number; name:string; orderId:number|null; amount:number|null };
export function resultRowsAt(steps: JoinStep[], stepIndex: number): DisplayResultRow[] {
  return steps.slice(0, stepIndex + 1).reduce<DisplayResultRow[]>((rows, step) => {
    if (step.phase !== 'append') return rows;
    const user = users.find(u=>u.userId===step.userId)!;
    if (step.appendNull) { rows.push({...user,orderId:null,amount:null}); return rows; }
    const order = orders.find(o=>o.orderId===step.appendOrderId)!;
    rows.push({...user,...order}); return rows;
  }, []);
}
