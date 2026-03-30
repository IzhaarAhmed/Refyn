const BaseAnalyzer = require('./BaseAnalyzer');
const logger = require('../../utils/logger');

class ComplexityAnalyzer extends BaseAnalyzer {
  async analyze(originalCode, changedCode) {
    try {
      const originalMetrics = this.analyzeComplexity(originalCode);
      const changedMetrics = this.analyzeComplexity(changedCode);

      this.results.summary = {
        originalComplexity: originalMetrics.complexity,
        changedComplexity: changedMetrics.complexity,
        improvement: originalMetrics.complexity - changedMetrics.complexity,
        improved: changedMetrics.complexity < originalMetrics.complexity
      };

      this.results.metrics = {
        cyclomatic: changedMetrics.cyclomatic,
        cognitiveBurden: changedMetrics.cognitiveComplexity,
        nestingLevel: changedMetrics.maxNesting,
        functionCount: changedMetrics.functionCount
      };

      if (changedMetrics.complexity > originalMetrics.complexity) {
        this.addIssue('warning', 'Code complexity increased', 0);
      }

      if (changedMetrics.maxNesting > 4) {
        this.addSuggestion('Consider reducing nesting levels for better readability', 'high');
      }

      logger.info(`Complexity analysis completed for review ${this.reviewId}`);
      return this.results;
    } catch (error) {
      logger.error(`Complexity analysis failed for review ${this.reviewId}`, { error: error.message });
      throw error;
    }
  }

  analyzeComplexity(code) {
    const lines = code.split('\n');
    let complexity = 0;
    let cyclomatic = 1;
    let cognitiveComplexity = 0;
    let maxNesting = 0;
    let currentNesting = 0;

    for (const line of lines) {
      // Count control structures
      if (/\bif\b|\belse\b|\bswitch\b/.test(line)) cyclomatic++;
      if (/\bfor\b|\bwhile\b|\bdo\b/.test(line)) cyclomatic++;
      if (/\bcatch\b|\bfinally\b/.test(line)) cyclomatic++;
      if (/\bcase\b/.test(line)) cyclomatic++;

      // Count nesting
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      currentNesting += openBraces - closeBraces;
      maxNesting = Math.max(maxNesting, currentNesting);
    }

    complexity = cyclomatic + maxNesting * 0.5;
    cognitiveComplexity = cyclomatic + (maxNesting > 3 ? maxNesting - 2 : 0);

    return {
      complexity: Math.round(complexity * 10) / 10,
      cyclomatic,
      cognitiveComplexity,
      maxNesting,
      functionCount: this.parseCode(code).functions.length
    };
  }
}

module.exports = ComplexityAnalyzer;