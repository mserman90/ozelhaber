const { contextBridge, ipcRenderer } = require('electron')

// Detect whether running in screensaver mode from search/query or IPC
const isScreensaver = process.argv.some(arg => arg.toLowerCase().includes('screensaver') || arg.toLowerCase().startsWith('/s'))

if (isScreensaver) {
  let startX = null
  let startY = null
  const THRESHOLD = 12

  const onMouseMove = (event) => {
    if (startX === null || startY === null) {
      startX = event.screenX
      startY = event.screenY
      return
    }
    const delta = Math.abs(event.screenX - startX) + Math.abs(event.screenY - startY)
    if (delta > THRESHOLD) {
      ipcRenderer.send('screensaver-exit')
    }
  }

  const onActivity = () => {
    ipcRenderer.send('screensaver-exit')
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mousedown', onActivity, { passive: true })
  window.addEventListener('keydown', onActivity, { passive: true })
}

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  isScreensaver,
  fetchFeed: (url) => ipcRenderer.invoke('fetch-feed', url),
  exitScreensaver: () => ipcRenderer.send('screensaver-exit'),
  openScreenSaverSettings: () => ipcRenderer.invoke('open-screensaver-settings'),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),
})
