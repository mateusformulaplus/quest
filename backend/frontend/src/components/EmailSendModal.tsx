import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormSubmissionItem } from '../types';

interface EmailSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: FormSubmissionItem | null;
}

export const EmailSendModal: React.FC<EmailSendModalProps> = ({
  isOpen,
  onClose,
  submission,
}) => {
  if (!isOpen || !submission) return null;

  const [toEmail, setToEmail] = useState(submission.candidateEmail || 'rh@formulaplus.com.br');
  const [subject, setSubject] = useState(
    `Questionário de Pré-Entrevista: ${submission.candidateName} - Vaga: ${submission.candidatePosition}`
  );
  const [messageText, setMessageText] = useState(
    `Prezados,\n\nSegue em anexo a ficha completa do questionário de pré-entrevista do candidato(a) ${submission.candidateName} para a vaga de ${submission.candidatePosition}.\n\nResultado da Avaliação: ${
      submission.companyEvaluation?.recommendation === 'SIM'
        ? 'Recomendado para Entrevista'
        : submission.companyEvaluation?.recommendation === 'NAO'
        ? 'Não Recomendado'
        : 'Em Avaliação'
    }\n\nFórmula Plus Farmácia de Manipulação.`
  );

  const [sending, setSending] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrorMsg('');

    try {
      const res = await fetch(apiUrl(`/api/submissions/${submission.id}/send-email`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail,
          subject,
          messageText,
        }),
      });

      if (!res.ok) throw new Error('Erro ao enviar e-mail');

      const data = await res.json();
      setSuccessResult(data);
    } catch (err) {
      setErrorMsg('Falha ao processar e-mail. Verifique a conexão.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Enviar Formulário por E-mail</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successResult ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">E-mail Processado com Sucesso!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  {successResult.message}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1.5 text-xs text-slate-700">
                <p><strong>Destinatário:</strong> {toEmail}</p>
                <p><strong>Assunto:</strong> {subject}</p>
                <p><strong>Status:</strong> <span className="text-emerald-700 font-semibold">{successResult.method === 'smtp' ? 'Enviado via SMTP' : 'Registrado / Simulado'}</span></p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Destinatário (E-mail) *
                </label>
                <input
                  type="email"
                  required
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assunto *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-lg text-xs text-emerald-900">
                💡 O e-mail incluirá automaticamente todos os dados das 41 respostas do candidato e os apontamentos da avaliação de RH.
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={sending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {sending ? (
                    <span>Enviando...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar E-mail</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
