import { ToolCard } from '../components/ToolCard';
import { categories } from '../data/tools';

export function HomePage() {
  return <main className="home-page"><div className="catalog-head"><div><span className="kicker">Category directory</span><h1>Analytics Toolkit</h1><p>Interactive tools and visual explanations for analytics.</p></div><span className="catalog-count">{String(categories.length).padStart(2,'0')} categories</span></div><div className="catalog-rule"><span>Categories</span><i/></div><div className="tool-grid">{categories.map(category => <ToolCard tool={category} category key={category.id}/>)}</div></main>;
}
