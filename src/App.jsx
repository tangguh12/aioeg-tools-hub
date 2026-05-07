import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import YTOverview from './pages/youtube/Overview';
import YTMonetization from './pages/youtube/Monetization';
import AccountConnection from './pages/youtube/AccountConnection';
import Comments from './pages/youtube/Comments';
import NeedsAttention from './pages/youtube/NeedsAttention';
import HallOfFame from './pages/youtube/HallOfFame';
import AllChannels from './pages/youtube/AllChannels';
import CompareChannels from './pages/youtube/CompareChannels';
import GoalsTargets from './pages/youtube/GoalsTargets';
import AlertsCenter from './pages/youtube/AlertsCenter';
import Reports from './pages/youtube/Reports';
import ChannelSettings from './pages/youtube/ChannelSettings';
import InviteConnectionPage from './pages/youtube/InviteConnectionPage';
import TeamPermissions from './pages/system/TeamPermissions';
import ActivityLog from './pages/system/ActivityLog';
import AppSettings from './pages/system/AppSettings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/connect/invite/:token" element={<InviteConnectionPage />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<YTOverview />} />
              <Route path="/youtube" element={<YTOverview />} />
              <Route path="/youtube/overview" element={<YTOverview />} />
              <Route path="/youtube/monetization" element={<YTMonetization />} />
              <Route path="/youtube/account" element={<AccountConnection />} />
              <Route path="/youtube/comments" element={<Comments />} />
              <Route path="/youtube/needs-attention" element={<NeedsAttention />} />
              <Route path="/youtube/hall-of-fame" element={<HallOfFame />} />
              <Route path="/youtube/channels" element={<AllChannels />} />
              <Route path="/youtube/compare" element={<CompareChannels />} />
              <Route path="/youtube/goals" element={<GoalsTargets />} />
              <Route path="/youtube/alerts" element={<AlertsCenter />} />
              <Route path="/youtube/reports" element={<Reports />} />
              <Route path="/youtube/settings" element={<ChannelSettings />} />
              <Route path="/system/team" element={<TeamPermissions />} />
              <Route path="/system/activity" element={<ActivityLog />} />
              <Route path="/system/settings" element={<AppSettings />} />
              <Route path="*" element={<YTOverview />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
