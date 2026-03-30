# Code Analyzers Documentation

## Overview

The code review application includes three specialized analyzers that work together to provide comprehensive code quality assessment.

## ComplexityAnalyzer

### Purpose
Measures and analyzes code complexity to identify maintainability issues.

### Metrics

**Cyclomatic Complexity**
- Counts decision points (if, else, switch, loops, catch)
- Higher values indicate more complex control flow
- Generally, values > 10 are considered problematic

**Cognitive Complexity**
- Measures how hard code is to understand
- Adds extra weight to nested structures
- More aligned with human cognitive load

**Maximum Nesting Level**
- Tracks the deepest nesting in the code
- Nesting > 4 levels usually degrades readability

**Function Count**
- Simple metric of code modularity
- More functions can indicate better separation of concerns

### Usage

```javascript
const ComplexityAnalyzer = require('./services/analyzers/ComplexityAnalyzer');

const analyzer = new ComplexityAnalyzer(reviewId);
const results = await analyzer.analyze(originalCode, changedCode);

// Results contain:
// - summary: {originalComplexity, changedComplexity, improvement, improved}
// - metrics: {cyclomatic, cognitiveBurden, nestingLevel, functionCount}
// - issues: List of detected issues
// - suggestions: Actionable recommendations
```

### Example Output

```json
{
  "summary": {
    "originalComplexity": 12.5,
    "changedComplexity": 8.3,
    "improvement": 4.2,
    "improved": true
  },
  "metrics": {
    "cyclomatic": 6,
    "cognitiveBurden": 8,
    "nestingLevel": 3,
    "functionCount": 5
  },
  "issues": [
    {
      "severity": "warning",
      "message": "Code complexity increased",
      "line": 0
    }
  ],
  "suggestions": [
    {
      "message": "Consider reducing nesting levels for better readability",
      "priority": "high"
    }
  ]
}
```

## RefactoringAnalyzer

### Purpose
Detects refactoring patterns and evaluates code improvement strategies.

### Pattern Detection

**Extract Method**
- Detects newly extracted functions
- Indicates better code organization
- Evaluated as positive refactoring

**Variable Renaming**
- Tracks renamed variables for clarity
- Important for code maintainability
- Flags confusing naming patterns

**Code Simplification**
- Detects when code is made shorter/cleaner
- Looks for elimination of duplicate logic
- Measures reduction in complexity

**Loop Consolidation**
- Identifies when multiple loops are combined
- Improves performance and readability

### Refactoring Classifications

- **extract_method**: Decomposing large functions
- **simplification**: Making code cleaner
- **optimization**: Performance improvements
- **general_refactoring**: Other refactoring patterns

### Usage

```javascript
const RefactoringAnalyzer = require('./services/analyzers/RefactoringAnalyzer');

const analyzer = new RefactoringAnalyzer(reviewId);
const results = await analyzer.analyze(originalCode, changedCode);

// Results contain:
// - summary: {patternsDetected, refactoringType, quality}
// - metrics: {extractedFunctions, renamedVariables, simplifications, optimizations}
```

### Quality Rating

- Score from 0 to 1.0
- Based on number of beneficial patterns
- More patterns = higher quality refactoring

## SecurityAnalyzer

### Purpose
Identifies security vulnerabilities and risks in code.

### Vulnerability Types

**SQL Injection**
- Detects string concatenation in database queries
- Identifies lack of parameterized queries
- Severity: CRITICAL

**XSS (Cross-Site Scripting)**
- Flags innerHTML, dangerouslySetInnerHTML usage
- Warns about eval() usage
- Severity: HIGH

**Data Exposure**
- Identifies hardcoded secrets and API keys
- Detects passwords in source code
- Severity: CRITICAL

**Authentication Issues**
- Detects APIs without authentication middleware
- Warns about missing security checks
- Severity: HIGH

**Path Traversal**
- Identifies unsafe file operations
- Warns about missing path validation
- Severity: HIGH

### Security Score

- Calculated as percentage (0-100)
- Deductions for critical and high issues
- Critical issues: -20 points each
- High issues: -10 points each

### Usage

```javascript
const SecurityAnalyzer = require('./services/analyzers/SecurityAnalyzer');

const analyzer = new SecurityAnalyzer(reviewId);
const results = await analyzer.analyze(originalCode, changedCode);

// Results contain:
// - summary: {vulnerabilitiesFound, criticalIssues, securityScore}
// - metrics: {sqlInjectionRisks, xssRisks, authenticationIssues, dataExposure}
// - issues: List of detected vulnerabilities
```

### Example Output

```json
{
  "summary": {
    "vulnerabilitiesFound": 2,
    "criticalIssues": 1,
    "securityScore": 80
  },
  "metrics": {
    "sqlInjectionRisks": 1,
    "xssRisks": 0,
    "authenticationIssues": 1,
    "dataExposure": 0
  },
  "issues": [
    {
      "severity": "critical",
      "message": "Potential SQL injection vulnerability detected",
      "line": 15
    }
  ]
}
```

## Analyzer Base Class

All analyzers extend `BaseAnalyzer` which provides:

```javascript
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
    // Override in subclasses
  }

  addIssue(severity, message, line) {
    // Helper to add issues
  }

  addSuggestion(message, priority) {
    // Helper to add suggestions
  }

  getResults() {
    return this.results;
  }
}
```

## Best Practices

### Running Analyzers

1. **Sequential vs Parallel**
   ```javascript
   // Sequential (safer for resource-limited envs)
   const complexity = await complexityAnalyzer.analyze(orig, changed);
   const refactoring = await refactoringAnalyzer.analyze(orig, changed);
   const security = await securityAnalyzer.analyze(orig, changed);

   // Parallel (faster)
   const [complexity, refactoring, security] = await Promise.all([
     complexityAnalyzer.analyze(orig, changed),
     refactoringAnalyzer.analyze(orig, changed),
     securityAnalyzer.analyze(orig, changed)
   ]);
   ```

2. **Error Handling**
   ```javascript
   try {
     const results = await analyzer.analyze(originalCode, changedCode);
   } catch (error) {
     logger.error('Analysis failed', { error: error.message });
     // Fallback or user notification
   }
   ```

3. **Result Aggregation**
   ```javascript
   const overallScore = calculateScore({
     complexity: results.complexity.improvement,
     refactoring: results.refactoring.quality,
     security: results.security.securityScore
   });
   ```

## Extending Analyzers

Create custom analyzers by extending BaseAnalyzer:

```javascript
class CustomAnalyzer extends BaseAnalyzer {
  async analyze(originalCode, changedCode) {
    // Custom logic
    const patterns = this.detectPatterns(originalCode, changedCode);
    
    this.results.summary = { /* ... */ };
    this.results.metrics = { /* ... */ };
    
    patterns.forEach(pattern => {
      if (pattern.isBad) {
        this.addIssue('warning', pattern.message, pattern.line);
      } else {
        this.addSuggestion(pattern.message, 'medium');
      }
    });
    
    return this.results;
  }

  detectPatterns(originalCode, changedCode) {
    // Custom pattern detection logic
  }
}
```

## Performance Considerations

- **Large files**: Analyzers scale O(n) with code size
- **Complex code**: Security analyzer slower on nested structures
- **Caching**: Results cached in AnalysisResult model
- **Async execution**: Run analyzers in background jobs