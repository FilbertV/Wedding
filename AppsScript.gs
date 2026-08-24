/**
 * Wedding invitation backend — Google Apps Script Web App
 * ------------------------------------------------------
 * Receives RSVPs and wedding wishes from index.html and writes them into
 * your Google Sheet. Also serves the wishes back so every guest sees the
 * same scrolling wall of wishes.
 *
 * SETUP: see README.md (about 5 minutes, no coding needed).
 */

// Your guest-list spreadsheet.
var SHEET_ID = '16qAXuu0pmgA_6t5p8_atVW6RbFTNg0ERc-nqlI7_oEM';

var RSVP_TAB    = 'RSVP';
var WISHES_TAB  = 'Wishes';
var RSVP_HEAD   = ['Timestamp', 'Name', 'Phone', 'Attendance', 'Guests', 'Message'];
var WISHES_HEAD = ['Timestamp', 'Name', 'Wish'];


/** POST — a guest submitted the RSVP form or a wedding wish. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);                       // keeps two guests from colliding
  try {
    var p  = (e && e.parameter) ? e.parameter : {};
    var ss = SpreadsheetApp.openById(SHEET_ID);

    if (p.type === 'wish') {
      getTab_(ss, WISHES_TAB, WISHES_HEAD).appendRow([
        new Date(),
        clean_(p.name, 80),
        clean_(p.message, 500)
      ]);
    } else {
      getTab_(ss, RSVP_TAB, RSVP_HEAD).appendRow([
        new Date(),
        clean_(p.name, 100),
        clean_(p.phone, 40),
        clean_(p.attendance, 30),
        clean_(p.guests, 10),
        clean_(p.message, 500)
      ]);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}


/** GET — the site asks for the wish wall (JSONP, so the browser can read it). */
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  var out = [];

  if (p.action === 'wishes') {
    try {
      var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(WISHES_TAB);
      if (sh && sh.getLastRow() > 1) {
        var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
        out = rows
          .filter(function (r) { return r[1] && r[2]; })
          .slice(-60)                          // newest 60 wishes
          .map(function (r) { return { name: String(r[1]), message: String(r[2]) }; });
      }
    } catch (err) {
      out = [];
    }
  }

  if (p.callback) {
    return ContentService
      .createTextOutput(p.callback + '(' + JSON.stringify(out) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(out);
}


/* ---------------------------------------------------------------- */
/* helpers                                                          */
/* ---------------------------------------------------------------- */

function getTab_(ss, name, header) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.getRange(1, 1, 1, header.length)
      .setFontWeight('bold')
      .setBackground('#f3e5c3');
    sh.setFrozenRows(1);
  }
  return sh;
}

function clean_(v, max) {
  if (v === undefined || v === null) return '';
  var s = String(v).trim().slice(0, max);
  // stop a submitted value from being read as a spreadsheet formula
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
