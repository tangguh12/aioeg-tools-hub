import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { mockComments } from '../../data/mockData';
import {
  Search, ThumbsUp, Heart, MessageSquare,
  ExternalLink, CheckCheck, ChevronDown, Sparkles, Send, X
} from 'lucide-react';
import './Comments.css';

const STATUS_CONFIG = {
  'new':         { label: 'New',          className: 'status-new' },
  'needs-reply': { label: 'Needs Reply',  className: 'status-needs-reply' },
  'replied':     { label: 'Replied',      className: 'status-replied' },
  'loved':       { label: 'Loved',        className: 'status-loved' },
  'important':   { label: 'Important',    className: 'status-important' },
};

const CHANNEL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
function getChannelColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CHANNEL_COLORS[Math.abs(h) % CHANNEL_COLORS.length];
}

const ALL_CHANNELS = [...new Set(mockComments.map(c => c.channel))];

export default function Comments() {
  const { locale } = useLanguage();
  const [comments, setComments] = useState(mockComments);
  const [search, setSearch] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [activeReply, setActiveReply] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  const toggleLike = (id) =>
    setComments(cs => cs.map(c => c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c));

  const toggleHeart = (id) =>
    setComments(cs => cs.map(c => c.id === id ? { ...c, hasHeart: !c.hasHeart, status: !c.hasHeart ? 'loved' : c.status } : c));

  const markDone = (id) =>
    setComments(cs => cs.map(c => c.id === id ? { ...c, status: 'replied' } : c));

  const handleReply = (id) => {
    setComments(cs => cs.map(c => c.id === id
      ? { ...c, replied: true, replyText, status: 'replied' }
      : c
    ));
    setActiveReply(null);
    setReplyText('');
  };

  const openReply = (id, suggested = '') => {
    setActiveReply(id);
    setReplyText(suggested);
    setExpandedSuggestion(null);
  };

  // Derived stats
  const stats = [
    { label: locale === 'id' ? 'Komentar Baru' : 'New Comments',   value: comments.filter(c => c.status === 'new').length,          color: '#6366f1' },
    { label: locale === 'id' ? 'Perlu Dibalas'  : 'Needs Reply',   value: comments.filter(c => c.status === 'needs-reply').length,   color: '#f59e0b' },
    { label: locale === 'id' ? 'Dibalas Hari Ini': 'Replied Today', value: comments.filter(c => c.status === 'replied').length,       color: '#10b981' },
    { label: locale === 'id' ? 'Penting'         : 'Important',     value: comments.filter(c => c.status === 'important').length,     color: '#ef4444' },
  ];

  // Filter + sort
  const filtered = comments
    .filter(c => {
      const matchSearch = c.text.toLowerCase().includes(search.toLowerCase())
        || c.author.toLowerCase().includes(search.toLowerCase())
        || c.video.toLowerCase().includes(search.toLowerCase());
      const matchChannel = filterChannel === 'all' || c.channel === filterChannel;
      const matchStatus  = filterStatus  === 'all' || c.status  === filterStatus;
      return matchSearch && matchChannel && matchStatus;
    })
    .sort((a, b) => sortOrder === 'newest' ? b.id - a.id : a.id - b.id);

  return (
    <div className="cm-container">

      {/* Header */}
      <header className="cm-header">
        <div>
          <h2 className="h2">{locale === 'id' ? 'Komentar' : 'Comments'}</h2>
          <p className="p-muted">
            {locale === 'id'
              ? 'Kelola komentar dari semua channel YouTube yang terhubung.'
              : 'Manage comments across all connected YouTube channels.'}
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="cm-filters">
        <div className="cm-search">
          <Search size={15} />
          <input
            type="text"
            placeholder={locale === 'id' ? 'Cari komentar, video, atau pembuat...' : 'Search comments, videos, or authors...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="cm-clear" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>

        <div className="cm-selects">
          <div className="cm-select-wrap">
            <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
              <option value="all">{locale === 'id' ? 'Semua Channel' : 'All Channels'}</option>
              {ALL_CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
            </select>
            <ChevronDown size={13} className="select-arrow" />
          </div>

          <div className="cm-select-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">{locale === 'id' ? 'Semua Status' : 'All Status'}</option>
              <option value="new">New</option>
              <option value="needs-reply">Needs Reply</option>
              <option value="replied">Replied</option>
              <option value="important">Important</option>
              <option value="loved">Loved</option>
            </select>
            <ChevronDown size={13} className="select-arrow" />
          </div>

          <div className="cm-select-wrap">
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="newest">{locale === 'id' ? 'Terbaru' : 'Newest First'}</option>
              <option value="oldest">{locale === 'id' ? 'Terlama' : 'Oldest First'}</option>
            </select>
            <ChevronDown size={13} className="select-arrow" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="cm-stats">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="cm-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{ '--accent': s.color }}
          >
            <span className="cm-stat-value">{s.value}</span>
            <span className="cm-stat-label">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Results count */}
      <p className="cm-count">
        {filtered.length} {locale === 'id' ? 'komentar ditemukan' : 'comments'}
      </p>

      {/* Comment List */}
      <div className="cm-list">
        <AnimatePresence>
          {filtered.length === 0 && (
            <div className="cm-empty">
              <MessageSquare size={32} />
              <p>{locale === 'id' ? 'Tidak ada komentar ditemukan.' : 'No comments found.'}</p>
            </div>
          )}

          {filtered.map((c, i) => {
            const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG['new'];
            const chColor = getChannelColor(c.channel);
            const isSuggExpanded = expandedSuggestion === c.id;
            const isReplying = activeReply === c.id;

            return (
              <motion.div
                key={c.id}
                className="cm-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: i * 0.05 }}
                style={{ '--ch-color': chColor }}
              >
                {/* Top Row: Avatar + Author + Time + Status */}
                <div className="cm-card-top">
                  <div className="cm-avatar" style={{ background: chColor + '22', color: chColor }}>
                    {c.avatar}
                  </div>
                  <div className="cm-author-block">
                    <span className="cm-author-name">{c.author}</span>
                    <span className="cm-time">{c.time}</span>
                  </div>
                  <span className={`cm-status-badge ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Context Row: Channel + Video */}
                <div className="cm-context">
                  <span className="cm-channel-badge" style={{ color: chColor, borderColor: chColor + '40', background: chColor + '15' }}>
                    {c.channel}
                  </span>
                  <span className="cm-context-sep">·</span>
                  <span className="cm-video-label">
                    {c.video}
                  </span>
                </div>

                {/* Comment Body */}
                <p className="cm-text">{c.text}</p>

                {/* Replied preview */}
                {c.replied && c.replyText && (
                  <div className="cm-reply-preview">
                    <div className="cm-reply-bar" />
                    <div className="cm-reply-body">
                      <span className="cm-reply-you">You</span>
                      <span>{c.replyText}</span>
                    </div>
                  </div>
                )}

                {/* Suggested Reply (for needs-reply) */}
                {c.suggestedReply && c.status === 'needs-reply' && !isReplying && (
                  <div className="cm-suggestion">
                    <div className="cm-suggestion-header" onClick={() => setExpandedSuggestion(isSuggExpanded ? null : c.id)}>
                      <Sparkles size={13} />
                      <span>{locale === 'id' ? 'Saran balasan' : 'Suggested reply'}</span>
                      <ChevronDown size={13} className={`sugg-arrow ${isSuggExpanded ? 'open' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {isSuggExpanded && (
                        <motion.div
                          className="cm-suggestion-body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p>"{c.suggestedReply}"</p>
                          <div className="cm-suggestion-actions">
                            <button className="btn btn-primary btn-small" onClick={() => openReply(c.id, c.suggestedReply)}>
                              Use Reply
                            </button>
                            <button className="btn btn-secondary btn-small" onClick={() => openReply(c.id, '')}>
                              Edit
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Reply Input */}
                <AnimatePresence>
                  {isReplying && (
                    <motion.div
                      className="cm-reply-input"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <textarea
                        placeholder={locale === 'id' ? 'Tulis balasan...' : 'Write a reply...'}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className="cm-reply-input-actions">
                        <button className="btn btn-secondary btn-small" onClick={() => { setActiveReply(null); setReplyText(''); }}>
                          Cancel
                        </button>
                        <button className="btn btn-primary btn-small" onClick={() => handleReply(c.id)} disabled={!replyText.trim()}>
                          <Send size={13} /> Send
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Row */}
                <div className="cm-actions">
                  <button className={`cm-action ${c.liked ? 'active' : ''}`} onClick={() => toggleLike(c.id)}>
                    <ThumbsUp size={14} fill={c.liked ? 'currentColor' : 'none'} />
                    <span>{c.likes}</span>
                  </button>

                  <button className={`cm-action ${c.hasHeart ? 'active-heart' : ''}`} onClick={() => toggleHeart(c.id)}>
                    <Heart size={14} fill={c.hasHeart ? 'currentColor' : 'none'} />
                    <span>{locale === 'id' ? 'Sukai' : 'Love'}</span>
                  </button>

                  <button className={`cm-action ${isReplying ? 'active' : ''}`} onClick={() => openReply(c.id, '')}>
                    <MessageSquare size={14} />
                    <span>{locale === 'id' ? 'Balas' : 'Reply'}</span>
                  </button>

                  <div className="cm-actions-right">
                    <a href={c.videoUrl} target="_blank" rel="noreferrer" className="cm-action">
                      <ExternalLink size={14} />
                      <span>{locale === 'id' ? 'Buka Video' : 'Open Video'}</span>
                    </a>
                    {c.status !== 'replied' && (
                      <button className="cm-action cm-done" onClick={() => markDone(c.id)}>
                        <CheckCheck size={14} />
                        <span>{locale === 'id' ? 'Selesai' : 'Mark Done'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
