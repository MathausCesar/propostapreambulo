import React, { ChangeEvent } from "react";
import { ProposalFormState, ErpProduct, PackageTier } from "../types";

interface ProposalFormProps {
  formState: ProposalFormState;
  onChange: (
    field: keyof ProposalFormState
  ) => (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onToggleOfficeFinance: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleStarter?: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddExtra?: () => void;
  onRemoveExtra?: (id: string) => void;
  onChangeExtra?: (
    id: string,
    field: "description" | "quantity" | "unitPrice" | "billing"
  ) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const packageOptions: { label: string; value: PackageTier }[] = [
  { label: "ONE", value: "ONE" },
  { label: "PRO", value: "PRO" },
  { label: "INFINITE", value: "INFINITE" },
];

const fieldClass =
  "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-blue-300/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15";

export const ProposalForm: React.FC<ProposalFormProps> = ({
  formState,
  onChange,
  onToggleOfficeFinance,
  onToggleStarter,
  onAddExtra,
  onRemoveExtra,
  onChangeExtra,
}) => {
  const isOffice = formState.erp === "OFFICE_ADV";
  const isCpj3c = formState.erp === "CPJ_3C_PLUS";

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Cliente */}
      <div>
        <h3 className="text-white font-black text-xl mb-4">Dados do Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Cliente</label>
            <input
              className={fieldClass}
              type="text"
              value={formState.clientName}
              onChange={onChange("clientName")}
              placeholder="Nome da empresa/cliente"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Responsável</label>
            <input
              className={fieldClass}
              type="text"
              value={formState.clientResponsible || ""}
              onChange={onChange("clientResponsible")}
              placeholder="Nome do responsável"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Telefone</label>
            <input
              className={fieldClass}
              type="tel"
              value={formState.clientPhone || ""}
              onChange={onChange("clientPhone")}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">E-mail</label>
            <input
              className={fieldClass}
              type="email"
              value={formState.clientEmail || ""}
              onChange={onChange("clientEmail")}
              placeholder="contato@empresa.com"
            />
          </div>
        </div>
      </div>

      {/* Investimento Inicial - Setup */}
      <div>
        <h3 className="text-white font-black text-xl mb-4">Investimento Inicial — Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">ERP</label>
            <input disabled className={`${fieldClass} opacity-60`} value={formState.erp} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Pacote</label>
            <select
              className={fieldClass}
              value={formState.packageTier}
              onChange={onChange("packageTier")}
            >
              {packageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Setup Inicial (R$)</label>
            <input
              className={fieldClass}
              type="number"
              value={formState.setupFee}
              onChange={onChange("setupFee")}
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Implementação & Migração */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 flex items-center gap-3">
            <input id="starter" type="checkbox" checked={!!formState.implementationStarter} onChange={onToggleStarter} className="w-5 h-5 rounded bg-white/10 border-white/20" />
            <label htmlFor="starter" className="text-blue-100">Incluir Plano Starter</label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Tipo de Migração</label>
            <select id="migType" className={fieldClass} value={formState.migrationType} onChange={onChange("migrationType")}>
              <option value="NONE">Sem Migração</option>
              <option value="PLANILHA_PADRAO">Planilha Padrão (cortesia)</option>
              <option value="OAB">Busca por OAB</option>
              <option value="PERSONALIZADA">Backup/Planilha Personalizada</option>
            </select>
          </div>
          {formState.migrationType === "OAB" && (
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Qtde. de Processos</label>
              <input className={fieldClass} type="number" value={formState.migrationProcesses || ''} onChange={onChange("migrationProcesses")} />
            </div>
          )}
        </div>

        {/* Treinamentos & Serviços Setup (Office ADV) */}
        {isOffice && (
          <div className="mt-4 space-y-3">
            <h4 className="text-blue-200 font-bold text-sm">Treinamentos e Serviços Setup</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <input id="trainReportBI" type="checkbox" checked={!!formState.trainingReportPowerBI} onChange={onChange("trainingReportPowerBI") as any} className="w-5 h-5 rounded bg-white/10 border-white/20" />
                <label htmlFor="trainReportBI" className="text-blue-100">Relatórios PowerBI</label>
              </div>
              <div className="flex items-center gap-3">
                <input id="trainDocGen" type="checkbox" checked={!!formState.trainingDocGenerator} onChange={onChange("trainingDocGenerator") as any} className="w-5 h-5 rounded bg-white/10 border-white/20" />
                <label htmlFor="trainDocGen" className="text-blue-100">Gerador de Documentos</label>
              </div>
              <div className="flex items-center gap-3">
                <input id="trainControlling" type="checkbox" checked={!!formState.trainingControlling} onChange={onChange("trainingControlling") as any} className="w-5 h-5 rounded bg-white/10 border-white/20" />
                <label htmlFor="trainControlling" className="text-blue-100">Controlling</label>
              </div>
              <div className="flex items-center gap-3">
                <input id="trainFinance" type="checkbox" checked={!!formState.trainingFinance} onChange={onChange("trainingFinance") as any} className="w-5 h-5 rounded bg-white/10 border-white/20" />
                <label htmlFor="trainFinance" className="text-blue-100">Financeiro</label>
              </div>
              <div className="flex items-center gap-3">
                <input id="boleto" type="checkbox" checked={!!formState.boletoBancario} onChange={onChange("boletoBancario") as any} className="w-5 h-5 rounded bg-white/10 border-white/20" />
                <label htmlFor="boleto" className="text-blue-100">Boleto Bancário</label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Horas de Consultoria</label>
                <input className={fieldClass} type="number" value={formState.officeConsultingHours || ''} onChange={onChange("officeConsultingHours")} />
              </div>
            </div>
          </div>
        )}

        {/* Consultoria CPJ-3C */}
        {isCpj3c && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Horas de Consultoria</label>
              <input className={fieldClass} type="number" value={formState.cpj3cConsultingHours || 0} onChange={onChange("cpj3cConsultingHours")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Horas Fluxo Completo</label>
              <input className={fieldClass} type="number" value={formState.cpj3cFlowHours || 0} onChange={onChange("cpj3cFlowHours")} />
            </div>
          </div>
        )}

        {/* Condições de Pagamento (Setup) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-blue-200 mb-2">Desconto Setup</label>
            <div className="flex gap-2">
              <select className={`${fieldClass} w-40`} value={formState.setupDiscountType} onChange={onChange("setupDiscountType")}>
                <option value="NONE">Nenhum</option>
                <option value="PERCENT">%</option>
                <option value="VALUE">R$</option>
              </select>
              <input className={fieldClass} type="number" value={formState.setupDiscountValue || 0} onChange={onChange("setupDiscountValue")} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Parcelas do Setup</label>
            <input className={fieldClass} type="number" min={1} value={formState.setupInstallments || 1} onChange={onChange("setupInstallments")} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Data do Setup</label>
            <input className={fieldClass} type="date" value={formState.firstPaymentDate || ""} onChange={onChange("firstPaymentDate")} />
          </div>
        </div>
      </div>

      {/* Investimento Mensal */}
      <div>
        <h3 className="text-white font-black text-xl mb-4">Investimento Mensal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-blue-200 mb-2">Desconto Mensal</label>
            <div className="flex gap-2">
              <select className={`${fieldClass} w-40`} value={formState.discountType} onChange={onChange("discountType")}>
                <option value="NONE">Nenhum</option>
                <option value="PERCENT">%</option>
                <option value="VALUE">R$</option>
              </select>
              <input className={fieldClass} type="number" value={formState.discountValue || 0} onChange={onChange("discountValue")} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">1ª Mensalidade</label>
            <input className={fieldClass} type="date" value={formState.firstMonthlyDate || ""} onChange={onChange("firstMonthlyDate")} />
          </div>
        </div>
        {isOffice && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Usuários</label>
              <input className={fieldClass} type="number" value={formState.officeUsers || 0} onChange={onChange("officeUsers")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Publicações (termos)</label>
              <input className={fieldClass} type="number" value={formState.officePublications || 0} onChange={onChange("officePublications")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Intimação (painéis)</label>
              <input className={fieldClass} type="number" value={formState.officeIntimation || 0} onChange={onChange("officeIntimation")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Monitoramento (processos)</label>
              <input className={fieldClass} type="number" value={formState.officeMonitoringCredits || 0} onChange={onChange("officeMonitoringCredits")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Distribuição - Termos</label>
              <input className={fieldClass} type="number" value={formState.officeDistributionTerms || 0} onChange={onChange("officeDistributionTerms")} placeholder="Termos" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Distribuição - Processos</label>
              <input className={fieldClass} type="number" value={formState.officeDistributionProcesses || 0} onChange={onChange("officeDistributionProcesses")} placeholder="Encontrados" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Protocolos/mês</label>
              <input className={fieldClass} type="number" value={formState.officeProtocols || 0} onChange={onChange("officeProtocols")} />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input id="finance" type="checkbox" checked={!!formState.officeFinanceModule} onChange={onToggleOfficeFinance} className="w-5 h-5 rounded bg-white/10 border-white/20" />
              <label htmlFor="finance" className="text-blue-100">Incluir módulo Financeiro Avançado</label>
            </div>
            <div className="flex items-center gap-3">
              <input id="api" type="checkbox" checked={!!formState.officeApiModule} onChange={onChange("officeApiModule") as any} className="w-5 h-5 rounded bg-white/10 border-white/20" />
              <label htmlFor="api" className="text-blue-100">Módulo API</label>
            </div>
          </div>
        )}

        {isCpj3c && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Usuários</label>
              <input className={fieldClass} type="number" value={formState.cpj3cUsers || 0} onChange={onChange("cpj3cUsers")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Publicações (termos)</label>
              <input className={fieldClass} type="number" value={formState.cpj3cPublications || 0} onChange={onChange("cpj3cPublications")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Intimação (termos)</label>
              <input className={fieldClass} type="number" value={formState.cpj3cIntimation || 0} onChange={onChange("cpj3cIntimation")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Monitoramento (processos)</label>
              <input className={fieldClass} type="number" value={formState.cpj3cMonitoringCredits || 0} onChange={onChange("cpj3cMonitoringCredits")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">NFe (CNPJs)</label>
              <input className={fieldClass} type="number" value={formState.cpj3cNfe || 0} onChange={onChange("cpj3cNfe")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Distribuição (processos)</label>
              <input className={fieldClass} type="number" value={formState.cpj3cDistributionProcesses || 0} onChange={onChange("cpj3cDistributionProcesses")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Protocolos (≥100)</label>
              <input className={fieldClass} type="number" value={formState.cpj3cProtocols || 0} onChange={onChange("cpj3cProtocols")} placeholder="Mínimo 100" />
            </div>
          </div>
        )}
      </div>

      {/* Funcionalidades / Serviços adicionais */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-black text-xl">Funcionalidades e Serviços Adicionais</h3>
          <button type="button" onClick={onAddExtra} className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15">+ Adicionar</button>
        </div>
        {(formState.extraServices || []).length === 0 ? (
          <p className="text-blue-200/70 text-sm">Nenhum extra adicionado</p>
        ) : (
          <div className="space-y-3">
            {formState.extraServices.map((svc) => (
              <div key={svc.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Descrição</label>
                  <input className={fieldClass} value={svc.description} onChange={onChangeExtra?.(svc.id, "description") as any} placeholder="Nome do serviço/funcionalidade" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Tipo</label>
                  <select className={fieldClass} value={svc.billing} onChange={onChangeExtra?.(svc.id, "billing") as any}>
                    <option value="MONTHLY">Mensal</option>
                    <option value="SETUP">Setup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Qtd</label>
                  <input className={fieldClass} type="number" value={svc.quantity} onChange={onChangeExtra?.(svc.id, "quantity") as any} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Valor Unit. (R$)</label>
                  <input className={fieldClass} type="number" value={svc.unitPrice} onChange={onChangeExtra?.(svc.id, "unitPrice") as any} />
                </div>
                <div className="md:col-span-6 flex justify-end">
                  <button type="button" onClick={() => onRemoveExtra?.(svc.id)} className="px-3 py-2 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 hover:bg-red-500/30">Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Observações */}
      <div>
        <h3 className="text-white font-black text-xl mb-2">Observações</h3>
        <textarea
          className={fieldClass}
          value={formState.observations || ""}
          onChange={onChange("observations")}
          rows={4}
          placeholder="Notas adicionais da proposta"
        />
      </div>
    </div>
  );
};

export default ProposalForm;
