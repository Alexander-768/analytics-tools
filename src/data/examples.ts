import type { Employee, ExampleId, VisualizationExample, VisualizationStep } from '../types';

export const employees: Employee[] = [
  { id: 'alice', employee: 'Alice', department: 'Analytics', salary: 100 },
  { id: 'bob', employee: 'Bob', department: 'Analytics', salary: 120 },
  { id: 'charlie', employee: 'Charlie', department: 'Product', salary: 90 },
  { id: 'diana', employee: 'Diana', department: 'Product', salary: 150 },
  { id: 'eric', employee: 'Eric', department: 'Product', salary: 110 },
  { id: 'frank', employee: 'Frank', department: 'Analytics', salary: 140 },
];

export const sortedEmployees = [...employees].sort((a, b) =>
  a.department.localeCompare(b.department) || a.salary - b.salary,
);

const runningResults = Object.fromEntries(
  sortedEmployees.map((row, index, all) => [
    row.id,
    all.filter(r => r.department === row.department && r.salary <= row.salary)
      .reduce((sum, r) => sum + r.salary, 0),
  ]),
);

const calcSteps: VisualizationStep[] = sortedEmployees.map((row) => {
  const frame = sortedEmployees.filter(
    item => item.department === row.department && item.salary <= row.salary,
  );
  const values = frame.map(item => item.salary);
  return {
    phase: 'calculate', rowId: row.id, partition: row.department,
    frameIds: frame.map(item => item.id), resultIds: [row.id], values,
    result: values.reduce((a, b) => a + b, 0),
    title: `Calculate window for ${row.employee}`,
    description: `The frame grows from the start of ${row.department} to the current row.`,
  };
});

const runningSteps: VisualizationStep[] = [
  { phase: 'initial', title: 'Ready to visualize', description: 'Start with the source rows in their original order.' },
  { phase: 'partition', title: 'Split rows by department', description: 'The function now works independently inside each partition.' },
  { phase: 'sort', title: 'Order rows by salary', description: 'Rows are sorted by salary inside each department.' },
  ...calcSteps,
  { phase: 'complete', title: 'Visualization complete', description: 'Every row now contains its running salary.' },
];

const countResults = Object.fromEntries(employees.map(row => [
  row.id,
  new Set(employees.filter(item => item.department === row.department).map(item => item.id)).size,
]));

const countSteps: VisualizationStep[] = [
  { phase: 'initial', title: 'Ready to visualize', description: 'Start with the source rows in their original order.' },
  { phase: 'partition', title: 'Split rows by department', description: 'PARTITION BY creates two independent groups. There is no ordering step.' },
  ...(['Analytics', 'Product'] as const).map((department): VisualizationStep => {
    const frame = employees.filter(row => row.department === department);
    return {
      phase: 'calculate', partition: department, frameIds: frame.map(row => row.id), resultIds: frame.map(row => row.id),
      result: frame.length, equation: `COUNT(DISTINCT id) = ${frame.length}`,
      title: `Count the ${department} partition`,
      description: `Every row sees the same full partition, so all ${department} rows receive the same result.`,
    };
  }),
  { phase: 'complete', title: 'Visualization complete', description: 'Each row contains the size of its department. No running accumulation occurs.' },
];

const rankingEmployees: Employee[] = [
  { id: 'alice', employee: 'Alice', department: 'Analytics', salary: 100 },
  { id: 'bob', employee: 'Bob', department: 'Analytics', salary: 120 },
  { id: 'charlie', employee: 'Charlie', department: 'Product', salary: 90 },
  { id: 'kate', employee: 'Kate', department: 'Analytics', salary: 150 },
  { id: 'diana', employee: 'Diana', department: 'Product', salary: 130 },
  { id: 'frank', employee: 'Frank', department: 'Analytics', salary: 120 },
  { id: 'eric', employee: 'Eric', department: 'Product', salary: 110 },
  { id: 'grace', employee: 'Grace', department: 'Product', salary: 110 },
];
const rankingSorted = [...rankingEmployees].sort((a, b) => a.department.localeCompare(b.department) || a.salary - b.salary);

function makeRanking(kind: 'row-number' | 'rank' | 'dense-rank'): VisualizationExample {
  const name = kind === 'row-number' ? 'ROW_NUMBER()' : kind === 'rank' ? 'RANK()' : 'DENSE_RANK()';
  const results: Record<string, number> = {};
  for (const department of ['Analytics', 'Product'] as const) {
    const partition = rankingSorted.filter(row => row.department === department);
    partition.forEach((row, index) => {
      results[row.id] = kind === 'row-number' ? index + 1
        : kind === 'rank' ? partition.findIndex(item => item.salary === row.salary) + 1
        : [...new Set(partition.map(item => item.salary))].indexOf(row.salary) + 1;
    });
  }
  const calc: VisualizationStep[] = rankingSorted.map(row => {
    const peers = rankingSorted.filter(item => item.department === row.department && item.salary === row.salary);
    const tied = peers.length > 1;
    const rank = results[row.id];
    const detail = kind === 'row-number'
      ? (tied ? `Salary ${row.salary} is tied, but ROW_NUMBER still assigns a unique sequential number.` : 'ROW_NUMBER assigns the next sequential position.')
      : tied ? `Salary ${row.salary} is tied, so all peer rows share rank ${rank}.`
      : kind === 'rank' && rank > 1 ? `RANK preserves gaps after ties; this row receives rank ${rank}.` : `The next distinct salary receives rank ${rank}.`;
    return { phase: 'calculate', rowId: row.id, partition: row.department, frameIds: peers.map(item => item.id), resultIds: [row.id], result: rank, equation: `${name} → ${rank}`, title: `Assign ${name} to ${row.employee}`, description: detail };
  });
  const steps: VisualizationStep[] = [
    { phase: 'initial', title: 'Ready to rank', description: 'Start with the shared ranking dataset in its original order.' },
    { phase: 'partition', title: 'Split rows by department', description: 'Ranking restarts independently inside each department.' },
    { phase: 'sort', title: 'Order rows by salary', description: 'Notice the equal salary values: peer rows stay next to each other.' },
    ...calc,
    { phase: 'complete', title: `${name} complete`, description: kind === 'row-number' ? 'Every row has a unique sequential number.' : kind === 'rank' ? 'Ties share a rank and leave a gap afterward.' : 'Ties share a rank without leaving gaps.' },
  ];
  return { id: kind, name, detail: 'PARTITION BY + ORDER BY', steps, results, resultLabel: name.replace('()', '').replace('_', ' '), sorted: true, rows: rankingEmployees, sortedRows: rankingSorted };
}

const offsetEmployees: Employee[] = [
  { id: 'alice', employee: 'Alice', department: 'Analytics', salary: 100 },
  { id: 'bob', employee: 'Bob', department: 'Analytics', salary: 120 },
  { id: 'charlie', employee: 'Charlie', department: 'Product', salary: 90 },
  { id: 'diana', employee: 'Diana', department: 'Product', salary: 150 },
  { id: 'eric', employee: 'Eric', department: 'Product', salary: 110 },
  { id: 'frank', employee: 'Frank', department: 'Analytics', salary: 140 },
];
const offsetSorted = [...offsetEmployees].sort((a, b) => a.department.localeCompare(b.department) || a.salary - b.salary);

function makeOffset(kind: 'lag' | 'lead' | 'first-value' | 'last-value'): VisualizationExample {
  const sqlName = kind === 'first-value' ? 'FIRST_VALUE' : kind === 'last-value' ? 'LAST_VALUE' : kind.toUpperCase();
  const resultLabel = kind === 'lag' ? 'Previous salary' : kind === 'lead' ? 'Next salary' : kind === 'first-value' ? 'First salary' : 'Last salary';
  const results: Record<string, number | null> = {};
  const calc: VisualizationStep[] = [];
  for (const department of ['Analytics', 'Product'] as const) {
    const partition = offsetSorted.filter(row => row.department === department);
    partition.forEach((row, index) => {
      const source = kind === 'lag' ? partition[index - 1] : kind === 'lead' ? partition[index + 1] : kind === 'first-value' ? partition[0] : partition[partition.length - 1];
      const value = source?.salary ?? null;
      results[row.id] = value;
      const movement = kind === 'lag' ? 'Move 1 row backward' : kind === 'lead' ? 'Move 1 row forward' : kind === 'first-value' ? 'Move to first row in partition' : 'Move to last row in the full frame';
      calc.push({
        phase: 'calculate', rowId: row.id, sourceRowId: source?.id,
        direction: kind === 'lag' ? 'backward' : kind === 'lead' ? 'forward' : kind === 'first-value' ? 'first' : 'last',
        partition: department, frameIds: source ? [source.id] : [], resultIds: [row.id],
        equation: `${sqlName}(salary) → ${value ?? 'NULL'}`,
        title: `Current row: ${row.employee}`,
        description: `${movement} · Source row: ${source?.employee ?? 'none'} · Returned value: ${value ?? 'NULL'}`,
      });
    });
  }
  const steps: VisualizationStep[] = [
    { phase: 'initial', title: `Ready to visualize ${sqlName}()`, description: 'Start with the shared offset-functions dataset.' },
    { phase: 'partition', title: 'Split rows by department', description: 'Every lookup stays inside the current department.' },
    { phase: 'sort', title: 'Order rows by salary', description: 'The ORDER BY sequence defines what previous, next, first and last mean.' },
    ...calc,
    { phase: 'complete', title: `${sqlName}() complete`, description: kind === 'last-value' ? 'The full-partition frame makes every row return its partition’s last salary.' : 'Every current row now shows the value returned from its source row.' },
  ];
  return { id: kind, name: `${sqlName}()`, detail: kind === 'lag' ? 'Previous row' : kind === 'lead' ? 'Next row' : kind === 'first-value' ? 'First in partition' : 'Last in full frame', steps, results, resultLabel, resultPrefix: '$', sorted: true, rows: offsetEmployees, sortedRows: offsetSorted };
}

export const visualExamples: Record<ExampleId, VisualizationExample> = {
  'partition-count': { id: 'partition-count', name: 'Partition COUNT', detail: 'PARTITION BY', steps: countSteps, results: countResults, resultLabel: 'Employees in department', sorted: false, rows: employees, sortedRows: sortedEmployees },
  'running-sum': { id: 'running-sum', name: 'Running SUM', detail: 'PARTITION BY + ORDER BY', steps: runningSteps, results: runningResults, resultLabel: 'Running salary', resultPrefix: '$', sorted: true, rows: employees, sortedRows: sortedEmployees },
  'row-number': makeRanking('row-number'), 'rank': makeRanking('rank'), 'dense-rank': makeRanking('dense-rank'),
  'lag': makeOffset('lag'), 'lead': makeOffset('lead'),
  'first-value': makeOffset('first-value'), 'last-value': makeOffset('last-value'),
};

export const examples = [
  { id: 'partition-count', name: 'Partition COUNT', detail: 'PARTITION BY', group: 'Window examples' },
  { id: 'running-sum', name: 'Running SUM', detail: 'PARTITION BY + ORDER BY', group: 'Window examples' },
  { id: 'row-number', name: 'ROW_NUMBER()', detail: 'Unique sequence', group: 'Ranking functions' },
  { id: 'rank', name: 'RANK()', detail: 'Ties with gaps', group: 'Ranking functions' },
  { id: 'dense-rank', name: 'DENSE_RANK()', detail: 'Ties without gaps', group: 'Ranking functions' },
  { id: 'lag', name: 'LAG()', detail: 'Previous row', group: 'Offset functions' },
  { id: 'lead', name: 'LEAD()', detail: 'Next row', group: 'Offset functions' },
  { id: 'first-value', name: 'FIRST_VALUE()', detail: 'First in partition', group: 'Offset functions' },
  { id: 'last-value', name: 'LAST_VALUE()', detail: 'Last in full frame', group: 'Offset functions' },
];
