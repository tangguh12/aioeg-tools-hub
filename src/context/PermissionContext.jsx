import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PermissionContext = createContext();

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
  const { connectedAccounts } = useAuth();
  
  // Default user state (simulating a logged-in team member)
  // In a real app, this would come from the backend session
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Admin User',
    role: 'Owner', // 'Owner', 'Editor', 'Analyst', 'Viewer'
    permissions: {
      analytics: true,
      monetization: true,
      content: true,
      comments: true,
      admin: true
    },
    assignedChannels: ['all'] // List of channel IDs or ['all']
  });

  const hasPermission = (permissionKey) => {
    if (currentUser.role === 'Owner') return true;
    return !!currentUser.permissions[permissionKey];
  };

  const canAccessChannel = (channelId) => {
    if (currentUser.role === 'Owner' || currentUser.assignedChannels.includes('all')) return true;
    return currentUser.assignedChannels.includes(channelId);
  };

  // Helper to filter items (like menu or channels) based on permissions
  const filterByPermission = (items, permissionKey) => {
    if (hasPermission(permissionKey)) return items;
    return [];
  };

  return (
    <PermissionContext.Provider value={{
      currentUser,
      setCurrentUser,
      hasPermission,
      canAccessChannel,
      filterByPermission
    }}>
      {children}
    </PermissionContext.Provider>
  );
};
