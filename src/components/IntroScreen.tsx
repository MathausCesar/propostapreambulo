import React from 'react';
import AnimatedBackground from './AnimatedBackground';

// Usar caminhos diretos para Electron
const iconeImg = '/icone.png';
const preambutoImg = '/preambulo.png';

interface IntroScreenProps {
    onStart: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
                <div className="max-w-4xl mx-auto w-full text-center space-y-12">
                    {/* Logo */}
                    <div className="inline-flex items-center gap-3 mb-4 animate-fade-in">
                        <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center shadow-2xl shadow-slate-800/50 p-3">
                            <img src={iconeImg} alt="Preambulo Tech" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="space-y-6">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 blur-3xl opacity-30 animate-pulse-slow" />
                            <img 
                                src={preambutoImg} 
                                alt="Preâmbulo" 
                                className="relative w-auto h-16 sm:h-20 md:h-24 lg:h-28 mx-auto object-contain filter drop-shadow-2xl"
                            />
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white px-4">Gerenciador de Propostas Comerciais</h2>
                        <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed px-4">
                            Bem-vindo ao sistema enterprise para criação de propostas comerciais personalizadas
                        </p>
                    </div>

                    {/* Version Badge */}
                    <div className="inline-block px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                        <span className="text-sm font-semibold text-white/80">Em Fase de Testes</span>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-8">
                        <button
                            onClick={onStart}
                            className="group relative inline-flex items-center gap-3 sm:gap-4 px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg sm:text-xl text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative">Iniciar</span>
                            <svg className="relative w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>

                    {/* Subtle Feature Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 pt-8 text-white/40 text-xs sm:text-sm px-4">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Office ADV</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>CPJ-3C+</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>CPJ-Cobrança</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default IntroScreen;