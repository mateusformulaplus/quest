import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Paperclip } from 'lucide-react';

interface UploadHandwrittenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadHandwrittenModal: React.FC<UploadHandwrittenModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [candidatePosition, setCandidatePosition] = useState('Atendente de Farmácia de Manipulação');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('O arquivo deve ter no máximo 15MB.');
        return;
      }
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      setErrorMsg('Por favor, informe o nome do candidato.');
      return;
    }
    if (!selectedFile || !fileBase64) {
      setErrorMsg('Por favor, anexe o PDF ou foto do questionário preenchido à mão.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/submissions/manual-upload'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          candidatePosition: candidatePosition.trim(),
          candidateEmail: candidateEmail.trim(),
          candidatePhone: candidatePhone.trim(),
          pdfData: fileBase64,
          pdfFileName: selectedFile.name,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao cadastrar questionário manuscrito.');
      }

      onUploadSuccess();
      onClose();
      // Reset state
      setCandidateName('');
      setSelectedFile(null);
      setFileBase64(null);
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar o PDF manuscrito.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Anexar Questionário Manuscrito (PDF)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            Cadastre um candidato que preencheu o questionário em papel e anexe o PDF digitalizado ou foto para realizar a avaliação de RH no sistema.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo do Candidato: *</label>
            <input
              type="text"
              required
              placeholder="Ex: João Pedro Alves"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Vaga Pretendida: *</label>
              <select
                value={candidatePosition}
                onChange={(e) => setCandidatePosition(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Atendente de Farmácia de Manipulação">Atendente de Farmácia</option>
                <option value="Farmacêutico(a)">Farmacêutico(a)</option>
                <option value="Operador(a) de Caixa">Operador(a) de Caixa</option>
                <option value="Auxiliar de Manipulação">Auxiliar de Manipulação</option>
                <option value="Conferente de Fórmulas">Conferente de Fórmulas</option>
                <option value="Outra Vaga">Outra Vaga</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Telefone / WhatsApp:</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">E-mail do Candidato:</label>
            <input
              type="email"
              placeholder="candidato@email.com"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* PDF Attachment Area */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Anexar PDF / Foto do Formulário Manuscrito: *</label>
            <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-4 text-center hover:bg-slate-100/80 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2 text-emerald-700 font-bold text-xs">
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  <span className="truncate max-w-[280px]">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Clique ou arraste o arquivo PDF ou foto aqui</p>
                  <p className="text-[10px] text-slate-400">PDF, JPG ou PNG de até 15MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Observações Internas do RH:</label>
            <textarea
              rows={2}
              placeholder="Ex: Entregue presencialmente no balcão da farmácia em 13/08..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="bg-white border-t border-slate-200 pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg text-xs shadow-sm flex items-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Salvar Questionário no Sistema'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
