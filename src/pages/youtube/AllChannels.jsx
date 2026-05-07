import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';
import { channels as mockChannels } from '../../data/mockData';
import {
  Search, ChevronDown, Plus, X, Check,
  ExternalLink, Settings, Trash2, TrendingUp, TrendingDown, Minus,
  Users, Eye, Clock, DollarSign, Tag, ChevronRight, Calendar, AlertCircle,
  BarChart2, Info, Folder, Edit3, Save, Layers, List, Globe
} from 'lucide-react';
import './AllChannels.css';

// ── Helpers ──────────────────────────────────────────────────────────
const CHANNEL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
const getColor = (name = '') => {
  let h = 0;
  const str = String(name || 'CH');
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return CHANNEL_COLORS[Math.abs(h) % CHANNEL_COLORS.length];
};

const fmt = (n) => {
  const num = parseInt(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const getTrendStyle = (key, t) => {
  const styles = {
    growing:   { color: '#34d399', icon: TrendingUp,   label: t('growing'),   bg: 'rgba(16,185,129,0.1)' },
    declining: { color: '#f87171', icon: TrendingDown, label: t('declining'), bg: 'rgba(239,68,68,0.1)' },
    stable:    { color: '#94a3b8', icon: Minus,        label: t('stable'),    bg: 'rgba(255,255,255,0.05)' },
    'needs-review': { color: '#fbbf24', icon: AlertCircle, label: t('needsReview'), bg: 'rgba(245,158,11,0.1)' }
  };
  return styles[key] || styles.stable;
};

// ── Classification Management Drawer ─────────────────────────────────
function ClassificationDrawer({ data: initialData, onClose, onSave, t }) {
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(initialData || {})));
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
          <div><h3 className="h3">{t('setupTitle')}</h3><p className="p-muted">{t('setupSubtitle')}</p></div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          <div className="class-section">
            <label className="section-label">{t('step1')}</label>
            <div className="cat-input-row mb-12">
              <input type="text" placeholder={t('addCatPlace')} value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} />
              <button className="btn btn-primary btn-small" onClick={addCategory}><Plus size={14} /></button>
            </div>
            <div className="cat-horizontal-list">
              {Object.keys(data).map(cat => (
                <div key={cat} className={`cat-tag-item ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>
                  <span>{cat}</span>
                  <button className="icon-btn-xs" onClick={(e) => { e.stopPropagation(); removeCategory(cat); }}><X size={10} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="class-divider" />

          <div className="class-section">
            <label className="section-label">{t('step2')} "{activeCat || '...'}"</label>
            {activeCat ? (
              <>
                <div className="cat-input-row mb-12">
                  <input type="text" placeholder={t('addNichePlace')} value={newNiche} onChange={e => setNewNiche(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNiche()} />
                  <button className="btn btn-secondary btn-small" onClick={addNiche}><Plus size={14} /></button>
                </div>
                <div className="niche-grid-manage">
                  {data[activeCat]?.map(n => (
                    <div key={n} className="niche-tag-item">
                      <span>{n}</span>
                      <button className="icon-btn-xs" onClick={() => removeNiche(n)}><X size={10} /></button>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="p-muted text-center py-4">{t('selectCatPrompt')}</p>}
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={() => { onSave(data); onClose(); }}><Save size={16} /> {t('saveChanges')}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Channel Settings Drawer ──────────────────────────────────────────
function ChannelSettingsDrawer({ channel, classifications, onClose, onUpdate, t }) {
  const [form, setForm] = useState({ ...channel });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const availableNiches = classifications[form.category] || [];

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="drawer-panel" onClick={e => e.stopPropagation()} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
        <div className="drawer-header">
          <div><h3 className="h3">{t('settingsTitle')}</h3><p className="p-muted">{channel.name}</p></div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="form-group"><label>{t('nameLabel')}</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="form-group">
            <label>{t('catLabel')}</label>
            <div className="cat-grid">
              <button className={`cat-chip ${form.category === 'Uncategorized' ? 'active' : ''}`} onClick={() => { set('category', 'Uncategorized'); set('niche', 'Uncategorized'); }}>{t('uncategorized')}</button>
              {Object.keys(classifications).map(c => <button key={c} className={`cat-chip ${form.category === c ? 'active' : ''}`} onClick={() => { set('category', c); set('niche', classifications[c][0] || 'Uncategorized'); }}>{c}</button>)}
            </div>
          </div>
          {form.category !== 'Uncategorized' && (
            <div className="form-group">
              <label>{t('nicheLabel')}</label>
              <div className="cat-grid">
                {availableNiches.map(n => <button key={n} className={`cat-chip ${form.niche === n ? 'active' : ''}`} onClick={() => set('niche', n)}>{n}</button>)}
              </div>
            </div>
          )}
          <div className="form-group">
            <label>{t('statusLabel')}</label>
            <div className="option-row">
              {['Active', 'Testing', 'Inactive', 'Archived', 'Needs Review'].map(s => (
                <button key={s} className={`option-chip ${form.status === s ? 'active' : ''}`} onClick={() => set('status', s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>{t('priority')}</label>
            <div className="option-row">
              {['High', 'Normal', 'Low'].map(p => (
                <button key={p} className={`option-chip ${form.priority === p ? 'active' : ''}`} onClick={() => set('priority', p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>{t('tagsTab')}</label>
            <input type="text" placeholder="Tags (comma separated)" value={form.tags || ''} onChange={e => set('tags', e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t('channelNotes')}</label>
            <textarea rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Add private notes..." />
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={() => { onUpdate(form); onClose(); }}><Save size={16} /> {t('saveChanges')}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Add Channel Drawer (Google Auth Flow) ───────────────────────────
function AddChannelDrawer({ onClose, onAdd, classifications, t }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [form, setForm] = useState({ name: 'New Connected Channel', category: 'Uncategorized', niche: 'Uncategorized', status: 'Active' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const simulateConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 1500);
  };

  const handleFinish = () => {
    onAdd({
      ...form,
      id: Date.now(),
      avatar: (form.name || 'CH').substring(0, 2).toUpperCase(),
      subs: '0', views: '0', watchTime: '0', revenue: '0',
      lastUpload: t('justAdded'), trend: 'stable'
    });
    onClose();
  };

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="drawer-panel" onClick={e => e.stopPropagation()} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
        <div className="drawer-header">
          <div><h3 className="h3">{t('addTitle')}</h3><p className="p-muted">{t('importGoogle')}</p></div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          {!isConnected ? (
            <div className="auth-step">
              <div className="auth-icon-box"><Globe size={40} /></div>
              <h4 className="text-center font-bold mb-4">{t('connectTitle')}</h4>
              <p className="p-muted text-center mb-12">{t('connectSub')}</p>
              
              <button 
                className={`btn btn-primary btn-full ${isConnecting ? 'loading' : ''}`} 
                onClick={simulateConnect}
                disabled={isConnecting}
              >
                {isConnecting ? t('connecting') : t('signInGoogle')}
              </button>
            </div>
          ) : (
            <motion.div className="setup-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="connected-info mb-24">
                <div className="check-badge"><Check size={14} /></div>
                <div>
                  <div className="font-bold text-main">{t('connectedMsg')}</div>
                  <div className="text-xs text-dim">{t('selectBelow')}</div>
                </div>
              </div>

              <div className="form-group">
                <label>{t('catLabel')}</label>
                <div className="cat-grid">
                  {['Uncategorized', ...Object.keys(classifications)].map(c => (
                    <button key={c} className={`cat-chip ${form.category === c ? 'active' : ''}`} onClick={() => { set('category', c); set('niche', classifications[c]?.[0] || 'Uncategorized'); }}>
                      {c === 'Uncategorized' ? t('uncategorized') : c}
                    </button>
                  ))}
                </div>
              </div>

              {form.category !== 'Uncategorized' && (
                <div className="form-group">
                  <label>{t('nicheLabel')}</label>
                  <div className="cat-grid">
                    {classifications[form.category]?.map(n => (
                      <button key={n} className={`cat-chip ${form.niche === n ? 'active' : ''}`} onClick={() => set('niche', n)}>{n}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="drawer-footer-inline mt-24">
                <button className="btn btn-secondary" onClick={() => setIsConnected(false)}>{t('back')}</button>
                <button className="btn btn-primary" onClick={handleFinish}>{t('addToHub')}</button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function AllChannels() {
  const { t } = useLanguage();
  const { allChannels = [] } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [classifications, setClassifications] = useState(() => {
    try {
      const saved = localStorage.getItem('aioeg_classifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) { console.error(e); }
    return { 'Musik': ['Rock n Roll', 'Pop', 'Jazz'], 'Teknologi': ['AI', 'Gadgets', 'Software'], 'Kesehatan': ['Diabetes', 'Fitness', 'Nutrition'], 'Vlog': ['Daily', 'Travel', 'Food'] };
  });

  const [channelMetadata, setChannelMetadata] = useState(() => {
    try {
      const saved = localStorage.getItem('aioeg_channel_meta');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return {};
  });

  useEffect(() => { 
    if (classifications) localStorage.setItem('aioeg_classifications', JSON.stringify(classifications)); 
  }, [classifications]);

  useEffect(() => { 
    localStorage.setItem('aioeg_channel_meta', JSON.stringify(channelMetadata)); 
  }, [channelMetadata]);

  // Combine real data with local metadata
  const channelList = (allChannels || []).map((ch, i) => {
    const meta = channelMetadata[ch.id] || {};
    return {
      id: ch.id || i,
      name: ch.title || ch.name || 'Unnamed',
      avatar: (ch.title || ch.name || 'CH').substring(0, 2).toUpperCase(),
      thumbnail: ch.thumbnail || null,
      category: meta.category || 'Uncategorized',
      niche: meta.niche || 'Uncategorized',
      status: meta.status || 'Active',
      priority: meta.priority || 'Normal',
      tags: meta.tags || '',
      notes: meta.notes || '',
      subs: fmt(ch.subscribers || 0),
      views: fmt(ch.analytics?.views28d || 0),
      watchTime: ch.analytics?.watchTimeHours ? fmt(ch.analytics.watchTimeHours) + 'h' : '0',
      revenue: hasPermission('monetization') ? (ch.analytics?.revenue ? '$' + ch.analytics.revenue.toFixed(2) : '—') : 'PROTECTED',
      lastUpload: '—',
      trend: 'stable'
    };
  });

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showClassDrawer, setShowClassDrawer] = useState(false);
  const [settingsChannel, setSettingsChannel] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = (channelList || []).filter(c => {
    const matchSearch = !search || String(c.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || c.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="ac-container">
      <header className="ac-header-main">
        <div className="header-info"><h2 className="h2">{t('allChannelsTitle')}</h2><p className="p-muted">{t('allChannelsSubtitle')}</p></div>
        <div className="header-actions">
          {hasPermission('admin') && (
            <>
              <button className="btn btn-secondary" onClick={() => setShowClassDrawer(true)}><Layers size={16} /> {t('classificationSettings')}</button>
              <button className="btn btn-primary" onClick={() => navigate('/youtube/account')}><Plus size={16} /> {t('addChannel')}</button>
            </>
          )}
        </div>
      </header>

      <div className="ac-filters">
        <div className="ac-search"><Search size={15} /><input type="text" placeholder={t('searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="ac-selects">
          <div className="ac-select-wrap">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">{t('allCategories')}</option>
              {Object.keys(classifications || {}).map(c => <option key={c} value={c}>{c}</option>)}
            </select><ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="ac-table">
        <div className="ac-table-header">
          <span className="col-ch">{t('colChannel')}</span><span className="col-up">{t('colUpload')}</span><span className="col-trend">{t('colTrend')}</span><span className="col-stat">{t('colSubs')}</span><span className="col-stat">{t('colViews')}</span><span className="col-stat">{t('colWatch')}</span>
          {hasPermission('monetization') && <span className="col-stat">{t('colRev')}</span>}
          <span className="col-act"></span>
        </div>
        <div className="ac-table-body">
          {filtered.map(ch => {
            const trend = getTrendStyle(ch.trend, t);
            const Icon = trend.icon;
            const color = getColor(ch.name);
            const isExpanded = expandedId === ch.id;

            return (
              <div key={ch.id} className={`ac-row-wrap ${isExpanded ? 'is-expanded' : ''}`}>
                <div className="ac-row" onClick={() => setExpandedId(isExpanded ? null : ch.id)}>
                  <div className="col-ch ac-identity">
                    <div className="ac-avatar" style={{ background: color + '15', color }}>
                      {ch.thumbnail ? <img src={ch.thumbnail} alt="" /> : (ch.avatar || 'CH')}
                    </div>
                    <div className="ac-info">
                      <span className="ac-name">{ch.name}</span>
                      <div className="ac-meta vertical">
                        <span className="ac-tag-main">{ch.category === 'Uncategorized' ? t('uncategorized') : ch.category}</span>
                        <span className="ac-tag-sub">{ch.niche === 'Uncategorized' ? t('uncategorized') : ch.niche}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-up"><span className="val-text">{ch.lastUpload}</span></div>
                  <div className="col-trend"><span className="trend-badge" style={{ background: trend.bg, color: trend.color }}><Icon size={12} /> {trend.label}</span></div>
                  <div className="col-stat"><span className="val-text">{ch.subs}</span></div>
                  <div className="col-stat"><span className="val-text">{ch.views}</span></div>
                  <div className="col-stat"><span className="val-text">{ch.watchTime}</span></div>
                  {hasPermission('monetization') && <div className="col-stat"><span className="val-text">{ch.revenue}</span></div>}
                  <div className="col-act" onClick={e => e.stopPropagation()}>
                    {hasPermission('admin') && <button className="icon-btn-sm" onClick={() => setSettingsChannel(ch)}><Settings size={14} /></button>}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="p-muted text-center py-8">{t('noChannels')}</p>}
        </div>
      </div>

      {hasPermission('admin') && (
        <button className="ac-fab" onClick={() => navigate('/youtube/account')}><Plus size={20} /><span>{t('addChannel')}</span></button>
      )}

      <AnimatePresence>
        {showClassDrawer && <ClassificationDrawer data={classifications} onClose={() => setShowClassDrawer(false)} onSave={setClassifications} t={t} />}
        {settingsChannel && <ChannelSettingsDrawer channel={settingsChannel} classifications={classifications} onClose={() => setSettingsChannel(null)} onUpdate={u => setChannelMetadata(prev => ({ ...prev, [u.id]: { ...prev[u.id], ...u } }))} t={t} />}
      </AnimatePresence>
    </div>
  );
}
