import { motion } from 'framer-motion';
import { Play, Link2, CheckCircle2, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import './AccountConnection.css';

export default function AccountConnection() {
  const connectedAccounts = [
    { email: 'admin@aioeg.com', channels: 4, status: 'Connected', lastSync: '2 mins ago', expired: false },
    { email: 'marketing@aioeg.com', channels: 2, status: 'Token Expired', lastSync: '12 hours ago', expired: true },
  ];

  return (
    <div className="account-conn-container">
      <header className="page-header">
        <div>
          <h2 className="h2">Account Connection</h2>
          <p className="p-muted">Manage your connected Google accounts and channel permissions.</p>
        </div>
      </header>

      <section className="connection-hero card">
        <div className="hero-content">
          <div className="youtube-icon-large">
            <Play size={48} color="white" />
          </div>
          <div className="hero-text">
            <h3 className="h3">Connect your YouTube Channels</h3>
            <p className="p-muted">Sync your channels to start tracking performance, managing content, and analyzing revenue.</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={18} /> Connect Google Account
          </button>
        </div>
      </section>

      <section className="accounts-list">
        <h3 className="h3 mb-20">Connected Accounts</h3>
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
                  <div className="account-avatar">{account.email[0].toUpperCase()}</div>
                  <div>
                    <div className="account-email">{account.email}</div>
                    <div className="account-channels">{account.channels} Channels connected</div>
                  </div>
                </div>
                <div className={`account-status ${account.expired ? 'expired' : 'active'}`}>
                  {account.expired ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                  {account.status}
                </div>
              </div>
              <div className="account-footer">
                <div className="sync-info">
                  <RefreshCw size={14} className={account.expired ? '' : 'spinning'} />
                  <span>Last sync: {account.lastSync}</span>
                </div>
                <div className="account-actions">
                  {account.expired ? (
                    <button className="btn-small btn-warning">Reconnect</button>
                  ) : (
                    <button className="btn-small btn-secondary">Manage</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
