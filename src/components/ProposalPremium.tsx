const RemovedComponent = () => null;
export default RemovedComponent;
/*
import React from "react";
import { ProposalFormState } from "../types";
import { formatCurrency } from "../utils/money";

interface ProposalPremiumProps {
  formState: ProposalFormState;
  consultantName?: string;
  consultantPhone?: string;
  consultantEmail?: string;
}

export function ProposalPremium({
  formState,
  consultantName = "Consultor",
  consultantPhone = "",
  consultantEmail = "",
}: ProposalPremiumProps) {
  const today = new Date();
  const issueDate = today.toLocaleDateString("pt-BR");
  const proposalNumber = `PROP-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const getErpDisplayName = (erp: string) => {
    switch (erp) {
      case "OFFICE_ADV":
        return "Office ADV";
      case "CPJ_3C_PLUS":
        return "CPJ-3C+";
      default:
        return erp;
    }
  };

  const getErpColor = (erp: string) => {
    switch (erp) {
      case "OFFICE_ADV":
        return { bg: "from-amber-50 to-orange-50", border: "border-amber-300", text: "text-amber-900", gradient: "from-amber-400 to-orange-400" };
      case "CPJ_3C_PLUS":
        return { bg: "from-emerald-50 to-teal-50", border: "border-emerald-300", text: "text-emerald-900", gradient: "from-emerald-400 to-teal-400" };
      default:
        return { bg: "from-blue-50 to-cyan-50", border: "border-blue-300", text: "text-blue-900", gradient: "from-blue-400 to-cyan-400" };
    }
  };

  const colors = getErpColor(formState.erp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8 print:p-0">
      <div id="quote" className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto print:shadow-none print:rounded-none print:max-w-none">
        {/* Premium Header */}
        <div className={`bg-gradient-to-r ${colors.gradient} p-12 text-white relative overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-sm font-bold opacity-90 mb-2">PREÂMBULO</div>
                <h1 className="text-4xl font-black mb-1">Proposta Comercial</h1>
                <p className="text-lg opacity-90">{getErpDisplayName(formState.erp)}</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold opacity-75 mb-2">NÚMERO</div>
                <p className="text-2xl font-black font-mono">{proposalNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/30">
              <div>
                <p className="text-xs opacity-75 mb-1">Emissão</p>
                <p className="text-lg font-bold">{issueDate}</p>
              </div>
              <div>
                <p className="text-xs opacity-75 mb-1">Plano</p>
                <p className="text-lg font-bold">{formState.packageTier}</p>
              </div>
              <div>
                <p className="text-xs opacity-75 mb-1">CNPJ</p>
                <p className="text-lg font-bold">81.053.092/0001-70</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-12">
          {/* Company Info */}
          <div className="mb-12 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Consultor</p>
              <p className="text-lg font-bold text-slate-900">{consultantName}</p>
              {consultantPhone && <p className="text-sm text-slate-600">{consultantPhone}</p>}
              {consultantEmail && <p className="text-sm text-slate-600">{consultantEmail}</p>}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Preâmbulo Informática</p>
              <p className="text-lg font-bold text-slate-900">Soluções em Gestão Jurídica</p>
              <p className="text-sm text-slate-600">CNPJ: 81.053.092/0001-70</p>
              <p className="text-sm text-slate-600">www.preambulotech.com.br</p>
            </div>
          </div>

          <hr className="border-slate-200 mb-8" />

          {/* Client Info */}
          <div className="mb-12">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cliente</p>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
              <p className="text-lg font-bold text-slate-900 mb-3">{formState.clientName}</p>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-slate-600">Responsável</p>
                  <p className="font-semibold text-slate-900">{formState.clientResponsible || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-600">Telefone</p>
                  <p className="font-semibold text-slate-900">{formState.clientPhone || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{formState.clientEmail || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 mb-8" />

          {/* Service Summary */}
          <div className="mb-12">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resumo da Proposta</p>
            <div className={`bg-gradient-to-br ${colors.bg} rounded-lg p-6 border ${colors.border}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Solução: </span>
                  <span className={`text-lg font-bold ${colors.text}`}>{getErpDisplayName(formState.erp)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Plano: </span>
                  <span className={`text-lg font-bold ${colors.text}`}>{formState.packageTier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Período: </span>
                  <span className="text-slate-700">A combinar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="mb-12">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Investimento</p>
            <div className="space-y-3">
              {formState.setupFee ? (
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-700">Investimento Inicial (Setup)</span>
                  <span className="text-lg font-bold text-emerald-600">{formatCurrency(formState.setupFee)}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-700">Mensalidade</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(formState.monthlyFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">TOTAL MENSAL</span>
                <span className="text-2xl font-black text-emerald-600">{formatCurrency(formState.monthlyFee)}</span>
              </div>
            </div>
          </div>

          {/* Observations */}
          {formState.observations && (
            <div className="mb-12">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Observações</p>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap">{formState.observations}</p>
              </div>
            </div>
          )}

          <hr className="border-slate-200 mb-12" />

          {/* Footer with signatures */}
          <div className="grid grid-cols-2 gap-16 pt-8">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-12">Consultor</p>
              <div className="border-t-2 border-slate-400 pt-2">
                <p className="text-sm text-slate-700">{consultantName}</p>
                <p className="text-xs text-slate-500">Assinatura</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-12">Cliente</p>
              <div className="border-t-2 border-slate-400 pt-2">
                <p className="text-sm text-slate-700">{formState.clientName}</p>
                <p className="text-xs text-slate-500">Assinatura</p>
              </div>
            </div>
          </div>

          {/* Bottom watermark */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
            <p>Documento eletrônico • Preâmbulo Informática • {issueDate}</p>
            <p className="mt-2 print:hidden">Gerado em {new Date().toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
*/
