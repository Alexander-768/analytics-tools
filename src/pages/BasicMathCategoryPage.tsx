import { ToolGrid } from '../components/ToolGrid';
import { categories } from '../data/tools';

export function BasicMathCategoryPage() {
  const category = categories.find(item => item.id === 'basic-math')!;
  return <main className="home-page"><div className="catalog-head"><div><span className="kicker">Tool category</span><h1>Basic Math</h1><p>{category.description}</p></div><span className="catalog-count">{String(category.tools.length).padStart(2,'0')} tools</span></div><div className="catalog-rule"><span>Basic Math tools</span><i/></div><ToolGrid tools={category.tools}/></main>;
}
