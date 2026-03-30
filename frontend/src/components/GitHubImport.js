import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

function GitHubImport() {
  const [integrations, setIntegrations] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectMsg, setConnectMsg] = useState({ text: '', type: '' });
  const [importMsg, setImportMsg] = useState({ text: '', type: '' });
  const [connecting, setConnecting] = useState(false);
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const res = await api.get('/api/github/integrations');
      setIntegrations(res.data);
      if (res.data.length > 0 && !selectedIntegration) {
        setSelectedIntegration(res.data[0]._id);
      }
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnectMsg({ text: '', type: '' });
    setConnecting(true);
    try {
      const res = await api.post('/api/github/connect', {
        repositoryUrl: repoUrl,
        accessToken
      });
      setConnectMsg({ text: res.data.message, type: 'success' });
      setRepoUrl('');
      setAccessToken('');
      fetchIntegrations();
    } catch (err) {
      setConnectMsg({ text: err.response?.data?.error || 'Failed to connect repo', type: 'error' });
    } finally {
      setConnecting(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setImportMsg({ text: '', type: '' });
    setImporting(true);
    try {
      const res = await api.post('/api/github/import-pr', {
        integrationId: selectedIntegration,
        prNumber: parseInt(prNumber)
      });
      setImportMsg({ text: `PR #${prNumber} imported as review`, type: 'success' });
      setPrNumber('');
      setTimeout(() => navigate(`/review/${res.data.review.id}`), 1500);
    } catch (err) {
      setImportMsg({ text: err.response?.data?.error || 'Failed to import PR', type: 'error' });
    } finally {
      setImporting(false);
    }
  };

  const handleDisconnect = async (id) => {
    try {
      await api.delete(`/api/github/disconnect/${id}`);
      setIntegrations(integrations.filter(i => i._id !== id));
      if (selectedIntegration === id) {
        setSelectedIntegration('');
      }
    } catch (err) {
      setConnectMsg({ text: err.response?.data?.error || 'Failed to disconnect', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="github-page">
      <header className="page-header">
        <Link to="/dashboard" className="logo">Re<span>fyn</span></Link>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create-review" className="btn btn-sm">+ New Review</Link>
          <Link to="/profile" className="header-avatar">U</Link>
        </nav>
      </header>

      <div className="page-container">
        <div>
          <h1 className="page-title">GitHub Integration</h1>
          <p className="page-subtitle">Connect repositories and import pull requests as code reviews.</p>
        </div>

        <div className="github-grid">
          {/* Connect Repo */}
          <div className="github-card">
            <h3 className="github-card-title">Connect Repository</h3>
            <p className="github-card-desc">Link a GitHub repo using a personal access token.</p>
            {connectMsg.text && (
              <div className={connectMsg.type === 'success' ? 'reviewer-success' : 'auth-error'} style={{ marginBottom: '1rem' }}>
                {connectMsg.text}
              </div>
            )}
            <form onSubmit={handleConnect}>
              <div className="form-group">
                <label htmlFor="repoUrl">Repository URL</label>
                <input
                  id="repoUrl"
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="token">Personal Access Token</label>
                <input
                  id="token"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  required
                />
                <span className="form-hint">
                  Generate at GitHub &rarr; Settings &rarr; Developer settings &rarr; Personal access tokens. Needs <code>repo</code> scope.
                </span>
              </div>
              <button type="submit" disabled={connecting}>
                {connecting ? 'Connecting...' : 'Connect Repository'}
              </button>
            </form>
          </div>

          {/* Import PR */}
          <div className="github-card">
            <h3 className="github-card-title">Import Pull Request</h3>
            <p className="github-card-desc">Import a PR from a connected repo as a code review.</p>
            {importMsg.text && (
              <div className={importMsg.type === 'success' ? 'reviewer-success' : 'auth-error'} style={{ marginBottom: '1rem' }}>
                {importMsg.text}
              </div>
            )}
            {integrations.length === 0 ? (
              <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>Connect a repository first to import PRs.</p>
            ) : (
              <form onSubmit={handleImport}>
                <div className="form-group">
                  <label htmlFor="integration">Repository</label>
                  <select
                    id="integration"
                    value={selectedIntegration}
                    onChange={(e) => setSelectedIntegration(e.target.value)}
                    required
                  >
                    {integrations.map(i => (
                      <option key={i._id} value={i._id}>{i.owner}/{i.repo}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="prNumber">PR Number</label>
                  <input
                    id="prNumber"
                    type="number"
                    value={prNumber}
                    onChange={(e) => setPrNumber(e.target.value)}
                    placeholder="e.g. 42"
                    min="1"
                    required
                  />
                </div>
                <button type="submit" disabled={importing}>
                  {importing ? 'Importing...' : 'Import PR as Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Connected Repos */}
        {integrations.length > 0 && (
          <div className="dashboard-section" style={{ marginTop: 'var(--space-8)' }}>
            <div className="section-header">
              <h3 className="section-title">Connected Repositories ({integrations.length})</h3>
            </div>
            <div className="review-list">
              {integrations.map(i => (
                <div key={i._id} className="review-item" style={{ cursor: 'default' }}>
                  <div className="review-item-left">
                    <div className="review-icon open" style={{ fontSize: '18px' }}>&#9733;</div>
                    <div className="review-item-info">
                      <div className="review-item-title">{i.owner}/{i.repo}</div>
                      <div className="review-item-meta">{i.repositoryUrl}</div>
                    </div>
                  </div>
                  <div className="review-item-right">
                    <button className="btn-danger btn-sm" onClick={() => handleDisconnect(i._id)}>Disconnect</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GitHubImport;
