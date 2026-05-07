import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { channels as mockChannels } from '../../data/mockData';
import { 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  RefreshCw, 
  Trash2, 
  Search, 
  X,
  ChevronRight,
  BarChart2,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileCode,
  FileJson,
  Layout
} from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const { t, locale } = useLanguage();
  const { allChannels = [] } = useAuth();
  const channels = allChannels.length > 0 ? allChannels : mockChannels;

  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState([
    {
      id: 1,
      name: 'Monthly Performance Report',
      type: 'overviewReport',
      scope: 'allChannelsScope',
      range: 'last28d',
      format: 'PDF',
      date: 'Today',
      status: 'ready'
    },
    {
      id: 2,
      name: 'Tech Insider Deep Dive',
      type: 'channelPerformanceReport',
      scope: 'Selected Channel',
      range: 'last7d',
      format: 'Excel',
      date: 'Yesterday',
      status: 'ready'
    }
  ]);

  const [newReport, setNewReport] = useState({
    name: '',
    type: 'overviewReport',
    scope: 'allChannelsScope',
    range: 'last28d',
    format: 'PDF'
  });

  const templates = [
    { id: 'overview', title: t('overviewReport'), desc: t('overviewReportDesc'), icon: Layout },
    { id: 'channel', title: t('channelPerformanceReport'), desc: t('channelPerformanceReportDesc'), icon: BarChart2 },
    { id: 'monetization', title: t('monetizationReport'), desc: t('monetizationReportDesc'), icon: FileCode },
    { id: 'attention', title: t('needsAttentionReport'), desc: t('needsAttentionReportDesc'), icon: AlertTriangle },
    { id: 'target', title: t('targetReport'), desc: t('targetReportDesc'), icon: CheckCircle2 },
    { id: 'hof', title: t('hallOfFameReport'), desc: t('hallOfFameReportDesc'), icon: Sparkles },
  ];

  const handleGenerate = (e) => {
    e.preventDefault();
    const id = Date.now();
    setReports([{ ...newReport, id, date: 'Just now', status: 'ready' }, ...reports]);
    setShowModal(false);
  };

  const useTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    setNewReport({ ...newReport, type: templateId + 'Report', name: template.title });
    setShowModal(true);
  };

  return (
    <div className="reports-page">
      <header className="page-header">
        <div className="header-left">
          <h2 className="h2">{t('reportsTitle')}</h2>
          <p className="p-muted">{t('reportsSubtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          {t('createReport')}
        </button>
      </header>

      {/* Summary Cards */}
      <section className="reports-summary-grid">
        <div className="report-stat-card card">
          <span className="label">{t('reportsGenerated')}</span>
          <span className="value">24</span>
        </div>
        <div className="report-stat-card card">
          <span className="label">{t('recentReports')}</span>
          <span className="value">6</span>
        </div>
        <div className="report-stat-card card">
          <span className="label">{t('scheduledReports')}</span>
          <span className="value">0</span>
        </div>
        <div className="report-stat-card card">
          <span className="label">{t('availableFormats')}</span>
          <span className="value">PDF, CSV, Excel</span>
        </div>
      </section>

      {/* Templates Section */}
      <section className="reports-section">
        <h3 className="h3 section-title">{t('reportTemplates')}</h3>
        <div className="templates-grid">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="template-card card">
              <div className="template-icon">
                <tmpl.icon size={24} />
              </div>
              <div className="template-info">
                <h4 className="tmpl-name">{tmpl.title}</h4>
                <p className="tmpl-desc">{tmpl.desc}</p>
              </div>
              <button className="btn btn-ghost full-width" onClick={() => useTemplate(tmpl.id)}>
                {t('useTemplate')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="reports-section">
        <h3 className="h3 section-title">{t('recentReports')}</h3>
        {reports.length > 0 ? (
          <div className="reports-table-wrap card">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>{t('reportName')}</th>
                  <th>{t('reportType')}</th>
                  <th>{t('channelScope')}</th>
                  <th>{t('format')}</th>
                  <th>{t('createdDate')}</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td><div className="report-name-cell"><FileText size={16} /> {report.name}</div></td>
                    <td>{t(report.type) || report.type}</td>
                    <td>{t(report.scope) || report.scope}</td>
                    <td><span className="format-badge">{report.format}</span></td>
                    <td>{report.date}</td>
                    <td><span className={`status-pill ${report.status}`}>{t(report.status)}</span></td>
                    <td>
                      <div className="report-actions">
                        <button className="action-btn" title="View"><Eye size={16} /></button>
                        <button className="action-btn" title="Download"><Download size={16} /></button>
                        <button className="action-btn" title="Regenerate"><RefreshCw size={16} /></button>
                        <button className="action-btn danger" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="reports-empty-state card">
            <div className="empty-visual">
              <FileText size={64} />
            </div>
            <h3 className="h3">{t('noReportsTitle')}</h3>
            <p className="p-muted">{t('noReportsSubtitle')}</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              {t('createReport')}
            </button>
          </div>
        )}
      </section>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div className="modal-content card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="modal-header">
                <h3 className="h3">{t('createReport')}</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleGenerate} className="report-form">
                <div className="form-group">
                  <label>{t('reportName')}</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Q2 Performance Review" 
                    value={newReport.name} 
                    onChange={e => setNewReport({...newReport, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('reportType')}</label>
                    <select value={newReport.type} onChange={e => setNewReport({...newReport, type: e.target.value})}>
                      {templates.map(tmpl => <option key={tmpl.id} value={tmpl.id + 'Report'}>{tmpl.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('channelScope')}</label>
                    <select value={newReport.scope} onChange={e => setNewReport({...newReport, scope: e.target.value})}>
                      <option value="allChannelsScope">{t('allChannelsScope')}</option>
                      <option value="Selected Channel">{t('selectedChannel')}</option>
                      <option value="Selected Category">{t('selectedCategory')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('period')}</label>
                    <select value={newReport.range} onChange={e => setNewReport({...newReport, range: e.target.value})}>
                      <option value="last48h">{t('last48h')}</option>
                      <option value="last7d">{t('last7d')}</option>
                      <option value="last28d">{t('last28d')}</option>
                      <option value="thisMonth">{t('thisMonth')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('format')}</label>
                    <select value={newReport.format} onChange={e => setNewReport({...newReport, format: e.target.value})}>
                      <option value="PDF">PDF</option>
                      <option value="CSV">CSV</option>
                      <option value="Excel">Excel</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                  <button type="submit" className="btn btn-primary">{t('generateReport')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
