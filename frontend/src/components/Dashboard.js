import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const [reviewsRes, userRes] = await Promise.all([
          api.get('/api/reviews'),
          api.get('/api/auth/me')
        ]);
        setReviews(reviewsRes.data);
        setUser(userRes.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '\u2713';
      case 'rejected': return '\u2717';
      default: return '\u25CB';
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading reviews...</div>
        </div>
      </div>
    );
  }

  const createdReviews = reviews.filter(r => r.author?._id === user?._id);
  const sharedReviews = reviews.filter(r => r.author?._id !== user?._id);

  const ReviewList = ({ items, emptyMsg }) => (
    items.length === 0 ? (
      <p className="text-muted" style={{ padding: 'var(--space-6) 0' }}>{emptyMsg}</p>
    ) : (
      <div className="review-list">
        {items.map(review => (
          <Link to={`/review/${review._id}`} key={review._id} className="review-item">
            <div className="review-item-left">
              <div className={`review-icon ${review.status}`}>
                {getStatusIcon(review.status)}
              </div>
              <div className="review-item-info">
                <div className="review-item-title">{review.title}</div>
                <div className="review-item-meta">
                  by {review.author?.username || 'Unknown'} &middot; {review.comments?.length || 0} comment{(review.comments?.length || 0) !== 1 ? 's' : ''}
                  {review.reviewers?.length > 0 && (
                    <> &middot; {review.reviewers.length} reviewer{review.reviewers.length !== 1 ? 's' : ''}</>
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
    )
  );

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div className="logo">Re<span>fyn</span></div>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create-review" className="btn btn-sm">+ New Review</Link>
          <Link to="/profile" className="header-avatar" title={user?.username}>
            {user?.username?.charAt(0).toUpperCase()}
          </Link>
        </nav>
      </header>

      <div className="page-container">
        <div className="page-toolbar">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">{reviews.length} review{reviews.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link to="/create-review" className="btn">+ New Review</Link>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128196;</div>
            <h3>No reviews yet</h3>
            <p>Create your first code review to get started.</p>
            <Link to="/create-review" className="btn">Create Review</Link>
          </div>
        ) : (
          <>
            {/* Created by me */}
            <div className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title">Created by me ({createdReviews.length})</h3>
              </div>
              <ReviewList items={createdReviews} emptyMsg="You haven't created any reviews yet." />
            </div>

            {/* Shared with me */}
            <div className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title">Shared with me ({sharedReviews.length})</h3>
              </div>
              <ReviewList items={sharedReviews} emptyMsg="No reviews have been shared with you yet." />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
