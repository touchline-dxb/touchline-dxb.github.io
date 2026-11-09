/**
 * ════════════════════════════════════════════════════════════════
 * TOUCHLINE SPORTS ACADEMY - CAREER APPLICATION HANDLER
 * Google Apps Script for processing job applications with files
 * Updated: November 2026 — Senior Coach AD / Assistant Coach AD drive
 * ════════════════════════════════════════════════════════════════
 */

// ═══ CONFIGURATION ═══
const CONFIG = {
  // Your Google Sheet ID
  SHEET_ID: '1jGEsd8kZpvuoFnkPzXzGy4Jx7N8CP08nQpDbi7pgyFU',

  // Google Drive folder ID where resumes will be stored
  DRIVE_FOLDER_ID: '1tbQ1skZDIHpTxbrcTjLZMEHMMi4Fq1Ja',

  // Email settings
  ADMIN_EMAIL: 'careers.touchline@gmail.com',
  SEND_CONFIRMATION_EMAIL: true,

  /**
   * ─────────────────────────────────────────────────────────────
   * SHEET NAMES (sub-sheets inside the Google Spreadsheet)
   * Each key = job ID sent from the website form
   * Each value = tab name that will be created in the spreadsheet
   *
   * CURRENT HIRING DRIVE (live on the careers page):
   *   senior-coach          → "Senior Coach AD"
   *   assistant-coach       → "Assistant Coach AD"
   *
   * PREVIOUS OPENINGS (hidden on the website, tabs kept):
   *   part-time-coach       → "PT Football Coach"
   *   full-time-coach       → "FT Football Coach"
   *   basketball-pt-coach   → "Basketball PT Coach"
   *   academy-manager       → "Academy Manager"
   *   head-coach            → "Head Coach - Interest"
   *   sales-exec            → "Sales - Interest"
   * ─────────────────────────────────────────────────────────────
   */
  SHEET_NAMES: {
    'senior-coach':        'Senior Coach AD',
    'assistant-coach':     'Assistant Coach AD',
    'part-time-coach':     'PT Football Coach',
    'full-time-coach':     'FT Football Coach',
    'basketball-pt-coach': 'Basketball PT Coach',
    'academy-manager':     'Academy Manager',
    'head-coach':          'Head Coach - Interest',
    'sales-exec':          'Sales - Interest',
  },

  // Display titles used in emails (falls back to the sheet name)
  JOB_TITLES: {
    'senior-coach':    'Senior Coach',
    'assistant-coach': 'Assistant Coach',
  }
};

/**
 * ═══ SENIOR / ASSISTANT COACH AD SETTINGS
 * Must match the rules on the careers page.
 */
const COACH_AD = {
  JOB_IDS: ['senior-coach', 'assistant-coach'],

  HEADERS: [
    'Photo',
    'Full Name',
    'Phone',
    'Email',
    'Nationality',
    'Job Role',
    'UAE Experience (Years)',
    'Total Experience (Years)',
    'Licence Body',
    'Licence Level',
    'English Fluency',
    'Availability to Join',
    'Expected Salary (AED / Month)',
    'Resume',
    'Photo Link',
    'Declaration',
    'Submitted At',
    'Application ID',
    'Status'
  ],

  SENIOR_MIN_UAE_YEARS: 2,

  SENIOR_MIN_LEVELS: {
    AFC:   ['Pro', 'A', 'B', 'C'],
    CAF:   ['Pro', 'A', 'B', 'C'],
    UEFA:  ['Pro', 'A', 'B', 'C'],
    UAEFA: ['Pro', 'A', 'B', 'C']
  },

  LICENCE_BODIES: ['AFC', 'CAF', 'UEFA', 'UAEFA', 'Other'],
  ENGLISH_LEVELS: ['Can Adjust', 'Manageable', 'Good', 'Fluent'],
  AVAILABILITY_OPTIONS: ['Immediately', 'Within 30 days'],

  PHOTO_ROW_HEIGHT: 110,
  PHOTO_COLUMN_WIDTH: 120
};

/**
 * ═══ MAIN HANDLER - Processes POST requests from the web form
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (!data.jobId || !data.formData) {
      return createResponse(false, 'Missing required data');
    }

    const result = processApplication(data);
    return createResponse(true, 'Application submitted successfully', result);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse(false, 'Error processing application: ' + error.message);
  }
}

/**
 * ═══ PROCESS APPLICATION
 */
function processApplication(data) {
  if (COACH_AD.JOB_IDS.indexOf(data.jobId) !== -1) {
    return processCoachAdApplication(data);
  }

  const { jobId, formData, files } = data;
  const timestamp = new Date();

  const sheet = getOrCreateSheet(jobId);
  const fileLinks = processFileUploads(files, formData.fullName, jobId, timestamp);
  const rowData = prepareRowData(formData, fileLinks, timestamp);

  if (sheet.getLastRow() === 0) {
    const headers = Object.keys(rowData);
    sheet.appendRow(headers);
    formatHeaderRow(sheet);
  }

  sheet.appendRow(Object.values(rowData));
  formatDataRow(sheet, sheet.getLastRow());

  if (CONFIG.SEND_CONFIRMATION_EMAIL) {
    sendConfirmationEmail(formData.email, formData.fullName, jobId);
    sendAdminNotification(formData, jobId, fileLinks);
  }

  return {
    applicationId: generateApplicationId(timestamp),
    submittedAt: timestamp.toISOString()
  };
}

/**
 * ═══ SENIOR / ASSISTANT COACH AD APPLICATION
 */
function processCoachAdApplication(data) {
  const jobId = data.jobId;
  const f = data.formData;
  const files = data.files || [];

  const validationError = validateCoachAd(jobId, f, files);
  if (validationError) throw new Error(validationError);

  const timestamp = new Date();
  const applicationId = generateApplicationId(timestamp);

  const sheet = getOrCreateSheet(jobId);
  ensureCoachAdHeaders(sheet);

  const uploads = uploadCoachAdFiles(files, f.fullName, jobId, timestamp);
  const photo = uploads.photo;
  const resume = uploads.resume;

  const row = [
    photo.id ? '=IMAGE("https://drive.google.com/thumbnail?id=' + photo.id + '&sz=w400")' : 'Upload failed',
    f.fullName,
    "'" + f.phone,
    f.email,
    f.nationality,
    CONFIG.JOB_TITLES[jobId],
    Number(f.uaeExperience),
    Number(f.totalExperience),
    f.licenceBody,
    f.licenceLevel || '—',
    f.englishFluency,
    f.availability,
    Number(f.expectedSalary),
    resume.url ? '=HYPERLINK("' + resume.url + '","View CV")' : 'Upload failed',
    photo.url ? '=HYPERLINK("' + photo.url + '","View Photo")' : '',
    'Confirmed — details declared true',
    timestamp,
    applicationId,
    'New'
  ];

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    sheet.appendRow(row);
    formatCoachAdRow(sheet, sheet.getLastRow());
  } finally {
    lock.releaseLock();
  }

  if (CONFIG.SEND_CONFIRMATION_EMAIL) {
    sendConfirmationEmail(f.email, f.fullName, jobId);
    sendAdminNotification(f, jobId, { photo: photo.url, resume: resume.url }, {
      'Job Role': CONFIG.JOB_TITLES[jobId],
      'Nationality': f.nationality,
      'UAE Experience': f.uaeExperience + ' years',
      'Total Experience': f.totalExperience + ' years',
      'Coaching Licence': f.licenceBody + (f.licenceLevel ? ' — ' + f.licenceLevel : ''),
      'English Fluency': f.englishFluency,
      'Availability to Join': f.availability,
      'Expected Salary': 'AED ' + f.expectedSalary + ' / month'
    });
  }

  return {
    applicationId: applicationId,
    submittedAt: timestamp.toISOString()
  };
}

function validateCoachAd(jobId, f, files) {
  if (!f.fullName || String(f.fullName).trim().length < 3) return 'Full name is required.';
  if (!/^\+971 5[024568] \d{3} \d{4}$/.test(f.phone || '')) return 'Please enter a valid UAE mobile number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email || '')) return 'Please enter a valid email address.';
  if (!f.nationality) return 'Nationality is required.';

  if (!/^\d{1,2}$/.test(String(f.uaeExperience)) || !/^\d{1,2}$/.test(String(f.totalExperience))) {
    return 'Experience must be a whole number of years between 0 and 99.';
  }
  const uae = Number(f.uaeExperience);
  const total = Number(f.totalExperience);
  if (total < uae) return 'Total experience cannot be less than UAE experience.';

  if (COACH_AD.LICENCE_BODIES.indexOf(f.licenceBody) === -1) return 'Please select your coaching licence.';
  if (f.licenceBody !== 'Other' && !f.licenceLevel) return 'Please select your licence level.';
  if (COACH_AD.ENGLISH_LEVELS.indexOf(f.englishFluency) === -1) return 'Please select your English fluency level.';
  if (COACH_AD.AVAILABILITY_OPTIONS.indexOf(f.availability) === -1) return 'Please tell us when you can join.';
  if (!(Number(f.expectedSalary) > 0)) return 'Expected monthly salary is required.';
  if (f.declaration !== 'Confirmed') return 'Please confirm that the information you provided is true.';

  if (jobId === 'senior-coach') {
    if (uae < COACH_AD.SENIOR_MIN_UAE_YEARS) {
      return 'Senior Coach requires at least ' + COACH_AD.SENIOR_MIN_UAE_YEARS + ' years UAE coaching experience.';
    }
    const allowed = COACH_AD.SENIOR_MIN_LEVELS[f.licenceBody] || [];
    if (allowed.indexOf(f.licenceLevel) === -1) {
      return 'Senior Coach requires a minimum C Licence (AFC / CAF / UEFA / UAEFA).';
    }
  }

  const fieldNames = files.map(function (x) { return x.fieldName; });
  if (fieldNames.indexOf('photo') === -1) return 'Photo is required.';
  if (fieldNames.indexOf('resume') === -1) return 'Resume is required.';

  return '';
}

function uploadCoachAdFiles(files, applicantName, jobId, timestamp) {
  const result = { photo: {}, resume: {} };
  if (!files.length) return result;

  const applicantFolder = getOrCreateFolder(jobId).createFolder(
    applicantName + '_' + Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')
  );

  files.forEach(function (fileData) {
    if (!result[fileData.fieldName]) return;
    try {
      const bytes = Utilities.base64Decode(fileData.content);
      const blob = Utilities.newBlob(bytes, fileData.mimeType, applicantName + ' - ' + fileData.name);
      const file = applicantFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      result[fileData.fieldName] = { id: file.getId(), url: file.getUrl() };
    } catch (error) {
      Logger.log('Error uploading ' + fileData.fieldName + ' for ' + applicantName + ': ' + error.toString());
    }
  });

  return result;
}

function ensureCoachAdHeaders(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.getRange(1, 1, 1, COACH_AD.HEADERS.length).setValues([COACH_AD.HEADERS]);
  formatHeaderRow(sheet);
  sheet.setFrozenColumns(2);
  sheet.setColumnWidth(1, COACH_AD.PHOTO_COLUMN_WIDTH);
  sheet.setColumnWidths(2, COACH_AD.HEADERS.length - 1, 170);
}

function formatCoachAdRow(sheet, rowNumber) {
  const range = sheet.getRange(rowNumber, 1, 1, COACH_AD.HEADERS.length);
  if (rowNumber % 2 === 0) range.setBackground('#F4F5F7');
  range.setVerticalAlignment('middle');
  range.setBorder(true, true, true, true, true, true, '#DDE3EA', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(rowNumber, COACH_AD.PHOTO_ROW_HEIGHT);
  sheet.getRange(rowNumber, COACH_AD.HEADERS.indexOf('Expected Salary (AED / Month)') + 1).setNumberFormat('#,##0');
  sheet.getRange(rowNumber, COACH_AD.HEADERS.indexOf('Submitted At') + 1).setNumberFormat('dd MMM yyyy, hh:mm');
}

/**
 * ═══ FILE UPLOAD HANDLER
 */
function processFileUploads(files, applicantName, jobId, timestamp) {
  if (!files || files.length === 0) return {};

  const folder = getOrCreateFolder(jobId);
  const fileLinks = {};

  const applicantFolder = folder.createFolder(
    applicantName + '_' + Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')
  );

  files.forEach(function(fileData) {
    try {
      const bytes = Utilities.base64Decode(fileData.content);
      const blob = Utilities.newBlob(bytes, fileData.mimeType, fileData.name);
      const file = applicantFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileLinks[fileData.fieldName] = file.getUrl();
      Logger.log('Uploaded: ' + fileData.name + ' for ' + applicantName);
    } catch (error) {
      Logger.log('Error uploading file ' + fileData.name + ': ' + error.toString());
      fileLinks[fileData.fieldName] = 'Upload failed: ' + error.message;
    }
  });

  return fileLinks;
}

/**
 * ═══ SHEET MANAGEMENT
 */
function getOrCreateSheet(jobId) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheetName = CONFIG.SHEET_NAMES[jobId] || 'General Applications';

  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * ═══ FOLDER MANAGEMENT
 */
function getOrCreateFolder(jobId) {
  const rootFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const folderName = CONFIG.SHEET_NAMES[jobId] || 'General Applications';

  const folders = rootFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return rootFolder.createFolder(folderName);
  }
}

/**
 * ═══ DATA PREPARATION
 */
function prepareRowData(formData, fileLinks, timestamp) {
  const rowData = {
    'Timestamp': timestamp,
    'Application ID': generateApplicationId(timestamp)
  };
  Object.assign(rowData, formData, fileLinks);
  return rowData;
}

/**
 * ═══ FORMATTING
 */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#06203D');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
}

function formatDataRow(sheet, rowNumber) {
  const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
  if (rowNumber % 2 === 0) {
    range.setBackground('#F4F5F7');
  }
  range.setBorder(true, true, true, true, true, true, '#DDE3EA', SpreadsheetApp.BorderStyle.SOLID);
  sheet.autoResizeColumns(1, sheet.getLastColumn());
}

/**
 * ═══ EMAIL NOTIFICATIONS
 */
function getJobTitle(jobId) {
  const sheetName = CONFIG.SHEET_NAMES[jobId] || 'Position';
  return CONFIG.JOB_TITLES[jobId] || sheetName.replace(' - Interest', '');
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sendConfirmationEmail(email, name, jobId) {
  const isInterest = (jobId === 'head-coach' || jobId === 'sales-exec');
  const jobTitle = getJobTitle(jobId);

  const subject = isInterest
    ? 'Expression of Interest Received \u2014 ' + jobTitle + ' at Touchline Sports Academy'
    : 'Application Received \u2014 ' + jobTitle + ' at Touchline Sports Academy';

  const bodyMessage = isInterest
    ? 'Thank you for registering your interest in the <strong>' + jobTitle + '</strong> role at Touchline Sports Academy! We are not actively hiring for this position right now, but we have kept your details on file and will reach out when an opportunity opens up.'
    : 'Thank you for applying for the <strong>' + jobTitle + '</strong> position at Touchline Sports Academy! We\'ve successfully received your application and our team will review it shortly. We\'ll be in touch soon regarding the next steps.';

  const htmlBody = '<!DOCTYPE html><html><head><style>'
    + 'body{font-family:Arial,sans-serif;line-height:1.6;color:#2c3e50}'
    + '.container{max-width:600px;margin:0 auto;padding:20px}'
    + '.header{background:linear-gradient(135deg,#06203D,#0a2847);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}'
    + '.content{background:#fff;padding:30px;border:1px solid #dde3ea;border-radius:0 0 10px 10px}'
    + '.footer{text-align:center;margin-top:20px;color:#8a9bb0;font-size:12px}'
    + '</style></head><body>'
    + '<div class="container">'
    + '<div class="header"><h1 style="margin:0;font-size:24px;">\u26bd Touchline Sports Academy</h1>'
    + '<p style="margin:10px 0 0 0;opacity:0.9;">' + (isInterest ? 'Expression of Interest Received' : 'Application Received') + '</p></div>'
    + '<div class="content">'
    + '<h2 style="color:#06203D;">Hi ' + escapeHtml(name) + ',</h2>'
    + '<p>' + bodyMessage + '</p>'
    + '<p style="margin-top:30px;">Best regards,<br><strong>The Touchline Team</strong></p>'
    + '</div>'
    + '<div class="footer"><p>This is an automated message. Please do not reply to this email.</p>'
    + '<p>\u00a9 ' + new Date().getFullYear() + ' Touchline Sports Academy. All rights reserved.</p></div>'
    + '</div></body></html>';

  try {
    MailApp.sendEmail({ to: email, subject: subject, htmlBody: htmlBody });
  } catch (error) {
    Logger.log('Error sending confirmation email: ' + error.toString());
  }
}

function sendAdminNotification(formData, jobId, fileLinks, extraDetails) {
  const isInterest = (jobId === 'head-coach' || jobId === 'sales-exec');
  const jobTitle = getJobTitle(jobId);

  const subject = isInterest
    ? '\ud83d\udcbc New Interest: ' + jobTitle + ' \u2014 ' + formData.fullName
    : '\ud83d\udd14 New Application: ' + jobTitle + ' \u2014 ' + formData.fullName;

  let fileLinksHtml = '';
  for (const key in fileLinks) {
    if (!fileLinks[key]) continue;
    fileLinksHtml += '<li><strong>' + key + ':</strong> <a href="' + fileLinks[key] + '">View File</a></li>';
  }

  let extraHtml = '';
  for (const label in (extraDetails || {})) {
    extraHtml += '<strong>' + label + ':</strong> ' + escapeHtml(extraDetails[label]) + '<br>';
  }

  const htmlBody = '<!DOCTYPE html><html><head><style>'
    + 'body{font-family:Arial,sans-serif;line-height:1.6;color:#2c3e50}'
    + '.container{max-width:600px;margin:0 auto;padding:20px;background:#f4f5f7}'
    + '.header{background:#06203D;color:white;padding:20px;border-radius:8px 8px 0 0}'
    + '.content{background:white;padding:25px;border-radius:0 0 8px 8px}'
    + '.detail{margin:10px 0;padding:10px;background:#f4f5f7;border-left:3px solid #BEB071}'
    + 'ul{list-style:none;padding:0}li{margin:8px 0}'
    + '</style></head><body>'
    + '<div class="container">'
    + '<div class="header">'
    + '<h2 style="margin:0;">' + (isInterest ? 'New Expression of Interest' : 'New Application Received') + '</h2>'
    + '<p style="margin:5px 0 0 0;opacity:0.8;">' + jobTitle + '</p>'
    + '</div>'
    + '<div class="content">'
    + '<h3>Applicant Details:</h3>'
    + '<div class="detail"><strong>Name:</strong> ' + escapeHtml(formData.fullName) + '<br>'
    + '<strong>Email:</strong> ' + escapeHtml(formData.email) + '<br>'
    + '<strong>Phone:</strong> ' + escapeHtml(formData.phone || 'N/A') + '</div>'
    + (extraHtml ? '<div class="detail">' + extraHtml + '</div>' : '')
    + (fileLinksHtml ? '<h3>Uploaded Documents:</h3><ul>' + fileLinksHtml + '</ul>' : '')
    + '<p style="margin-top:20px;">'
    + '<a href="https://docs.google.com/spreadsheets/d/' + CONFIG.SHEET_ID + '" '
    + 'style="display:inline-block;background:#06203D;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">'
    + 'View in Spreadsheet \u2192</a></p>'
    + '</div></div></body></html>';

  try {
    MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: subject, htmlBody: htmlBody });
  } catch (error) {
    Logger.log('Error sending admin notification: ' + error.toString());
  }
}

/**
 * ═══ UTILITY FUNCTIONS
 */
function generateApplicationId(timestamp) {
  const dateStr = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'TSA-' + dateStr + '-' + randomStr;
}

function createResponse(success, message, data) {
  data = data || {};
  const response = Object.assign({ success: success, message: message }, data);
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ═══ WEB APP HANDLER - For testing
 */
function doGet() {
  return HtmlService.createHtmlOutput(
    '<h2>Touchline Sports Academy - Application Handler</h2>'
    + '<p>This Apps Script is running correctly!</p>'
    + '<p><strong>Web App URL:</strong> ' + ScriptApp.getService().getUrl() + '</p>'
  );
}

/**
 * ═══ SETUP FUNCTION - Run this once to initialize
 * Creates any missing tabs (existing tabs and their data are never touched)
 * and adds the header row to the new Senior / Assistant Coach AD tabs.
 */
function setupSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    Logger.log('Connected to spreadsheet: ' + spreadsheet.getName());

    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    Logger.log('Connected to Drive folder: ' + folder.getName());

    Object.keys(CONFIG.SHEET_NAMES).forEach(function(jobId) {
      const sheetName = CONFIG.SHEET_NAMES[jobId];
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        Logger.log('Created sheet: ' + sheetName);
      } else {
        Logger.log('Sheet already exists: ' + sheetName);
      }
      if (COACH_AD.JOB_IDS.indexOf(jobId) !== -1) ensureCoachAdHeaders(sheet);
    });

    Logger.log('Setup complete!');
  } catch (error) {
    Logger.log('Setup failed: ' + error.toString());
  }
}
