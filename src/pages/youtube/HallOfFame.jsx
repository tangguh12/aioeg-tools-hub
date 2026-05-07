import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Trophy, 
  Crown, 
  Medal, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Search, 
  Filter,
  Users,
  Eye,
  Clock,
  MousePointer2,
  BarChart3,
  Timer,
  DollarSign,
  Rocket
} from 'lucide-react';
import './HallOfFame.css';

export default function HallOfFame() {
  const { locale } = useLanguage();
  const { allChannels = [] } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const categories = [
    { id: 'All', label: locale === 'id' ? 'Semua' : 'All', icon: <Trophy size={16} /> },
    { id: 'Subscribers', label: locale === 'id' ? 'Subs' : 'Subscribers', icon: <Users size={16} />, key: 'subscribers' },
    { id: 'Views', label: locale === 'id' ? 'Penayangan' : 'Views', icon: <Eye size={16} />, key: 'views28d' },
    { id: 'Watch Time', label: locale === 'id' ? 'Waktu Tonton' : 'Watch Time', icon: <Clock size={16} />, key: 'watchTimeHours' },
    { id: 'CTR', label: 'CTR', icon: <MousePointer2 size={16} />, key: 'ctr' },
    { id: 'Retention', label: locale === 'id' ? 'Retensi' : 'Retention', icon: <BarChart3 size={16} />, key: 'avgRetention' },
  ];

  // Map real data to leaderboard format
  const realLeaderboards = useMemo(() => {
    const data = {};
    categories.forEach(cat => {
      if (cat.id === 'All') return;
      
      const sorted = [...allChannels]
        .map(ch => ({
          rank: 0,
          channel: ch.title,
          avatar: ch.title[0],
          value: cat.key === 'subscribers' ? ch.subscribers : (ch.analytics?.[cat.key] || 0),
          trend: '+0%', // Placeholder
          status: 'Active',
          color: '#6366f1',
          numericValue: parseFloat(cat.key === 'subscribers' ? ch.subscribers : (ch.analytics?.[cat.key] || 0))
        }))
        .sort((a, b) => b.numericValue - a.numericValue)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));
      
      data[cat.id] = sorted;
    });
    return data;
  }, [allChannels, locale]);

  const hallOfFame = useMemo(() => {
    return categories
      .filter(c => c.id !== 'All')
      .map(cat => {
        const leader = realLeaderboards[cat.id]?.[0];
        return {
          category: cat.id + ' Champion',
          channel: leader?.channel || '---',
          avatar: leader?.avatar || '?',
          value: leader?.value || '0',
          trend: leader?.trend || '+0%',
          color: '#6366f1'
        };
      });
  }, [realLeaderboards]);

  const activeLeaderboard = useMemo(() => {
    const list = realLeaderboards[activeTab] || [];
    if (!search) return list;
    return list.filter(item => item.channel.toLowerCase().includes(search.toLowerCase()));
  }, [realLeaderboards, activeTab, search]);

  const activeChampion = useMemo(() => {
    if (activeTab === 'All') return null;
    return hallOfFame.find(h => h.category === activeTab + ' Champion');
  }, [hallOfFame, activeTab]);

  const formatValue = (val, catId) => {
    if (!val) return '0';
    if (catId === 'CTR' || catId === 'Retention') return val + '%';
    if (catId === 'Watch Time') return val + 'h';
    const n = parseInt(val);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <div className="hall-of-fame-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">Hall of Fame</h2>
          <p className="p-muted">
            {locale === 'id' 
              ? 'Merayakan saluran YouTube dengan performa terbaik dari data asli Anda' 
              : 'Celebrating top-performing YouTube channels from your real data'}
          </p>
        </div>
        <div className="page-actions">
          <div className="ac-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder={locale === 'id' ? 'Cari saluran...' : 'Search channels...'} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary"><Calendar size={16} /> Last 28 Days</button>
        </div>
      </header>

      {allChannels.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Trophy size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '16px' }} />
          <h3 className="h3">No Data Connected</h3>
          <p className="p-muted">Connect your YouTube account to see real performance leaders.</p>
        </div>
      )}

      {allChannels.length > 0 && (
        <>
          <nav className="category-tabs-container">
            <div className="category-tabs">
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  className={`cat-tab ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <AnimatePresence mode="wait">
            {activeTab === 'All' ? (
              <motion.div 
                key="all-winners"
                className="all-winners-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {hallOfFame.map((winner, i) => (
                  <motion.div 
                    key={winner.category} 
                    className="winner-card-minimal"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="crown-mini"><Crown size={14} /></div>
                    <div className="winner-avatar-mini" style={{ border: `2px solid ${winner.color}` }}>{winner.avatar}</div>
                    <div className="winner-info-mini">
                      <span className="winner-cat-mini">{winner.category.replace(' Champion', '')}</span>
                      <span className="winner-name-mini">{winner.channel}</span>
                    </div>
                    <div className="winner-value-mini" style={{ color: winner.color }}>
                      {formatValue(winner.value, winner.category.replace(' Champion', ''))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key={activeTab}
                className="category-showcase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {activeChampion && (
                  <div className="hero-champion-section">
                    <motion.div 
                      className="hero-card"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <div className="hero-glow" style={{ background: `radial-gradient(circle, ${activeChampion.color}22 0%, transparent 70%)` }}></div>
                      <div className="hero-crown"><Crown size={48} /></div>
                      <div className="hero-avatar-wrapper">
                        <div className="hero-avatar" style={{ boxShadow: `0 0 30px ${activeChampion.color}44`, border: `4px solid ${activeChampion.color}` }}>
                          {activeChampion.avatar}
                        </div>
                      </div>
                      <h3 className="hero-name">{activeChampion.channel}</h3>
                      <p className="hero-label">{activeTab} {locale === 'id' ? 'Juara' : 'Champion'}</p>
                      <div className="hero-value" style={{ color: activeChampion.color }}>
                        {formatValue(activeChampion.value, activeTab)}
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="leaderboard-section card">
                  <div className="lb-header">
                    <h4 className="h4">{locale === 'id' ? 'Papan Peringkat Lengkap' : 'Full Leaderboard'}</h4>
                  </div>
                  <div className="lb-table-wrapper">
                    <table className="lb-table">
                      <thead>
                        <tr>
                          <th>{locale === 'id' ? 'Peringkat' : 'Rank'}</th>
                          <th>{locale === 'id' ? 'Saluran' : 'Channel'}</th>
                          <th>{activeTab}</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeLeaderboard.map((item) => (
                          <tr key={item.channel}>
                            <td className="td-rank">#{item.rank}</td>
                            <td className="td-channel">
                              <div className="ch-cell">
                                <div className="ch-avatar">{item.avatar}</div>
                                <span>{item.channel}</span>
                              </div>
                            </td>
                            <td className="td-value">{formatValue(item.value, activeTab)}</td>
                            <td>
                              <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
