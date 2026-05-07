import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { usePermissions } from '../context/PermissionContext';
import { 
  LayoutDashboard, 
  Video, 
  Play, 
  Radio, 
  BarChart2, 
  Trophy, 
  AlertCircle, 
  Users, 
  DollarSign, 
  Target, 
  Bell, 
  FileText, 
  Settings, 
  Link2, 
  MessageSquare,
  Lock,
  ChevronRight,
  History as HistoryIcon
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const { pendingComments, urgentIssues } = useNotifications();
  const { hasPermission, currentUser } = usePermissions();

  const mainTools = [
    { name: t('dashboardHome'), icon: LayoutDashboard, path: '/', status: 'active' },
    { name: t('videoPromptGen'), icon: Video, path: '/prompt-gen', status: 'soon' },
    { name: t('renderVideo'), icon: Video, path: '/render', status: 'soon' },
    { name: t('youtubeManager'), icon: Play, path: '/youtube', status: 'active' },
    { name: t('liveStreamManager'), icon: Radio, path: '/live', status: 'soon' },
  ];

  const youtubeMenu = [
    { name: t('overview'), icon: BarChart2, path: '/youtube/overview', perm: 'analytics' },
    { name: t('comments'), icon: MessageSquare, path: '/youtube/comments', badge: pendingComments, perm: 'comments' },
    { name: t('hallOfFame'), icon: Trophy, path: '/youtube/hall-of-fame', perm: 'analytics' },
    { name: t('needsAttention'), icon: AlertCircle, path: '/youtube/needs-attention', badge: urgentIssues, perm: 'analytics' },
    { name: t('allChannels'), icon: Users, path: '/youtube/channels', perm: 'analytics' },
    { name: t('compare'), icon: BarChart2, path: '/youtube/compare', perm: 'analytics' },
    { name: t('monetization'), icon: DollarSign, path: '/youtube/monetization', perm: 'monetization' },
    { name: t('goals'), icon: Target, path: '/youtube/goals', perm: 'analytics' },
    { name: t('alerts'), icon: Bell, path: '/youtube/alerts', perm: 'analytics' },
    { name: t('reports'), icon: FileText, path: '/youtube/reports', perm: 'analytics' },
    { name: t('settings'), icon: Settings, path: '/youtube/settings', perm: 'admin' },
  ];

  const systemMenu = [
    { name: t('accountConn'), icon: Link2, path: '/youtube/account', perm: 'admin' },
    { name: t('teamPerms'), icon: Users, path: '/system/team', perm: 'admin' },
    { name: t('activityLog'), icon: HistoryIcon, path: '/system/activity', perm: 'admin' },
    { name: t('appSettings'), icon: Settings, path: '/system/settings', perm: 'admin' },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleSoonClick = (e) => {
    e.preventDefault();
    alert(t('comingSoon') || 'Coming Soon!');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Play className="logo-icon" />
        </div>
        <div className="brand-text">
          <h1 className="brand-name">CreatorDock</h1>
          <p className="brand-sub">Video Operations</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="section-title">{t('mainTools')}</p>
          {mainTools.map((tool) => (
            tool.status === 'active' ? (
              <Link 
                key={tool.name} 
                to={tool.path} 
                className={`nav-item ${isActive(tool.path) ? 'active' : ''}`}
              >
                <tool.icon size={20} />
                <span>{tool.name}</span>
              </Link>
            ) : (
              <div 
                key={tool.name} 
                className="nav-item disabled"
                onClick={handleSoonClick}
              >
                <tool.icon size={20} />
                <span>{tool.name}</span>
                <div className="soon-badge-wrap">
                  <Lock size={12} />
                  <span className="badge-soon">{t('comingSoon')}</span>
                </div>
              </div>
            )
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">{t('youtubeManager')}</p>
          {youtubeMenu.filter(item => hasPermission(item.perm)).map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
              {item.badge <= 0 && <ChevronRight size={14} className="chevron" />}
            </Link>
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">{t('system')}</p>
          {systemMenu.filter(item => hasPermission(item.perm)).map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{currentUser.avatar || currentUser.name.charAt(0)}</div>
          <div className="user-details">
            <p className="user-name">{currentUser.name}</p>
            <p className="user-role">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
