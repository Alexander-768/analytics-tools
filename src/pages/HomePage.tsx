import { ToolCard } from '../components/ToolCard';
import { categories } from '../data/tools';
import { useLanguage } from '../i18n';

export function HomePage() {
  const {t}=useLanguage();
  return <main className="home-page"><div className="catalog-head"><div><span className="kicker">{t('Category directory')}</span><h1>Analytics Toolkit</h1><p>{t('Interactive tools and visual explanations for analytics.')}</p></div><span className="catalog-count">{String(categories.length).padStart(2,'0')} {t('categories')}</span></div><div className="catalog-rule"><span>{t('Categories')}</span><i/></div><div className="tool-grid">{categories.map(category => <ToolCard tool={category} category key={category.id}/>)}</div></main>;
}
