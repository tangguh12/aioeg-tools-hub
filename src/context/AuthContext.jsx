import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('yt_access_token') || null);
  const [connectedAccounts, setConnectedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('yt_accounts') || '[]');
    } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalyticsForChannel = async (channelId, token) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Query 1: Core performance metrics (valid, non-deprecated)
      const res = await fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage&dimensions=day&sort=day`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (data.error) {
        console.error('Analytics API error:', JSON.stringify(data.error));
        return null;
      }

      const rows = data.rows || [];
      const totals = rows.reduce((acc, row) => ({
        views: acc.views + (row[1] || 0),
        watchTime: acc.watchTime + (row[2] || 0),
        avgAVDSum: acc.avgAVDSum + (row[3] || 0),
        avgRetentionSum: acc.avgRetentionSum + (row[4] || 0),
        count: acc.count + 1,
      }), { views: 0, watchTime: 0, avgAVDSum: 0, avgRetentionSum: 0, count: 0 });

      // Query 2: CTR from impressions (separate query)
      let ctr = 0;
      try {
        const ctrRes = await fetch(
          `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=impressions,impressionsClickThroughRate`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const ctrData = await ctrRes.json();
        if (!ctrData.error && ctrData.rows?.[0]) {
          ctr = (ctrData.rows[0][1] * 100) || 0;
        }
      } catch (e) {
        console.warn('CTR fetch failed:', e);
      }

      const count = totals.count || 1;
      const avgAVDSec = totals.avgAVDSum / count;
      const avgAVDMin = Math.floor(avgAVDSec / 60);
      const avgAVDSecRem = Math.round(avgAVDSec % 60);

      return {
        views28d: totals.views,
        watchTimeHours: Math.round(totals.watchTime / 60),
        avgAVD: `${avgAVDMin}:${avgAVDSecRem.toString().padStart(2, '0')}`,
        avgRetention: (totals.avgRetentionSum / count).toFixed(1),
        ctr: ctr.toFixed(2),
        chartRows: rows, // [date, views, watchTime, avgAVD, avgRetention]
      };
    } catch (e) {
      console.warn('Analytics fetch failed:', e);
      return null;
    }
  };

  const fetchChannelsForToken = async (token) => {
    setIsLoading(true);
    try {
      // 1. Get the logged-in user's info
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userInfo = await userRes.json();

      // 2. Get all channels managed by this account
      const channelsRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const channelsData = await channelsRes.json();
      const rawChannels = channelsData.items || [];

      // 3. Fetch analytics for each channel
      const channelsWithAnalytics = await Promise.all(
        rawChannels.map(async (ch) => {
          const analytics = await fetchAnalyticsForChannel(ch.id, token);
          return {
            id: ch.id,
            title: ch.snippet.title,
            thumbnail: ch.snippet.thumbnails?.default?.url,
            subscribers: ch.statistics.subscriberCount,
            views: ch.statistics.viewCount,
            videoCount: ch.statistics.videoCount,
            description: ch.snippet.description,
            country: ch.snippet.country,
            analytics: analytics || null,
          };
        })
      );

      // 4. Build the account object
      const newAccount = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        token,
        status: 'Connected',
        lastSync: new Date().toLocaleTimeString(),
        channels: channelsWithAnalytics,
      };

      // 5. Merge with existing (avoid duplicates by email)
      setConnectedAccounts(prev => {
        const filtered = prev.filter(a => a.email !== newAccount.email);
        const updated = [...filtered, newAccount];
        localStorage.setItem('yt_accounts', JSON.stringify(updated));
        return updated;
      });
      setAccessToken(token);
      localStorage.setItem('yt_access_token', token);
      return newAccount;
    } catch (error) {
      console.error('Error fetching YouTube channels:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAccount = (email) => {
    setConnectedAccounts(prev => {
      const updated = prev.filter(a => a.email !== email);
      localStorage.setItem('yt_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshAccount = async (email) => {
    const account = connectedAccounts.find(a => a.email === email);
    if (account?.token) {
      await fetchChannelsForToken(account.token);
    }
  };

  // Get all YouTube channels across all connected accounts
  const allChannels = connectedAccounts.flatMap(acc =>
    acc.channels.map(ch => ({ ...ch, accountEmail: acc.email }))
  );

  return (
    <AuthContext.Provider value={{
      accessToken,
      connectedAccounts,
      allChannels,
      isLoading,
      fetchChannelsForToken,
      removeAccount,
      refreshAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
