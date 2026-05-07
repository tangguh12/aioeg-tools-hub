import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Users, 
  Eye, 
  Video,
  Mail,
  Copy,
  X,
  ExternalLink,
  Shield,
  Clock,
  Send
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './AccountConnection.css';

export default function AccountConnection() {
  const { 
    connectedAccounts = [], 
    isLoading, 
    fetchChannelsForToken, 
    removeAccount, 
    refreshAccount,
    invites = [],
    createInvite,
    revokeInvite
  } = useAuth();
  const { t } = useLanguage();
  const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    workspace: 'Main Workspace',
    accessType: 'analyticsOnly',
    message: ''
  });

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const account = await fetchChannelsForToken(tokenResponse.access_token);
      if (account) {
        alert(`✅ Berhasil terhubung! ${account.channels?.length || 0} channel ditemukan.`);
      } else {
        alert('❌ Gagal mengambil data channel. Pastikan token masih aktif atau coba lagi.');
      }
    },
    onNonOAuthError: (error) => console.error('Non-OAuth Error:', error),
    onError: (error) => console.error('Login Failed:', error),
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  });

  const handleLogin = () => {
    if (!clientId || clientId === 'YOUR_CLIENT_ID_HERE') {
      alert('Error: Client ID belum dikonfigurasi!');
      return;
    }
    login();
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    const n = parseInt(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  return (
    <div className="account-conn-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('accountConn')}</h2>
          <p className="p-muted">{t('accConnDesc')}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowInviteModal(true)}>
            <Mail size={18} /> {t('inviteOwner')}
          </button>
          <button className="btn btn-primary" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? <RefreshCw size={18} className="spinning" /> : <Plus size={18} />}
            {isLoading ? t('connecting') : t('connectGoogle')}
          </button>
        </div>
      </header>

      <div className="conn-options-grid mb-40">
        <div className="conn-option-card card" onClick={handleLogin}>
          <div className="option-icon-box google">
            <Plus size={24} />
          </div>
          <div className="option-info">
            <h4 className="h4">{t('connectMyGoogle')}</h4>
            <p className="p-tiny">Directly connect your own accounts.</p>
          </div>
        </div>
        <div className="conn-option-card card" onClick={() => setShowInviteModal(true)}>
          <div className="option-icon-box invite">
            <Mail size={24} />
          </div>
          <div className="option-info">
            <h4 className="h4">{t('inviteOwner')}</h4>
            <p className="p-tiny">{t('inviteSafetyDesc')}</p>
          </div>
        </div>
      </div>

      {connectedAccounts.length === 0 && !isLoading && (
        <section className="connection-hero card">
          <div className="hero-content">
            <div className="youtube-icon-large">
              <Play size={48} color="white" />
            </div>
            <div className="hero-text">
              <h3 className="h3">{t('connectYT')}</h3>
              <p className="p-muted">{t('connectYTDesc')}</p>
            </div>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={handleLogin}>
                <Plus size={18} /> {t('connectGoogle')}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowInviteModal(true)}>
                <Mail size={18} /> {t('inviteOwner')}
              </button>
            </div>
          </div>
        </section>
      )}

      {isLoading && (
        <section className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw size={40} className="spinning" style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
          <p className="p-muted">{t('fetchingData')}</p>
        </section>
      )}

      {connectedAccounts.length > 0 && (
        <section className="accounts-list">
          <h3 className="h3 mb-20">{t('connectedAcc')} ({connectedAccounts.length})</h3>
          <div className="accounts-grid">
            {connectedAccounts.map((account, i) => {
              // Safety check for account object
              if (!account || !account.email) return null;

              return (
                <motion.div
                  key={account.email}
                  className="card account-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="account-header">
                    <div className="account-info">
                      {account.picture ? (
                        <img src={account.picture} className="account-avatar-img" alt={account.name} />
                      ) : (
                        <div className="account-avatar">{account.email?.charAt(0).toUpperCase() || '?'}</div>
                      )}
                      <div>
                        <div className="account-email">{account.name || 'YouTube Account'}</div>
                        <div className="account-channels-sub">
                          {account.isInvite ? (
                            <span className="invite-badge-text">
                              <Mail size={10} /> {t('connectedViaInvite')}
                            </span>
                          ) : t('connectedAcc')}
                        </div>
                      </div>
                    </div>
                    <div className="account-status active">
                      <CheckCircle2 size={14} /> {t('active')}
                    </div>
                  </div>
                  
                  {account.isInvite && (
                    <div className="invite-meta-banner">
                      <div className="meta-item">
                        <Mail size={12} /> <span>{account.email}</span>
                      </div>
                      <div className="meta-item">
                        <Shield size={12} /> <span>{account.accessType === 'analyticsRevenue' ? t('analyticsRevenue') : t('analyticsOnly')}</span>
                      </div>
                    </div>
                  )}

                  <div className="channels-list">
                    {account.channels?.map(ch => (
                      <div key={ch.id} className="channel-item">
                        {ch.thumbnail ? (
                          <img src={ch.thumbnail} className="ch-thumb" alt={ch.title} />
                        ) : (
                          <div className="ch-thumb-placeholder">{ch.title?.charAt(0) || '?'}</div>
                        )}
                        <div className="ch-details">
                          <span className="ch-title">{ch.title}</span>
                          <div className="ch-stats">
                            <span><Users size={12} /> {formatNumber(ch.subscribers)}</span>
                            <span><Eye size={12} /> {formatNumber(ch.views)}</span>
                            <span><Video size={12} /> {ch.videoCount || 0} videos</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!account.channels || account.channels.length === 0) && (
                      <div className="no-channels-msg p-muted">No channels found for this account.</div>
                    )}
                  </div>

                  <div className="account-footer">
                    <div className="sync-info">
                      <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
                      <span>{t('lastSync').replace('{time}', account.lastSync || 'Never')}</span>
                    </div>
                    <div className="account-actions">
                      <button className="btn-small btn-secondary" onClick={() => refreshAccount(account.email)} disabled={isLoading}>
                        <RefreshCw size={12} className={isLoading ? 'spinning' : ''} /> {t('reconnect')}
                      </button>
                      <button className="btn-small btn-danger" onClick={() => {
                        if (confirm(`Remove account ${account.email}?`)) removeAccount(account.email);
                      }}>
                        <Trash2 size={12} /> {t('delete')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      <section className="sync-settings card mt-40">
        <h3 className="h3">{t('syncPrefs')}</h3>
        <p className="p-muted mb-20">{t('accConnDesc')}</p>
        <div className="settings-row">
          <div className="setting-info">
            <div className="setting-title">{t('syncFreq')}</div>
            <div className="setting-desc">Real-time metrics are updated every 15 minutes.</div>
          </div>
          <select className="setting-select">
            <option>Every 15 minutes</option>
            <option>Every hour</option>
            <option>Twice daily</option>
          </select>
        </div>
      </section>

      {/* Pending Invites Section */}
      {invites.length > 0 && (
        <section className="pending-invites-section mt-40">
          <div className="section-header">
            <h3 className="h3">{t('pendingInvites')}</h3>
            <span className="badge-count">{invites.filter(i => i.status === 'pending').length}</span>
          </div>
          <div className="invites-grid">
            {invites.map((invite, i) => (
              <motion.div
                key={invite.id}
                className={`card invite-card-v2 ${invite.status}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {window.location.hostname === 'localhost' && (
                  <div className="debug-tag-v2">DEBUG: {invite.status}</div>
                )}
                <div className="invite-v2-header">
                  <div className="invite-v2-main">
                    <Mail size={16} className="text-dim" />
                    <div className="invite-v2-info">
                      <div className="invite-v2-email">{invite.email}</div>
                      <div className="invite-v2-meta">
                        {invite.workspace} • {invite.accessType === 'analyticsRevenue' ? t('analyticsRevenue') : t('analyticsOnly')}
                      </div>
                    </div>
                  </div>
                  <div className={`status-badge-v2 ${invite.status}`}>
                    {invite.status === 'pending' ? t('tertunda') : 
                     invite.status === 'accepted' ? t('diterima') :
                     invite.status === 'expired' ? t('kadaluwarsa') :
                     invite.status === 'revoked' ? t('dicabut') : t('gagal')}
                  </div>
                </div>

                {invite.status === 'accepted' && (
                  <div className="invite-accepted-detail mt-12">
                    <div className="detail-row">
                      <CheckCircle2 size={12} className="text-success" />
                      <span>{invite.connectedChannelName || 'Channel Connected'}</span>
                    </div>
                    <div className="detail-row text-dim p-tiny">
                      <Clock size={10} />
                      <span>{new Date(invite.acceptedAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                {invite.status === 'pending' && (
                  <div className="invite-actions-row">
                    <button className="btn-text" onClick={() => {
                      const publicUrl = import.meta.env.VITE_APP_PUBLIC_URL || window.location.origin;
                      const link = `${publicUrl}/connect/invite/${invite.token}`;
                      navigator.clipboard.writeText(link);
                      alert(t('inviteLinkCopied'));
                    }}>
                      <Copy size={14} /> {t('copyLink')}
                    </button>
                    <button className="btn-text" onClick={() => {
                      const publicUrl = import.meta.env.VITE_APP_PUBLIC_URL || window.location.origin;
                      window.open(`${publicUrl}/connect/invite/${invite.token}`, '_blank');
                    }}>
                      <ExternalLink size={14} /> {t('openInviteLink')}
                    </button>
                    <button className="btn-text" onClick={() => alert('Invite resent!')}>
                      <RefreshCw size={14} /> {t('resend')}
                    </button>
                    <button className="btn-text danger" onClick={() => {
                      if (confirm('Revoke this invite?')) revokeInvite(invite.id);
                    }}>
                      <Trash2 size={14} /> {t('revoke')}
                    </button>
                  </div>
                )}
                
                <div className="invite-expiry">
                  <Clock size={12} /> {t('expiresAt')}: {new Date(invite.expiresAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-container invite-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <div className="header-icon-title">
                  <div className="modal-icon-box">
                    <Mail size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 className="h3">{t('inviteOwner')}</h3>
                    <p className="p-tiny">{t('inviteSafetyDesc')}</p>
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
                    <input 
                      type="email" 
                      placeholder="owner@example.com"
                      value={inviteForm.email}
                      onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('workspace')}</label>
                    <select 
                      value={inviteForm.workspace}
                      onChange={e => setInviteForm({...inviteForm, workspace: e.target.value})}
                    >
                      <option>Main Workspace</option>
                      <option>Team Alpha</option>
                      <option>Production</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('accessType')}</label>
                    <select 
                      value={inviteForm.accessType}
                      onChange={e => setInviteForm({...inviteForm, accessType: e.target.value})}
                    >
                      <option value="analyticsOnly">{t('analyticsOnly')}</option>
                      <option value="analyticsRevenue">{t('analyticsRevenue')}</option>
                      <option value="contentManagement">{t('contentManagement')}</option>
                      <option value="fullManagement">{t('fullManagement')}</option>
                    </select>
                    
                    <div className="access-info-preview mt-12">
                      {inviteForm.accessType === 'analyticsOnly' && (
                        <div className="access-info-box">
                          <p className="p-tiny text-primary">{t('analyticsOnlyDesc')}</p>
                          <ul className="allowed-list p-tiny">
                            <li>• {t('viewOverview')} / {t('viewReports')}</li>
                            <li>• {t('viewComparison')} / {t('viewAllChannels')}</li>
                            <li className="disallowed">• {t('viewMonetization')} / {t('replyComments')}</li>
                          </ul>
                        </div>
                      )}
                      {inviteForm.accessType === 'analyticsRevenue' && (
                        <div className="access-info-box">
                          <p className="p-tiny text-primary">{t('analyticsRevenueDesc')}</p>
                          <ul className="allowed-list p-tiny">
                            <li>• {t('analyticsModule')} + {t('monetizationModule')}</li>
                            <li>• {t('exportRevenue')}</li>
                            <li className="disallowed">• {t('uploadVideos')} / {t('replyComments')}</li>
                          </ul>
                        </div>
                      )}
                      {inviteForm.accessType === 'contentManagement' && (
                        <div className="access-info-box">
                          <p className="p-tiny text-primary">{t('contentManagementDesc')}</p>
                          <ul className="allowed-list p-tiny">
                            <li>• {t('uploadVideos')} / {t('editMetadata')}</li>
                            <li>• {t('replyComments')} / {t('moderateComments')}</li>
                            <li className="disallowed">• {t('viewMonetization')} / {t('deleteVideos')}</li>
                          </ul>
                        </div>
                      )}
                      {inviteForm.accessType === 'fullManagement' && (
                        <div className="access-info-box warning">
                          <AlertCircle size={14} />
                          <p className="p-tiny">{t('oauthScopesWarning')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('optionalMessage')}</label>
                  <textarea 
                    placeholder="E.g. Please connect your channel so we can start the weekly reporting."
                    rows={3}
                    value={inviteForm.message}
                    onChange={e => setInviteForm({...inviteForm, message: e.target.value})}
                  />
                </div>

                <div className="safety-info-box">
                  <Shield size={16} />
                  <p>{t('safetyNote')}</p>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>
                  {t('cancel')}
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={!inviteForm.email}
                  onClick={() => {
                    createInvite(inviteForm);
                    setShowInviteModal(false);
                    setInviteForm({ email: '', workspace: 'Main Workspace', accessType: 'analyticsOnly', message: '' });
                  }}
                >
                  <Send size={18} /> {t('sendInvite')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB Shortcut */}
      <button className="ac-fab" onClick={handleLogin} disabled={isLoading} title="Connect New Account">
        <Plus size={24} />
        <span>Connect Account</span>
      </button>
    </div>
  );
}
