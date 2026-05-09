import { app, BrowserWindow, ipcMain } from 'electron'
import * as dgram from 'dgram'
import * as net from 'net'

let mainWindow: BrowserWindow | null = null
let udpSocket: dgram.Socket | null = null
let tcpSocket: net.Socket | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: 'dist-electron/preload.js',
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0F0F1A',
    titleBarStyle: 'hiddenInset'
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile('dist/index.html')
  }
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// UDP handlers
ipcMain.handle('udp:create', async (_event, { port }) => {
  try {
    if (udpSocket) {
      udpSocket.close()
    }
    
    udpSocket = dgram.createSocket('udp4')
    
    return new Promise((resolve) => {
      udpSocket!.once('listening', () => {
        resolve({ success: true })
      })
      
      udpSocket!.on('message', (msg, rinfo) => {
        if (mainWindow) {
          mainWindow.webContents.send('udp:on-message', {
            data: msg.toString('hex'),
            address: rinfo.address,
            port: rinfo.port,
            size: msg.length
          })
        }
      })
      
      udpSocket!.on('error', (err) => {
        if (mainWindow) {
          mainWindow.webContents.send('udp:on-error', err.message)
        }
        resolve({ success: false, error: err.message })
      })
      
      udpSocket!.bind(port || undefined)
    })
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('udp:send', async (_event, { address, port, message, isHex }) => {
  try {
    if (!udpSocket) {
      return { success: false, error: 'UDP socket not created' }
    }
    
    let data: Buffer
    if (isHex) {
      const hex = message.replace(/\s/g, '')
      data = Buffer.from(hex, 'hex')
    } else {
      data = Buffer.from(message, 'utf8')
    }
    
    return new Promise((resolve) => {
      udpSocket!.send(data, 0, data.length, port, address, (err) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true })
        }
      })
    })
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('udp:close', async () => {
  try {
    if (udpSocket) {
      udpSocket.close()
      udpSocket = null
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// TCP handlers
ipcMain.handle('tcp:connect', async (_event, { address, port }) => {
  try {
    if (tcpSocket) {
      tcpSocket.destroy()
    }
    
    tcpSocket = new net.Socket()
    
    return new Promise((resolve) => {
      tcpSocket!.connect(port, address, () => {
        if (mainWindow) {
          mainWindow.webContents.send('tcp:on-status', { status: 'connected' })
        }
        resolve({ success: true })
      })
      
      tcpSocket!.on('data', (data) => {
        if (mainWindow) {
          mainWindow.webContents.send('tcp:on-data', {
            data: data.toString('hex'),
            size: data.length
          })
        }
      })
      
      tcpSocket!.on('close', () => {
        if (mainWindow) {
          mainWindow.webContents.send('tcp:on-status', { status: 'disconnected' })
        }
      })
      
      tcpSocket!.on('error', (err) => {
        if (mainWindow) {
          mainWindow.webContents.send('tcp:on-status', { status: 'error', error: err.message })
        }
        resolve({ success: false, error: err.message })
      })
    })
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('tcp:send', async (_event, { message, isHex }) => {
  try {
    if (!tcpSocket || !tcpSocket.writable) {
      return { success: false, error: 'TCP socket not connected' }
    }
    
    let data: Buffer
    if (isHex) {
      const hex = message.replace(/\s/g, '')
      data = Buffer.from(hex, 'hex')
    } else {
      data = Buffer.from(message, 'utf8')
    }
    
    return new Promise((resolve) => {
      tcpSocket!.write(data, (err) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true })
        }
      })
    })
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('tcp:disconnect', async () => {
  try {
    if (tcpSocket) {
      tcpSocket.destroy()
      tcpSocket = null
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
