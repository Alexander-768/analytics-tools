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
  { id: 'window-functions', title: 'Window Functions', description: 'See how SQL window functions partition, order and calculate over rows.', category: 'SQL', path: '/window-functions', status: 'ready', index: '01' },
  { id: 'joins', title: 'SQL JOINs', description: 'Visualize how tables are matched and combined with different JOIN types.', category: 'SQL', path: '/joins', status: 'ready', index: '02' },
];
