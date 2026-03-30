import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PRStyleReview.css';

function PRStyleReview({ reviewId }) {
  const [review, setReview] = useState(null);
  const [github, setGithub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReview(res.data);

      // Fetch GitHub integration if available
      const githubRes = await axios.get(
        `http://localhost:5000/api/analysis/${reviewId}/github`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      ).catch(() => null);

      if (githubRes?.data) {
        setGithub(githubRes.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch review', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!review) return <div>Review not found</div>;

  return (
    <div className="pr-review">
      <div className="pr-header">
        <h1 className="pr-title">{review.title}</h1>
        <div className="pr-metadata">
          <span className={`pr-badge status-${review.status}`}>{review.status}</span>
          {github && (
            <div className="pr-github-info">
              <a href={github.url} target="_blank" rel="noopener noreferrer">
                #{github.prNumber} on GitHub
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="pr-content">
        <div className="pr-sidebar">
          <div className="pr-author">
            <h4>Author</h4>
            <p>{review.author?.username}</p>
          </div>

          <div className="pr-reviewers">
            <h4>Reviewers</h4>
            <ul>
              {review.reviewers?.map(reviewer => (
                <li key={reviewer._id}>{reviewer.username}</li>
              ))}
            </ul>
          </div>

          {github && (
            <div className="pr-github-details">
              <h4>Branch Info</h4>
              <p>
                <strong>Base:</strong> {github.prBase}
              </p>
              <p>
                <strong>Head:</strong> {github.prHead}
              </p>
              {github.prLabels?.length > 0 && (
                <div className="pr-labels">
                  {github.prLabels.map(label => (
                    <span key={label} className="label">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pr-main">
          <div className="pr-description">
            <h3>Description</h3>
            <p>{review.description}</p>
          </div>

          <div className="pr-diff">
            <h3>Changes</h3>
            <div className="diff-stats">
              <span className="additions">
                +{(review.changedCode.split('\n').length || 0)} additions
              </span>
              <span className="deletions">
                -{(review.originalCode.split('\n').length || 0)} deletions
              </span>
            </div>
          </div>

          <div className="pr-comments">
            <h3>Comments ({review.comments?.length || 0})</h3>
            <ul className="comments-list">
              {review.comments?.map((comment, idx) => (
                <li key={idx} className="comment">
                  <div className="comment-header">
                    <strong>{comment.user?.username}</strong>
                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  {comment.line && <small>Line {comment.line}</small>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PRStyleReview;