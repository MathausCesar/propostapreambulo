import React from "react";
import { ProposalFormState } from "../types";
import { formatCurrency } from "../utils/money";

interface Props {
  formState: ProposalFormState;
}

const ProposalPreviewClean: React.FC<Props> = ({ formState }) => {
  const { clientName, monthlyFee = 0, observations } = formState;
  const today = new Date();

  return (
    <aside id="proposal-preview" className="h-full overflow-y-auto bg-slate-100 text-slate-900 print:bg-white">
      <div id="quote" className="bg-white text-slate-900 mx-auto my-4 w-[210mm] max-w-full rounded shadow print:shadow-none print:rounded-none print:m-0 p-6">
        <header className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-bold">Preâmbulo Tech</h1>
            <div className="text-xs text-slate-600">Soluções em Gestão Jurídica</div>
          </div>
          <div className="text-right text-sm">
            <div>Proposta</div>
            <div className="font-semibold">{today.toLocaleDateString("pt-BR")}</div>
          </div>
        </header>

        <section className="mb-4">
          <h2 className="text-sm font-semibold mb-2">Proposta para</h2>
          <div className="text-sm">{clientName || "Não informado"}</div>
        </section>

        <section className="mb-4">
          <h2 className="text-sm font-semibold mb-2">Resumo</h2>
          <div className="flex justify-between text-sm">
            <span>Mensalidade</span>
            <strong>{formatCurrency(monthlyFee)}</strong>
          </div>
        </section>

        {observations && (
          <section className="mb-4 text-sm">
            <h3 className="font-semibold">Observações</h3>
            <div className="whitespace-pre-line">{observations}</div>
          </section>
        )}

        <footer className="text-xs text-slate-600 mt-8">Validade da proposta: 30 dias</footer>
      </div>
    </aside>
  );
};

export default ProposalPreviewClean;
