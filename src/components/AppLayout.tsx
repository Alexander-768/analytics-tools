import { Braces, ChevronRight } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { categories, tools } from '../data/tools';

export function AppLayout() {
  const location = useLocation();
  const category = categories.find(item => item.path === location.pathname);
  const tool = tools.find(item => item.path === location.pathname);
  return <div className="app-shell">
    <header><Link className="brand" to="/"><Braces size={18}/><span>Queryflow</span><em>LAB</em></Link><div className="header-meta"><span>Analytics toolkit</span><i/>Interactive mode</div></header>
    {(category || tool) && <nav className="breadcrumbs"><Link to="/">Analytics Toolkit</Link><ChevronRight size={12}/>{tool ? <><Link to="/sql">SQL</Link><ChevronRight size={12}/><span>{tool.title}</span></> : <span>{category?.title}</span>}</nav>}
    <Outlet />
  </div>;
}
