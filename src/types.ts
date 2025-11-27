export type ErpProduct = "OFFICE_ADV" | "CPJ_3C_PLUS" | "CPJ_COBRANCA" | "PROMAD";

export type PackageTier = "ONE" | "PRO" | "INFINITE";

export type ExtraServiceBilling = "SETUP" | "MONTHLY";

export interface ExtraService {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  // indica se esse serviço adicional impacta o setup inicial ou a mensalidade
  billing: ExtraServiceBilling;
}

export interface ProposalFormState {
  clientName: string;
  clientResponsible: string;
  clientPhone: string;
  clientEmail: string;
  erp: ErpProduct;
  setupFee: number;
  monthlyFee: number;
  billingCycle: "MONTHLY" | "ANNUAL";  // Ciclo de pagamento (mensal ou anual)
  discountType: "NONE" | "PERCENT" | "VALUE";
  discountValue: number;
  annualDiscountType: "NONE" | "PERCENT" | "VALUE";  // Desconto específico para anual
  annualDiscountValue: number;  // Valor do desconto anual
  annualInstallments: number;  // Parcelas para pagamento anual
  firstPaymentDate: string;       // yyyy-mm-dd
  firstMonthlyDate: string;       // yyyy-mm-dd
  proposalValidityDays: number;   // validade da proposta em dias
  proposalValidityDate: string;   // validade da proposta como data yyyy-mm-dd
  paymentConditions: string;      // texto livre
  observations: string;           // texto livre
  extraServices: ExtraService[];

  // Inputs específicos de volume para Office ADV
  officeUsers: number;                  // total de usuários desejado
  officePublications: number;           // termos de publicação / mês
  officeIntimation: number;             // painéis de intimação / mês
  officeMonitoringCredits: number;      // créditos de monitoramento / mês
  officeAiDocs: number;                 // documentos IA / mês
  officeDistributionTerms: number;      // termos de distribuição
  officeDistributionProcesses: number;  // processos distribuídos / mês
  officeProtocols: number;              // protocolos / mês
  officeFinanceModule: boolean;         // se o cliente quer o módulo financeiro avançado
  officeApiModule: boolean;             // módulo de API
  
  // Treinamentos Office ADV (setup)
  trainingReportPowerBI: boolean;       // Treinamento Gerador de Relatório + Power BI
  trainingDocGenerator: boolean;        // Treinamento Gerador de Documentos
  trainingControlling: boolean;         // Treinamento Controladoria Jurídica
  trainingFinance: boolean;             // Treinamento Financeiro Avançado
  boletoBancario: boolean;              // Módulo de Boleto Bancário
  officeConsultingHours: number;        // horas de consultoria Office ADV

  // CPJ-3C+ – volumes mensais
  cpj3cUsers: number;
  cpj3cPublications: number;
  cpj3cIntimation: number;              // termos de intimação
  cpj3cMonitoringCredits: number;
  cpj3cAiDocs: number;
  cpj3cNfe: number;                     // CNPJs para NFe
  cpj3cDistributionProcesses: number;
  cpj3cProtocols: number;
  cpj3cConsultingHours: number;         // consultoria mensal CPJ
  cpj3cFlowHours: number;               // fluxo completo (setup)

  // Implementação e Migração
  implementationStarter: boolean; // se inclui o pacote Starter (R$ 899,00)
  migrationType: "NONE" | "PLANILHA_PADRAO" | "DISCOVERY" | "PLANILHA_PERSONALIZADA" | "BACKUP_SISTEMA";
  migrationProcesses: number; // usado para DISCOVERY (qtd de processos)
  migrationHours: number;     // usado para Planilha Personalizada / Backup

  // Desconto específico de setup
  setupDiscountType: "NONE" | "PERCENT" | "VALUE";
  setupDiscountValue: number;
  setupInstallments: number; // quantidade de parcelas do setup

  // Cálculos automáticos (preenchidos internamente)
  cpj3cCalculation?: Cpj3cPackageCalculation;
}

export type BillingType = "SETUP" | "MONTHLY" | "ONE_TIME" | "USAGE";

export interface PackageIncludedService {
  id: string;
  name: string;
  description?: string;
  billingType: BillingType;
  includedQuantity?: number;
  overageUnitPrice?: number;
  notes?: string;
}

export interface ProductPackageConfig {
  erp: ErpProduct;
  tier: PackageTier;
  displayName: string;
  defaultSetupFee: number;
  defaultMonthlyFee: number;
  includedServices: PackageIncludedService[];
}

// Resultado detalhado do cálculo automático do Office ADV
export interface OfficePricingItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  monthlyValue: number;
}

export interface OfficePricingResult {
  effectiveTier: PackageTier;        // plano efetivo usado no cálculo (após upgrade se necessário)
  tierAdjusted: boolean;             // se o plano foi ajustado automaticamente
  tierAdjustmentReason?: string;     // motivo do ajuste (quando houver)

  baseMonthly: number;               // mensalidade base do pacote efetivo (ONE/PRO/INFINITE)
  baseSetup: number;                 // setup base do pacote efetivo

  usersIncluded: number;             // usuários incluídos no pacote efetivo
  usersRequested: number;            // usuários solicitados no formulário
  usersExtra: number;                // usuários além do limite do Infinite (caso haja)
  usersExtraValue: number;           // valor mensal dos usuários extras

  items: OfficePricingItem[];        // itens adicionais calculados (monitoramento, docs IA, distribuição etc.)
  monthlyTotal: number;              // total mensal: base + adicionais
  annualTotal: number;               // total anual (mensal * 12)
}

// Resultado detalhado do cálculo automático do CPJ-3C+
export interface Cpj3cPricingItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  monthlyValue: number;
}

export interface Cpj3cPackageCalculation {
  effectiveTier: PackageTier;        // ONE, PRO ou INFINITE
  usersRequested: number;
  usersIncluded: number;
  usersExtra: number;
  usersExtraValue: number;
  items: Cpj3cPricingItem[];
  baseMonthly: number;               // valor base do plano (1499, 2999, 4499)
  monthlyTotal: number;              // base + excedentes
  annualTotal: number;               // monthlyTotal * 12
}
