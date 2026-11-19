const { app, BrowserWindow, Menu, Tray, dialog, shell, nativeImage, powerSaveBlocker, ipcMain, net } = require('electron')
const path = require('node:path')

const APP_URL = process.env.OZELHABER_URL || 'https://mserman90.github.io/ozelhaber/'
const APP_ORIGIN = new URL(APP_URL).origin
const args = process.argv.slice(1).map((arg) => arg.toLowerCase())
const screensaverMode = args.some(a => a === '/s' || a.startsWith('/s')) || args.includes('--screensaver')
const configMode = args.some(a => a === '/c' || a.startsWith('/c')) || args.includes('--config')
const previewMode = args.some(a => a === '/p' || a.startsWith('/p')) || args.includes('--preview')

let mainWindow
let tray
let blockerId
let quitting = false

app.setName('ÖzelHaber')
app.on('before-quit', () => { quitting = true })

// Single instance lock for regular desktop mode
if (!screensaverMode && !configMode && !previewMode) {
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
    process.exit(0)
  }
  app.on('second-instance', () => {
    showDesktop()
  })
}

function showDesktop() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
    return
  }
  createWindow(false)
}

function closeScreensaver(window) {
  if (screensaverMode) {
    quitting = true
    app.quit()
  } else if (window && !window.isDestroyed()) {
    window.close()
  }
}

// IPC Handlers
ipcMain.on('screensaver-exit', () => {
  closeScreensaver(mainWindow)
})

ipcMain.handle('fetch-feed', async (_event, feedUrl) => {
  try {
    const parsed = new URL(feedUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, error: 'Only http/https URLs are allowed' }
    }
    const response = await net.fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 ÖzelHaber/0.2.0',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    })
    if (!response.ok) {
      return { ok: false, status: response.status, error: `HTTP ${response.status} ${response.statusText}` }
    }
    const text = await response.text()
    return { ok: true, data: text }
  } catch (error) {
    return { ok: false, error: error.message || 'Network error' }
  }
})

ipcMain.handle('open-screensaver-settings', () => {
  shell.openPath('rundll32.exe desk.cpl,InstallScreenSaver')
})

ipcMain.handle('get-auto-launch', () => {
  return app.getLoginItemSettings().openAtLogin
})

ipcMain.handle('set-auto-launch', (_event, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled),
    openAsHidden: true,
  })
  return app.getLoginItemSettings().openAtLogin
})

function createWindow(isScreensaver = screensaverMode) {
  mainWindow = new BrowserWindow({
    width: previewMode ? 480 : 1440,
    height: previewMode ? 270 : 900,
    minWidth: previewMode ? 320 : 800,
    minHeight: previewMode ? 180 : 600,
    title: 'ÖzelHaber',
    icon: path.join(__dirname, 'assets', 'tray.png'),
    show: false,
    autoHideMenuBar: true,
    fullscreen: isScreensaver,
    kiosk: isScreensaver,
    alwaysOnTop: isScreensaver,
    backgroundColor: '#080a0f',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      if (new URL(url).origin !== APP_ORIGIN) {
        event.preventDefault()
        if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url)
      }
    } catch {
      event.preventDefault()
    }
  })

  mainWindow.webContents.on('did-fail-load', (_event, code, description, validatedURL, isMainFrame) => {
    if (isMainFrame && !quitting) {
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'ÖzelHaber bağlantısı yok',
        message: 'Haber panosu yüklenemedi.',
        detail: `İnternet bağlantınızı kontrol edip yeniden deneyin. (${description}, ${code})\n${validatedURL}`,
        buttons: ['Yeniden Dene', 'Kapat'],
        defaultId: 0,
        cancelId: 1,
      }).then(({ response }) => response === 0 ? mainWindow?.loadURL(APP_URL) : app.quit())
    }
  })

  if (isScreensaver) {
    mainWindow.on('ready-to-show', () => mainWindow?.show())
    mainWindow.webContents.on('before-input-event', (_event, input) => {
      if (input.type === 'keyDown') {
        closeScreensaver(mainWindow)
      }
    })
  } else {
    mainWindow.on('ready-to-show', () => mainWindow?.show())
    mainWindow.on('closed', () => { mainWindow = null })
    mainWindow.on('close', (event) => {
      if (tray && !quitting) {
        event.preventDefault()
        mainWindow?.hide()
      }
    })
  }

  mainWindow.loadURL(APP_URL)
}

function updateTrayMenu() {
  if (!tray) return
  const isAutoStart = app.getLoginItemSettings().openAtLogin

  const contextMenu = Menu.buildFromTemplate([
    { label: 'ÖzelHaber’i Aç', click: showDesktop },
    { label: 'Ekran koruyucuyu başlat', click: () => { createWindow(true) } },
    { label: 'Windows Ekran Koruyucu Ayarları...', click: () => { shell.openPath('rundll32.exe desk.cpl,InstallScreenSaver') } },
    { type: 'separator' },
    {
      label: 'Windows ile Birlikte Başlat',
      type: 'checkbox',
      checked: isAutoStart,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked, openAsHidden: true })
      },
    },
    { type: 'separator' },
    { label: 'Çıkış', click: () => { quitting = true; app.quit() } },
  ])
  tray.setContextMenu(contextMenu)
}

function makeTray() {
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png')))
  tray.setToolTip('ÖzelHaber — haber masaüstü panosu')
  updateTrayMenu()
  tray.on('double-click', showDesktop)
}

if (configMode) {
  app.whenReady().then(() => dialog.showMessageBox({
    type: 'info',
    title: 'ÖzelHaber ekran koruyucu',
    message: 'Windows Ekran Koruyucusu ayarlarından ÖzelHaber.scr dosyasını seçebilirsiniz.',
    detail: 'Masaüstü sürümünde uygulamayı açıp haber panosunu kullanabilirsiniz. Ekran koruyucu, fare veya klavye etkinliğinde kapanır.',
  }).then(() => app.quit()))
} else {
  app.whenReady().then(() => {
    if (screensaverMode) {
      blockerId = powerSaveBlocker.start('prevent-display-sleep')
      createWindow(true)
    } else {
      createWindow(false)
      if (!previewMode) makeTray()
    }
  })
}

app.on('activate', () => { if (!screensaverMode) showDesktop() })
app.on('window-all-closed', () => { if (process.platform !== 'darwin' || screensaverMode) app.quit() })
app.on('will-quit', () => { if (blockerId !== undefined && powerSaveBlocker.isStarted(blockerId)) powerSaveBlocker.stop(blockerId) })
