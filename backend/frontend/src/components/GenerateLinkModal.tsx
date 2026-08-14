import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Link as LinkIcon, Sparkles } from 'lucide-react';
import { FormLinkItem } from '../types';

interface GenerateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated: (newLink: FormLinkItem) => void;
}

const COMMON_POSITIONS = [
  'Atendente de Farmácia de Manipulação',
  'Farmacêutico(a) Responsável Técnico(a)',
  'Operador(a) de Caixas',
  'Auxiliar de Manipulação e Pesagem',
  'Teleatendimento e Vendas Comercial',
  'Pós-venda e Relacionamento',
  'Organização / Controle de Estoque',
  'Conferente de Receituário',
  'Gestor(a) de Equipe Comercial',
];

export const GenerateLinkModal: React.FC<GenerateLinkModalProps> = ({
  isOpen,
  onClose,
  onLinkCreated,
}) => {
  const [targetPosition, setTargetPosition] = useState(COMMON_POSITIONS[0]);
  const [customPosition, setCustomPosition] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<FormLinkItem | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const positionToUse = targetPosition === 'Outra' ? customPosition : targetPosition;

    try {
      const res = await fetch(apiUrl('/api/forms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPosition: positionToUse || 'Atendente de Farmácia',
          candidateName: candidateName.trim() || undefined,
          candidateEmail: candidateEmail.trim() || undefined,
          candidatePhone: candidatePhone.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Falha ao criar link');

      const data = await res.json();
      setCreatedLink(data);
      onLinkCreated(data);
    } catch (err) {
      alert('Erro ao gerar link. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = (code: string) => {
    return `${window.location.origin}/f/${code}`;
  };

  const handleCopy = (code: string) => {
    const url = getFullUrl(code);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = (code: string) => {
    const url = getFullUrl(code);
    const candidateStr = candidateName ? `Olá ${candidateName}, ` : 'Olá, ';
    const text = `${candidateStr}favor preencher o Questionário de Pré-Entrevista para a vaga de ${createdLink?.targetPosition || 'Fórmula Plus'} no link a seguir:\n\n${url}\n\nFórmula Plus Farmácia de Manipulação.`;
    
    let phoneClean = candidatePhone.replace(/\D/g, '');
    if (phoneClean.length === 10 || phoneClean.length === 11) {
      phoneClean = '55' + phoneClean;
    }

    const waUrl = phoneClean
      ? `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
  };

  const resetAndClose = () => {
    setCreatedLink(null);
    setCandidateName('');
    setCandidateEmail('');
    setCandidatePhone('');
    setTargetPosition(COMMON_POSITIONS[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base tracking-tight">Gerar Link de Formulário</h3>
          </div>
          <button
            onClick={resetAndClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!createdLink ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vaga do Candidato *
                </label>
                <select
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {COMMON_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                  <option value="Outra">Outra vaga...</option>
                </select>

                {targetPosition === 'Outra' && (
                  <input
                    type="text"
                    required
                    placeholder="Digite o título da vaga..."
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    className="mt-2 w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome do Candidato (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Telefone / WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="candidato@email.com"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Gerando...</span>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4" />
                      <span>Gerar Link Único</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Link Success Created State */
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">Link Gerado com Sucesso!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Envie este link para o candidato preencher o Questionário de Pré-Entrevista.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-2">
                <p className="text-xs font-medium text-slate-500">Link de Acesso Direto:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getFullUrl(createdLink.code)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-emerald-800 font-semibold focus:outline-none select-all"
                  />
                  <button
                    onClick={() => handleCopy(createdLink.code)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => handleWhatsAppShare(createdLink.code)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>

                <button
                  onClick={resetAndClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
