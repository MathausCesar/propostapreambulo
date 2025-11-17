/**
 * Regras de precificação simplificadas - sem pacotes
 * Cobrança direta por volume com tiers
 */

// Preços fixos
export const FIXED_PRICES = {
  // Treinamentos Office ADV
  trainingReportPowerBI: 1500,
  trainingDocGenerator: 1200,
  trainingControlling: 1800,
  trainingFinance: 1500,
  boletoBancario: 800,
  
  // Pacotes
  starter: 899,
  
  // Consultoria por hora
  consultingHourly: 225,
  
  // Módulos mensais
  officeApi: 0, // definir conforme necessário
  officeFinanceAdvanced: 299,
  
  // CPJ
  cpjNfePerCnpj: 99,
};

// Preços unitários
export const UNIT_PRICES = {
  officeUser: 80,
  officePublication: 30,
  officeIntimation: 60,
  cpjUser: 106,
  cpjPublication: 80,
};

/**
 * Monitoramento - tiers com limites anuais
 * 500 mensais (6000 anuais) = R$ 0,30/crédito
 * 1000 mensais (12000 anuais) = R$ 0,20/crédito
 * 2000 mensais (24000 anuais) = R$ 0,15/crédito
 * Acima de 2000 mensais = R$ 0,12/crédito
 */
export function calculateMonitoring(monthlyCredits: number): { 
  monthly: number; 
  annual: number; 
  pricePerCredit: number;
  tierDescription: string;
} {
  const qty = Math.max(0, Math.floor(monthlyCredits));
  if (qty === 0) return { monthly: 0, annual: 0, pricePerCredit: 0, tierDescription: '-' };
  
  let pricePerCredit = 0.12;
  let tierDescription = 'Acima de 2000 créditos mensais';
  
  if (qty <= 500) {
    pricePerCredit = 0.30;
    tierDescription = `${qty} créditos mensais (até 6000 anuais)`;
  } else if (qty <= 1000) {
    pricePerCredit = 0.20;
    tierDescription = `${qty} créditos mensais (até 12000 anuais)`;
  } else if (qty <= 2000) {
    pricePerCredit = 0.15;
    tierDescription = `${qty} créditos mensais (até 24000 anuais)`;
  } else {
    tierDescription = `${qty} créditos mensais`;
  }
  
  const monthly = qty * pricePerCredit;
  const annual = monthly * 12;
  
  return { monthly, annual, pricePerCredit, tierDescription };
}

/**
 * Distribuição - tiers com limites anuais
 * 20 mensais (240 anuais) = R$ 25,00/processo
 * 50 mensais (600 anuais) = R$ 20,00/processo
 * 100 mensais (1200 anuais) = R$ 15,00/processo
 * Acima de 100 mensais = R$ 12,00/processo
 */
export function calculateDistribution(monthlyProcesses: number): {
  monthly: number;
  annual: number;
  pricePerProcess: number;
  tierDescription: string;
} {
  const qty = Math.max(0, Math.floor(monthlyProcesses));
  if (qty === 0) return { monthly: 0, annual: 0, pricePerProcess: 0, tierDescription: '-' };
  
  let pricePerProcess = 12.00;
  let tierDescription = 'Acima de 100 processos mensais';
  
  if (qty <= 20) {
    pricePerProcess = 25.00;
    tierDescription = `${qty} processos mensais (até 240 anuais)`;
  } else if (qty <= 50) {
    pricePerProcess = 20.00;
    tierDescription = `${qty} processos mensais (até 600 anuais)`;
  } else if (qty <= 100) {
    pricePerProcess = 15.00;
    tierDescription = `${qty} processos mensais (até 1200 anuais)`;
  } else {
    tierDescription = `${qty} processos mensais`;
  }
  
  const monthly = qty * pricePerProcess;
  const annual = monthly * 12;
  
  return { monthly, annual, pricePerProcess, tierDescription };
}

/**
 * Protocolos - tiers com limites anuais
 * 250 mensais (3000 anuais) = R$ 2,50/protocolo
 * 417 mensais (5000 anuais) = R$ 2,20/protocolo
 * 833 mensais (10000 anuais) = R$ 2,00/protocolo
 * Acima de 833 mensais = R$ 1,80/protocolo
 */
export function calculateProtocols(monthlyProtocols: number): {
  monthly: number;
  annual: number;
  pricePerProtocol: number;
  tierDescription: string;
} {
  const qty = Math.max(0, Math.floor(monthlyProtocols));
  if (qty === 0) return { monthly: 0, annual: 0, pricePerProtocol: 0, tierDescription: '-' };
  
  let pricePerProtocol = 1.80;
  let tierDescription = 'Acima de 833 protocolos mensais';
  
  if (qty <= 250) {
    pricePerProtocol = 2.50;
    tierDescription = `${qty} protocolos mensais (até 3000 anuais)`;
  } else if (qty <= 417) {
    pricePerProtocol = 2.20;
    tierDescription = `${qty} protocolos mensais (até 5000 anuais)`;
  } else if (qty <= 833) {
    pricePerProtocol = 2.00;
    tierDescription = `${qty} protocolos mensais (até 10000 anuais)`;
  } else {
    tierDescription = `${qty} protocolos mensais`;
  }
  
  const monthly = qty * pricePerProtocol;
  const annual = monthly * 12;
  
  return { monthly, annual, pricePerProtocol, tierDescription };
}

/**
 * Docs IA - tiers com limites anuais
 * 10 mensais (120 anuais) = R$ 7,50/documento
 * 50 mensais (600 anuais) = R$ 6,50/documento
 * 100 mensais (1200 anuais) = R$ 5,50/documento
 * Acima de 100 mensais = R$ 5,00/documento
 */
export function calculateDocsIA(monthlyDocs: number): {
  monthly: number;
  annual: number;
  pricePerDoc: number;
  tierDescription: string;
} {
  const qty = Math.max(0, Math.floor(monthlyDocs));
  if (qty === 0) return { monthly: 0, annual: 0, pricePerDoc: 0, tierDescription: '-' };
  
  let pricePerDoc = 5.00;
  let tierDescription = 'Acima de 100 documentos mensais';
  
  if (qty <= 10) {
    pricePerDoc = 7.50;
    tierDescription = `${qty} documentos mensais (até 120 anuais)`;
  } else if (qty <= 50) {
    pricePerDoc = 6.50;
    tierDescription = `${qty} documentos mensais (até 600 anuais)`;
  } else if (qty <= 100) {
    pricePerDoc = 5.50;
    tierDescription = `${qty} documentos mensais (até 1200 anuais)`;
  } else {
    tierDescription = `${qty} documentos mensais`;
  }
  
  const monthly = qty * pricePerDoc;
  const annual = monthly * 12;
  
  return { monthly, annual, pricePerDoc, tierDescription };
}

/**
 * Migração Discovery
 * Cortesia até 2000 processos
 * Acima: R$ 0,25 por processo excedente
 */
export function calculateMigrationDiscovery(totalProcesses: number): number {
  const extra = Math.max(0, totalProcesses - 2000);
  return extra * 0.25;
}
