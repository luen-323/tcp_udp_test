"use strict";
const electron = require("electron");
const udpApi = {
  create: (port) => electron.ipcRenderer.invoke("udp:create", { port }),
  send: (address, port, message, isHex) => electron.ipcRenderer.invoke("udp:send", { address, port, message, isHex }),
  close: () => electron.ipcRenderer.invoke("udp:close"),
  onMessage: (callback) => {
    electron.ipcRenderer.on("udp:on-message", (_event, data) => callback(data));
  },
  onError: (callback) => {
    electron.ipcRenderer.on("udp:on-error", (_event, error) => callback(error));
  }
};
const tcpApi = {
  connect: (address, port) => electron.ipcRenderer.invoke("tcp:connect", { address, port }),
  send: (message, isHex) => electron.ipcRenderer.invoke("tcp:send", { message, isHex }),
  disconnect: () => electron.ipcRenderer.invoke("tcp:disconnect"),
  onData: (callback) => {
    electron.ipcRenderer.on("tcp:on-data", (_event, data) => callback(data));
  },
  onStatus: (callback) => {
    electron.ipcRenderer.on("tcp:on-status", (_event, status) => callback(status));
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", {
  udp: udpApi,
  tcp: tcpApi
});
