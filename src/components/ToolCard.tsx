import { ArrowUpRight, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Tool } from '../data/tools';

export function ToolCard({ tool }: { tool: Tool }) {
  return <Link className="tool-card panel" to={tool.path}>
    <div className="tool-card-top"><span className="tool-icon"><Database size={17}/></span><span className="tool-index">{tool.index}</span></div>
    <div><span className="tool-tag">{tool.category}</span><h2>{tool.title}</h2><p>{tool.description}</p></div>
    <div className="tool-open"><span>Open tool</span><ArrowUpRight size={15}/></div>
  </Link>;
}
