/**
 * Utilitário para detecção de resolução e ajustes adaptativos para geração de PDF
 */

export interface DeviceInfo {
  width: number;
  height: number;
  dpr: number; // Device Pixel Ratio
  isHighDPI: boolean;
  screenType: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
}

export interface PDFConfig {
  scale: number;
  width: number;
  height: number;
  useCORS: boolean;
  allowTaint: boolean;
  backgroundColor: string;
  logging: boolean;
  scrollX: number;
  scrollY: number;
  windowWidth: number;
  windowHeight: number;
}

/**
 * Detecta informações do dispositivo atual
 */
export function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth || document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  
  let screenType: DeviceInfo['screenType'] = 'desktop';
  if (width < 768) {
    screenType = 'mobile';
  } else if (width < 1024) {
    screenType = 'tablet';
  } else if (width < 1440) {
    screenType = 'desktop';
  } else {
    screenType = 'large-desktop';
  }

  return {
    width,
    height,
    dpr,
    isHighDPI: dpr > 1,
    screenType
  };
}

/**
 * Gera configuração otimizada para html2canvas baseada no dispositivo
 */
export function getPDFConfig(deviceInfo: DeviceInfo): PDFConfig {
  // Base configuration
  let config: PDFConfig = {
    scale: 2, // Base scale
    width: 794, // A4 width at 96 DPI
    height: 1123, // A4 height at 96 DPI
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 794,
    windowHeight: 1123
  };

  // Ajustes baseados no DPI
  if (deviceInfo.isHighDPI) {
    // Para telas de alta resolução
    if (deviceInfo.dpr >= 3) {
      // iPhone/iPad Pro, monitores 4K
      config.scale = 1.5;
    } else if (deviceInfo.dpr >= 2) {
      // MacBook Retina, monitores Full HD
      config.scale = 1.8;
    }
  } else {
    // Telas de resolução normal
    config.scale = 2.2;
  }

  // Ajustes baseados no tipo de tela
  switch (deviceInfo.screenType) {
    case 'mobile':
      config.scale = Math.min(config.scale, 1.5); // Limita scale em mobile
      config.windowWidth = Math.min(deviceInfo.width, 794);
      break;
      
    case 'tablet':
      config.scale = Math.min(config.scale, 1.8);
      config.windowWidth = Math.min(deviceInfo.width, 794);
      break;
      
    case 'large-desktop':
      // Monitores grandes podem usar scale maior
      config.scale = Math.max(config.scale, 2.0);
      break;
  }

  // Força dimensões específicas para consistência
  config.windowWidth = 794;
  config.windowHeight = Math.floor(794 * 1.414); // Proporção A4

  console.log('PDF Config gerada:', {
    deviceInfo,
    config,
    calculatedSize: {
      width: config.width * config.scale,
      height: config.height * config.scale
    }
  });

  return config;
}

/**
 * Ajusta o elemento antes da captura para garantir renderização consistente
 */
export function prepareElementForCapture(element: HTMLElement, config: PDFConfig): () => void {
  // Salva estilos originais
  const originalStyles = {
    width: element.style.width,
    height: element.style.height,
    maxWidth: element.style.maxWidth,
    maxHeight: element.style.maxHeight,
    transform: element.style.transform,
    transformOrigin: element.style.transformOrigin,
    position: element.style.position,
    left: element.style.left,
    top: element.style.top,
    zIndex: element.style.zIndex
  };

  // Aplica estilos para captura
  element.style.width = `${config.width}px`;
  element.style.maxWidth = `${config.width}px`;
  element.style.minHeight = 'auto';
  element.style.position = 'relative';
  element.style.left = '0';
  element.style.top = '0';
  element.style.zIndex = '9999';
  element.style.transformOrigin = 'top left';
  
  // Remove qualquer transform que possa interferir
  element.style.transform = 'none';

  // Força reflow
  element.offsetHeight;

  // Função para restaurar estilos originais
  return () => {
    Object.entries(originalStyles).forEach(([prop, value]) => {
      if (value !== null) {
        (element.style as any)[prop] = value;
      }
    });
  };
}

/**
 * Gera configuração específica para diferentes tipos de elementos
 */
export function getElementSpecificConfig(elementId: string): Partial<PDFConfig> {
  const configs: Record<string, Partial<PDFConfig>> = {
    // Configurações específicas por tipo de elemento
    'proposal-preview': {
      backgroundColor: '#ffffff',
      scale: 2,
    },
    'investment-table': {
      scale: 2.5, // Escala maior para tabelas
    },
    'header-section': {
      scale: 1.8, // Escala menor para headers
    }
  };

  return configs[elementId] || {};
}

/**
 * Detecta se o dispositivo tem problemas conhecidos com html2canvas
 */
export function hasKnownIssues(deviceInfo: DeviceInfo): boolean {
  // Lista de dispositivos/configurações com problemas conhecidos
  const problematicConfigs = [
    // iPhones com zoom
    deviceInfo.screenType === 'mobile' && deviceInfo.dpr > 2,
    // Monitores 4K com escala do Windows
    deviceInfo.width > 3000 && deviceInfo.dpr > 2,
    // Tablets em orientação específica
    deviceInfo.screenType === 'tablet' && deviceInfo.width / deviceInfo.height < 1
  ];

  return problematicConfigs.some(condition => condition);
}

/**
 * Aplica workarounds para dispositivos problemáticos
 */
export function applyWorkarounds(config: PDFConfig, deviceInfo: DeviceInfo): PDFConfig {
  if (!hasKnownIssues(deviceInfo)) {
    return config;
  }

  const workaroundConfig = { ...config };

  if (deviceInfo.screenType === 'mobile' && deviceInfo.dpr > 2) {
    // iPhone com alta resolução
    workaroundConfig.scale = 1.2;
    workaroundConfig.allowTaint = true;
  }

  if (deviceInfo.width > 3000) {
    // Monitor 4K
    workaroundConfig.scale = 1.5;
    workaroundConfig.windowWidth = 1200;
  }

  return workaroundConfig;
}