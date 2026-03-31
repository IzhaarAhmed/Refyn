import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';
import AIPanel from './AIPanel';
import ThemeToggle from './ThemeToggle';

function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [comment, setComment] = useState('');
  const [line, setLine] = useState('');
  const [newReviewers, setNewReviewers] = useState('');
  const [reviewerMsg, setReviewerMsg] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [voteError, setVoteError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const [reviewRes, userRes] = await Promise.all([
        api.get(`/api/reviews/${id}`),
        api.get('/api/auth/me')
      ]);
      setReview(reviewRes.data);
      setCurrentUser(userRes.data);
    };
    fetchData();
  }, [id, navigate]);

  const handleComment = async (e) => {
    e.preventDefault();
    await api.post(`/api/reviews/${id}/comments`, { text: comment, line: parseInt(line) });
    setComment('');
    setLine('');
    const res = await api.get(`/api/reviews/${id}`);
    setReview(res.data);
  };

  const handleApprove = async () => {
    setVoteError('');
    try {
      const res = await api.put(`/api/reviews/${id}/status`, { status: 'approved' });
      setReview(res.data);
    } catch (err) {
      setVoteError(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setVoteError('');
    try {
      const res = await api.put(`/api/reviews/${id}/status`, {
        status: 'rejected',
        comment: rejectComment
      });
      setReview(res.data);
      setShowRejectForm(false);
      setRejectComment('');
    } catch (err) {
      setVoteError(err.response?.data?.error || 'Failed to reject');
    }
  };

  const handleAddReviewers = async (e) => {
    e.preventDefault();
    setReviewerMsg('');
    try {
      const res = await api.post(`/api/reviews/${id}/reviewers`, { reviewers: newReviewers });
      setReview(res.data);
      setNewReviewers('');
      setReviewerMsg('Reviewers added successfully');
    } catch (err) {
      setReviewerMsg(err.response?.data?.error || 'Failed to add reviewers');
    }
  };

  if (!review || !currentUser) {
    return (
      <div className="loading-page">
        <div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading review...</div>
        </div>
      </div>
    );
  }

  const isAuthor = review.author?._id === currentUser._id;
  const isFinalized = review.status !== 'open';
  const hasVoted = review.votes?.some(v => v.user?._id === currentUser._id);
  const canVote = !isAuthor && !isFinalized && !hasVoted;
  const approvalCount = review.votes?.filter(v => v.vote === 'approved').length || 0;
  const rejectionCount = review.votes?.filter(v => v.vote === 'rejected').length || 0;
  const totalReviewers = review.reviewers?.length || 0;

  return (
    <div className="review-detail">
      <header className="page-header">
        <Link to="/dashboard" className="logo">Re<span>fyn</span></Link>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create-review" className="btn btn-sm">+ New Review</Link>
          <ThemeToggle />
          <Link to="/profile" className="header-avatar">
            {currentUser.username?.charAt(0).toUpperCase() || 'U'}
          </Link>
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
              {totalReviewers > 0 && (
                <div className="review-meta-item">
                  Votes: <strong className="text-success">{approvalCount}</strong> / <strong className="text-danger">{rejectionCount}</strong> of {totalReviewers}
                </div>
              )}
            </div>
          </div>

          {/* Vote Buttons */}
          {canVote && (
            <div className="btn-group">
              <button onClick={handleApprove} className="btn-success btn-sm">Approve</button>
              <button onClick={() => setShowRejectForm(true)} className="btn-danger btn-sm">Reject</button>
            </div>
          )}
          {isAuthor && review.status === 'open' && (
            <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>You cannot vote on your own review</span>
          )}
          {hasVoted && !isFinalized && (
            <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>You have already voted</span>
          )}
        </div>

        {/* Vote Error */}
        {voteError && <div className="auth-error mb-4">{voteError}</div>}

        {/* Reject Form */}
        {showRejectForm && (
          <div className="comment-form mb-4">
            <h4>Reason for rejection (required)</h4>
            <form onSubmit={handleReject}>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Explain why you are rejecting this review..."
                required
                rows={3}
              />
              <div className="btn-group" style={{ marginTop: 'var(--space-3)' }}>
                <button type="submit" className="btn-danger btn-sm">Confirm Rejection</button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => { setShowRejectForm(false); setRejectComment(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

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

        {/* AI Assistant */}
        <AIPanel reviewId={id} />

        {/* Review Summary */}
        {review.votes?.length > 0 && (
          <div className="review-summary">
            <div className="section-header">
              <h3 className="section-title">Review Summary</h3>
              {isFinalized && (
                <span className={`status-badge ${review.status}`}>{review.status}</span>
              )}
            </div>

            {/* Review Info */}
            <div className="summary-info">
              <div className="summary-info-item">
                <span className="summary-label">Created by</span>
                <span className="summary-value">{review.author?.username}</span>
              </div>
              <div className="summary-info-item">
                <span className="summary-label">Created on</span>
                <span className="summary-value">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="summary-info-item">
                <span className="summary-label">Total votes</span>
                <span className="summary-value">
                  <strong className="text-success">{approvalCount} approved</strong>
                  {' / '}
                  <strong className="text-danger">{rejectionCount} rejected</strong>
                  {' of '}{totalReviewers} reviewer{totalReviewers !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Approved By */}
            {approvalCount > 0 && (
              <div className="summary-group">
                <h4 className="summary-group-title text-success">Approved by ({approvalCount})</h4>
                <div className="summary-voters">
                  {review.votes.filter(v => v.vote === 'approved').map((v, i) => (
                    <div key={i} className="summary-voter">
                      <div className="summary-voter-avatar approved">{v.user?.username?.charAt(0).toUpperCase()}</div>
                      <div className="summary-voter-info">
                        <strong>{v.user?.username}</strong>
                        <span className="summary-timestamp">{new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="status-badge approved">approved</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected By */}
            {rejectionCount > 0 && (
              <div className="summary-group">
                <h4 className="summary-group-title text-danger">Rejected by ({rejectionCount})</h4>
                <div className="summary-voters">
                  {review.votes.filter(v => v.vote === 'rejected').map((v, i) => {
                    const rejectionComment = review.comments?.find(
                      c => c.user?._id === v.user?._id &&
                        Math.abs(new Date(c.createdAt) - new Date(v.createdAt)) < 5000
                    );
                    return (
                      <div key={i} className="summary-voter summary-voter--with-comment">
                        <div className="summary-voter-row">
                          <div className="summary-voter-avatar rejected">{v.user?.username?.charAt(0).toUpperCase()}</div>
                          <div className="summary-voter-info">
                            <strong>{v.user?.username}</strong>
                            <span className="summary-timestamp">{new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span className="status-badge rejected">rejected</span>
                        </div>
                        {rejectionComment && (
                          <div className="summary-rejection-comment">
                            <p>{rejectionComment.text}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

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

        <div className="comment-form" style={{ marginBottom: 'var(--space-6)' }}>
          <h4>Add Reviewers</h4>
          {reviewerMsg && (
            <div className={reviewerMsg.includes('success') ? 'reviewer-success' : 'auth-error'} style={{ marginBottom: '1rem' }}>
              {reviewerMsg}
            </div>
          )}
          <form onSubmit={handleAddReviewers}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="reviewers">Usernames</label>
                <input
                  id="reviewers"
                  type="text"
                  value={newReviewers}
                  onChange={(e) => setNewReviewers(e.target.value)}
                  placeholder="Comma-separated usernames (e.g. alice, bob)"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-sm">Add Reviewers</button>
          </form>
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
