import * as React from "react";
import type { ProposalFormState } from "../types";
import * as pricingRules from "../utils/pricingRules";
import { getDeviceInfo, getPDFConfig, prepareElementForCapture } from "../utils/pdfResolution";

// Usar caminhos diretos para Electron
const officeImg = '/office.png';
const threeCPlusImg = '/3cplus.png';
const cobrancaImg = '/cobranca.png';
const preambutoImg = '/preambulo.png';

import {
  getPlanPrice,
  getPlanInclusions,
  calculateOfficeExceedances,
  calculateCpj3cExceedances,
  suggestTierByUsersFor,
  OFFICE_ADV_PLANS,
  CPJ3C_PLANS,
} from "../utils/pricingPlans";

type Consultant = { name: string; phone?: string; email?: string } | null;

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string) {
  if (!date) return "-";
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function productInfo(erp: ProposalFormState["erp"]) {
  switch (erp) {
    case "OFFICE_ADV":
      return { name: "Office ADV", logo: officeImg };
    case "CPJ_3C_PLUS":
      return { name: "CPJ-3C+", logo: threeCPlusImg };
    case "CPJ_COBRANCA":
      return { name: "CPJ-Cobrança", logo: cobrancaImg };
    default:
      return { name: "Produto", logo: officeImg };
  }
}

interface Props {
  formState: ProposalFormState;
  consultantProfile: Consultant;
  captureId?: string;
}

export default function ProposalPreviewEnterprise({ formState, consultantProfile, captureId }: Props) {
  // Detecta informações do dispositivo para ajustes adaptativos
  const [deviceInfo] = React.useState(() => getDeviceInfo());
  const [pdfConfig] = React.useState(() => getPDFConfig(deviceInfo));
  
  // Classes CSS baseadas na resolução
  const resolutionClasses = React.useMemo(() => {
    const classes = ['adaptive-resolution'];
    
    if (deviceInfo.isHighDPI) {
      classes.push('high-dpi');
    }
    
    classes.push(`screen-${deviceInfo.screenType}`);
    classes.push(`dpr-${Math.floor(deviceInfo.dpr)}`);
    
    return classes.join(' ');
  }, [deviceInfo]);
  
  const isOffice = formState.erp === "OFFICE_ADV";
  const isCpj = formState.erp === "CPJ_3C_PLUS";
  const prod = productInfo(formState.erp);
  const selectedTier = isOffice
    ? suggestTierByUsersFor("OFFICE_ADV", formState.officeUsers || 0)
    : isCpj
    ? suggestTierByUsersFor("CPJ_3C_PLUS", formState.cpj3cUsers || 0)
    : null;

  // Monthly items
  const monthlyItems: Array<{ item: string; qty: number; unit: string; monthly: number; annual: number }> = [];
  let monthlyTotal = 0;
  if (isOffice) {
    const users = formState.officeUsers || 0;
    const tier = suggestTierByUsersFor("OFFICE_ADV", users);
    const base = getPlanPrice("OFFICE_ADV", tier) || 0;
    // Recupera inclusões do plano sem tentar indexação de tipo dinâmica (evita erro TS em build)
    const inc = getPlanInclusions("OFFICE_ADV", tier) as any;
    
    if (!inc) {
      monthlyItems.push({ item: `Pacote Office ${tier}`, qty: 1, unit: "—", monthly: base, annual: base * 12 });
      monthlyTotal = base;
    } else {
      const ex = calculateOfficeExceedances({
        users,
        publications: formState.officePublications || 0,
        intimation: formState.officeIntimation || 0,
        monitoring: formState.officeMonitoringCredits || 0, // Usar valor mensal
        distribution: formState.officeDistributionProcesses || 0, // Usar valor mensal
        protocol: formState.officeProtocols || 0, // Usar valor mensal
        docs: formState.officeAiDocs || 0, // Usar valor mensal
        includeFinance: !!formState.officeFinanceModule,
        planInclusions: inc,
      });
      monthlyItems.push({ item: `Pacote Office ${tier}`, qty: 1, unit: "—", monthly: base, annual: base * 12 });
      if (ex.users.exceed > 0) monthlyItems.push({ item: "Usuários excedentes", qty: ex.users.exceed, unit: formatCurrency(80), monthly: ex.users.price, annual: ex.users.price * 12 });
      if (ex.publications.exceed > 0) monthlyItems.push({ item: "Publicações excedentes", qty: ex.publications.exceed, unit: formatCurrency(30), monthly: ex.publications.price, annual: ex.publications.price * 12 });
      if (ex.intimation.exceed > 0) monthlyItems.push({ item: "Intimações", qty: ex.intimation.exceed, unit: formatCurrency(pricingRules.UNIT_PRICES.officeIntimation), monthly: ex.intimation.price, annual: ex.intimation.price * 12 });
      // Pacotes fechados: mostra o pacote completo contratado
      if (ex.monitoring.exceed > 0) monthlyItems.push({ item: "Monitoramento", qty: 1, unit: (ex.monitoring as any).custom ? `Pacote Personalizado ${(ex.monitoring as any).packageLimit}/mês` : `Pacote ${(ex.monitoring as any).packageLimit}/mês (${(ex.monitoring as any).annualLimit}/ano)`, monthly: ex.monitoring.price, annual: ex.monitoring.price * 12 });
      if (ex.distribution.exceed > 0) monthlyItems.push({ item: "Distribuição", qty: 1, unit: (ex.distribution as any).custom ? `Pacote Personalizado ${(ex.distribution as any).packageLimit}/mês` : `Pacote ${(ex.distribution as any).packageLimit}/mês (${(ex.distribution as any).annualLimit}/ano)`, monthly: ex.distribution.price, annual: ex.distribution.price * 12 });
      if (ex.protocol.exceed > 0) monthlyItems.push({ item: "Protocolos", qty: 1, unit: (ex.protocol as any).custom ? `Pacote Personalizado ${(ex.protocol as any).packageLimit}/mês` : `Pacote ${(ex.protocol as any).packageLimit}/mês (${(ex.protocol as any).annualLimit}/ano)`, monthly: ex.protocol.price, annual: ex.protocol.price * 12 });
      if (ex.docs.exceed > 0) monthlyItems.push({ item: "Documentos IA", qty: 1, unit: (ex.docs as any).custom ? `Pacote Personalizado ${(ex.docs as any).packageLimit}/mês` : `Pacote ${(ex.docs as any).packageLimit}/mês (${(ex.docs as any).annualLimit}/ano)`, monthly: ex.docs.price, annual: ex.docs.price * 12 });
      if (ex.finance.price > 0) monthlyItems.push({ item: "Financeiro Avançado", qty: 1, unit: formatCurrency(pricingRules.FIXED_PRICES.officeFinanceAdvanced), monthly: ex.finance.price, annual: ex.finance.price * 12 });
      monthlyTotal = base + ex.totalMonthly;
    }
  }
  if (isCpj) {
    const users = formState.cpj3cUsers || 0;
    const tier = suggestTierByUsersFor("CPJ_3C_PLUS", users);
    const base = getPlanPrice("CPJ_3C_PLUS", tier) || 0;
    const inc = getPlanInclusions("CPJ_3C_PLUS", tier) as any;
    const consulting = (formState.cpj3cConsultingHours || 0) * pricingRules.FIXED_PRICES.consultingHourly;
    
    if (!inc) {
      monthlyItems.push({ item: `Pacote CPJ-3C+ ${tier}`, qty: 1, unit: "—", monthly: base, annual: base * 12 });
      if (formState.cpj3cConsultingHours) monthlyItems.push({ item: "Consultoria Mensal", qty: formState.cpj3cConsultingHours, unit: `${formatCurrency(pricingRules.FIXED_PRICES.consultingHourly)}/h`, monthly: consulting, annual: consulting * 12 });
      monthlyTotal = base + consulting;
    } else {
      const ex = calculateCpj3cExceedances({
        users,
        publications: formState.cpj3cPublications || 0,
        monitoring: formState.cpj3cMonitoringCredits || 0, // Usar valor mensal
        distribution: formState.cpj3cDistributionProcesses || 0, // Usar valor mensal
        protocol: formState.cpj3cProtocols || 0, // Usar valor mensal
        docs: formState.cpj3cAiDocs || 0, // Usar valor mensal
        planInclusions: inc,
      });
      monthlyItems.push({ item: `Pacote CPJ-3C+ ${tier}`, qty: 1, unit: "—", monthly: base, annual: base * 12 });
      if (ex.users.exceed > 0) monthlyItems.push({ item: "Usuários excedentes", qty: ex.users.exceed, unit: formatCurrency(106), monthly: ex.users.price, annual: ex.users.price * 12 });
      if (ex.publications.exceed > 0) monthlyItems.push({ item: "Publicações excedentes", qty: ex.publications.exceed, unit: formatCurrency(80), monthly: ex.publications.price, annual: ex.publications.price * 12 });
      // Pacotes fechados: mostra o pacote completo contratado
      if (ex.monitoring.exceed > 0) monthlyItems.push({ item: "Monitoramento", qty: 1, unit: (ex.monitoring as any).custom ? `Pacote Personalizado ${(ex.monitoring as any).packageLimit}/mês` : `Pacote ${(ex.monitoring as any).packageLimit}/mês (${(ex.monitoring as any).annualLimit}/ano)`, monthly: ex.monitoring.price, annual: ex.monitoring.price * 12 });
      if (ex.distribution.exceed > 0) monthlyItems.push({ item: "Distribuição", qty: 1, unit: (ex.distribution as any).custom ? `Pacote Personalizado ${(ex.distribution as any).packageLimit}/mês` : `Pacote ${(ex.distribution as any).packageLimit}/mês (${(ex.distribution as any).annualLimit}/ano)`, monthly: ex.distribution.price, annual: ex.distribution.price * 12 });
      if (ex.protocol.exceed > 0) monthlyItems.push({ item: "Protocolos", qty: 1, unit: (ex.protocol as any).custom ? `Pacote Personalizado ${(ex.protocol as any).packageLimit}/mês` : `Pacote ${(ex.protocol as any).packageLimit}/mês (${(ex.protocol as any).annualLimit}/ano)`, monthly: ex.protocol.price, annual: ex.protocol.price * 12 });
      if (ex.docs.exceed > 0) monthlyItems.push({ item: "Documentos IA", qty: 1, unit: (ex.docs as any).custom ? `Pacote Personalizado ${(ex.docs as any).packageLimit}/mês` : `Pacote ${(ex.docs as any).packageLimit}/mês (${(ex.docs as any).annualLimit}/ano)`, monthly: ex.docs.price, annual: ex.docs.price * 12 });
      if (formState.cpj3cConsultingHours) monthlyItems.push({ item: "Consultoria Mensal", qty: formState.cpj3cConsultingHours, unit: `${formatCurrency(pricingRules.FIXED_PRICES.consultingHourly)}/h`, monthly: consulting, annual: consulting * 12 });
      monthlyTotal = base + ex.totalMonthly + consulting;
    }
  }

  // Monthly Extras
  for (const extra of formState.extraServices) {
    if (extra.billing === "MONTHLY") {
      const cost = (extra.quantity || 0) * (extra.unitPrice || 0);
      monthlyItems.push({ item: extra.description || "Extra", qty: extra.quantity || 0, unit: formatCurrency(extra.unitPrice || 0), monthly: cost, annual: cost * 12 });
      monthlyTotal += cost;
    }
  }

  // Setup items
  const setupItems: Array<{ item: string; description?: string; value: number }>= [];
  let setupTotal = formState.setupFee || 0;
  if (formState.setupFee) setupItems.push({ item: "Taxa de Setup", value: formState.setupFee });
  if (formState.implementationStarter) {
    setupItems.push({ item: "Starter Pack", description: "Implantação acelerada", value: pricingRules.FIXED_PRICES.starter });
    setupTotal += pricingRules.FIXED_PRICES.starter;
  }
  if (formState.migrationType && formState.migrationType !== "NONE") {
    if (formState.migrationType === "PLANILHA_PADRAO") {
      setupItems.push({ item: "Migração - Planilha Padrão", description: "Cortesia", value: 0 });
    } else if (formState.migrationType === "DISCOVERY" && formState.migrationProcesses) {
      const cost = pricingRules.calculateMigrationDiscovery(formState.migrationProcesses);
      setupItems.push({ item: "Migração - Discovery", description: `${formState.migrationProcesses} processos (cortesia até 2000)`, value: cost });
      setupTotal += cost;
    } else if ((formState.migrationType === "PLANILHA_PERSONALIZADA" || formState.migrationType === "BACKUP_SISTEMA") && formState.migrationHours) {
      const cost = formState.migrationHours * pricingRules.FIXED_PRICES.consultingHourly;
      const label = formState.migrationType === "PLANILHA_PERSONALIZADA" ? "Migração - Planilha Personalizada" : "Migração - Backup de Sistema";
      setupItems.push({ item: label, description: `${formState.migrationHours} horas @ ${formatCurrency(pricingRules.FIXED_PRICES.consultingHourly)}/h`, value: cost });
      setupTotal += cost;
    }
  }
  for (const extra of formState.extraServices) {
    if (extra.billing === "SETUP") {
      const cost = (extra.quantity || 0) * (extra.unitPrice || 0);
      setupItems.push({ item: extra.description || "Extra", value: cost });
      setupTotal += cost;
    }
  }

  const annualBaseTotal = monthlyTotal * 12;
  const annualDiscountApplied = formState.annualDiscountType !== 'NONE' && formState.annualDiscountValue > 0;
  const annualDiscountedTotal = annualDiscountApplied
    ? (formState.annualDiscountType === 'PERCENT'
        ? Math.max(0, annualBaseTotal * (1 - formState.annualDiscountValue / 100))
        : Math.max(0, annualBaseTotal - formState.annualDiscountValue))
    : annualBaseTotal;
  // Mantém variável original para compatibilidade em cálculos linha-a-linha sem desconto por item
  const annualTotal = annualBaseTotal;

  const monthlyDiscountApplied = formState.discountType !== 'NONE' && formState.discountValue > 0;
  const monthlyDiscountedTotal = monthlyDiscountApplied
    ? (formState.discountType === 'PERCENT'
        ? Math.max(0, monthlyTotal * (1 - formState.discountValue / 100))
        : Math.max(0, monthlyTotal - formState.discountValue))
    : monthlyTotal;

  // Colors and layout helpers (brand: dark blue to black header)
  return (
    <div 
      id={captureId} 
      className={`proposal-container pdf-generation force-print-colors ${resolutionClasses}`} 
      data-device-info={JSON.stringify(deviceInfo)}
      style={{
        '--base-font-size': deviceInfo.isHighDPI ? '11px' : '12px',
        '--base-padding': deviceInfo.isHighDPI ? '6px' : '8px',
        '--base-margin': deviceInfo.isHighDPI ? '8px' : '10px',
        fontSize: deviceInfo.isHighDPI ? '11px' : '12px'
      } as React.CSSProperties}
    >
      {/* CSS adaptativo será aplicado via classes CSS externas */}
      
      <div className="px-8 py-6 space-y-6 content-section print:px-6 print:py-4 print:space-y-4 print-margin">
        
        {/* PÁGINA 1 - INFORMAÇÕES GERAIS */}
        <div className="proposal-page-1 page-content-group">
          
          {/* Header - Manter junto com conteúdo da página 1 */}
          <div className="relative header-section no-page-break mb-6">
            <div className="bg-gradient-to-r from-[#0A1B3F] via-[#0A0F1F] to-black text-white px-8 py-6 flex items-center justify-between print:px-6 print:py-4">
              <div className="flex items-center gap-4">
                <img src={preambutoImg} alt="Preâmbulo" className="h-10 w-auto object-contain print:h-8" />
              </div>
              <div className="text-center">
                <div className="text-xs tracking-widest uppercase opacity-80">Documento</div>
                <div className="text-xl font-extrabold print:text-lg">Proposta Comercial</div>
              </div>
              <div className="flex items-center gap-4">
                <img src={prod.logo} alt={prod.name} className="h-10 w-auto object-contain print:h-8" />
              </div>
            </div>
            <div className="px-8 py-3 bg-[#0f172a] text-blue-100 flex items-center justify-between print:px-6 print:py-2">
              <div className="text-sm min-w-0 flex-1">
                <div className="opacity-80 text-xs mb-1">Produto</div>
                <div className="font-semibold text-white">{prod.name}</div>
              </div>
              {selectedTier && (
                <div className="text-sm text-center min-w-0 flex-1">
                  <div className="opacity-80 text-xs mb-1 whitespace-nowrap">Plano Selecionado</div>
                  <div className="font-semibold text-white bg-blue-600 px-4 py-1.5 rounded-full text-sm whitespace-nowrap">{selectedTier}</div>
                </div>
              )}
              <div className="text-sm text-right min-w-0 flex-1">
                <div className="opacity-80 text-xs mb-1">Validade</div>
                <div className="font-semibold text-white">{formState.proposalValidityDate ? `até ${new Date(formState.proposalValidityDate).toLocaleDateString('pt-BR')}` : `${formState.proposalValidityDays || 30} dias`}</div>
              </div>
            </div>
          </div>
          
          {/* 1. Dados do Cliente e Consultor */}
          <section className="section-together no-page-break mb-6">
            <h2 className="section-title text-sm font-bold uppercase tracking-widest text-slate-600 mb-3">📋 1. Informações Gerais</h2>
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-4 force-print-colors">
              <div className="grid grid-cols-2 gap-6">
                {/* Cliente */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">📄 Cliente</h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div><strong>Empresa:</strong> {formState.clientName || "-"}</div>
                    <div><strong>Contato:</strong> {formState.clientResponsible || "-"}</div>
                    <div><strong>Telefone:</strong> {formState.clientPhone || "-"}</div>
                    <div><strong>E-mail:</strong> {formState.clientEmail || "-"}</div>
                  </div>
                </div>
                {/* Consultor */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">🚀 Consultor</h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div><strong>Nome:</strong> {consultantProfile?.name || "Preâmbulo Informática"}</div>
                    <div><strong>Telefone:</strong> {consultantProfile?.phone || "-"}</div>
                    <div><strong>E-mail:</strong> {consultantProfile?.email || "comercial@preambulo.com.br"}</div>
                    <div><strong>Data:</strong> {new Date().toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 2. Resumo do Pacote e Exceedências */}
        {selectedTier && (isOffice || isCpj) && (
          <section className="mb-8 no-page-break package-summary-section">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-2 no-page-break-after">📋 2. Resumo do Pacote</h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-4 no-page-break-before">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-1">📋 Itens Inclusos no Pacote {selectedTier}</h3>
                  <div className="text-xs space-y-2 text-slate-700">
                    {(() => {
                      if (!selectedTier) return null;
                      
                      const inclusions = isOffice 
                        ? getPlanInclusions("OFFICE_ADV", selectedTier) as (typeof OFFICE_ADV_PLANS)[typeof selectedTier]["inclusions"]
                        : getPlanInclusions("CPJ_3C_PLUS", selectedTier) as (typeof CPJ3C_PLANS)[typeof selectedTier]["inclusions"];
                      
                      if (!inclusions) return null;
                      
                      return (
                        <>
                          <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                            <span>• Usuários:</span>
                            <strong className="text-blue-800">{inclusions.users || 0}</strong>
                          </div>
                          <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                            <span>• Publicações:</span>
                            <strong className="text-blue-800">{inclusions.publications || 0}/mês</strong>
                          </div>
                          <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                            <span>• Monitoramento:</span>
                            <strong className="text-blue-800">{(inclusions.monitoring || 0).toLocaleString()}/mês</strong>
                          </div>
                          <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                            <span>• Docs IA:</span>
                            <strong className="text-blue-800">{(inclusions.docs || 0).toLocaleString()}/mês</strong>
                          </div>
                          {isOffice && 'financeIncluded' in inclusions && (
                            <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                              <span>• Financeiro:</span>
                              <strong className="text-blue-800">{selectedTier === 'ONE' ? 'Padrão' : 'Avançado'}</strong>
                            </div>
                          )}
                          {isCpj && 'nfe' in inclusions && (
                            <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                              <span>• NFe:</span>
                              <strong className="text-blue-800">{inclusions.nfe}</strong>
                            </div>
                          )}
                          {isCpj && 'storage' in inclusions && (
                            <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                              <span>• Storage:</span>
                              <strong className="text-blue-800">{inclusions.storage} GB</strong>
                            </div>
                          )}
                          {isCpj && 'agentTokens' in inclusions && (
                            <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                              <span>• Tokens de Agente IA:</span>
                              <strong className="text-blue-800">{(inclusions.agentTokens || 0).toLocaleString()}</strong>
                            </div>
                          )}
                          {isCpj && 'bankPlan' in inclusions && 'boletos' in inclusions && (
                            <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                              <span>• {inclusions.bankPlan}:</span>
                              <strong className="text-blue-800">Conta Digital + {inclusions.boletos} Boletos</strong>
                            </div>
                          )}
                          {isCpj && 'financeType' in inclusions && (
                            <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                              <span>• Financeiro:</span>
                              <strong className="text-blue-800">{inclusions.financeType}</strong>
                            </div>
                          )}
                          {isCpj && 'unlimitedProcesses' in inclusions && (
                            <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
                              <span>• Processos:</span>
                              <strong className="text-blue-800">{inclusions.unlimitedProcesses ? 'Ilimitados' : 'Limitados'}</strong>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-1">⚡ Excedentes Contratados</h3>
                  <div className="text-xs space-y-2 text-slate-700">
                    {isOffice ? (() => {
                      if (!selectedTier) return null;
                      const officePlanInclusions = getPlanInclusions("OFFICE_ADV", selectedTier) as any;
                      if (!officePlanInclusions) return (
                        <div className="text-center text-slate-500 py-4">
                          Sem excedentes identificados
                        </div>
                      );
                      const hasExceedances = (
                        (formState.officeUsers || 0) > (officePlanInclusions.users || 0) ||
                        (formState.officePublications || 0) > (officePlanInclusions.publications || 0) ||
                        (formState.officeMonitoringCredits || 0) > (officePlanInclusions.monitoring || 0) ||
                        formState.officeIntimation ||
                        formState.officeDistributionProcesses ||
                        formState.officeProtocols
                      );
                      
                      if (!hasExceedances) {
                        return (
                          <div className="text-center text-green-600 py-4 bg-green-50 rounded-lg">
                            ✅ Todas as necessidades estão cobertas pelo pacote
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          {(formState.officeUsers || 0) > (officePlanInclusions.users || 0) && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Usuários excedentes:</span>
                              <strong className="text-orange-800">+{(formState.officeUsers || 0) - (officePlanInclusions.users || 0)}</strong>
                            </div>
                          )}
                          {(formState.officePublications || 0) > (officePlanInclusions.publications || 0) && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Publicações excedentes:</span>
                              <strong className="text-orange-800">+{(formState.officePublications || 0) - (officePlanInclusions.publications || 0)}/mês</strong>
                            </div>
                          )}
                          {(formState.officeMonitoringCredits || 0) > (officePlanInclusions.monitoring || 0) && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Monitoramento excedente:</span>
                              <strong className="text-orange-800">{((formState.officeMonitoringCredits || 0) - (officePlanInclusions.monitoring || 0)).toLocaleString()}/mês</strong>
                            </div>
                          )}
                          {formState.officeIntimation && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Intimações:</span>
                              <strong className="text-orange-800">{(formState.officeIntimation || 0).toLocaleString()}/mês</strong>
                            </div>
                          )}
                          {formState.officeDistributionProcesses && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Distribuição:</span>
                              <strong className="text-orange-800">{(formState.officeDistributionProcesses || 0).toLocaleString()}/mês</strong>
                            </div>
                          )}
                          {formState.officeProtocols && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Protocolos:</span>
                              <strong className="text-orange-800">{(formState.officeProtocols || 0).toLocaleString()}/mês</strong>
                            </div>
                          )}
                        </>
                      );
                    })() : null}
                    {isCpj ? (() => {
                      if (!selectedTier) return null;
                      const cpjPlanInclusions = getPlanInclusions("CPJ_3C_PLUS", selectedTier) as any;
                      if (!cpjPlanInclusions) return (
                        <div className="text-center text-slate-500 py-4">
                          Sem excedentes identificados
                        </div>
                      );
                      const hasExceedances = (
                        (formState.cpj3cUsers || 0) > (cpjPlanInclusions.users || 0) ||
                        (formState.cpj3cPublications || 0) > (cpjPlanInclusions.publications || 0) ||
                        (formState.cpj3cMonitoringCredits || 0) > (cpjPlanInclusions.monitoring || 0) ||
                        formState.cpj3cDistributionProcesses ||
                        formState.cpj3cProtocols
                      );
                      
                      if (!hasExceedances) {
                        return (
                          <div className="text-center text-green-600 py-4 bg-green-50 rounded-lg">
                            ✅ Todas as necessidades estão cobertas pelo pacote
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          {(formState.cpj3cUsers || 0) > (cpjPlanInclusions.users || 0) && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Usuários excedentes:</span>
                              <strong className="text-orange-800">+{(formState.cpj3cUsers || 0) - (cpjPlanInclusions.users || 0)}</strong>
                            </div>
                          )}
                          {(formState.cpj3cPublications || 0) > (cpjPlanInclusions.publications || 0) && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Publicações excedentes:</span>
                              <strong className="text-orange-800">+{(formState.cpj3cPublications || 0) - (cpjPlanInclusions.publications || 0)}/mês</strong>
                            </div>
                          )}
                          {(formState.cpj3cMonitoringCredits || 0) > (cpjPlanInclusions.monitoring || 0) && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Monitoramento excedente:</span>
                              <strong className="text-orange-800">{((formState.cpj3cMonitoringCredits || 0) - (cpjPlanInclusions.monitoring || 0)).toLocaleString()}/mês</strong>
                            </div>
                          )}
                          {formState.cpj3cDistributionProcesses && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Distribuição:</span>
                              <strong className="text-orange-800">{(formState.cpj3cDistributionProcesses || 0).toLocaleString()}/mês</strong>
                            </div>
                          )}
                          {formState.cpj3cProtocols && (
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              <span>• Protocolos:</span>
                              <strong className="text-orange-800">{(formState.cpj3cProtocols || 0).toLocaleString()}/mês</strong>
                            </div>
                          )}
                        </>
                      );
                    })() : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PÁGINA 2 CONTINUAÇÃO - INVESTIMENTO */}
        <div className="investment-section page-content-group">
          
          {/* 3. Investimento Mensal ou Anual */}
          <section className="investment-table-container section-together">
            <div className="no-page-break">
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  💰 3. {formState.billingCycle === "ANNUAL" ? "Investimento Anual" : "Investimento Mensal"}
                </h2>
                <div className="text-right">
                  {formState.billingCycle === "ANNUAL" ? (
                    <>
                      <div className="text-xs text-slate-500">Total Anual{annualDiscountApplied && ' (com desconto)'}</div>
                      <div className="text-2xl font-extrabold text-green-700">{formatCurrency(annualDiscountedTotal)}</div>
                      {annualDiscountApplied && (
                        <div className="text-xs text-red-600 line-through">De: {formatCurrency(annualTotal)}</div>
                      )}
                      {formState.annualInstallments > 1 && (
                        <div className="text-xs text-slate-500">Parcela: {formatCurrency(annualDiscountedTotal / formState.annualInstallments)}</div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-slate-500">Total Mensal{monthlyDiscountApplied && ' (com desconto)'}</div>
                      <div className="text-2xl font-extrabold text-green-700">{formatCurrency(monthlyDiscountedTotal)}</div>
                      {monthlyDiscountApplied && (
                        <div className="text-xs text-red-600 line-through">De: {formatCurrency(monthlyTotal)}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {monthlyItems.length === 0 ? (
                <div className="text-slate-500 italic">Nenhum item configurado.</div>
            ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 section-together print-clean">
              <table className="investment-table w-full text-sm">
                <thead className="bg-slate-100 force-print-colors">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 w-2/5">Item</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-700 w-1/6">Qtd</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-700">Unitário/Pacote</th>
                    {formState.billingCycle === "MONTHLY" ? (
                      <th className="text-right px-4 py-3 font-semibold text-slate-700">Mensal</th>
                    ) : (
                      <th className="text-right px-4 py-3 font-semibold text-slate-700">Anual</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {monthlyItems.map((it, idx) => (
                    <tr key={idx} className="border-t border-slate-200">
                      <td className="px-4 py-3">{it.item}</td>
                      <td className="px-4 py-3 text-center">{it.qty}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{it.unit}</td>
                      {formState.billingCycle === "MONTHLY" ? (
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(it.monthly)}</td>
                      ) : (
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">{formatCurrency(it.annual)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </section>

          {/* 4. Investimento Inicial */}
          <section className="investment-table-container section-together">
            <div className="flex items-end justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                🚀 4. Investimento Inicial (Setup)
              </h2>
              <div className="text-right">
                <div className="text-xs text-slate-500">Total Setup</div>
              <div className="text-2xl font-extrabold text-slate-900">{formatCurrency(setupTotal)}</div>
            </div>
          </div>
          {setupItems.length === 0 ? (
            <div className="text-slate-500 italic">Nenhum item de setup configurado.</div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Item</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Descrição</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-700">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {setupItems.map((it, idx) => (
                    <tr key={idx} className="border-t border-slate-200">
                      <td className="px-4 py-3">{it.item}</td>
                      <td className="px-4 py-3 text-slate-600">{it.description || "-"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(it.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        
        </div>

        {/* PÁGINA 3 - CONDIÇÕES COMERCIAIS E ACEITE */}
        <div className="proposal-page-3 page-break page-content-group">

          {/* 5. Condições de Pagamento */}
          <section className="commercial-conditions-section section-together">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2">
              💳 5. Condições de Pagamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 p-5 bg-white">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Investimento Inicial</h3>
                <div className="text-sm space-y-2">
                  <div><span className="text-slate-600">Data de Pagamento:</span> <strong>{formState.firstPaymentDate ? formatDate(formState.firstPaymentDate) : "-"}</strong></div>
                  <div><span className="text-slate-600">Parcelas:</span> <strong>{formState.setupInstallments || 1}x</strong></div>
                  {formState.setupDiscountValue && <div><span className="text-slate-600">Desconto:</span> <strong>{formState.setupDiscountValue}%</strong></div>}
                  <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                    <div>Valor total: <strong className="text-slate-700">{formatCurrency(setupTotal)}</strong></div>
                    {(formState.setupInstallments || 1) > 1 && (
                      <div>Parcela: <strong className="text-slate-700">{formatCurrency(setupTotal / (formState.setupInstallments || 1))}</strong></div>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-5 bg-white">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">{formState.billingCycle === "ANNUAL" ? "Pagamento Anual" : "Mensalidade"}</h3>
                <div className="text-sm space-y-2">
                  <div><span className="text-slate-600">Início da Cobrança:</span> <strong>{formState.firstMonthlyDate ? formatDate(formState.firstMonthlyDate) : "-"}</strong></div>
                  {formState.billingCycle === "ANNUAL" ? (
                    <>
                      <div><span className="text-slate-600">Parcelas:</span> <strong>{formState.annualInstallments || 1}x</strong></div>
                      {(formState.annualDiscountType === "PERCENT" && formState.annualDiscountValue) || (formState.annualDiscountType === "VALUE" && formState.annualDiscountValue) ? (
                        <div><span className="text-slate-600">Desconto:</span> <strong>{formState.annualDiscountType === "PERCENT" ? `${formState.annualDiscountValue}%` : formatCurrency(formState.annualDiscountValue)}</strong></div>
                      ) : null}
                      <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                        <div>Valor anual{annualDiscountApplied && ' (com desconto)'}: <strong className="text-slate-700">{formatCurrency(annualDiscountedTotal)}</strong></div>
                        {annualDiscountApplied && (
                          <div className="text-red-600 line-through">De: {formatCurrency(annualTotal)}</div>
                        )}
                        {formState.annualInstallments > 1 && (
                          <div>Parcela: <strong className="text-slate-700">{formatCurrency(annualDiscountedTotal / formState.annualInstallments)}</strong></div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {(formState.discountType === "PERCENT" && formState.discountValue) || (formState.discountType === "VALUE" && formState.discountValue) ? (
                        <div><span className="text-slate-600">Desconto:</span> <strong>{formState.discountType === "PERCENT" && formState.discountValue ? `${formState.discountValue}%` : formatCurrency(formState.discountValue)}</strong></div>
                      ) : null}
                      <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                        <div>Valor mensal{monthlyDiscountApplied && ' (com desconto)'}: <strong className="text-slate-700">{formatCurrency(monthlyDiscountedTotal)}</strong></div>
                        {monthlyDiscountApplied && (
                          <div className="text-red-600 line-through">De: {formatCurrency(monthlyTotal)}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 6. Observações */}
          {formState.observations && (
            <section className="section-together">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2">
                📝 6. Observações
              </h2>
              <div className="rounded-xl border border-slate-200 p-5 bg-slate-50">
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{formState.observations}</p>
              </div>
            </section>
          )}

          {/* 7. Assinaturas - Manter junto com footer */}
          <section className="pt-4 no-page-break signature-section">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-4 flex items-center gap-2">
              ✍️ Aceite da Proposta
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="h-16"></div>
                <div className="border-t-2 border-slate-400 pt-2">
                  <p className="text-xs font-bold text-slate-700">Cliente</p>
                </div>
              </div>
              <div className="text-center">
                <div className="h-16"></div>
                <div className="border-t-2 border-slate-400 pt-2">
                  <p className="text-xs font-bold text-slate-700">Preâmbulo Informática</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer - Manter junto com assinaturas */}
        <footer className="footer-section text-center no-page-break">
          <div className="bg-gradient-to-r from-black via-yellow-500 to-black text-white rounded-lg p-4 mb-4 force-print-colors print-clean">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-yellow-400 text-lg">🔥</span>
              <span className="text-lg font-bold">BLACK NOVEMBER</span>
              <span className="text-yellow-400 text-lg">🔥</span>
            </div>
            <div className="text-yellow-300 text-sm font-semibold">
              Aproveite nossos planos com desconto de até 56%!
            </div>
          </div>
          <p className="text-xs text-slate-500">Documento eletrônico • Preâmbulo Informática • {new Date().toLocaleDateString("pt-BR")}</p>
          <div className="text-xs text-blue-600 mt-2">
            📍 R. Padre Anchieta, 2224, Bigorrilho – Curitiba/PR – 80730-000<br/>
            📞 (41) 3322-1910 | 📧 comercial@preambulo.com.br
          </div>
        </footer>
      </div>
    </div>
  );
}
