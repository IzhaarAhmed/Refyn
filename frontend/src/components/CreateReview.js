import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function CreateReview() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [changedCode, setChangedCode] = useState('');
  const [reviewers, setReviewers] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/reviews', { title, description, originalCode, changedCode, reviewers });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-review-page">
      <header className="page-header">
        <Link to="/dashboard" className="logo">Re<span>fyn</span></Link>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <ThemeToggle />
          <Link to="/profile" className="header-avatar">U</Link>
        </nav>
      </header>

      <div className="page-container">
        <div>
          <h1 className="page-title">New Review</h1>
          <p className="page-subtitle">Submit code for review by your team.</p>
        </div>

        <div className="create-review-form">
          {error && <div className="auth-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the change"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what changed and why..."
                rows={3}
              />
            </div>

            <div className="code-inputs">
              <div className="code-input-group">
                <label>
                  <span className="code-label-dot original"></span>
                  Original Code
                </label>
                <textarea
                  className="code-input"
                  value={originalCode}
                  onChange={(e) => setOriginalCode(e.target.value)}
                  placeholder="Paste the original code here..."
                  required
                />
              </div>
              <div className="code-input-group">
                <label>
                  <span className="code-label-dot changed"></span>
                  Changed Code
                </label>
                <textarea
                  className="code-input"
                  value={changedCode}
                  onChange={(e) => setChangedCode(e.target.value)}
                  placeholder="Paste the updated code here..."
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reviewers">Reviewers</label>
              <input
                id="reviewers"
                type="text"
                value={reviewers}
                onChange={(e) => setReviewers(e.target.value)}
                placeholder="Comma-separated usernames (e.g. alice, bob)"
              />
              <span className="form-hint">Enter the usernames of people who should review this code.</span>
            </div>

            <div className="btn-group">
              <button type="submit" className="btn-lg" disabled={loading}>
                {loading ? 'Creating...' : 'Create Review'}
              </button>
              <Link to="/dashboard" className="btn btn-secondary btn-lg">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateReview;
