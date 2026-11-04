import { ToolGrid } from '../components/ToolGrid';
import { categories } from '../data/tools';
import { useLanguage } from '../i18n';

export function BasicMathCategoryPage() {
  const {t}=useLanguage();
  const category = categories.find(item => item.id === 'basic-math')!;
  return <main className="home-page"><div className="catalog-head"><div><span className="kicker">{t('Tool category')}</span><h1>{t('Basic Math')}</h1><p>{t(category.description)}</p></div><span className="catalog-count">{String(category.tools.length).padStart(2,'0')} {t('tools')}</span></div><div className="catalog-rule"><span>{t('Basic Math tools')}</span><i/></div><ToolGrid tools={category.tools}/></main>;
}
