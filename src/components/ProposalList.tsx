import React, { useState } from "react";
import { formatCurrency } from "../utils/money";
import { suggestTierByUsersFor } from "../utils/pricingPlans";

export interface ProposalItem {
  id: string;
  createdAt: string;
  clientName: string;
  erp: string;
  monthlyFinal?: number;
  setupFinal?: number;
  status?: "draft" | "sent" | "accepted" | "rejected";
  formState?: any; // Contém officeUsers e cpj3cUsers
}

interface ProposalListProps {
  proposals: ProposalItem[];
  onReopen?: (proposal: any) => void;
  onDelete?: (id: string) => void;
  onViewPdf?: (id: string) => void;
}

export function ProposalList({ proposals, onReopen, onDelete, onViewPdf }: ProposalListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterErp, setFilterErp] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "value">("date");

  const filteredProposals = proposals
    .filter(
      (p) =>
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!filterErp || p.erp === filterErp)
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return (b.monthlyFinal || 0) - (a.monthlyFinal || 0);
      }
    });

  const getErpName = (erp: string) => {
    switch (erp) {
      case "OFFICE_ADV":
        return "Office ADV";
      case "CPJ_3C_PLUS":
        return "CPJ-3C+";
      case "CPJ_COBRANCA":
        return "CPJ-Cobrança";
      default:
        return "Promad";
    }
  };

  const getErpColor = (erp: string) => {
    switch (erp) {
      case "OFFICE_ADV":
        return "from-blue-500/20 to-cyan-500/20";
      case "CPJ_3C_PLUS":
        return "from-purple-500/20 to-pink-500/20";
      case "CPJ_COBRANCA":
        return "from-emerald-500/20 to-teal-500/20";
      default:
        return "from-slate-500/20 to-gray-500/20";
    }
  };

  const getErpBorder = (erp: string) => {
    switch (erp) {
      case "OFFICE_ADV":
        return "border-blue-400/30";
      case "CPJ_3C_PLUS":
        return "border-purple-400/30";
      case "CPJ_COBRANCA":
        return "border-emerald-400/30";
      default:
        return "border-slate-400/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">🔍</span>
            Filtros & Busca
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition-all backdrop-blur-sm"
              />
              <svg className="absolute right-3 top-3.5 w-5 h-5 text-blue-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* ERP Filter */}
            <select
              value={filterErp || ""}
              onChange={(e) => setFilterErp(e.target.value || null)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition-all backdrop-blur-sm"
            >
              <option value="" className="bg-slate-900">Todos os ERPs</option>
              <option value="OFFICE_ADV" className="bg-slate-900">Office ADV</option>
              <option value="CPJ_3C_PLUS" className="bg-slate-900">CPJ-3C+</option>
              <option value="CPJ_COBRANCA" className="bg-slate-900">CPJ Cobrança</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "value")}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400/60 focus:bg-white/15 transition-all backdrop-blur-sm"
            >
              <option value="date" className="bg-slate-900">Mais Recentes</option>
              <option value="value" className="bg-slate-900">Maior Valor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-blue-300/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-white text-lg mb-2 font-bold">Nenhuma proposta encontrada</p>
          <p className="text-blue-300/60 text-sm">Ajuste os filtros ou crie uma nova proposta</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-start justify-between gap-6">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-4 py-1.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${getErpColor(proposal.erp)} border ${getErpBorder(proposal.erp)}`}>
                      {getErpName(proposal.erp)}
                    </div>
                    {(proposal.erp === "OFFICE_ADV" || proposal.erp === "CPJ_3C_PLUS") && (() => {
                      const users = proposal.erp === "OFFICE_ADV" 
                        ? (proposal.formState?.officeUsers || 0) 
                        : (proposal.formState?.cpj3cUsers || 0);
                      const tier = suggestTierByUsersFor(proposal.erp, users);
                      return (
                        <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 text-xs rounded-lg border border-green-400/30 font-bold backdrop-blur-sm">
                          📦 {tier}
                        </div>
                      );
                    })()}
                  </div>
                  <h4 className="text-xl font-black text-white truncate mb-2">{proposal.clientName}</h4>
                  <p className="text-blue-300/60 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Criada em {new Date(proposal.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Middle: Values */}
                <div className="text-right">
                  {proposal.setupFinal ? (
                    <div className="mb-3">
                      <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-1">Setup Inicial</p>
                      <p className="text-lg font-bold text-emerald-400">{formatCurrency(proposal.setupFinal)}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-1">Investimento Mensal</p>
                    <p className="text-2xl font-black text-cyan-400">{formatCurrency(proposal.monthlyFinal || 0)}</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewPdf?.(proposal.id)}
                    title="Ver PDF"
                    className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 hover:border-emerald-400/50 rounded-xl transition-all duration-300 text-emerald-300 hover:text-emerald-200 group-hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onReopen?.(proposal)}
                    title="Editar Proposta"
                    className="p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50 rounded-xl transition-all duration-300 text-blue-300 hover:text-blue-200 group-hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete?.(proposal.id)}
                    title="Deletar Proposta"
                    className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded-xl transition-all duration-300 text-red-300 hover:text-red-200 group-hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
