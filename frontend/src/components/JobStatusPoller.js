import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './JobStatusPoller.css';

function JobStatusPoller({ jobId, onComplete }) {
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    const token = localStorage.getItem('token');
    const pollJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}/poll`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { timeout: 30000 }
        });

        setStatus(res.data.status);
        setProgress(res.data.progress || 0);

        if (res.data.error) {
          setError(res.data.error);
        }

        if (res.data.result) {
          setResult(res.data.result);
        }

        if (res.data.status === 'completed' || res.data.status === 'failed') {
          if (onComplete) {
            onComplete(res.data);
          }
        } else {
          // Continue polling
          setTimeout(pollJob, 5000);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError(err.message);
        // Retry after delay
        setTimeout(pollJob, 10000);
      }
    };

    pollJob();
  }, [jobId, onComplete]);

  return (
    <div className="job-status-poller">
      <div className="status-container">
        <div className={`status-badge ${status}`}>{status.toUpperCase()}</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-text">{progress}%</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && status === 'completed' && (
        <div className="result-container">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default JobStatusPoller;