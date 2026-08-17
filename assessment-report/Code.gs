/**
 * ═══════════════════════════════════════════════════════════════
 *  TOUCH LINE SPORT ACADEMY — Player Assessment Apps Script
 *  File: Code.gs
 *  
 *  SETUP: Fill in the three CONFIG values below, then
 *         Deploy as Web App (see SETUP_GUIDE.md)
 * ═══════════════════════════════════════════════════════════════
 */

// ── CONFIGURATION ──────────────────────────────────────────────
const CONFIG = {
  SHEET_ID:       'YOUR_GOOGLE_SHEET_ID_HERE',       // From sheet URL: /d/XXXX/edit
  FOLDER_ID:      'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE', // Drive folder for videos
  SHEET_NAME:     'Assessments',                      // Tab name in the spreadsheet
  EMAIL_NOTIFY:   '',                                  // Optional: email to notify on new submission (leave blank to skip)
};
// ───────────────────────────────────────────────────────────────

/**
 * Column headers for the Google Sheet.
 * Order must match the row array built in doPost().
 */
const HEADERS = [
  'Timestamp',
  'Player Name',
  'Age',
  'Batch',
  'Assessment Date',
  'Assessment Stage',
  // Technical Skills
  'Dribbling',
  'Passing',
  'Shooting',
  'Control',
  'Tackling',
  // Tactical
  'Game Situations',
  'Read the Game',
  'Decision Making',
  // Physical
  'Speed',
  'Agility',
  'Endurance',
  'Strength',
  // Mental
  'Confidence',
  'Focus',
  'Teamwork',
  'Sportsmanship',
  // Notes
  'Strengths',
  'Areas for Improvement',
  "Coach's Comments",
  // Coach
  'Coach Name',
  'Coach ID',
  // Media
  'Video Link',
];

// ───────────────────────────────────────────────────────────────
//  doPost — receives form submission from the HTML form
// ───────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // -- Handle API Actions --
    if (data.action === 'getAllPlayers') {
      const players = getAllPlayersList();
      return jsonResponse({ status: 'success', data: players });
    }
    if (data.action === 'getProgress') {
      const assessments = getPlayerAssessments(data.playerName, data.batch);
      return jsonResponse({ status: 'success', data: assessments });
    }

    // 1. Upload video to Drive (returns link or empty string)
    let videoLink = '';
    if (data.videoBase64 && data.videoFileName) {
      videoLink = uploadVideo(
        data.videoBase64,
        data.videoFileName,
        data.videoMimeType || 'video/mp4',
        data.playerName,
        data.assessType
      );
    }

    // 2. Save row to sheet
    const sheet = getOrCreateSheet();
    const row = buildRow(data, videoLink);
    sheet.appendRow(row);

    // 3. Optional email notification
    if (CONFIG.EMAIL_NOTIFY) {
      sendNotification(data, videoLink);
    }

    return jsonResponse({ status: 'success', message: 'Assessment saved successfully.' });

  } catch (err) {
    console.error('doPost error:', err);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ───────────────────────────────────────────────────────────────
//  doGet — health check (also needed for CORS preflight)
// ───────────────────────────────────────────────────────────────
function doGet(e) {
  return jsonResponse({
    status: 'ok',
    message: 'TSA Assessment API is live.',
    timestamp: new Date().toISOString()
  });
}

// ───────────────────────────────────────────────────────────────
//  buildRow — maps form payload to sheet column order
// ───────────────────────────────────────────────────────────────
function buildRow(d, videoLink) {
  return [
    d.timestamp || new Date().toISOString(),
    d.playerName        || '',
    d.playerAge         || '',
    d.batch             || '',
    d.assessDate        || '',
    d.assessType        || '',
    // Technical
    d.dribbling         || '',
    d.passing           || '',
    d.shooting          || '',
    d.control           || '',
    d.tackling          || '',
    // Tactical
    d.game_situations   || '',
    d.read_the_game     || '',
    d.decision_making   || '',
    // Physical
    d.speed             || '',
    d.agility           || '',
    d.endurance         || '',
    d.strength          || '',
    // Mental
    d.confidence        || '',
    d.focus             || '',
    d.teamwork          || '',
    d.sportsmanship     || '',
    // Notes
    d.strengths         || '',
    d.improvements      || '',
    d.coachComments     || '',
    // Coach
    d.coachName         || '',
    d.coachId           || '',
    // Media
    videoLink,
  ];
}

// ───────────────────────────────────────────────────────────────
//  getOrCreateSheet — get the Assessments sheet, creating and
//  formatting it if it doesn't exist yet
// ───────────────────────────────────────────────────────────────
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let   sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);

    // Write headers
    sheet.appendRow(HEADERS);

    // Style header row
    const hdrRange = sheet.getRange(1, 1, 1, HEADERS.length);
    hdrRange.setBackground('#0a0a0a');
    hdrRange.setFontColor('#ffffff');
    hdrRange.setFontWeight('bold');
    hdrRange.setFontSize(11);
    hdrRange.setFontFamily('Courier New');

    // Freeze header
    sheet.setFrozenRows(1);

    // Column widths
    sheet.setColumnWidth(1,  170); // Timestamp
    sheet.setColumnWidth(2,  160); // Player Name
    sheet.setColumnWidth(3,   60); // Age
    sheet.setColumnWidth(4,  140); // Batch
    sheet.setColumnWidth(5,  130); // Date
    sheet.setColumnWidth(6,  130); // Stage
    for (let c = 7; c <= 22; c++) sheet.setColumnWidth(c, 90); // Skill scores
    sheet.setColumnWidth(23, 220); // Strengths
    sheet.setColumnWidth(24, 220); // Improvements
    sheet.setColumnWidth(25, 220); // Coach Comments
    sheet.setColumnWidth(26, 150); // Coach Name
    sheet.setColumnWidth(27, 100); // Coach ID
    sheet.setColumnWidth(28, 280); // Video Link

    // Alternate row banding
    const dataRange = sheet.getRange(1, 1, 1000, HEADERS.length);
    sheet.setRowHeights(2, 999, 28);

    console.log('Sheet "' + CONFIG.SHEET_NAME + '" created and formatted.');
  }

  return sheet;
}

// ───────────────────────────────────────────────────────────────
//  uploadVideo — decode base64 and save to Drive
//  Files are organised: Main Folder / PlayerName / filename
// ───────────────────────────────────────────────────────────────
function uploadVideo(base64Data, originalName, mimeType, playerName, stage) {
  try {
    const mainFolder   = DriveApp.getFolderById(CONFIG.FOLDER_ID);

    // Create or find a sub-folder per player
    const safeName     = (playerName || 'Unknown').replace(/[^\w\s\-]/g, '').trim();
    let   playerFolder;
    const existing     = mainFolder.getFoldersByName(safeName);
    playerFolder       = existing.hasNext() ? existing.next() : mainFolder.createFolder(safeName);

    // Build a descriptive filename
    const dateStr      = new Date().toISOString().split('T')[0];
    const ext          = originalName.split('.').pop() || 'mp4';
    const newName      = `${safeName}_${stage || 'Assessment'}_${dateStr}.${ext}`;

    // Decode & upload
    const bytes = Utilities.base64Decode(base64Data);
    const blob  = Utilities.newBlob(bytes, mimeType, newName);
    const file  = playerFolder.createFile(blob);

    // Make viewable by link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();

  } catch (err) {
    console.error('Video upload failed:', err);
    return 'UPLOAD_FAILED: ' + err.message;
  }
}

// ───────────────────────────────────────────────────────────────
//  sendNotification — optional email alert
// ───────────────────────────────────────────────────────────────
function sendNotification(data, videoLink) {
  try {
    const subject = `[TSA] New Assessment — ${data.playerName} (${data.assessType})`;
    const body = `
A new player assessment has been submitted.

Player  : ${data.playerName}
Age     : ${data.playerAge}
Batch   : ${data.batch}
Stage   : ${data.assessType}
Date    : ${data.assessDate}
Coach   : ${data.coachName} ${data.coachId ? '(' + data.coachId + ')' : ''}
Video   : ${videoLink || 'Not provided'}

Strengths:
${data.strengths || '—'}

Areas for Improvement:
${data.improvements || '—'}

Coach's Comments:
${data.coachComments || '—'}

— Touch Line Sport Academy LLC
    `.trim();

    GmailApp.sendEmail(CONFIG.EMAIL_NOTIFY, subject, body);
  } catch (err) {
    console.warn('Email notification failed:', err);
  }
}

// ───────────────────────────────────────────────────────────────
//  jsonResponse — helper to return JSON with CORS headers
// ───────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ───────────────────────────────────────────────────────────────
//  getPlayerAssessments — fetch all assessments for a player
//  Used by the Progress Report viewer (progress-report.html)
// ───────────────────────────────────────────────────────────────
function getPlayerAssessments(playerName, batchName) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];

  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[1] || '').toString().trim();
    const batch = (row[3] || '').toString().trim();
    
    // If batchName is provided, filter by both Name and Batch exactly.
    // Otherwise, fallback to just Name (case-insensitive for legacy).
    let match = false;
    if (batchName) {
      match = (name.toLowerCase() === (playerName || '').toLowerCase().trim()) && 
              (batch.toLowerCase() === batchName.toLowerCase().trim());
    } else {
      match = (name.toLowerCase() === (playerName || '').toLowerCase().trim());
    }

    if (match) {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = row[idx]; });
      results.push(obj);
    }
  }

  // Sort by Assessment Date ascending
  results.sort((a, b) => new Date(a['Assessment Date']) - new Date(b['Assessment Date']));
  return results;
}

// ───────────────────────────────────────────────────────────────
//  getAllPlayersList — fetch unique players for live search
// ───────────────────────────────────────────────────────────────
function getAllPlayersList() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const playersMap = {};

  // Loop through rows (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[1] || '').toString().trim();
    const age = (row[2] || '').toString().trim();
    const batch = (row[3] || '').toString().trim();
    const assessDate = row[4];

    if (!name) continue;

    // Unique key is Name + Batch to distinguish same names in different batches
    const key = name.toLowerCase() + '|' + batch.toLowerCase();

    if (!playersMap[key]) {
      playersMap[key] = {
        name: name,
        age: age,
        batch: batch,
        assessmentCount: 1,
        latestDate: assessDate
      };
    } else {
      playersMap[key].assessmentCount++;
      if (new Date(assessDate) > new Date(playersMap[key].latestDate)) {
        playersMap[key].latestDate = assessDate;
      }
    }
  }

  // Convert map to array and sort alphabetically by name
  const playersArray = Object.values(playersMap);
  playersArray.sort((a, b) => a.name.localeCompare(b.name));
  return playersArray;
}
