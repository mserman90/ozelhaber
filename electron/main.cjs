const { app, BrowserWindow, Menu, Tray, dialog, shell, nativeImage, powerSaveBlocker } = require('electron')
const path = require('node:path')

const APP_URL = 'https://mserman90.github.io/ozelhaber/'
const APP_ORIGIN = new URL(APP_URL).origin
const args = process.argv.slice(1).map((arg) => arg.toLowerCase())
const screensaverMode = args.includes('/s') || args.includes('--screensaver')
const configMode = args.includes('/c') || args.includes('--config')
const previewMode = args.includes('/p') || args.includes('--preview')
let mainWindow
let tray
let blockerId
let quitting = false
let screensaverStartPoint

app.setName('ÖzelHaber')
app.on('before-quit', () => { quitting = true })

function showDesktop() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show()
    mainWindow.focus()
    return
  }
  createWindow(false)
}

function closeScreensaver(window) {
  if (screensaverMode) app.quit()
  else window.close()
}

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
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url)
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
    screensaverStartPoint = null
    mainWindow.on('ready-to-show', () => mainWindow?.show())
    mainWindow.webContents.on('before-input-event', (_event, input) => {
      if (input.type === 'keyDown' || input.type === 'mouseDown') {
        closeScreensaver(mainWindow)
      } else if (input.type === 'mouseMove') {
        const point = { x: input.x, y: input.y }
        if (screensaverStartPoint && Math.abs(point.x - screensaverStartPoint.x) + Math.abs(point.y - screensaverStartPoint.y) > 8) closeScreensaver(mainWindow)
        screensaverStartPoint = point
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

function makeTray() {
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png')))
  tray.setToolTip('ÖzelHaber — haber masaüstü panosu')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'ÖzelHaber’i Aç', click: showDesktop },
    { label: 'Ekran koruyucuyu başlat', click: () => { createWindow(true) } },
    { type: 'separator' },
    { label: 'Çıkış', click: () => { quitting = true; app.quit() } },
  ]))
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
