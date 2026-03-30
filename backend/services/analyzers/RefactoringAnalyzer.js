const BaseAnalyzer = require('./BaseAnalyzer');
const logger = require('../../utils/logger');

class RefactoringAnalyzer extends BaseAnalyzer {
  async analyze(originalCode, changedCode) {
    try {
      const patterns = this.detectPatterns(originalCode, changedCode);

      this.results.summary = {
        patternsDetected: patterns.length,
        refactoringType: this.classifyRefactoring(patterns),
        quality: this.rateQuality(patterns)
      };

      this.results.metrics = {
        extractedFunctions: patterns.filter(p => p.type === 'extract_method').length,
        renamedVariables: patterns.filter(p => p.type === 'rename').length,
        simplifications: patterns.filter(p => p.type === 'simplification').length,
        optimizations: patterns.filter(p => p.type === 'optimization').length
      };

      patterns.forEach(pattern => {
        if (pattern.severity === 'warning') {
          this.addIssue('info', pattern.description, pattern.line);
        } else {
          this.addSuggestion(pattern.description, 'medium');
        }
      });

      logger.info(`Refactoring analysis completed for review ${this.reviewId}`, {
        patternsDetected: patterns.length
      });

      return this.results;
    } catch (error) {
      logger.error(`Refactoring analysis failed for review ${this.reviewId}`, { error: error.message });
      throw error;
    }
  }

  detectPatterns(originalCode, changedCode) {
    const patterns = [];

    // Detect extracted methods
    const originalFunctions = this.parseCode(originalCode).functions;
    const changedFunctions = this.parseCode(changedCode).functions;

    if (changedFunctions.length > originalFunctions.length) {
      patterns.push({
        type: 'extract_method',
        description: `Extracted ${changedFunctions.length - originalFunctions.length} function(s)`,
        severity: 'info',
        line: 0
      });
    }

    // Detect code consolidation
    if (changedCode.length < originalCode.length * 0.8) {
      patterns.push({
        type: 'simplification',
        description: 'Code significantly simplified (20% shorter)',
        severity: 'info',
        line: 0
      });
    }

    // Detect variable renames
    const originalVars = this.extractVariables(originalCode);
    const changedVars = this.extractVariables(changedCode);
    const renamedCount = this.detectRenames(originalVars, changedVars);

    if (renamedCount > 0) {
      patterns.push({
        type: 'rename',
        description: `Renamed ${renamedCount} variable(s) for clarity`,
        severity: 'info',
        line: 0
      });
    }

    // Detect loop consolidation
    const originalLoops = (originalCode.match(/\bfor\b|\bwhile\b/g) || []).length;
    const changedLoops = (changedCode.match(/\bfor\b|\bwhile\b/g) || []).length;

    if (changedLoops < originalLoops) {
      patterns.push({
        type: 'optimization',
        description: `Consolidated ${originalLoops - changedLoops} loop(s)`,
        severity: 'info',
        line: 0
      });
    }

    return patterns;
  }

  extractVariables(code) {
    const varRegex = /(?:const|let|var)\s+(\w+)/g;
    const matches = [];
    let match;
    while ((match = varRegex.exec(code)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  detectRenames(originalVars, changedVars) {
    // Simple heuristic: if variable count is similar and different names, likely renames
    if (Math.abs(originalVars.length - changedVars.length) <= 1) {
      const newVars = changedVars.filter(v => !originalVars.includes(v)).length;
      return Math.min(newVars, originalVars.length);
    }
    return 0;
  }

  classifyRefactoring(patterns) {
    const types = patterns.map(p => p.type);
    if (types.includes('extract_method')) return 'extract_method';
    if (types.includes('simplification')) return 'simplification';
    if (types.includes('optimization')) return 'optimization';
    return 'general_refactoring';
  }

  rateQuality(patterns) {
    // Higher number of beneficial patterns = higher quality
    return Math.min(patterns.length / 3, 1.0); // Max rating 1.0
  }
}

module.exports = RefactoringAnalyzer;