import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { channels as mockChannels } from '../../data/mockData';
import {
  Search, ChevronDown, Plus, X, Check,
  ExternalLink, Settings, Trash2, TrendingUp, TrendingDown, Minus,
  Users, Eye, Clock, DollarSign, Tag, ChevronRight, Calendar, AlertCircle,
  BarChart2, Info, Folder, Edit3
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

// ── Category Management Drawer ───────────────────────────────────────
function CategoryManagerDrawer({ categories, channels, onClose, onUpdateChannels, onUpdateCategories }) {
  const [newCat, setNewCat] = useState('');
  
  const addCategory = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      onUpdateCategories([...categories, newCat.trim()]);
      setNewCat('');
    }
  };

  const deleteCategory = (cat) => {
    onUpdateCategories(categories.filter(c => c !== cat));
    // Move channels in this category to Uncategorized
    const updatedChannels = channels.map(ch => ch.niche === cat ? { ...ch, niche: 'Uncategorized' } : ch);
    onUpdateChannels(updatedChannels);
  };

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="drawer-panel"
        onClick={e => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
      >
        <div className="drawer-header">
          <div>
            <h3 className="h3">Manage Categories</h3>
            <p className="p-muted">Organize your channels into niches.</p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          <div className="form-group">
            <label>Add New Category</label>
            <div className="cat-input-row">
              <input 
                type="text" 
                placeholder="e.g. Finance, Gaming..." 
                value={newCat} 
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
              />
              <button className="btn btn-primary" onClick={addCategory}><Plus size={16} /></button>
            </div>
          </div>

          <div className="cat-manage-list">
            <label className="section-label">Existing Categories</label>
            {categories.length === 0 && <p className="p-muted text-center py-4">No custom categories yet.</p>}
            {categories.map(cat => (
              <div key={cat} className="cat-manage-item">
                <div className="cat-item-info">
                  <Tag size={14} />
                  <span>{cat}</span>
                  <span className="cat-count-badge">
                    {channels.filter(c => c.niche === cat).length} channels
                  </span>
                </div>
                <button className="icon-btn-sm danger" onClick={() => deleteCategory(cat)} title="Delete Category">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="cat-special-item">
            <div className="cat-item-info">
              <Folder size={14} />
              <span>Uncategorized</span>
              <span className="cat-count-badge">
                {channels.filter(c => !c.niche || c.niche === 'Uncategorized').length} channels
              </span>
            </div>
            <span className="p-muted italic text-xs">System Default</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Channel Settings Drawer ──────────────────────────────────────────
function ChannelSettingsDrawer({ channel, categories, onClose, onUpdate }) {
  const [form, setForm] = useState({ ...channel });
  const [newCat, setNewCat] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="drawer-panel"
        onClick={e => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
      >
        <div className="drawer-header">
          <div>
            <h3 className="h3">Channel Settings</h3>
            <p className="p-muted">{channel.name}</p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          <div className="form-group">
            <label>Channel Name</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Category / Niche</label>
            <div className="cat-grid mb-12">
              <button 
                className={`cat-chip ${(!form.niche || form.niche === 'Uncategorized') ? 'active' : ''}`} 
                onClick={() => set('niche', 'Uncategorized')}
              >
                Uncategorized
              </button>
              {categories.map(c => (
                <button key={c} className={`cat-chip ${form.niche === c ? 'active' : ''}`} onClick={() => set('niche', c)}>{c}</button>
              ))}
            </div>
            {showCatInput ? (
              <div className="cat-input-row">
                <input
                  autoFocus
                  type="text"
                  placeholder="New category..."
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (set('niche', newCat), setShowCatInput(false), setNewCat(''))}
                />
                <button className="btn btn-primary btn-small" onClick={() => { set('niche', newCat); setShowCatInput(false); setNewCat(''); }}>Add</button>
              </div>
            ) : (
              <button className="cat-create-btn" onClick={() => setShowCatInput(true)}>+ Create New Category</button>
            )}
          </div>

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
            <label>Notes</label>
            <textarea placeholder="Notes..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} />
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

// ── Add Channel Drawer ────────────────────────────────────────────────
function AddChannelDrawer({ onClose, onAdd, categories }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', niche: '', status: 'Active', priority: 'Normal', notes: '' });
  const [newCat, setNewCat] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const steps = ['Connect', 'Details', 'Category', 'Settings', 'Confirm'];

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="drawer-panel"
        onClick={e => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
      >
        <div className="drawer-header">
          <div>
            <h3 className="h3">Add New Channel</h3>
            <p className="p-muted">Step {step} of 5</p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-steps">
          {steps.map((s, i) => (
            <div key={s} className={`drawer-step ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}`}>
              <div className="step-dot">{i + 1 < step ? <Check size={10} /> : i + 1}</div>
              {i + 1 === step && <span className="step-label">{s}</span>}
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="drawer-body">
          {step === 1 && (
            <div className="drawer-step-content">
              <p className="drawer-desc">Connect your Google account to import channels automatically.</p>
              <button className="btn btn-primary btn-full" onClick={() => { onClose(); navigate('/youtube/account'); }}>
                Connect Google Account
              </button>
              <div className="drawer-divider"><span>or manual entry</span></div>
              <div className="form-group">
                <label>Channel Name</label>
                <input type="text" placeholder="e.g. Tech Insider" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <button className="btn btn-secondary btn-full" onClick={() => form.name && setStep(2)} disabled={!form.name.trim()}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="drawer-step-content">
              <div className="form-group">
                <label>Channel Name</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="drawer-nav">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="drawer-step-content">
              <div className="form-group">
                <label>Category (Optional)</label>
                <div className="cat-grid">
                  <button className={`cat-chip ${form.niche === '' ? 'active' : ''}`} onClick={() => set('niche', '')}>Uncategorized</button>
                  {categories.map(c => (
                    <button key={c} className={`cat-chip ${form.niche === c ? 'active' : ''}`} onClick={() => set('niche', c)}>{c}</button>
                  ))}
                </div>
                {showCatInput ? (
                  <div className="cat-input-row">
                    <input autoFocus type="text" value={newCat} onChange={e => setNewCat(e.target.value)} />
                    <button className="btn btn-primary btn-small" onClick={() => { set('niche', newCat); setNewCat(''); setShowCatInput(false); }}>Add</button>
                  </div>
                ) : (
                  <button className="cat-create-btn" onClick={() => setShowCatInput(true)}>+ Create Category</button>
                )}
              </div>
              <div className="drawer-nav">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>Next</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="drawer-step-content">
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
              <div className="drawer-nav">
                <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(5)}>Next</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="drawer-step-content">
              <div className="confirm-card">
                <div className="confirm-name">{form.name}</div>
                <div className="confirm-meta">{form.niche || 'Uncategorized'} · {form.status}</div>
              </div>
              <div className="drawer-nav">
                <button className="btn btn-secondary" onClick={() => setStep(4)}>Back</button>
                <button className="btn btn-primary" onClick={() => { onAdd({ ...form, id: Date.now(), avatar: form.name.substring(0, 2).toUpperCase(), subs: '0', views: '0', watchTime: '0', revenue: '0', lastUpload: 'Just added', trend: 'stable' }); onClose(); }}>Finish</button>
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

  const buildInitialList = () => {
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
        views: fmt(ch.analytics?.views28d || 0),
        watchTime: ch.analytics?.watchTimeHours ? fmt(ch.analytics.watchTimeHours) + 'h' : '0',
        revenue: '—',
        lastUpload: '—',
        trend: 'stable',
        lastVideo: { title: 'Latest Content', views: '—', ctr: '—', retention: '—', suggestion: 'Waiting for data...' }
      }));
    }
    return mockChannels.map(ch => ({
      ...ch,
      subs: ch.subs,
      views: ch.views,
      watchTime: ch.watchTime.replace(' hrs', 'h'),
      lastVideo: {
        title: ch.video || 'Latest Content',
        views: ch.rtViews || '—',
        ctr: ch.ctr || '—',
        retention: ch.retention || '—',
        suggestion: ch.trend === 'declining' ? 'Analyze audience drop-off points.' : 'Keep maintaining consistency.'
      }
    }));
  };

  const [channelList, setChannelList] = useState(buildInitialList);
  const [categories, setCategories] = useState(() => {
    const fromChannels = [...new Set(channelList.map(c => c.niche).filter(n => n && n !== 'Uncategorized'))];
    return fromChannels.length > 0 ? fromChannels : ['Technology', 'Gaming', 'Lifestyle', 'Business'];
  });
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showCatDrawer, setShowCatDrawer] = useState(false);
  const [settingsChannel, setSettingsChannel] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handleUpdate = (updated) => setChannelList(prev => prev.map(c => c.id === updated.id ? updated : c));
  const handleDelete = (id) => setChannelList(prev => prev.filter(c => c.id !== id));

  const filtered = channelList
    .filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.niche.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchCat = filterCat === 'all' || (filterCat === 'Uncategorized' ? (!c.niche || c.niche === 'Uncategorized') : c.niche === filterCat);
      return matchSearch && matchStatus && matchCat;
    })
    .sort((a, b) => sortKey === 'name' ? a.name.localeCompare(b.name) : parseInt(b.subs) - parseInt(a.subs));

  return (
    <div className="ac-container">
      <header className="ac-header-main">
        <div className="header-info">
          <h2 className="h2">{locale === 'id' ? 'Semua Channel' : 'All Channels'}</h2>
          <p className="p-muted">Manage and organize your YouTube network categories and performance.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowCatDrawer(true)}>
            <Tag size={16} /> Manage Categories
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddDrawer(true)}>
            <Plus size={16} /> Add Channel
          </button>
        </div>
      </header>

      <div className="ac-filters">
        <div className="ac-search">
          <Search size={15} />
          <input type="text" placeholder="Search channels or categories..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} className="clear-icon" onClick={() => setSearch('')} />}
        </div>
        <div className="ac-selects">
          <div className="ac-select-wrap">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Uncategorized">Uncategorized</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>
          <div className="ac-select-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Testing">Testing</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={14} />
          </div>
          <div className="ac-select-wrap">
            <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="subs">Sort: Subs</option>
            </select>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="ac-table">
        <div className="ac-table-header">
          <span className="col-ch">Channel</span>
          <span className="col-up">Last Upload</span>
          <span className="col-trend">Trend</span>
          <span className="col-stat">Subs</span>
          <span className="col-stat">Views</span>
          <span className="col-stat">Watch</span>
          <span className="col-stat">Rev</span>
          <span className="col-act"></span>
        </div>

        <div className="ac-table-body">
          <AnimatePresence>
            {filtered.map((ch) => {
              const color = getColor(ch.name);
              const isExpanded = expandedId === ch.id;
              const trend = TREND_STYLE[ch.trend] || TREND_STYLE.stable;
              const status = STATUS_STYLE[ch.status] || STATUS_STYLE.Active;
              const Icon = trend.icon;

              return (
                <div key={ch.id} className={`ac-row-wrap ${isExpanded ? 'is-expanded' : ''}`}>
                  <div className="ac-row" onClick={() => setExpandedId(isExpanded ? null : ch.id)}>
                    <div className="col-ch ac-identity">
                      <div className="ac-avatar" style={{ background: color + '15', color }}>
                        {ch.thumbnail ? <img src={ch.thumbnail} alt="" /> : ch.avatar}
                      </div>
                      <div className="ac-info">
                        <span className="ac-name">{ch.name}</span>
                        <div className="ac-meta">
                          <button 
                            className="ac-cat-link" 
                            onClick={(e) => { e.stopPropagation(); setSettingsChannel(ch); }}
                            title="Click to move category"
                          >
                            <Tag size={10} /> {ch.niche || 'Uncategorized'}
                          </button>
                          <span className="status-pill" style={{ background: status.bg, color: status.color }}>{ch.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-up ac-upload-col">
                      <span className="val-text">{ch.lastUpload}</span>
                    </div>

                    <div className="col-trend">
                      <span className="trend-badge" style={{ background: trend.bg, color: trend.color }}>
                        <Icon size={12} />
                        {trend.label}
                      </span>
                    </div>

                    <div className="col-stat"><span className="val-text">{ch.subs}</span></div>
                    <div className="col-stat"><span className="val-text">{ch.views}</span></div>
                    <div className="col-stat"><span className="val-text">{ch.watchTime}</span></div>
                    <div className="col-stat"><span className="val-text">{ch.revenue}</span></div>

                    <div className="col-act ac-row-actions" onClick={e => e.stopPropagation()}>
                      <button className="icon-btn-sm" onClick={() => setSettingsChannel(ch)} title="Edit Channel / Move Category">
                        <Edit3 size={14} />
                      </button>
                      <button className="icon-btn-sm" onClick={() => setExpandedId(isExpanded ? null : ch.id)} title="View Analytics">
                        <BarChart2 size={14} />
                      </button>
                      <button className="icon-btn-sm danger" onClick={() => handleDelete(ch.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="ac-row-details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="details-content">
                          <div className="details-grid">
                            <div className="details-box">
                              <label>Latest Video</label>
                              <p className="video-title">{ch.lastVideo.title}</p>
                              <a href="#" className="link-text">Open in Studio <ExternalLink size={12} /></a>
                            </div>
                            <div className="details-metrics">
                              <div className="d-met">
                                <span className="d-lab">Views</span>
                                <span className="d-val">{ch.lastVideo.views}</span>
                              </div>
                              <div className="d-met">
                                <span className="d-lab">CTR</span>
                                <span className="d-val">{ch.lastVideo.ctr}</span>
                              </div>
                              <div className="d-met">
                                <span className="d-lab">Retention</span>
                                <span className="d-val">{ch.lastVideo.retention}</span>
                              </div>
                            </div>
                            <div className="details-suggestion">
                              <div className="sugg-header"><Info size={14} /> Recommended Action</div>
                              <p>{ch.lastVideo.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Add Button remains as quick access */}
      <button className="ac-fab" onClick={() => setShowAddDrawer(true)}>
        <Plus size={20} />
        <span>Add Channel</span>
      </button>

      {/* Drawers */}
      <AnimatePresence>
        {showAddDrawer && (
          <AddChannelDrawer
            categories={categories}
            onClose={() => setShowAddDrawer(false)}
            onAdd={ch => setChannelList(prev => [...prev, ch])}
          />
        )}
        {showCatDrawer && (
          <CategoryManagerDrawer
            categories={categories}
            channels={channelList}
            onClose={() => setShowCatDrawer(false)}
            onUpdateCategories={setCategories}
            onUpdateChannels={setChannelList}
          />
        )}
        {settingsChannel && (
          <ChannelSettingsDrawer
            channel={settingsChannel}
            categories={categories}
            onClose={() => setSettingsChannel(null)}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
