// Unit tests for background.js

// Helper function for asserting equality
function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`PASS: ${testName}`);
    return true;
  } else {
    console.error(`FAIL: ${testName}. Expected "${expected}", but got "${actual}"`);
    return false;
  }
}

// --- Tests for detectLanguage(title) ---
console.log('--- Testing detectLanguage ---');
let passedDetectLanguage = 0;
let failedDetectLanguage = 0;

function runDetectLanguageTest(title, expected, testName) {
  if (assertEqual(detectLanguage(title), expected, testName)) {
    passedDetectLanguage++;
  } else {
    failedDetectLanguage++;
  }
}

runDetectLanguageTest("Hello World", "en", "English title");
runDetectLanguageTest("你好世界", "zh", "Chinese title");
runDetectLanguageTest("Hello 你好世界 World", "en", "Mixed English and Chinese title (EN dominant)");
runDetectLanguageTest("你好 Hello 世界 World", "zh", "Mixed Chinese and English title (ZH dominant)");
runDetectLanguageTest("", "en", "Empty title");
runDetectLanguageTest("123 !@#", "en", "Title with only numbers or symbols");
runDetectLanguageTest("这是一个中文标题", "zh", "Another Chinese title");
runDetectLanguageTest("これは日本語のタイトルです", "ja", "Japanese title");


// --- Tests for normalizeTitle(title) ---
console.log('\n--- Testing normalizeTitle ---');
let passedNormalizeTitle = 0;
let failedNormalizeTitle = 0;

function runNormalizeTitleTest(title, expected, testName) {
  if (assertEqual(normalizeTitle(title), expected, testName)) {
    passedNormalizeTitle++;
  } else {
    failedNormalizeTitle++;
  }
}

runNormalizeTitleTest("Hello World", "hello world", "Uppercase and lowercase letters");
runNormalizeTitleTest("Title with !@#$ characters", "title with    characters", "Title with special characters");
runNormalizeTitleTest("  Leading and trailing spaces  ", "leading and trailing spaces", "Title with leading/trailing spaces");
runNormalizeTitleTest("Multiple   spaces   between   words", "multiple spaces between words", "Title with multiple spaces between words");
runNormalizeTitleTest("", "", "Empty title for normalization");
runNormalizeTitleTest("A Title with Stop Words Like 'A' and 'The'", "a title with stop words like a and the", "Title with stopwords (normalization only)");


// --- Tests for generateFolderNameCandidates(processedTitle, lang) ---
console.log('\n--- Testing generateFolderNameCandidates ---');
let passedGenerateFolderName = 0;
let failedGenerateFolderName = 0;

function runGenerateFolderNameTest(processedTitle, lang, expected, testName) {
  const actual = JSON.stringify(generateFolderNameCandidates(processedTitle, lang));
  const expectedStr = JSON.stringify(expected);
  if (actual === expectedStr) {
    console.log(`PASS: ${testName}`);
    passedGenerateFolderName++;
  } else {
    console.error(`FAIL: ${testName}. Expected ${expectedStr}, but got ${actual}`);
    failedGenerateFolderName++;
  }
}

runGenerateFolderNameTest("a complete guide to javascript", "en", ["javascript", "guide", "complete guide", "complete", "a complete guide to javascript"], "English title: 'a complete guide to javascript'");
runGenerateFolderNameTest("react", "en", ["react"], "Short English title: 'react'");
runGenerateFolderNameTest("你好世界", "zh", ["你好世界"], "Chinese title: '你好世界'");
runGenerateFolderNameTest("", "en", [], "Empty processed title for candidates");
runGenerateFolderNameTest("a an the of to in on with for by guide to react", "en", ["react", "guide", "guide to react", "a an the of to in on with for by guide to react"], "English title with many stop words");
runGenerateFolderNameTest("the quick brown fox", "en", ["fox", "brown", "quick", "quick brown", "the quick brown fox"], "Another English title for candidates");


// --- Tests for selectBestCandidate(candidates, lang) ---
console.log('\n--- Testing selectBestCandidate ---');
let passedSelectBestCandidate = 0;
let failedSelectBestCandidate = 0;

function runSelectBestCandidateTest(candidates, lang, expected, testName) {
  if (assertEqual(selectBestCandidate(candidates, lang), expected, testName)) {
    passedSelectBestCandidate++;
  } else {
    failedSelectBestCandidate++;
  }
}

runSelectBestCandidateTest(["javascript", "guide", "complete guide", "complete", "a complete guide to javascript"], "en", "javascript", "English candidates - select 'javascript'");
runSelectBestCandidateTest(["你好世界", "你好"], "zh", "你好世界", "Chinese candidates - select '你好世界'");
runSelectBestCandidateTest([], "en", "", "Empty list of candidates");
runSelectBestCandidateTest(["short", "a much longer candidate phrase", "medium length"], "en", "medium length", "English candidates of varying lengths - prefer medium length");
runSelectBestCandidateTest(["data science", "machine learning", "artificial intelligence"], "en", "data science", "English candidates - prefer 'data science' (shorter, more specific)");
runSelectBestCandidateTest(["ai", "ml", "nlp"], "en", "ai", "Short English acronyms");


// --- Tests for sanitizeFolderName(folderName) ---
console.log('\n--- Testing sanitizeFolderName ---');
let passedSanitizeFolderName = 0;
let failedSanitizeFolderName = 0;

function runSanitizeFolderNameTest(folderName, expected, testName) {
  if (assertEqual(sanitizeFolderName(folderName), expected, testName)) {
    passedSanitizeFolderName++;
  } else {
    failedSanitizeFolderName++;
  }
}

runSanitizeFolderNameTest("My Folder: Chapter 1*", "My Folder Chapter 1", "Folder name with invalid characters");
runSanitizeFolderNameTest("AlreadySanitized", "AlreadySanitized", "Folder name that is already sanitized");
runSanitizeFolderNameTest("", "", "Empty folder name for sanitization");
runSanitizeFolderNameTest(":*?", "", "Folder name that becomes empty after sanitization");
runSanitizeFolderNameTest("  Folder with spaces  ", "Folder with spaces", "Folder name with leading/trailing spaces before sanitization");
runSanitizeFolderNameTest("Folder / With / Slashes", "Folder With Slashes", "Folder name with slashes");


// --- Summary ---
function logSummary() {
  const totalPassed = passedDetectLanguage + passedNormalizeTitle + passedGenerateFolderName + passedSelectBestCandidate + passedSanitizeFolderName;
  const totalFailed = failedDetectLanguage + failedNormalizeTitle + failedGenerateFolderName + failedSelectBestCandidate + failedSanitizeFolderName;
  const totalTests = totalPassed + totalFailed;

  console.log(`\n--- Test Summary ---`);
  console.log(`detectLanguage: ${passedDetectLanguage} passed, ${failedDetectLanguage} failed.`);
  console.log(`normalizeTitle: ${passedNormalizeTitle} passed, ${failedNormalizeTitle} failed.`);
  console.log(`generateFolderNameCandidates: ${passedGenerateFolderName} passed, ${failedGenerateFolderName} failed.`);
  console.log(`selectBestCandidate: ${passedSelectBestCandidate} passed, ${failedSelectBestCandidate} failed.`);
  console.log(`sanitizeFolderName: ${passedSanitizeFolderName} passed, ${failedSanitizeFolderName} failed.`);
  console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed out of ${totalTests} tests.`);

  // Output to HTML Body (if running in a browser context)
  if (typeof document !== 'undefined' && document.body) {
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = `
      <h2>Test Summary</h2>
      <p>detectLanguage: ${passedDetectLanguage} passed, ${failedDetectLanguage} failed.</p>
      <p>normalizeTitle: ${passedNormalizeTitle} passed, ${failedNormalizeTitle} failed.</p>
      <p>generateFolderNameCandidates: ${passedGenerateFolderName} passed, ${failedGenerateFolderName} failed.</p>
      <p>selectBestCandidate: ${passedSelectBestCandidate} passed, ${failedSelectBestCandidate} failed.</p>
      <p>sanitizeFolderName: ${passedSanitizeFolderName} passed, ${failedSanitizeFolderName} failed.</p>
      <h3>Total: ${totalPassed} passed, ${totalFailed} failed out of ${totalTests} tests.</h3>
    `;
    document.body.appendChild(summaryDiv);
  }
}

// The test_runner.html will be responsible for calling logSummary
// to ensure the HTML summary is correctly displayed.
