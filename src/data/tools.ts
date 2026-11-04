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
  { id: 'sample-size', title: 'Sample Size Calculator', description: 'Calculate the required sample size for an A/B test.', category: 'A/B Testing', path: '/ab-testing/sample-size', status: 'ready', index: '01' },
  { id: 'limits', title: 'Limits', description: 'Build intuition for limits, continuity, one-sided behavior and indeterminate forms through interactive graphs.', category: 'Basic Math', path: '/basic-math/limits', status: 'ready', index: '01' },
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
  { id: 'ab-testing', title: 'A/B Testing', description: 'Interactive tools for planning and understanding experiments.', path: '/ab-testing', index: '02', tools: tools.filter(tool => tool.category === 'A/B Testing') },
  { id: 'basic-math', title: 'Basic Math', description: 'Visual, interactive refreshers for the mathematical foundations used in analytics.', path: '/basic-math', index: '03', tools: tools.filter(tool => tool.category === 'Basic Math') },
];

export type ExternalResource = { title: string; description: string; url: string };

export const sqlResources: ExternalResource[] = [
  { title: 'SQL Academy — курс по SQL', description: 'Интерактивный курс и справочник по основам SQL.', url: 'https://sql-academy.org/ru/guide' },
];
