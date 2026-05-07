import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { channels as mockChannels } from '../../data/mockData';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Tag, 
  Layers, 
  Flag,
  X,
  Check,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Music,
  AlertTriangle
} from 'lucide-react';
import './ChannelSettings.css';

export default function ChannelSettings() {
  const { t, locale } = useLanguage();
  const { allChannels = [] } = useAuth();
  const channels = allChannels.length > 0 ? allChannels : mockChannels;

  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category' or 'tag'
  
  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, type: null, name: '' });

  // State for Categories with Persistence
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('creatordock_categories');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Music', desc: 'Channels focused on music and radio.', focus: 'Rock n Roll, Jazz', count: 3 },
      { id: 2, name: 'Technology', desc: 'Tech reviews and tutorials.', focus: 'AI, Gadgets', count: 4 },
      { id: 3, name: 'Finance', desc: 'Investing and money management.', focus: 'Stocks, Crypto', count: 2 },
      { id: 0, name: t('uncategorized'), desc: 'Default fallback category.', focus: '—', count: 5, readOnly: true }
    ];
  });

  // State for Tags with Persistence
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('creatordock_tags');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Retro', count: 5 },
      { id: 2, name: 'Indonesia', count: 12 },
      { id: 3, name: 'Long Video', count: 8 },
      { id: 4, name: 'Shorts', count: 15 }
    ];
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('creatordock_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('creatordock_tags', JSON.stringify(tags));
  }, [tags]);

  // Form State
  const [formData, setFormData] = useState({ name: '', desc: '', focus: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    if (modalType === 'category') {
      setCategories([...categories, { id: Date.now(), ...formData, count: 0 }]);
    } else {
      setTags([...tags, { id: Date.now(), name: formData.name, count: 0 }]);
    }
    setShowModal(false);
    setFormData({ name: '', desc: '', focus: '' });
  };

  const initiateDelete = (id, type, name) => {
    setDeleteConfirm({ isOpen: true, id, type, name });
  };

  const confirmDelete = () => {
    const { id, type } = deleteConfirm;
    if (type === 'category') {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      setTags(tags.filter(t => t.id !== id));
    }
    setDeleteConfirm({ isOpen: false, id: null, type: null, name: '' });
  };

  return (
    <div className="channel-settings-page">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('channelSettingsTitle')}</h2>
          <p className="p-muted">{t('channelSettingsSubtitle')}</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Layers size={18} /> {t('categoriesTab')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          <Flag size={18} /> {t('statusPriorityTab')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          <Tag size={18} /> {t('tagsTab')}
        </button>
      </div>

      <main className="settings-content card">
        {activeTab === 'categories' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h3 className="h3">{t('categoriesTab')}</h3>
              <button className="btn btn-primary btn-small" onClick={() => { setModalType('category'); setShowModal(true); }}>
                <Plus size={16} /> {t('createCategory')}
              </button>
            </div>
            
            <table className="settings-table">
              <thead>
                <tr>
                  <th>{t('categoryName')}</th>
                  <th>{t('focusNiche')}</th>
                  <th>{t('categoryDesc')}</th>
                  <th>{t('numChannels')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td className="fw-600">{cat.name}</td>
                    <td className="p-muted">
                      <div className="focus-cell">
                        <Music size={14} className="music-icon" />
                        <span>{cat.focus || '—'}</span>
                      </div>
                    </td>
                    <td className="p-muted">{cat.desc}</td>
                    <td><span className="badge-count">{cat.count}</span></td>
                    <td>
                      <div className="table-actions">
                        {!cat.readOnly && (
                          <>
                            <button className="icon-btn-small" title={t('edit')}><Edit2 size={14} /></button>
                            <button 
                              className="icon-btn-small danger" 
                              onClick={() => initiateDelete(cat.id, 'category', cat.name)} 
                              title={t('delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        <button className="icon-btn-small" title={t('viewChannels')}><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h3 className="h3">{t('statusPriorityTab')}</h3>
            </div>
            
            <table className="settings-table">
              <thead>
                <tr>
                  <th>{t('channelName')}</th>
                  <th>{t('status')}</th>
                  <th>{t('priority')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {channels.map(ch => (
                  <tr key={ch.id}>
                    <td>
                      <div className="ch-cell">
                        <div className="ch-avatar-mini">{ch.name.substring(0,2)}</div>
                        <span>{ch.name}</span>
                      </div>
                    </td>
                    <td>
                      <select className="table-select status" defaultValue="active">
                        <option value="active">{t('active')}</option>
                        <option value="testing">{t('testing')}</option>
                        <option value="inactive">{t('inactive')}</option>
                        <option value="archived">{t('archived')}</option>
                        <option value="needsReview">{t('needsReview')}</option>
                      </select>
                    </td>
                    <td>
                      <select className="table-select priority" defaultValue="normal">
                        <option value="high">{t('high')}</option>
                        <option value="normal">{t('normal')}</option>
                        <option value="low">{t('low')}</option>
                      </select>
                    </td>
                    <td>
                      <button className="icon-btn-small"><Settings size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h3 className="h3">{t('tagsTab')}</h3>
              <button className="btn btn-primary btn-small" onClick={() => { setModalType('tag'); setShowModal(true); }}>
                <Plus size={16} /> {t('createTag')}
              </button>
            </div>
            
            <div className="tags-grid">
              {tags.map(tag => (
                <div key={tag.id} className="tag-item-card">
                  <div className="tag-info">
                    <span className="tag-name">#{tag.name}</span>
                    <span className="tag-count">{tag.count} {t('numChannels').toLowerCase()}</span>
                  </div>
                  <div className="tag-actions">
                    <button className="icon-btn-small"><Edit2 size={12} /></button>
                    <button 
                      className="icon-btn-small danger" 
                      onClick={() => initiateDelete(tag.id, 'tag', tag.name)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Main Modal (Create) */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div className="modal-content card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="modal-header">
                <h3 className="h3">{modalType === 'category' ? t('createCategory') : t('createTag')}</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="settings-form">
                <div className="form-group">
                  <label>{modalType === 'category' ? t('categoryName') : t('tagName')}</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder={modalType === 'category' ? "e.g. Music Entertainment" : "e.g. Tutorial"}
                    required
                  />
                </div>
                {modalType === 'category' && (
                  <>
                    <div className="form-group">
                      <label>{t('focusNiche')}</label>
                      <input 
                        type="text" 
                        value={formData.focus} 
                        onChange={e => setFormData({...formData, focus: e.target.value})}
                        placeholder="e.g. Rock n Roll, Jazz, Pop"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('categoryDesc')}</label>
                      <textarea 
                        value={formData.desc} 
                        onChange={e => setFormData({...formData, desc: e.target.value})}
                        rows={3}
                        placeholder="Short description of this category..."
                      />
                    </div>
                  </>
                )}
                <div className="form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                  <button type="submit" className="btn btn-primary">{t('saveChanges')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="modal-overlay">
            <motion.div className="modal-content card delete-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="delete-visual">
                <div className="delete-icon-box">
                  <AlertTriangle size={32} />
                </div>
              </div>
              <div className="modal-header center">
                <h3 className="h3">{t('confirmDeleteTitle')}</h3>
                <p className="p-muted">{t('confirmDeleteDesc', { name: deleteConfirm.name })}</p>
              </div>
              <div className="form-actions vertical">
                <button className="btn btn-danger full-width" onClick={confirmDelete}>{t('delete')}</button>
                <button className="btn btn-ghost full-width" onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}>{t('cancel')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for individual channel settings drawer
export function ChannelSettingsDrawer({ channel, isOpen, onClose, onSave }) {
  const { t } = useLanguage();
  if (!channel) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="drawer-overlay" onClick={onClose} />
          <motion.div 
            className="settings-drawer card"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="drawer-header">
              <h3 className="h3">{t('channelSettingsTitle')}</h3>
              <button className="close-btn" onClick={onClose}><X size={24} /></button>
            </div>

            <div className="drawer-content">
              <div className="ch-preview">
                <div className="ch-avatar-large">{channel.name.substring(0,2)}</div>
                <div className="ch-meta">
                  <h4 className="h4">{channel.name}</h4>
                  <p className="p-muted">{channel.id}</p>
                </div>
              </div>

              <div className="settings-form">
                <div className="form-group">
                  <label>{t('categoriesTab')}</label>
                  <select defaultValue="uncategorized">
                    <option value="uncategorized">{t('uncategorized')}</option>
                    <option value="music">Music</option>
                    <option value="tech">Technology</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('status')}</label>
                    <select defaultValue="active">
                      <option value="active">{t('active')}</option>
                      <option value="testing">{t('testing')}</option>
                      <option value="needsReview">{t('needsReview')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('priority')}</label>
                    <select defaultValue="normal">
                      <option value="high">{t('high')}</option>
                      <option value="normal">{t('normal')}</option>
                      <option value="low">{t('low')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('tagsTab')}</label>
                  <input type="text" placeholder="Add tags, separated by comma..." defaultValue="Retro, Radio, Music" />
                </div>

                <div className="form-group">
                  <label>{t('channelNotes')}</label>
                  <textarea rows={4} placeholder="Add private notes about this channel..." />
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={() => { onSave(); onClose(); }}>{t('saveChanges')}</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
