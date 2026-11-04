import { Braces, ChevronRight } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { categories, tools } from '../data/tools';
import { useLanguage } from '../i18n';

export function AppLayout() {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const category = categories.find(item => item.path === location.pathname);
  const tool = tools.find(item => item.path === location.pathname);
  const parent = tool ? categories.find(item => item.tools.some(child => child.id === tool.id)) : undefined;
  return <div className="app-shell">
    <header>
      <Link className="brand" to="/"><Braces size={18}/><span>Queryflow</span><em>LAB</em></Link>
      <div className="header-right">
        <div className="language-switcher" aria-label="Language">
          <button className={lang==='en'?'active':''} onClick={()=>setLang('en')}>EN</button>
          <button className={lang==='ru'?'active':''} onClick={()=>setLang('ru')}>RU</button>
        </div>
        <div className="header-meta"><span>{t('Analytics toolkit')}</span><i/>{t('Interactive mode')}</div>
      </div>
    </header>
    {(category || tool) && <nav className="breadcrumbs"><Link to="/">{t('Analytics Toolkit')}</Link><ChevronRight size={12}/>{tool ? <><Link to={parent!.path}>{t(parent!.title)}</Link><ChevronRight size={12}/><span>{t(tool.title)}</span></> : <span>{t(category?.title||'')}</span>}</nav>}
    <Outlet />
  </div>;
}
