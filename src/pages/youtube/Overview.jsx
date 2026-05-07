import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';
import { 
  kpiData as rawKpiData, 
  detailedAlerts, 
} from '../../data/mockData';
import { chartData } from '../../data/chartData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip
} from 'recharts';
import { 
  RefreshCw,
  Clock,
  Users,
  Activity,
  DollarSign,
  ArrowRight,
  Plus,
  Play,
  Award,
  AlertTriangle,
  Download
} from 'lucide-react';
import './Overview.css';

export default function Overview() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const { allChannels = [], connectedAccounts = [], isLoading, refreshAccount } = useAuth();
  const { hasPermission } = usePermissions();
  const [activeMetric, setActiveMetric] = useState('views');
  
  const hasRealData = allChannels.length > 0;

  const fmt = (n) => {
    const num = parseFloat(n) || 0;
    if (num >= 1000000) {
      return locale === 'id' 
        ? (num / 1000000).toFixed(1).replace('.', ',') + ' jt' 
        : (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return locale === 'id' 
        ? (num / 1000).toFixed(1).replace('.', ',') + ' rb' 
        : (num / 1000).toFixed(1) + 'K';
    }
    return locale === 'id' ? num.toLocaleString('id-ID') : num.toLocaleString('en-US');
  };

  function formatCurrency(val) {
    const num = parseFloat(val) || 0;
    if (num === 0) return '$0';
    if (num > 10000) return 'Rp ' + Math.round(num).toLocaleString('id-ID');
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  const handleManualSync = () => {
    connectedAccounts.forEach(acc => refreshAccount(acc.email));
  };

  const kpiData = hasRealData ? [
    { id: 'views', label: t('totalRealTimeViews'), value: fmt(allChannels.reduce((s, ch) => s + (ch.analytics?.rtViews || 0), 0)), period: t('last48Hours'), icon: <RefreshCw size={16} /> },
    { id: 'views', label: locale === 'id' ? 'Total Penayangan' : 'Total Views', value: fmt(allChannels.reduce((s, ch) => s + (ch.analytics?.views28d || 0), 0)), period: t('last28Days'), icon: <Play size={16} /> },
    { id: 'watchTime', label: t('totalWatchTime'), value: fmt(allChannels.reduce((s, ch) => s + (ch.analytics?.watchTimeHours || 0), 0)) + (locale === 'id' ? ' jam' : ' hrs'), period: t('last28Days'), icon: <Clock size={16} /> },
    { id: 'views', label: t('avgRetention'), value: (allChannels.reduce((s, ch) => s + parseFloat(ch.analytics?.avgRetention || 0), 0) / (allChannels.length || 1)).toFixed(1).replace('.', ',') + '%', period: t('last28Days'), icon: <Activity size={16} /> },
    { id: 'watchTime', label: t('avgAVD'), value: allChannels[0]?.analytics?.avgAVD || '0:00', period: t('last28Days'), icon: <Users size={16} /> },
    ...(hasPermission('monetization') ? [{ id: 'revenue', label: t('totalEstimatedRevenue'), value: formatCurrency(allChannels.reduce((s, ch) => s + (ch.analytics?.revenue || 0), 0)), period: t('last28Days'), icon: <DollarSign size={16} /> }] : [])
  ] : rawKpiData.filter(stat => hasPermission('monetization') || stat.id !== 'revenue');

  const activeChartData = hasRealData ? (() => {
    const dateMap = {};
    allChannels.forEach(ch => {
      (ch.analytics?.chartRows || []).forEach(row => {
        const date = row[0];
        if (!dateMap[date]) dateMap[date] = { 
          name: new Date(date).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }), 
          views: 0, watchTime: 0, revenue: 0 
        };
        dateMap[date].views += row[1] || 0;
        dateMap[date].watchTime += (row[2] || 0) / 60;
        dateMap[date].revenue += row[5] || 0;
      });
    });
    return Object.values(dateMap).sort((a,b) => new Date(a.name) - new Date(b.name));
  })() : chartData;

  const metrics = [
    { id: 'views', label: t('penayangan'), color: '#6366f1' },
    { id: 'watchTime', label: t('waktuTonton'), color: '#10b981' },
    ...(hasPermission('monetization') ? [{ id: 'revenue', label: t('pendapatan'), color: '#ef4444' }] : [])
  ];

  return (
    <div className="overview-container">
      <header className="page-header-v4">
        <div className="header-v4-left">
          <h2 className="h2">{t('ytOperations')}</h2>
          <p className="p-muted">{t('ytOpsDesc')}</p>
        </div>
        <div className="header-v4-right">
          <button className="btn btn-secondary btn-sm" title={t('exportData')}><Download size={16} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/youtube/channels')}><Plus size={16} /> {t('addChannel')}</button>
        </div>
      </header>

      <section className="kpi-grid-v4 mt-32">
        {kpiData.map((stat, i) => (
          <motion.div 
            key={i} 
            className={`kpi-card-v4 ${activeMetric === stat.id ? 'active' : ''}`}
            onClick={() => stat.id && setActiveMetric(stat.id)}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          >
            <div className="kpi-v4-header">
              <span className="kpi-v4-label">{stat.label}</span>
              <div className="kpi-v4-icon">{stat.icon}</div>
            </div>
            <div className="kpi-v4-body">
              <div className="kpi-v4-value">{stat.value}</div>
              <div className="kpi-v4-period">{stat.period}</div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="chart-card-v4 mt-32">
        <div className="chart-v4-header">
          <h3 className="h3">{locale === 'id' ? 'Tren Performa Saluran' : 'Channel Performance Trend'}</h3>
          <div className="chart-tabs-v4">
            {metrics.map(m => (
              <button key={m.id} className={`chart-tab-v4 ${activeMetric === m.id ? 'active' : ''}`} onClick={() => setActiveMetric(m.id)}>{m.label}</button>
            ))}
          </div>
        </div>
        <div className="chart-v4-container">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={activeChartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metrics.find(m => m.id === activeMetric).color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metrics.find(m => m.id === activeMetric).color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 11}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12} } />
              <ChartTooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                formatter={(val) => [ activeMetric === 'revenue' ? formatCurrency(val) : fmt(val), metrics.find(m => m.id === activeMetric).label ]}
              />
              <Area type="monotone" dataKey={activeMetric} stroke={metrics.find(m => m.id === activeMetric).color} fillOpacity={1} fill="url(#colorMetric)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="summary-grid-v4 mt-32">
        <motion.div className="nav-card-v4" onClick={() => navigate('/youtube/channels')} whileHover={{ y: -5 }}>
          <div className="nav-card-v4-header">
            <div className="nav-icon primary"><Users size={20} /></div>
            <h4 className="h4">{t('allChannels')}</h4>
          </div>
          <div className="nav-card-v4-body">
            {hasRealData ? (
              <div className="ch-stack-v4">
                {allChannels.slice(0, 2).map(ch => (
                  <div key={ch.id} className="ch-row-v4">
                    <img src={ch.thumbnail} alt="" className="ch-img-v4" />
                    <div className="ch-info-v4">
                      <div className="ch-name-v4">{ch.title}</div>
                      <div className="ch-subs-v4">{fmt(ch.subscribers)} subs</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="no-data-v4">No channels connected.</div>}
          </div>
          <button className="btn btn-ghost btn-full">{t('viewAllChannels')} <ArrowRight size={16} /></button>
        </motion.div>

        {hasPermission('monetization') && (
          <motion.div className="nav-card-v4" onClick={() => navigate('/youtube/monetization')} whileHover={{ y: -5 }}>
            <div className="nav-card-v4-header">
              <div className="nav-icon success"><DollarSign size={20} /></div>
              <h4 className="h4">{t('monetization')}</h4>
            </div>
            <div className="nav-card-v4-body">
              <div className="v-big-v4 success">{formatCurrency(allChannels.reduce((s, ch) => s + (ch.analytics?.revenue || 0), 0))}</div>
              <div className="v-sub-v4">Total Revenue (28d)</div>
            </div>
            <button className="btn btn-ghost btn-full">{t('openMonetization')} <ArrowRight size={16} /></button>
          </motion.div>
        )}

        <motion.div className="nav-card-v4" onClick={() => navigate('/youtube/needs-attention')} whileHover={{ y: -5 }}>
          <div className="nav-card-v4-header">
            <div className="nav-icon danger"><AlertTriangle size={20} /></div>
            <h4 className="h4">{locale === 'id' ? 'Perlu Perhatian' : 'Needs Attention'}</h4>
          </div>
          <div className="nav-card-v4-body">
            <div className="v-big-v4 danger">{detailedAlerts.filter(a=>a.severity==='critical').length}</div>
            <div className="v-sub-v4">Critical Issues</div>
          </div>
          <button className="btn btn-ghost btn-full">{locale === 'id' ? 'Lihat Tugas' : 'View Tasks'} <ArrowRight size={16} /></button>
        </motion.div>

        <motion.div className="nav-card-v4" onClick={() => navigate('/youtube/hall-of-fame')} whileHover={{ y: -5 }}>
          <div className="nav-card-v4-header">
            <div className="nav-icon warning"><Award size={20} /></div>
            <h4 className="h4">Hall of Fame</h4>
          </div>
          <div className="nav-card-v4-body">
            <div className="hof-v4-item">
              <Award size={20} className="text-warning" />
              <span>{allChannels.sort((a,b)=>b.subscribers-a.subscribers)[0]?.title || 'Top Channel'}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-full">{locale === 'id' ? 'Lihat Prestasi' : 'View Achievements'} <ArrowRight size={16} /></button>
        </motion.div>
      </div>
    </div>
  );
}
