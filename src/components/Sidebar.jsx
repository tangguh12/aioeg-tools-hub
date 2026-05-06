import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
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
  History,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();

  const mainTools = [
    { name: t('dashboardHome'), icon: LayoutDashboard, path: '/', status: 'active' },
    { name: t('videoPromptGen'), icon: Video, path: '/prompt-gen', status: 'soon' },
    { name: t('renderVideo'), icon: Video, path: '/render', status: 'soon' },
    { name: t('youtubeManager'), icon: Play, path: '/youtube', status: 'active' },
    { name: t('liveStreamManager'), icon: Radio, path: '/live', status: 'soon' },
  ];

  const youtubeMenu = [
    { name: t('overview'), icon: BarChart2, path: '/youtube/overview' },
    { name: t('comments'), icon: MessageSquare, path: '/youtube/comments', badge: 12 },
    { name: t('hallOfFame'), icon: Trophy, path: '/youtube/hall-of-fame' },
    { name: t('needsAttention'), icon: AlertCircle, path: '/youtube/needs-attention', badge: 7 },
    { name: t('allChannels'), icon: Users, path: '/youtube/channels' },
    { name: t('compare'), icon: BarChart2, path: '/youtube/compare' },
    { name: t('monetization'), icon: DollarSign, path: '/youtube/monetization' },
    { name: t('goals'), icon: Target, path: '/youtube/goals' },
    { name: t('alerts'), icon: Bell, path: '/youtube/alerts' },
    { name: t('reports'), icon: FileText, path: '/youtube/reports' },
    { name: t('settings'), icon: Settings, path: '/youtube/settings' },
  ];

  const systemMenu = [
    { name: t('accountConn'), icon: Link2, path: '/youtube/account' },
    { name: t('teamPerms'), icon: Users, path: '/system/team' },
    { name: t('activityLog'), icon: History, path: '/system/activity' },
    { name: t('appSettings'), icon: Settings, path: '/system/settings' },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Play className="logo-icon" />
        </div>
        <div className="brand-text">
          <h1 className="brand-name">AIOEG</h1>
          <p className="brand-sub">Tools Hub</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="section-title">{t('mainTools')}</p>
          {mainTools.map((tool) => (
            <Link 
              key={tool.name} 
              to={tool.status === 'active' ? tool.path : '#'} 
              className={`nav-item ${isActive(tool.path) ? 'active' : ''} ${tool.status === 'soon' ? 'disabled' : ''}`}
            >
              <tool.icon size={20} />
              <span>{tool.name}</span>
              {tool.status === 'soon' && <span className="badge-soon">{t('comingSoon')}</span>}
            </Link>
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">{t('youtubeManager')}</p>
          {youtubeMenu.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {!item.badge && <ChevronRight size={14} className="chevron" />}
            </Link>
          ))}
        </div>

        <div className="nav-section">
          <p className="section-title">{t('system')}</p>
          {systemMenu.map((item) => (
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
          <div className="user-avatar">AD</div>
          <div className="user-details">
            <p className="user-name">Admin User</p>
            <p className="user-role">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
