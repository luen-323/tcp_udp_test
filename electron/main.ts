import { app, BrowserWindow, ipcMain } from 'electron'
import * as dgram from 'dgram'
import * as net from 'net'
import * as path from 'path'

let mainWindow: BrowserWindow | null = null
let udpSocket: dgram.Socket | null = null
let tcpSocket: net.Socket | null = null
let tcpServer: net.Server | null = null
let tcpServerClients: net.Socket[] = []

function getPreloadPath(): string {
  if (app.isPackaged) {
    return path.join(__dirname, 'preload.js')
  }
  return path.join(__dirname, 'preload.js')
}

function getIndexPath(): string {
  if (app.isPackaged) {
    return path.join(__dirname, '../dist/index.html')
  }
  return path.join(process.cwd(), 'dist/index.html')
}

function createWindow() {
  const preloadPath = getPreloadPath()
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0F0F1A'
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = getIndexPath()
    mainWindow.loadFile(indexPath)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
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

// TCP Server handlers
ipcMain.handle('tcp:server:start', async (_event, { port }) => {
  try {
    if (tcpServer) {
      tcpServer.close()
    }
    
    tcpServerClients = []
    tcpServer = net.createServer()

    return new Promise((resolve) => {
      tcpServer!.listen(port, () => {
        if (mainWindow) {
          mainWindow.webContents.send('tcp:server:on-status', { 
            status: 'listening',
            message: `Server started on port ${port}` 
          })
        }
        resolve({ success: true })
      })

      tcpServer!.on('connection', (socket) => {
        const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`
        
        if (mainWindow) {
          mainWindow.webContents.send('tcp:server:on-client-connect', {
            address: socket.remoteAddress,
            port: socket.remotePort,
            id: clientAddress
          })
        }

        socket.on('data', (data) => {
          if (mainWindow) {
            mainWindow.webContents.send('tcp:server:on-data', {
              data: data.toString('hex'),
              size: data.length,
              address: socket.remoteAddress,
              port: socket.remotePort,
              id: clientAddress
            })
          }
        })

        socket.on('close', () => {
          if (mainWindow) {
            mainWindow.webContents.send('tcp:server:on-client-disconnect', {
              address: socket.remoteAddress,
              port: socket.remotePort,
              id: clientAddress
            })
          }
        })

        socket.on('error', (err) => {
          if (mainWindow) {
            mainWindow.webContents.send('tcp:server:on-error', {
              error: err.message,
              address: socket.remoteAddress,
              port: socket.remotePort,
              id: clientAddress
            })
          }
        })

        tcpServerClients.push(socket)
      })

      tcpServer!.on('error', (err) => {
        if (mainWindow) {
          mainWindow.webContents.send('tcp:server:on-status', { 
            status: 'error',
            error: err.message 
          })
        }
        resolve({ success: false, error: err.message })
      })
    })
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('tcp:server:send', async (_event, { clientId, message, isHex }) => {
  try {
    if (!tcpServer || tcpServerClients.length === 0) {
      return { success: false, error: 'No clients connected' }
    }

    let data: Buffer
    if (isHex) {
      const hex = message.replace(/\s/g, '')
      data = Buffer.from(hex, 'hex')
    } else {
      data = Buffer.from(message, 'utf8')
    }

    let sent = false
    const clientAddress = clientId || ''

    for (const client of tcpServerClients) {
      const targetClient = `${client.remoteAddress}:${client.remotePort}`
      if (!clientId || targetClient === clientAddress) {
        client.write(data)
        sent = true
      }
    }

    if (sent) {
      return { success: true }
    } else {
      return { success: false, error: 'Client not found' }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('tcp:server:broadcast', async (_event, { message, isHex }) => {
  try {
    if (!tcpServer || tcpServerClients.length === 0) {
      return { success: false, error: 'No clients connected' }
    }

    let data: Buffer
    if (isHex) {
      const hex = message.replace(/\s/g, '')
      data = Buffer.from(hex, 'hex')
    } else {
      data = Buffer.from(message, 'utf8')
    }

    for (const client of tcpServerClients) {
      client.write(data)
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('tcp:server:disconnect-client', async (_event, { clientId }) => {
  try {
    const targetAddress = clientId || ''
    
    for (let i = tcpServerClients.length - 1; i >= 0; i--) {
      const client = tcpServerClients[i]
      const clientAddress = `${client.remoteAddress}:${client.remotePort}`
      if (!clientId || clientAddress === targetAddress) {
        client.destroy()
        tcpServerClients.splice(i, 1)
      }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('tcp:server:stop', async () => {
  try {
    for (const client of tcpServerClients) {
      client.destroy()
    }
    tcpServerClients = []

    if (tcpServer) {
      tcpServer.close()
      tcpServer = null
    }

    if (mainWindow) {
      mainWindow.webContents.send('tcp:server:on-status', { 
        status: 'stopped',
        message: 'Server stopped' 
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (udpSocket) {
      udpSocket.close()
    }
    if (tcpSocket) {
      tcpSocket.destroy()
    }
    if (tcpServer) {
      tcpServer.close()
    }
    app.quit()
  }
})
