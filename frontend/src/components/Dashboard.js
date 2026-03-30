import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:5000/api/reviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReviews(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '\u2713';
      case 'rejected': return '\u2717';
      default: return '\u25CB';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div className="logo">Re<span>fyn</span></div>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create-review" className="btn btn-sm">+ New Review</Link>
          <button onClick={handleLogout} className="btn-ghost btn-sm">Logout</button>
        </nav>
      </header>

      <div className="page-container">
        <div className="page-toolbar">
          <div>
            <h1 className="page-title">Reviews</h1>
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
          <div className="review-list">
            {reviews.map(review => (
              <Link to={`/review/${review._id}`} key={review._id} className="review-item">
                <div className="review-item-left">
                  <div className={`review-icon ${review.status}`}>
                    {getStatusIcon(review.status)}
                  </div>
                  <div className="review-item-info">
                    <div className="review-item-title">{review.title}</div>
                    <div className="review-item-meta">
                      by {review.author?.username || 'Unknown'} &middot; {review.comments?.length || 0} comment{(review.comments?.length || 0) !== 1 ? 's' : ''}
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

export default Dashboard;
