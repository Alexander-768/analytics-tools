import { ToolGrid } from '../components/ToolGrid';
import { ExternalLink } from 'lucide-react';
import { categories, sqlResources } from '../data/tools';

export function SqlCategoryPage() {
  const sql = categories.find(category => category.id === 'sql')!;
  return <main className="home-page"><div className="catalog-head"><div><span className="kicker">Tool category</span><h1>SQL</h1><p>{sql.description}</p></div><span className="catalog-count">{String(sql.tools.length).padStart(2,'0')} tools</span></div><section className="resources-section"><div className="catalog-rule"><span>Useful resources</span><i/></div><div className="resource-list">{sqlResources.map(resource => <a className="resource-link" href={resource.url} target="_blank" rel="noreferrer" key={resource.url}><div><b>{resource.title}</b><p>{resource.description}</p></div><ExternalLink size={14}/></a>)}</div></section><div className="catalog-rule"><span>SQL tools</span><i/></div><ToolGrid tools={sql.tools}/></main>;
}
