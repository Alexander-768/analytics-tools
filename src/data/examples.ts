import type { Employee, VisualizationStep } from '../types';

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

export const results = Object.fromEntries(
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
    frameIds: frame.map(item => item.id), values,
    result: values.reduce((a, b) => a + b, 0),
    title: `Calculate window for ${row.employee}`,
    description: `The frame grows from the start of ${row.department} to the current row.`,
  };
});

export const steps: VisualizationStep[] = [
  { phase: 'initial', title: 'Ready to visualize', description: 'Start with the source rows in their original order.' },
  { phase: 'partition', title: 'Split rows by department', description: 'The function now works independently inside each partition.' },
  { phase: 'sort', title: 'Order rows by salary', description: 'Rows are sorted by salary inside each department.' },
  ...calcSteps,
  { phase: 'complete', title: 'Visualization complete', description: 'Every row now contains its running salary.' },
];

export const examples = [
  { name: 'Running SUM', detail: 'PARTITION BY + ORDER BY', available: true },
  { name: 'SUM() OVER()', detail: 'Full table', available: false },
  { name: 'Partition SUM', detail: 'PARTITION BY', available: false },
  { name: 'ROW_NUMBER()', detail: 'Coming soon', available: false },
  { name: 'RANK()', detail: 'Coming soon', available: false },
];
