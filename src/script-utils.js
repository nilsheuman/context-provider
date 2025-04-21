"use strict";

const path = require('path');
const fs = require('fs');

function readScriptContents(scriptFile) {
  const filePath = path.join(__dirname, '../page-scripts', scriptFile)
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
}

function extractGoogleSearchResultsScript() {
  const scriptContents = readScriptContents('script-google-extract-results.js');
  return scriptContents;
}

module.exports = {
  extractGoogleSearchResultsScript,
};
