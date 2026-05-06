import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  kpiData as rawKpiData, 
  hallOfFame, 
  detailedAlerts, 
  monetizationStats, 
  channels 
} from '../../data/mockData';
import { chartData } from '../../data/chartData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Calendar, 
  Download, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Award, 
  Activity, 
  DollarSign,
  ArrowRight,
  Clock
} from 'lucide-react';
import './Overview.css';

export default function Overview() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState('views');

  // Human readable mapping for KPI labels
  const kpiLabels = {
    totalRealTimeViews: locale === 'id' ? 'Penayangan Real-Time' : 'Real-Time Views',
    totalWatchTime: locale === 'id' ? 'Waktu Tonton' : 'Watch Time',
    avgCTR: locale === 'id' ? 'Rata-rata CTR' : 'Average CTR',
    avgRetention: locale === 'id' ? 'Rata-rata Retensi' : 'Average Retention',
    avgAVD: locale === 'id' ? 'Rata-rata AVD' : 'Average AVD',
    totalRevenue: locale === 'id' ? 'Estimasi Pendapatan' : 'Estimated Revenue'
  };

  const kpiData = rawKpiData.map(stat => ({
    ...stat,
    label: kpiLabels[stat.labelKey] || stat.label
  }));

  // Summary Data Prep
  const criticalCount = detailedAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = detailedAlerts.filter(a => a.severity === 'warning').length;
  const topIssue = detailedAlerts[0];

  const rtChampion = hallOfFame.find(h => h.category === 'Real-Time Champion');
  const revChampion = hallOfFame.find(h => h.category === 'Revenue Champion');
  const ctrChampion = hallOfFame.find(h => h.category === 'CTR Champion');

  const activeChannels = channels.filter(c => c.status === 'Active').length;
  const growingChannels = 4; // Mocking
  const reviewChannels = criticalCount;

  const metrics = [
    { id: 'views', label: locale === 'id' ? 'Penayangan' : 'Views', color: '#6366f1' },
    { id: 'watchTime', label: locale === 'id' ? 'Waktu Tonton' : 'Watch Time', color: '#10b981' },
    { id: 'ctr', label: 'CTR', color: '#f59e0b' },
    { id: 'retention', label: locale === 'id' ? 'Retensi' : 'Retention', color: '#8b5cf6' },
    { id: 'revenue', label: locale === 'id' ? 'Pendapatan' : 'Revenue', color: '#ef4444' },
  ];

  return (
    <div className="overview-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{locale === 'id' ? 'Ikhtisar Operasi YouTube' : 'YouTube Operations Overview'}</h2>
          <p className="p-muted">{locale === 'id' ? 'Pantau kesehatan, performa, dan pendapatan semua saluran YouTube dalam sekejap.' : 'Monitor the overall health, performance, and revenue of all YouTube channels at a glance.'}</p>
          <div className="sync-info">
            <Clock size={12} />
            <span>{locale === 'id' ? 'Sinkronisasi terakhir: 2 menit yang lalu' : 'Last sync: 2 minutes ago'}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Download size={16} /> {t('exportData')}</button>
          <button className="btn btn-primary"><Plus size={16} /> {t('addChannel')}</button>
        </div>
      </header>

      {/* KPI Row */}
      <section className="kpi-summary-row">
        {kpiData.map((stat, i) => (
          <motion.div 
            key={stat.label}
            className="kpi-card-compact"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <span className="kpi-label">{stat.label}</span>
            <div className="kpi-main">
              <span className="kpi-value">{stat.value}</span>
              <span className={`kpi-trend ${stat.isPositive ? 'positive' : 'negative'}`}>
                {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.trend}
              </span>
            </div>
            {stat.unit && <span className="kpi-unit">{stat.unit}</span>}
          </motion.div>
        ))}
      </section>

      {/* Main Chart Section */}
      <section className="main-chart-section card">
        <div className="chart-header">
          <h3 className="h3">{locale === 'id' ? 'Tren Performa Saluran' : 'Channel Performance Trend'}</h3>
          <div className="metric-tabs">
            {metrics.map(m => (
              <button 
                key={m.id}
                className={`metric-tab ${activeMetric === m.id ? 'active' : ''}`}
                onClick={() => setActiveMetric(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metrics.find(m => m.id === activeMetric).color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metrics.find(m => m.id === activeMetric).color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--text-dim)', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--text-dim)', fontSize: 12}}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: metrics.find(m => m.id === activeMetric).color }}
              />
              <Area 
                type="monotone" 
                dataKey={activeMetric} 
                stroke={metrics.find(m => m.id === activeMetric).color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMetric)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Summary Navigation Cards */}
      <div className="summary-nav-grid">
        {/* Needs Attention Card */}
        <motion.div 
          className="nav-summary-card card"
          whileHover={{ y: -5 }}
          onClick={() => navigate('/youtube/needs-attention')}
        >
          <div className="card-top">
            <div className="icon-box warning">
              <AlertTriangle size={20} />
            </div>
            <h4 className="h4">{locale === 'id' ? 'Perlu Perhatian' : 'Needs Attention'}</h4>
          </div>
          <div className="card-content">
            <div className="mini-stats-row">
              <div className="mini-stat">
                <span className="val danger">{criticalCount}</span>
                <span className="lab">{locale === 'id' ? 'Kritis' : 'Critical'}</span>
              </div>
              <div className="mini-stat">
                <span className="val warning">{warningCount}</span>
                <span className="lab">{locale === 'id' ? 'Peringatan' : 'Warning'}</span>
              </div>
            </div>
            <div className="highlight-box">
              <span className="box-label">{locale === 'id' ? 'Isu Teratas' : 'Top Issue'}</span>
              <p className="box-text"><strong>{topIssue.channel}</strong> - {topIssue.title} <span className="negative">{topIssue.impact}</span></p>
            </div>
          </div>
          <button className="btn btn-ghost full-width">
            {locale === 'id' ? 'Buka Perlu Perhatian' : 'Open Needs Attention'} <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Hall of Fame Card */}
        <motion.div 
          className="nav-summary-card card"
          whileHover={{ y: -5 }}
          onClick={() => navigate('/youtube/hall-of-fame')}
        >
          <div className="card-top">
            <div className="icon-box gold">
              <Award size={20} />
            </div>
            <h4 className="h4">Hall of Fame</h4>
          </div>
          <div className="card-content">
            <div className="champ-list-mini">
              <div className="champ-mini-item">
                <span className="champ-cat">Real-Time</span>
                <span className="champ-name">{rtChampion?.channel}</span>
              </div>
              <div className="champ-mini-item">
                <span className="champ-cat">{locale === 'id' ? 'Pendapatan' : 'Revenue'}</span>
                <span className="champ-name">{revChampion?.channel}</span>
              </div>
              <div className="champ-mini-item">
                <span className="champ-cat">CTR</span>
                <span className="champ-name">{ctrChampion?.channel}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost full-width">
            {locale === 'id' ? 'Buka Hall of Fame' : 'Open Hall of Fame'} <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Channel Health Card */}
        <motion.div 
          className="nav-summary-card card"
          whileHover={{ y: -5 }}
          onClick={() => navigate('/youtube/channels')}
        >
          <div className="card-top">
            <div className="icon-box primary">
              <Activity size={20} />
            </div>
            <h4 className="h4">{locale === 'id' ? 'Kesehatan Saluran' : 'Channel Health'}</h4>
          </div>
          <div className="card-content">
            <div className="mini-stats-row">
              <div className="mini-stat">
                <span className="val success">{activeChannels}</span>
                <span className="lab">{locale === 'id' ? 'Aktif' : 'Active'}</span>
              </div>
              <div className="mini-stat">
                <span className="val info">{growingChannels}</span>
                <span className="lab">{locale === 'id' ? 'Tumbuh' : 'Growing'}</span>
              </div>
              <div className="mini-stat">
                <span className="val danger">{reviewChannels}</span>
                <span className="lab">{locale === 'id' ? 'Tinjauan' : 'Review'}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost full-width">
            {locale === 'id' ? 'Lihat Semua Saluran' : 'View All Channels'} <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Monetization Card */}
        <motion.div 
          className="nav-summary-card card"
          whileHover={{ y: -5 }}
          onClick={() => navigate('/youtube/monetization')}
        >
          <div className="card-top">
            <div className="icon-box success">
              <DollarSign size={20} />
            </div>
            <h4 className="h4">{locale === 'id' ? 'Monetisasi' : 'Monetization'}</h4>
          </div>
          <div className="card-content">
            <div className="mon-details-mini">
              <div className="mon-main-stat">
                <span className="mon-val">{monetizationStats.totalRevenue}</span>
                <span className="mon-lab">{locale === 'id' ? 'Estimasi Pendapatan' : 'Estimated Revenue'}</span>
              </div>
              <div className="mini-grid-2">
                <div className="m-item"><span>RPM</span><strong>{monetizationStats.rpm}</strong></div>
                <div className="m-item"><span>CPM</span><strong>{monetizationStats.cpm}</strong></div>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost full-width">
            {locale === 'id' ? 'Buka Monetisasi' : 'Open Monetization'} <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
