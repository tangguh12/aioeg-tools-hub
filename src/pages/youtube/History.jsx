import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { History as HistoryIcon, Clock, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import './History.css';

export default function History() {
  const { t } = useLanguage();

  const historyItems = [
    { id: 1, type: 'comment', title: 'Replied to DevBro', time: '2 hours ago', channel: 'Cooking Daily' },
    { id: 2, type: 'issue', title: 'Resolved Performance Drop', time: '5 hours ago', channel: 'Travel Vlogs' },
    { id: 3, type: 'comment', title: 'Resolved Maria L. comment', time: '1 day ago', channel: 'Tech Insider' },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'comment': return <MessageSquare size={18} />;
      case 'issue': return <AlertCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div className="history-container">
      <header className="page-header">
        <div className="header-info">
          <h2 className="h2">{t('history')}</h2>
          <p className="p-muted">Track your past actions and resolved tasks.</p>
        </div>
      </header>

      <div className="history-list card">
        {historyItems.map((item) => (
          <div key={item.id} className="history-item">
            <div className={`history-icon-wrap ${item.type}`}>
              {getIcon(item.type)}
            </div>
            <div className="history-details">
              <h4 className="history-title">{item.title}</h4>
              <div className="history-meta">
                <span className="h-channel">{item.channel}</span>
                <span className="h-dot">·</span>
                <span className="h-time">{item.time}</span>
              </div>
            </div>
            <div className="history-status">
              <CheckCircle2 size={16} className="text-success" />
              <span>{t('resolved')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
