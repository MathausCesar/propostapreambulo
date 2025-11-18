import React, {
  useState,
  useEffect,
  useMemo,
  ChangeEvent,
  FormEvent,
} from "react";
import {
  ProposalFormState,
  ErpProduct,
  ExtraService,
} from "./types";

// Usar caminhos diretos para Electron
const officeImg = '/office.png';
const threeCPlusImg = '/3cplus.png';
const cobrancaImg = '/cobranca.png';

import { ProposalFormSimple } from "./components/ProposalFormSimple";
import ProposalPreviewEnterprise from "./components/ProposalPreviewEnterprise";
import { PremiumLayout, PremiumButton, StatCard, Badge } from "./components/PremiumLayout";
import { ProposalList, ProposalItem } from "./components/ProposalList";
import { formatCurrency } from "./utils/money";
import * as pricingRules from "./utils/pricingRules";
import {
  getPlanPrice,
  getPlanInclusions,
  calculateOfficeExceedances,
  calculateCpj3cExceedances,
  suggestTierByUsersFor,
  OFFICE_ADV_PLANS,
  CPJ3C_PLANS,
} from "./utils/pricingPlans";
import IntroScreen from "./components/IntroScreen";

// Navigation state machine types
type AppStep = "intro" | "setupConsultant" | "chooseErp" | "proposal" | "history";

interface ConsultantProfile {
  name: string;
  phone: string;
  email: string;
}

interface SavedProposal {
  id: string;
  createdAt: string;
  updatedAt: string;
  erp: ErpProduct | string;
  clientName: string;
  consultant: ConsultantProfile;
  monthlyFinal?: number;
  setupFinal?: number;
  formState: ProposalFormState;
}

const emptyForm: ProposalFormState = {
  clientName: "",
  clientResponsible: "",
  clientPhone: "",
  clientEmail: "",
  erp: "OFFICE_ADV",
  setupFee: 0,
  monthlyFee: 0,
  discountType: "NONE",
  discountValue: 0,
  firstPaymentDate: "",
  firstMonthlyDate: "",
  proposalValidityDays: 30,
  proposalValidityDate: "",
  paymentConditions: "",
  observations: "",
  extraServices: [],

  officeUsers: 0,
  officePublications: 0,
  officeIntimation: 0,
  officeMonitoringCredits: 0,
  officeAiDocs: 0,
  officeDistributionTerms: 0,
  officeDistributionProcesses: 0,
  officeProtocols: 0,
  officeFinanceModule: false,
  officeApiModule: false,
  trainingReportPowerBI: false,
  trainingDocGenerator: false,
  trainingControlling: false,
  trainingFinance: false,
  boletoBancario: false,
  officeConsultingHours: 0,

  cpj3cUsers: 0,
  cpj3cPublications: 0,
  cpj3cIntimation: 0,
  cpj3cMonitoringCredits: 0,
  cpj3cAiDocs: 0,
  cpj3cNfe: 0,
  cpj3cDistributionProcesses: 0,
  cpj3cProtocols: 0,
  cpj3cConsultingHours: 0,
  cpj3cFlowHours: 0,

  implementationStarter: false,
  migrationType: "NONE",
  migrationProcesses: 0,
  migrationHours: 0,

  setupDiscountType: "NONE",
  setupDiscountValue: 0,
  setupInstallments: 1,
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>("intro");
  const [consultantProfile, setConsultantProfile] = useState<ConsultantProfile | null>(null);
  const [formState, setFormState] = useState<ProposalFormState>(emptyForm);
  const [history, setHistory] = useState<SavedProposal[]>([]);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("consultantProfile");
      if (raw) {
        const parsed = JSON.parse(raw) as ConsultantProfile;
        if (parsed && parsed.name) setConsultantProfile(parsed);
      }
    } catch (e) {
      console.error("Erro ao carregar perfil", e);
    }
  }, []);

  useEffect(() => {
    try {
      const rawHistory = localStorage.getItem("proposalsHistory");
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory) as SavedProposal[];
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch (e) {
      console.error("Erro ao carregar histórico", e);
    }
  }, []);

  const [consultantNameInput, setConsultantNameInput] = useState("");
  const [consultantPhoneInput, setConsultantPhoneInput] = useState("");
  const [consultantEmailInput, setConsultantEmailInput] = useState("");
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);

  const handleSidebarToggle = () => {
    setShowNavigationMenu(!showNavigationMenu);
  };

  useEffect(() => {
    if (consultantProfile) {
      setConsultantNameInput(consultantProfile.name);
      setConsultantPhoneInput(consultantProfile.phone);
      setConsultantEmailInput(consultantProfile.email);
    }
  }, [consultantProfile]);

  const handleSaveConsultant = () => {
    const profile: ConsultantProfile = {
      name: consultantNameInput.trim(),
      phone: consultantPhoneInput.trim(),
      email: consultantEmailInput.trim(),
    };

    if (!profile.name || !profile.email) {
      alert("Por favor, preencha nome e e-mail.");
      return;
    }

    try {
      localStorage.setItem("consultantProfile", JSON.stringify(profile));
      setConsultantProfile(profile);
      setStep("chooseErp");
    } catch (e) {
      console.error("Erro ao salvar consultor", e);
    }
  };

  const handleStartApp = () => {
    if (!consultantProfile) {
      setStep("setupConsultant");
    } else {
      setStep("chooseErp");
    }
  };

  const handleSaveToHistory = () => {
    if (!consultantProfile) {
      alert("Configure dados do consultor primeiro.");
      return;
    }

    const now = new Date().toISOString();
    const monthlyFinal = formState.monthlyFee || 0;
    const setupFinal = formState.setupFee || 0;

    const newProposal: SavedProposal = {
      id: (crypto && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : String(Date.now()),
      createdAt: now,
      updatedAt: now,
      erp: formState.erp,
      clientName: formState.clientName || "Sem nome",
      consultant: consultantProfile,
      monthlyFinal,
      setupFinal,
      formState,
    };

    setHistory((prev) => {
      const next = [...prev, newProposal];
      try {
        localStorage.setItem("proposalsHistory", JSON.stringify(next));
      } catch (e) {
        console.error("Erro ao salvar histórico", e);
      }
      return next;
    });

    alert("Proposta salva com sucesso!");
  };

  const handleReopenProposal = (proposal: SavedProposal) => {
    setFormState(proposal.formState);
    setEditingProposalId(proposal.id);
    setStep("proposal");
  };

  const handleDeleteProposal = (proposalId: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta proposta?")) {
      setHistory((prev) => {
        const next = prev.filter((p) => p.id !== proposalId);
        try {
          localStorage.setItem("proposalsHistory", JSON.stringify(next));
        } catch (e) {
          console.error("Erro ao deletar", e);
        }
        return next;
      });
    }
  };

  const handleGoToHistory = () => setStep("history");

  const handleNewProposal = () => {
    setFormState(emptyForm);
    setEditingProposalId(null);
    setStep("chooseErp");
  };

  // Calculate monthly total dynamically
  const monthlyTotal = useMemo(() => {
    if (formState.erp === "OFFICE_ADV") {
      const users = formState.officeUsers || 0;
      const tier = suggestTierByUsersFor("OFFICE_ADV", users);
      const base = getPlanPrice("OFFICE_ADV", tier) || 0;
      const inc = getPlanInclusions("OFFICE_ADV", tier) as (typeof OFFICE_ADV_PLANS)[typeof tier]["inclusions"] | null;
      if (!inc) return base;
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
      return base + ex.totalMonthly;
    } else if (formState.erp === "CPJ_3C_PLUS") {
      const users = formState.cpj3cUsers || 0;
      const tier = suggestTierByUsersFor("CPJ_3C_PLUS", users);
      const base = getPlanPrice("CPJ_3C_PLUS", tier) || 0;
      const inc = getPlanInclusions("CPJ_3C_PLUS", tier) as (typeof CPJ3C_PLANS)[typeof tier]["inclusions"] | null;
      if (!inc) return base;
      const ex = calculateCpj3cExceedances({
        users,
        publications: formState.cpj3cPublications || 0,
        monitoring: formState.cpj3cMonitoringCredits || 0, // Usar valor mensal
        distribution: formState.cpj3cDistributionProcesses || 0, // Usar valor mensal
        protocol: formState.cpj3cProtocols || 0, // Usar valor mensal
        docs: formState.cpj3cAiDocs || 0, // Usar valor mensal
        planInclusions: inc,
      });
      const consulting = (formState.cpj3cConsultingHours || 0) * pricingRules.FIXED_PRICES.consultingHourly;
      return base + ex.totalMonthly + consulting;
    }
    return 0;
  }, [formState]);

  // Calculate setup total dynamically
  const setupTotal = useMemo(() => {
    let total = formState.setupFee || 0;
    
    if (formState.implementationStarter) {
      total += pricingRules.FIXED_PRICES.starter;
    }
    
    if (formState.migrationType === "DISCOVERY" && formState.migrationProcesses) {
      total += pricingRules.calculateMigrationDiscovery(formState.migrationProcesses);
    } else if ((formState.migrationType === "PLANILHA_PERSONALIZADA" || formState.migrationType === "BACKUP_SISTEMA") && formState.migrationHours) {
      total += formState.migrationHours * pricingRules.FIXED_PRICES.consultingHourly;
    }
    
    formState.extraServices.forEach(svc => {
      if (svc.billing === "SETUP") {
        total += (svc.quantity || 0) * (svc.unitPrice || 0);
      }
    });
    
    return total;
  }, [formState]);

  // Keep monthlyFee in sync for summary widgets
  useEffect(() => {
    setFormState((prev) =>
      prev.monthlyFee !== monthlyTotal ? { ...prev, monthlyFee: monthlyTotal } : prev
    );
  }, [monthlyTotal]);

  // PDF from history state
  const [pdfTarget, setPdfTarget] = useState<SavedProposal | null>(null);

  const handleViewPdfFromHistory = async (id: string) => {
    const proposal = history.find((p) => p.id === id) as SavedProposal | undefined;
    if (!proposal) return;
    setPdfTarget(proposal);
  };

  useEffect(() => {
    const printProposal = async () => {
      const el = document.getElementById("history-pdf");
      if (!el || !pdfTarget) return;
      
      // Pega todos os estilos da página atual
      const stylesheets = Array.from(document.styleSheets);
      let allCSS = '';
      
      // Coleta CSS de todas as stylesheets
      stylesheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach(rule => {
              allCSS += rule.cssText + '\n';
            });
          }
        } catch (e) {
          // Ignora erros de CORS
        }
      });
      
      // Pega também os estilos inline
      const styleElements = Array.from(document.querySelectorAll('style'));
      styleElements.forEach(style => {
        allCSS += style.textContent + '\n';
      });
      
      const proposalHTML = el.outerHTML;
      
      // CSS adicional específico para impressão
      const additionalCSS = `
        @media print {
          body { 
            margin: 0 !important; 
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .proposal-container {
            max-width: none !important;
            margin: 0 auto !important;
            padding: 20px !important;
          }
          /* Manter assinatura e footer juntos */
          .signature-section {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
          }
          .footer-section {
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            break-before: avoid !important;
            break-inside: avoid !important;
          }
          .signature-section + .footer-section {
            margin-top: 10px !important;
          }
          /* Evitar quebra no tópico 3 */
          .package-summary-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .package-summary-section h2 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .no-page-break-before {
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .no-page-break-after {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          @page { 
            margin: 0.5in; 
            size: A4 portrait; 
          }
        }
      `;
      
      // Cria uma nova janela para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setPdfTarget(null);
        return;
      }
      
      // Monta o HTML da janela de impressão
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Proposta - ${pdfTarget.clientName || 'Cliente'}</title>
            <style>
              ${allCSS}
              ${additionalCSS}
            </style>
          </head>
          <body>
            ${proposalHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Aguarda carregar e imprime
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          setPdfTarget(null);
        }, 500);
      }, 1000);
    };
    if (pdfTarget) {
      // wait next tick for hidden renderer to mount
      setTimeout(printProposal, 50);
    }
  }, [pdfTarget]);

const handleChange =
    (field: keyof ProposalFormState) =>
    (
      event:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLSelectElement>
        | ChangeEvent<HTMLTextAreaElement>
    ) => {
      const value = event.target.value;

      const numericFields: (keyof ProposalFormState)[] = [
        "setupFee",
        "monthlyFee",
        "discountValue",
        "officeUsers",
        "officePublications",
        "officeMonitoringCredits",
        "officeAiDocs",
        "officeDistributionProcesses",
        "officeProtocols",
        "migrationProcesses",
        "migrationHours",
        "setupDiscountValue",
        "setupInstallments",
        "cpj3cUsers",
        "cpj3cPublications",
        "cpj3cMonitoringCredits",
        "cpj3cAiDocs",
        "cpj3cDistributionProcesses",
        "cpj3cProtocols",
        "cpj3cConsultingHours",
      ];

      setFormState((prev) => {
        if (numericFields.includes(field)) {
          const asNumber = parseFloat(value.replace(",", "."));
          const newValue = isNaN(asNumber) ? 0 : asNumber;

          return {
            ...prev,
            [field]: newValue,
          } as ProposalFormState;
        }

        if (field === "erp") {
          return { ...prev, erp: value as ErpProduct };
        }

        if (field === "discountType") {
          return {
            ...prev,
            discountType: value as ProposalFormState["discountType"],
            discountValue: value === "NONE" ? 0 : prev.discountValue,
          };
        }

        return { ...prev, [field]: value };
      });
    };

  const handleToggleOfficeFinance = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setFormState((prev) => ({
      ...prev,
      officeFinanceModule: checked,
    }));
  };

  const handleToggleStarter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setFormState((prev) => ({
      ...prev,
      implementationStarter: checked,
    }));
  };

  const handleAddExtraService = () => {
    setFormState((prev) => {
      const newService: ExtraService = {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        billing: "MONTHLY",
      };
      return { ...prev, extraServices: [...prev.extraServices, newService] };
    });
  };

  const handleRemoveExtraService = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      extraServices: prev.extraServices.filter((svc) => svc.id !== id),
    }));
  };

  const handleExtraServiceChange =
    (id: string, field: keyof ExtraService) =>
      (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({
        ...prev,
        extraServices: prev.extraServices.map((svc) => {
          if (svc.id !== id) return svc;
          if (field === "quantity" || field === "unitPrice") {
            const asNumber = parseFloat(value.replace(",", "."));
            return {
              ...svc,
              [field]: isNaN(asNumber) ? 0 : asNumber,
            };
          }
          return {
            ...svc,
            [field]: value,
          };
        }),
      }));
    };

  const handleSelectERP = (selected: ErpProduct) => {
    setFormState((prev) => ({
      ...prev,
      erp: selected,
      monthlyFee: 0,
      setupFee: 0,
    }));
  };

  const handleGenerateProposal = () => {
    if (!consultantProfile) {
      setStep("setupConsultant");
    } else {
      setStep("chooseErp");
    }
  };

  // Componente reutilizável do menu de navegação
  const NavigationMenu = () => (
    showNavigationMenu && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end p-3 sm:p-4 lg:p-6" onClick={() => setShowNavigationMenu(false)}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:min-w-80 shadow-2xl mt-12 sm:mt-16 mx-3 sm:mx-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">Menu de Navegação</h3>
            <button 
              onClick={() => setShowNavigationMenu(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => { handleNewProposal(); setShowNavigationMenu(false); }}
              className="w-full flex items-center gap-3 p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 text-white text-left"
            >
              <span className="text-xl sm:text-2xl">✨</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm sm:text-base">Nova Proposta</div>
                <div className="text-xs sm:text-sm text-blue-300/80 truncate">Criar uma nova proposta comercial</div>
              </div>
            </button>
            
            <button 
              onClick={() => { handleGoToHistory(); setShowNavigationMenu(false); }}
              className="w-full flex items-center gap-3 p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 text-white text-left"
            >
              <span className="text-xl sm:text-2xl">📋</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm sm:text-base">Histórico</div>
                <div className="text-xs sm:text-sm text-blue-300/80 truncate">Ver propostas anteriores</div>
              </div>
            </button>
            
            <button 
              onClick={() => { setStep("setupConsultant"); setShowNavigationMenu(false); }}
              className="w-full flex items-center gap-3 p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 text-white text-left"
            >
              <span className="text-xl sm:text-2xl">👤</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm sm:text-base">Perfil do Consultor</div>
                <div className="text-xs sm:text-sm text-blue-300/80 truncate">Editar informações pessoais</div>
              </div>
            </button>
            
            <div className="border-t border-white/20 pt-3 sm:pt-4 mt-3 sm:mt-4">
              <div className="text-xs sm:text-sm text-blue-300/60 mb-2">Consultor Atual:</div>
              <div className="bg-white/5 rounded-lg p-3 text-xs sm:text-sm">
                <div className="text-white font-medium truncate">{consultantProfile?.name || "Não configurado"}</div>
                <div className="text-blue-300/80 truncate">{consultantProfile?.phone || "—"}</div>
                <div className="text-blue-300/80 truncate">{consultantProfile?.email || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // === RENDER ===
  if (step === "intro") {
    return (
      <PremiumLayout onSidebarToggle={handleSidebarToggle}>
        <NavigationMenu />
        <IntroScreen onStart={handleStartApp} />
      </PremiumLayout>
    );
  }

  if (step === "setupConsultant") {
    return (
      <PremiumLayout onSidebarToggle={handleSidebarToggle}>
        <NavigationMenu />
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-6 sm:mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 mb-4">
              Perfil do Consultor
            </h2>
            <p className="text-sm sm:text-base text-blue-200/80 px-4">
              Configure seus dados para aparecerem nas propostas comerciais
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-blue-200 mb-3 uppercase tracking-wider">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={consultantNameInput}
                  onChange={(e) => setConsultantNameInput(e.target.value)}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-blue-300/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                  placeholder="Digite seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-blue-200 mb-3 uppercase tracking-wider">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={consultantPhoneInput}
                  onChange={(e) => setConsultantPhoneInput(e.target.value)}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-blue-300/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-blue-200 mb-3 uppercase tracking-wider">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={consultantEmailInput}
                  onChange={(e) => setConsultantEmailInput(e.target.value)}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-blue-300/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSaveConsultant}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
              >
                Salvar e Continuar →
              </button>
              <button
                onClick={() => setStep("intro")}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm font-semibold"
              >
                ← Voltar
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-blue-300/60 text-sm">
              ℹ️ Estas informações serão utilizadas em todas as propostas geradas
            </p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  if (step === "chooseErp") {
    return (
      <PremiumLayout onSidebarToggle={handleSidebarToggle}>
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 mb-4">
              Olá, {consultantProfile?.name.split(' ')[0]}!
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-200/80 px-4">
              O que deseja realizar hoje?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10 lg:mb-12">
            {/* Office ADV Card */}
            <button
              onClick={() => {
                handleSelectERP("OFFICE_ADV");
                setStep("proposal");
              }}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <img src={officeImg} alt="Office ADV" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white text-center mb-3 sm:mb-4">Office ADV</h3>
                <p className="text-blue-200 text-center leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Sistema completo para gestão de escritórios de advocacia com módulos integrados
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full border border-blue-400/30">Gestão Jurídica</span>
                  <span className="px-2 sm:px-3 py-1 bg-cyan-500/20 text-cyan-200 text-xs rounded-full border border-cyan-400/30">Publicações</span>
                </div>
                <div className="mt-4 sm:mt-6 text-center">
                  <div className="inline-flex items-center gap-2 text-blue-300 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                    <span>Criar Proposta</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {/* CPJ-3C+ Card */}
            <button
              onClick={() => {
                handleSelectERP("CPJ_3C_PLUS");
                setStep("proposal");
              }}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <img src={threeCPlusImg} alt="CPJ-3C+" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white text-center mb-3 sm:mb-4">CPJ-3C+</h3>
                <p className="text-purple-200 text-center leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Plataforma enterprise para gestão completa de departamentos jurídicos corporativos
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full border border-purple-400/30">Enterprise</span>
                  <span className="px-2 sm:px-3 py-1 bg-pink-500/20 text-pink-200 text-xs rounded-full border border-pink-400/30">IA Integrada</span>
                </div>
                <div className="mt-4 sm:mt-6 text-center">
                  <div className="inline-flex items-center gap-2 text-purple-300 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                    <span>Criar Proposta</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {/* CPJ-Cobrança Card */}
            <button
              onClick={() => {
                alert("CPJ-Cobrança está em desenvolvimento. Em breve estará disponível!");
              }}
              className="group relative overflow-hidden opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 hover:border-emerald-400/50">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <img src={cobrancaImg} alt="CPJ-Cobrança" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white text-center mb-3 sm:mb-4">CPJ-Cobrança</h3>
                <p className="text-emerald-200 text-center leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Solução especializada para gestão estratégica de cobranças jurídicas
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-2 sm:px-3 py-1 bg-yellow-500/20 text-yellow-200 text-xs rounded-full border border-yellow-400/30">Em Desenvolvimento</span>
                </div>
                <div className="mt-4 sm:mt-6 text-center">
                  <div className="inline-flex items-center gap-2 text-emerald-300 font-semibold text-sm sm:text-base">
                    <span>Em Breve</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <button
              onClick={handleGoToHistory}
              className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm font-semibold text-sm sm:text-base"
            >
              📂 Ver Histórico de Propostas
            </button>
            <button
              onClick={() => setStep("intro")}
              className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm font-semibold text-sm sm:text-base"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  if (step === "history") {
    return (
      <PremiumLayout onSidebarToggle={handleSidebarToggle}>
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 mb-2 sm:mb-4">
                Histórico de Propostas
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-blue-200/80">
                Visualize, edite e gerencie todas as suas propostas comerciais
              </p>
            </div>
            <button
              onClick={handleNewProposal}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Proposta
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-2xl mx-auto">
                <div className="text-6xl mb-6">📋</div>
                <h3 className="text-2xl font-bold text-white mb-4">Nenhuma proposta encontrada</h3>
                <p className="text-blue-200/80 mb-8">
                  Comece criando sua primeira proposta comercial estratégica
                </p>
                <button
                  onClick={handleNewProposal}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Criar Primeira Proposta
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <ProposalList
                proposals={history}
                onReopen={handleReopenProposal}
                onDelete={handleDeleteProposal}
                onViewPdf={handleViewPdfFromHistory}
              />
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setStep("chooseErp")}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm font-semibold"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // step === "proposal"
  return (
    <PremiumLayout onSidebarToggle={handleSidebarToggle}>
      <NavigationMenu />

      <div className="max-w-7xl mx-auto">
          {/* Hidden renderer for history PDF capture */}
          {pdfTarget && (
            <div className="absolute -left-[10000px] top-0">
              <div className="w-[210mm]">
                <ProposalPreviewEnterprise
                  formState={pdfTarget.formState}
                  consultantProfile={pdfTarget.consultant}
                  captureId="history-pdf"
                />
              </div>
            </div>
          )}
        {/* Header com dashboards */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-blue-500/20 text-blue-200 text-sm rounded-xl border border-blue-400/30 font-semibold backdrop-blur-sm">
                {formState.erp === "OFFICE_ADV" ? "Office ADV" : formState.erp === "CPJ_3C_PLUS" ? "CPJ-3C+" : formState.erp === "CPJ_COBRANCA" ? "CPJ-Cobrança" : "Promad"}
              </span>
              {formState.erp && (formState.erp === "OFFICE_ADV" || formState.erp === "CPJ_3C_PLUS") && (() => {
                const users = formState.erp === "OFFICE_ADV" ? (formState.officeUsers || 0) : (formState.cpj3cUsers || 0);
                const tier = suggestTierByUsersFor(formState.erp, users);
                return (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 text-xs rounded-lg border border-green-400/30 font-bold backdrop-blur-sm">
                    📦 PLANO {tier}
                  </span>
                );
              })()}
              {editingProposalId && (
                <span className="px-3 py-1.5 bg-orange-500/20 text-orange-200 text-xs rounded-lg border border-orange-400/30 font-bold backdrop-blur-sm">
                  ✏️ EDITANDO
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNewProposal}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm font-semibold"
              >
                Nova Proposta
              </button>
              <button
                onClick={handleGoToHistory}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm font-semibold"
              >
                📂 Histórico
              </button>
              <button
                onClick={handleSaveToHistory}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300"
              >
                💾 Salvar Proposta
              </button>
            </div>
          </div>

          {/* Dashboards de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-300/80 text-sm font-semibold uppercase tracking-wider">Investimento Mensal</span>
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">{formatCurrency(monthlyTotal)}</div>
              <p className="text-blue-200/60 text-sm">Valor recorrente</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-purple-300/80 text-sm font-semibold uppercase tracking-wider">Setup Inicial</span>
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">{formatCurrency(setupTotal)}</div>
              <p className="text-purple-200/60 text-sm">Investimento único</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-300/80 text-sm font-semibold uppercase tracking-wider">Anual Estimado</span>
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">{formatCurrency(monthlyTotal * 12)}</div>
              <p className="text-emerald-200/60 text-sm">12 meses</p>
            </div>
          </div>
        </div>

        {/* Formulário e Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            <ProposalFormSimple
              formState={formState}
              onChange={handleChange}
              onToggleOfficeFinance={handleToggleOfficeFinance}
              onToggleStarter={handleToggleStarter}
              onAddExtra={handleAddExtraService}
              onRemoveExtra={handleRemoveExtraService}
              onChangeExtra={(id: string, field: "description" | "quantity" | "unitPrice" | "billing") => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleExtraServiceChange(id, field)(e)}
            />
          </div>

          {/* Preview da Proposta */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div>
                    <h2 className="text-white font-black text-xl">
                      Preview da Proposta
                    </h2>
                    <p className="text-blue-100 text-sm">Visualização em tempo real</p>
                  </div>
                </div>
              </div>
              <div className="p-6 max-h-[800px] overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
                  <ProposalPreviewEnterprise
                    formState={formState}
                    consultantProfile={consultantProfile}
                    captureId="proposal-pdf"
                  />
              </div>
              <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-4">
                <button onClick={async () => {
                    // Pega o conteúdo da proposta
                    const proposalElement = document.getElementById("proposal-pdf");
                    if (!proposalElement) return;
                    
                    // Pega todos os estilos da página atual
                    const stylesheets = Array.from(document.styleSheets);
                    let allCSS = '';
                    
                    // Coleta CSS de todas as stylesheets
                    stylesheets.forEach(sheet => {
                      try {
                        if (sheet.cssRules) {
                          Array.from(sheet.cssRules).forEach(rule => {
                            allCSS += rule.cssText + '\n';
                          });
                        }
                      } catch (e) {
                        // Ignora erros de CORS
                      }
                    });
                    
                    // Pega também os estilos inline
                    const styleElements = Array.from(document.querySelectorAll('style'));
                    styleElements.forEach(style => {
                      allCSS += style.textContent + '\n';
                    });
                    
                    const proposalHTML = proposalElement.outerHTML;
                    
                    // CSS adicional específico para impressão
                    const additionalCSS = `
                      @media print {
                        body { 
                          margin: 0 !important; 
                          padding: 0 !important;
                          -webkit-print-color-adjust: exact !important;
                          color-adjust: exact !important;
                          print-color-adjust: exact !important;
                        }
                        * {
                          -webkit-print-color-adjust: exact !important;
                          color-adjust: exact !important;
                          print-color-adjust: exact !important;
                        }
                        .proposal-container {
                          max-width: none !important;
                          margin: 0 auto !important;
                          padding: 20px !important;
                        }
                        /* Manter assinatura e footer juntos */
                        .signature-section {
                          page-break-inside: avoid !important;
                          page-break-after: avoid !important;
                          break-inside: avoid !important;
                          break-after: avoid !important;
                        }
                        .footer-section {
                          page-break-before: avoid !important;
                          page-break-inside: avoid !important;
                          break-before: avoid !important;
                          break-inside: avoid !important;
                        }
                        .signature-section + .footer-section {
                          margin-top: 10px !important;
                        }
                        /* Evitar quebra no tópico 3 */
                        .package-summary-section {
                          page-break-inside: avoid !important;
                          break-inside: avoid !important;
                        }
                        .package-summary-section h2 {
                          page-break-after: avoid !important;
                          break-after: avoid !important;
                        }
                        .no-page-break-before {
                          page-break-before: avoid !important;
                          break-before: avoid !important;
                        }
                        .no-page-break-after {
                          page-break-after: avoid !important;
                          break-after: avoid !important;
                        }
                        @page { 
                          margin: 0.5in; 
                          size: A4 portrait; 
                        }
                      }
                    `;
                    
                    // Cria uma nova janela para impressão
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    
                    // Monta o HTML da janela de impressão
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8">
                          <title>Proposta - ${formState.clientName || 'Cliente'}</title>
                          <style>
                            ${allCSS}
                            ${additionalCSS}
                          </style>
                        </head>
                        <body>
                          ${proposalHTML}
                        </body>
                      </html>
                    `);
                    
                    printWindow.document.close();
                    
                    // Aguarda carregar e imprime
                    setTimeout(() => {
                      printWindow.print();
                      setTimeout(() => {
                        printWindow.close();
                      }, 500);
                    }, 1000);
                }} className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                  Imprimir Proposta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default App;
