import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  ChevronDown, 
  X,
  MessageSquare, 
  ThumbsUp, 
  Heart, 
  Reply, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Clock,
  Sparkles,
  Send,
  CornerDownRight,
  History as HistoryIcon,
  Layout,
  RefreshCw
} from 'lucide-react';
import './Comments.css';

export default function Comments() {
  const { t } = useLanguage();
  const { resolveComment, resolvedCommentIds } = useNotifications();
  const { allComments: apiComments, isLoading: authLoading, refreshAccount, connectedAccounts } = useAuth();
  
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedSugg, setExpandedSugg] = useState({});

  // Mock data as fallback
  const mockComments = [
    {
      id: 'mock-1',
      author: 'DevBro',
      time: t('hoursAgo').replace('{n}', '5'),
      content: 'Do you have a vegetarian version of the chicken bowl? Would love that.',
      channel: 'Cooking Daily',
      video: 'Top 10 High-Protein Meals Under 30 Minutes',
      likes: 34,
      status: 'needs-reply',
      avatar: 'DB',
      suggestions: ['Yes, we recommend using chickpeas or tofu as a substitute!', 'Absolutely! You can check our vegetarian playlist for more.']
    },
    {
      id: 'mock-2',
      author: 'Maria L.',
      time: t('hoursAgo').replace('{n}', '3'),
      content: 'Finally a fair comparison! Most videos just pick a side but you gave a solid breakdown.',
      channel: 'Tech Insider',
      video: 'iPhone 16 vs Samsung S25 Ultra — Full Comparison',
      likes: 210,
      status: 'important',
      avatar: 'ML'
    }
  ];

  // Use API comments if available, otherwise fallback to mock
  const combinedComments = useMemo(() => {
    if (apiComments && apiComments.length > 0) {
      return apiComments;
    }
    return mockComments;
  }, [apiComments, t]);

  const activeComments = useMemo(() => {
    return combinedComments.filter(c => !resolvedCommentIds.includes(c.id));
  }, [combinedComments, resolvedCommentIds]);

  const historyComments = useMemo(() => {
    return combinedComments.filter(c => resolvedCommentIds.includes(c.id));
  }, [combinedComments, resolvedCommentIds]);

  // Updated stats and order per user request: New, Needs Reply, All, History
  const stats = useMemo(() => {
    const totalAll = combinedComments.length;
    const totalNew = activeComments.filter(c => c.status === 'new' || !c.status).length;
    const needsReplyCount = activeComments.filter(c => c.status === 'needs-reply').length;

    return [
      { id: 'new', label: t('newComments'), value: totalNew, accent: '#6366f1' },
      { id: 'needs-reply', label: t('needsReply'), value: needsReplyCount, accent: '#f59e0b' },
      { id: 'all', label: 'All Comments', value: totalAll, accent: '#94a3b8', icon: Layout },
      { id: 'history', label: t('history'), value: historyComments.length, accent: '#10b981', icon: HistoryIcon },
    ];
  }, [activeComments, historyComments, combinedComments, t]);

  const handleSync = () => {
    if (connectedAccounts.length > 0) {
      refreshAccount(connectedAccounts[0].email);
    }
  };

  const handleResolve = (id) => {
    resolveComment(id);
  };

  const handleReply = (id) => {
    handleResolve(id);
    setReplyingTo(null);
    setReplyText('');
  };

  const displayComments = useMemo(() => {
    let baseList;
    if (filterStatus === 'all') baseList = combinedComments;
    else if (filterStatus === 'history') baseList = historyComments;
    else if (filterStatus === 'new') baseList = activeComments.filter(c => c.status === 'new' || !c.status);
    else if (filterStatus === 'needs-reply') baseList = activeComments.filter(c => c.status === 'needs-reply');
    else baseList = activeComments;
    
    return baseList.filter(c => {
      const matchesSearch = c.author.toLowerCase().includes(search.toLowerCase()) || 
                          c.content.toLowerCase().includes(search.toLowerCase());
      const matchesChannel = filterChannel === 'all' || c.channel.toLowerCase().includes(filterChannel.toLowerCase());
      return matchesSearch && matchesChannel;
    });
  }, [combinedComments, activeComments, historyComments, search, filterStatus, filterChannel]);

  const getStatusClass = (status) => {
    switch(status) {
      case 'needs-reply': return 'status-needs-reply';
      case 'important': return 'status-important';
      case 'replied': return 'status-replied';
      default: return 'status-new';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'needs-reply': return t('needsReply');
      case 'important': return t('important');
      case 'replied': return t('replied');
      default: return t('newComments');
    }
  };

  const isItemResolved = (id) => resolvedCommentIds.includes(id);

  return (
    <div className="cm-container">
      <header className="cm-header">
        <div className="cm-header-left">
          <h2 className="h2">{t('commentsTitle')}</h2>
          <p className="p-muted">{t('commentsSubtitle')}</p>
        </div>
        <div className="cm-header-right">
          <button className="btn btn-secondary" onClick={handleSync} disabled={authLoading}>
            <RefreshCw size={16} className={authLoading ? 'spinning' : ''} />
            <span>{authLoading ? 'Syncing...' : 'Sync with YouTube'}</span>
          </button>
        </div>
      </header>

      {connectedAccounts.length === 0 && (
        <div className="sync-banner">
          <AlertCircle size={18} />
          <span>Connect your YouTube account in Settings to sync real comments.</span>
        </div>
      )}

      <section className="cm-stats four-cols">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`cm-stat-card ${filterStatus === stat.id ? 'active' : ''}`} 
            style={{ '--accent': stat.accent }}
            onClick={() => setFilterStatus(stat.id)}
          >
            {stat.icon ? <stat.icon size={20} className="stat-icon-mini" /> : <div className="cm-stat-value">{stat.value}</div>}
            <div className="cm-stat-label">
              {stat.id === 'all' ? `(${stat.value}) ${stat.label}` : stat.label}
            </div>
            {filterStatus === stat.id && <div className="stat-indicator" />}
          </div>
        ))}
      </section>

      <div className="cm-filters">
        <div className="cm-search">
          <Search size={16} />
          <input type="text" placeholder={t('searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="cm-clear" onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
        
        <div className="cm-selects">
          <div className="cm-select-wrap">
            <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
              <option value="all">{t('allCategories')}</option>
              {Array.from(new Set(combinedComments.map(c => c.channel))).map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
          <div className="cm-select-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">{t('allStatus')}</option>
              <option value="new">{t('newComments')}</option>
              <option value="needs-reply">{t('needsReply')}</option>
              <option value="history">{t('history')}</option>
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        </div>
      </div>

      <div className="cm-list">
        <p className="cm-count">{t('commentsFound').replace('{count}', displayComments.length)}</p>
        
        <AnimatePresence mode='popLayout'>
          {displayComments.map((comment) => (
            <motion.div 
              key={comment.id} 
              className={`cm-card ${isItemResolved(comment.id) ? 'is-resolved' : ''}`} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              layout
            >
              <div className="cm-card-top">
                <div className="cm-avatar" style={{ backgroundColor: `hsl(${comment.author.length * 20}, 50%, 40%)`, color: 'white' }}>
                  {comment.avatar}
                </div>
                <div className="cm-author-block">
                  <span className="cm-author-name">{comment.author}</span>
                  <span className="cm-time">{comment.time}</span>
                </div>
                <span className={`cm-status-badge ${isItemResolved(comment.id) ? 'status-replied' : getStatusClass(comment.status)}`}>
                  {isItemResolved(comment.id) ? t('resolved') : getStatusLabel(comment.status)}
                </span>
              </div>

              <div className="cm-context">
                <span className="cm-channel-badge" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>{comment.channel}</span>
                {comment.video && (
                  <>
                    <span className="cm-context-sep">·</span>
                    <span className="cm-video-label">{comment.video}</span>
                  </>
                )}
              </div>

              <p className="cm-text" dangerouslySetInnerHTML={{ __html: comment.content }}></p>

              {!isItemResolved(comment.id) && comment.suggestions && (
                <div className="cm-suggestion">
                  <div className="cm-suggestion-header" onClick={() => setExpandedSugg(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}>
                    <Sparkles size={14} />
                    <span>{t('replySugg')}</span>
                    <ChevronDown size={14} className={`sugg-arrow ${expandedSugg[comment.id] ? 'open' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {expandedSugg[comment.id] && (
                      <motion.div className="cm-suggestion-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <div className="cm-suggestion-actions">
                          {comment.suggestions.map((s, idx) => (
                            <button key={idx} className="btn btn-secondary btn-small" onClick={() => { setReplyingTo(comment.id); setReplyText(s); }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div className="cm-reply-input" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <textarea placeholder={t('placeholderReply')} value={replyText} onChange={e => setReplyText(e.target.value)} autoFocus />
                    <div className="cm-reply-input-actions">
                      <button className="btn btn-secondary btn-small" onClick={() => setReplyingTo(null)}>{t('cancel')}</button>
                      <button className="btn btn-primary btn-small" onClick={() => handleReply(comment.id)}>
                        <Send size={14} />
                        <span>{t('sendReply')}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="cm-actions">
                <button className="cm-action">
                  <ThumbsUp size={16} />
                  <span>{comment.likes} {t('like')}</span>
                </button>
                {!isItemResolved(comment.id) && (
                  <button className={`cm-action ${replyingTo === comment.id ? 'active' : ''}`} onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                    <Reply size={16} />
                    <span>{t('replyAction')}</span>
                  </button>
                )}
                
                <div className="cm-actions-right">
                  {comment.video && <button className="cm-action">{t('openVideo')}</button>}
                  {!isItemResolved(comment.id) && (
                    <button className="cm-action cm-done" onClick={() => handleResolve(comment.id)}>
                      <CheckCircle2 size={16} />
                      <span>{t('resolved')}</span>
                    </button>
                  )}
                  {isItemResolved(comment.id) && (
                    <span className="history-done-tag">
                      <CheckCircle2 size={14} />
                      {t('resolved')}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {displayComments.length === 0 && (
            <motion.div className="cm-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {filterStatus === 'history' ? (
                <>
                  <HistoryIcon size={48} className="empty-icon" style={{ opacity: 0.2 }} />
                  <p>No history yet</p>
                  <span>Your replied and resolved comments will appear here.</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={48} className="empty-icon" />
                  <p>{t('noNewNotifications')}</p>
                  <span>{t('caughtUp')}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
