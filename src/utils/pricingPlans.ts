import { PackageTier, ErpProduct } from "../types";

/**
 * Definição dos planos Office ADV
 */
export const OFFICE_ADV_PLANS: Record<PackageTier, {
  label: string;
  monthlyPrice: number;
  inclusions: {
    users: number;
    publications: number;
    monitoring: number;
    docs: number;
    financeIncluded: boolean;
  };
}> = {
  ONE: {
    label: "Office ADV ONE",
    monthlyPrice: 399,
    inclusions: {
      users: 5,
      publications: 3,
      monitoring: 500,
      docs: 5,
      financeIncluded: false,
    },
  },
  PRO: {
    label: "Office ADV PRO",
    monthlyPrice: 699,
    inclusions: {
      users: 10,
      publications: 5,
      monitoring: 1000,
      docs: 10,
      financeIncluded: true,
    },
  },
  INFINITE: {
    label: "Office ADV INFINITE",
    monthlyPrice: 1190,
    inclusions: {
      users: 20,
      publications: 20,
      monitoring: 1500,
      docs: 10,
      financeIncluded: true,
    },
  },
};

/**
 * Definição dos planos CPJ-3C+
 */
export const CPJ3C_PLANS: Record<PackageTier, {
  label: string;
  monthlyPrice: number;
  inclusions: {
    users: number;
    publications: number;
    monitoring: number;
    docs: number;
    nfe: number;
    storage: number;
    agentTokens: number;
    bankPlan: string;
    boletos: number;
    financeType: "Padrão" | "Avançado";
    unlimitedProcesses: boolean;
  };
}> = {
  ONE: {
    label: "CPJ-3C+ ONE",
    monthlyPrice: 1499,
    inclusions: {
      users: 10,
      publications: 3,
      monitoring: 1500,
      docs: 20,
      nfe: 1,
      storage: 80,
      agentTokens: 10000,
      bankPlan: "Preâmbulo Bank Essencial",
      boletos: 50,
      financeType: "Padrão",
      unlimitedProcesses: true,
    },
  },
  PRO: {
    label: "CPJ-3C+ PRO",
    monthlyPrice: 2999,
    inclusions: {
      users: 25,
      publications: 5,
      monitoring: 3000,
      docs: 50,
      nfe: 2,
      storage: 200,
      agentTokens: 20000,
      bankPlan: "Preâmbulo Bank Growth",
      boletos: 100,
      financeType: "Avançado",
      unlimitedProcesses: true,
    },
  },
  INFINITE: {
    label: "CPJ-3C+ INFINITE",
    monthlyPrice: 4499,
    inclusions: {
      users: 40,
      publications: 10,
      monitoring: 5000,
      docs: 80,
      nfe: 3,
      storage: 500,
      agentTokens: 50000,
      bankPlan: "Preâmbulo Bank Growth",
      boletos: 150,
      financeType: "Avançado",
      unlimitedProcesses: true,
    },
  },
};

/**
 * Preços unitários - Office ADV
 */
export const OFFICE_UNIT_PRICES = {
  user: 80,
  publication: 30,
  intimation: 60,
  financeAdvanced: 299,
};

/**
 * Preços unitários - CPJ-3C+
 */
export const CPJ3C_UNIT_PRICES = {
  user: 106,
  publication: 80,
  consultancyHour: 225,
};

/**
 * Pacotes de monitoramento (ambos ERPs usam o mesmo)
 */
export const MONITORING_TIERS = [
  { limit: 500, annualLimit: 6000, price: 0.3 },
  { limit: 1000, annualLimit: 12000, price: 0.2 },
  { limit: 2000, annualLimit: 24000, price: 0.15 },
  { limit: Infinity, annualLimit: Infinity, price: 0.12 },
];

/**
 * Pacotes de distribuição (ambos ERPs usam o mesmo)
 */
export const DISTRIBUTION_TIERS = [
  { limit: 20, annualLimit: 240, price: 25 },
  { limit: 50, annualLimit: 600, price: 20 },
  { limit: 100, annualLimit: 1200, price: 15 },
  { limit: Infinity, annualLimit: Infinity, price: 12 },
];

/**
 * Pacotes de protocolo (ambos ERPs usam o mesmo)
 */
export const PROTOCOL_TIERS = [
  { limit: 250, annualLimit: 3000, price: 2.5 },
  { limit: 417, annualLimit: 5000, price: 2.2 },
  { limit: 833, annualLimit: 10000, price: 2.0 },
  { limit: Infinity, annualLimit: Infinity, price: 1.8 },
];

/**
 * Pacotes de documentos IA (ambos ERPs usam o mesmo)
 */
export const AI_DOCS_TIERS = [
  { limit: 10, annualLimit: 120, price: 7.5 },
  { limit: 50, annualLimit: 600, price: 6.5 },
  { limit: 100, annualLimit: 1200, price: 5.5 },
  { limit: Infinity, annualLimit: Infinity, price: 5.0 },
];

/**
 * Calcula o preço de um item baseado em pacotes de volume
 */
export function calculateTieredPrice(
  quantity: number,
  tiers: Array<{ limit: number; annualLimit: number; price: number }>
): {
  monthlyPrice: number;
  tier: number;
} {
  for (let i = 0; i < tiers.length; i++) {
    if (quantity <= tiers[i].limit) {
      return {
        monthlyPrice: quantity * tiers[i].price,
        tier: i,
      };
    }
  }
  // Se ultrapassar todos os limites, usa o último preço
  const lastTier = tiers[tiers.length - 1];
  return {
    monthlyPrice: quantity * lastTier.price,
    tier: tiers.length - 1,
  };
}

/**
 * Calcula excedentes para Office ADV
 */
export function calculateOfficeExceedances(params: {
  users: number;
  publications: number;
  intimation: number;
  monitoring: number;
  distribution: number;
  protocol: number;
  docs: number;
  includeFinance: boolean;
  planInclusions: (typeof OFFICE_ADV_PLANS)[PackageTier]["inclusions"];
}): {
  users: { exceed: number; price: number };
  publications: { exceed: number; price: number };
  intimation: { exceed: number; price: number };
  monitoring: { exceed: number; price: number; tier: number };
  distribution: { exceed: number; price: number; tier: number };
  protocol: { exceed: number; price: number; tier: number };
  docs: { exceed: number; price: number; tier: number };
  finance: { price: number };
  totalMonthly: number;
} {
  const usersExceed = Math.max(0, params.users - params.planInclusions.users);
  const pubExceed = Math.max(
    0,
    params.publications - params.planInclusions.publications
  );
  // Para serviços com pacotes escalonados, calcular apenas o excedente sobre a inclusão do plano
  const monExceed = Math.max(0, params.monitoring - params.planInclusions.monitoring);
  const distExceed = Math.max(0, params.distribution);
  const protExceed = Math.max(0, params.protocol);
  const docExceed = Math.max(0, params.docs - params.planInclusions.docs);
  const intimExceed = Math.max(0, params.intimation);

  const usersPrice = usersExceed * OFFICE_UNIT_PRICES.user;
  const pubPrice = pubExceed * OFFICE_UNIT_PRICES.publication;
  
  // Para pacotes escalonados, calcular apenas o que excede as inclusões
  const monPrice = monExceed > 0 ? calculateTieredPrice(monExceed, MONITORING_TIERS) : { monthlyPrice: 0, tier: 0 };
  const distPrice = distExceed > 0 ? calculateTieredPrice(distExceed, DISTRIBUTION_TIERS) : { monthlyPrice: 0, tier: 0 };
  const protPrice = protExceed > 0 ? calculateTieredPrice(protExceed, PROTOCOL_TIERS) : { monthlyPrice: 0, tier: 0 };
  const docPrice = docExceed > 0 ? calculateTieredPrice(docExceed, AI_DOCS_TIERS) : { monthlyPrice: 0, tier: 0 };
  const intimPrice = intimExceed * OFFICE_UNIT_PRICES.intimation;
  const financePrice = params.includeFinance && !params.planInclusions.financeIncluded
    ? OFFICE_UNIT_PRICES.financeAdvanced
    : 0;

  const total =
    usersPrice +
    pubPrice +
    monPrice.monthlyPrice +
    distPrice.monthlyPrice +
    protPrice.monthlyPrice +
    docPrice.monthlyPrice +
    intimPrice +
    financePrice;

  return {
    users: { exceed: usersExceed, price: usersPrice },
    publications: { exceed: pubExceed, price: pubPrice },
    intimation: { exceed: intimExceed, price: intimPrice },
    monitoring: {
      exceed: monExceed,
      price: monPrice.monthlyPrice,
      tier: monPrice.tier,
    },
    distribution: {
      exceed: distExceed,
      price: distPrice.monthlyPrice,
      tier: distPrice.tier,
    },
    protocol: {
      exceed: protExceed,
      price: protPrice.monthlyPrice,
      tier: protPrice.tier,
    },
    docs: { exceed: docExceed, price: docPrice.monthlyPrice, tier: docPrice.tier },
    finance: { price: financePrice },
    totalMonthly: total,
  };
}

/**
 * Calcula excedentes para CPJ-3C+
 */
export function calculateCpj3cExceedances(params: {
  users: number;
  publications: number;
  monitoring: number;
  distribution: number;
  protocol: number;
  docs: number;
  planInclusions: (typeof CPJ3C_PLANS)[PackageTier]["inclusions"];
}): {
  users: { exceed: number; price: number };
  publications: { exceed: number; price: number };
  monitoring: { exceed: number; price: number; tier: number };
  distribution: { exceed: number; price: number; tier: number };
  protocol: { exceed: number; price: number; tier: number };
  docs: { exceed: number; price: number; tier: number };
  totalMonthly: number;
} {
  const usersExceed = Math.max(0, params.users - params.planInclusions.users);
  const pubExceed = Math.max(
    0,
    params.publications - params.planInclusions.publications
  );
  // Para serviços com pacotes escalonados, calcular apenas o excedente sobre a inclusão do plano
  const monExceed = Math.max(0, params.monitoring - params.planInclusions.monitoring);
  const distExceed = Math.max(0, params.distribution);
  const protExceed = Math.max(0, params.protocol);
  const docExceed = Math.max(0, params.docs - params.planInclusions.docs);

  const usersPrice = usersExceed * CPJ3C_UNIT_PRICES.user;
  const pubPrice = pubExceed * CPJ3C_UNIT_PRICES.publication;
  
  // Para pacotes escalonados, calcular apenas o que excede as inclusões
  const monPrice = monExceed > 0 ? calculateTieredPrice(monExceed, MONITORING_TIERS) : { monthlyPrice: 0, tier: 0 };
  const distPrice = distExceed > 0 ? calculateTieredPrice(distExceed, DISTRIBUTION_TIERS) : { monthlyPrice: 0, tier: 0 };
  const protPrice = protExceed > 0 ? calculateTieredPrice(protExceed, PROTOCOL_TIERS) : { monthlyPrice: 0, tier: 0 };
  const docPrice = docExceed > 0 ? calculateTieredPrice(docExceed, AI_DOCS_TIERS) : { monthlyPrice: 0, tier: 0 };

  const total =
    usersPrice +
    pubPrice +
    monPrice.monthlyPrice +
    distPrice.monthlyPrice +
    protPrice.monthlyPrice +
    docPrice.monthlyPrice;

  return {
    users: { exceed: usersExceed, price: usersPrice },
    publications: { exceed: pubExceed, price: pubPrice },
    monitoring: {
      exceed: monExceed,
      price: monPrice.monthlyPrice,
      tier: monPrice.tier,
    },
    distribution: {
      exceed: distExceed,
      price: distPrice.monthlyPrice,
      tier: distPrice.tier,
    },
    protocol: {
      exceed: protExceed,
      price: protPrice.monthlyPrice,
      tier: protPrice.tier,
    },
    docs: { exceed: docExceed, price: docPrice.monthlyPrice, tier: docPrice.tier },
    totalMonthly: total,
  };
}

/**
 * Sugestão de plano por ERP considerando usuários
 */
export function suggestTierByUsersFor(erp: ErpProduct, users: number): PackageTier {
  if (erp === "OFFICE_ADV") {
    if (users <= 5) return "ONE";
    if (users <= 10) return "PRO";
    return "INFINITE";
  }
  if (erp === "CPJ_3C_PLUS") {
    if (users <= 10) return "ONE";
    if (users <= 25) return "PRO";
    return "INFINITE";
  }
  return suggestTierByUsers(users);
}

/**
 * Obtém o plano baseado na quantidade de usuários
 */
export function suggestTierByUsers(users: number): PackageTier {
  if (users <= 5) return "ONE";
  if (users <= 10) return "PRO";
  return "INFINITE";
}

/**
 * Obtém o preço base do plano
 */
export function getPlanPrice(
  erp: ErpProduct,
  tier: PackageTier
): number {
  if (erp === "OFFICE_ADV") {
    return OFFICE_ADV_PLANS[tier].monthlyPrice;
  } else if (erp === "CPJ_3C_PLUS") {
    return CPJ3C_PLANS[tier].monthlyPrice;
  }
  return 0;
}

/**
 * Retorna as inclusões do plano
 */
export function getPlanInclusions(erp: ErpProduct, tier: PackageTier) {
  if (erp === "OFFICE_ADV") {
    return OFFICE_ADV_PLANS[tier].inclusions;
  } else if (erp === "CPJ_3C_PLUS") {
    return CPJ3C_PLANS[tier].inclusions;
  }
  return null;
}
