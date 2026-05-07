import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  RefreshCw, 
  Calendar, 
  ChevronDown, 
  User, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Settings,
  LogOut,
  Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import './Header.css';

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const { unreadNotifications, markAllNotificationsRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, severity: 'critical', channel: 'Travel Vlogs', title: t('realTimeDrop'), desc: 'Views dropped 45% in the last 48 hours.', time: '2 hours ago' },
    { id: 2, severity: 'success', channel: 'Tech Insider', title: t('targetCompleted'), desc: 'Monthly views target has been reached.', time: 'Today' },
    { id: 3, severity: 'warning', channel: 'Gaming Pro', title: t('syncFailed'), desc: 'Data sync failed for 2 videos.', time: '5 hours ago' },
    { id: 4, severity: 'info', channel: 'Finance Hub', title: 'Report Generated', desc: 'Weekly performance report is ready.', time: '1 day ago' }
  ];

  const dateRanges = [ t('today'), t('last48h'), t('last7d'), t('last28d'), t('last90d'), t('customRange') ];

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
  };

  const handleViewAll = () => {
    setShowNotifications(false);
    navigate('/youtube/alerts');
  };

  const getSeverityIcon = (sev) => {
    switch(sev) {
      case 'critical': return <AlertTriangle size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'success': return <CheckCircle2 size={14} />;
      case 'info': return <Info size={14} />;
      default: return <Bell size={14} />;
    }
  };

  // IDENTITY SEPARATION: This is the Logged-in App User, NOT the YouTube Account
  const adminUser = {
    name: 'Admin User',
    role: 'Super Admin',
    initial: 'M'
  };

  return (
    <header className="header glass" onClick={() => { setShowNotifications(false); setShowProfileMenu(false); }}>
      <div className="header-left">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('searchPlaceholder')} />
        </div>
      </div>

      <div className="header-right">
        <div className="language-selector" onClick={(e) => { e.stopPropagation(); toggleLanguage(); }}>
          <Globe size={18} />
          <span className="lang-code">{locale.toUpperCase()}</span>
        </div>

        <div className="date-filter" onClick={(e) => e.stopPropagation()}>
          <Calendar size={16} />
          <span>{t('last28d')}</span>
          <ChevronDown size={16} />
          <div className="dropdown-menu">
            {dateRanges.map(range => (
              <div key={range} className="dropdown-item">{range}</div>
            ))}
          </div>
        </div>

        <button className="icon-btn" title="Refresh Data" onClick={(e) => e.stopPropagation()}>
          <RefreshCw size={18} />
        </button>

        <div className="last-sync">
          <span>{t('lastSync', { time: '2 mins' })}</span>
        </div>

        {/* Notification Bell */}
        <div className="notification-wrapper">
          <button 
            className={`icon-btn notification-btn ${showNotifications ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
          >
            <Bell size={18} />
            {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                className="notification-dropdown card"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="nd-header">
                  <span className="nd-title">{t('alertsTitle')}</span>
                  <button className="nd-mark-read" onClick={markAllNotificationsRead}>{t('markAllRead')}</button>
                </div>
                <div className="nd-list">
                  {unreadNotifications > 0 ? (
                    notifications.slice(0, unreadNotifications).map(n => (
                      <div key={n.id} className="nd-item" onClick={() => { setShowNotifications(false); navigate('/youtube/alerts'); }}>
                        <div className={`nd-icon ${n.severity}`}>{getSeverityIcon(n.severity)}</div>
                        <div className="nd-content">
                          <div className="nd-meta">
                            <span className="nd-channel">{n.channel}</span>
                            <span className="nd-time">{n.time}</span>
                          </div>
                          <div className="nd-text-title">{n.title}</div>
                          <div className="nd-desc">{n.desc}</div>
                        </div>
                      </div>
                    ))
                  ) : <div className="nd-empty"><Bell size={32} /><p>{t('noNewNotifications')}</p></div>}
                </div>
                <button className="nd-footer-btn" onClick={handleViewAll}>{t('viewAllAlerts')}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* REFINED USER ACCOUNT MENU (App Admin) */}
        <div className="profile-control-wrapper">
          <div 
            className={`global-profile-trigger ${showProfileMenu ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
          >
            <div className="avatar-circle">{adminUser.initial}</div>
            <ChevronDown size={14} className={`arrow ${showProfileMenu ? 'rotated' : ''}`} />
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                className="global-profile-dropdown card"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="gpd-header">
                  <div className="gpd-avatar-big">{adminUser.initial}</div>
                  <div className="gpd-info">
                    <p className="gpd-name">{adminUser.name}</p>
                    <p className="gpd-role">{adminUser.role}</p>
                  </div>
                </div>
                <div className="gpd-divider" />
                <div className="gpd-menu">
                  <button className="gpd-item"><User size={14} /> {locale === 'id' ? 'Profil Saya' : 'My Profile'}</button>
                  <button className="gpd-item"><Settings size={14} /> {locale === 'id' ? 'Pengaturan Dashboard' : 'Dashboard Settings'}</button>
                  <button className="gpd-item"><Users size={14} /> {locale === 'id' ? 'Tim & Izin' : 'Team & Permissions'}</button>
                  <div className="gpd-divider" />
                  <button className="gpd-item danger"><LogOut size={14} /> {locale === 'id' ? 'Keluar' : 'Sign Out'}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
