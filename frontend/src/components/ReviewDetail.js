import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';

function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [comment, setComment] = useState('');
  const [line, setLine] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const res = await axios.get(`http://localhost:5000/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReview(res.data);
    };
    fetchReview();
  }, [id, navigate]);

  const handleComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.post(`http://localhost:5000/api/reviews/${id}/comments`, { text: comment, line: parseInt(line) }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setComment('');
    setLine('');
    const res = await axios.get(`http://localhost:5000/api/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setReview(res.data);
  };

  const handleStatus = async (status) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5000/api/reviews/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setReview({ ...review, status });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!review) {
    return (
      <div className="loading-page">
        <div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading review...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-detail">
      <header className="page-header">
        <Link to="/dashboard" className="logo">Re<span>fyn</span></Link>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create-review" className="btn btn-sm">+ New Review</Link>
          <button onClick={handleLogout} className="btn-ghost btn-sm">Logout</button>
        </nav>
      </header>

      <div className="page-container">
        <div className="review-detail-header">
          <div>
            <h1 className="page-title">{review.title}</h1>
            <div className="review-meta">
              <div className="review-meta-item">
                Status: <span className={`status-badge ${review.status}`}>{review.status}</span>
              </div>
              <div className="review-meta-item">
                Author: <strong>{review.author?.username}</strong>
              </div>
              {review.reviewers?.length > 0 && (
                <div className="review-meta-item">
                  Reviewers: <strong>{review.reviewers.map(r => r.username).join(', ')}</strong>
                </div>
              )}
            </div>
          </div>
          <div className="btn-group">
            <button onClick={() => handleStatus('approved')} className="btn-success btn-sm">Approve</button>
            <button onClick={() => handleStatus('rejected')} className="btn-danger btn-sm">Reject</button>
          </div>
        </div>

        {review.description && (
          <div className="review-description">{review.description}</div>
        )}

        <div className="diff-section">
          <div className="section-header">
            <h3 className="section-title">Changes</h3>
          </div>
          <div className="diff-wrapper">
            <ReactDiffViewer
              oldValue={review.originalCode}
              newValue={review.changedCode}
              splitView={true}
              useDarkTheme={true}
            />
          </div>
        </div>

        <div className="comments-section">
          <div className="section-header">
            <h3 className="section-title">Comments ({review.comments?.length || 0})</h3>
          </div>

          {review.comments?.length > 0 ? (
            <ul className="comment-list">
              {review.comments.map((c, i) => (
                <li key={i} className="comment-card">
                  <div className="comment-header">
                    <span className="comment-author">{c.user?.username || 'Anonymous'}</span>
                    {c.line && <span className="comment-line-badge">Line {c.line}</span>}
                  </div>
                  <p className="comment-text">{c.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No comments yet. Be the first to leave feedback.</p>
          )}
        </div>

        <div className="comment-form">
          <h4>Add a comment</h4>
          <form onSubmit={handleComment}>
            <div className="form-row">
              <div className="form-group line-input">
                <label htmlFor="line">Line number</label>
                <input
                  id="line"
                  type="number"
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  placeholder="e.g. 42"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review comment..."
                  required
                  rows={3}
                />
              </div>
            </div>
            <button type="submit" className="btn-sm">Submit Comment</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReviewDetail;
