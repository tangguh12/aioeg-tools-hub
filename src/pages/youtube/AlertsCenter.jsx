import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Search, 
  Filter, 
  X,
  Settings,
  ChevronDown,
  BarChart2,
  ExternalLink,
  Trash2,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import './AlertsCenter.css';

export default function AlertsCenter() {
  const { t, locale } = useLanguage();
  const { allChannels = [] } = useAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'critical',
      channel: 'Travel Vlogs',
      title: t('realTimeDrop'),
      desc: 'Views dropped 45% in the last 48 hours.',
      time: '2 hours ago',
      type: 'performance',
      status: 'new'
    },
    {
      id: 2,
      severity: 'success',
      channel: 'Gaming Pro',
      title: t('targetCompleted'),
      desc: 'Monthly view target of 500,000 reached!',
      time: '5 hours ago',
      type: 'target',
      status: 'new'
    },
    {
      id: 3,
      severity: 'warning',
      channel: 'Cooking Daily',
      title: t('syncFailed'),
      desc: 'Could not fetch latest data for video "Spicy Ramen".',
      time: '1 day ago',
      type: 'sync',
      status: 'resolved'
    },
    {
      id: 4,
      severity: 'info',
      channel: 'Finance Hub',
      title: t('videoPerformanceSpike'),
      desc: 'New video is performing 3x better than usual.',
      time: '1 day ago',
      type: 'performance',
      status: 'new'
    }
  ]);

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (activeTab === 'all') return alerts;
    if (activeTab === 'resolved') return alerts.filter(a => a.status === 'resolved');
    return alerts.filter(a => a.severity === activeTab && a.status !== 'resolved');
  }, [alerts, activeTab]);

  const handleResolve = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  };

  const getSeverityIcon = (sev) => {
    switch(sev) {
      case 'critical': return <AlertTriangle size={18} />;
      case 'warning': return <AlertTriangle size={18} />;
      case 'success': return <CheckCircle2 size={18} />;
      case 'info': return <Info size={18} />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="alerts-page">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('alertsTitle')}</h2>
          <p className="p-muted">{t('alertsSubtitle')}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>
          <Settings size={18} />
          {t('alertSettings')}
        </button>
      </header>

      {/* Summary Cards */}
      <section className="alerts-summary-grid">
        <div className="alert-stat-card card">
          <span className="label">{t('totalAlerts')}</span>
          <span className="value">{stats.total}</span>
        </div>
        <div className="alert-stat-card card critical">
          <span className="label">{t('critical')}</span>
          <span className="value">{stats.critical}</span>
        </div>
        <div className="alert-stat-card card warning">
          <span className="label">{t('warning')}</span>
          <span className="value">{stats.warning}</span>
        </div>
        <div className="alert-stat-card card resolved">
          <span className="label">{t('resolved')}</span>
          <span className="value">{stats.resolved}</span>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="alerts-filter-bar">
        <div className="filter-tabs">
          {['all', 'critical', 'warning', 'info', 'success', 'resolved'].map(tab => (
            <button 
              key={tab} 
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <section className="alerts-list-container">
        {filteredAlerts.length > 0 ? (
          <div className="alerts-vertical-list">
            {filteredAlerts.map((alert, i) => (
              <motion.div 
                key={alert.id} 
                className={`alert-item-card card ${alert.severity} ${alert.status}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="alert-item-left">
                  <div className={`severity-icon-box ${alert.severity}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="alert-content-main">
                    <div className="alert-meta">
                      <span className="channel-name">{alert.channel}</span>
                      <span className="dot">·</span>
                      <span className="time">{alert.time}</span>
                    </div>
                    <h4 className="alert-title">{alert.title}</h4>
                    <p className="alert-desc">{alert.desc}</p>
                  </div>
                </div>

                <div className="alert-actions">
                  <button className="btn btn-ghost btn-small">
                    {t('viewAnalytics')} <ExternalLink size={14} />
                  </button>
                  {alert.status !== 'resolved' && (
                    <button className="btn btn-secondary btn-small" onClick={() => handleResolve(alert.id)}>
                      <CheckCircle2 size={14} />
                      {t('markResolved')}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="alerts-empty-state card">
            <div className="empty-visual">
              <Bell size={64} />
            </div>
            <h3 className="h3">{t('noAlertsTitle')}</h3>
            <p className="p-muted">{t('noAlertsSubtitle')}</p>
          </div>
        )}
      </section>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <motion.div 
              className="modal-content card" 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="modal-header">
                <h3 className="h3">{t('alertSettings')}</h3>
                <button className="close-btn" onClick={() => setShowSettings(false)}><X size={20} /></button>
              </div>
              <div className="settings-list">
                {[
                  'viewsDropAlert', 
                  'ctrDropAlert', 
                  'revDropAlert', 
                  'noUploadAlert', 
                  'targetRiskAlert', 
                  'syncErrorAlert'
                ].map(key => (
                  <div key={key} className="setting-item">
                    <span className="setting-label">{t(key)}</span>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn btn-primary full-width" onClick={() => setShowSettings(false)}>
                  {t('saveSettings')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
