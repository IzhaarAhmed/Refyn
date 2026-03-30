const logger = require('../../utils/logger');

class BaseAnalyzer {
  constructor(reviewId) {
    this.reviewId = reviewId;
    this.results = {
      summary: {},
      metrics: {},
      issues: [],
      suggestions: []
    };
  }

  async analyze(originalCode, changedCode) {
    throw new Error('analyze() must be implemented by subclass');
  }

  parseCode(code) {
    // Basic code parsing
    const lines = code.split('\n');
    return {
      lines,
      lineCount: lines.length,
      characters: code.length,
      functions: this.extractFunctions(code),
      comments: this.extractComments(code)
    };
  }

  extractFunctions(code) {
    const functionRegex = /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
    const matches = [];
    let match;
    while ((match = functionRegex.exec(code)) !== null) {
      matches.push(match[1] || match[2]);
    }
    return matches;
  }

  extractComments(code) {
    const commentRegex = /\/\/.*|\/\*[\s\S]*?\*\//g;
    const matches = code.match(commentRegex) || [];
    return matches;
  }

  addIssue(severity, message, line) {
    this.results.issues.push({
      severity,
      message,
      line,
      timestamp: new Date()
    });
  }

  addSuggestion(message, priority = 'medium') {
    this.results.suggestions.push({
      message,
      priority,
      timestamp: new Date()
    });
  }

  getResults() {
    return this.results;
  }
}

module.exports = BaseAnalyzer;