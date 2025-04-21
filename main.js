const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { handleStackOverflow } = require("./src/handler-stack-overflow");

const expressApp = express();
const PORT = process.env.PORT || 3300;

expressApp.use(cors());
expressApp.use(bodyParser.json());

let mainWindow = null;

// Continue.dev context provider endpoint
expressApp.post("/stack-overflow", async (req, res) => {
  console.log(
    "Received stack-overflow request:",
    JSON.stringify(req.body, null, 2)
  );

  const { query, fullInput, options } = req.body;
  const maxItems = options?.maxItems || 3;
  const question = fullInput;

  try {
    const result = await handleStackOverflow(mainWindow, question, maxItems);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      name: `Stack Overflow`,
      description: `Error: ${error.message}`,
      content: `No Stack Overflow answers available due to an error: ${error.message}`,
    });
  }
});

expressApp.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

let server = null;
const startServer = () => {
  server = expressApp.listen(PORT, () => {
    console.log(`Context Provider Server running on Port: ${PORT}`);
  });
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.loadFile("index.html");

  // Show devtools
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  startServer();
  createMainWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
  if (server) {
    server.close();
  }
});
