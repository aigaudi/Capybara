# Capybara - Smart Bookmark Sorter

Automatically sorts new bookmarks into folders based on their titles. This Chrome extension analyzes the title of a newly created bookmark, suggests a relevant folder name, and moves the bookmark into that folder. If a suitable folder already exists, it's reused; otherwise, a new folder is created.

## Building the Extension

The build process for this extension involves preparing the necessary files in a dedicated `dist/` directory. This ensures a clean package for distribution or loading into the browser.

The core files required are:
- `manifest.json`: The extension's manifest file.
- `background.js`: The background script containing the sorting logic.

**Build Steps:**

The build process is currently manual:
1. Create a directory named `dist`.
2. Copy `manifest.json` and `background.js` into the `dist/` directory.

(Note: If you proceed directly to the packaging step using the provided `zip` command, it can create the `dist` directory and copy files if they are in the root and `dist` doesn't exist, but for clarity and control, creating `dist` manually first is good practice.)

## Packaging the Extension

The extension is packaged as a ZIP file, which can then be uploaded to the Chrome Web Store or loaded directly into Chrome.

To create the `smart_bookmark_sorter.zip` file from the files prepared in the `dist/` directory, use the following command (assuming a Linux/macOS environment with `zip` installed):

```bash
(cd dist && zip ../smart_bookmark_sorter.zip manifest.json background.js)
```

Alternatively, if you want to zip files directly from the root into the archive (though using `dist` is cleaner):
```bash
zip -j smart_bookmark_sorter.zip manifest.json background.js
```
The `zip -j ...` command is useful if your files are not in `dist/` and you want them at the root of the zip. However, the recommended method is to prepare your files in `dist/` and use the `(cd dist && ...)` command.

The resulting `smart_bookmark_sorter.zip` file is what you'll use for distribution or loading into Chrome.

## Testing the Extension

This section covers how to test the Smart Bookmark Sorter extension, including automated unit tests and manual testing procedures.

### Automated Unit Tests

Unit tests are provided for the core logic functions within `background.js`. These tests help ensure that title processing, language detection, and folder name generation work as expected.

- **Test File:** `test_background.js`
- **Test Runner:** `test_runner.html`

**How to Run Automated Tests:**
1. Open the `test_runner.html` file in a web browser (e.g., Chrome, Firefox).
2. Test results will be displayed directly on the page.
3. Additional details and logs can be found in the browser's developer console (usually accessible by pressing F12).

### Manual Testing

This section provides instructions on how to manually test the "Smart Bookmark Sorter" Chrome extension.

#### How to Load the Extension for Testing:
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode" using the toggle switch (usually in the top right corner).
3. You have two options:
    a. **Load packaged extension (testing the .zip):** Drag and drop the `smart_bookmark_sorter.zip` file onto the `chrome://extensions` page.
    b. **Load unpacked extension (testing local changes before packaging):**
        i. Extract the `smart_bookmark_sorter.zip` to a directory, or if you want to test local modifications, use the `dist/` directory.
        ii. Click the "Load unpacked" button.
        iii. Select the directory containing `manifest.json` and `background.js` (e.g., `dist/` or the extracted folder).
4. The "Smart Bookmark Sorter" extension should now appear in your list of extensions.

#### How to Check for Errors:
1. On the `chrome://extensions` page, find the "Smart Bookmark Sorter" card.
2. If the extension was loaded unpacked, it might have a "Service worker" link directly on the card. Click this to open the DevTools for the background script.
3. If you loaded the .zip, or if the "Service worker" link isn't obvious, you might need to inspect its views if it had a popup (which this one doesn't). For background errors:
    a. Go to `chrome://serviceworker-internals/`.
    b. Find the entry for your extension (it will include its ID).
    c. Click "Inspect".
4. Check the "Console" tab in the DevTools window for any error messages or logs from the extension. The `background.js` script includes `console.log` statements that show its processing steps.

#### Test Scenarios:
- **English Titles:**
    - Create a bookmark with a simple English title (e.g., "My Favorite Recipes"). Verify it's moved to a folder like "my favorite recipes".
    - Create a bookmark with a title that includes common stop words (e.g., "A Guide to The Best Local Parks"). Verify it's moved to a folder like "guide best local" or "local parks".
    - Create a bookmark with a very short title (e.g., "Tech"). Verify it's moved to a "tech" folder.
- **Chinese Titles:**
    - Create a bookmark with a Chinese title (e.g., "你好世界"). Verify it's moved to a folder like "你好世界" or "你好".
- **Folder Creation and Re-use:**
    - Create a bookmark that should result in a new folder being created.
    - Create a second bookmark with a title that should resolve to the *same* folder name as the first. Verify it's moved into the existing folder, not a new one.
- **Special Characters:**
    - Create a bookmark with a title containing special characters (e.g., "My Notes: Chapter 1* (Draft)?"). Verify it's moved to a sanitized folder name (e.g., "my notes chapter 1 draft").
- **Generic Folder Names:**
    - Create a bookmark with a title that might result in a generic or empty folder name after processing (e.g., a title consisting only of stop words like "The Of A"). Verify the extension logs that it's skipping the move for such a generic name and the bookmark remains in its current location.
- **URL Specificity (Informal Check):**
    - While creating bookmarks, use different URLs to ensure the extension isn't keying off URLs but only titles.
