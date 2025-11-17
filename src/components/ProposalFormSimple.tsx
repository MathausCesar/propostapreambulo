import React, { ChangeEvent } from "react";
import { ProposalFormState, ErpProduct } from "../types";

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

const fieldClass =
  "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-blue-300/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15";

export const ProposalFormSimple: React.FC<ProposalFormProps> = ({
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
      {/* PRIMEIRO BLOCO - Dados do Cliente */}
      <div>
        <h3 className="text-white font-black text-xl mb-4">Dados do Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Empresa</label>
            <input
              className={fieldClass}
              type="text"
              value={formState.clientName}
              onChange={onChange("clientName")}
              placeholder="Nome da empresa"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Pessoa de Contato</label>
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

      {/* SEGUNDO BLOCO - Investimento Mensal */}
      <div>
        <h3 className="text-white font-black text-xl mb-4">Investimento Mensal</h3>
        
        {isOffice && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Usuários</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.officeUsers || ''}
                  onChange={onChange("officeUsers")}
                  placeholder="Qtd de usuários"
                />
                <div className="text-xs text-blue-300 mt-1">R$ 80,00 por usuário</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Publicações (termos)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.officePublications || ''}
                  onChange={onChange("officePublications")}
                />
                <div className="text-xs text-blue-300 mt-1">R$ 30,00 por termo</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Intimação Eletrônica (painéis)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.officeIntimation || ''}
                  onChange={onChange("officeIntimation")}
                />
                <div className="text-xs text-blue-300 mt-1">R$ 60,00 por painel</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Monitoramento (créditos mensais)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.officeMonitoringCredits || ''}
                  onChange={onChange("officeMonitoringCredits")}
                  placeholder="Créditos/mês"
                />
                <div className="text-xs text-blue-300 mt-1">Pacote calculado automaticamente</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-blue-200 mb-2">Distribuição (processos mensais)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.officeDistributionProcesses || ''}
                  onChange={onChange("officeDistributionProcesses")}
                  placeholder="Processos/mês"
                />
                <div className="text-xs text-blue-300 mt-1">Pacote calculado automaticamente</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Protocolos (mensais)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.officeProtocols || ''}
                  onChange={onChange("officeProtocols")}
                  placeholder="Protocolos/mês"
                />
                <div className="text-xs text-blue-300 mt-1">Pacote calculado automaticamente</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-blue-200 mb-2">Documentos IA (mensais)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.officeAiDocs || ''}
                  onChange={onChange("officeAiDocs")}
                  placeholder="Docs/mês"
                />
                <div className="text-xs text-blue-300 mt-1">Pacote calculado automaticamente</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="finance"
                type="checkbox"
                checked={!!formState.officeFinanceModule}
                onChange={onToggleOfficeFinance}
                className="w-5 h-5 rounded bg-white/10 border-white/20"
              />
              <label htmlFor="finance" className="text-blue-100">Financeiro Avançado - R$ 299,00/mês</label>
            </div>
          </div>
        )}

        {isCpj3c && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Usuários</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.cpj3cUsers || ''}
                  onChange={onChange("cpj3cUsers")}
                />
                <div className="text-xs text-blue-300 mt-1">R$ 106,00 por usuário</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Publicações (termos)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.cpj3cPublications || ''}
                  onChange={onChange("cpj3cPublications")}
                />
                <div className="text-xs text-blue-300 mt-1">R$ 80,00 por termo</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Monitoramento (créditos mensais)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.cpj3cMonitoringCredits || ''}
                  onChange={onChange("cpj3cMonitoringCredits")}
                />
                <div className="text-xs text-blue-300 mt-1">Pacote calculado automaticamente</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Distribuição (processos mensais)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.cpj3cDistributionProcesses || ''}
                  onChange={onChange("cpj3cDistributionProcesses")}
                />
                <div className="text-xs text-blue-300 mt-1">Pacote calculado automaticamente</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Protocolos (mensais)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.cpj3cProtocols || ''}
                  onChange={onChange("cpj3cProtocols")}
                />
                <div className="text-xs text-blue-300 mt-1">Pacote calculado automaticamente</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Documentos IA (mensais)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.cpj3cAiDocs || ''}
                  onChange={onChange("cpj3cAiDocs")}
                />
                <div className="text-xs text-blue-300 mt-1">Pacote calculado automaticamente</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Consultoria Mensal (horas)</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.cpj3cConsultingHours || ''}
                  onChange={onChange("cpj3cConsultingHours")}
                />
                <div className="text-xs text-blue-300 mt-1">R$ 225,00 por hora</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TERCEIRO BLOCO - Investimento Inicial - Setup */}
      <div>
        <h3 className="text-white font-black text-xl mb-4">Investimento Inicial — Setup</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Taxa de Setup (R$)</label>
              <input
                className={fieldClass}
                type="number"
                value={formState.setupFee || ''}
                onChange={onChange("setupFee")}
                placeholder="0,00"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                id="starter"
                type="checkbox"
                checked={!!formState.implementationStarter}
                onChange={onToggleStarter}
                className="w-5 h-5 rounded bg-white/10 border-white/20"
              />
              <label htmlFor="starter" className="text-blue-100">Plano Starter - R$ 899,00</label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Tipo de Migração</label>
              <select
                className={fieldClass}
                value={formState.migrationType}
                onChange={onChange("migrationType")}
              >
                <option value="NONE">Sem Migração</option>
                <option value="PLANILHA_PADRAO">Planilha Padrão (Cortesia)</option>
                <option value="DISCOVERY">Discovery</option>
                <option value="PLANILHA_PERSONALIZADA">Planilha Personalizada</option>
                <option value="BACKUP_SISTEMA">Backup de Sistema</option>
              </select>
            </div>
            {formState.migrationType === "DISCOVERY" && (
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Quantidade de Processos</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.migrationProcesses || ''}
                  onChange={onChange("migrationProcesses")}
                />
                <div className="text-xs text-blue-300 mt-1">Cortesia até 2000, depois R$ 0,25/processo</div>
              </div>
            )}
            {(formState.migrationType === "PLANILHA_PERSONALIZADA" || formState.migrationType === "BACKUP_SISTEMA") && (
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Horas de Serviço</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.migrationHours || ''}
                  onChange={onChange("migrationHours")}
                />
                <div className="text-xs text-blue-300 mt-1">R$ 225,00 por hora</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUARTO BLOCO - Condições de Pagamento */}
      <div>
        <h3 className="text-white font-black text-xl mb-4">Condições de Pagamento</h3>
        
        {/* Investimento Inicial */}
        <div className="mb-4">
          <h4 className="text-blue-200 font-bold text-sm mb-3">Investimento Inicial</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Data de Pagamento</label>
              <input
                className={fieldClass}
                type="date"
                value={formState.firstPaymentDate || ""}
                onChange={onChange("firstPaymentDate")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Parcelas do Setup</label>
              <input
                className={fieldClass}
                type="number"
                min={1}
                value={formState.setupInstallments || 1}
                onChange={onChange("setupInstallments")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Desconto Inicial</label>
              <div className="flex gap-2">
                <select
                  className={`${fieldClass} w-32`}
                  value={formState.setupDiscountType}
                  onChange={onChange("setupDiscountType")}
                >
                  <option value="NONE">Nenhum</option>
                  <option value="PERCENT">%</option>
                  <option value="VALUE">R$</option>
                </select>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.setupDiscountValue || ''}
                  onChange={onChange("setupDiscountValue")}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mensalidade */}
        <div>
          <h4 className="text-blue-200 font-bold text-sm mb-3">Mensalidade</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Início da Cobrança</label>
              <input
                className={fieldClass}
                type="date"
                value={formState.firstMonthlyDate || ""}
                onChange={onChange("firstMonthlyDate")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-2">Desconto</label>
              <div className="flex gap-2">
                <select
                  className={`${fieldClass} w-32`}
                  value={formState.discountType}
                  onChange={onChange("discountType")}
                >
                  <option value="NONE">Nenhum</option>
                  <option value="PERCENT">%</option>
                  <option value="VALUE">R$</option>
                </select>
                <input
                  className={fieldClass}
                  type="number"
                  value={formState.discountValue || ''}
                  onChange={onChange("discountValue")}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUINTO BLOCO - Funcionalidades e Serviços Adicionais */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-black text-xl">Funcionalidades e Serviços Adicionais</h3>
          <button
            type="button"
            onClick={onAddExtra}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15"
          >
            + Adicionar
          </button>
        </div>
        {(formState.extraServices || []).length === 0 ? (
          <p className="text-blue-200/70 text-sm">Nenhum extra adicionado</p>
        ) : (
          <div className="space-y-3">
            {formState.extraServices.map((svc) => (
              <div key={svc.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Descrição</label>
                  <input
                    className={fieldClass}
                    value={svc.description}
                    onChange={onChangeExtra?.(svc.id, "description") as any}
                    placeholder="Nome do serviço"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Tipo</label>
                  <select
                    className={fieldClass}
                    value={svc.billing}
                    onChange={onChangeExtra?.(svc.id, "billing") as any}
                  >
                    <option value="MONTHLY">Mensalidade</option>
                    <option value="SETUP">Setup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Valor (R$)</label>
                  <input
                    className={fieldClass}
                    type="number"
                    value={svc.unitPrice}
                    onChange={onChangeExtra?.(svc.id, "unitPrice") as any}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onRemoveExtra?.(svc.id)}
                    className="w-full px-3 py-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 hover:bg-red-500/30"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEXTO BLOCO - Validade da Proposta */}
      <div>
        <h3 className="text-white font-black text-xl mb-4">Validade da Proposta</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-2">Válida por (dias)</label>
            <input
              className={fieldClass}
              type="number"
              min={1}
              max={365}
              value={formState.proposalValidityDays || 30}
              onChange={onChange("proposalValidityDays")}
              placeholder="30"
            />
          </div>
        </div>
      </div>

      {/* SÉTIMO BLOCO - Observações */}
      <div>
        <h3 className="text-white font-black text-xl mb-2">Observações</h3>
        <textarea
          className={fieldClass}
          value={formState.observations || ""}
          onChange={onChange("observations")}
          rows={4}
          placeholder="Observações adicionais da proposta"
        />
      </div>
    </div>
  );
};
