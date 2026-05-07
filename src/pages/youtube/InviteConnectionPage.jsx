import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Mail, 
  ArrowRight,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './InviteConnectionPage.css';

export default function InviteConnectionPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const { getInviteByToken, fetchChannelsForToken, isLoading: isConnecting } = useAuth();
  
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Debug info for dev mode
  const isDev = window.location.hostname === 'localhost';
  const publicUrl = import.meta.env.VITE_APP_PUBLIC_URL || window.location.origin;

  useEffect(() => {
    validateInvite();
  }, [token]);

  const validateInvite = () => {
    setIsValidating(true);
    setError(null);

    // Artificial delay to feel "secure"
    setTimeout(() => {
      const inviteRecord = getInviteByToken(token);
      
      if (!inviteRecord) {
        setError('inviteNotFound');
      } else if (inviteRecord.status === 'accepted') {
        setError('inviteAccepted');
      } else if (inviteRecord.status === 'revoked') {
        setError('inviteRevoked');
      } else if (new Date(inviteRecord.expiresAt) < new Date()) {
        setError('inviteExpired');
      } else {
        setInvite(inviteRecord);
      }
      setIsValidating(false);
    }, 1000);
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const account = await fetchChannelsForToken(tokenResponse.access_token, true, invite?.id);
      if (account) {
        setIsSuccess(true);
      } else {
        alert('❌ Error connecting channel. Please try again.');
      }
    },
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  });

  if (isSuccess) {
    return (
      <div className="invite-page-container">
        <motion.div 
          className="invite-card success-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="success-icon-box">
            <CheckCircle2 size={48} color="var(--success)" />
          </div>
          <h2 className="h2">{t('channelConnectedSuccess')}</h2>
          <p className="p-muted mb-24">Your YouTube channel has been securely connected to {invite?.inviterName}'s workspace.</p>
          <button className="btn btn-primary" onClick={() => window.close()}>
            Close Window
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="invite-page-container">
      {isDev && (
        <div className="dev-banner">
          <Info size={14} />
          <span>{t('localhostWarning')}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isValidating ? (
          <motion.div 
            key="loading"
            className="invite-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RefreshCw size={40} className="spinning" color="var(--primary)" />
            <p className="p-muted mt-16">Validating secure invitation...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            className="invite-card error-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="error-icon-box">
              <AlertCircle size={48} color="var(--danger)" />
            </div>
            <h2 className="h2">{t('inviteLinkError')}</h2>
            <p className="p-muted mb-24">{t(error)}</p>
            
            {isDev && (
              <div className="debug-info">
                <p className="p-tiny"><strong>Debug Info (Dev Only):</strong></p>
                <p className="p-tiny">Token: {token}</p>
                <p className="p-tiny">Found: {invite ? 'Yes' : 'No'}</p>
                <p className="p-tiny">Status: {invite?.status || 'N/A'}</p>
                <p className="p-tiny">Public URL: {publicUrl}</p>
              </div>
            )}

            <button className="btn btn-secondary mt-24" onClick={() => navigate('/')}>
              Go to CreatorDock
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            className="invite-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="brand-header">
              <div className="brand-logo-small">
                <Play size={24} color="white" />
              </div>
              <span className="brand-name">CreatorDock</span>
            </div>

            <div className="invite-content">
              <h1 className="h2 mb-16">{t('connectYTTitle')}</h1>
              <p className="p-muted mb-32">
                <strong>{invite.inviterName}</strong> invited you to connect your YouTube channel to CreatorDock.
              </p>

              <div className="invite-details-box">
                <div className="detail-item">
                  <span className="label">Workspace</span>
                  <span className="value">{invite.workspace}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Access Type</span>
                  <span className="value badge-access">
                    {invite.accessType === 'analyticsRevenue' ? t('analyticsRevenue') : 
                     invite.accessType === 'contentManagement' ? t('contentManagement') :
                     invite.accessType === 'fullManagement' ? t('fullManagement') : t('analyticsOnly')}
                  </span>
                </div>
              </div>

              {invite.message && (
                <div className="invite-message-box">
                  <Mail size={16} />
                  <p>"{invite.message}"</p>
                </div>
              )}

              <div className="safety-card-invite mt-32">
                <Shield size={20} color="var(--success)" />
                <div className="safety-text">
                  <h4 className="h4">Security Note</h4>
                  <p className="p-tiny">{t('safetyNote')}</p>
                </div>
              </div>

              <div className="invite-actions mt-40">
                <button 
                  className={`btn btn-primary btn-full ${isConnecting ? 'loading' : ''}`}
                  onClick={() => login()}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <RefreshCw size={18} className="spinning" />
                  ) : (
                    <img src="https://www.google.com/favicon.ico" alt="" className="google-icon-btn" />
                  )}
                  {isConnecting ? 'Connecting...' : t('continueWithGoogle')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
