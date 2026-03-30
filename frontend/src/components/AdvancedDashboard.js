import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdvancedDashboard.css';

function AdvancedDashboard() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviews(res.data);
      calculateStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      setLoading(false);
    }
  };

  const calculateStats = (reviewList) => {
    const total = reviewList.length;
    const approved = reviewList.filter(r => r.status === 'approved').length;
    const rejected = reviewList.filter(r => r.status === 'rejected').length;
    const pending = reviewList.filter(r => r.status === 'open').length;

    setStats({
      total,
      approved,
      rejected,
      pending,
      avgScore: 85
    });
  };

  if (loading) return <div>Loading...</div>;

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const rejectionRate = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;

  return (
    <div className="advanced-dashboard">
      <h1>Code Review Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Reviews</div>
          <div className="stat-value">{stats.total}</div>
        </div>

        <div className="stat-card approved">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-percentage">{approvalRate}%</div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-label">Rejected</div>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-percentage">{rejectionRate}%</div>
        </div>

        <div className="stat-card pending">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-percentage">
            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Avg Quality Score</div>
          <div className="stat-value">{stats.avgScore}</div>
          <div className="stat-unit">/ 100</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Status Distribution</h3>
          <div className="bar-chart">
            <div className="bar-item">
              <div className="bar-label">Approved</div>
              <div className="bar" style={{ width: `${approvalRate}%`, backgroundColor: '#28a745' }}>
                {stats.approved}
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-label">Rejected</div>
              <div className="bar" style={{ width: `${rejectionRate}%`, backgroundColor: '#dc3545' }}>
                {stats.rejected}
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-label">Pending</div>
              <div
                className="bar"
                style={{
                  width: `${stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%`,
                  backgroundColor: '#ffc107'
                }}
              >
                {stats.pending}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3>Quality Metrics</h3>
          <div className="metric-list">
            <div className="metric">
              <span>Complexity Score</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '65%' }}></div>
              </div>
              <span>65</span>
            </div>
            <div className="metric">
              <span>Security Score</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '92%' }}></div>
              </div>
              <span>92</span>
            </div>
            <div className="metric">
              <span>Refactoring Quality</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '78%' }}></div>
              </div>
              <span>78</span>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-reviews">
        <h3>Recent Reviews</h3>
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Comments</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.slice(0, 10).map(review => (
              <tr key={review._id}>
                <td className="title">{review.title}</td>
                <td>{review.author?.username}</td>
                <td>
                  <span className={`badge status-${review.status}`}>{review.status}</span>
                </td>
                <td>{review.comments?.length || 0}</td>
                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdvancedDashboard;