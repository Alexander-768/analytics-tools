import { ToolGrid } from '../components/ToolGrid';

export function HomePage() {
  return <main className="home-page"><div className="catalog-head"><div><span className="kicker">Tool directory</span><h1>Analytics Toolkit</h1><p>Interactive tools and visual explanations for analytics.</p></div><span className="catalog-count">02 tools</span></div><div className="catalog-rule"><span>Available tools</span><i/></div><ToolGrid /></main>;
}
