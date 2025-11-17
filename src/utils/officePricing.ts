import {
  ProposalFormState,
  OfficePricingResult,
  OfficePricingItem,
  PackageTier,
} from "../types";
import { getPackageConfig } from "../config/packages";

// Plano sugerido APENAS pelo número de usuários
function tierFromUsers(users: number): PackageTier {
  if (users <= 0) return "ONE";
  if (users <= 5) return "ONE";
  if (users <= 10) return "PRO";
  return "INFINITE";
}

// Inclusões do plano Office ADV por tier
function getOfficeInclusions(tier: PackageTier) {
  switch (tier) {
    case "ONE":
      return {
        users: 5,
        publications: 3,
        monitoring: 500,
        docs: 0, // Docs sempre cobrados por pacotes separados
        financeIncluded: false,
      };
    case "PRO":
      return {
        users: 10,
        publications: 5,
        monitoring: 1000,
        docs: 0, // Docs sempre cobrados por pacotes separados
        financeIncluded: true,
      };
    case "INFINITE":
      return {
        users: 20,
        publications: 20,
        monitoring: 1500,
        docs: 0, // Docs sempre cobrados por pacotes separados
        financeIncluded: true,
      };
    default:
      return {
        users: 0,
        publications: 0,
        monitoring: 0,
        docs: 0,
        financeIncluded: false,
      };
  }
}

// Tabelas de preços dinâmicos (mensais) conforme volumes
function getMonitoringUnitPrice(credits: number): number {
  if (credits <= 0) return 0;
  if (credits <= 500) return 0.3;
  if (credits <= 1000) return 0.2;
  if (credits <= 2000) return 0.15;
  return 0.12;
}

function getDistributionUnitPrice(processes: number): number {
  if (processes <= 0) return 0;
  if (processes <= 20) return 25;
  if (processes <= 50) return 20;
  if (processes <= 100) return 15;
  return 12;
}

function getProtocolUnitPrice(protocols: number): number {
  if (protocols <= 0) return 0;
  if (protocols <= 250) return 2.5;
  if (protocols <= 417) return 2.2;
  if (protocols <= 833) return 2.0;
  return 1.8;
}

/**
 * Calcula o resumo financeiro automático para Office ADV:
 *
 * - Escolhe SEMPRE o plano pelo número de usuários:
 *   ONE (até 5), PRO (até 10), INFINITE (acima de 10, até 20)
 * - Usuários acima de 20 são cobrados como adicionais (R$ 80,00 cada)
 * - Demais serviços sempre são adicionais (não fazem upgrade de plano)
 * - Mensalidade FINAL = mensalidade base do plano + todos os adicionais
 */
export function calculateOfficePricing(
  form: ProposalFormState
): OfficePricingResult | undefined {
  if (form.erp !== "OFFICE_ADV") return undefined;

  const requestedUsers = Math.max(0, form.officeUsers || 0);

  const effectiveTier: PackageTier = tierFromUsers(requestedUsers);
  const pkg = getPackageConfig("OFFICE_ADV", effectiveTier);
  if (!pkg) return undefined;

  const inclusions = getOfficeInclusions(effectiveTier);

  const baseMonthly = pkg.defaultMonthlyFee;
  const baseSetup = pkg.defaultSetupFee;

  const usersIncluded = inclusions.users;

  // Usuários extras: apenas acima do limite do INFINITE (>20)
  const usersExtra =
    effectiveTier === "INFINITE"
      ? Math.max(0, requestedUsers - usersIncluded)
      : 0;
  const usersExtraValue = usersExtra * 80;

  const items: OfficePricingItem[] = [];

  if (usersExtra > 0) {
    items.push({
      id: "users-extra",
      label: "Usuários adicionais (acima do Infinite)",
      quantity: usersExtra,
      unitPrice: 80,
      monthlyValue: usersExtraValue,
    });
  }

  // Publicações – excedentes sobre o plano
  const requestedPublications = Math.max(0, form.officePublications || 0);
  const publicationsIncluded = inclusions.publications;
  const publicationsExtra = Math.max(
    0,
    requestedPublications - publicationsIncluded
  );
  const publicationsUnitPrice = 30;
  const publicationsValue = publicationsExtra * publicationsUnitPrice;

  if (publicationsExtra > 0) {
    items.push({
      id: "publications-extra",
      label: "Publicações excedentes",
      quantity: publicationsExtra,
      unitPrice: publicationsUnitPrice,
      monthlyValue: publicationsValue,
    });
  }

  // Monitoramento – usa créditos incluídos + valor dinâmico por volume
  const requestedMonitoring = Math.max(
    0,
    form.officeMonitoringCredits || 0
  );
  const monitoringIncluded = inclusions.monitoring;
  const monitoringExtra = Math.max(
    0,
    requestedMonitoring - monitoringIncluded
  );
  const monitoringUnitPrice = getMonitoringUnitPrice(requestedMonitoring);
  const monitoringValue = monitoringExtra * monitoringUnitPrice;

  if (monitoringExtra > 0) {
    items.push({
      id: "monitoring-extra",
      label: "Créditos de monitoramento excedentes",
      quantity: monitoringExtra,
      unitPrice: monitoringUnitPrice,
      monthlyValue: monitoringValue,
    });
  }

  // Documentos IA – cobrança por pacotes completos (regra corrigida)
  const requestedDocs = Math.max(0, form.officeAiDocs || 0);
  
  if (requestedDocs > 0) {
    // Determinar o pacote baseado no volume solicitado
    let packageName = "";
    let monthlyLimit = 0;
    let yearlyLimit = 0;
    let unitPrice = 0;
    
    if (requestedDocs <= 10) {
      packageName = "Pacote 10 docs/mês";
      monthlyLimit = 10;
      yearlyLimit = 120;
      unitPrice = 7.50;
    } else if (requestedDocs <= 50) {
      packageName = "Pacote 50 docs/mês";
      monthlyLimit = 50;
      yearlyLimit = 600;
      unitPrice = 6.50;
    } else if (requestedDocs <= 100) {
      packageName = "Pacote 100 docs/mês";
      monthlyLimit = 100;
      yearlyLimit = 1200;
      unitPrice = 5.50;
    } else {
      packageName = `Pacote ${requestedDocs} docs/mês`;
      monthlyLimit = requestedDocs;
      yearlyLimit = requestedDocs * 12;
      unitPrice = 5.00;
    }

    const monthlyValue = requestedDocs * unitPrice;

    items.push({
      id: "ai-docs-package",
      label: `${packageName} (máx ${yearlyLimit}/ano)`,
      quantity: requestedDocs,
      unitPrice: unitPrice,
      monthlyValue: monthlyValue,
    });
  }

  // Distribuição – sempre adicional pelo volume informado
  const distributionVolume = Math.max(
    0,
    form.officeDistributionProcesses || 0
  );
  if (distributionVolume > 0) {
    const distributionUnitPrice =
      getDistributionUnitPrice(distributionVolume);
    const distributionValue =
      distributionVolume * distributionUnitPrice;
    items.push({
      id: "distribution",
      label: "Distribuição de processos",
      quantity: distributionVolume,
      unitPrice: distributionUnitPrice,
      monthlyValue: distributionValue,
    });
  }

  // Protocolos – sempre adicional pelo volume informado
  const protocolVolume = Math.max(0, form.officeProtocols || 0);
  if (protocolVolume > 0) {
    const protocolUnitPrice = getProtocolUnitPrice(protocolVolume);
    const protocolValue = protocolVolume * protocolUnitPrice;
    items.push({
      id: "protocols",
      label: "Protocolos eletrônicos",
      quantity: protocolVolume,
      unitPrice: protocolUnitPrice,
      monthlyValue: protocolValue,
    });
  }

  // Financeiro avançado – incluso em PRO e INFINITE, adicional no ONE
  const financeRequested = !!form.officeFinanceModule;
  let financeValue = 0;
  const financeIncluded = inclusions.financeIncluded;

  if (financeRequested && !financeIncluded) {
    financeValue = 299;
    items.push({
      id: "finance-module",
      label: "Módulo Financeiro Avançado",
      quantity: 1,
      unitPrice: financeValue,
      monthlyValue: financeValue,
    });
  }

  const addonsMonthly =
    usersExtraValue +
    publicationsValue +
    monitoringValue +
    docsValue +
    (distributionVolume > 0
      ? distributionVolume * getDistributionUnitPrice(distributionVolume)
      : 0) +
    (protocolVolume > 0
      ? protocolVolume * getProtocolUnitPrice(protocolVolume)
      : 0) +
    financeValue;

  const itemsMonthlySum = items.reduce(
    (acc, item) => acc + item.monthlyValue,
    0
  );

  // Por segurança, usamos a soma dos itens como addonsMonthlyFinal
  const addonsMonthlyFinal = itemsMonthlySum;

  const monthlyTotal = baseMonthly + addonsMonthlyFinal;
  const annualTotal = monthlyTotal * 12;

  const tierAdjusted = form.packageTier !== effectiveTier;
  const tierAdjustmentReason = tierAdjusted
    ? "Pacote ajustado automaticamente com base na quantidade de usuários."
    : undefined;

  return {
    effectiveTier,
    tierAdjusted,
    tierAdjustmentReason,
    baseMonthly,
    baseSetup,
    usersIncluded,
    usersRequested: requestedUsers,
    usersExtra,
    usersExtraValue,
    items,
    monthlyTotal,
    annualTotal,
  };
}
