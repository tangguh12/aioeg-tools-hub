import { Search, Bell, RefreshCw, Calendar, ChevronDown, User, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  
  const dateRanges = [
    t('today'), 
    t('last48h'), 
    t('last7d'), 
    t('last28d'), 
    t('last90d'), 
    t('customRange')
  ];

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
  };

  return (
    <header className="header glass">
      <div className="header-left">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('searchPlaceholder')} />
        </div>
      </div>

      <div className="header-right">
        <div className="language-selector" onClick={toggleLanguage}>
          <Globe size={18} />
          <span className="lang-code">{locale.toUpperCase()}</span>
        </div>

        <div className="date-filter">
          <Calendar size={16} />
          <span>{t('last28d')}</span>
          <ChevronDown size={16} />
          <div className="dropdown-menu">
            {dateRanges.map(range => (
              <div key={range} className="dropdown-item">{range}</div>
            ))}
          </div>
        </div>

        <button className="icon-btn" title="Refresh Data">
          <RefreshCw size={18} />
        </button>

        <div className="last-sync">
          <span>{t('lastSync', { time: '2 mins' })}</span>
        </div>

        <button className="icon-btn notification-btn">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile-dropdown">
          <div className="avatar-small">
            <User size={16} />
          </div>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}
