const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  if (isDev) {
    // 在开发模式下加载 React 开发服务器
    // win.loadURL('http://localhost:3000');
    // 强制加载生产构建包用于测试
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  } else {
    // 在生产模式下加载打包后的文件
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})