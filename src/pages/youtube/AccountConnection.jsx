import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, AlertCircle, RefreshCw, Plus, Trash2, Users, Eye, Video } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import './AccountConnection.css';

export default function AccountConnection() {
  const { connectedAccounts, isLoading, fetchChannelsForToken, removeAccount, refreshAccount } = useAuth();
  const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const account = await fetchChannelsForToken(tokenResponse.access_token);
      if (account) {
        alert(`✅ Berhasil terhubung! ${account.channels.length} channel ditemukan.`);
      } else {
        alert('❌ Gagal mengambil data channel. Coba lagi.');
      }
    },
    onNonOAuthError: (error) => console.error('Non-OAuth Error:', error),
    onError: (error) => console.error('Login Failed:', error),
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
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
    return n.toString();
  };

  return (
    <div className="account-conn-container">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">Account Connection</h2>
          <p className="p-muted">Manage your connected Google accounts and YouTube channels.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? <RefreshCw size={18} className="spinning" /> : <Plus size={18} />}
            {isLoading ? 'Connecting...' : 'Connect Google Account'}
          </button>
        </div>
      </header>

      {/* Hero — only show when no accounts are connected */}
      {connectedAccounts.length === 0 && !isLoading && (
        <section className="connection-hero card">
          <div className="hero-content">
            <div className="youtube-icon-large">
              <Play size={48} color="white" />
            </div>
            <div className="hero-text">
              <h3 className="h3">Connect your YouTube Channels</h3>
              <p className="p-muted">Sync your channels to start tracking performance, managing content, and analyzing revenue.</p>
            </div>
            <button className="btn btn-primary" onClick={handleLogin}>
              <Plus size={18} /> Connect Google Account
            </button>
          </div>
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <section className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw size={40} className="spinning" style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
          <p className="p-muted">Fetching your YouTube channels...</p>
        </section>
      )}

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <section className="accounts-list">
          <h3 className="h3 mb-20">Connected Accounts ({connectedAccounts.length})</h3>
          <div className="accounts-grid">
            {connectedAccounts.map((account, i) => (
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
                      <div className="account-avatar">{account.email[0].toUpperCase()}</div>
                    )}
                    <div>
                      <div className="account-email">{account.name || account.email}</div>
                      <div className="account-channels">{account.email}</div>
                      <div className="account-channels">{account.channels.length} channel(s) connected</div>
                    </div>
                  </div>
                  <div className="account-status active">
                    <CheckCircle2 size={14} /> Connected
                  </div>
                </div>

                {/* Real Channels List */}
                <div className="channels-list">
                  {account.channels.map(ch => (
                    <div key={ch.id} className="channel-item">
                      {ch.thumbnail ? (
                        <img src={ch.thumbnail} className="ch-thumb" alt={ch.title} />
                      ) : (
                        <div className="ch-thumb-placeholder">{ch.title[0]}</div>
                      )}
                      <div className="ch-details">
                        <span className="ch-title">{ch.title}</span>
                        <div className="ch-stats">
                          <span><Users size={12} /> {formatNumber(ch.subscribers)}</span>
                          <span><Eye size={12} /> {formatNumber(ch.views)}</span>
                          <span><Video size={12} /> {ch.videoCount} videos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="account-footer">
                  <div className="sync-info">
                    <RefreshCw size={14} className="spinning" />
                    <span>Last sync: {account.lastSync}</span>
                  </div>
                  <div className="account-actions">
                    <button className="btn-small btn-secondary" onClick={() => refreshAccount(account.email)}>
                      <RefreshCw size={12} /> Refresh
                    </button>
                    <button className="btn-small btn-danger" onClick={() => {
                      if (confirm(`Remove account ${account.email}?`)) removeAccount(account.email);
                    }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section className="sync-settings card mt-40">
        <h3 className="h3">Sync Preferences</h3>
        <p className="p-muted mb-20">Configure how often your data is refreshed from YouTube API.</p>
        <div className="settings-row">
          <div className="setting-info">
            <div className="setting-title">Auto-Sync Frequency</div>
            <div className="setting-desc">Real-time metrics are updated every 15 minutes.</div>
          </div>
          <select className="setting-select">
            <option>Every 15 minutes</option>
            <option>Every hour</option>
            <option>Twice daily</option>
          </select>
        </div>
      </section>
    </div>
  );
}
