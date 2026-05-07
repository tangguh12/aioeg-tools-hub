import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LabelList
} from 'recharts';
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, Info, Download, 
  Eye, TrendingUp, Layout, ChevronDown, ChevronUp, Calendar, Clock, X, BarChart2, Plus
} from 'lucide-react';
import './Monetization.css';

export default function Monetization() {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const { allChannels = [] } = useAuth();
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [timeRange, setTimeRange] = useState('28'); 
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRangeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const realRevenueData = useMemo(() => {
    return allChannels.map((ch, idx) => ({
      id: ch.id,
      name: ch.title,
      value: parseFloat(ch.analytics?.revenue || 0),
      rpm: ch.analytics?.rpm || '0.00',
      views: ch.analytics?.views28d || 0,
      avatar: ch.title[0],
      thumbnail: ch.thumbnail,
      chartRows: ch.analytics?.chartRows || []
    })).sort((a, b) => b.value - a.value);
  }, [allChannels]);

  const totalRevenue = useMemo(() => {
    return realRevenueData.reduce((acc, curr) => acc + curr.value, 0);
  }, [realRevenueData]);

  const mainChartData = useMemo(() => {
    const combinedData = {};
    let rangeInt = parseInt(timeRange) || 28;
    
    if (timeRange === 'all' || timeRange === '365' || timeRange.length === 4) {
      rangeInt = 365;
    }

    allChannels.forEach(ch => {
      const rows = ch.analytics?.chartRows || [];
      const slice = rows.slice(-rangeInt);
      
      slice.forEach(row => {
        const dateStr = row[0];
        if (!combinedData[dateStr]) {
          combinedData[dateStr] = { 
            name: new Date(dateStr).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }), 
            revenue: 0,
            rawDate: dateStr
          };
        }
        combinedData[dateStr].revenue += (row[5] || 0);
      });
    });

    const sortedData = Object.values(combinedData).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
    if (sortedData.length === 0) return [{ name: 'No Data', revenue: 0 }];
    return sortedData;
  }, [allChannels, timeRange, locale]);

  const formatCurrency = (val) => {
    if (val === 0) return '0';
    if (val > 10000) return 'Rp ' + Math.round(val).toLocaleString('id-ID');
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const fmtNum = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const getRangeLabel = (val) => {
    if (val === '7') return locale === 'id' ? '7 hari terakhir' : 'Last 7 days';
    if (val === '28') return locale === 'id' ? '28 hari terakhir' : 'Last 28 days';
    if (val === '90') return locale === 'id' ? '90 hari terakhir' : 'Last 90 days';
    if (val === '365') return locale === 'id' ? '365 hari terakhir' : 'Last 365 days';
    if (val === 'all') return locale === 'id' ? 'Semua' : 'Lifetime';
    if (val === 'custom') return locale === 'id' ? 'Kustom' : 'Custom';
    return val;
  };

  const ranges = [
    { value: '7', label: locale === 'id' ? '7 hari terakhir' : 'Last 7 days' },
    { value: '28', label: locale === 'id' ? '28 hari terakhir' : 'Last 28 days' },
    { value: '90', label: locale === 'id' ? '90 hari terakhir' : 'Last 90 days' },
    { value: '365', label: locale === 'id' ? '365 hari terakhir' : 'Last 365 days' },
    { value: 'all', label: locale === 'id' ? 'Semua' : 'Lifetime' },
    { divider: true },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { divider: true },
    { value: 'Mei', label: locale === 'id' ? 'Mei' : 'May' },
    { value: 'April', label: locale === 'id' ? 'April' : 'April' },
    { value: 'Maret', label: locale === 'id' ? 'Maret' : 'March' },
    { divider: true },
    { value: 'custom', label: locale === 'id' ? 'Kustom' : 'Custom' },
  ];

  const handleSelectRange = (val) => {
    if (val === 'custom') {
      setIsCustomMode(true);
    } else {
      setTimeRange(val);
      setIsCustomMode(false);
      setShowRangeDropdown(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedChannel(expandedChannel === id ? null : id);
  };

  const getMonthlyBreakdown = (chartRows) => {
    if (!chartRows || chartRows.length === 0) return [];
    const months = {};
    chartRows.forEach(row => {
      const date = new Date(row[0]);
      const monthName = date.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long' });
      if (!months[monthName]) months[monthName] = 0;
      months[monthName] += (row[5] || 0);
    });
    return Object.entries(months).map(([name, val]) => ({ month: name, revenue: val })).reverse();
  };

  const renderRevenueByChannel = () => {
    if (allChannels.length === 0) {
      return (
        <div className="empty-state-inner">
          <BarChart2 size={40} className="p-muted mb-16" />
          <h4 className="h4">{t('noRevData')}</h4>
          <p className="p-muted">{t('connectToTrack')}</p>
        </div>
      );
    }

    if (allChannels.length === 1) {
      const ch = realRevenueData[0];
      return (
        <div className="single-ch-summary">
          <div className="ch-info-top">
            <div className="ch-avatar-large">
              {ch.thumbnail ? <img src={ch.thumbnail} alt="" /> : <span>{ch.avatar}</span>}
            </div>
            <div>
              <h4 className="h4">{ch.name}</h4>
              <div className="status-badge gold"><TrendingUp size={12} /> {t('topEarningChannel')}</div>
            </div>
          </div>
          <div className="ch-metrics-grid">
            <div className="ch-metric-item">
              <span className="p-muted">{t('totalRevenueLabel')}</span>
              <div className="val">{formatCurrency(ch.value)}</div>
            </div>
            <div className="ch-metric-item">
              <span className="p-muted">RPM</span>
              <div className="val">{formatCurrency(parseFloat(ch.rpm))}</div>
            </div>
          </div>
          <div className="helper-box">
            <Info size={14} />
            <span>{t('addMoreChannelsPrompt')}</span>
          </div>
        </div>
      );
    }

    // Multiple channels - Horizontal Bar Chart
    return (
      <div className="bar-chart-container">
        <ResponsiveContainer width="100%" height={Math.max(250, realRevenueData.length * 60)}>
          <BarChart data={realRevenueData.slice(0, 5)} layout="vertical" margin={{ left: 20, right: 60, top: 10, bottom: 10 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={(props) => {
                const { x, y, payload, index } = props;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={-10} y={0} dy={4} textAnchor="end" fill="var(--text-main)" fontSize={12} fontWeight={600}>
                      #{index + 1} {payload.value.length > 15 ? payload.value.substring(0, 12) + '...' : payload.value}
                    </text>
                  </g>
                );
              }}
              width={140}
            />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.03)'}}
              contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-xl)' }}
              formatter={(value) => [formatCurrency(value), t('pendapatan')]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {realRevenueData.slice(0, 5).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(99, 102, 241, 0.4)'} />
              ))}
              <LabelList 
                dataKey="value" 
                position="right" 
                formatter={(val) => formatCurrency(val)} 
                style={{ fill: 'var(--text-main)', fontSize: '11px', fontWeight: 700 }} 
                offset={10} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="monetization-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('monetizationOverview')}</h2>
          <p className="p-muted">{t('revenueSummary')}</p>
        </div>
        <div className="page-actions">
          <div className="custom-dropdown-wrap" ref={dropdownRef}>
            <button className="period-selector-btn" onClick={() => setShowRangeDropdown(!showRangeDropdown)}>
              <Clock size={18} />
              <span>{getRangeLabel(timeRange)}</span>
              <ChevronDown size={16} />
            </button>
            
            <AnimatePresence>
              {showRangeDropdown && (
                <motion.div 
                  className="period-dropdown-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {!isCustomMode ? (
                    <div className="range-options-list">
                      {ranges.map((r, i) => (
                        r.divider ? <div key={`div-${i}`} className="dropdown-divider" /> : (
                          <button 
                            key={r.value} 
                            className={`range-opt ${timeRange === r.value ? 'active' : ''}`}
                            onClick={() => handleSelectRange(r.value)}
                          >
                            {r.label}
                          </button>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="custom-range-picker">
                      <div className="picker-header">
                        <span>{locale === 'id' ? 'Pilih Rentang' : 'Select Range'}</span>
                        <button className="icon-btn-xs" onClick={() => setIsCustomMode(false)}><X size={14} /></button>
                      </div>
                      <div className="picker-body">
                        <div className="date-input-group">
                          <label>{locale === 'id' ? 'Mulai' : 'Start'}</label>
                          <input 
                            type="date" 
                            value={customRange.start} 
                            onChange={e => setCustomRange({...customRange, start: e.target.value})} 
                            onClick={(e) => e.target.showPicker?.()}
                          />
                        </div>
                        <div className="date-input-group">
                          <label>{locale === 'id' ? 'Selesai' : 'End'}</label>
                          <input 
                            type="date" 
                            value={customRange.end} 
                            onChange={e => setCustomRange({...customRange, end: e.target.value})} 
                            onClick={(e) => e.target.showPicker?.()}
                          />
                        </div>
                        <button className="btn btn-primary btn-full mt-12" onClick={() => { setTimeRange('custom'); setShowRangeDropdown(false); }}>
                          {locale === 'id' ? 'Terapkan' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="btn btn-secondary"><Download size={16} /> {t('exportData')}</button>
        </div>
      </header>

      {allChannels.length === 0 ? (
        <div className="card empty-state-full">
          <DollarSign size={64} className="p-muted mb-24" />
          <h2 className="h2">{t('noRevData')}</h2>
          <p className="p-muted mb-24">{t('connectToTrack')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/youtube/channels')}><Plus size={16} /> {t('addChannel')}</button>
        </div>
      ) : (
        <>
          <section className="revenue-hero">
            <div className="card hero-main">
              <div className="hero-header">
                <div>
                  <span className="p-muted">{t('totalRevenueLabel')}</span>
                  <h1 className="h1">{formatCurrency(totalRevenue)}</h1>
                  <div className="revenue-badge positive">
                    <ArrowUpRight size={16} /> 12.5%
                  </div>
                </div>
                <div className="hero-stats">
                  <div className="h-stat">
                    <span>{t('averageRPMLabel')}</span>
                    <strong>{formatCurrency(parseFloat(realRevenueData.reduce((s, c) => s + parseFloat(c.rpm), 0) / (realRevenueData.length || 1)))}</strong>
                  </div>
                  <div className="h-stat">
                    <span>{t('activeChannelsLabel')}</span>
                    <strong>{allChannels.length}</strong>
                  </div>
                </div>
              </div>
              <div className="hero-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mainChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} dy={10} minTickGap={20} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-xl)' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                      formatter={(value) => [formatCurrency(value), t('pendapatan')]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="hero-sidebar">
              <div className="card forecast-card">
                <h3 className="h3">{t('revenueForecastLabel')}</h3>
                <p className="p-muted">{t('projected30dLabel')}</p>
                <div className="forecast-value">{formatCurrency(totalRevenue * 1.1)}</div>
                <div className="progress-bar-container">
                  <div className="progress-label">
                    <span>{t('payoutProgressLabel')}</span>
                    <span>84%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `84%` }}></div>
                  </div>
                </div>
              </div>

              <div className="card top-earner-card">
                <h4 className="p-muted">{t('topEarningChannel')}</h4>
                <div className="earner-info">
                  <div className="earner-avatar-box">
                    {realRevenueData[0]?.thumbnail ? (
                      <img src={realRevenueData[0].thumbnail} alt="" className="earner-img" />
                    ) : (
                      <div className="earner-logo">{realRevenueData[0]?.avatar}</div>
                    )}
                  </div>
                  <div>
                    <div className="earner-name">{realRevenueData[0]?.name}</div>
                    <div className="earner-val">{formatCurrency(realRevenueData[0]?.value)} <TrendingUp size={14} className="positive" /></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mon-grid">
            <section className="card rev-by-ch-card">
              <div className="section-header-compact">
                <h3 className="h3">{t('revenueByChannelTitle')}</h3>
                <p className="p-muted">{t('revenueByChannelSub')}</p>
              </div>
              <div className="chart-wrapper-flex">
                {renderRevenueByChannel()}
              </div>
            </section>

            <section className="card stats-table-card">
              <h3 className="h3">{t('revenuePerformance')}</h3>
              <table className="mon-table">
                <thead>
                  <tr>
                    <th>{t('colChannel')}</th>
                    <th>{t('pendapatan')}</th>
                    <th>RPM</th>
                    <th>{t('penayangan')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {realRevenueData.map(ch => (
                    <React.Fragment key={ch.id}>
                      <tr className={`clickable-row ${expandedChannel === ch.id ? 'expanded' : ''}`} onClick={() => toggleExpand(ch.id)}>
                        <td className="ch-cell-with-img">
                          <div className="ch-table-img">
                            {ch.thumbnail ? <img src={ch.thumbnail} alt="" /> : <span>{ch.avatar}</span>}
                          </div>
                          <span className="ch-name-link">{ch.name}</span>
                        </td>
                        <td className="fw-bold">{formatCurrency(ch.value)}</td>
                        <td>{formatCurrency(parseFloat(ch.rpm))}</td>
                        <td>{fmtNum(ch.views)}</td>
                        <td>
                          {expandedChannel === ch.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                      </tr>
                      
                      <AnimatePresence>
                        {expandedChannel === ch.id && (
                          <tr>
                            <td colSpan="5" className="expanded-row-cell">
                              <motion.div 
                                className="monthly-breakdown-box"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <div className="breakdown-header">
                                  <Calendar size={14} />
                                  <span>{locale === 'id' ? 'Rincian Pendapatan Bulanan' : 'Monthly Earnings Breakdown'}</span>
                                </div>
                                <div className="breakdown-grid">
                                  {(ch.chartRows.length > 0 ? getMonthlyBreakdown(ch.chartRows) : []).map((m, idx) => (
                                    <div key={idx} className="breakdown-item">
                                      <span className="b-month">{m.month}</span>
                                      <span className="b-val">{formatCurrency(m.revenue)}</span>
                                      <div className="b-bar-wrap">
                                        <div className="b-bar-fill" style={{ width: `${Math.min(100, (m.revenue / (ch.value || 1)) * 100)}%` }}></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
