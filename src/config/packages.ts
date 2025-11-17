import { ErpProduct, PackageTier, ProductPackageConfig } from "../types";

// Tabela correta dos planos Office ADV:
//
// ONE
// - 5 usuários
// - 3 publicações
// - 500 monitoramentos
// - 5 documentos IA
// - Valor do pacote: R$ 399,00
//
// PRO
// - 10 usuários
// - 5 publicações
// - 1000 monitoramentos
// - 10 documentos IA
// - Financeiro avançado incluso
// - Valor do pacote: R$ 699,00
//
// INFINITE
// - 20 usuários
// - 20 publicações
// - 1500 monitoramentos
// - 10 documentos IA
// - Financeiro avançado incluso
// - Valor do pacote: R$ 1.190,00

export const productPackages: ProductPackageConfig[] = [
  // =========================
  // OFFICE ADV
  // =========================
  {
    erp: "OFFICE_ADV",
    tier: "ONE",
    displayName: "Office ADV ONE",
    defaultSetupFee: 0,
    defaultMonthlyFee: 399,
    includedServices: [
      {
        id: "office-one-users",
        name: "Usuários",
        description: "Usuários incluídos no pacote ONE.",
        billingType: "MONTHLY",
        includedQuantity: 5,
        overageUnitPrice: 80,
        notes:
          "R$ 80,00 por usuário adicional acima dos limites de pacote. No Infinite, acima de 20 usuários são cobrados como adicionais.",
      },
      {
        id: "office-one-publications",
        name: "Publicações",
        description: "Termos de publicação incluídos no pacote ONE.",
        billingType: "USAGE",
        includedQuantity: 3,
        overageUnitPrice: 30,
        notes: "R$ 30,00 por termo de publicação excedente.",
      },
      {
        id: "office-one-monitoring",
        name: "Monitoramento (créditos)",
        description: "Créditos de monitoramento incluídos no pacote ONE.",
        billingType: "USAGE",
        includedQuantity: 500,
        notes:
          "Créditos adicionais seguem a tabela de pacotes (500, 1000, 2000, >2000 créditos/mês).",
      },
      {
        id: "office-one-ai-docs",
        name: "Documentos IA",
        description: "Documentos gerados por IA incluídos no pacote ONE.",
        billingType: "USAGE",
        includedQuantity: 5,
        notes:
          "Documentos adicionais seguem a tabela de pacotes (10, 50, 100, >100 docs/mês).",
      },
      {
        id: "office-one-finance-module",
        name: "Financeiro avançado",
        description:
          "Módulo financeiro avançado opcional nesse pacote (não incluso por padrão).",
        billingType: "MONTHLY",
        includedQuantity: 0,
        overageUnitPrice: 299,
      },
    ],
  },

  {
    erp: "OFFICE_ADV",
    tier: "PRO",
    displayName: "Office ADV PRO",
    defaultSetupFee: 0,
    defaultMonthlyFee: 699,
    includedServices: [
      {
        id: "office-pro-users",
        name: "Usuários",
        description: "Usuários incluídos no pacote PRO.",
        billingType: "MONTHLY",
        includedQuantity: 10,
        overageUnitPrice: 80,
        notes:
          "R$ 80,00 por usuário adicional acima dos limites de pacote. No Infinite, acima de 20 usuários são cobrados como adicionais.",
      },
      {
        id: "office-pro-publications",
        name: "Publicações",
        description: "Termos de publicação incluídos no pacote PRO.",
        billingType: "USAGE",
        includedQuantity: 5,
        overageUnitPrice: 30,
        notes: "R$ 30,00 por termo de publicação excedente.",
      },
      {
        id: "office-pro-monitoring",
        name: "Monitoramento (créditos)",
        description: "Créditos de monitoramento incluídos no pacote PRO.",
        billingType: "USAGE",
        includedQuantity: 1000,
        notes:
          "Créditos adicionais seguem a tabela de pacotes (500, 1000, 2000, >2000 créditos/mês).",
      },
      {
        id: "office-pro-ai-docs",
        name: "Documentos IA",
        description: "Documentos gerados por IA incluídos no pacote PRO.",
        billingType: "USAGE",
        includedQuantity: 10,
        notes:
          "Documentos adicionais seguem a tabela de pacotes (10, 50, 100, >100 docs/mês).",
      },
      {
        id: "office-pro-finance-module",
        name: "Financeiro avançado",
        description: "Módulo financeiro avançado incluso no pacote PRO.",
        billingType: "MONTHLY",
        includedQuantity: 1,
        overageUnitPrice: 299,
      },
    ],
  },

  {
    erp: "OFFICE_ADV",
    tier: "INFINITE",
    displayName: "Office ADV Infinite",
    defaultSetupFee: 0,
    defaultMonthlyFee: 1190,
    includedServices: [
      {
        id: "office-inf-users",
        name: "Usuários",
        description: "Usuários incluídos no pacote Infinite.",
        billingType: "MONTHLY",
        includedQuantity: 20,
        overageUnitPrice: 80,
        notes:
          "Inclui até 20 usuários. Usuários acima desse limite são cobrados como adicionais (R$ 80,00 por usuário).",
      },
      {
        id: "office-inf-publications",
        name: "Publicações",
        description: "Termos de publicação incluídos no pacote Infinite.",
        billingType: "USAGE",
        includedQuantity: 20,
        overageUnitPrice: 30,
        notes: "R$ 30,00 por termo de publicação excedente.",
      },
      {
        id: "office-inf-monitoring",
        name: "Monitoramento (créditos)",
        description: "Créditos de monitoramento incluídos no pacote Infinite.",
        billingType: "USAGE",
        includedQuantity: 1500,
        notes:
          "Créditos adicionais seguem a tabela de pacotes (500, 1000, 2000, >2000 créditos/mês).",
      },
      {
        id: "office-inf-ai-docs",
        name: "Documentos IA",
        description: "Documentos gerados por IA incluídos no pacote Infinite.",
        billingType: "USAGE",
        includedQuantity: 10,
        notes:
          "Documentos adicionais seguem a tabela de pacotes (10, 50, 100, >100 docs/mês).",
      },
      {
        id: "office-inf-finance-module",
        name: "Financeiro avançado",
        description: "Módulo financeiro avançado incluso no pacote Infinite.",
        billingType: "MONTHLY",
        includedQuantity: 1,
        overageUnitPrice: 299,
      },
    ],
  },

  // =========================
  // CPJ-3C+
  // =========================
  {
    erp: "CPJ_3C_PLUS",
    tier: "ONE",
    displayName: "CPJ-3C+ ONE",
    defaultSetupFee: 0,
    defaultMonthlyFee: 1499,
    includedServices: [
      {
        id: "cpj-one-users",
        name: "Usuários",
        description: "Usuários incluídos no pacote ONE.",
        billingType: "MONTHLY",
        includedQuantity: 10,
        overageUnitPrice: 106,
        notes: "R$ 106,00 por usuário adicional.",
      },
      {
        id: "cpj-one-monitoring",
        name: "Monitoramento (créditos)",
        description: "Créditos de monitoramento incluídos.",
        billingType: "USAGE",
        includedQuantity: 1500,
      },
      {
        id: "cpj-one-publications",
        name: "Publicações",
        description: "Termos de publicação incluídos.",
        billingType: "USAGE",
        includedQuantity: 3,
        overageUnitPrice: 80,
        notes: "R$ 80,00 por termo de publicação excedente.",
      },
      {
        id: "cpj-one-ai-docs",
        name: "Documentos IA",
        description: "Documentos gerados por IA incluídos.",
        billingType: "USAGE",
        includedQuantity: 20,
      },
      {
        id: "cpj-one-storage",
        name: "Armazenamento",
        description: "80GB de armazenamento incluído.",
        billingType: "MONTHLY",
        includedQuantity: 80,
      },
      {
        id: "cpj-one-nfe",
        name: "Nota Fiscal Eletrônica",
        description: "1 Nota Fiscal Eletrônica incluída.",
        billingType: "MONTHLY",
        includedQuantity: 1,
      },
      {
        id: "cpj-one-bank",
        name: "Preâmbulo Bank Essencial",
        description: "Conta Digital + 50 Boletos.",
        billingType: "MONTHLY",
        includedQuantity: 1,
      },
      {
        id: "cpj-one-finance",
        name: "Financeiro",
        description: "Módulo Financeiro incluído.",
        billingType: "MONTHLY",
        includedQuantity: 1,
      },
      {
        id: "cpj-one-processes",
        name: "Processos Ilimitados",
        description: "Processos ilimitados.",
        billingType: "MONTHLY",
        includedQuantity: 999999,
      },
      {
        id: "cpj-one-ai-tokens",
        name: "Tokens Agente de IA",
        description: "10000 Tokens incluídos.",
        billingType: "MONTHLY",
        includedQuantity: 10000,
      },
    ],
  },
  {
    erp: "CPJ_3C_PLUS",
    tier: "PRO",
    displayName: "CPJ-3C+ PRO",
    defaultSetupFee: 0,
    defaultMonthlyFee: 2999,
    includedServices: [
      {
        id: "cpj-pro-users",
        name: "Usuários",
        description: "Usuários incluídos no pacote PRO.",
        billingType: "MONTHLY",
        includedQuantity: 25,
        overageUnitPrice: 106,
        notes: "R$ 106,00 por usuário adicional.",
      },
      {
        id: "cpj-pro-monitoring",
        name: "Monitoramento (créditos)",
        description: "Créditos de monitoramento incluídos.",
        billingType: "USAGE",
        includedQuantity: 3000,
      },
      {
        id: "cpj-pro-publications",
        name: "Publicações",
        description: "Termos de publicação incluídos.",
        billingType: "USAGE",
        includedQuantity: 5,
        overageUnitPrice: 80,
        notes: "R$ 80,00 por termo de publicação excedente.",
      },
      {
        id: "cpj-pro-ai-docs",
        name: "Documentos IA",
        description: "Documentos gerados por IA incluídos.",
        billingType: "USAGE",
        includedQuantity: 50,
      },
      {
        id: "cpj-pro-storage",
        name: "Armazenamento",
        description: "200GB de armazenamento incluído.",
        billingType: "MONTHLY",
        includedQuantity: 200,
      },
      {
        id: "cpj-pro-nfe",
        name: "Nota Fiscal Eletrônica",
        description: "2 Notas Fiscais Eletrônicas incluídas.",
        billingType: "MONTHLY",
        includedQuantity: 2,
      },
      {
        id: "cpj-pro-bank",
        name: "Preâmbulo Bank Growth",
        description: "Conta Digital + 100 Boletos.",
        billingType: "MONTHLY",
        includedQuantity: 1,
      },
      {
        id: "cpj-pro-finance",
        name: "Financeiro Avançado",
        description: "Módulo Financeiro Avançado incluído.",
        billingType: "MONTHLY",
        includedQuantity: 1,
      },
      {
        id: "cpj-pro-processes",
        name: "Processos Ilimitados",
        description: "Processos ilimitados.",
        billingType: "MONTHLY",
        includedQuantity: 999999,
      },
      {
        id: "cpj-pro-ai-tokens",
        name: "Tokens Agente de IA",
        description: "20000 Tokens incluídos.",
        billingType: "MONTHLY",
        includedQuantity: 20000,
      },
    ],
  },
  {
    erp: "CPJ_3C_PLUS",
    tier: "INFINITE",
    displayName: "CPJ-3C+ Infinite",
    defaultSetupFee: 0,
    defaultMonthlyFee: 4499,
    includedServices: [
      {
        id: "cpj-inf-users",
        name: "Usuários",
        description: "Usuários incluídos no pacote INFINITE.",
        billingType: "MONTHLY",
        includedQuantity: 40,
        overageUnitPrice: 106,
        notes: "R$ 106,00 por usuário adicional.",
      },
      {
        id: "cpj-inf-monitoring",
        name: "Monitoramento (créditos)",
        description: "Créditos de monitoramento incluídos.",
        billingType: "USAGE",
        includedQuantity: 5000,
      },
      {
        id: "cpj-inf-publications",
        name: "Publicações",
        description: "Termos de publicação incluídos.",
        billingType: "USAGE",
        includedQuantity: 10,
        overageUnitPrice: 80,
        notes: "R$ 80,00 por termo de publicação excedente.",
      },
      {
        id: "cpj-inf-ai-docs",
        name: "Documentos IA",
        description: "Documentos gerados por IA incluídos.",
        billingType: "USAGE",
        includedQuantity: 80,
      },
      {
        id: "cpj-inf-storage",
        name: "Armazenamento",
        description: "500GB de armazenamento incluído.",
        billingType: "MONTHLY",
        includedQuantity: 500,
      },
      {
        id: "cpj-inf-nfe",
        name: "Nota Fiscal Eletrônica",
        description: "3 Notas Fiscais Eletrônicas incluídas.",
        billingType: "MONTHLY",
        includedQuantity: 3,
      },
      {
        id: "cpj-inf-bank",
        name: "Preâmbulo Bank Growth",
        description: "Conta Digital + 150 Boletos.",
        billingType: "MONTHLY",
        includedQuantity: 1,
      },
      {
        id: "cpj-inf-finance",
        name: "Financeiro Avançado",
        description: "Módulo Financeiro Avançado incluído.",
        billingType: "MONTHLY",
        includedQuantity: 1,
      },
      {
        id: "cpj-inf-processes",
        name: "Processos Ilimitados",
        description: "Processos ilimitados.",
        billingType: "MONTHLY",
        includedQuantity: 999999,
      },
      {
        id: "cpj-inf-ai-tokens",
        name: "Tokens Agente de IA",
        description: "50000 Tokens incluídos.",
        billingType: "MONTHLY",
        includedQuantity: 50000,
      },
    ],
  },

  // =========================
  // CPJ Cobrança (Em manutenção)
  // =========================
  {
    erp: "CPJ_COBRANCA",
    tier: "ONE",
    displayName: "CPJ Cobrança ONE",
    defaultSetupFee: 0,
    defaultMonthlyFee: 0,
    includedServices: [],
  },
  {
    erp: "CPJ_COBRANCA",
    tier: "PRO",
    displayName: "CPJ Cobrança PRO",
    defaultSetupFee: 0,
    defaultMonthlyFee: 0,
    includedServices: [],
  },
  {
    erp: "CPJ_COBRANCA",
    tier: "INFINITE",
    displayName: "CPJ Cobrança Infinite",
    defaultSetupFee: 0,
    defaultMonthlyFee: 0,
    includedServices: [],
  },

  // =========================
  // PROMAD (Placeholder)
  // =========================
  {
    erp: "PROMAD",
    tier: "ONE",
    displayName: "Promad ONE",
    defaultSetupFee: 0,
    defaultMonthlyFee: 0,
    includedServices: [],
  },
  {
    erp: "PROMAD",
    tier: "PRO",
    displayName: "Promad PRO",
    defaultSetupFee: 0,
    defaultMonthlyFee: 0,
    includedServices: [],
  },
  {
    erp: "PROMAD",
    tier: "INFINITE",
    displayName: "Promad Infinite",
    defaultSetupFee: 0,
    defaultMonthlyFee: 0,
    includedServices: [],
  },
];

export function getPackageConfig(
  erp: ErpProduct,
  tier: PackageTier
): ProductPackageConfig | undefined {
  return productPackages.find(
    (pkg) => pkg.erp === erp && pkg.tier === tier
  );
}
