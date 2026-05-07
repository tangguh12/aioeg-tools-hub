import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { chartData } from '../../data/chartData';
import { channels as mockChannels } from '../../data/mockData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import { 
  Search, 
  ChevronDown, 
  X, 
  BarChart2, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  DollarSign, 
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
  Calendar,
  Info
} from 'lucide-react';
import './CompareChannels.css';

export default function CompareChannels() {
  const { t, locale } = useLanguage();
  const { allChannels = [] } = useAuth();
  
  // Helper to translate niche from mock data
  const getTranslatedNiche = (niche) => {
    if (!niche) return 'Niche';
    const n = niche.toLowerCase();
    if (n === 'technology') return t('tech');
    if (n === 'gaming') return t('gaming');
    if (n === 'lifestyle') return t('lifestyle');
    if (n === 'business') return t('business');
    return niche;
  };

  // Fallback to mock data if no real channels connected
  const channels = useMemo(() => {
    const list = allChannels.length > 0 ? allChannels : mockChannels;
    // Normalize data structure
    return list.map(ch => ({
      id: ch.id,
      name: ch.title || ch.name || 'Unnamed Channel',
      category: getTranslatedNiche(ch.category || ch.niche),
      subscribers: ch.subscribers || ch.subs || '0',
      analytics: {
        views: ch.analytics?.views28d || parseInt(ch.views?.replace?.(/K|M/g, '')) * (ch.views?.includes('M') ? 1000000 : 1000) || parseInt(ch.rtViews) || 0,
        watchTime: ch.analytics?.watchTimeHours || parseInt(ch.watchTime) || 0,
        ctr: parseFloat(ch.analytics?.ctr || ch.ctr || 0),
        retention: parseFloat(ch.analytics?.avgRetention || ch.retention || 0),
        revenue: ch.analytics?.revenue || parseInt(ch.revenue?.replace?.(/[\$,]/g, '')) || 0,
        thumbnail: ch.thumbnail
      }
    }));
  }, [allChannels, locale]); // Add locale to dependencies to re-translate mock niches

  const [selectedIds, setSelectedIds] = useState([]);
  const [dateRange, setDateRange] = useState('last28d');
  const [activeMetric, setActiveMetric] = useState('views');
  const [isComparing, setIsComparing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Derived data
  const selectedChannels = useMemo(() => 
    channels.filter(ch => selectedIds.includes(ch.id)), 
    [channels, selectedIds]
  );

  const filteredChannels = useMemo(() => 
    channels.filter(ch => 
      !selectedIds.includes(ch.id) && 
      ch.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5),
    [channels, selectedIds, searchQuery]
  );

  const handleSelect = (id) => {
    if (selectedIds.length >= 5) return;
    setSelectedIds([...selectedIds, id]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemove = (id) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
    if (selectedIds.length <= 2) setIsComparing(false);
  };

  const startComparison = () => {
    if (selectedIds.length >= 2) {
      setIsComparing(true);
    }
  };

  // Stats calculation
  const summaryStats = useMemo(() => {
    if (selectedChannels.length < 2) return null;
    
    const bestCTR = [...selectedChannels].sort((a,b) => b.analytics.ctr - a.analytics.ctr)[0];
    const bestViews = [...selectedChannels].sort((a,b) => b.analytics.views - a.analytics.views)[0];
    const bestRev = [...selectedChannels].sort((a,b) => b.analytics.revenue - a.analytics.revenue)[0];
    const bestRetention = [...selectedChannels].sort((a,b) => b.analytics.retention - a.analytics.retention)[0];
    
    return {
      bestOverall: bestViews,
      bestViews,
      bestCTR,
      bestRevenue: bestRev,
      needsAttention: [...selectedChannels].sort((a,b) => a.analytics.views - b.analytics.views)[0]
    };
  }, [selectedChannels]);

  const metrics = [
    { id: 'views', label: t('penayangan'), color: '#6366f1' },
    { id: 'watchTime', label: t('waktuTonton'), color: '#10b981' },
    { id: 'ctr', label: 'CTR', color: '#f59e0b' },
    { id: 'retention', label: t('retensi'), color: '#8b5cf6' },
    { id: 'revenue', label: t('pendapatan'), color: '#ef4444' }
  ];

  const chartDataFinal = useMemo(() => {
    return selectedChannels.map(ch => ({
      name: ch.name.split(' ')[0],
      fullName: ch.name,
      views: ch.analytics.views,
      watchTime: ch.analytics.watchTime,
      ctr: ch.analytics.ctr,
      retention: ch.analytics.retention,
      revenue: ch.analytics.revenue
    }));
  }, [selectedChannels]);

  return (
    <div className="compare-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('compareTitle')}</h2>
          <p className="p-muted">{t('compareSubtitle')}</p>
        </div>
      </header>

      {/* Selection Area */}
      <section className="compare-selection-card card">
        <div className="selection-controls">
          <div className="multi-select-container">
            <div className="chip-input-wrap" onClick={() => setShowDropdown(!showDropdown)}>
              <Users size={18} className="input-icon" />
              <div className="selected-chips">
                {selectedChannels.map(ch => (
                  <span key={ch.id} className="channel-chip">
                    {ch.name}
                    <X size={14} onClick={(e) => { e.stopPropagation(); handleRemove(ch.id); }} />
                  </span>
                ))}
                {selectedIds.length < 5 && (
                  <input 
                    type="text" 
                    placeholder={selectedIds.length === 0 ? t('selectChannels') : ''}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
              <ChevronDown size={18} className={`chevron-icon ${showDropdown ? 'rotate' : ''}`} />
              
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    className="select-dropdown" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {filteredChannels.length > 0 ? filteredChannels.map(ch => (
                      <div key={ch.id} className="dropdown-item" onClick={() => handleSelect(ch.id)}>
                      <div className="ch-avatar-mini">
                        {ch.thumbnail ? (
                          <img src={ch.thumbnail} alt="" className="avatar-img" />
                        ) : (
                          ch.name.substring(0,2)
                        )}
                      </div>
                        <div className="ch-item-info">
                          <span className="name">{ch.name}</span>
                          <span className="subs">{ch.subscribers} {t('subs')}</span>
                        </div>
                        {selectedIds.includes(ch.id) && <CheckCircle2 size={16} className="check-icon" />}
                      </div>
                    )) : (
                      <div className="dropdown-no-results">{t('noChannels')}</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {showDropdown && <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />}
          </div>

          <div className="range-dropdown">
            <Calendar size={18} />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="last48h">{t('last48h')}</option>
              <option value="last7d">{t('last7d')}</option>
              <option value="last28d">{t('last28d')}</option>
              <option value="last90d">{t('last90d')}</option>
              <option value="custom">{t('customRange')}</option>
            </select>
          </div>

          <button 
            className={`btn ${selectedIds.length < 2 ? 'btn-disabled' : 'btn-primary'}`}
            onClick={startComparison}
            disabled={selectedIds.length < 2}
          >
            {t('compareBtn')}
          </button>
        </div>
        
        {!isComparing && (
          <p className="selection-hint">
            <Info size={14} /> 
            {selectedIds.length < 2 ? t('minChannels') : t('maxChannels')}
          </p>
        )}
      </section>

      {!isComparing ? (
        <div className="compare-empty-state">
          <div className="empty-visual">
            <BarChart2 size={64} />
          </div>
          <h3 className="h3">{t('selectChannels')}</h3>
          <p className="p-muted">{t('selectHint')}</p>
        </div>
      ) : (
        <motion.div className="comparison-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          
          {/* A. Comparison Summary */}
          <section className="comparison-summary-row">
            <div className="summary-insight-card card">
              <div className="card-top">
                <Sparkles size={20} className="sparkle-icon" />
                <h4 className="h4">{t('bestOverall')}</h4>
              </div>
              <div className="best-channel-box">
                <div className="best-avatar">
                  {summaryStats?.bestOverall?.thumbnail ? (
                    <img src={summaryStats.bestOverall.thumbnail} alt="" className="avatar-img" />
                  ) : (
                    summaryStats?.bestOverall?.name.substring(0,2)
                  )}
                </div>
                <div className="best-info">
                  <span className="best-name">{summaryStats?.bestOverall?.name}</span>
                  <span className="best-reason">{t('bestOverallReason')}</span>
                </div>
              </div>
            </div>

            <div className="summary-metrics-grid">
              <div className="mini-summary-card card">
                <span className="s-label">{t('bestViews')}</span>
                <span className="s-value">{summaryStats?.bestViews?.name}</span>
              </div>
              <div className="mini-summary-card card">
                <span className="s-label">{t('bestCTR')}</span>
                <span className="s-value">{summaryStats?.bestCTR?.name}</span>
              </div>
              <div className="mini-summary-card card">
                <span className="s-label">{t('bestRevenue')}</span>
                <span className="s-value">{summaryStats?.bestRevenue?.name}</span>
              </div>
              <div className="mini-summary-card card danger">
                <span className="s-label">{t('needsAttention')}</span>
                <span className="s-value">{summaryStats?.needsAttention?.name}</span>
              </div>
            </div>
          </section>

          {/* B. Channel Comparison Cards */}
          <section className="compare-cards-grid">
            {selectedChannels.map((ch, i) => (
              <motion.div key={ch.id} className="comp-channel-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="ch-card-header">
                <div className="ch-avatar-box">
                  {ch.thumbnail ? (
                    <img src={ch.thumbnail} alt="" className="avatar-img" />
                  ) : (
                    ch.name.substring(0,2)
                  )}
                </div>
                  <div className="ch-title-box">
                    <h4 className="ch-name">{ch.name}</h4>
                    <span className="ch-niche">{ch.category} • {t('active')}</span>
                  </div>
                </div>
                <div className="ch-stats-list">
                  <div className="stat-line">
                    <span className="lab">{t('subs')}</span>
                    <span className="val">{ch.subscribers}</span>
                  </div>
                  <div className="stat-line">
                    <span className="lab">{t('penayangan')}</span>
                    <span className="val">{ch.analytics.views >= 1000 ? (ch.analytics.views / 1000).toFixed(1) + 'K' : ch.analytics.views}</span>
                  </div>
                  <div className="stat-line">
                    <span className="lab">{t('waktuTonton')}</span>
                    <span className="val">{ch.analytics.watchTime} hrs</span>
                  </div>
                  <div className="stat-line">
                    <span className="lab">CTR</span>
                    <span className="val">{ch.analytics.ctr}%</span>
                  </div>
                  <div className="stat-line">
                    <span className="lab">{t('retensi')}</span>
                    <span className="val">{ch.analytics.retention}%</span>
                  </div>
                  <div className="stat-line">
                    <span className="lab">{t('pendapatan')}</span>
                    <span className="val">${ch.analytics.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="ch-trend-badge growing">
                  <TrendingUp size={14} />
                  <span>{t('growing')}</span>
                </div>
              </motion.div>
            ))}
          </section>

          {/* C. Main Comparison Chart */}
          <section className="compare-chart-section card">
            <div className="chart-header">
              <h3 className="h3">{t('comparisonChart')}</h3>
              <div className="metric-tabs">
                {metrics.map(m => (
                  <button key={m.id} className={`metric-tab ${activeMetric === m.id ? 'active' : ''}`} onClick={() => setActiveMetric(m.id)}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartDataFinal} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                  />
                  <Bar dataKey={activeMetric} radius={[8, 8, 0, 0]} barSize={40}>
                    {chartDataFinal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={metrics.find(m => m.id === activeMetric).color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* D. Side-by-side Comparison Table */}
          <section className="compare-table-section card">
            <div className="table-header">
              <h3 className="h3">{t('sideBySide')}</h3>
            </div>
            <div className="table-responsive">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>{t('metric')}</th>
                    {selectedChannels.map(ch => (
                      <th key={ch.id}>{ch.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t('subs')}</td>
                    {selectedChannels.map(ch => <td key={ch.id}>{ch.subscribers}</td>)}
                  </tr>
                  <tr>
                    <td>{t('views28d')}</td>
                    {selectedChannels.map(ch => <td key={ch.id}>{ch.analytics.views.toLocaleString()}</td>)}
                  </tr>
                  <tr>
                    <td>{t('waktuTonton')}</td>
                    {selectedChannels.map(ch => <td key={ch.id}>{ch.analytics.watchTime} hrs</td>)}
                  </tr>
                  <tr>
                    <td>CTR</td>
                    {selectedChannels.map(ch => <td key={ch.id}>{ch.analytics.ctr}%</td>)}
                  </tr>
                  <tr>
                    <td>{t('retensi')}</td>
                    {selectedChannels.map(ch => <td key={ch.id}>{ch.analytics.retention}%</td>)}
                  </tr>
                  <tr>
                    <td>{t('pendapatan')}</td>
                    {selectedChannels.map(ch => <td key={ch.id}>${ch.analytics.revenue.toLocaleString()}</td>)}
                  </tr>
                  <tr>
                    <td>{t('trend')}</td>
                    {selectedChannels.map(ch => (
                      <td key={ch.id} className="growing">
                        <TrendingUp size={14} /> {t('growing')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* E. Insight / Recommendation Section */}
          <section className="compare-insights card">
            <div className="card-top">
              <Sparkles size={20} className="sparkle-icon" />
              <h3 className="h3">{t('insights')}</h3>
            </div>
            <div className="insight-content">
              <div className="insight-block">
                <div className="block-title">
                  <CheckCircle2 size={16} className="success" />
                  <span>{t('keyFinding')}</span>
                </div>
                <p className="p-muted">
                  <strong>{summaryStats?.bestCTR?.name}</strong> {t('insightCTR')}
                </p>
              </div>
              <div className="insight-block">
                <div className="block-title">
                  <AlertTriangle size={16} className="warning" />
                  <span>{t('weakPoint')}</span>
                </div>
                <p className="p-muted">
                  <strong>{summaryStats?.needsAttention?.name}</strong> {t('insightRetention')}
                </p>
              </div>
              <div className="insight-block highlight">
                <div className="block-title">
                  <ArrowRight size={16} className="primary" />
                  <span>{t('recommendedAction')}</span>
                </div>
                <p className="p-muted">
                  {t('insightAction').replace('{best}', summaryStats?.bestCTR?.name).replace('{worst}', summaryStats?.needsAttention?.name)}
                </p>
              </div>
            </div>
          </section>

        </motion.div>
      )}
    </div>
  );
}
