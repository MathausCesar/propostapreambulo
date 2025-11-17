/**
 * Utilitário para calcular pagamentos por período
 * Distingue entre investimento inicial, mensalidade e primeiro mês
 */

export interface PaymentSchedule {
  setupAmount: number;
  setupDate: string | null;
  monthlyAmount: number;
  monthlyStartDate: string | null;
  firstMonthAmount: number;
  firstMonthIncludesSetup: boolean;
  hasSetup: boolean;
  hasMonthly: boolean;
  samePeriod: boolean;
}

/**
 * Calcula o cronograma de pagamento baseado nas datas
 */
export function calculatePaymentSchedule(
  setupPrice: number,
  monthlyPrice: number,
  setupDate: string | null,
  monthlyDate: string | null,
  discountType: "NONE" | "PERCENT" | "VALUE",
  discountValue: number
): PaymentSchedule {
  // Aplicar desconto se houver
  const applyDiscount = (value: number) => {
    if (discountType === "NONE") return value;
    if (discountType === "PERCENT") {
      return Math.max(0, value - value * (discountValue / 100));
    }
    if (discountType === "VALUE") {
      return Math.max(0, value - discountValue);
    }
    return value;
  };

  const finalSetup = applyDiscount(setupPrice);
  const finalMonthly = applyDiscount(monthlyPrice);

  // Converter datas
  const setupDateObj = setupDate ? new Date(setupDate) : null;
  const monthlyDateObj = monthlyDate ? new Date(monthlyDate) : null;

  const hasSetup = setupPrice > 0;
  const hasMonthly = monthlyPrice > 0;

  // Verificar se são no mesmo período (mesmo mês e ano)
  let samePeriod = false;
  if (
    hasSetup &&
    hasMonthly &&
    setupDateObj &&
    monthlyDateObj
  ) {
    samePeriod =
      setupDateObj.getFullYear() === monthlyDateObj.getFullYear() &&
      setupDateObj.getMonth() === monthlyDateObj.getMonth();
  }

  // Calcular primeiro mês
  let firstMonthAmount = 0;
  let firstMonthIncludesSetup = false;

  if (samePeriod) {
    // Se ambos no mesmo mês, somar na primeira fatura
    firstMonthAmount = finalSetup + finalMonthly;
    firstMonthIncludesSetup = true;
  } else if (hasMonthly && monthlyDateObj) {
    // Se só tem mensalidade ou são períodos diferentes
    firstMonthAmount = finalMonthly;
    firstMonthIncludesSetup = false;
  } else if (hasSetup && setupDateObj) {
    // Se só tem setup
    firstMonthAmount = finalSetup;
    firstMonthIncludesSetup = true;
  }

  return {
    setupAmount: finalSetup,
    setupDate: setupDate,
    monthlyAmount: finalMonthly,
    monthlyStartDate: monthlyDate,
    firstMonthAmount,
    firstMonthIncludesSetup,
    hasSetup,
    hasMonthly,
    samePeriod,
  };
}

/**
 * Formata o resumo de pagamento para exibição
 */
export function formatPaymentSummary(schedule: PaymentSchedule): string[] {
  const lines: string[] = [];

  if (schedule.samePeriod && schedule.hasSetup && schedule.hasMonthly) {
    // Mesmo período
    const date = schedule.setupDate
      ? new Date(schedule.setupDate).toLocaleDateString("pt-BR")
      : "—";
    lines.push(
      `• Investimento Inicial (${date}): R$ ${schedule.setupAmount.toFixed(2)}`
    );
    lines.push(
      `• Mensalidade (${date}): R$ ${schedule.monthlyAmount.toFixed(2)}`
    );
    lines.push(
      `• Total do 1º período: R$ ${schedule.firstMonthAmount.toFixed(2)}`
    );
  } else {
    // Períodos diferentes ou um dos dois
    if (schedule.hasSetup && schedule.setupDate) {
      const date = new Date(schedule.setupDate).toLocaleDateString("pt-BR");
      lines.push(
        `• Investimento Inicial (${date}): R$ ${schedule.setupAmount.toFixed(2)}`
      );
    }
    if (schedule.hasMonthly && schedule.monthlyStartDate) {
      const date = new Date(schedule.monthlyStartDate).toLocaleDateString(
        "pt-BR"
      );
      lines.push(
        `• Mensalidade a partir de (${date}): R$ ${schedule.monthlyAmount.toFixed(2)}`
      );
    }
  }

  return lines;
}
