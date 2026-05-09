const { spawn, exec } = require('child_process')
const path = require('path')

console.log('Starting UDP/TCP Tester Development Environment...\n')

const isWindows = process.platform === 'win32'

function startVite() {
  return new Promise((resolve, reject) => {
    console.log('[1/2] Starting Vite development server...')
    
    const vite = isWindows 
      ? spawn('npm.cmd', ['run', 'dev'], { stdio: 'pipe' })
      : spawn('npm', ['run', 'dev'], { stdio: 'pipe' })
    
    let viteOutput = ''
    
    vite.stdout.on('data', (data) => {
      const output = data.toString()
      viteOutput += output
      console.log(output)
      
      if (output.includes('ready') || output.includes('localhost:5173')) {
        setTimeout(() => resolve(vite), 1000)
      }
    })
    
    vite.stderr.on('data', (data) => {
      console.error(data.toString())
    })
    
    vite.on('error', (err) => {
      reject(err)
    })
    
    setTimeout(() => {
      if (viteOutput.includes('ready')) {
        resolve(vite)
      } else {
        console.log('Waiting for Vite to be ready...')
        setTimeout(() => resolve(vite), 2000)
      }
    }, 3000)
  })
}

async function startElectron(viteProcess) {
  console.log('\n[2/2] Starting Electron...')
  
  const electronEnv = {
    ...process.env,
    VITE_DEV_SERVER_URL: 'http://localhost:5173/'
  }
  
  const electron = isWindows
    ? spawn('npm.cmd', ['run', 'start:electron'], { 
        stdio: 'inherit',
        env: electronEnv
      })
    : spawn('npm', ['run', 'start:electron'], { 
        stdio: 'inherit',
        env: electronEnv
      })
  
  electron.on('close', (code) => {
    console.log(`\nElectron closed with code ${code}`)
    viteProcess.kill()
    process.exit()
  })
  
  electron.on('error', (err) => {
    console.error('Failed to start Electron:', err)
    viteProcess.kill()
    process.exit(1)
  })
}

async function main() {
  try {
    const viteProcess = await startVite()
    await startElectron(viteProcess)
  } catch (error) {
    console.error('Failed to start development environment:', error)
    process.exit(1)
  }
}

main()
