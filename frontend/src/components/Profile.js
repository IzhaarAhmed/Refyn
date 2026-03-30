import React, { useEffect, useState, useRef } from 'react';
import api, { API_URL } from '../api';
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [avatarMsg, setAvatarMsg] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const [userRes, reviewsRes] = await Promise.all([
          api.get('/api/auth/me'),
          api.get('/api/reviews')
        ]);
        setUser(userRes.data);
        setNewUsername(userRes.data.username);
        setReviews(reviewsRes.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setNameMsg('');
    if (newUsername.trim() === user.username) {
      setEditingName(false);
      return;
    }
    try {
      const res = await api.put('/api/auth/me', { username: newUsername });
      setUser(res.data);
      setEditingName(false);
      setNameMsg('Username updated');
      setTimeout(() => setNameMsg(''), 3000);
    } catch (err) {
      setNameMsg(err.response?.data?.error || 'Failed to update username');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarMsg('');
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/api/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data);
      setAvatarMsg('Profile picture updated');
      setTimeout(() => setAvatarMsg(''), 3000);
    } catch (err) {
      setAvatarMsg(err.response?.data?.error || 'Failed to upload picture');
    }
  };

  if (loading || !user) {
    return (
      <div className="loading-page">
        <div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading profile...</div>
        </div>
      </div>
    );
  }

  const createdReviews = reviews.filter(r => r.author?._id === user._id);
  const sharedReviews = reviews.filter(r => r.author?._id !== user._id);
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;
  const openCount = reviews.filter(r => r.status === 'open').length;
  const displayedReviews = activeTab === 'created' ? createdReviews : sharedReviews;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '\u2713';
      case 'rejected': return '\u2717';
      default: return '\u25CB';
    }
  };

  const avatarUrl = user.profilePicture
    ? `${API_URL}${user.profilePicture}`
    : null;

  return (
    <div className="profile-page">
      <header className="page-header">
        <Link to="/dashboard" className="logo">Re<span>fyn</span></Link>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create-review" className="btn btn-sm">+ New Review</Link>
          <Link to="/profile" className="header-avatar active" title={user.username}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="header-avatar-img" />
              : user.username.charAt(0).toUpperCase()
            }
          </Link>
        </nav>
      </header>

      <div className="page-container">
        {/* Profile Card */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.username} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="profile-avatar-overlay">
                <span>Change</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-info">
              {editingName ? (
                <form onSubmit={handleUpdateUsername} className="profile-edit-form">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="profile-edit-input"
                    autoFocus
                  />
                  <div className="profile-edit-actions">
                    <button type="submit" className="btn btn-sm">Save</button>
                    <button type="button" className="btn-ghost btn-sm" onClick={() => { setEditingName(false); setNewUsername(user.username); setNameMsg(''); }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="profile-name-row">
                  <h2 className="profile-name">{user.username}</h2>
                  <button className="btn-ghost btn-sm profile-edit-btn" onClick={() => setEditingName(true)}>Edit</button>
                </div>
              )}
              <p className="profile-email">{user.email}</p>
              <span className="profile-role">{user.role}</span>
              {nameMsg && (
                <span className={`profile-msg ${nameMsg.includes('updated') ? 'success' : 'error'}`}>{nameMsg}</span>
              )}
              {avatarMsg && (
                <span className={`profile-msg ${avatarMsg.includes('updated') ? 'success' : 'error'}`}>{avatarMsg}</span>
              )}
            </div>
            <button onClick={handleLogout} className="btn-danger btn-sm profile-logout">Logout</button>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat-card">
              <div className="profile-stat-value">{reviews.length}</div>
              <div className="profile-stat-label">Total Reviews</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{createdReviews.length}</div>
              <div className="profile-stat-label">Created</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{sharedReviews.length}</div>
              <div className="profile-stat-label">Shared with me</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{approvedCount}</div>
              <div className="profile-stat-label">Approved</div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="profile-breakdown">
            <h3 className="section-title">Status Breakdown</h3>
            <div className="breakdown-bars">
              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span className="breakdown-dot open"></span>
                  Open
                </div>
                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill open"
                    style={{ width: reviews.length ? `${(openCount / reviews.length) * 100}%` : '0%' }}
                  ></div>
                </div>
                <span className="breakdown-count">{openCount}</span>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span className="breakdown-dot approved"></span>
                  Approved
                </div>
                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill approved"
                    style={{ width: reviews.length ? `${(approvedCount / reviews.length) * 100}%` : '0%' }}
                  ></div>
                </div>
                <span className="breakdown-count">{approvedCount}</span>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span className="breakdown-dot rejected"></span>
                  Rejected
                </div>
                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill rejected"
                    style={{ width: reviews.length ? `${(rejectedCount / reviews.length) * 100}%` : '0%' }}
                  ></div>
                </div>
                <span className="breakdown-count">{rejectedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Created / Shared */}
        <div className="page-toolbar">
          <div className="review-tabs">
            <button
              className={`tab-btn ${activeTab === 'created' ? 'active' : ''}`}
              onClick={() => setActiveTab('created')}
            >
              Created ({createdReviews.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared')}
            >
              Shared with me ({sharedReviews.length})
            </button>
          </div>
        </div>

        {/* Review List */}
        {displayedReviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128196;</div>
            <h3>
              {activeTab === 'created' ? 'No reviews created yet' : 'No reviews shared with you'}
            </h3>
            <p>
              {activeTab === 'created'
                ? 'Reviews you author will appear here.'
                : 'When someone adds you as a reviewer, those reviews will appear here.'}
            </p>
            {activeTab === 'created' && (
              <Link to="/create-review" className="btn">Create Review</Link>
            )}
          </div>
        ) : (
          <div className="review-list">
            {displayedReviews.map(review => (
              <Link to={`/review/${review._id}`} key={review._id} className="review-item">
                <div className="review-item-left">
                  <div className={`review-icon ${review.status}`}>
                    {getStatusIcon(review.status)}
                  </div>
                  <div className="review-item-info">
                    <div className="review-item-title">{review.title}</div>
                    <div className="review-item-meta">
                      {review.author?._id === user._id
                        ? <span className="review-tag created">Author</span>
                        : <span className="review-tag shared">Reviewer</span>
                      }
                      &nbsp;&middot;&nbsp;by {review.author?.username || 'Unknown'}
                      &nbsp;&middot;&nbsp;{review.comments?.length || 0} comment{(review.comments?.length || 0) !== 1 ? 's' : ''}
                      {review.reviewers?.length > 0 && (
                        <>&nbsp;&middot;&nbsp;{review.reviewers.length} reviewer{review.reviewers.length !== 1 ? 's' : ''}</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="review-item-right">
                  <span className={`status-badge ${review.status}`}>{review.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
