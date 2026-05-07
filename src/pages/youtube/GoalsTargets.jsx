import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { channels as mockChannels } from '../../data/mockData';
import { 
  Plus, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  X,
  ChevronRight,
  TrendingUp,
  Calendar,
  MoreVertical,
  Filter,
  BarChart2,
  Users,
  Eye,
  DollarSign
} from 'lucide-react';
import './GoalsTargets.css';

export default function GoalsTargets() {
  const { t, locale } = useLanguage();
  const { allChannels = [] } = useAuth();
  const channels = allChannels.length > 0 ? allChannels : mockChannels;
  const hasRealChannels = allChannels.length > 0;

  const [showModal, setShowModal] = useState(false);
  // Only use mock targets when there are no real channels connected
  const [targets, setTargets] = useState(() => {
    if (hasRealChannels) return [];
    return [
      { id: 1, channelId: mockChannels[0]?.id, type: 'subs', value: 1300000, period: 'thisMonth', deadline: '2026-05-30' },
      { id: 2, channelId: mockChannels[1]?.id || mockChannels[0]?.id, type: 'views', value: 500000, period: 'thisMonth', deadline: '2026-05-25' }
    ];
  });

  // Form State
  const [newTarget, setNewTarget] = useState({
    channelId: channels[0]?.id || '',
    type: 'subs',
    value: '',
    period: 'thisMonth',
    deadline: ''
  });

  // Calculate stats for each target
  const processedTargets = useMemo(() => {
    return targets.map(target => {
      const channel = channels.find(c => c.id === target.channelId) || channels[0];
      if (!channel) return null;
      let current = 0;
      let label = '';
      
      switch(target.type) {
        case 'subs': 
          current = parseInt(String(channel.subscribers || channel.subs || '0').replace(/[^0-9]/g, '')) || 0;
          label = t('subsGoal');
          break;
        case 'views':
          current = channel.analytics?.views28d || parseInt(channel.views) || 0;
          label = t('viewsGoal');
          break;
        case 'watchTime':
          current = channel.analytics?.watchTimeHours || parseInt(channel.watchTime) || 0;
          label = t('watchTimeGoal');
          break;
        case 'revenue':
          current = channel.analytics?.revenue || parseInt(channel.revenue?.replace?.(/[^0-9]/g, '')) || 0;
          label = t('revGoal');
          break;
        default:
          current = 0;
          label = target.type;
      }

      const progress = Math.min(Math.round((current / target.value) * 100), 100);
      const remaining = Math.max(target.value - current, 0);
      
      // Calculate days left
      const today = new Date();
      const end = new Date(target.deadline);
      const diffTime = end - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status = 'in-progress';
      if (progress >= 100) status = 'completed';
      else if (progress >= 80) status = 'almost-there';
      else if (daysLeft < 0) status = 'overdue';
      else if (daysLeft <= 3) status = 'needs-attention';

      return {
        ...target,
        channel,
        current,
        label,
        progress,
        remaining,
        daysLeft,
        status
      };
    }).filter(Boolean);
  }, [targets, channels, t]);

  const stats = useMemo(() => {
    return {
      total: processedTargets.length,
      completed: processedTargets.filter(t => t.status === 'completed').length,
      inProgress: processedTargets.filter(t => t.status === 'in-progress' || t.status === 'almost-there').length,
      attention: processedTargets.filter(t => t.status === 'needs-attention' || t.status === 'overdue').length
    };
  }, [processedTargets]);

  const handleCreate = (e) => {
    e.preventDefault();
    const id = Date.now();
    setTargets([...targets, { ...newTarget, id, value: parseInt(newTarget.value) }]);
    setShowModal(false);
    setNewTarget({
      channelId: channels[0]?.id || '',
      type: 'subs',
      value: '',
      period: 'thisMonth',
      deadline: ''
    });
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return t('completed');
      case 'almost-there': return t('almostThere');
      case 'overdue': return t('overdue');
      case 'needs-attention': return t('needsAttention');
      default: return t('inProgress');
    }
  };

  const getTargetIcon = (type) => {
    switch(type) {
      case 'subs': return <Users size={16} />;
      case 'views': return <Eye size={16} />;
      case 'revenue': return <DollarSign size={16} />;
      default: return <Target size={16} />;
    }
  };

  return (
    <div className="target-page">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('targetTitle')}</h2>
          <p className="p-muted">{t('targetSubtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          {t('createTarget')}
        </button>
      </header>
      <section className="target-summary-grid">
        <div className="target-stat-card card">
          <div className="stat-icon gray"><BarChart2 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('totalTargets')}</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="target-stat-card card">
          <div className="stat-icon green"><CheckCircle2 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('completed')}</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
        <div className="target-stat-card card">
          <div className="stat-icon blue"><Clock size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('inProgress')}</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
        </div>
        <div className="target-stat-card card">
          <div className="stat-icon red"><AlertTriangle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('needsAttention')}</span>
            <span className="stat-value">{stats.attention}</span>
          </div>
        </div>
      </section>

      {/* Target List */}
      <section className="target-list-section">
        {processedTargets.length > 0 ? (
          <div className="target-grid">
            {processedTargets.map((target) => (
              <motion.div key={target.id} className="target-item-card card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="target-card-top">
                  <div className="ch-avatar">
                    {target.channel?.thumbnail ? (
                      <img src={target.channel.thumbnail} alt="" className="avatar-img" />
                    ) : (
                      (target.channel?.name || target.channel?.title || 'CH').substring(0,2)
                    )}
                  </div>
                  <div className="target-header-info">
                    <h4 className="ch-name">{target.channel?.name || target.channel?.title || 'Channel'}</h4>
                    <div className="target-type-badge">
                      {getTargetIcon(target.type)}
                      <span>{target.label}: {target.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`status-pill ${target.status}`}>
                    {getStatusLabel(target.status)}
                  </div>
                </div>

                <div className="target-progress-block">
                  <div className="progress-labels">
                    <span className="current">{target.current.toLocaleString()} / {target.value.toLocaleString()}</span>
                    <span className="percent">{target.progress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <motion.div 
                      className={`progress-fill ${target.status}`} 
                      initial={{ width: 0 }} 
                      animate={{ width: `${target.progress}%` }}
                    />
                  </div>
                </div>

                <div className="target-card-footer">
                  <div className="footer-item">
                    <Calendar size={14} />
                    <span>{target.daysLeft > 0 ? t('daysLeft', { n: target.daysLeft }) : t('overdue')}</span>
                  </div>
                  <div className="footer-item">
                    <TrendingUp size={14} />
                    <span>{t('remaining')}: {(target.value - target.current).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="target-empty-state card">
            <div className="empty-visual">
              <Target size={64} />
            </div>
            <h3 className="h3">{t('noTargetsTitle')}</h3>
            <p className="p-muted">{t('noTargetsSubtitle')}</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              {t('createTarget')}
            </button>
          </div>
        )}
      </section>

      {/* Create Target Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div className="modal-content card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="modal-header">
                <h3 className="h3">{t('createTarget')}</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="target-form">
                <div className="form-group">
                  <label>{t('selectChannel')}</label>
                  <select value={newTarget.channelId} onChange={(e) => setNewTarget({...newTarget, channelId: parseInt(e.target.value)})}>
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name || c.title || 'Unnamed'}</option>)}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('targetType')}</label>
                    <select value={newTarget.type} onChange={(e) => setNewTarget({...newTarget, type: e.target.value})}>
                      <option value="subs">{t('subsGoal')}</option>
                      <option value="views">{t('viewsGoal')}</option>
                      <option value="watchTime">{t('watchTimeGoal')}</option>
                      <option value="revenue">{t('revGoal')}</option>
                      <option value="uploads">{t('uploadGoal')}</option>
                      <option value="ctr">{t('ctrGoal')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('targetValue')}</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1000" 
                      value={newTarget.value} 
                      onChange={(e) => setNewTarget({...newTarget, value: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('period')}</label>
                    <select value={newTarget.period} onChange={(e) => setNewTarget({...newTarget, period: e.target.value})}>
                      <option value="thisWeek">{t('thisWeek')}</option>
                      <option value="thisMonth">{t('thisMonth')}</option>
                      <option value="last90">{t('last90Days')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('deadline')}</label>
                    <input 
                      type="date" 
                      value={newTarget.deadline} 
                      onChange={(e) => setNewTarget({...newTarget, deadline: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                  <button type="submit" className="btn btn-primary">{t('saveTarget')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
