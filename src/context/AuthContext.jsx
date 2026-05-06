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
      const channels = channelsData.items || [];

      // 3. Build the account object
      const newAccount = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        token,
        status: 'Connected',
        lastSync: new Date().toLocaleTimeString(),
        channels: channels.map(ch => ({
          id: ch.id,
          title: ch.snippet.title,
          thumbnail: ch.snippet.thumbnails?.default?.url,
          subscribers: ch.statistics.subscriberCount,
          views: ch.statistics.viewCount,
          videoCount: ch.statistics.videoCount,
          description: ch.snippet.description,
          country: ch.snippet.country,
        }))
      };

      // 4. Merge with existing (avoid duplicates by email)
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
