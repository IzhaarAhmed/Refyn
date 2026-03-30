const BaseAnalyzer = require('./BaseAnalyzer');
const logger = require('../../utils/logger');

class SecurityAnalyzer extends BaseAnalyzer {
  async analyze(originalCode, changedCode) {
    try {
      const vulnerabilities = this.detectVulnerabilities(changedCode);

      this.results.summary = {
        vulnerabilitiesFound: vulnerabilities.length,
        criticalIssues: vulnerabilities.filter(v => v.severity === 'critical').length,
        securityScore: this.calculateSecurityScore(vulnerabilities)
      };

      this.results.metrics = {
        sqlInjectionRisks: vulnerabilities.filter(v => v.type === 'sql_injection').length,
        xssRisks: vulnerabilities.filter(v => v.type === 'xss').length,
        authenticationIssues: vulnerabilities.filter(v => v.type === 'authentication').length,
        dataExposure: vulnerabilities.filter(v => v.type === 'data_exposure').length
      };

      vulnerabilities.forEach(vuln => {
        this.addIssue(vuln.severity, vuln.message, vuln.line);
      });

      logger.info(`Security analysis completed for review ${this.reviewId}`, {
        vulnerabilitiesFound: vulnerabilities.length
      });

      return this.results;
    } catch (error) {
      logger.error(`Security analysis failed for review ${this.reviewId}`, { error: error.message });
      throw error;
    }
  }

  detectVulnerabilities(code) {
    const vulnerabilities = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for SQL injection patterns
      if (/query\s*\(\s*['"`].*\$\{|query\s*\(\s*['"`].*\+/i.test(line)) {
        vulnerabilities.push({
          type: 'sql_injection',
          severity: 'critical',
          message: 'Potential SQL injection vulnerability detected',
          line: index + 1
        });
      }

      // Check for XSS vulnerabilities
      if (/innerHTML|dangerouslySetInnerHTML|eval\s*\(/i.test(line)) {
        vulnerabilities.push({
          type: 'xss',
          severity: 'high',
          message: 'Potential XSS vulnerability - avoid innerHTML and eval',
          line: index + 1
        });
      }

      // Check for hardcoded secrets
      if (/password\s*=|secret\s*=|api[_-]?key\s*=|token\s*=/i.test(line)) {
        if (!/process\.env|process\.env\[/i.test(line)) {
          vulnerabilities.push({
            type: 'data_exposure',
            severity: 'critical',
            message: 'Potential hardcoded secret detected',
            line: index + 1
          });
        }
      }

      // Check for missing authentication
      if (/app\.(get|post|put|delete)\s*\(\s*['"]\/api/i.test(line)) {
        if (!this.hasAuthMiddleware(code, index)) {
          vulnerabilities.push({
            type: 'authentication',
            severity: 'high',
            message: 'API endpoint may lack authentication middleware',
            line: index + 1
          });
        }
      }

      // Check for unsafe file operations
      if (/fs\.(readFile|writeFile|unlink)\s*\(/i.test(line)) {
        if (!/path\.join|path\.resolve/.test(line)) {
          vulnerabilities.push({
            type: 'path_traversal',
            severity: 'high',
            message: 'Potential path traversal vulnerability in file operation',
            line: index + 1
          });
        }
      }
    });

    return vulnerabilities;
  }

  hasAuthMiddleware(code, lineIndex) {
    const context = code.split('\n').slice(Math.max(0, lineIndex - 5), lineIndex + 1).join('\n');
    return /auth|middleware/.test(context);
  }

  calculateSecurityScore(vulnerabilities) {
    const criiticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;

    let score = 100;
    score -= criiticalCount * 20;
    score -= highCount * 10;

    return Math.max(0, score);
  }
}

module.exports = SecurityAnalyzer;