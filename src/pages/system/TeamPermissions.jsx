import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  UserPlus, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  X, 
  Mail, 
  ChevronDown,
  AlertCircle,
  UserCheck,
  UserMinus,
  Settings,
  ShieldCheck,
  Eye,
  Edit,
  Trash2,
  Lock,
  Search,
  Layout,
  BarChart3,
  DollarSign,
  MessageSquare,
  FileText,
  Upload,
  Play
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './TeamPermissions.css';

export default function TeamPermissions() {
  const { t, locale } = useLanguage();
  const { connectedAccounts = [] } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Extract all unique channels from connected accounts
  const allChannels = connectedAccounts.flatMap(acc => acc.channels || []);

  const [members, setMembers] = useState([
    { 
      id: 1, 
      name: 'Admin User', 
      email: 'admin@aioeg.com', 
      role: 'Owner', 
      status: 'Active', 
      lastActive: 'Today', 
      avatar: 'M',
      assignedChannels: ['all'],
      permissions: {
        analytics: true,
        monetization: true,
        content: true,
        comments: true,
        admin: true
      }
    },
    { 
      id: 2, 
      name: 'Sarah Chen', 
      email: 'sarah@example.com', 
      role: 'Analyst', 
      status: 'Active', 
      lastActive: '2 hours ago', 
      avatar: 'SC',
      assignedChannels: ['all'],
      permissions: {
        analytics: true,
        monetization: true,
        content: false,
        comments: false,
        admin: false
      }
    },
    { 
      id: 3, 
      name: 'John Smith', 
      email: 'john@example.com', 
      role: 'Editor', 
      status: 'Pending', 
      lastActive: '-', 
      avatar: 'JS',
      assignedChannels: [allChannels[0]?.id].filter(Boolean),
      permissions: {
        analytics: true,
        monetization: false,
        content: true,
        comments: true,
        admin: false
      }
    },
  ]);

  const roles = [
    { 
      id: 'owner',
      name: 'Owner', 
      desc: locale === 'id' ? 'Akses penuh ke semua fitur dan pengaturan.' : 'Full access to all features and settings.',
      color: '#6366f1',
      icon: <ShieldCheck size={20} />
    },
    { 
      id: 'editor',
      name: 'Editor', 
      desc: locale === 'id' ? 'Dapat mengunggah video dan membalas komentar.' : 'Can upload videos and reply to comments.',
      color: '#f59e0b',
      icon: <Edit size={20} />
    },
    { 
      id: 'analyst',
      name: 'Analyst', 
      desc: locale === 'id' ? 'Melihat analitik dan laporan performa.' : 'View analytics and performance reports.',
      color: '#3b82f6',
      icon: <BarChart3 size={20} />
    },
    { 
      id: 'viewer',
      name: 'Viewer', 
      desc: locale === 'id' ? 'Hanya melihat dashboard dan laporan.' : 'View only dashboard and reports.',
      color: '#94a3b8',
      icon: <Eye size={20} />
    }
  ];

  const permissionGroups = [
    { id: 'analytics', label: t('analyticsModule'), icon: <BarChart3 size={18} />, color: 'blue' },
    { id: 'monetization', label: t('monetizationModule'), icon: <DollarSign size={18} />, color: 'green' },
    { id: 'content', label: t('contentModule'), icon: <Layout size={18} />, color: 'orange' },
    { id: 'comments', label: t('commentsModule'), icon: <MessageSquare size={18} />, color: 'purple' },
    { id: 'admin', label: t('adminModule'), icon: <Settings size={18} />, color: 'red' },
  ];

  const handleInvite = (e) => {
    e.preventDefault();
    setShowInviteModal(false);
    alert('Invite Sent!');
  };

  const togglePermission = (memberId, group) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          permissions: { ...m.permissions, [group]: !m.permissions[group] }
        };
      }
      return m;
    }));
  };

  return (
    <div className="team-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('manageTeam')}</h2>
          <p className="p-muted">{locale === 'id' ? 'Kelola anggota tim dan kontrol akses internal.' : 'Manage team members and internal access controls.'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
          <UserPlus size={18} /> {t('sendInvite')}
        </button>
      </header>

      <section className="role-cards-grid mt-40">
        {roles.map(role => (
          <div key={role.id} className="role-promo-card card">
            <div className="role-icon-box" style={{ background: `${role.color}15`, color: role.color }}>
              {role.icon}
            </div>
            <h4 className="h4">{role.name}</h4>
            <p className="p-tiny">{role.desc}</p>
          </div>
        ))}
      </section>

      <section className="members-section mt-40">
        <div className="section-header-flex">
          <h3 className="h3">{t('totalMembers')} ({members.length})</h3>
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search team..." />
          </div>
        </div>

        <div className="members-grid mt-24">
          {members.map(member => (
            <div key={member.id} className="member-item-card card">
              <div className="member-main">
                <div className="member-avatar-large">{member.avatar}</div>
                <div className="member-meta">
                  <div className="m-name-row">
                    <span className="m-name">{member.name}</span>
                    <span className={`role-badge ${member.role.toLowerCase()}`}>{member.role}</span>
                  </div>
                  <div className="m-email">{member.email}</div>
                </div>
                <div className="member-actions">
                  <button className="action-btn" onClick={() => setSelectedMember(member)}><Settings size={16} /></button>
                </div>
              </div>

              <div className="member-permissions-summary mt-20">
                <p className="p-tiny label-muted mb-8">Internal Permissions</p>
                <div className="perms-toggle-row">
                  {permissionGroups.map(group => (
                    <button 
                      key={group.id}
                      className={`perm-toggle-btn ${member.permissions[group.id] ? 'active' : ''}`}
                      onClick={() => togglePermission(member.id, group.id)}
                      disabled={member.role === 'Owner'}
                      title={group.label}
                    >
                      {group.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="member-channels mt-20">
                <p className="p-tiny label-muted mb-8">Assigned Channels</p>
                <div className="channel-badges">
                  {member.assignedChannels.includes('all') ? (
                    <span className="channel-badge all"><Play size={12} /> All Channels</span>
                  ) : (
                    member.assignedChannels.map(chId => {
                      const ch = allChannels.find(c => c.id === chId);
                      return ch ? (
                        <span key={chId} className="channel-badge">
                          <img src={ch.thumbnail} alt="" className="badge-thumb" />
                          {ch.title}
                        </span>
                      ) : null;
                    })
                  )}
                  {member.assignedChannels.length === 0 && <span className="p-tiny text-muted">No channels assigned</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-container team-invite-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <div className="header-icon-title">
                  <div className="modal-icon-box">
                    <UserPlus size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 className="h3">{t('sendInvite')}</h3>
                    <p className="p-tiny">Invite a new member to your workspace.</p>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setShowInviteModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>{t('ownerEmail')}</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input type="email" placeholder="member@example.com" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign Role</label>
                  <div className="role-select-grid">
                    {roles.map(role => (
                      <div key={role.id} className="role-option-box">
                        <input type="radio" name="role" id={role.id} />
                        <label htmlFor={role.id}>
                          <span className="role-option-title">{role.name}</span>
                          <span className="role-option-desc">{role.desc}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Channel Access</label>
                  <div className="channel-select-list">
                    <div className="channel-select-item">
                      <input type="checkbox" id="all-channels" defaultChecked />
                      <label htmlFor="all-channels">All Connected Channels</label>
                    </div>
                    {allChannels.map(ch => (
                      <div key={ch.id} className="channel-select-item">
                        <input type="checkbox" id={`ch-${ch.id}`} />
                        <label htmlFor={`ch-${ch.id}`}>
                          <img src={ch.thumbnail} alt="" className="ch-mini-thumb" />
                          {ch.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>
                  {t('cancel')}
                </button>
                <button className="btn btn-primary" onClick={handleInvite}>
                  <Send size={18} /> {t('sendInvite')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="security-note-box mt-40">
        <div className="card security-card">
          <Shield size={24} color="var(--success)" />
          <div className="security-text">
            <h4 className="h4">Security & Token Management</h4>
            <p className="p-muted">YouTube OAuth tokens are stored securely on our backend. Refresh tokens are encrypted and never exposed to the frontend. Every administrative action is logged in the Activity Log for audit purposes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
