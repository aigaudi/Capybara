'use strict';

// Predefined list of English stop words
const ENGLISH_STOP_WORDS = ["a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "should", "can", "could", "may", "might", "must", "to", "for", "of", "in", "on", "at", "by", "from", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "out", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "just", "don", "shouldv", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren", "won", "wouldn", "guide", "tutorial", "introduction", "overview", "beginner", "advanced", "complete", "ultimate", "best", "top", "latest", "news", "article", "post", "blog", "page", "website", "official", "site"];

/**
 * Detects if the title contains Chinese characters.
 * @param {string} title The bookmark title.
 * @return {string} "zh" if Chinese characters are detected, otherwise "en".
 */
function detectLanguage(title) {
  if (!title) return "en"; // Default to English if title is empty
  // Basic check for common Chinese Unicode character ranges
  if (/[\u4E00-\u9FFF]/.test(title)) {
    return "zh";
  }
  return "en";
}

/**
 * Converts title to lowercase and removes special characters.
 * Allows alphanumeric, spaces, and hyphens.
 * @param {string} title The original bookmark title.
 * @return {string} The normalized title.
 */
function normalizeTitle(title) {
  if (!title) return "";
  return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Generates potential folder name candidates from a processed title.
 * @param {string} processedTitle The title processed by normalizeTitle.
 * @param {string} lang The language of the title ("en" or "zh").
 * @return {string[]} An array of potential folder name candidates.
 */
function generateFolderNameCandidates(processedTitle, lang) {
  if (!processedTitle) return [];
  const candidates = [];

  if (lang === "en") {
    const words = processedTitle.split(' ').filter(word => !ENGLISH_STOP_WORDS.includes(word) && word.length > 0);
    if (words.length > 0) {
      if (words.length >= 3) {
        candidates.push(words.slice(0, 3).join(' '));
      }
      if (words.length >= 2) {
        candidates.push(words.slice(0, 2).join(' '));
      }
      candidates.push(words[0]);

      if (words.length >= 3) {
        candidates.push(words.slice(-3).join(' '));
      }
      if (words.length >= 2) {
        candidates.push(words.slice(-2).join(' '));
      }
      if (words.length > 1 && words.length !== 2 && words.length !==3) { // Avoid duplicating single word if already added
          candidates.push(words[words.length - 1]);
      }
    }
  } else if (lang === "zh") {
    // Placeholder for Chinese: Extract first 1, 2, 3, and 4 characters
    for (let i = 1; i <= 4; i++) {
      if (processedTitle.length >= i) {
        candidates.push(processedTitle.substring(0, i).trim());
      }
    }
  }
  return [...new Set(candidates)].filter(c => c.length > 0); // Unique and non-empty
}

/**
 * Selects the best folder name candidate.
 * @param {string[]} candidates An array of folder name candidates.
 * @param {string} lang The language of the title ("en" or "zh").
 * @return {string} The selected folder name or a default.
 */
function selectBestCandidate(candidates, lang) {
  if (!candidates || candidates.length === 0) return "Unsorted Bookmarks";

  if (lang === "en") {
    for (const candidate of candidates) {
      if (candidate.split(' ').length <= 3) {
        return candidate;
      }
    }
  } else if (lang === "zh") {
    for (const candidate of candidates) {
      if (candidate.length <= 4) {
        return candidate;
      }
    }
  }
  return candidates[0] || "Unsorted Bookmarks"; // Fallback to the first candidate or default
}

/**
 * Sanitizes a folder name by removing or replacing invalid characters.
 * @param {string} folderName The proposed folder name.
 * @return {string} A sanitized folder name.
 */
function sanitizeFolderName(folderName) {
  if (!folderName) return "Sanitized Folder";
  // Remove characters invalid for Chrome bookmark folder names
  // Invalid chars: / \ : * ? " < > |
  let sanitized = folderName.replace(/[\/\\:\*\?\"<>\|]/g, ' ').replace(/\s+/g, ' ').trim();
  if (sanitized.length === 0) {
    return "Sanitized Folder";
  }
  return sanitized;
}

// Event listener for new bookmark creation
chrome.bookmarks.onCreated.addListener((bookmarkId, bookmark) => {
  console.log("New bookmark created:");
  console.log("  ID: " + bookmarkId);
  console.log("  Original Title: " + bookmark.title);
  console.log("  URL: " + bookmark.url);

  const lang = detectLanguage(bookmark.title);
  console.log("  Detected Language: " + lang);

  const normalizedTitle = normalizeTitle(bookmark.title);
  console.log("  Normalized Title: " + normalizedTitle);

  const candidates = generateFolderNameCandidates(normalizedTitle, lang);
  console.log("  Folder Name Candidates: ", candidates);

  const bestCandidate = selectBestCandidate(candidates, lang);
  console.log("  Best Candidate: " + bestCandidate);

  const finalFolderName = sanitizeFolderName(bestCandidate);
  console.log("  Final Sanitized Folder Name: " + finalFolderName);

  if (finalFolderName === "Unsorted Bookmarks" || finalFolderName === "Sanitized Folder") {
    console.log(`  Skipping move for generic folder name: "${finalFolderName}". Bookmark will remain in its current location.`);
    return;
  }

  chrome.bookmarks.search({ title: finalFolderName }, (results) => {
    if (chrome.runtime.lastError) {
      console.error(`Error searching for folder "${finalFolderName}":`, chrome.runtime.lastError.message);
      return;
    }

    let existingFolder = null;
    if (results && results.length > 0) {
      for (const node of results) {
        // Ensure it's a folder (no URL or empty URL) and the title matches exactly.
        if ((!node.url || node.url === "") && node.title === finalFolderName) {
          existingFolder = node;
          break;
        }
      }
    }

    if (existingFolder) {
      console.log(`  Found existing folder "${finalFolderName}" with ID: ${existingFolder.id}.`);
      chrome.bookmarks.move(bookmarkId, { parentId: existingFolder.id }, (movedBookmark) => {
        if (chrome.runtime.lastError) {
          console.error(`Error moving bookmark to existing folder "${finalFolderName}":`, chrome.runtime.lastError.message);
          return;
        }
        console.log(`  Bookmark "${movedBookmark.title}" moved to folder "${finalFolderName}". New bookmark ID: ${movedBookmark.id}.`);
      });
    } else {
      console.log(`  Folder "${finalFolderName}" not found. Creating new folder.`);
      // Create folder. By default, it's created in the "Bookmarks Bar" if parentId is not specified.
      // To place it in "Other Bookmarks", its ID '2' could be used, but this might vary or not exist.
      // Defaulting to the main bookmarks area (usually Bookmarks Bar) is safer.
      chrome.bookmarks.create({ title: finalFolderName }, (newFolder) => {
        if (chrome.runtime.lastError) {
          console.error(`Error creating new folder "${finalFolderName}":`, chrome.runtime.lastError.message);
          return;
        }
        console.log(`  New folder "${newFolder.title}" created with ID: ${newFolder.id}.`);
        chrome.bookmarks.move(bookmarkId, { parentId: newFolder.id }, (movedBookmark) => {
          if (chrome.runtime.lastError) {
            console.error(`Error moving bookmark to new folder "${newFolder.title}":`, chrome.runtime.lastError.message);
            // Attempt to remove the newly created empty folder if moving the bookmark fails
            chrome.bookmarks.removeTree(newFolder.id, () => {
              if (chrome.runtime.lastError) {
                console.error(`Error removing newly created folder ${newFolder.id} after move failed:`, chrome.runtime.lastError.message);
              } else {
                console.log(`  Successfully removed empty folder "${newFolder.title}" after move failure.`);
              }
            });
            return;
          }
          console.log(`  Bookmark "${movedBookmark.title}" moved to new folder "${newFolder.title}". New bookmark ID: ${movedBookmark.id}.`);
        });
      });
    }
  });
});
