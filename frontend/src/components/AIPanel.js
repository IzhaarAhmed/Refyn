import React, { useState } from 'react';
import api from '../api';
import './AIPanel.css';

const AI_FEATURES = [
  { key: 'diff-summary', label: 'Diff Summary', icon: '\u2261', endpoint: 'diff-summary' },
  { key: 'review-suggestions', label: 'Review Suggestions', icon: '\uD83D\uDCA1', endpoint: 'review-suggestions' },
  { key: 'risk-detection', label: 'Risk Detection', icon: '\u26A0', endpoint: 'risk-detection' },
  { key: 'test-generation', label: 'Test Cases', icon: '\u2713', endpoint: 'test-generation' },
  { key: 'code-explanation', label: 'Code Explanation', icon: '?', endpoint: 'code-explanation' },
];

function formatMarkdown(text) {
  // Bold
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  // Code blocks
  html = html.replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr/>');
  // Line breaks
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function AIPanel({ reviewId }) {
  const [activeTab, setActiveTab] = useState('diff-summary');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const handleGenerate = async () => {
    const feature = AI_FEATURES.find(f => f.key === activeTab);
    if (!feature) return;

    setLoading(prev => ({ ...prev, [activeTab]: true }));
    setErrors(prev => ({ ...prev, [activeTab]: null }));

    try {
      const res = await api.post(`/api/ai/${reviewId}/${feature.endpoint}`);
      setResults(prev => ({ ...prev, [activeTab]: res.data.result }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [activeTab]: err.response?.data?.error || 'AI generation failed' }));
    } finally {
      setLoading(prev => ({ ...prev, [activeTab]: false }));
    }
  };

  const currentResult = results[activeTab];
  const currentLoading = loading[activeTab];
  const currentError = errors[activeTab];

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <span className="ai-panel__spark">{'\u2728'}</span>
        <h3>AI Assistant</h3>
      </div>

      <div className="ai-panel__tabs">
        {AI_FEATURES.map(f => (
          <button
            key={f.key}
            className={`ai-panel__tab ${activeTab === f.key ? 'ai-panel__tab--active' : ''}`}
            onClick={() => setActiveTab(f.key)}
          >
            <span className="ai-panel__tab-icon">{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      <div className="ai-panel__body">
        {currentLoading ? (
          <div className="ai-panel__loading">
            <div className="ai-panel__loading-spinner" />
            <p>Analyzing code with AI...</p>
          </div>
        ) : currentError ? (
          <div className="ai-panel__error">
            <span>{'\u26A0'}</span>
            <span>{currentError}</span>
          </div>
        ) : currentResult ? (
          <div
            className="ai-panel__result"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(currentResult) }}
          />
        ) : (
          <div className="ai-panel__generate">
            <p>Click generate to analyze this review with AI</p>
            <button className="ai-panel__generate-btn" onClick={handleGenerate} disabled={currentLoading}>
              <span>{'\u2728'}</span>
              Generate {AI_FEATURES.find(f => f.key === activeTab)?.label}
            </button>
          </div>
        )}

        {currentResult && !currentLoading && (
          <div style={{ marginTop: 'var(--space-4)', textAlign: 'right' }}>
            <button className="ai-panel__generate-btn" onClick={handleGenerate} style={{ fontSize: 'var(--font-size-xs)' }}>
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIPanel;
