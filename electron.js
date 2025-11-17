const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Forçar modo produção para testes
const isDev = false;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false // Desabilitar para evitar problemas CORS local
    },
    show: true, // Mostrar imediatamente para debug
    titleBarStyle: 'default'
  });

  // SEMPRE abrir DevTools para debug
  mainWindow.webContents.openDevTools();

  // Log detalhado para debug
  const appPath = app.getAppPath();
  
  // Carregar aplicação principal
  const indexPath = path.join(__dirname, 'index.html');
  
  console.log('=== DEBUG ELECTRON ===');
  console.log('App Path:', appPath);
  console.log('__dirname:', __dirname);
  console.log('Index Path:', indexPath);
  console.log('Index existe?', fs.existsSync(indexPath));
  
  // Verificar onde estão as imagens
  const images = ['icone.png', 'preambulo.png', 'office.png', '3cplus.png', 'cobranca.png'];
  console.log('=== VERIFICAÇÃO DE IMAGENS ===');
  images.forEach(img => {
    const pathDirname = path.join(__dirname, img);
    const pathAppPath = path.join(appPath, img);
    console.log(`${img}:`);
    console.log(`  - Em __dirname (${__dirname}): ${fs.existsSync(pathDirname) ? 'EXISTS' : 'NOT FOUND'}`);
    console.log(`  - Em appPath (${appPath}): ${fs.existsSync(pathAppPath) ? 'EXISTS' : 'NOT FOUND'}`);
  });
  
  if (fs.existsSync(indexPath)) {
    console.log('Carregando aplicação principal:', indexPath);
    mainWindow.loadFile(indexPath);
  } else {
    // Tentar caminhos alternativos para desenvolvimento
    const altPath1 = path.join(appPath, 'dist', 'index.html');
    const altPath2 = path.join(__dirname, 'dist', 'index.html');
    
    console.log('Tentando path alternativo 1:', altPath1);
    console.log('Existe?', fs.existsSync(altPath1));
    
    if (fs.existsSync(altPath1)) {
      mainWindow.loadFile(altPath1);
    } else {
      console.log('Tentando path alternativo 2:', altPath2);
      console.log('Existe?', fs.existsSync(altPath2));
      
      if (fs.existsSync(altPath2)) {
        mainWindow.loadFile(altPath2);
      } else {
        // Mostrar erro detalhado
        const errorHtml = `
          <html>
            <head><title>Erro - Debug</title></head>
            <body style="font-family: Arial; padding: 20px; background: #f0f0f0;">
              <h1>❌ Erro ao Carregar Aplicação</h1>
              <h2>Informações de Debug:</h2>
              <ul>
                <li><strong>App Path:</strong> ${appPath}</li>
                <li><strong>__dirname:</strong> ${__dirname}</li>
                <li><strong>Index Path:</strong> ${indexPath}</li>
                <li><strong>Alt Path 1:</strong> ${altPath1}</li>
                <li><strong>Alt Path 2:</strong> ${altPath2}</li>
                <li><strong>Process CWD:</strong> ${process.cwd()}</li>
              </ul>
              <h2>Arquivos na pasta atual:</h2>
              <pre>${fs.readdirSync(__dirname).join('\n')}</pre>
            </body>
          </html>
        `;
        mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
      }
    }
  }

  // Log de eventos para debug
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Iniciou carregamento...');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Terminou carregamento!');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('FALHA NO CARREGAMENTO:', {
      errorCode,
      errorDescription,
      validatedURL
    });
    
    dialog.showErrorBox('Erro de Carregamento', 
      `Código: ${errorCode}\nDescrição: ${errorDescription}\nURL: ${validatedURL}`
    );
  });

  // Menu simples
  const template = [
    {
      label: 'Debug',
      submenu: [
        { 
          label: 'Recarregar', 
          accelerator: 'F5',
          click: () => mainWindow.reload() 
        },
        { 
          label: 'DevTools', 
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools() 
        },
        { 
          label: 'Sair', 
          click: () => app.quit() 
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

console.log('Electron iniciado - Modo Debug Ativo');