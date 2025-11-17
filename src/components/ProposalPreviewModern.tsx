import React from "react";
import { ProposalFormState, OfficePricingResult, Cpj3cPackageCalculation, ErpProduct, PackageTier } from "../types";
import { formatCurrency } from "../utils/money";
import { getPlanInclusions, calculateOfficeExceedances, calculateCpj3cExceedances } from "../utils/pricingPlans";
import * as pricingRules from "../utils/pricingRules";

interface ConsultantProfile {
  name: string;
  phone: string;
  email: string;
}

interface Props {
  formState: ProposalFormState;
  consultantProfile: ConsultantProfile | null;
  officeCalculation?: OfficePricingResult;
  cpj3cCalculation?: Cpj3cPackageCalculation;
  captureId?: string;
}

function erpName(erp: ErpProduct): string {
  if (erp === "OFFICE_ADV") return "Office ADV";
  if (erp === "CPJ_3C_PLUS") return "CPJ-3C+";
  if (erp === "CPJ_COBRANCA") return "CPJ-Cobrança";
  return String(erp);
}

function tierLabel(tier: PackageTier): string {
  return tier;
}

const ProposalPreviewModern: React.FC<Props> = ({ formState, consultantProfile, officeCalculation, cpj3cCalculation, captureId }) => {
  const applyDiscount = (base: number, t: "NONE" | "PERCENT" | "VALUE", v: number) => {
    if (!base) return 0;
    if (t === "PERCENT") return Math.max(0, base - base * (v / 100));
    if (t === "VALUE") return Math.max(0, base - v);
    return base;
  };

  // First, calculate service rows to get accurate totals
  let monthlyServiceRows: { label: string; qty?: number; unit?: string; unitPrice?: number; value: number }[] = [];
  let setupServiceRows: { label: string; qty?: number; unit?: string; unitPrice?: number; value: number }[] = [];
  
  if (formState.erp === "OFFICE_ADV") {
    const inc = getPlanInclusions("OFFICE_ADV", formState.packageTier)!;
    
    // Monthly services
    const usersRequested = formState.officeUsers || 0;
    const usersExceed = Math.max(0, usersRequested - inc.users);
    if (usersExceed > 0) {
      monthlyServiceRows.push({ 
        label: "Usuários excedentes", 
        qty: usersExceed, 
        unit: "usuário",
        unitPrice: pricingRules.UNIT_PRICES.officeUser,
        value: usersExceed * pricingRules.UNIT_PRICES.officeUser 
      });
    }
    
    const pubsRequested = formState.officePublications || 0;
    const pubsExceed = Math.max(0, pubsRequested - inc.publications);
    if (pubsExceed > 0) {
      monthlyServiceRows.push({ 
        label: "Publicações (termos)", 
        qty: pubsExceed,
        unit: "termo",
        unitPrice: pricingRules.UNIT_PRICES.officePublication,
        value: pubsExceed * pricingRules.UNIT_PRICES.officePublication 
      });
    }

    if (formState.officeIntimation > 0) {
      monthlyServiceRows.push({
        label: "Intimação (painéis)",
        qty: formState.officeIntimation,
        unit: "painel",
        unitPrice: pricingRules.UNIT_PRICES.officeIntimation,
        value: formState.officeIntimation * pricingRules.UNIT_PRICES.officeIntimation
      });
    }
    
    const monit = formState.officeMonitoringCredits || 0;
    if (monit > 0) {
      const monitCost = pricingRules.calculateOfficeMonitoring(monit);
      monthlyServiceRows.push({ 
        label: "Monitoramento (processos)", 
        qty: monit,
        unit: "processo",
        value: monitCost 
      });
    }
    
    const distTerms = formState.officeDistributionTerms || 0;
    const distProcs = formState.officeDistributionProcesses || 0;
    const totalDist = distTerms + distProcs;
    if (totalDist > 0) {
      const distCost = pricingRules.calculateDistribution(totalDist);
      monthlyServiceRows.push({ 
        label: "Distribuição", 
        qty: totalDist,
        unit: "termo/proc",
        value: distCost 
      });
    }
    
    const protocols = formState.officeProtocols || 0;
    if (protocols >= 100) {
      const protCost = pricingRules.calculateCpjProtocol(protocols); // Office uses same protocol pricing
      monthlyServiceRows.push({ 
        label: "Protocolos", 
        qty: protocols,
        unit: "protocolo",
        value: protCost 
      });
    }

    // Finance module
    const financeIncluded = (inc as any).financeIncluded || (inc as any).financeAdvancedIncluded || false;
    if (formState.officeFinanceModule && !financeIncluded) {
      monthlyServiceRows.push({
        label: "Módulo Financeiro Avançado",
        value: pricingRules.FIXED_PRICES.officeFinanceAdvanced
      });
    }

    // API module
    if (formState.officeApiModule) {
      monthlyServiceRows.push({
        label: "Módulo API",
        value: 0 // Add price when defined
      });
    }

    // Setup services for Office ADV
    if (formState.implementationStarter) {
      setupServiceRows.push({ label: "Plano Starter", value: pricingRules.FIXED_PRICES.starter });
    }

    if (formState.migrationType === "OAB") {
      const procs = formState.migrationProcesses || 0;
      const migCost = pricingRules.calculateMigrationOAB(procs);
      if (migCost > 0) {
        setupServiceRows.push({
          label: "Migração por OAB",
          qty: procs,
          unit: "processo",
          unitPrice: 0.25,
          value: migCost
        });
      }
    } else if (formState.migrationType === "PLANILHA_PADRAO") {
      setupServiceRows.push({ label: "Migração Planilha Padrão", value: 0 });
    } else if (formState.migrationType === "PERSONALIZADA") {
      setupServiceRows.push({ label: "Migração Personalizada", value: 0 });
    }

    // Treinamentos
    if (formState.trainingReportPowerBI) {
      setupServiceRows.push({ label: "Treinamento Relatórios + PowerBI", value: pricingRules.FIXED_PRICES.trainingReportPowerBI });
    }
    if (formState.trainingDocGenerator) {
      setupServiceRows.push({ label: "Treinamento Gerador de Documentos", value: pricingRules.FIXED_PRICES.trainingDocGenerator });
    }
    if (formState.trainingControlling) {
      setupServiceRows.push({ label: "Treinamento Controlling", value: pricingRules.FIXED_PRICES.trainingControlling });
    }
    if (formState.trainingFinance) {
      setupServiceRows.push({ label: "Treinamento Financeiro Avançado", value: pricingRules.FIXED_PRICES.trainingFinance });
    }

    // Boleto Bancário
    if (formState.boletoBancario) {
      setupServiceRows.push({ label: "Boleto Bancário", value: pricingRules.FIXED_PRICES.boletoBancario });
    }

    // Consultoria
    const consultingHours = formState.officeConsultingHours || 0;
    if (consultingHours > 0) {
      setupServiceRows.push({
        label: "Consultoria",
        qty: consultingHours,
        unit: "hora",
        unitPrice: pricingRules.FIXED_PRICES.consultingHourly,
        value: consultingHours * pricingRules.FIXED_PRICES.consultingHourly
      });
    }

  } else if (formState.erp === "CPJ_3C_PLUS") {
    const inc = getPlanInclusions("CPJ_3C_PLUS", formState.packageTier)!;
    
    // Monthly services
    const usersRequested = formState.cpj3cUsers || 0;
    const usersExceed = Math.max(0, usersRequested - inc.users);
    if (usersExceed > 0) {
      monthlyServiceRows.push({ 
        label: "Usuários excedentes", 
        qty: usersExceed,
        unit: "usuário",
        unitPrice: pricingRules.UNIT_PRICES.cpjUser,
        value: usersExceed * pricingRules.UNIT_PRICES.cpjUser 
      });
    }
    
    const pubsRequested = formState.cpj3cPublications || 0;
    const pubsExceed = Math.max(0, pubsRequested - inc.publications);
    if (pubsExceed > 0) {
      monthlyServiceRows.push({ 
        label: "Publicações (termos)", 
        qty: pubsExceed,
        unit: "termo",
        unitPrice: pricingRules.UNIT_PRICES.cpjPublication,
        value: pubsExceed * pricingRules.UNIT_PRICES.cpjPublication 
      });
    }

    if (formState.cpj3cIntimation > 0) {
      monthlyServiceRows.push({
        label: "Intimação (termos)",
        qty: formState.cpj3cIntimation,
        unit: "termo",
        unitPrice: pricingRules.UNIT_PRICES.officeIntimation, // Same price as Office
        value: formState.cpj3cIntimation * pricingRules.UNIT_PRICES.officeIntimation
      });
    }
    
    const monit = formState.cpj3cMonitoringCredits || 0;
    if (monit > 0) {
      const monitCost = pricingRules.calculateCpjMonitoring(monit);
      monthlyServiceRows.push({ 
        label: "Monitoramento (processos)", 
        qty: monit,
        unit: "processo",
        value: monitCost 
      });
    }

    if (formState.cpj3cNfe > 0) {
      monthlyServiceRows.push({
        label: "NFe (CNPJs)",
        qty: formState.cpj3cNfe,
        unit: "CNPJ",
        unitPrice: pricingRules.FIXED_PRICES.cpjNfePerCnpj,
        value: formState.cpj3cNfe * pricingRules.FIXED_PRICES.cpjNfePerCnpj
      });
    }
    
    const dist = formState.cpj3cDistributionProcesses || 0;
    if (dist > 0) {
      const distCost = pricingRules.calculateDistribution(dist);
      monthlyServiceRows.push({ 
        label: "Distribuição (processos)", 
        qty: dist,
        unit: "processo",
        value: distCost 
      });
    }
    
    const protocols = formState.cpj3cProtocols || 0;
    if (protocols >= 100) {
      const protCost = pricingRules.calculateCpjProtocol(protocols);
      monthlyServiceRows.push({ 
        label: "Protocolos", 
        qty: protocols,
        unit: "protocolo",
        value: protCost 
      });
    }

    // Setup services for CPJ-3C
    if (formState.implementationStarter) {
      setupServiceRows.push({ label: "Plano Starter", value: pricingRules.FIXED_PRICES.starter });
    }

    if (formState.migrationType === "OAB") {
      const procs = formState.migrationProcesses || 0;
      const migCost = pricingRules.calculateMigrationOAB(procs);
      if (migCost > 0) {
        setupServiceRows.push({
          label: "Migração por OAB",
          qty: procs,
          unit: "processo",
          unitPrice: 0.25,
          value: migCost
        });
      }
    } else if (formState.migrationType === "PLANILHA_PADRAO") {
      setupServiceRows.push({ label: "Migração Planilha Padrão", value: 0 });
    } else if (formState.migrationType === "PERSONALIZADA") {
      setupServiceRows.push({ label: "Migração Personalizada", value: 0 });
    }

    // Consultoria
    const consultingHours = formState.cpj3cConsultingHours || 0;
    if (consultingHours > 0) {
      setupServiceRows.push({
        label: "Consultoria",
        qty: consultingHours,
        unit: "hora",
        unitPrice: pricingRules.FIXED_PRICES.consultingHourly,
        value: consultingHours * pricingRules.FIXED_PRICES.consultingHourly
      });
    }

    // Fluxo Completo
    const flowHours = formState.cpj3cFlowHours || 0;
    if (flowHours > 0) {
      setupServiceRows.push({
        label: "Fluxo Completo",
        qty: flowHours,
        unit: "hora",
        value: 0 // Add price when defined
      });
    }
  }

  // Calculate totals from service rows
  const monthlyServicesTotal = monthlyServiceRows.reduce((sum, row) => sum + row.value, 0);
  const setupServicesTotal = setupServiceRows.reduce((sum, row) => sum + row.value, 0);

  // Get package base price from plan
  let packageBasePrice = 0;
  if (formState.erp === "OFFICE_ADV") {
    const plan = getPlanInclusions("OFFICE_ADV", formState.packageTier);
    if (plan) packageBasePrice = (plan as any).monthlyPrice || 0;
  } else if (formState.erp === "CPJ_3C_PLUS") {
    const plan = getPlanInclusions("CPJ_3C_PLUS", formState.packageTier);
    if (plan) packageBasePrice = (plan as any).monthlyPrice || 0;
  }
  
  // Mensal: package base + services
  const monthlyBase = packageBasePrice + monthlyServicesTotal;
  
  // Setup: setup fee + services
  const setupBase = (formState.setupFee || 0) + setupServicesTotal;
  
  // Apply discounts
  const monthly = applyDiscount(monthlyBase, formState.discountType, formState.discountValue || 0);
  const setup = applyDiscount(setupBase, formState.setupDiscountType, formState.setupDiscountValue || 0);
  const hasMonthlyDiscount = monthlyBase > 0 && monthly < monthlyBase;
  const hasSetupDiscount = setupBase > 0 && setup < setupBase;
  const setupInstallments = Math.max(1, formState.setupInstallments || 1);
  const setupPerInstallment = setupInstallments > 0 ? setup / setupInstallments : setup;
  const setupStartDate = formState.firstPaymentDate ? new Date(formState.firstPaymentDate) : null;
  const monthlyStartDate = formState.firstMonthlyDate ? new Date(formState.firstMonthlyDate) : null;
  const samePeriod = !!(setupStartDate && monthlyStartDate && setupStartDate.getFullYear() === monthlyStartDate.getFullYear() && setupStartDate.getMonth() === monthlyStartDate.getMonth());

  // Extras
  const setupExtrasTotal = (formState.extraServices || [])
    .filter((s) => s.billing === "SETUP")
    .reduce((acc, s) => acc + (s.quantity || 0) * (s.unitPrice || 0), 0);
  const monthlyExtrasTotal = (formState.extraServices || [])
    .filter((s) => s.billing === "MONTHLY")
    .reduce((acc, s) => acc + (s.quantity || 0) * (s.unitPrice || 0), 0);
  const monthlyWithExtras = monthly + monthlyExtrasTotal;
  const setupWithExtras = setup + setupExtrasTotal;

  const usersSummary = (() => {
    if (formState.erp === "OFFICE_ADV" && officeCalculation) {
      return `${officeCalculation.usersRequested} usuários (${officeCalculation.usersIncluded} incluídos)`;
    }
    if (formState.erp === "CPJ_3C_PLUS" && cpj3cCalculation) {
      return `${cpj3cCalculation.usersRequested} usuários (${cpj3cCalculation.usersIncluded} incluídos)`;
    }
    return undefined;
  })();

  const today = new Date();
  const issueDate = today.toLocaleDateString("pt-BR");
  const number = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}-${String(Date.now()).slice(-4)}`;

  // Old exceedances table (legacy, keep for now)
  let exceedRows: { label: string; qty?: number; value: number }[] = [];
  if (formState.erp === "OFFICE_ADV") {
    const inc = getPlanInclusions("OFFICE_ADV", formState.packageTier)!;
    const ex = calculateOfficeExceedances({
      users: formState.officeUsers || 0,
      publications: formState.officePublications || 0,
      monitoring: formState.officeMonitoringCredits || 0,
      distribution: formState.officeDistributionProcesses || 0,
      protocol: formState.officeProtocols || 0,
      docs: formState.officeAiDocs || 0,
      includeFinance: !!formState.officeFinanceModule,
      planInclusions: inc as any,
    });
    if (ex.users.exceed > 0) exceedRows.push({ label: "Usuários excedentes", qty: ex.users.exceed, value: ex.users.price });
    if (ex.publications.exceed > 0) exceedRows.push({ label: "Publicações", qty: ex.publications.exceed, value: ex.publications.price });
    if (ex.monitoring.price > 0) exceedRows.push({ label: "Monitoramento (pacote)", value: ex.monitoring.price });
    if (ex.distribution.price > 0) exceedRows.push({ label: "Distribuição (pacote)", value: ex.distribution.price });
    if (ex.protocol.price > 0) exceedRows.push({ label: "Protocolos (pacote)", value: ex.protocol.price });
    if (ex.docs.price > 0) exceedRows.push({ label: "Docs IA (pacote)", value: ex.docs.price });
    if (ex.finance.price > 0) exceedRows.push({ label: "Financeiro Avançado", value: ex.finance.price });
  } else if (formState.erp === "CPJ_3C_PLUS") {
    const inc = getPlanInclusions("CPJ_3C_PLUS", formState.packageTier)!;
    const ex = calculateCpj3cExceedances({
      users: formState.cpj3cUsers || 0,
      publications: formState.cpj3cPublications || 0,
      monitoring: formState.cpj3cMonitoringCredits || 0,
      distribution: formState.cpj3cDistributionProcesses || 0,
      protocol: formState.cpj3cProtocols || 0,
      docs: formState.cpj3cAiDocs || 0,
      planInclusions: inc as any,
    });
    if (ex.users.exceed > 0) exceedRows.push({ label: "Usuários excedentes", qty: ex.users.exceed, value: ex.users.price });
    if (ex.publications.exceed > 0) exceedRows.push({ label: "Publicações", qty: ex.publications.exceed, value: ex.publications.price });
    if (ex.monitoring.price > 0) exceedRows.push({ label: "Monitoramento (pacote)", value: ex.monitoring.price });
    if (ex.distribution.price > 0) exceedRows.push({ label: "Distribuição (pacote)", value: ex.distribution.price });
    if (ex.protocol.price > 0) exceedRows.push({ label: "Protocolos (pacote)", value: ex.protocol.price });
    if (ex.docs.price > 0) exceedRows.push({ label: "Docs IA (pacote)", value: ex.docs.price });
  }

  return (
    <aside className="h-full overflow-y-auto bg-slate-100 text-slate-900">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div id={captureId} className="mx-auto w-[210mm] max-w-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white px-10 py-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm opacity-80">PREÂMBULO</div>
                <h1 className="text-2xl font-black">Proposta Comercial</h1>
                <div className="text-sm opacity-80 mt-1">{erpName(formState.erp)} • Plano {tierLabel(formState.packageTier)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">NÚMERO</div>
                <div className="text-xl font-black">{number}</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white px-10 py-8 space-y-8">
            {/* Client & Consultant */}
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Cliente</div>
                <div className="font-bold text-slate-900">{formState.clientName || "-"}</div>
                <div className="text-slate-600">{formState.clientResponsible ? `Resp.: ${formState.clientResponsible}` : ""}</div>
                <div className="text-slate-600">{formState.clientPhone || ""}</div>
                <div className="text-slate-600">{formState.clientEmail || ""}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Consultor</div>
                <div className="font-bold text-slate-900">{consultantProfile?.name || "-"}</div>
                <div className="text-slate-600">{consultantProfile?.phone || ""}</div>
                <div className="text-slate-600">{consultantProfile?.email || ""}</div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Mensalidade</div>
                <div className="text-2xl font-black text-slate-900">{formatCurrency(monthlyWithExtras)}</div>
                {hasMonthlyDiscount && (
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="line-through mr-2">{formatCurrency(monthlyBase)}</span>
                    <span className="text-emerald-700 font-semibold">com desconto</span>
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1">Valor recorrente</div>
                {monthlyExtrasTotal > 0 && (
                  <div className="text-xs text-slate-600 mt-1">Inclui extras: {formatCurrency(monthlyExtrasTotal)}</div>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Setup</div>
                <div className="text-2xl font-black text-slate-900">{formatCurrency(setupWithExtras)}</div>
                {hasSetupDiscount && (
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="line-through mr-2">{formatCurrency(setupBase)}</span>
                    <span className="text-emerald-700 font-semibold">com desconto</span>
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1">Investimento único</div>
                {setupInstallments > 1 && (
                  <div className="text-xs text-slate-600 mt-1">
                    {setupInstallments}x de {formatCurrency(setupWithExtras / setupInstallments)}
                  </div>
                )}
                {setupExtrasTotal > 0 && (
                  <div className="text-xs text-slate-600 mt-1">Inclui extras: {formatCurrency(setupExtrasTotal)}</div>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Anual</div>
                <div className="text-2xl font-black text-slate-900">{formatCurrency(monthlyWithExtras * 12)}</div>
                <div className="text-xs text-slate-500 mt-1">12 meses</div>
              </div>
            </div>

            {/* Total do 1º Mês */}
            {samePeriod && setupWithExtras > 0 && monthlyWithExtras > 0 && (
              <div className="rounded-xl border-2 border-blue-500 bg-blue-50 p-6">
                <div className="text-xs font-semibold text-blue-700 uppercase mb-2">Total do 1º Mês</div>
                <div className="text-3xl font-black text-blue-900 mb-2">
                  {formatCurrency((setupWithExtras / setupInstallments) + monthlyWithExtras)}
                </div>
                <div className="text-sm text-blue-800">
                  • Primeira parcela do setup ({setupInstallments > 1 ? `1/${setupInstallments}` : "única"}): {formatCurrency(setupWithExtras / setupInstallments)}
                </div>
                <div className="text-sm text-blue-800">
                  • Primeira mensalidade: {formatCurrency(monthlyWithExtras)}
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  * Setup e mensalidade com vencimento no mesmo período
                </div>
              </div>
            )}

            {/* Details */}
            <div className="rounded-xl border border-slate-200 p-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-slate-500">Emissão</div>
                  <div className="font-semibold text-slate-900">{issueDate}</div>
                </div>
                <div>
                  <div className="text-slate-500">Uso</div>
                  <div className="font-semibold text-slate-900">{usersSummary || "—"}</div>
                </div>
              </div>
            </div>

            {/* Investimento Mensal — Serviços */}
            {monthlyServiceRows.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-6 text-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Investimento Mensal — Serviços</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Item</th>
                      <th className="py-2">Qtd</th>
                      <th className="py-2">Unit.</th>
                      <th className="py-2 text-right">Valor Mensal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Package base */}
                    {packageBasePrice > 0 && (
                      <tr className="border-t border-slate-200">
                        <td className="py-2 text-slate-800 font-semibold">Pacote {formState.packageTier}</td>
                        <td className="py-2 text-slate-600">—</td>
                        <td className="py-2 text-slate-600">—</td>
                        <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(packageBasePrice)}</td>
                      </tr>
                    )}
                    {monthlyServiceRows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-200">
                        <td className="py-2 text-slate-800">{r.label}</td>
                        <td className="py-2 text-slate-600">{r.qty ?? "-"}</td>
                        <td className="py-2 text-slate-600">{r.unitPrice ? formatCurrency(r.unitPrice) : "-"}</td>
                        <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(r.value)}</td>
                      </tr>
                    ))}
                    {monthlyExtrasTotal > 0 && (
                      <tr className="border-t border-slate-200">
                        <td className="py-2 text-slate-800 font-semibold">Extras Mensais</td>
                        <td className="py-2 text-slate-600">—</td>
                        <td className="py-2 text-slate-600">—</td>
                        <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(monthlyExtrasTotal)}</td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-slate-300 font-bold">
                      <td className="py-2 text-slate-900" colSpan={3}>Subtotal Mensal</td>
                      <td className="py-2 text-right text-slate-900">{formatCurrency(monthlyBase)}</td>
                    </tr>
                    {hasMonthlyDiscount && (
                      <>
                        <tr>
                          <td className="py-2 text-slate-600" colSpan={3}>Desconto</td>
                          <td className="py-2 text-right text-emerald-700">-{formatCurrency(monthlyBase - monthly)}</td>
                        </tr>
                        <tr className="font-bold">
                          <td className="py-2 text-slate-900" colSpan={3}>Total com Desconto</td>
                          <td className="py-2 text-right text-slate-900">{formatCurrency(monthlyWithExtras)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Investimento Inicial — Serviços */}
            {setupServiceRows.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-6 text-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Investimento Inicial — Serviços</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Item</th>
                      <th className="py-2">Qtd</th>
                      <th className="py-2">Unit.</th>
                      <th className="py-2 text-right">Valor Setup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Setup fee */}
                    {formState.setupFee > 0 && (
                      <tr className="border-t border-slate-200">
                        <td className="py-2 text-slate-800 font-semibold">Taxa de Setup</td>
                        <td className="py-2 text-slate-600">—</td>
                        <td className="py-2 text-slate-600">—</td>
                        <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(formState.setupFee)}</td>
                      </tr>
                    )}
                    {setupServiceRows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-200">
                        <td className="py-2 text-slate-800">{r.label}</td>
                        <td className="py-2 text-slate-600">{r.qty ?? "-"}</td>
                        <td className="py-2 text-slate-600">{r.unitPrice ? formatCurrency(r.unitPrice) : "-"}</td>
                        <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(r.value)}</td>
                      </tr>
                    ))}
                    {setupExtrasTotal > 0 && (
                      <tr className="border-t border-slate-200">
                        <td className="py-2 text-slate-800 font-semibold">Extras Setup</td>
                        <td className="py-2 text-slate-600">—</td>
                        <td className="py-2 text-slate-600">—</td>
                        <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(setupExtrasTotal)}</td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-slate-300 font-bold">
                      <td className="py-2 text-slate-900" colSpan={3}>Subtotal Setup</td>
                      <td className="py-2 text-right text-slate-900">{formatCurrency(setupBase)}</td>
                    </tr>
                    {hasSetupDiscount && (
                      <>
                        <tr>
                          <td className="py-2 text-slate-600" colSpan={3}>Desconto</td>
                          <td className="py-2 text-right text-emerald-700">-{formatCurrency(setupBase - setup)}</td>
                        </tr>
                        <tr className="font-bold">
                          <td className="py-2 text-slate-900" colSpan={3}>Total com Desconto</td>
                          <td className="py-2 text-right text-slate-900">{formatCurrency(setupWithExtras)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {exceedRows.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-6 text-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Excedentes e Pacotes</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Item</th>
                      <th className="py-2">Qtd</th>
                      <th className="py-2 text-right">Valor Mensal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exceedRows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-200">
                        <td className="py-2 text-slate-800">{r.label}</td>
                        <td className="py-2 text-slate-600">{r.qty ?? "-"}</td>
                        <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(r.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Extras declarados */}
            {(formState.extraServices && formState.extraServices.length > 0) && (
              <div className="rounded-xl border border-slate-200 p-6 text-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Funcionalidades e Serviços Adicionais</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Descrição</th>
                      <th className="py-2">Tipo</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formState.extraServices.map((s) => (
                      <tr key={s.id} className="border-top border-slate-200">
                        <td className="py-2 text-slate-800">{s.description || "—"}</td>
                        <td className="py-2 text-slate-600">{s.billing === "SETUP" ? "Setup" : "Mensal"}</td>
                        <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency((s.quantity || 0) * (s.unitPrice || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Condições de Pagamento */}
            {(setup > 0 || monthly > 0) && (
              <div className="rounded-xl border border-slate-200 p-6 text-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Condições de Pagamento</div>
                <div className="space-y-1 text-slate-800">
                  {setup > 0 && (
                    <div>
                      {setupInstallments > 1 ? (
                        <>
                          • Setup: {setupInstallments}x de {formatCurrency(setupPerInstallment)}{setupStartDate ? ` a partir de (${setupStartDate.toLocaleDateString("pt-BR")})` : ""}
                        </>
                      ) : (
                        <>• Setup: {formatCurrency(setup)}{setupStartDate ? ` em (${setupStartDate.toLocaleDateString("pt-BR")})` : ""}</>
                      )}
                    </div>
                  )}
                  {monthlyWithExtras > 0 && (
                    <div>
                      • Mensalidade{monthlyStartDate ? ` a partir de (${monthlyStartDate.toLocaleDateString("pt-BR")})` : ""}: {formatCurrency(monthlyWithExtras)}
                    </div>
                  )}
                  {samePeriod && (
                    <div className="text-slate-900 font-semibold">
                      • Total do 1º período: {formatCurrency((setupInstallments > 1 ? (setupWithExtras / setupInstallments) : setupWithExtras) + monthlyWithExtras)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {formState.observations ? (
              <div className="rounded-xl border border-slate-200 p-6 text-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Observações</div>
                <div className="text-slate-800 whitespace-pre-wrap">{formState.observations}</div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-10 py-4 text-xs">
            Preâmbulo Informática • Documento eletrônico • Parcelas do setup: {formState.setupInstallments || 1}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ProposalPreviewModern;
