const { app, BrowserWindow, Menu, Tray, dialog, shell, nativeImage, powerSaveBlocker, ipcMain, net } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')

const logFile = path.join(os.tmpdir(), 'ozelhaber_desktop.log')
function log(...items) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${items.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join(' ')}\n`)
  } catch {}
}

log('App starting with args:', process.argv)

const GITHUB_PAGES_URL = 'https://mserman90.github.io/ozelhaber/'
const VERCEL_URL = 'https://haber-vert.vercel.app/'
let currentAppUrl = process.env.OZELHABER_URL || GITHUB_PAGES_URL

const args = process.argv.slice(1).map((arg) => arg.toLowerCase())
const screensaverMode = args.some(a => a === '/s' || a.startsWith('/s')) || args.includes('--screensaver')
const configMode = args.some(a => a === '/c' || a.startsWith('/c')) || args.includes('--config')
const previewMode = args.some(a => a === '/p' || a.startsWith('/p')) || args.includes('--preview')

let mainWindow
let tray
let blockerId
let quitting = false

app.setName('ÖzelHaber')
app.on('before-quit', () => {
  log('before-quit fired')
  quitting = true
})

// Single instance lock for regular desktop mode
if (!screensaverMode && !configMode && !previewMode) {
  const gotTheLock = app.requestSingleInstanceLock()
  log('requestSingleInstanceLock gotTheLock:', gotTheLock)
  if (!gotTheLock) {
    log('Could not get lock, quitting')
    app.quit()
    process.exit(0)
  }
  app.on('second-instance', () => {
    log('second-instance triggered')
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

function isNewerVersion(remote, local) {
  if (!remote || !local) return false
  const r = (remote.replace(/^v/, '').split('.')).map(n => parseInt(n, 10) || 0)
  const l = (local.replace(/^v/, '').split('.')).map(n => parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i++) {
    const rv = r[i] || 0
    const lv = l[i] || 0
    if (rv > lv) return true
    if (rv < lv) return false
  }
  return false
}

// GitHub Releases Update Checker
async function checkGitHubUpdates(manual = false) {
  try {
    const response = await net.fetch('https://api.github.com/repos/mserman90/ozelhaber/releases/latest', {
      headers: { 'User-Agent': `OzelHaber-Desktop-App/${app.getVersion()}` },
    })
    if (!response.ok) {
      if (manual && mainWindow && !mainWindow.isDestroyed()) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Güncelleme',
          message: 'GitHub sürüm bilgisi alınamadı.',
        })
      }
      return
    }
    const release = await response.json()
    const latestTag = (release.tag_name || '').trim()
    const currentVersion = 'v' + app.getVersion()

    if (isNewerVersion(latestTag, currentVersion)) {
      const dialogOpts = {
        type: 'info',
        title: 'Yeni Güncelleme Mevcut',
        message: `ÖzelHaber ${latestTag} sürümü yayınlandı! (Mevcut: ${currentVersion})`,
        detail: `${release.name || ''}\n\nİndirmek için indirme bağlantısını açmak ister misiniz?`,
        buttons: ['İndir / Güncelle', 'Daha Sonra'],
        defaultId: 0,
        cancelId: 1,
      }
      const { response: choice } = (mainWindow && !mainWindow.isDestroyed())
        ? await dialog.showMessageBox(mainWindow, dialogOpts)
        : await dialog.showMessageBox(dialogOpts)

      if (choice === 0) {
        const setupAsset = (release.assets || []).find(a => a.name.endsWith('.exe'))
        shell.openExternal(setupAsset ? setupAsset.browser_download_url : release.html_url)
      }
    } else if (manual && mainWindow && !mainWindow.isDestroyed()) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Güncellemeler',
        message: 'Uygulamanız güncel!',
        detail: `En son ÖzelHaber masaüstü sürümünü (${currentVersion}) kullanıyorsunuz.`,
      })
    }
  } catch (error) {
    if (manual && mainWindow && !mainWindow.isDestroyed()) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Hata',
        message: 'Güncellemeler denetlenirken bir sorun oluştu.',
        detail: error.message || 'Bağlantı hatası',
      })
    }
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
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 ÖzelHaber/${app.getVersion()}`,
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

  // Ensure fresh content on launch
  mainWindow.webContents.session.clearCache().catch(() => {})

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      const allowedOrigins = [new URL(GITHUB_PAGES_URL).origin, new URL(VERCEL_URL).origin]
      if (!allowedOrigins.includes(new URL(url).origin)) {
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
        buttons: ['Yeniden Dene', 'Yedek Yayına Geç (Vercel)', 'Kapat'],
        defaultId: 0,
        cancelId: 2,
      }).then(({ response }) => {
        if (response === 0) {
          mainWindow?.loadURL(currentAppUrl)
        } else if (response === 1) {
          currentAppUrl = currentAppUrl === GITHUB_PAGES_URL ? VERCEL_URL : GITHUB_PAGES_URL
          mainWindow?.loadURL(currentAppUrl)
          updateTrayMenu()
        } else {
          app.quit()
        }
      })
    }
  })

  // Keyboard shortcut handlers (F5 / Ctrl+R to reload ignoring cache)
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (isScreensaver) {
      if (input.type === 'keyDown') closeScreensaver(mainWindow)
    } else {
      if (input.type === 'keyDown') {
        if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
          mainWindow.webContents.reloadIgnoringCache()
        }
      }
    }
  })

  if (isScreensaver) {
    mainWindow.on('ready-to-show', () => {
      log('screensaver ready-to-show')
      mainWindow?.show()
    })
  } else {
    mainWindow.on('ready-to-show', () => {
      log('desktop ready-to-show')
      mainWindow?.show()
    })
    mainWindow.on('closed', () => {
      log('mainWindow closed')
      mainWindow = null
    })
    mainWindow.on('close', (event) => {
      log('mainWindow close event, tray:', Boolean(tray), 'quitting:', quitting)
      if (tray && !quitting) {
        event.preventDefault()
        mainWindow?.hide()
      }
    })
  }

  mainWindow.loadURL(currentAppUrl, {
    extraHeaders: 'pragma: no-cache\ncache-control: no-cache\n',
  })
}

function updateTrayMenu() {
  if (!tray) return
  try {
    const isAutoStart = app.getLoginItemSettings().openAtLogin

    const contextMenu = Menu.buildFromTemplate([
      { label: 'ÖzelHaber’i Aç', click: showDesktop },
      {
        label: 'Haber Panosunu Yenile (F5)',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.reloadIgnoringCache()
          }
        },
      },
      { type: 'separator' },
      { label: 'Ekran koruyucuyu başlat', click: () => { createWindow(true) } },
      { label: 'Windows Ekran Koruyucu Ayarları...', click: () => { shell.openPath('rundll32.exe desk.cpl,InstallScreenSaver') } },
      { type: 'separator' },
      {
        label: 'Yayın Kaynağı: GitHub Pages',
        type: 'radio',
        checked: currentAppUrl === GITHUB_PAGES_URL,
        click: () => {
          currentAppUrl = GITHUB_PAGES_URL
          mainWindow?.loadURL(currentAppUrl)
        },
      },
      {
        label: 'Yayın Kaynağı: Vercel (Yedek)',
        type: 'radio',
        checked: currentAppUrl === VERCEL_URL,
        click: () => {
          currentAppUrl = VERCEL_URL
          mainWindow?.loadURL(currentAppUrl)
        },
      },
      { type: 'separator' },
      {
        label: 'Windows ile Birlikte Başlat',
        type: 'checkbox',
        checked: isAutoStart,
        click: (item) => {
          app.setLoginItemSettings({ openAtLogin: item.checked, openAsHidden: true })
        },
      },
      { label: 'Güncellemeleri Denetle...', click: () => checkGitHubUpdates(true) },
      { type: 'separator' },
      { label: 'Çıkış', click: () => { quitting = true; app.quit() } },
    ])
    tray.setContextMenu(contextMenu)
  } catch (err) {
    console.error('Tray menu update error:', err)
  }
}

function makeTray() {
  try {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png')))
    tray.setToolTip('ÖzelHaber — haber masaüstü panosu')
    updateTrayMenu()
    tray.on('double-click', showDesktop)
  } catch (err) {
    console.error('Tray creation error:', err)
  }
}

process.on('uncaughtException', (err) => log('uncaughtException:', err.stack || err))
process.on('unhandledRejection', (reason) => log('unhandledRejection:', reason))

if (configMode) {
  log('Running in configMode')
  app.whenReady().then(() => dialog.showMessageBox({
    type: 'info',
    title: 'ÖzelHaber ekran koruyucu',
    message: 'Windows Ekran Koruyucusu ayarlarından ÖzelHaber.scr dosyasını seçebilirsiniz.',
    detail: 'Masaüstü sürümünde uygulamayı açıp haber panosunu kullanabilirsiniz. Ekran koruyucu, fare veya klavye etkinliğinde kapanır.',
  }).then(() => app.quit()))
} else {
  app.whenReady().then(() => {
    log('app whenReady fired, screensaverMode:', screensaverMode, 'previewMode:', previewMode)
    if (screensaverMode) {
      blockerId = powerSaveBlocker.start('prevent-display-sleep')
      createWindow(true)
    } else {
      createWindow(false)
      if (!previewMode) {
        makeTray()
        // Check for updates silently on startup
        setTimeout(() => checkGitHubUpdates(false), 5000)
      }
    }
  })
}

app.on('activate', () => { if (!screensaverMode) showDesktop() })
app.on('window-all-closed', () => {
  log('window-all-closed event fired')
  if (process.platform !== 'darwin' || screensaverMode) app.quit()
})
app.on('will-quit', () => {
  log('will-quit event fired')
  if (blockerId !== undefined && powerSaveBlocker.isStarted(blockerId)) powerSaveBlocker.stop(blockerId)
})
