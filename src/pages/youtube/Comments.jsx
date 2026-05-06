import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { mockComments } from '../../data/mockData';
import { Heart, ThumbsUp, MessageSquare, Send, MoreVertical, Search, Filter } from 'lucide-react';
import './Comments.css';

export default function Comments() {
  const { t } = useLanguage();
  const [comments, setComments] = useState(mockComments);
  const [activeReply, setActiveReply] = useState(null);

  const toggleLike = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c));
  };

  const toggleHeart = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, hasHeart: !c.hasHeart } : c));
  };

  return (
    <div className="comments-container">
      <header className="page-header">
        <div>
          <h2 className="h2">{t('comments')}</h2>
          <p className="p-muted">Manage interactions across all connected channels.</p>
        </div>
        <div className="page-actions">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search comments..." />
          </div>
          <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
        </div>
      </header>

      <div className="comments-list">
        {comments.map((comment, i) => (
          <motion.div 
            key={comment.id}
            className={`comment-card ${comment.isNew ? 'is-new' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="comment-header">
              <div className="comment-author">
                <div className="author-avatar">{comment.avatar}</div>
                <div>
                  <div className="author-name">{comment.author}</div>
                  <div className="comment-meta">
                    <span className="channel-tag">{comment.channel}</span>
                    <span className="dot"></span>
                    <span className="time-tag">{comment.time}</span>
                  </div>
                </div>
              </div>
              <div className="comment-actions-top">
                {comment.isNew && <span className="badge-new">{t('newComment')}</span>}
                <button className="icon-btn-small"><MoreVertical size={16} /></button>
              </div>
            </div>

            <div className="comment-body">
              <p className="comment-text">{comment.text}</p>
            </div>

            <div className="comment-footer">
              <div className="interaction-btns">
                <button 
                  className={`action-btn ${comment.liked ? 'active' : ''}`}
                  onClick={() => toggleLike(comment.id)}
                >
                  <ThumbsUp size={16} fill={comment.liked ? 'currentColor' : 'none'} />
                  <span>{comment.likes}</span>
                </button>
                <button 
                  className={`action-btn ${comment.hasHeart ? 'active-heart' : ''}`}
                  onClick={() => toggleHeart(comment.id)}
                >
                  <Heart size={16} fill={comment.hasHeart ? 'var(--danger)' : 'none'} stroke={comment.hasHeart ? 'var(--danger)' : 'currentColor'} />
                  <span>{t('love')}</span>
                </button>
                <button 
                  className={`action-btn ${activeReply === comment.id ? 'active' : ''}`}
                  onClick={() => setActiveReply(activeReply === comment.id ? null : comment.id)}
                >
                  <MessageSquare size={16} />
                  <span>{t('reply')}</span>
                </button>
              </div>

              {comment.replied && (
                <div className="reply-preview">
                  <div className="reply-line"></div>
                  <div className="reply-content">
                    <span className="reply-author">You:</span>
                    <p>{comment.replyText}</p>
                  </div>
                </div>
              )}

              {activeReply === comment.id && (
                <div className="reply-input-area">
                  <textarea placeholder={t('placeholderReply')}></textarea>
                  <div className="reply-actions">
                    <button className="btn btn-secondary btn-small" onClick={() => setActiveReply(null)}>Cancel</button>
                    <button className="btn btn-primary btn-small"><Send size={14} /> {t('sendReply')}</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
