import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('yt_access_token') || null);
  const [connectedAccounts, setConnectedAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_accounts');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Ensure each account has necessary fields to avoid crashes
      return parsed.filter(acc => acc && acc.email);
    } catch { return []; }
  });
  const [invites, setInvites] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_invites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'yt_accounts') {
        setConnectedAccounts(JSON.parse(e.newValue || '[]'));
      }
      if (e.key === 'yt_invites') {
        setInvites(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchCommentsForChannel = async (channelId, token) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&allThreadsRelatedToChannelId=${channelId}&maxResults=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) return { error: 'Unauthorized' };
      const data = await res.json();
      if (data.error) return [];
      return (data.items || []).map(item => {
        const snippet = item.snippet.topLevelComment.snippet;
        return {
          id: item.id,
          author: snippet.authorDisplayName,
          time: new Date(snippet.publishedAt).toLocaleString(),
          content: snippet.textDisplay,
          channelId: channelId,
          channel: '',
          video: '',
          likes: snippet.likeCount,
          status: 'needs-reply',
          avatar: snippet.authorDisplayName[0],
          isReal: true
        };
      });
    } catch (e) { return []; }
  };

  const fetchAnalyticsForChannel = async (channelId, token) => {
    const now = new Date();
    const end = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); 
    const start = new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000); 
    const endDate = end.toISOString().split('T')[0];
    const startDate = start.toISOString().split('T')[0];

    try {
      const coreMetrics = 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,estimatedRevenue';
      const coreUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=${coreMetrics}&dimensions=day&sort=day`;
      const coreRes = await fetch(coreUrl, { headers: { Authorization: `Bearer ${token}` } });
      
      if (coreRes.status === 401) return { error: 'Unauthorized' };
      
      const coreData = await coreRes.json();
      if (coreData.error) throw new Error(coreData.error.message);

      const coreRows = coreData.rows || [];
      const coreTotals = coreRows.reduce((acc, r) => ({
        views: acc.views + (r[1] || 0),
        watchTime: acc.watchTime + (r[2] || 0),
        avdSum: acc.avdSum + (r[3] || 0),
        avpSum: acc.avpSum + (r[4] || 0),
        rev: acc.rev + (r[5] || 0),
        count: acc.count + 1
      }), { views: 0, watchTime: 0, avdSum: 0, avpSum: 0, rev: 0, count: 0 });

      const rtViews = coreRows.slice(-2).reduce((s, r) => s + (r[1] || 0), 0);
      const count = coreTotals.count || 1;
      const avdSec = coreTotals.avdSum / count;
      const avdFormatted = `${Math.floor(avdSec/60)}:${Math.round(avdSec%60).toString().padStart(2, '0')}`;

      return {
        views28d: coreTotals.views,
        rtViews: rtViews,
        watchTimeHours: Math.round(coreTotals.watchTime / 60),
        avgAVD: avdFormatted,
        avgRetention: (coreTotals.avpSum / count).toFixed(1),
        revenue: coreTotals.rev,
        rpm: (coreTotals.views > 0 ? (coreTotals.rev / coreTotals.views) * 1000 : 0).toFixed(2),
        chartRows: coreRows.map(r => [r[0], r[1], r[2], r[3], r[4], r[5]])
      };
    } catch (e) {
      console.error('Fetch Error:', e);
      return null;
    }
  };

  const fetchChannelsForToken = async (token, isInvite = false, inviteId = null) => {
    setIsLoading(true);
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (userRes.status === 401) {
        throw new Error('Token expired or invalid');
      }
      
      const userInfo = await userRes.json();
      if (!userInfo.email) throw new Error('Could not retrieve user email');

      const channelsRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const channelsData = await channelsRes.json();
      const rawChannels = channelsData.items || [];

      const channelsWithData = await Promise.all(
        rawChannels.map(async (ch) => {
          const analytics = await fetchAnalyticsForChannel(ch.id, token);
          const comments = await fetchCommentsForChannel(ch.id, token);
          return {
            id: ch.id,
            title: ch.snippet.title,
            thumbnail: ch.snippet.thumbnails?.default?.url,
            subscribers: ch.statistics.subscriberCount,
            views: ch.statistics.viewCount,
            videoCount: ch.statistics.videoCount,
            analytics: (analytics && !analytics.error) ? analytics : null,
            comments: (comments && !comments.error) ? comments.map(c => ({ ...c, channel: ch.snippet.title })) : []
          };
        })
      );

      const newAccount = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        token,
        status: 'Connected',
        lastSync: new Date().toLocaleTimeString(),
        channels: channelsWithData,
        isInvite,
        inviteId,
      };

      setConnectedAccounts(prev => {
        const filtered = prev.filter(a => a.email !== newAccount.email);
        const updated = [...filtered, newAccount];
        localStorage.setItem('yt_accounts', JSON.stringify(updated));
        return updated;
      });
      
      setAccessToken(token);
      localStorage.setItem('yt_access_token', token);
      if (isInvite && inviteId) {
        setInvites(prev => {
          const updated = prev.map(inv => {
            if (inv.id === inviteId) {
              return { 
                ...inv, 
                status: 'accepted',
                acceptedAt: new Date().toISOString(),
                connectedAccountId: userInfo.sub,
                connectedChannelId: channelsWithData[0]?.id || null,
                connectedChannelName: channelsWithData[0]?.title || null,
              };
            }
            return inv;
          });
          localStorage.setItem('yt_invites', JSON.stringify(updated));
          return updated;
        });
      }

      return newAccount;
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      // If unauthorized, we might want to clear the token
      if (error.message.includes('Token expired')) {
        setAccessToken(null);
        localStorage.removeItem('yt_access_token');
      }
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

  const createInvite = (inviteData) => {
    const newInvite = {
      id: `inv_${Date.now()}`,
      token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      inviterUserId: 'current_user_id', // Mock current user
      inviterName: 'Admin User', // Mock current user name
      ...inviteData
    };
    setInvites(prev => {
      const updated = [...prev, newInvite];
      localStorage.setItem('yt_invites', JSON.stringify(updated));
      return updated;
    });
    return newInvite;
  };

  const getInviteByToken = (token) => {
    return invites.find(inv => inv.token === token);
  };

  const revokeInvite = (id) => {
    setInvites(prev => {
      const updated = prev.filter(inv => inv.id !== id);
      localStorage.setItem('yt_invites', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshAccount = async (email) => {
    const account = connectedAccounts.find(a => a.email === email);
    if (account?.token) {
      await fetchChannelsForToken(account.token);
    }
  };

  const allChannels = connectedAccounts.flatMap(acc =>
    acc.channels.map(ch => ({ ...ch, accountEmail: acc.email }))
  );

  const allComments = useMemo(() => {
    return connectedAccounts.flatMap(acc => 
      acc.channels.flatMap(ch => ch.comments || [])
    );
  }, [connectedAccounts]);

  return (
    <AuthContext.Provider value={{
      accessToken,
      connectedAccounts,
      allChannels,
      allComments,
      isLoading,
      fetchChannelsForToken,
      removeAccount,
      refreshAccount,
      invites,
      createInvite,
      revokeInvite,
      getInviteByToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
