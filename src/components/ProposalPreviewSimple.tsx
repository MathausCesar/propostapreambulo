import type { ProposalFormState } from "../types";
import * as pricingRules from "../utils/pricingRules";

interface Props {
  formState: ProposalFormState;
  consultantProfile: { name: string; phone?: string; email?: string } | null;
  captureId?: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string): string {
  if (!date) return "-";
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

export default function ProposalPreviewSimple({
  formState,
  consultantProfile,
  captureId,
}: Props) {
  // Calculate all values
  const isOffice = formState.erp === "OFFICE_ADV";
  const isCpj = formState.erp === "CPJ_3C_PLUS";

  // Calculate monthly items
  const monthlyItems: Array<{
    item: string;
    qty: number;
    unit: string;
    monthly: number;
    annual: number;
  }> = [];

  let monthlyTotal = 0;

  if (isOffice) {
    // Users
    if (formState.officeUsers) {
      const usersCost = formState.officeUsers * pricingRules.UNIT_PRICES.officeUser;
      monthlyItems.push({
        item: "Usuários",
        qty: formState.officeUsers,
        unit: formatCurrency(pricingRules.UNIT_PRICES.officeUser),
        monthly: usersCost,
        annual: usersCost * 12,
      });
      monthlyTotal += usersCost;
    }

    // Publications
    if (formState.officePublications) {
      const pubCost = formState.officePublications * pricingRules.UNIT_PRICES.officePublication;
      monthlyItems.push({
        item: "Publicações",
        qty: formState.officePublications,
        unit: formatCurrency(pricingRules.UNIT_PRICES.officePublication),
        monthly: pubCost,
        annual: pubCost * 12,
      });
      monthlyTotal += pubCost;
    }

    // Intimations
    if (formState.officeIntimation) {
      const intimCost = formState.officeIntimation * pricingRules.UNIT_PRICES.officeIntimation;
      monthlyItems.push({
        item: "Intimações",
        qty: formState.officeIntimation,
        unit: formatCurrency(pricingRules.UNIT_PRICES.officeIntimation),
        monthly: intimCost,
        annual: intimCost * 12,
      });
      monthlyTotal += intimCost;
    }

    // Monitoring
    if (formState.officeMonitoringCredits) {
      const monitoringResult = pricingRules.calculateMonitoring(formState.officeMonitoringCredits);
      monthlyItems.push({
        item: "Monitoramento",
        qty: formState.officeMonitoringCredits,
        unit: monitoringResult.tierDescription,
        monthly: monitoringResult.monthly,
        annual: monitoringResult.annual,
      });
      monthlyTotal += monitoringResult.monthly;
    }

    // Distribution
    if (formState.officeDistributionProcesses) {
      const distributionResult = pricingRules.calculateDistribution(formState.officeDistributionProcesses);
      monthlyItems.push({
        item: "Distribuição",
        qty: formState.officeDistributionProcesses,
        unit: distributionResult.tierDescription,
        monthly: distributionResult.monthly,
        annual: distributionResult.annual,
      });
      monthlyTotal += distributionResult.monthly;
    }

    // Protocols
    if (formState.officeProtocols) {
      const protocolsResult = pricingRules.calculateProtocols(formState.officeProtocols);
      monthlyItems.push({
        item: "Protocolos",
        qty: formState.officeProtocols,
        unit: protocolsResult.tierDescription,
        monthly: protocolsResult.monthly,
        annual: protocolsResult.annual,
      });
      monthlyTotal += protocolsResult.monthly;
    }

    // Docs IA
    if (formState.officeAiDocs) {
      const docsResult = pricingRules.calculateDocsIA(formState.officeAiDocs);
      monthlyItems.push({
        item: "Documentos IA",
        qty: formState.officeAiDocs,
        unit: docsResult.tierDescription,
        monthly: docsResult.monthly,
        annual: docsResult.annual,
      });
      monthlyTotal += docsResult.monthly;
    }

    // Finance Module
    if (formState.officeFinanceModule) {
      monthlyItems.push({
        item: "Financeiro Avançado",
        qty: 1,
        unit: formatCurrency(pricingRules.FIXED_PRICES.officeFinanceAdvanced),
        monthly: pricingRules.FIXED_PRICES.officeFinanceAdvanced,
        annual: pricingRules.FIXED_PRICES.officeFinanceAdvanced * 12,
      });
      monthlyTotal += pricingRules.FIXED_PRICES.officeFinanceAdvanced;
    }
  } else if (isCpj) {
    // Users
    if (formState.cpj3cUsers) {
      const usersCost = formState.cpj3cUsers * pricingRules.UNIT_PRICES.cpjUser;
      monthlyItems.push({
        item: "Usuários",
        qty: formState.cpj3cUsers,
        unit: formatCurrency(pricingRules.UNIT_PRICES.cpjUser),
        monthly: usersCost,
        annual: usersCost * 12,
      });
      monthlyTotal += usersCost;
    }

    // Publications
    if (formState.cpj3cPublications) {
      const pubCost = formState.cpj3cPublications * pricingRules.UNIT_PRICES.cpjPublication;
      monthlyItems.push({
        item: "Publicações",
        qty: formState.cpj3cPublications,
        unit: formatCurrency(pricingRules.UNIT_PRICES.cpjPublication),
        monthly: pubCost,
        annual: pubCost * 12,
      });
      monthlyTotal += pubCost;
    }

    // Monitoring
    if (formState.cpj3cMonitoringCredits) {
      const monitoringResult = pricingRules.calculateMonitoring(formState.cpj3cMonitoringCredits);
      monthlyItems.push({
        item: "Monitoramento",
        qty: formState.cpj3cMonitoringCredits,
        unit: monitoringResult.tierDescription,
        monthly: monitoringResult.monthly,
        annual: monitoringResult.annual,
      });
      monthlyTotal += monitoringResult.monthly;
    }

    // Distribution
    if (formState.cpj3cDistributionProcesses) {
      const distributionResult = pricingRules.calculateDistribution(formState.cpj3cDistributionProcesses);
      monthlyItems.push({
        item: "Distribuição",
        qty: formState.cpj3cDistributionProcesses,
        unit: distributionResult.tierDescription,
        monthly: distributionResult.monthly,
        annual: distributionResult.annual,
      });
      monthlyTotal += distributionResult.monthly;
    }

    // Protocols
    if (formState.cpj3cProtocols) {
      const protocolsResult = pricingRules.calculateProtocols(formState.cpj3cProtocols);
      monthlyItems.push({
        item: "Protocolos",
        qty: formState.cpj3cProtocols,
        unit: protocolsResult.tierDescription,
        monthly: protocolsResult.monthly,
        annual: protocolsResult.annual,
      });
      monthlyTotal += protocolsResult.monthly;
    }

    // Docs IA
    if (formState.cpj3cAiDocs) {
      const docsResult = pricingRules.calculateDocsIA(formState.cpj3cAiDocs);
      monthlyItems.push({
        item: "Documentos IA",
        qty: formState.cpj3cAiDocs,
        unit: docsResult.tierDescription,
        monthly: docsResult.monthly,
        annual: docsResult.annual,
      });
      monthlyTotal += docsResult.monthly;
    }

    // Consulting
    if (formState.cpj3cConsultingHours) {
      const consultingCost = formState.cpj3cConsultingHours * pricingRules.FIXED_PRICES.consultingHourly;
      monthlyItems.push({
        item: "Consultoria Mensal",
        qty: formState.cpj3cConsultingHours,
        unit: formatCurrency(pricingRules.FIXED_PRICES.consultingHourly) + "/hora",
        monthly: consultingCost,
        annual: consultingCost * 12,
      });
      monthlyTotal += consultingCost;
    }
  }

  // Add extra services (monthly)
  formState.extraServices.forEach((extra) => {
    if (extra.billing === "MONTHLY") {
      const cost = (extra.quantity || 0) * (extra.unitPrice || 0);
      monthlyItems.push({
        item: extra.description || "Extra",
        qty: extra.quantity || 0,
        unit: formatCurrency(extra.unitPrice || 0),
        monthly: cost,
        annual: cost * 12,
      });
      monthlyTotal += cost;
    }
  });

  // Calculate setup items
  const setupItems: Array<{
    item: string;
    description?: string;
    value: number;
  }> = [];

  let setupTotal = formState.setupFee || 0;

  if (formState.setupFee) {
    setupItems.push({
      item: "Taxa de Setup",
      value: formState.setupFee,
    });
  }

  if (formState.implementationStarter) {
    setupItems.push({
      item: "Starter Pack",
      description: "Treinamento e implantação acelerada",
      value: pricingRules.FIXED_PRICES.starter,
    });
    setupTotal += pricingRules.FIXED_PRICES.starter;
  }

  // Migration
  if (formState.migrationType && formState.migrationType !== "NONE") {
    if (formState.migrationType === "PLANILHA_PADRAO") {
      setupItems.push({
        item: "Migração - Planilha Padrão",
        description: "Cortesia",
        value: 0,
      });
    } else if (formState.migrationType === "DISCOVERY" && formState.migrationProcesses) {
      const migrationCost = pricingRules.calculateMigrationDiscovery(formState.migrationProcesses);
      if (migrationCost > 0) {
        setupItems.push({
          item: "Migração - Discovery",
          description: `${formState.migrationProcesses} processos (cortesia até 2000)`,
          value: migrationCost,
        });
        setupTotal += migrationCost;
      } else {
        setupItems.push({
          item: "Migração - Discovery",
          description: `${formState.migrationProcesses} processos (cortesia)`,
          value: 0,
        });
      }
    } else if (formState.migrationType === "PLANILHA_PERSONALIZADA" && formState.migrationHours) {
      const migrationCost = formState.migrationHours * pricingRules.FIXED_PRICES.consultingHourly;
      setupItems.push({
        item: "Migração - Planilha Personalizada",
        description: `${formState.migrationHours} horas @ ${formatCurrency(pricingRules.FIXED_PRICES.consultingHourly)}/h`,
        value: migrationCost,
      });
      setupTotal += migrationCost;
    } else if (formState.migrationType === "BACKUP_SISTEMA" && formState.migrationHours) {
      const migrationCost = formState.migrationHours * pricingRules.FIXED_PRICES.consultingHourly;
      setupItems.push({
        item: "Migração - Backup de Sistema",
        description: `${formState.migrationHours} horas @ ${formatCurrency(pricingRules.FIXED_PRICES.consultingHourly)}/h`,
        value: migrationCost,
      });
      setupTotal += migrationCost;
    }
  }

  // Add extra services (setup)
  formState.extraServices.forEach((extra) => {
    if (extra.billing === "SETUP") {
      const cost = (extra.quantity || 0) * (extra.unitPrice || 0);
      setupItems.push({
        item: extra.description || "Extra",
        value: cost,
      });
      setupTotal += cost;
    }
  });

  const annualTotal = monthlyTotal * 12;

  return (
    <div id={captureId} className="bg-white text-slate-900 p-8 rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8 border-b-2 border-slate-200 pb-6">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Proposta Comercial</h1>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-600">
              <strong>Produto:</strong>{" "}
              {formState.erp === "OFFICE_ADV"
                ? "Office ADV"
                : formState.erp === "CPJ_3C_PLUS"
                ? "CPJ-3C+"
                : "Outro"}
            </p>
          </div>
          {consultantProfile && (
            <div className="text-right text-sm text-slate-600">
              <p>
                <strong>Consultor:</strong> {consultantProfile.name}
              </p>
              {consultantProfile.phone && <p>{consultantProfile.phone}</p>}
              {consultantProfile.email && <p>{consultantProfile.email}</p>}
            </div>
          )}
        </div>
      </div>

      {/* 1. Dados do Cliente */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-l-4 border-blue-600 pl-3">
          1. Dados do Cliente
        </h2>
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-slate-500">Empresa</p>
            <p className="font-semibold text-slate-900">{formState.clientName || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Pessoa de Contato</p>
            <p className="font-semibold text-slate-900">{formState.clientResponsible || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Telefone</p>
            <p className="font-semibold text-slate-900">{formState.clientPhone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">E-mail</p>
            <p className="font-semibold text-slate-900">{formState.clientEmail || "-"}</p>
          </div>
        </div>
      </div>

      {/* 2. Investimento Mensal */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-l-4 border-green-600 pl-3">
          2. Investimento Mensal
        </h2>
        {monthlyItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Item</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Qtd</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Unitário/Pacote</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Mensal</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Anual</th>
                </tr>
              </thead>
              <tbody>
                {monthlyItems.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900">{item.item}</td>
                    <td className="py-3 px-4 text-center text-slate-700">{item.qty}</td>
                    <td className="py-3 px-4 text-right text-slate-600 text-sm">{item.unit}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(item.monthly)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {formatCurrency(item.annual)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 border-t-2 border-green-600">
                  <td colSpan={3} className="py-4 px-4 font-bold text-green-900 text-lg">
                    Total Mensalidade
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-green-900 text-lg">
                    {formatCurrency(monthlyTotal)}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-green-700 text-lg">
                    {formatCurrency(annualTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 italic">Nenhum item mensal configurado.</p>
        )}
      </div>

      {/* 3. Investimento Inicial */}
      {setupItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 border-l-4 border-purple-600 pl-3">
            3. Investimento Inicial (Setup)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Item</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Descrição</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Valor</th>
                </tr>
              </thead>
              <tbody>
                {setupItems.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900">{item.item}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{item.description || "-"}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-purple-50 border-t-2 border-purple-600">
                  <td colSpan={2} className="py-4 px-4 font-bold text-purple-900 text-lg">
                    Total Setup
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-purple-900 text-lg">
                    {formatCurrency(setupTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 4. Condições de Pagamento */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-l-4 border-orange-600 pl-3">
          4. Condições de Pagamento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-bold text-slate-800 mb-3">Investimento Inicial</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-600">Data de Pagamento:</span>{" "}
                <strong className="text-slate-900">
                  {formState.firstPaymentDate ? formatDate(formState.firstPaymentDate) : "-"}
                </strong>
              </p>
              <p>
                <span className="text-slate-600">Parcelas:</span>{" "}
                <strong className="text-slate-900">{formState.setupInstallments || 1}x</strong>
              </p>
              {formState.setupDiscountValue && (
                <p>
                  <span className="text-slate-600">Desconto:</span>{" "}
                  <strong className="text-slate-900">
                    {formState.setupDiscountValue}%
                  </strong>
                </p>
              )}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-bold text-slate-800 mb-3">Mensalidade</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-600">Início da Cobrança:</span>{" "}
                <strong className="text-slate-900">
                  {formState.firstMonthlyDate ? formatDate(formState.firstMonthlyDate) : "-"}
                </strong>
              </p>
              {((formState.discountType === "PERCENT" && formState.discountValue) || (formState.discountType === "VALUE" && formState.discountValue)) && (
                <p>
                  <span className="text-slate-600">Desconto:</span>{" "}
                  <strong className="text-slate-900">
                    {formState.discountType === "PERCENT" && formState.discountValue
                      ? `${formState.discountValue}%`
                      : formatCurrency(formState.discountValue)}
                  </strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Observações */}
      {formState.observations && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 border-l-4 border-indigo-600 pl-3">
            5. Observações
          </h2>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-700 whitespace-pre-wrap">{formState.observations}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t-2 border-slate-200 text-center text-sm text-slate-500">
        <p>Proposta gerada em {new Date().toLocaleDateString("pt-BR")}</p>
        <p className="mt-2">Esta proposta tem validade de 30 dias a partir da data de emissão.</p>
      </div>
    </div>
  );
}
