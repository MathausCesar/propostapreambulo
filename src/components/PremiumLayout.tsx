import React from "react";
import AnimatedBackground from "./AnimatedBackground";

// Usar caminho direto para Electron
const iconeImg = '/icone.png';

interface PremiumLayoutProps {
  children: React.ReactNode;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export function PremiumLayout({ children, sidebarOpen = true, onSidebarToggle }: PremiumLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Premium header */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 flex items-center justify-center shadow-lg shadow-slate-800/50 p-1.5 flex-shrink-0">
                <img src={iconeImg} alt="Preambulo Tech" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent truncate">
                  PREAMBULO TECH
                </h1>
                <p className="text-xs text-blue-300/80 font-medium tracking-wider hidden sm:block">
                  GERENCIADOR DE PROPOSTAS
                </p>
              </div>
            </div>
            <button
              onClick={onSidebarToggle}
              className="p-2 sm:p-3 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20 flex-shrink-0"
              title="Toggle sidebar"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function PremiumCard({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`
        bg-white/5 backdrop-blur-xl border border-blue-400/20 rounded-2xl 
        shadow-2xl transition-all duration-300
        ${hover ? "hover:bg-white/10 hover:border-blue-400/40 hover:shadow-2xl" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export function PremiumButton({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:scale-105 active:scale-95",
    secondary: "bg-gradient-to-r from-blue-900 to-blue-800 text-blue-100 hover:from-blue-800 hover:to-blue-700",
    outline: "border border-blue-400 text-blue-300 hover:bg-blue-950/30",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:scale-105",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down";
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <PremiumCard className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-blue-300/70 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {icon && (
          <div className="p-3 bg-blue-500/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-3 text-xs font-semibold flex items-center gap-1 ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
          {trend === "up" ? "↑" : "↓"} {Math.abs(12)}% vs mês anterior
        </div>
      )}
    </PremiumCard>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info";
}

export function Badge({ children, variant = "info" }: BadgeProps) {
  const variantClasses = {
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
    error: "bg-red-500/20 text-red-300 border border-red-400/30",
    info: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
