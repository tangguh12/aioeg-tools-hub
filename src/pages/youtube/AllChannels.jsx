import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { channels as mockChannels } from '../../data/mockData';
import {
  Search, ChevronDown, Plus, X, Check,
  ExternalLink, Settings, Trash2, TrendingUp, TrendingDown, Minus,
  Users, Eye, Clock, DollarSign, Tag, ChevronRight, Calendar, AlertCircle,
  BarChart2, Info, Folder, Edit3, Save, Layers, List
} from 'lucide-react';
import './AllChannels.css';

// ── Helpers ──────────────────────────────────────────────────────────
const CHANNEL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
const getColor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CHANNEL_COLORS[Math.abs(h) % CHANNEL_COLORS.length];
};

const fmt = (n) => {
  const num = parseInt(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const STATUS_STYLE = {
  Active:    { bg: 'rgba(16,185,129,0.1)',  color: '#34d399' },
  Testing:   { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24' },
  Inactive:  { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8' },
  Declining: { bg: 'rgba(239,68,68,0.1)',   color: '#f87171' },
};

const TREND_STYLE = {
  growing:   { color: '#34d399', icon: TrendingUp,   label: 'Growing',   bg: 'rgba(16,185,129,0.1)' },
  declining: { color: '#f87171', icon: TrendingDown, label: 'Declining', bg: 'rgba(239,68,68,0.1)' },
  stable:    { color: '#94a3b8', icon: Minus,        label: 'Stable',    bg: 'rgba(255,255,255,0.05)' },
  'needs-review': { color: '#fbbf24', icon: AlertCircle, label: 'Needs Review', bg: 'rgba(245,158,11,0.1)' }
};

// ── Classification Management Drawer (Vertical Layout) ───────────────
function ClassificationDrawer({ data: initialData, onClose, onSave }) {
  const [data, setData] = useState(JSON.parse(JSON.stringify(initialData)));
  const [newCat, setNewCat] = useState('');
  const [activeCat, setActiveCat] = useState(Object.keys(data)[0] || '');
  const [newNiche, setNewNiche] = useState('');

  const addCategory = () => {
    if (newCat.trim() && !data[newCat.trim()]) {
      setData({ ...data, [newCat.trim()]: [] });
      setActiveCat(newCat.trim());
      setNewCat('');
    }
  };

  const removeCategory = (cat) => {
    const newData = { ...data };
    delete newData[cat];
    setData(newData);
    if (activeCat === cat) setActiveCat(Object.keys(newData)[0] || '');
  };

  const addNiche = () => {
    if (newNiche.trim() && activeCat && !data[activeCat].includes(newNiche.trim())) {
      const newData = { ...data };
      newData[activeCat] = [...newData[activeCat], newNiche.trim()];
      setData(newData);
      setNewNiche('');
    }
  };

  const removeNiche = (niche) => {
    if (activeCat) {
      const newData = { ...data };
      newData[activeCat] = newData[activeCat].filter(n => n !== niche);
      setData(newData);
    }
  };

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="drawer-panel" onClick={e => e.stopPropagation()} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
        <div className="drawer-header">
          <div><h3 className="h3">Classification Setup</h3><p className="p-muted">Categories & Sub-Niches</p></div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          {/* Section 1: Categories */}
          <div className="class-section">
            <label className="section-label">1. Categories</label>
            <div className="cat-input-row mb-12">
              <input type="text" placeholder="Add New Category..." value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} />
              <button className="btn btn-primary btn-small" onClick={addCategory}><Plus size={14} /></button>
            </div>
            <div className="cat-horizontal-list">
              {Object.keys(data).map(cat => (
                <div key={cat} className={`cat-tag-item ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>
                  <span>{cat}</span>
                  <button className="icon-btn-xs" onClick={(e) => { e.stopPropagation(); removeCategory(cat); }}><X size={10} /></button>
                </div>
              ))}
              {Object.keys(data).length === 0 && <p className="p-muted italic text-xs">No categories yet.</p>}
            </div>
          </div>

          <div className="class-divider" />

          {/* Section 2: Niches */}
          <div className="class-section">
            <label className="section-label">2. Niches for "{activeCat || '...'}"</label>
            {activeCat ? (
              <>
                <div className="cat-input-row mb-12">
                  <input type="text" placeholder="Add New Niche..." value={newNiche} onChange={e => setNewNiche(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNiche()} />
                  <button className="btn btn-secondary btn-small" onClick={addNiche}><Plus size={14} /></button>
                </div>
                <div className="niche-grid-manage">
                  {data[activeCat]?.map(n => (
                    <div key={n} className="niche-tag-item">
                      <span>{n}</span>
                      <button className="icon-btn-xs" onClick={() => removeNiche(n)}><X size={10} /></button>
                    </div>
                  ))}
                  {(!data[activeCat] || data[activeCat].length === 0) && <p className="p-muted italic text-xs py-4">No niches defined.</p>}
                </div>
              </>
            ) : (
              <p className="p-muted text-center py-4">Select or add a category first.</p>
            )}
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(data); onClose(); }}><Save size={16} /> Save Changes</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Channel Settings Drawer ──────────────────────────────────────────
function ChannelSettingsDrawer({ channel, classifications, onClose, onUpdate }) {
  const [form, setForm] = useState({ ...channel });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const availableNiches = classifications[form.category] || [];

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="drawer-panel" onClick={e => e.stopPropagation()} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
        <div className="drawer-header">
          <div><h3 className="h3">Channel Settings</h3><p className="p-muted">{channel.name}</p></div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="form-group"><label>Name</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="form-group">
            <label>Category</label>
            <div className="cat-grid">
              <button className={`cat-chip ${form.category === 'Uncategorized' ? 'active' : ''}`} onClick={() => { set('category', 'Uncategorized'); set('niche', 'Uncategorized'); }}>Uncategorized</button>
              {Object.keys(classifications).map(c => <button key={c} className={`cat-chip ${form.category === c ? 'active' : ''}`} onClick={() => { set('category', c); set('niche', classifications[c][0] || 'Uncategorized'); }}>{c}</button>)}
            </div>
          </div>
          {form.category !== 'Uncategorized' && (
            <div className="form-group">
              <label>Sub-Niche</label>
              <div className="cat-grid">
                {availableNiches.map(n => <button key={n} className={`cat-chip ${form.niche === n ? 'active' : ''}`} onClick={() => set('niche', n)}>{n}</button>)}
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Status</label>
            <div className="option-row">
              {['Active', 'Testing', 'Inactive'].map(s => <button key={s} className={`option-chip ${form.status === s ? 'active' : ''}`} onClick={() => set('status', s)}>{s}</button>)}
            </div>
          </div>
          <div className="drawer-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { onUpdate(form); onClose(); }}>Save Changes</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function AllChannels() {
  const { locale } = useLanguage();
  const { allChannels } = useAuth();

  // 1. Persistence Logic
  const [classifications, setClassifications] = useState(() => {
    const saved = localStorage.getItem('aioeg_classifications');
    if (saved) return JSON.parse(saved);
    return {
      'Musik': ['Rock n Roll', 'Pop', 'Jazz'],
      'Teknologi': ['AI', 'Gadgets', 'Software'],
      'Kesehatan': ['Diabetes', 'Fitness', 'Nutrition'],
      'Vlog': ['Daily', 'Travel', 'Food']
    };
  });

  const buildInitialList = () => {
    const saved = localStorage.getItem('aioeg_channels');
    if (saved) return JSON.parse(saved);

    if (allChannels.length > 0) {
      return allChannels.map((ch, i) => ({
        id: ch.id || i, name: ch.title || ch.name || 'Unnamed',
        avatar: (ch.title || ch.name || 'CH').substring(0, 2).toUpperCase(),
        thumbnail: ch.thumbnail || null,
        category: 'Uncategorized', niche: 'Uncategorized', status: 'Active',
        subs: fmt(ch.subscribers || 0), views: fmt(ch.analytics?.views28d || 0),
        watchTime: ch.analytics?.watchTimeHours ? fmt(ch.analytics.watchTimeHours) + 'h' : '0',
        revenue: '—', lastUpload: '—', trend: 'stable'
      }));
    }
    return mockChannels.map(ch => ({
      ...ch, category: 'Musik', niche: 'Rock n Roll',
      avatar: (ch.name || 'CH').substring(0, 2).toUpperCase(),
      subs: ch.subs, views: ch.views, watchTime: ch.watchTime.replace(' hrs', 'h')
    }));
  };

  const [channelList, setChannelList] = useState(buildInitialList);

  useEffect(() => {
    localStorage.setItem('aioeg_classifications', JSON.stringify(classifications));
  }, [classifications]);

  useEffect(() => {
    localStorage.setItem('aioeg_channels', JSON.stringify(channelList));
  }, [channelList]);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showClassDrawer, setShowClassDrawer] = useState(false);
  const [settingsChannel, setSettingsChannel] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = channelList.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || c.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="ac-container">
      <header className="ac-header-main">
        <div className="header-info"><h2 className="h2">{locale === 'id' ? 'Semua Channel' : 'All Channels'}</h2><p className="p-muted">Network classification command center.</p></div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowClassDrawer(true)}><Layers size={16} /> Classification Settings</button>
          <button className="btn btn-primary" onClick={() => setShowAddDrawer(true)}><Plus size={16} /> Add Channel</button>
        </div>
      </header>

      <div className="ac-filters">
        <div className="ac-search"><Search size={15} /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="ac-selects">
          <div className="ac-select-wrap">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">All Categories</option>
              {Object.keys(classifications).map(c => <option key={c} value={c}>{c}</option>)}
            </select><ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="ac-table">
        <div className="ac-table-header">
          <span className="col-ch">Channel</span><span className="col-up">Last Upload</span><span className="col-trend">Trend</span><span className="col-stat">Subs</span><span className="col-stat">Views</span><span className="col-stat">Watch</span><span className="col-stat">Rev</span><span className="col-act"></span>
        </div>
        <div className="ac-table-body">
          {filtered.map(ch => {
            const trend = TREND_STYLE[ch.trend] || TREND_STYLE.stable;
            const Icon = trend.icon;
            const color = getColor(ch.name);
            const isExpanded = expandedId === ch.id;

            return (
              <div key={ch.id} className={`ac-row-wrap ${isExpanded ? 'is-expanded' : ''}`}>
                <div className="ac-row" onClick={() => setExpandedId(isExpanded ? null : ch.id)}>
                  <div className="col-ch ac-identity">
                    {/* Avatar Fix */}
                    <div className="ac-avatar" style={{ background: color + '15', color }}>
                      {ch.thumbnail ? <img src={ch.thumbnail} alt="" /> : ch.avatar}
                    </div>
                    <div className="ac-info">
                      <span className="ac-name">{ch.name}</span>
                      {/* Vertical Tags Fix */}
                      <div className="ac-meta vertical">
                        <span className="ac-tag-main">{ch.category}</span>
                        <span className="ac-tag-sub">{ch.niche}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-up"><span className="val-text">{ch.lastUpload}</span></div>
                  <div className="col-trend"><span className="trend-badge" style={{ background: trend.bg, color: trend.color }}><Icon size={12} /> {trend.label}</span></div>
                  <div className="col-stat"><span className="val-text">{ch.subs}</span></div>
                  <div className="col-stat"><span className="val-text">{ch.views}</span></div>
                  <div className="col-stat"><span className="val-text">{ch.watchTime}</span></div>
                  <div className="col-stat"><span className="val-text">{ch.revenue}</span></div>
                  <div className="col-act" onClick={e => e.stopPropagation()}>
                    <button className="icon-btn-sm" onClick={() => setSettingsChannel(ch)}><Settings size={14} /></button>
                    <button className="icon-btn-sm danger" onClick={() => setChannelList(l => l.filter(i => i.id !== ch.id))}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showClassDrawer && <ClassificationDrawer data={classifications} onClose={() => setShowClassDrawer(false)} onSave={setClassifications} />}
        {settingsChannel && <ChannelSettingsDrawer channel={settingsChannel} classifications={classifications} onClose={() => setSettingsChannel(null)} onUpdate={u => setChannelList(l => l.map(i => i.id === u.id ? u : i))} />}
      </AnimatePresence>
    </div>
  );
}
