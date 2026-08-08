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
  values?: number[];
  result?: number;
};
