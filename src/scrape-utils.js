"use strict";

const fs = require("fs");

async function scrapeUrl(window, url, script) {
  return new Promise((resolve, reject) => {
    window.loadURL(url);
    window.webContents.once("did-finish-load", async () => {
      try {
        const result = await window.webContents.executeJavaScript(script);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    window.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        reject(
          new Error(`Failed to load URL: ${errorDescription} (${errorCode})`)
        );
      }
    );
  });
}

module.exports = {
  scrapeUrl,
};
