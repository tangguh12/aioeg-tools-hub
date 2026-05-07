import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  // Persistence for counts and resolved IDs
  const [unreadNotifications, setUnreadNotifications] = useState(() => {
    const saved = localStorage.getItem('creatordock_unread_notif');
    return saved !== null ? parseInt(saved) : 3;
  });

  const [resolvedCommentIds, setResolvedCommentIds] = useState(() => {
    const saved = localStorage.getItem('creatordock_resolved_comments');
    return saved ? JSON.parse(saved) : [];
  });

  const [resolvedIssueIds, setResolvedIssueIds] = useState(() => {
    const saved = localStorage.getItem('creatordock_resolved_issues');
    return saved ? JSON.parse(saved) : [];
  });

  // Hardcoded totals for demo purposes
  // In a real app, these would come from an API
  const TOTAL_MOCK_COMMENTS = 3;
  const TOTAL_MOCK_ISSUES = 3;

  // Derived counts based on resolved IDs
  const pendingComments = useMemo(() => {
    return Math.max(0, TOTAL_MOCK_COMMENTS - resolvedCommentIds.length);
  }, [resolvedCommentIds]);

  const urgentIssues = useMemo(() => {
    return Math.max(0, TOTAL_MOCK_ISSUES - resolvedIssueIds.length);
  }, [resolvedIssueIds]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('creatordock_unread_notif', unreadNotifications);
    localStorage.setItem('creatordock_resolved_comments', JSON.stringify(resolvedCommentIds));
    localStorage.setItem('creatordock_resolved_issues', JSON.stringify(resolvedIssueIds));
  }, [unreadNotifications, resolvedCommentIds, resolvedIssueIds]);

  const markAllNotificationsRead = () => setUnreadNotifications(0);
  
  const resolveComment = (id) => {
    if (id && !resolvedCommentIds.includes(id)) {
      setResolvedCommentIds(prev => [...prev, id]);
    }
  };

  const resolveIssue = (id) => {
    if (id && !resolvedIssueIds.includes(id)) {
      setResolvedIssueIds(prev => [...prev, id]);
    }
  };

  const value = {
    unreadNotifications,
    pendingComments,
    urgentIssues,
    resolvedCommentIds,
    resolvedIssueIds,
    markAllNotificationsRead,
    resolveComment,
    resolveIssue,
    setUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
