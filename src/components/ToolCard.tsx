import { ArrowUpRight, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category, Tool } from '../data/tools';
import { useLanguage } from '../i18n';

export function ToolCard({ tool, category = false }: { tool: Tool | Category; category?: boolean }) {
  const {t}=useLanguage();
  return <Link className="tool-card panel" to={tool.path}>
    <div className="tool-card-top"><span className="tool-icon"><Database size={17}/></span><span className="tool-index">{tool.index}</span></div>
    <div><span className="tool-tag">{category ? t('Category') : t((tool as Tool).category)}</span><h2>{t(tool.title)}</h2><p>{t(tool.description)}</p></div>
    <div className="tool-open"><span>{category ? t('Browse category') : t('Open tool')}</span><ArrowUpRight size={15}/></div>
  </Link>;
}
