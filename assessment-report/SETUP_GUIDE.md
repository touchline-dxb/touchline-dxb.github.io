# Setup Guide — TSA Player Assessment System

## Files Delivered

| File | Purpose |
|---|---|
| `index.html` | Player assessment form (used by coaches) |
| `progress-report.html` | Progress comparison viewer (Initial → 3M → 6M) |
| `Code.gs` | Google Apps Script backend |

---

## Step 1 — Create Your Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new blank spreadsheet**.
2. Name it: `TSA Player Assessments`
3. Copy the **Sheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

---

## Step 2 — Create a Google Drive Folder for Videos

1. Go to [drive.google.com](https://drive.google.com).
2. Create a new folder: `TSA Assessment Videos`
3. Open the folder and copy its **Folder ID** from the URL:  
   `https://drive.google.com/drive/folders/`**`THIS_PART`**

---

## Step 3 — Set Up Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**.
2. Delete any existing code in `Code.gs`.
3. Paste the entire contents of the provided `Code.gs` file.
4. At the top of the file, fill in your values:

```javascript
const CONFIG = {
  SHEET_ID:     'paste-your-sheet-id-here',
  FOLDER_ID:    'paste-your-folder-id-here',
  SHEET_NAME:   'Assessments',
  EMAIL_NOTIFY: 'youremail@example.com',  // optional, or leave blank ''
};
```

5. Click **Save** (Ctrl+S).

---

## Step 4 — Enable the Progress Report Query

In `Code.gs`, find the `doPost` function and add this block **inside the try block, before** the video upload code:

```javascript
// Handle progress report requests from progress-report.html
if (data.action === 'getProgress') {
  const assessments = getPlayerAssessments(data.playerName);
  return jsonResponse({ status: 'success', data: assessments });
}
```

Your `doPost` try block should look like:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ← Add this block:
    if (data.action === 'getProgress') {
      const assessments = getPlayerAssessments(data.playerName);
      return jsonResponse({ status: 'success', data: assessments });
    }

    // Upload video...
    // Save row...
    // etc.
  }
}
```

---

## Step 5 — Deploy as Web App

1. In Apps Script, click **Deploy → New deployment**.
2. Click the gear icon ⚙ next to "Select type" and choose **Web App**.
3. Fill in:
   - **Description**: TSA Assessment API
   - **Execute as**: Me
   - **Who has access**: **Anyone** ← Important! (this allows your HTML form to submit)
4. Click **Deploy**.
5. Click **Authorize access** and follow the Google login prompts.
6. Copy the **Web App URL** — it looks like:  
   `https://script.google.com/macros/s/XXXXXXXXXX/exec`

---

## Step 6 — Connect the HTML Forms

Open both `index.html` and `progress-report.html` in a text editor.

In **both files**, find this line near the top of the `<script>` section:

```javascript
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Replace `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with your actual Web App URL from Step 5.

---

## Step 7 — Deploy on Your Website

**Option A — Standalone HTML files (simplest):**
- Upload `index.html` and `progress-report.html` to any web hosting.
- Coaches open `index.html` in their browser.

**Option B — Google Apps Script HTML Service (no hosting needed):**
- In Apps Script, create a new file called `index.html`.
- Paste the HTML content of `index.html` into it.
- Change your `doGet` function to serve the HTML:

```javascript
function doGet(e) {
  const page = e.parameter.page || 'index';
  return HtmlService
    .createHtmlOutputFromFile(page)
    .setTitle('TSA Assessment')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

- Share the Web App URL with coaches.

---

## How the 3-Month / 6-Month Comparison Works

When a coach fills in the form:

1. They select **Assessment Stage**: Initial / 3-Month / 6-Month
2. The data is saved to the sheet tagged with that stage

To view a player's progress:

1. Open `progress-report.html`
2. Type the **exact player name** (same spelling as on the assessment form)
3. All their assessments appear side-by-side with:
   - Score comparison table with **▲ / ▼ delta** for each skill
   - Overall average change
   - Most improved skill highlight
   - All coach notes per stage
   - Video links per stage

---

## Updating an Existing Deployment

After making any changes to `Code.gs`:

1. Go to **Deploy → Manage deployments**
2. Click the pencil ✏ on your existing deployment
3. Change version to **"New version"**
4. Click **Deploy**

> ⚠️ You do NOT need a new URL — the same URL will work after redeployment.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Form shows "Submission failed" | Check the Web App URL is correct in both HTML files |
| Video upload fails | Verify the Drive Folder ID in `CONFIG` and that the folder exists |
| No data in sheet | Check the Sheet ID in `CONFIG` and re-authorize in Apps Script |
| Progress report shows "No assessments found" | Player name must match exactly (spelling + spaces) |
| CORS errors in browser console | Ensure "Who has access" is set to **Anyone** in deployment settings |

---

## Data Flow Summary

```
Coach fills index.html
       ↓
Browser sends POST to Apps Script Web App URL
       ↓
Code.gs receives data
       ↓
  ├── Saves row to Google Sheet (all 16 skill scores + notes)
  └── If video: uploads to Drive → PlayerName/ subfolder → saves link in sheet
       ↓
Form shows success message
```

```
Coach opens progress-report.html
       ↓
Types player name → click Search
       ↓
Browser sends POST { action: 'getProgress', playerName: '...' }
       ↓
Code.gs filters sheet rows by player name
       ↓
Returns all assessments as JSON
       ↓
Page renders side-by-side comparison table with deltas
```
