import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Play, 
  Shield, 
  FileText, 
  AlertTriangle, 
  Target, 
  CheckCircle2, 
  Info, 
  XCircle,
  RefreshCw,
  PlusCircle,
  ChevronDown,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ActivityLog.css';

export default function ActivityLog() {
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const activities = [
    {
      date: locale === 'id' ? 'Hari Ini' : 'Today',
      items: [
        {
          id: 1,
          title: locale === 'id' ? 'Kategori Channel Diperbarui' : 'Channel category updated',
          desc: 'Rock’n’Retro Radio moved from Uncategorized to Music.',
          user: 'Admin User',
          time: '10 mins ago',
          type: 'Channel',
          status: 'Success',
          icon: <Play size={16} />,
        },
        {
          id: 2,
          title: locale === 'id' ? 'Sinkronisasi Data YouTube Selesai' : 'YouTube data sync completed',
          desc: '1 channel updated successfully.',
          user: 'System',
          time: '1 hour ago',
          type: 'System',
          status: 'Success',
          icon: <RefreshCw size={16} />,
        },
        {
          id: 3,
          title: locale === 'id' ? 'Anggota Tim Diundang' : 'Team member invited',
          desc: 'Invitation sent to sarah@example.com with Analyst role.',
          user: 'Admin User',
          time: '3 hours ago',
          type: 'Team',
          status: 'Info',
          icon: <User size={16} />,
        }
      ]
    },
    {
      date: locale === 'id' ? 'Kemarin' : 'Yesterday',
      items: [
        {
          id: 4,
          title: locale === 'id' ? 'Laporan Bulanan Dibuat' : 'Monthly report generated',
          desc: 'April 2026 performance report is now available.',
          user: 'Admin User',
          time: 'Yesterday, 4:30 PM',
          type: 'Reports',
          status: 'Success',
          icon: <FileText size={16} />,
        },
        {
          id: 5,
          title: locale === 'id' ? 'Gagal Sinkronisasi Token' : 'Token sync failed',
          desc: 'Authentication token for moodtunes-account expired.',
          user: 'System',
          time: 'Yesterday, 10:15 AM',
          type: 'Account',
          status: 'Error',
          icon: <AlertTriangle size={16} />,
        }
      ]
    }
  ];

  const summary = [
    { label: locale === 'id' ? 'Total Aktivitas' : 'Total Activities', value: 124, icon: <History size={18} />, color: 'primary' },
    { label: locale === 'id' ? 'Hari Ini' : 'Today', value: 18, icon: <Calendar size={18} />, color: 'success' },
    { label: locale === 'id' ? 'Peringatan' : 'Warnings', value: 3, icon: <AlertTriangle size={18} />, color: 'warning' },
    { label: 'Errors', value: 1, icon: <XCircle size={18} />, color: 'danger' },
  ];

  const getStatusClass = (status) => status.toLowerCase();

  return (
    <div className="activity-container">
      <header className="activity-header">
        <div className="ah-left">
          <h2 className="h2">{locale === 'id' ? 'Log Aktivitas' : 'Activity Log'}</h2>
          <p className="p-muted">{locale === 'id' ? 'Lacak tindakan, perubahan, dan peristiwa sistem terbaru di workspace Anda.' : 'Track recent actions, changes, and system events in your workspace.'}</p>
        </div>
      </header>

      <section className="activity-summary mt-32">
        {summary.map((card, i) => (
          <div key={i} className="summary-card-small">
            <div className={`sc-icon ${card.color}`}>{card.icon}</div>
            <div className="sc-info">
              <div className="sc-val">{card.value}</div>
              <div className="sc-label">{card.label}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="activity-filters card mt-32">
        <div className="filter-row">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={locale === 'id' ? 'Cari aktivitas...' : 'Search activity...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <div className="filter-select-wrap">
              <select className="filter-select">
                <option>{locale === 'id' ? 'Semua Aktivitas' : 'All Activities'}</option>
                <option>Channel</option>
                <option>Account</option>
                <option>Team</option>
                <option>Reports</option>
                <option>System</option>
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
            <div className="filter-select-wrap">
              <select className="filter-select">
                <option>{locale === 'id' ? 'Semua Pengguna' : 'All Users'}</option>
                <option>Admin User</option>
                <option>System</option>
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
            <div className="filter-select-wrap">
              <select className="filter-select">
                <option>{locale === 'id' ? 'Hari Ini' : 'Today'}</option>
                <option>Last 7 Days</option>
                <option>Last 28 Days</option>
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>
        </div>
      </section>

      <section className="activity-timeline mt-40">
        {activities.length > 0 ? (
          activities.map((group, i) => (
            <div key={i} className="timeline-group">
              <div className="timeline-date">{group.date}</div>
              <div className="timeline-items">
                {group.items.map((item, idx) => (
                  <motion.div 
                    key={item.id} 
                    className="activity-item card"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className={`activity-icon-wrap ${item.status.toLowerCase()}`}>
                      {item.icon}
                    </div>
                    <div className="activity-main">
                      <div className="activity-top">
                        <h4 className="activity-title">{item.title}</h4>
                        <div className="activity-badges">
                          <span className="type-badge">{item.type}</span>
                          <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                        </div>
                      </div>
                      <p className="activity-desc">{item.desc}</p>
                      <div className="activity-meta">
                        <span className="meta-user"><User size={12} /> {item.user}</span>
                        <span className="meta-dot">•</span>
                        <span className="meta-time"><Clock size={12} /> {item.time}</span>
                      </div>
                    </div>
                    <button className="activity-detail-btn">
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state card text-center p-40">
            <History size={48} className="mx-auto mb-16 text-dim" />
            <h3 className="h3">{locale === 'id' ? 'Belum ada aktivitas' : 'No activity yet'}</h3>
            <p className="p-muted mt-8">{locale === 'id' ? 'Tindakan penting dan peristiwa sistem akan muncul di sini.' : 'Important actions and system events will appear here.'}</p>
          </div>
        )}
      </section>

      {activities.length > 0 && (
        <div className="mt-40 text-center">
          <button className="btn btn-secondary">{locale === 'id' ? 'Muat Lebih Banyak' : 'Load More Activity'}</button>
        </div>
      )}
    </div>
  );
}
