"use strict";
const electron = require("electron");
const dgram = require("dgram");
const net = require("net");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const dgram__namespace = /* @__PURE__ */ _interopNamespaceDefault(dgram);
const net__namespace = /* @__PURE__ */ _interopNamespaceDefault(net);
let mainWindow = null;
let udpSocket = null;
let tcpSocket = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: "dist-electron/preload.js",
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: "#0F0F1A",
    titleBarStyle: "hiddenInset"
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile("dist/index.html");
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.ipcMain.handle("udp:create", async (_event, { port }) => {
  try {
    if (udpSocket) {
      udpSocket.close();
    }
    udpSocket = dgram__namespace.createSocket("udp4");
    return new Promise((resolve) => {
      udpSocket.once("listening", () => {
        resolve({ success: true });
      });
      udpSocket.on("message", (msg, rinfo) => {
        if (mainWindow) {
          mainWindow.webContents.send("udp:on-message", {
            data: msg.toString("hex"),
            address: rinfo.address,
            port: rinfo.port,
            size: msg.length
          });
        }
      });
      udpSocket.on("error", (err) => {
        if (mainWindow) {
          mainWindow.webContents.send("udp:on-error", err.message);
        }
        resolve({ success: false, error: err.message });
      });
      udpSocket.bind(port || void 0);
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("udp:send", async (_event, { address, port, message, isHex }) => {
  try {
    if (!udpSocket) {
      return { success: false, error: "UDP socket not created" };
    }
    let data;
    if (isHex) {
      const hex = message.replace(/\s/g, "");
      data = Buffer.from(hex, "hex");
    } else {
      data = Buffer.from(message, "utf8");
    }
    return new Promise((resolve) => {
      udpSocket.send(data, 0, data.length, port, address, (err) => {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("udp:close", async () => {
  try {
    if (udpSocket) {
      udpSocket.close();
      udpSocket = null;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("tcp:connect", async (_event, { address, port }) => {
  try {
    if (tcpSocket) {
      tcpSocket.destroy();
    }
    tcpSocket = new net__namespace.Socket();
    return new Promise((resolve) => {
      tcpSocket.connect(port, address, () => {
        if (mainWindow) {
          mainWindow.webContents.send("tcp:on-status", { status: "connected" });
        }
        resolve({ success: true });
      });
      tcpSocket.on("data", (data) => {
        if (mainWindow) {
          mainWindow.webContents.send("tcp:on-data", {
            data: data.toString("hex"),
            size: data.length
          });
        }
      });
      tcpSocket.on("close", () => {
        if (mainWindow) {
          mainWindow.webContents.send("tcp:on-status", { status: "disconnected" });
        }
      });
      tcpSocket.on("error", (err) => {
        if (mainWindow) {
          mainWindow.webContents.send("tcp:on-status", { status: "error", error: err.message });
        }
        resolve({ success: false, error: err.message });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("tcp:send", async (_event, { message, isHex }) => {
  try {
    if (!tcpSocket || !tcpSocket.writable) {
      return { success: false, error: "TCP socket not connected" };
    }
    let data;
    if (isHex) {
      const hex = message.replace(/\s/g, "");
      data = Buffer.from(hex, "hex");
    } else {
      data = Buffer.from(message, "utf8");
    }
    return new Promise((resolve) => {
      tcpSocket.write(data, (err) => {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("tcp:disconnect", async () => {
  try {
    if (tcpSocket) {
      tcpSocket.destroy();
      tcpSocket = null;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
