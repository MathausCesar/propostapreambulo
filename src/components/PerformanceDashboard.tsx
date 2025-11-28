import React, { useState, useMemo } from "react";

interface SavedProposal {
  id: string;
  createdAt: string;
  updatedAt: string;
  erp: string;
  clientName: string;
  monthlyFinal?: number;
  setupFinal?: number;
  formState: any;
}

interface PerformanceDashboardProps {
  proposals: SavedProposal[];
  onBack: () => void;
}

type PeriodFilter = "today" | "week" | "month" | "custom";

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ proposals, onBack }) => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Filtrar propostas por período
  const filteredProposals = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return proposals.filter(proposal => {
      const createdDate = new Date(proposal.createdAt);
      
      switch (periodFilter) {
        case "today":
          return createdDate >= today;
        
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate >= weekAgo;
        
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return createdDate >= monthAgo;
        
        case "custom":
          if (!customStartDate && !customEndDate) return true;
          const start = customStartDate ? new Date(customStartDate) : new Date(0);
          const end = customEndDate ? new Date(customEndDate + "T23:59:59") : new Date();
          return createdDate >= start && createdDate <= end;
        
        default:
          return true;
      }
    });
  }, [proposals, periodFilter, customStartDate, customEndDate]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalProposals = filteredProposals.length;
    
    const monthlyTotal = filteredProposals.reduce((sum, p) => sum + (p.monthlyFinal || 0), 0);
    const annualTotal = monthlyTotal * 12;
    const averageMonthly = totalProposals > 0 ? monthlyTotal / totalProposals : 0;
    const setupTotal = filteredProposals.reduce((sum, p) => sum + (p.setupFinal || 0), 0);
    
    return {
      totalProposals,
      monthlyTotal,
      annualTotal,
      averageMonthly,
      setupTotal,
    };
  }, [filteredProposals]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatPeriodLabel = () => {
    switch (periodFilter) {
      case "today":
        return "Hoje";
      case "week":
        return "Últimos 7 dias";
      case "month":
        return "Último mês";
      case "custom":
        if (customStartDate && customEndDate) {
          return `${new Date(customStartDate).toLocaleDateString("pt-BR")} - ${new Date(customEndDate).toLocaleDateString("pt-BR")}`;
        }
        return "Período customizado";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">📊 Performance</h1>
            <p className="text-blue-200">Análise de indicadores e métricas</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15 transition-all backdrop-blur-sm"
          >
            ← Voltar
          </button>
        </div>

        {/* Filtros de Período */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">🔍 Filtrar por Período</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <button
              onClick={() => setPeriodFilter("today")}
              className={`px-4 py-3 rounded-xl border-2 transition-all ${
                periodFilter === "today"
                  ? "bg-blue-600/30 border-blue-400 text-white"
                  : "bg-white/5 border-white/20 text-blue-200 hover:bg-white/10"
              }`}
            >
              📅 Hoje
            </button>
            <button
              onClick={() => setPeriodFilter("week")}
              className={`px-4 py-3 rounded-xl border-2 transition-all ${
                periodFilter === "week"
                  ? "bg-blue-600/30 border-blue-400 text-white"
                  : "bg-white/5 border-white/20 text-blue-200 hover:bg-white/10"
              }`}
            >
              📆 Semana
            </button>
            <button
              onClick={() => setPeriodFilter("month")}
              className={`px-4 py-3 rounded-xl border-2 transition-all ${
                periodFilter === "month"
                  ? "bg-blue-600/30 border-blue-400 text-white"
                  : "bg-white/5 border-white/20 text-blue-200 hover:bg-white/10"
              }`}
            >
              🗓️ Mês
            </button>
            <button
              onClick={() => setPeriodFilter("custom")}
              className={`px-4 py-3 rounded-xl border-2 transition-all ${
                periodFilter === "custom"
                  ? "bg-blue-600/30 border-blue-400 text-white"
                  : "bg-white/5 border-white/20 text-blue-200 hover:bg-white/10"
              }`}
            >
              🎯 Customizado
            </button>
          </div>

          {periodFilter === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Data Inicial</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-blue-300/50 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Data Final</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-blue-300/50 backdrop-blur-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-4 text-blue-200 text-sm">
            📌 Período selecionado: <strong className="text-white">{formatPeriodLabel()}</strong>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total de Propostas */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <span className="text-3xl">📝</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-purple-200 uppercase tracking-wide">Total</div>
                <div className="text-xs text-purple-300">Propostas</div>
              </div>
            </div>
            <div className="text-4xl font-black text-white mb-1">{metrics.totalProposals}</div>
            <div className="text-xs text-purple-200">propostas geradas</div>
          </div>

          {/* Valor Mensal Total */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 backdrop-blur-xl border border-green-400/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <span className="text-3xl">💰</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-200 uppercase tracking-wide">Valor</div>
                <div className="text-xs text-green-300">Mensal Total</div>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">{formatCurrency(metrics.monthlyTotal)}</div>
            <div className="text-xs text-green-200">receita mensal recorrente</div>
          </div>

          {/* Valor Anual Total */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <span className="text-3xl">📈</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-200 uppercase tracking-wide">Valor</div>
                <div className="text-xs text-blue-300">Anual Total</div>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">{formatCurrency(metrics.annualTotal)}</div>
            <div className="text-xs text-blue-200">receita anual projetada</div>
          </div>

          {/* Média de Mensalidade */}
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 backdrop-blur-xl border border-orange-400/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <span className="text-3xl">📊</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-orange-200 uppercase tracking-wide">Média</div>
                <div className="text-xs text-orange-300">Mensalidade</div>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">{formatCurrency(metrics.averageMonthly)}</div>
            <div className="text-xs text-orange-200">ticket médio mensal</div>
          </div>
        </div>

        {/* Card Adicional: Setup Total */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">💼 Valores de Implementação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 backdrop-blur-xl border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-yellow-500/20 p-3 rounded-xl">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <div className="text-xs text-yellow-200 uppercase tracking-wide">Setup Total</div>
                  <div className="text-2xl font-black text-white">{formatCurrency(metrics.setupTotal)}</div>
                </div>
              </div>
              <div className="text-xs text-yellow-200">valor total de implementações</div>
            </div>

            <div className="bg-gradient-to-br from-teal-600/20 to-teal-900/20 backdrop-blur-xl border border-teal-400/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-teal-500/20 p-3 rounded-xl">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <div className="text-xs text-teal-200 uppercase tracking-wide">Valor Total</div>
                  <div className="text-2xl font-black text-white">{formatCurrency(metrics.setupTotal + metrics.monthlyTotal)}</div>
                </div>
              </div>
              <div className="text-xs text-teal-200">setup + mensalidade no período</div>
            </div>
          </div>
        </div>

        {/* Lista de Propostas do Período */}
        {filteredProposals.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-6">
            <h2 className="text-white font-bold text-lg mb-4">📋 Propostas do Período ({filteredProposals.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold">{proposal.clientName}</div>
                      <div className="text-xs text-blue-300 mt-1">
                        {new Date(proposal.createdAt).toLocaleDateString("pt-BR")} às {new Date(proposal.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">{formatCurrency(proposal.monthlyFinal || 0)}/mês</div>
                      <div className="text-xs text-blue-300">Setup: {formatCurrency(proposal.setupFinal || 0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredProposals.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center mt-6">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-white font-bold text-xl mb-2">Nenhuma proposta encontrada</div>
            <div className="text-blue-300">Tente ajustar o filtro de período ou crie novas propostas.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
