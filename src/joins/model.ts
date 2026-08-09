export type UserRow = { userId: number; name: string };
export type OrderRow = { orderId: number; userId: number; amount: number };
export type JoinResultRow = UserRow & OrderRow;
export type WorkingJoinKind = 'inner' | 'left' | 'left-only' | 'full' | 'cross';
export type JoinPhase = 'initial' | 'condition' | 'scan' | 'append' | 'no-match' | 'excluded' | 'scan-right' | 'complete';
export type JoinStep = { phase: JoinPhase; title: string; detail: string; userId?: number; checkedOrderIds?: number[]; matchedOrderIds?: number[]; appendOrderId?: number; appendNull?: boolean; appendRightOnly?: boolean; crossEmployee?: string; crossDepartment?: string };

export const users: UserRow[] = [{userId:1,name:'Alice'},{userId:2,name:'Bob'},{userId:3,name:'Charlie'},{userId:4,name:'Diana'}];
export const orders: OrderRow[] = [{orderId:101,userId:1,amount:120},{orderId:102,userId:2,amount:80},{orderId:103,userId:2,amount:140},{orderId:104,userId:5,amount:200}];
export const crossEmployees = ['Alice','Bob','Charlie'];
export const crossDepartments = ['Analytics','Product'];

export function createJoinSteps(kind: WorkingJoinKind): JoinStep[] {
  if (kind === 'cross') {
    const steps: JoinStep[] = [{phase:'initial',title:'Two independent sets',detail:'Start with 3 employees and 2 departments.'},{phase:'condition',title:'No ON condition',detail:'CROSS JOIN creates every possible pair; no matching key is needed.'}];
    crossEmployees.forEach(employee => { steps.push({phase:'scan',crossEmployee:employee,title:`Select ${employee} from Table A`,detail:'Connect this row to every row in Table B.'}); crossDepartments.forEach(department => steps.push({phase:'append',crossEmployee:employee,crossDepartment:department,title:`Create ${employee} × ${department}`,detail:'Append this combination to Result.'})); });
    steps.push({phase:'complete',title:'CROSS JOIN complete',detail:'3 rows × 2 rows = 6 result rows.'}); return steps;
  }
  const label = kind === 'inner' ? 'INNER JOIN' : kind === 'left' ? 'LEFT JOIN' : kind === 'left-only' ? 'LEFT ONLY' : 'FULL OUTER JOIN';
  const steps: JoinStep[] = [{ phase:'initial', title:'Source tables', detail:'Start with users and orders as two independent tables.' },{ phase:'condition', title:'Read the join condition', detail:'Match rows where users.user_id equals orders.user_id.' }];
  users.forEach(user => {
    const matches = orders.filter(order => order.userId === user.userId);
    steps.push({ phase:'scan', userId:user.userId, checkedOrderIds:orders.map(o=>o.orderId), matchedOrderIds:matches.map(o=>o.orderId), title:`Find orders for ${user.name}`, detail:`Search Table B for user_id = ${user.userId}.` });
    if (matches.length) {
      if (kind === 'left-only') steps.push({ phase:'excluded', userId:user.userId, checkedOrderIds:matches.map(o=>o.orderId), matchedOrderIds:matches.map(o=>o.orderId), title:`Match found — exclude ${user.name}`, detail:'LEFT ONLY keeps unmatched rows. This row belongs to the intersection, so it does not enter Result.' });
      else matches.forEach(order => steps.push({ phase:'append', userId:user.userId, checkedOrderIds:[order.orderId], matchedOrderIds:[order.orderId], appendOrderId:order.orderId, title:`Combine ${user.name} + order ${order.orderId}`, detail:`Keys match (${user.userId} = ${order.userId}). Append the combined row to Result.` }));
    }
    else {
      steps.push({ phase:'no-match', userId:user.userId, checkedOrderIds:orders.map(o=>o.orderId), title:`No match for ${user.name}`, detail: kind === 'inner' ? `No order has user_id = ${user.userId}. INNER JOIN excludes this row.` : kind === 'left' ? 'No matching row in Table B. Keep the left row.' : 'No matching row in Table B. This is an A-only row, so keep it.' });
      if (kind !== 'inner') steps.push({ phase:'append', userId:user.userId, appendNull:true, title:`Keep ${user.name}`, detail:kind==='left'?'LEFT JOIN preserves the row and fills right-side columns with NULL.':kind==='full'?'FULL OUTER JOIN keeps this A-only row and fills the right side with NULL.':'Append the unmatched left row to Result.' });
    }
  });
  if (kind === 'full') {
    const matchedOrderIds = new Set(orders.filter(order => users.some(user => user.userId === order.userId)).map(order => order.orderId));
    const rightOnly = orders.filter(order => !matchedOrderIds.has(order.orderId));
    steps.push({ phase:'scan-right', checkedOrderIds:orders.map(o=>o.orderId), matchedOrderIds:rightOnly.map(o=>o.orderId), title:'Find unmatched rows in Table B', detail:'Scan for orders that were never matched while processing Table A.' });
    rightOnly.forEach(order => steps.push({ phase:'append', appendOrderId:order.orderId, appendRightOnly:true, checkedOrderIds:[order.orderId], matchedOrderIds:[order.orderId], title:`Keep order ${order.orderId} from B`, detail:'This B-only row is preserved; Table A columns become NULL.' }));
  }
  steps.push({ phase:'complete', title:`${label} complete`, detail:kind==='inner'?'Only matched combinations appear in the result.':kind==='left'?'Every Table A row appears; missing Table B values are NULL.':kind==='left-only'?'Only Table A rows without a match appear in the result.':'The result contains matches, A-only rows and B-only rows.' });
  return steps;
}

export function crossResultRowsAt(steps:JoinStep[],stepIndex:number){return steps.slice(0,stepIndex+1).filter(step=>step.phase==='append'&&step.crossEmployee&&step.crossDepartment).map(step=>({employee:step.crossEmployee!,department:step.crossDepartment!}))}

export type DisplayResultRow = { userId:number|null; name:string|null; orderId:number|null; amount:number|null };
export function resultRowsAt(steps: JoinStep[], stepIndex: number): DisplayResultRow[] {
  return steps.slice(0, stepIndex + 1).reduce<DisplayResultRow[]>((rows, step) => {
    if (step.phase !== 'append') return rows;
    if (step.appendRightOnly) { const order=orders.find(o=>o.orderId===step.appendOrderId)!; rows.push({userId:null,name:null,orderId:order.orderId,amount:order.amount}); return rows; }
    const user = users.find(u=>u.userId===step.userId)!;
    if (step.appendNull) { rows.push({...user,orderId:null,amount:null}); return rows; }
    const order = orders.find(o=>o.orderId===step.appendOrderId)!;
    rows.push({...user,...order}); return rows;
  }, []);
}
