const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function ask(prompt) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 2048
  });
  return response.choices[0].message.content;
}

async function diffSummary(originalCode, changedCode) {
  return ask(
    `You are a senior software engineer. Summarize the following code changes in clear, concise bullet points. Focus on what was added, removed, and modified. Keep it brief and developer-friendly.\n\n--- Original Code ---\n${originalCode}\n\n--- Changed Code ---\n${changedCode}`
  );
}

async function reviewSuggestions(originalCode, changedCode) {
  return ask(
    `You are an expert code reviewer. Analyze the following code diff and provide actionable review suggestions. Cover: bugs, best practices, performance, readability, and maintainability. Format each suggestion with a severity (Critical / Warning / Info) and a short explanation.\n\n--- Original Code ---\n${originalCode}\n\n--- Changed Code ---\n${changedCode}`
  );
}

async function riskDetection(originalCode, changedCode) {
  return ask(
    `You are a security and reliability engineer. Analyze the following code changes and identify potential risks including: security vulnerabilities, breaking changes, race conditions, error handling gaps, data loss risks, and performance regressions. Rate each risk as High / Medium / Low. If no significant risks are found, say so.\n\n--- Original Code ---\n${originalCode}\n\n--- Changed Code ---\n${changedCode}`
  );
}

async function testCaseGeneration(changedCode) {
  return ask(
    `You are a test engineer. Generate comprehensive test cases for the following code. Include: unit tests, edge cases, and boundary conditions. Write the test cases as actual runnable code using a common testing framework (Jest/Mocha for JS, pytest for Python, etc — infer from the language). Include both positive and negative test cases.\n\n--- Code ---\n${changedCode}`
  );
}

async function codeExplanation(changedCode) {
  return ask(
    `You are a patient senior developer explaining code to a teammate. Explain what the following code does in plain English. Break it down section by section. Mention the purpose, logic flow, and any notable patterns or techniques used. Keep it clear and accessible.\n\n--- Code ---\n${changedCode}`
  );
}

module.exports = {
  diffSummary,
  reviewSuggestions,
  riskDetection,
  testCaseGeneration,
  codeExplanation
};
