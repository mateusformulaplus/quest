import React, { useState } from 'react';
import { Pill, FileText, Link, CheckCircle, ExternalLink, ShieldCheck, Menu, X, Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'links' | 'templates';
  setActiveTab: (tab: 'dashboard' | 'links' | 'templates') => void;
  onOpenNewLinkModal: () => void;
  isCandidateMode: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLinkModal,
  isCandidateMode,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'dashboard' | 'links' | 'templates') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Fórmula Plus Logo"
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold uppercase tracking-wider border border-slate-200">
                Farmácia de Manipulação
              </span>
              <p className="text-xs text-slate-400">
                Gestão de Recrutamento & Pré-Entrevista
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          {!isCandidateMode && (
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Respostas Recebidas</span>
              </button>

              <button
                onClick={() => setActiveTab('links')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'links'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Link className={`w-4 h-4 ${activeTab === 'links' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Links Gerados</span>
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'templates'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'templates' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Modelos de Formulários</span>
              </button>
            </nav>
          )}

          {/* Actions & Mode Switcher (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {!isCandidateMode && (
              <button
                onClick={onOpenNewLinkModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm flex items-center space-x-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Gerar Novo Link</span>
              </button>
            )}

            {!isCandidateMode && onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              >
                Sair
              </button>
            )}

          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden transition-colors border border-slate-200"
              aria-label="Abrir Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {!isCandidateMode && (
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-1">
                Navegação Principal
              </p>
              
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-3 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Respostas Recebidas</span>
              </button>

              <button
                onClick={() => handleTabClick('links')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-3 ${
                  activeTab === 'links'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Link className={`w-4 h-4 ${activeTab === 'links' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Links Gerados</span>
              </button>

              <button
                onClick={() => handleTabClick('templates')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-3 ${
                  activeTab === 'templates'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'templates' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Modelos de Formulários</span>
              </button>
            </div>
          )}

          {/* Quick Actions inside Hamburger */}
          <div className="space-y-2 pt-1">
            {!isCandidateMode && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenNewLinkModal();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Gerar Novo Link de Pré-Entrevista</span>
              </button>
            )}

            {!isCandidateMode && onLogout && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
              >
                Sair
              </button>
            )}

          </div>
        </div>
      )}
    </header>
  );
};

