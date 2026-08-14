import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { CandidateQuestionnaireView } from './components/CandidateQuestionnaireView';
import { GenerateLinkModal } from './components/GenerateLinkModal';
import { LoginScreen } from './components/LoginScreen';
import { FormLinkItem } from './types';
import { apiUrl } from './config';

const ADMIN_EMAIL = 'adm@formulaplus.com';
const ADMIN_PASSWORD = 'formulaplus';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'templates'>('dashboard');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isCandidateMode, setIsCandidateMode] = useState(false);
  const [candidateFormCode, setCandidateFormCode] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('fp-admin-auth');
    return saved === 'true';
  });

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/f\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      setCandidateFormCode(match[1]);
      setIsCandidateMode(true);
      return;
    }

    setCandidateFormCode(undefined);
    setIsCandidateMode(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'E-mail ou senha inválidos.');
      }

      const data = await response.json();
      if (!data?.user) {
        throw new Error('Resposta de autenticação inválida.');
      }

      localStorage.setItem('fp-admin-auth', 'true');
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('fp-admin-auth');
      setIsAuthenticated(false);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fp-admin-auth');
    setIsAuthenticated(false);
    window.history.pushState({}, '', '/');
    setCandidateFormCode(undefined);
    setIsCandidateMode(false);
  };

  const handleLinkCreated = (newLink: FormLinkItem) => {
    // Refresh admin data
  };

  const toggleCandidateMode = () => {
    if (isCandidateMode) {
      window.history.pushState({}, '', '/');
      setCandidateFormCode(undefined);
      setIsCandidateMode(false);
    } else {
      setIsCandidateMode(true);
    }
  };

  if (!isAuthenticated && !isCandidateMode) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLinkModal={() => setIsGenerateModalOpen(true)}
        isCandidateMode={isCandidateMode}
        onLogout={handleLogout}
      />

      {isCandidateMode ? (
        <CandidateQuestionnaireView
          formCode={candidateFormCode}
          onSubmittedSuccess={() => {
            // Success handler
          }}
        />
      ) : (
        <AdminDashboard
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewLinkModal={() => setIsGenerateModalOpen(true)}
        />
      )}

      <GenerateLinkModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onLinkCreated={handleLinkCreated}
      />
    </div>
  );
}
