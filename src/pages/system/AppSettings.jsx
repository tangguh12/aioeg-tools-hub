import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Palette, 
  Bell, 
  RefreshCw, 
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Globe,
  Clock,
  Calendar,
  Layout,
  Monitor,
  Smartphone,
  Volume2,
  Mail,
  Database,
  Upload
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './AppSettings.css';

export default function AppSettings() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [showToast, setShowToast] = useState(false);

  // Form States (Mock data)
  const [generalSettings, setGeneralSettings] = useState({
    workspaceName: 'CreatorDock',
    language: 'id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    defaultRange: 'last28days'
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    sidebarMode: 'expanded',
    density: 'comfortable'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    inApp: true,
    badges: true,
    email: false,
    sound: true
  });

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    frequency: '6hours'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const renderGeneralTab = () => (
    <form className="settings-form" onSubmit={handleSave}>
      <div className="form-section">
        <h3 className="h3 mb-24">{locale === 'id' ? 'Pengaturan Umum' : 'General Settings'}</h3>
        
        <div className="form-group">
          <label>{locale === 'id' ? 'Nama Workspace' : 'Workspace Name'}</label>
          <input 
            type="text" 
            className="form-input" 
            value={generalSettings.workspaceName}
            onChange={(e) => setGeneralSettings({...generalSettings, workspaceName: e.target.value})}
          />
          <span className="form-help">{locale === 'id' ? 'Nama ini akan muncul di pojok kiri atas aplikasi.' : 'This name appears in the top left corner.'}</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><Globe size={14} /> {locale === 'id' ? 'Bahasa Default' : 'Default Language'}</label>
            <select 
              className="form-select"
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
            >
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </div>
          <div className="form-group">
            <label><Clock size={14} /> {locale === 'id' ? 'Zona Waktu' : 'Timezone'}</label>
            <select 
              className="form-select"
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
            >
              <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><Calendar size={14} /> {locale === 'id' ? 'Format Tanggal' : 'Date Format'}</label>
            <select 
              className="form-select"
              value={generalSettings.dateFormat}
              onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="form-group">
            <label><Calendar size={14} /> {locale === 'id' ? 'Rentang Tanggal Default' : 'Default Date Range'}</label>
            <select 
              className="form-select"
              value={generalSettings.defaultRange}
              onChange={(e) => setGeneralSettings({...generalSettings, defaultRange: e.target.value})}
            >
              <option value="last7days">{locale === 'id' ? '7 Hari Terakhir' : 'Last 7 Days'}</option>
              <option value="last28days">{locale === 'id' ? '28 Hari Terakhir' : 'Last 28 Days'}</option>
              <option value="thisMonth">{locale === 'id' ? 'Bulan Ini' : 'This Month'}</option>
            </select>
          </div>
        </div>
      </div>
      <div className="form-footer">
        <button type="submit" className="btn btn-primary"><Save size={16} /> {locale === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</button>
      </div>
    </form>
  );

  const renderAppearanceTab = () => (
    <form className="settings-form" onSubmit={handleSave}>
      <div className="form-section">
        <h3 className="h3 mb-24">{locale === 'id' ? 'Tampilan' : 'Appearance'}</h3>
        
        <div className="form-group">
          <label><Palette size={14} /> Tema Aplikasi</label>
          <div className="radio-group">
            <label className={`radio-card ${appearanceSettings.theme === 'dark' ? 'active' : ''}`}>
              <input type="radio" name="theme" checked={appearanceSettings.theme === 'dark'} onChange={() => setAppearanceSettings({...appearanceSettings, theme: 'dark'})} />
              <div className="rc-content">
                <Monitor size={20} />
                <span>Dark Mode</span>
              </div>
            </label>
            <label className={`radio-card ${appearanceSettings.theme === 'light' ? 'active' : ''}`}>
              <input type="radio" name="theme" checked={appearanceSettings.theme === 'light'} onChange={() => setAppearanceSettings({...appearanceSettings, theme: 'light'})} disabled />
              <div className="rc-content opacity-50">
                <Monitor size={20} />
                <span>Light Mode <small>(Soon)</small></span>
              </div>
            </label>
            <label className={`radio-card ${appearanceSettings.theme === 'system' ? 'active' : ''}`}>
              <input type="radio" name="theme" checked={appearanceSettings.theme === 'system'} onChange={() => setAppearanceSettings({...appearanceSettings, theme: 'system'})} disabled />
              <div className="rc-content opacity-50">
                <Smartphone size={20} />
                <span>System Sync <small>(Soon)</small></span>
              </div>
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><Layout size={14} /> Sidebar Mode</label>
            <select 
              className="form-select"
              value={appearanceSettings.sidebarMode}
              onChange={(e) => setAppearanceSettings({...appearanceSettings, sidebarMode: e.target.value})}
            >
              <option value="expanded">Expanded (Default)</option>
              <option value="compact">Compact (Icons only)</option>
            </select>
          </div>
          <div className="form-group">
            <label><Layout size={14} /> Interface Density</label>
            <select 
              className="form-select"
              value={appearanceSettings.density}
              onChange={(e) => setAppearanceSettings({...appearanceSettings, density: e.target.value})}
            >
              <option value="comfortable">Comfortable (Default)</option>
              <option value="compact">Compact (Less spacing)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="form-footer">
        <button type="submit" className="btn btn-primary"><Save size={16} /> {locale === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</button>
      </div>
    </form>
  );

  const renderNotificationsTab = () => (
    <form className="settings-form" onSubmit={handleSave}>
      <div className="form-section">
        <h3 className="h3 mb-24">{locale === 'id' ? 'Notifikasi Aplikasi' : 'App Notifications'}</h3>
        <p className="p-muted mb-24">{locale === 'id' ? 'Atur bagaimana aplikasi ini memberi tahu Anda tentang aktivitas umum.' : 'Manage how this app notifies you about general activity.'}</p>
        
        <div className="toggle-list">
          <div className="toggle-item">
            <div className="ti-info">
              <Bell size={18} className="text-primary" />
              <div>
                <div className="ti-title">In-App Notifications</div>
                <div className="ti-desc">Show notification popup within the dashboard.</div>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notificationSettings.inApp} onChange={(e) => setNotificationSettings({...notificationSettings, inApp: e.target.checked})} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="ti-info">
              <div className="badge-icon-demo">3</div>
              <div>
                <div className="ti-title">Notification Badge</div>
                <div className="ti-desc">Show red dot counter on the bell icon.</div>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notificationSettings.badges} onChange={(e) => setNotificationSettings({...notificationSettings, badges: e.target.checked})} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="ti-info">
              <Mail size={18} className="text-primary" />
              <div>
                <div className="ti-title">Email Notifications</div>
                <div className="ti-desc">Receive daily summary emails.</div>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notificationSettings.email} onChange={(e) => setNotificationSettings({...notificationSettings, email: e.target.checked})} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="ti-info">
              <Volume2 size={18} className="text-primary" />
              <div>
                <div className="ti-title">Sound Notifications</div>
                <div className="ti-desc">Play a short sound for critical alerts.</div>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notificationSettings.sound} onChange={(e) => setNotificationSettings({...notificationSettings, sound: e.target.checked})} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-note mt-24">
          <Info size={14} /> 
          <span>{locale === 'id' ? 'Catatan: Untuk mengatur aturan alert YouTube secara spesifik, silakan buka halaman Alerts.' : 'Note: To configure specific YouTube alert rules, please visit the Alerts page.'}</span>
        </div>
      </div>
      <div className="form-footer">
        <button type="submit" className="btn btn-primary"><Save size={16} /> {locale === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</button>
      </div>
    </form>
  );

  const renderSyncTab = () => (
    <form className="settings-form" onSubmit={handleSave}>
      <div className="form-section">
        <h3 className="h3 mb-24">{locale === 'id' ? 'Sinkronisasi Data' : 'Data & Sync'}</h3>
        
        <div className="toggle-item mb-24">
          <div className="ti-info">
            <RefreshCw size={18} className="text-primary" />
            <div>
              <div className="ti-title">Auto Sync Data</div>
              <div className="ti-desc">Automatically fetch latest data from connected APIs.</div>
            </div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={syncSettings.autoSync} onChange={(e) => setSyncSettings({...syncSettings, autoSync: e.target.checked})} />
            <span className="slider"></span>
          </label>
        </div>

        <div className="form-group" style={{ opacity: syncSettings.autoSync ? 1 : 0.5 }}>
          <label><Clock size={14} /> Sync Frequency</label>
          <select 
            className="form-select"
            value={syncSettings.frequency}
            onChange={(e) => setSyncSettings({...syncSettings, frequency: e.target.value})}
            disabled={!syncSettings.autoSync}
          >
            <option value="1hour">Every 1 hour</option>
            <option value="6hours">Every 6 hours</option>
            <option value="12hours">Every 12 hours</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="sync-status-card mt-24">
          <div className="ssc-header">
            <Database size={18} />
            <span className="font-semibold">Data Cache Status</span>
          </div>
          <div className="ssc-body">
            <p className="p-muted text-sm">Last successful sync: <strong>10 minutes ago</strong></p>
            <p className="p-muted text-sm">Cache size: <strong>24.5 MB</strong></p>
          </div>
          <div className="ssc-footer">
            <button type="button" className="btn btn-secondary btn-small"><RefreshCw size={14} /> Sync Now</button>
            <button type="button" className="btn btn-secondary btn-small text-danger">Clear Cache</button>
          </div>
        </div>
      </div>
      <div className="form-footer">
        <button type="submit" className="btn btn-primary"><Save size={16} /> {locale === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</button>
      </div>
    </form>
  );

  const renderBrandingTab = () => (
    <form className="settings-form" onSubmit={handleSave}>
      <div className="form-section">
        <h3 className="h3 mb-24">{locale === 'id' ? 'Branding' : 'Branding'}</h3>
        
        <div className="form-group">
          <label>App Name</label>
          <input type="text" className="form-input" defaultValue="CreatorDock" />
        </div>

        <div className="form-group">
          <label>Tagline</label>
          <input type="text" className="form-input" defaultValue="Video Operations" />
        </div>

        <div className="branding-upload-grid mt-24">
          <div className="upload-card">
            <div className="uc-header">Workspace Logo</div>
            <div className="uc-preview placeholder">
              <ImageIcon size={32} className="text-dim" />
            </div>
            <button type="button" className="btn btn-secondary btn-small w-full" disabled><Upload size={14} /> Upload Logo (Soon)</button>
          </div>
          
          <div className="upload-card">
            <div className="uc-header">Favicon</div>
            <div className="uc-preview placeholder">
              <ImageIcon size={32} className="text-dim" />
            </div>
            <button type="button" className="btn btn-secondary btn-small w-full" disabled><Upload size={14} /> Upload Favicon (Soon)</button>
          </div>
        </div>
      </div>
      <div className="form-footer">
        <button type="submit" className="btn btn-primary"><Save size={16} /> {locale === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</button>
      </div>
    </form>
  );

  const tabs = [
    { id: 'general', label: locale === 'id' ? 'Umum' : 'General', icon: <Settings size={16} /> },
    { id: 'appearance', label: locale === 'id' ? 'Tampilan' : 'Appearance', icon: <Palette size={16} /> },
    { id: 'notifications', label: locale === 'id' ? 'Notifikasi' : 'Notifications', icon: <Bell size={16} /> },
    { id: 'sync', label: 'Data & Sync', icon: <RefreshCw size={16} /> },
    { id: 'branding', label: 'Branding', icon: <ImageIcon size={16} /> },
  ];

  return (
    <div className="app-settings-container">
      <header className="settings-header">
        <div className="sh-left">
          <h2 className="h2">{locale === 'id' ? 'Pengaturan Aplikasi' : 'App Settings'}</h2>
          <p className="p-muted">{locale === 'id' ? 'Kelola preferensi workspace dan perilaku aplikasi Anda.' : 'Manage your workspace preferences and application behavior.'}</p>
        </div>
      </header>

      <div className="settings-layout mt-32">
        <aside className="settings-sidebar card">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="settings-content card">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'appearance' && renderAppearanceTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'sync' && renderSyncTab()}
              {activeTab === 'branding' && renderBrandingTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            className="toast-success"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
          >
            <CheckCircle2 size={18} />
            <span>{locale === 'id' ? 'Pengaturan berhasil disimpan.' : 'Settings saved successfully.'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
