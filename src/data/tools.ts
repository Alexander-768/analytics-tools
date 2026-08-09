export type Tool = {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  status: 'ready' | 'coming-soon';
  index: string;
};

export const tools: Tool[] = [
  { id: 'window-functions', title: 'Window Functions', description: 'See how SQL window functions partition, order and calculate over rows.', category: 'SQL', path: '/sql/window-functions', status: 'ready', index: '01' },
  { id: 'joins', title: 'SQL JOINs', description: 'Visualize how tables are matched and combined with different JOIN types.', category: 'SQL', path: '/sql/joins', status: 'ready', index: '02' },
];

export type Category = {
  id: string;
  title: string;
  description: string;
  path: string;
  index: string;
  tools: Tool[];
};

export const categories: Category[] = [
  { id: 'sql', title: 'SQL', description: 'Interactive visualizations and references for SQL.', path: '/sql', index: '01', tools: tools.filter(tool => tool.category === 'SQL') },
];

export type ExternalResource = { title: string; description: string; url: string };

export const sqlResources: ExternalResource[] = [
  { title: 'SQL Academy — курс по SQL', description: 'Интерактивный курс и справочник по основам SQL.', url: 'https://sql-academy.org/ru/guide' },
];
