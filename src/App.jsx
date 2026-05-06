import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import YTOverview from './pages/youtube/Overview';
import YTMonetization from './pages/youtube/Monetization';
import AccountConnection from './pages/youtube/AccountConnection';
import Comments from './pages/youtube/Comments';
import NeedsAttention from './pages/youtube/NeedsAttention';
import HallOfFame from './pages/youtube/HallOfFame';
import AllChannels from './pages/youtube/AllChannels';

function App() {
  return (
    <Router>
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
          {/* Add other routes as needed */}
          <Route path="*" element={<YTOverview />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
