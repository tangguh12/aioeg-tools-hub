import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { hallOfFame, leaderboards } from '../../data/mockData';
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
  const [activeTab, setActiveTab] = useState('All');

  const categories = [
    { id: 'All', label: locale === 'id' ? 'Semua' : 'All', icon: <Trophy size={16} /> },
    { id: 'Top Subscribers', label: locale === 'id' ? 'Top Subs' : 'Top Subscribers', icon: <Users size={16} />, championKey: 'Subscribers Champion' },
    { id: 'Top Real-Time', label: locale === 'id' ? 'Top Real-Time' : 'Top Real-Time', icon: <Eye size={16} />, championKey: 'Real-Time Champion' },
    { id: 'Top Watch Time', label: locale === 'id' ? 'Top Waktu Tonton' : 'Top Watch Time', icon: <Clock size={16} />, championKey: 'Watch Time Champion' },
    { id: 'Top CTR', label: 'Top CTR', icon: <MousePointer2 size={16} />, championKey: 'CTR Champion' },
    { id: 'Top Retention', label: locale === 'id' ? 'Top Retensi' : 'Top Retention', icon: <BarChart3 size={16} />, championKey: 'Retention Champion' },
    { id: 'Top AVD', label: 'Top AVD', icon: <Timer size={16} />, championKey: 'AVD Champion' },
    { id: 'Top Revenue', label: locale === 'id' ? 'Top Pendapatan' : 'Top Revenue', icon: <DollarSign size={16} />, championKey: 'Revenue Champion' },
    { id: 'Top Growth', label: locale === 'id' ? 'Top Pertumbuhan' : 'Top Growth', icon: <Rocket size={16} />, championKey: 'Fastest Growing' },
  ];

  const getActiveChampion = () => {
    const cat = categories.find(c => c.id === activeTab);
    if (!cat || !cat.championKey) return null;
    return hallOfFame.find(h => h.category === cat.championKey);
  };

  const activeChampion = getActiveChampion();
  const activeLeaderboard = leaderboards[activeTab] || [];

  return (
    <div className="hall-of-fame-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{locale === 'id' ? 'Hall of Fame' : 'Hall of Fame'}</h2>
          <p className="p-muted">
            {locale === 'id' 
              ? 'Merayakan saluran YouTube dengan performa terbaik di berbagai metrik utama' 
              : 'Celebrating the top-performing YouTube channels across key metrics'}
          </p>
        </div>
        <div className="page-actions">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder={locale === 'id' ? 'Cari saluran...' : 'Search channels...'} />
          </div>
          <button className="btn btn-secondary"><Calendar size={16} /> Last 28 Days</button>
          <button className="btn btn-secondary"><Filter size={16} /> Filters</button>
        </div>
      </header>

      {/* Category Tabs */}
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
                  <span className="winner-name-mini">{winner.channel}</span>
                  <span className="winner-cat-mini">{winner.category.replace(' Champion', '')}</span>
                </div>
                <div className="winner-value-mini" style={{ color: winner.color }}>{winner.value}</div>
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
            {/* Hero Champion Section */}
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
                  <div className="hero-value" style={{ color: activeChampion.color }}>{activeChampion.value}</div>
                  <div className="hero-trend positive">
                    <TrendingUp size={16} /> {activeChampion.trend} {locale === 'id' ? 'vs bulan lalu' : 'vs last month'}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Podium Section */}
            <div className="podium-section">
              <div className="podium-container">
                {/* Rank 2 - Silver */}
                <div className="podium-spot spot-2">
                  <div className="podium-rank silver">#2</div>
                  <div className="podium-card">
                    <div className="podium-medal silver"><Medal size={20} /></div>
                    <div className="podium-avatar">{activeLeaderboard[1]?.avatar || '?'}</div>
                    <div className="podium-info">
                      <span className="p-name">{activeLeaderboard[1]?.channel || '---'}</span>
                      <span className="p-val">{activeLeaderboard[1]?.value || '--'}</span>
                    </div>
                  </div>
                  <div className="podium-base silver-base"></div>
                </div>

                {/* Rank 1 - Gold */}
                <div className="podium-spot spot-1">
                  <div className="podium-rank gold">#1</div>
                  <div className="podium-card gold-card">
                    <div className="podium-crown"><Crown size={28} /></div>
                    <div className="podium-avatar">{activeLeaderboard[0]?.avatar || '?'}</div>
                    <div className="podium-info">
                      <span className="p-name">{activeLeaderboard[0]?.channel || '---'}</span>
                      <span className="p-val">{activeLeaderboard[0]?.value || '--'}</span>
                    </div>
                  </div>
                  <div className="podium-base gold-base"></div>
                </div>

                {/* Rank 3 - Bronze */}
                <div className="podium-spot spot-3">
                  <div className="podium-rank bronze">#3</div>
                  <div className="podium-card">
                    <div className="podium-medal bronze"><Medal size={20} /></div>
                    <div className="podium-avatar">{activeLeaderboard[2]?.avatar || '?'}</div>
                    <div className="podium-info">
                      <span className="p-name">{activeLeaderboard[2]?.channel || '---'}</span>
                      <span className="p-val">{activeLeaderboard[2]?.value || '--'}</span>
                    </div>
                  </div>
                  <div className="podium-base bronze-base"></div>
                </div>
              </div>
            </div>

            {/* Leaderboard Section */}
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
                      <th>{activeTab.split(' ')[1]}</th>
                      <th>{locale === 'id' ? 'Tren' : 'Trend'}</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLeaderboard.map((item) => (
                      <tr key={item.rank}>
                        <td className="td-rank">#{item.rank}</td>
                        <td className="td-channel">
                          <div className="ch-cell">
                            <div className="ch-avatar">{item.avatar}</div>
                            <span>{item.channel}</span>
                          </div>
                        </td>
                        <td className="td-value">{item.value}</td>
                        <td className={`td-trend ${item.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                          {item.trend.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {item.trend}
                        </td>
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
    </div>
  );
}
