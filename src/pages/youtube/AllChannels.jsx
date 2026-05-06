import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { channels as mockChannels } from '../../data/mockData';
import {
  Search, ChevronDown, Plus, X, Check,
  ExternalLink, Settings, Trash2, TrendingUp,
  Users, Eye, Clock, DollarSign, Tag, ChevronRight
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
  Active:    { bg: 'rgba(16,185,129,0.12)',  color: '#34d399' },
  Testing:   { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  Inactive:  { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
  Declining: { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
};

// ── Default channel list from mock + real data ────────────────────────
const buildChannelList = (allChannels) => {
  if (allChannels.length > 0) {
    return allChannels.map((ch, i) => ({
      id: ch.id || i,
      name: ch.title || ch.name || 'Unnamed',
      avatar: (ch.title || ch.name || 'CH').substring(0, 2).toUpperCase(),
      thumbnail: ch.thumbnail || null,
      niche: ch.niche || 'Uncategorized',
      status: 'Active',
      priority: 'Normal',
      notes: '',
      subs: fmt(ch.subscribers || 0),
      views: fmt(ch.analytics?.views28d || ch.views || 0),
      watchTime: ch.analytics?.watchTimeHours ? fmt(ch.analytics.watchTimeHours) + ' hrs' : '—',
      ctr: ch.analytics?.ctr ? ch.analytics.ctr + '%' : '—',
      retention: ch.analytics?.avgRetention ? ch.analytics.avgRetention + '%' : '—',
      revenue: '—',
      lastUpload: '—',
      lastVideoPerf: ch.analytics?.ctr ? `${ch.analytics.ctr}% CTR · ${ch.analytics.avgRetention}% ret.` : '—',
      isReal: true,
    }));
  }
  return mockChannels.map(ch => ({
    ...ch,
    avatar: ch.avatar || ch.name.substring(0, 2).toUpperCase(),
    thumbnail: null,
    niche: ch.niche || 'Uncategorized',
    priority: 'Normal',
    notes: '',
    watchTime: '85K hrs',
    retention: '42%',
    revenue: ch.revenue || '—',
    lastUpload: '2 days ago',
    lastVideoPerf: `${ch.rtViews} · ${ch.ctr} CTR`,
    isReal: false,
  }));
};

// ── Add Channel Drawer ────────────────────────────────────────────────
function AddChannelDrawer({ onClose, onAdd, existingCategories }) {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', niche: '', status: 'Active', priority: 'Normal', notes: '' });
  const [newCat, setNewCat] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);
  const [categories, setCategories] = useState(existingCategories);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addCategory = () => {
    const trimmed = newCat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(c => [...c, trimmed]);
      set('niche', trimmed);
    }
    setNewCat('');
    setShowCatInput(false);
  };

  const steps = ['Connect Account', 'Channel Details', 'Category', 'Settings', 'Confirm'];

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <h3 className="h3">Add New Channel</h3>
            <p className="p-muted">Step {step} of {steps.length}</p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Step indicators */}
        <div className="drawer-steps">
          {steps.map((s, i) => (
            <div key={s} className={`drawer-step ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}`}>
              <div className="step-dot">{i + 1 < step ? <Check size={10} /> : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="drawer-body">
          {step === 1 && (
            <div className="drawer-step-content">
              <p className="drawer-desc">Connect your Google account to import YouTube channels automatically.</p>
              <button
                className="btn btn-primary btn-full"
                onClick={() => { onClose(); navigate('/youtube/account'); }}
              >
                <Plus size={16} /> Connect Google Account
              </button>
              <div className="drawer-divider"><span>or add manually</span></div>
              <div className="form-group">
                <label>Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tech Insider"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <button className="btn btn-secondary btn-full mt-12" onClick={() => form.name && setStep(2)} disabled={!form.name.trim()}>
                Continue <ChevronRight size={15} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="drawer-step-content">
              <p className="drawer-desc">Add details about your channel.</p>
              <div className="form-group">
                <label>Channel Name</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="drawer-nav">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="drawer-step-content">
              <p className="drawer-desc">Choose a category or create your own. This is optional — you can skip it.</p>
              <div className="form-group">
                <label>Category / Niche <span className="label-opt">(optional)</span></label>
                <div className="cat-grid">
                  <button
                    className={`cat-chip ${form.niche === '' ? 'active' : ''}`}
                    onClick={() => set('niche', '')}
                  >
                    No Category
                  </button>
                  {categories.map(c => (
                    <button
                      key={c}
                      className={`cat-chip ${form.niche === c ? 'active' : ''}`}
                      onClick={() => set('niche', c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {showCatInput ? (
                  <div className="cat-input-row">
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. Finance"
                      value={newCat}
                      onChange={e => setNewCat(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCategory()}
                    />
                    <button className="btn btn-primary btn-small" onClick={addCategory}>Add</button>
                    <button className="btn btn-secondary btn-small" onClick={() => setShowCatInput(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="cat-create-btn" onClick={() => setShowCatInput(true)}>
                    <Plus size={13} /> Create Category
                  </button>
                )}
              </div>

              <div className="form-preview">
                <Tag size={13} />
                <span>{form.niche || 'Uncategorized'}</span>
              </div>

              <div className="drawer-nav">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>Continue</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="drawer-step-content">
              <p className="drawer-desc">Set channel status and priority for your workflow.</p>
              <div className="form-group">
                <label>Status</label>
                <div className="option-row">
                  {['Active', 'Testing', 'Inactive'].map(s => (
                    <button key={s} className={`option-chip ${form.status === s ? 'active' : ''}`} onClick={() => set('status', s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <div className="option-row">
                  {['Normal', 'High'].map(p => (
                    <button key={p} className={`option-chip ${form.priority === p ? 'active' : ''}`} onClick={() => set('priority', p)}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Notes <span className="label-opt">(optional)</span></label>
                <textarea placeholder="Any notes about this channel..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
              </div>
              <div className="drawer-nav">
                <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(5)}>Continue</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="drawer-step-content">
              <p className="drawer-desc">Review and confirm before adding the channel.</p>
              <div className="confirm-card">
                <div className="confirm-avatar" style={{ background: getColor(form.name) + '22', color: getColor(form.name) }}>
                  {form.name.substring(0, 2).toUpperCase() || 'CH'}
                </div>
                <div>
                  <div className="confirm-name">{form.name || 'Unnamed Channel'}</div>
                  <div className="confirm-meta">
                    <span>{form.niche || 'Uncategorized'}</span>
                    <span>·</span>
                    <span>{form.status}</span>
                    <span>·</span>
                    <span>{form.priority} priority</span>
                  </div>
                  {form.notes && <p className="confirm-notes">"{form.notes}"</p>}
                </div>
              </div>
              <div className="drawer-nav">
                <button className="btn btn-secondary" onClick={() => setStep(4)}>Back</button>
                <button className="btn btn-primary" onClick={() => { onAdd({ ...form, id: Date.now(), avatar: form.name.substring(0, 2).toUpperCase(), thumbnail: null, subs: '0', views: '0', watchTime: '—', ctr: '—', retention: '—', revenue: '—', lastUpload: 'Just added', lastVideoPerf: '—', isReal: false }); onClose(); }}>
                  <Check size={15} /> Add Channel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function AllChannels() {
  const { locale } = useLanguage();
  const { allChannels } = useAuth();
  const navigate = useNavigate();

  const [channelList, setChannelList] = useState(() => buildChannelList(allChannels));
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonetized, setFilterMonetized] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [showDrawer, setShowDrawer] = useState(false);

  const existingCategories = [...new Set(channelList.map(c => c.niche).filter(Boolean))];

  const handleAdd = (newCh) => setChannelList(prev => [...prev, newCh]);
  const handleDelete = (id) => setChannelList(prev => prev.filter(c => c.id !== id));

  // Filter + sort
  const filtered = channelList
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.niche || '').toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'subs') return parseInt(b.subs) - parseInt(a.subs);
      return 0;
    });

  return (
    <div className="ac-container">
      {/* Header */}
      <header className="ac-header">
        <div>
          <h2 className="h2">{locale === 'id' ? 'Semua Channel' : 'All Channels'}</h2>
          <p className="p-muted">
            {locale === 'id'
              ? 'Kelola dan pantau semua channel YouTube yang terhubung.'
              : 'Manage and monitor all connected YouTube channels.'}
          </p>
        </div>
        <div className="ac-header-stats">
          <div className="ac-header-stat">
            <span className="ac-header-stat-val">{channelList.length}</span>
            <span className="ac-header-stat-lbl">{locale === 'id' ? 'Total Channel' : 'Total Channels'}</span>
          </div>
          <div className="ac-header-stat">
            <span className="ac-header-stat-val">{channelList.filter(c => c.status === 'Active').length}</span>
            <span className="ac-header-stat-lbl">Active</span>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="ac-filters">
        <div className="ac-search">
          <Search size={15} />
          <input
            type="text"
            placeholder={locale === 'id' ? 'Cari channel atau kategori...' : 'Search channels or categories...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="ac-clear" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <div className="ac-selects">
          {[
            {
              val: filterStatus, set: setFilterStatus,
              options: [
                { v: 'all', l: 'All Status' },
                { v: 'Active', l: 'Active' },
                { v: 'Testing', l: 'Testing' },
                { v: 'Inactive', l: 'Inactive' },
              ]
            },
            {
              val: sortKey, set: setSortKey,
              options: [
                { v: 'name', l: 'Sort: Name' },
                { v: 'subs', l: 'Sort: Subscribers' },
              ]
            },
          ].map((sel, i) => (
            <div className="ac-select-wrap" key={i}>
              <select value={sel.val} onChange={e => sel.set(e.target.value)}>
                {sel.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <ChevronDown size={13} className="ac-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* Channel Count */}
      <p className="ac-count">
        {filtered.length} {locale === 'id' ? 'channel' : 'channels'}
        {!allChannels.length && <span className="ac-mock-note"> · Showing sample data</span>}
      </p>

      {/* Channel List */}
      <div className="ac-list">
        {/* Header Row */}
        <div className="ac-row ac-list-header">
          <span className="ac-col-name">Channel</span>
          <span className="ac-col-stat">Subscribers</span>
          <span className="ac-col-stat">Views (28d)</span>
          <span className="ac-col-stat">Watch Time</span>
          <span className="ac-col-stat">CTR</span>
          <span className="ac-col-stat">Revenue</span>
          <span className="ac-col-actions">Actions</span>
        </div>

        <AnimatePresence>
          {filtered.length === 0 && (
            <div className="ac-empty">
              <Users size={32} />
              <p>No channels found.</p>
            </div>
          )}

          {filtered.map((ch, i) => {
            const color = getColor(ch.name);
            const statusStyle = STATUS_STYLE[ch.status] || STATUS_STYLE['Active'];

            return (
              <motion.div
                key={ch.id}
                className="ac-row ac-channel-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                style={{ '--ch-color': color }}
              >
                {/* Channel identity */}
                <div className="ac-col-name ac-identity">
                  <div className="ac-avatar" style={{ background: color + '22', color }}>
                    {ch.thumbnail
                      ? <img src={ch.thumbnail} alt={ch.name} />
                      : ch.avatar}
                  </div>
                  <div className="ac-identity-info">
                    <span className="ac-name">{ch.name}</span>
                    <div className="ac-meta">
                      <span className="ac-niche">{ch.niche || 'Uncategorized'}</span>
                      <span className="ac-dot">·</span>
                      <span className="ac-status-pill" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                        {ch.status}
                      </span>
                    </div>
                    {ch.lastVideoPerf && ch.lastVideoPerf !== '—' && (
                      <span className="ac-last-perf">{ch.lastVideoPerf}</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="ac-col-stat">
                  <span className="ac-stat-val"><Users size={12} /> {ch.subs}</span>
                </div>
                <div className="ac-col-stat">
                  <span className="ac-stat-val"><Eye size={12} /> {ch.views}</span>
                </div>
                <div className="ac-col-stat">
                  <span className="ac-stat-val"><Clock size={12} /> {ch.watchTime}</span>
                </div>
                <div className="ac-col-stat">
                  <span className="ac-stat-val"><TrendingUp size={12} /> {ch.ctr}</span>
                </div>
                <div className="ac-col-stat">
                  <span className="ac-stat-val"><DollarSign size={12} /> {ch.revenue}</span>
                </div>

                {/* Actions */}
                <div className="ac-col-actions ac-actions-btns">
                  <a href={`https://studio.youtube.com/channel/${ch.id}`} target="_blank" rel="noreferrer" className="icon-btn-sm" title="Open in YouTube Studio">
                    <ExternalLink size={14} />
                  </a>
                  <button className="icon-btn-sm" title="Settings" onClick={() => navigate('/youtube/account')}>
                    <Settings size={14} />
                  </button>
                  <button className="icon-btn-sm danger" title="Remove" onClick={() => handleDelete(ch.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        className="ac-fab"
        onClick={() => setShowDrawer(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        title="Add Channel"
      >
        <Plus size={18} />
        <span>Add Channel</span>
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <AddChannelDrawer
            onClose={() => setShowDrawer(false)}
            onAdd={handleAdd}
            existingCategories={existingCategories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
