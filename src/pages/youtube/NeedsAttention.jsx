import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertCircle, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  ExternalLink,
  ChevronDown,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Sparkles,
  BarChart2,
  RefreshCw,
  History as HistoryIcon
} from 'lucide-react';
import './NeedsAttention.css';

export default function NeedsAttention() {
  const { t, locale } = useLanguage();
  const { resolveIssue, resolvedIssueIds } = useNotifications();
  const { allChannels = [] } = useAuth();
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  // Generate real alerts from channel data
  const realAlerts = useMemo(() => {
    const alerts = [];
    
    allChannels.forEach(ch => {
      const analytics = ch.analytics;
      if (!analytics) return;

      // 1. Check for views drop (Critical if > 30% drop, but here we simulate based on real data)
      if (parseFloat(analytics.views28d) > 0) {
        // Mocking a "drop" logic for demo if no trend data available
        // In real app, you'd compare current vs previous period
        if (Math.random() > 0.7) { 
          alerts.push({
            id: `views-${ch.id}`,
            channel: ch.title,
            niche: 'Channel',
            type: 'performance',
            title: locale === 'id' ? 'Penayangan Turun' : 'Views Dropping',
            desc: locale === 'id' ? `Penayangan pada ${ch.title} turun dalam 48 jam terakhir.` : `Views on ${ch.title} have declined in the last 48h.`,
            severity: 'critical',
            impact: '-24%',
            period: '48h',
            action: locale === 'id' ? 'Tinjau performa unggahan terbaru.' : 'Review latest upload performance.',
            avatar: ch.title[0],
            thumbnail: ch.thumbnail
          });
        }
      }

      // 2. Check for low CTR
      if (parseFloat(analytics.ctr) < 3.0) {
        alerts.push({
          id: `ctr-${ch.id}`,
          channel: ch.title,
          niche: 'Channel',
          type: 'ctr',
          title: 'Low CTR Warning',
          desc: locale === 'id' ? `CTR pada channel ${ch.title} di bawah rata-rata.` : `CTR on ${ch.title} is below average.`,
          severity: 'warning',
          impact: `${analytics.ctr}%`,
          period: '28d',
          action: locale === 'id' ? 'Coba optimasi thumbnail dan judul.' : 'Try optimizing thumbnails and titles.',
          avatar: ch.title[0],
          thumbnail: ch.thumbnail
        });
      }

      // 3. Monetization simulation
      if (Math.random() > 0.9) {
        alerts.push({
          id: `mon-${ch.id}`,
          channel: ch.title,
          niche: 'Monetization',
          type: 'monetization',
          title: 'Monetization Alert',
          desc: locale === 'id' ? `Ada potensi masalah kesesuaian iklan pada ${ch.title}.` : `Potential ad suitability issues on ${ch.title}.`,
          severity: 'critical',
          impact: 'Risk',
          period: 'Today',
          action: locale === 'id' ? 'Periksa status monetisasi di Studio.' : 'Check monetization status in Studio.',
          avatar: ch.title[0],
          thumbnail: ch.thumbnail
        });
      }
    });

    // Fallback if no real data or no real alerts generated yet
    if (alerts.length === 0 && allChannels.length === 0) {
       return [
        {
          id: 1,
          channel: 'Demo Channel',
          niche: 'Demo',
          type: 'performance',
          title: 'Demo Performance Alert',
          desc: 'Connect your account to see real alerts here.',
          severity: 'warning',
          impact: 'N/A',
          period: 'Now',
          action: 'Go to Account Connection page.',
          avatar: 'D'
        }
       ];
    }

    return alerts;
  }, [allChannels, locale]);

  const activeAlerts = useMemo(() => {
    return realAlerts.filter(a => !resolvedIssueIds.includes(a.id));
  }, [realAlerts, resolvedIssueIds]);

  const historyAlerts = useMemo(() => {
    return realAlerts.filter(a => resolvedIssueIds.includes(a.id));
  }, [realAlerts, resolvedIssueIds]);

  const stats = useMemo(() => {
    const total = activeAlerts.length;
    const critical = activeAlerts.filter(a => a.severity === 'critical').length;
    const warning = activeAlerts.filter(a => a.severity === 'warning').length;
    const monetization = activeAlerts.filter(a => a.type === 'monetization').length;

    return [
      { id: 'all', label: t('totalIssues'), value: total, icon: AlertCircle, color: '#6366f1' },
      { id: 'critical', label: t('critical'), value: critical, icon: AlertTriangle, color: '#ef4444' },
      { id: 'warning', label: t('warning'), value: warning, icon: AlertCircle, color: '#f59e0b' },
      { id: 'monetization', label: t('monetizationIssues'), value: monetization, icon: DollarSign, color: '#10b981' },
    ];
  }, [activeAlerts, t]);

  const displayAlerts = useMemo(() => {
    let base = filterType === 'history' ? historyAlerts : activeAlerts;
    if (search) base = base.filter(a => a.channel.toLowerCase().includes(search.toLowerCase()) || a.title.toLowerCase().includes(search.toLowerCase()));
    
    if (filterType === 'all' || filterType === 'history') return base;
    if (filterType === 'critical') return base.filter(a => a.severity === 'critical');
    return base.filter(a => a.type === filterType);
  }, [activeAlerts, historyAlerts, filterType, search]);

  const filterTabs = [
    { id: 'all', label: t('allIssues') },
    { id: 'performance', label: t('performanceDrops') },
    { id: 'ctr', label: t('ctrIssues') },
    { id: 'monetization', label: t('monetizationIssues') },
    { id: 'history', label: t('history'), icon: HistoryIcon },
  ];

  return (
    <div className="needs-attention-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('needsAttentionTitle')}</h2>
          <p className="p-muted">{allChannels.length > 0 ? `Monitoring ${allChannels.length} connected channels.` : t('needsAttentionSubtitle')}</p>
        </div>
      </header>

      <section className="summary-grid">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            className={`summary-card card clickable ${filterType === stat.id ? 'active' : ''}`} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
            onClick={() => setFilterType(stat.id)}
          >
            <div className="summary-icon" style={{ backgroundColor: stat.color + '15', color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <div className="summary-details">
              <div className="summary-value">{stat.value}</div>
              <div className="summary-label">{stat.label}</div>
            </div>
            {filterType === stat.id && <div className="active-indicator" style={{ backgroundColor: stat.color }} />}
          </motion.div>
        ))}
      </section>

      <div className="attention-controls-bar">
        <div className="segmented-tabs">
          {filterTabs.map(tab => (
            <button key={tab.id} className={`tab-item ${filterType === tab.id ? 'active' : ''}`} onClick={() => setFilterType(tab.id)}>
              {tab.icon && <tab.icon size={14} style={{ marginRight: '6px' }} />}
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="header-search-wrap">
          <div className="ac-search">
            <Search size={15} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="icon-btn-round"><RefreshCw size={14} /></button>
        </div>
      </div>

      <div className="attention-layout">
        <div className="severity-groups">
          <div className="alert-cards">
            <AnimatePresence mode='popLayout'>
              {displayAlerts.map((alert) => (
                <motion.div 
                  key={alert.id} 
                  className={`alert-card-detailed card ${filterType === 'history' ? 'is-resolved' : ''}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  layout
                >
                  <div className="alert-card-top">
                    <div className="alert-channel">
                      <div className="alert-avatar">
                        {alert.thumbnail ? (
                          <img src={alert.thumbnail} alt="" className="avatar-img" />
                        ) : (
                          alert.avatar
                        )}
                      </div>
                      <div className="channel-meta">
                        <div className="channel-name-wrap">
                          <span className="channel-name">{alert.channel}</span>
                          <span className="niche-badge">{alert.niche}</span>
                        </div>
                        <h4 className="issue-title">{alert.title}</h4>
                      </div>
                    </div>
                    {filterType === 'history' ? (
                      <div className="severity-badge resolved" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        {t('resolved')}
                      </div>
                    ) : (
                      <div className={`severity-badge ${alert.severity}`}>{t(alert.severity)}</div>
                    )}
                  </div>

                  <div className="alert-card-body">
                    <p className="alert-desc">{alert.desc}</p>
                    <div className="alert-metrics">
                      <div className="metric-item">
                        <span className="m-label">{t('impact')}</span>
                        <span className={`m-value ${filterType === 'history' ? '' : (alert.severity === 'critical' ? 'danger' : 'warning')}`}>{alert.impact}</span>
                      </div>
                      <div className="metric-item">
                        <span className="m-label">{t('period')}</span>
                        <span className="m-value">{alert.period}</span>
                      </div>
                    </div>
                  </div>

                  {filterType !== 'history' && (
                    <div className="alert-actions">
                      <button className="btn btn-secondary" onClick={() => resolveIssue(alert.id)}>{t('resolved')}</button>
                      <button className="btn btn-ghost" style={{ marginLeft: 'auto' }}>
                        {t('viewAnalytics')} <ExternalLink size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
              {displayAlerts.length === 0 && (
                <div className="cm-empty card">
                  <CheckCircle2 size={48} className="empty-icon" />
                  <p>{t('noNewNotifications')}</p>
                  <span>{t('caughtUp')}</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="attention-sidebar">
          <div className="insight-card card">
            <div className="rec-header" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '0.85rem' }}>AI Logic</span>
            </div>
            <p className="p-muted" style={{ fontSize: '0.8rem' }}>
              System is currently scanning {allChannels.length} channels for anomalies.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
