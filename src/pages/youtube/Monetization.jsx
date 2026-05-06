import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { monetizationStats } from '../../data/mockData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight, Info, Download, Eye, TrendingUp } from 'lucide-react';
import './Monetization.css';

const chartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const revenueByChannel = [
  { name: 'Finance Hub', value: 5200 },
  { name: 'Tech Insider', value: 4200 },
  { name: 'Gaming Pro', value: 3100 },
  { name: 'AI Future', value: 2400 },
  { name: 'Cooking Daily', value: 1800 },
  { name: 'Travel Vlogs', value: 900 },
];

export default function Monetization() {
  const { t } = useLanguage();

  return (
    <div className="monetization-container">
      <header className="page-header">
        <div>
          <h2 className="h2">{t('finIntel')}</h2>
          <p className="p-muted">{t('finIntelDesc')}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Download size={16} /> {t('exportData')}</button>
        </div>
      </header>

      <section className="revenue-hero">
        <div className="card hero-main">
          <div className="hero-header">
            <div>
              <span className="p-muted">{t('totalRevenue')}</span>
              <h1 className="h1">{monetizationStats.totalRevenue}</h1>
              <div className="revenue-badge positive">
                <ArrowUpRight size={16} /> 12.5%
              </div>
            </div>
            <div className="hero-stats">
              <div className="h-stat">
                <span>RPM</span>
                <strong>{monetizationStats.rpm}</strong>
              </div>
              <div className="h-stat">
                <span>CPM</span>
                <strong>{monetizationStats.cpm}</strong>
              </div>
            </div>
          </div>
          <div className="hero-chart">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="hero-footer">
            <p className="p-muted"><Info size={14} /> {t('estRevNote')}</p>
          </div>
        </div>

        <div className="hero-sidebar">
          <div className="card forecast-card">
            <h3 className="h3">{t('revForecast')}</h3>
            <p className="p-muted">{t('projected30d')}</p>
            <div className="forecast-value">$28,450</div>
            <div className="progress-bar-container">
              <div className="progress-label">
                <span>{t('payoutProgress')}</span>
                <span>{monetizationStats.payoutProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${monetizationStats.payoutProgress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="card top-earner-card">
            <h4 className="p-muted">{t('topEarner')}</h4>
            <div className="earner-info">
              <div className="earner-logo">FH</div>
              <div>
                <div className="earner-name">{monetizationStats.topEarning}</div>
                <div className="earner-val">$8,200 <TrendingUp size={14} className="positive" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mon-grid">
        <section className="card">
          <h3 className="h3">{t('revByChannel')}</h3>
          <div className="bar-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByChannel} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--text-main)', fontSize: 12}} width={100} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {revenueByChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(99, 102, 241, 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card stats-table-card">
          <h3 className="h3">{t('revPerformance')}</h3>
          <table className="mon-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Revenue</th>
                <th>RPM</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {revenueByChannel.map(ch => (
                <tr key={ch.name}>
                  <td>{ch.name}</td>
                  <td className="fw-bold">${ch.value.toLocaleString()}</td>
                  <td>${(Math.random() * 5 + 2).toFixed(2)}</td>
                  <td>{(Math.random() * 100 + 10).toFixed(1)}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
