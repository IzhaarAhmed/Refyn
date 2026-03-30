const ComplexityAnalyzer = require('../services/analyzers/ComplexityAnalyzer');
const RefactoringAnalyzer = require('../services/analyzers/RefactoringAnalyzer');
const SecurityAnalyzer = require('../services/analyzers/SecurityAnalyzer');

describe('ComplexityAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new ComplexityAnalyzer('test-review');
  });

  test('should analyze code complexity', async () => {
    const originalCode = `
      function fibonacci(n) {
        if (n <= 1) return n;
        for (let i = 0; i < n; i++) {
          if (i % 2 === 0) {
            while (true) {
              break;
            }
          }
        }
        return n;
      }
    `;

    const changedCode = `
      function fibonacci(n) {
        return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
      }
    `;

    const results = await analyzer.analyze(originalCode, changedCode);

    expect(results).toBeDefined();
    expect(results.summary).toBeDefined();
    expect(results.summary.improvement).toBeGreaterThan(0);
    expect(results.suggestions.length).toBeGreaterThan(0);
  });

  test('should detect high nesting levels', async () => {
    const code = `
      function test() {
        if (true) {
          for (let i = 0; i < 10; i++) {
            while (true) {
              if (true) {
                console.log('deep');
              }
            }
          }
        }
      }
    `;

    const results = await analyzer.analyze(code, code);
    const suggestions = results.suggestions.filter(s => s.priority === 'high');

    expect(suggestions.length).toBeGreaterThan(0);
  });
});

describe('RefactoringAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new RefactoringAnalyzer('test-review');
  });

  test('should detect extracted methods', async () => {
    const originalCode = `
      function process() {
        const data = fetch();
        const result = transform(data);
        return save(result);
      }
    `;

    const changedCode = `
      function fetchData() {
        return fetch();
      }
      
      function transformData(data) {
        return transform(data);
      }
      
      function process() {
        const data = fetchData();
        const result = transformData(data);
        return save(result);
      }
    `;

    const results = await analyzer.analyze(originalCode, changedCode);

    expect(results.summary.patternsDetected).toBeGreaterThan(0);
    expect(results.metrics.extractedFunctions).toBeGreaterThan(0);
  });

  test('should detect code simplification', async () => {
    const originalCode = `
      function isValid(value) {
        if (value === null) {
          return false;
        }
        if (value === undefined) {
          return false;
        }
        if (value === '') {
          return false;
        }
        return true;
      }
    `;

    const changedCode = `
      function isValid(value) {
        return value !== null && value !== undefined && value !== '';
      }
    `;

    const results = await analyzer.analyze(originalCode, changedCode);

    expect(results.summary.refactoringType).toContain('simplification');
  });
});

describe('SecurityAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new SecurityAnalyzer('test-review');
  });

  test('should detect potential SQL injection', async () => {
    const code = `
      const query = 'SELECT * FROM users WHERE id = ' + userId;
      db.query(query);
    `;

    const results = await analyzer.analyze(code, code);

    const sqlIssues = results.issues.filter(i => i.severity === 'critical');
    expect(sqlIssues.length).toBeGreaterThan(0);
  });

  test('should detect XSS vulnerabilities', async () => {
    const code = `
      const html = '<div>' + userInput + '</div>';
      element.innerHTML = html;
    `;

    const results = await analyzer.analyze(code, code);

    const xssIssues = results.issues.filter(i => i.severity === 'high');
    expect(xssIssues.length).toBeGreaterThan(0);
  });

  test('should detect hardcoded secrets', async () => {
    const code = `
      const apiKey = "sk-1234567890";
      const token = "ghp_abc123";
    `;

    const results = await analyzer.analyze(code, code);

    expect(results.summary.vulnerabilitiesFound).toBeGreaterThan(0);
  });

  test('should calculate security score', async () => {
    const safeCode = `
      const query = parametrizedQuery('SELECT * FROM users WHERE id = ?', [userId]);
      db.query(query);
    `;

    const results = await analyzer.analyze(safeCode, safeCode);

    expect(results.summary.securityScore).toBeGreaterThan(50);
  });
});
