export type Employee = {
  id: string;
  employee: string;
  department: 'Analytics' | 'Product';
  salary: number;
};

export type Phase = 'initial' | 'partition' | 'sort' | 'calculate' | 'complete';

export type VisualizationStep = {
  phase: Phase;
  title: string;
  description: string;
  rowId?: string;
  partition?: Employee['department'];
  frameIds?: string[];
  resultIds?: string[];
  values?: number[];
  result?: number;
  equation?: string;
  sourceRowId?: string;
  direction?: 'backward' | 'forward' | 'first' | 'last';
};

export type ExampleId = 'partition-count' | 'running-sum' | 'row-number' | 'rank' | 'dense-rank' | 'lag' | 'lead' | 'first-value' | 'last-value';

export type VisualizationExample = {
  id: ExampleId;
  name: string;
  detail: string;
  steps: VisualizationStep[];
  results: Record<string, number | null>;
  resultLabel: string;
  resultPrefix?: string;
  sorted: boolean;
  rows: Employee[];
  sortedRows: Employee[];
};
