import { tools } from '../data/tools';
import { ToolCard } from './ToolCard';

export function ToolGrid() { return <div className="tool-grid">{tools.filter(tool => tool.status === 'ready').map(tool => <ToolCard tool={tool} key={tool.id}/>)}</div>; }
