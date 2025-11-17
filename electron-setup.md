# 🖥️ Transformar em App Desktop (Electron)

## Passos para criar executável:

### 1. Instalar Electron
```bash
npm install --save-dev electron electron-builder
npm install --save-dev concurrently wait-on
```

### 2. Criar arquivo electron.js na raiz:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'public/icone.png'),
    title: 'Preambulo Tech - Gerenciador de Propostas'
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### 3. Adicionar no package.json:
```json
{
  "main": "public/electron.js",
  "scripts": {
    "electron": "electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "build-electron": "npm run build && electron-builder",
    "dist": "npm run build && electron-builder --publish=never"
  },
  "build": {
    "appId": "com.preambulo.propostas",
    "productName": "Preambulo Tech",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "public/electron.js",
      "node_modules/**/*"
    ],
    "win": {
      "icon": "public/icone.png",
      "target": "nsis"
    }
  }
}
```

### 4. Gerar executável:
```bash
npm run dist
```

**Vantagens:**
- ✅ App nativo do Windows
- ✅ Ícone na área de trabalho
- ✅ Funciona offline
- ✅ Instalação simples (.exe)

**Desvantagens:**
- ❌ Arquivo grande (~150MB)
- ❌ Precisa atualizar manualmente