import { ToolGrid } from '../components/ToolGrid';
import { categories } from '../data/tools';

export function AbTestingCategoryPage() {
  const category = categories.find(item => item.id === 'ab-testing')!;
  return <main className="home-page"><div className="catalog-head"><div><span className="kicker">Tool category</span><h1>A/B Testing</h1><p>{category.description}</p></div><span className="catalog-count">{String(category.tools.length).padStart(2,'0')} tools</span></div><div className="catalog-rule"><span>A/B Testing tools</span><i/></div><ToolGrid tools={category.tools}/></main>;
}
