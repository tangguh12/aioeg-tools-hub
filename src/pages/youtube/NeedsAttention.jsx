import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { detailedAlerts } from '../../data/mockData';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  ChevronDown, 
  ArrowDownRight, 
  ArrowUpRight, 
  MoreVertical, 
  CheckCircle, 
  ExternalLink,
  Zap,
  DollarSign,
  VideoOff,
  Activity
} from 'lucide-react';
import './NeedsAttention.css';

export default function NeedsAttention() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All Issues');
  const [alerts, setAlerts] = useState(detailedAlerts);

  const tabs = [
    { id: 'All Issues', label: t('allIssues') },
    { id: 'Performance', label: t('performanceDrops') },
    { id: 'CTR', label: t('ctrIssues') },
    { id: 'Retention', label: t('retentionIssues') },
    { id: 'Revenue', label: t('revenueIssues') },
    { id: 'Inactivity', label: t('uploadInactivity') },
    { id: 'Monetization', label: t('monetizationIssues') }
  ];

  const summaryStats = [
    { label: t('totalIssues'), value: alerts.length, icon: AlertTriangle, color: 'var(--primary)' },
    { label: t('critical'), value: alerts.filter(a => a.severity === 'critical').length, icon: Zap, color: 'var(--danger)' },
    { label: t('warning'), value: alerts.filter(a => a.severity === 'warning').length, icon: AlertTriangle, color: 'var(--warning)' },
    { label: t('monetizationIssues'), value: alerts.filter(a => a.category === 'Monetization').length, icon: DollarSign, color: 'var(--success)' },
    { label: t('uploadInactivity'), value: alerts.filter(a => a.category === 'Inactivity').length, icon: VideoOff, color: 'var(--text-muted)' }
  ];

  const filteredAlerts = activeTab === 'All Issues' 
    ? alerts 
    : alerts.filter(a => a.category === activeTab);

  const severities = ['critical', 'warning', 'notice', 'opportunity'];

  const resolveAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="needs-attention-container">
      <header className="page-header">
        <div>
          <h2 className="h2">{t('needsAttention')}</h2>
          <p className="p-muted">{t('needsAttentionSubtitle')}</p>
        </div>
        <div className="page-actions">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search channels or issues..." />
          </div>
          <button className="btn btn-secondary"><Calendar size={16} /> {t('last7d')} <ChevronDown size={14} /></button>
          <button className="btn btn-secondary"><Filter size={16} /> {t('severity')} <ChevronDown size={14} /></button>
          <button className="icon-btn"><RefreshCw size={18} /></button>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="summary-grid">
        {summaryStats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            className="card summary-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="summary-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="summary-value">{stat.value}</div>
              <div className="summary-label">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Tabs */}
      <div className="segmented-tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="attention-layout">
        <div className="attention-main">
          {filteredAlerts.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon"><CheckCircle size={48} /></div>
              <h3 className="h3">{t('healthyTitle')}</h3>
              <p className="p-muted">{t('healthySubtitle')}</p>
            </div>
          ) : (
            <div className="severity-groups">
              {severities.map(severity => {
                const groupAlerts = filteredAlerts.filter(a => a.severity === severity);
                if (groupAlerts.length === 0) return null;

                return (
                  <div key={severity} className={`severity-block block-${severity}`}>
                    <h4 className="severity-title">{t(severity)}</h4>
                    <div className="alert-cards">
                      <AnimatePresence>
                        {groupAlerts.map((alert, i) => (
                          <motion.div 
                            key={alert.id}
                            className="card alert-card-detailed"
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                          >
                            <div className="alert-card-top">
                              <div className="alert-channel">
                                <div className="alert-avatar">{alert.avatar}</div>
                                <div>
                                  <div className="channel-name-wrap">
                                    <span className="channel-name">{alert.channel}</span>
                                    <span className="niche-badge">{alert.niche}</span>
                                  </div>
                                  <div className="issue-title">{alert.title}</div>
                                </div>
                              </div>
                              <div className="alert-badges">
                                <span className={`severity-badge ${alert.severity}`}>{t(alert.severity)}</span>
                                <button className="icon-btn-small"><MoreVertical size={16} /></button>
                              </div>
                            </div>

                            <div className="alert-card-body">
                              <div className="alert-desc">{alert.desc}</div>
                              <div className="alert-metrics">
                                <div className="metric-item">
                                  <span className="m-label">Impact</span>
                                  <span className={`m-value ${alert.trend === 'down' ? 'negative' : alert.trend === 'up' ? 'positive' : ''}`}>
                                    {alert.trend === 'down' ? <ArrowDownRight size={14} /> : alert.trend === 'up' ? <ArrowUpRight size={14} /> : null}
                                    {alert.impact}
                                  </span>
                                </div>
                                <div className="metric-item">
                                  <span className="m-label">Period</span>
                                  <span className="m-value">{alert.period}</span>
                                </div>
                              </div>
                            </div>

                            <div className="alert-recommendation">
                              <div className="rec-header">
                                <Zap size={14} /> {t('recommendedAction')}
                              </div>
                              <div className="rec-text">{alert.action}</div>
                            </div>

                            <div className="alert-actions">
                              <button className="btn btn-secondary btn-small" onClick={() => resolveAlert(alert.id)}>{t('resolved')}</button>
                              <button className="btn btn-secondary btn-small">{t('actionPlan')}</button>
                              <button className="btn btn-primary btn-small">{t('viewAnalytics')} <ExternalLink size={14} /></button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="attention-sidebar">
          <div className="card insight-card">
            <h3 className="h3"><Activity size={18} className="icon-gold" /> {t('aiInsights')}</h3>
            <div className="insight-list">
              <div className="insight-item">
                <p>This channel has high impressions but a falling CTR, suggesting thumbnail/title weakness.</p>
              </div>
              <div className="insight-item">
                <p>This channel has strong CTR but weak retention, suggesting content opening needs improvement.</p>
              </div>
              <div className="insight-item">
                <p>No uploads in 7 days detected on <strong>Unboxing 101</strong>, which may impact momentum.</p>
              </div>
            </div>
          </div>

          <div className="card risk-card">
            <h4 className="p-muted uppercase small-text">{t('revenueRisk')}</h4>
            <div className="risk-value">$1,240 <span className="text-danger">High Risk</span></div>
            <p className="p-muted small-text">Estimated daily loss if trends continue.</p>
          </div>

          <div className="card mini-list-card">
            <h4 className="p-muted uppercase small-text">{t('mostSevere')}</h4>
            <div className="mini-item">
              <div className="mini-avatar red">TV</div>
              <div>
                <div className="mini-name">Travel Vlogs</div>
                <div className="mini-val text-danger">-45% Views</div>
              </div>
            </div>
          </div>

          <div className="card mini-list-card">
            <h4 className="p-muted uppercase small-text">{t('inactiveLongest')}</h4>
            <div className="mini-item">
              <div className="mini-avatar gray">U1</div>
              <div>
                <div className="mini-name">Unboxing 101</div>
                <div className="mini-val">7 Days Inactive</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
