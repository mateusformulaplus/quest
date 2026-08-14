import React, { useState } from 'react';
import { X, Download, Mail, CheckCircle2, UserCheck, ShieldAlert, Award, FileSpreadsheet, Clock } from 'lucide-react';
import { FormSubmissionItem, EvaluationRating, RecommendationType } from '../types';
import { FORMULA_PLUS_QUESTIONNAIRE } from '../data/questionnaireTemplate';
import { generateSubmissionPDF } from '../utils/pdfGenerator';
import { EmailSendModal } from './EmailSendModal';

interface SubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: FormSubmissionItem | null;
  onUpdateSubmission: (updated: FormSubmissionItem) => void;
  onDeleteSubmission: (id: string) => void;
}

const CRITERIA_KEYS = [
  { key: 'experienciaProfissional', label: 'Experiência Profissional' },
  { key: 'comunicacao', label: 'Comunicação' },
  { key: 'perfilComercial', label: 'Perfil Comercial' },
  { key: 'atendimento', label: 'Atendimento ao Cliente' },
  { key: 'organizacao', label: 'Organização' },
  { key: 'trabalhoEmEquipe', label: 'Trabalho em Equipe' },
  { key: 'maturidadeProfissional', label: 'Maturidade Profissional' },
  { key: 'orientacaoResultados', label: 'Orientação para Resultados' },
  { key: 'compatibilidadeVaga', label: 'Compatibilidade com a Vaga' },
];

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  isOpen,
  onClose,
  submission,
  onUpdateSubmission,
  onDeleteSubmission,
}) => {
  if (!isOpen || !submission) return null;

  // Evaluation local states
  const initialCriteria = submission.companyEvaluation?.criteria || {};
  const [criteria, setCriteria] = useState<{ [key: string]: EvaluationRating }>(
    initialCriteria as any
  );
  const [recommendation, setRecommendation] = useState<RecommendationType>(
    submission.companyEvaluation?.recommendation || 'AVALIAR_MELHOR'
  );
  const [interviewerNotes, setInterviewerNotes] = useState(
    submission.companyEvaluation?.interviewerNotes || ''
  );

  const [savingEvaluation, setSavingEvaluation] = useState(false);
  const [evaluationSaved, setEvaluationSaved] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvaluation(true);

    try {
      const res = await fetch(apiUrl(`/api/submissions/${submission.id}/evaluate`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria,
          recommendation,
          interviewerNotes,
          evaluatorName: 'RH Fórmula Plus',
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar avaliação');

      const data = await res.json();
      const updatedSubmission: FormSubmissionItem = {
        ...submission,
        evaluated: true,
        companyEvaluation: data.companyEvaluation,
      };

      onUpdateSubmission(updatedSubmission);
      setEvaluationSaved(true);
      setTimeout(() => setEvaluationSaved(false), 3000);
    } catch (err) {
      alert('Falha ao salvar a avaliação do RH. Tente novamente.');
    } finally {
      setSavingEvaluation(false);
    }
  };

  const handleRatingChange = (key: string, rating: EvaluationRating) => {
    setCriteria((prev) => ({ ...prev, [key]: rating }));
  };

  const renderAnswerText = (qId: string) => {
    const ans = submission.answers[qId];
    if (ans === undefined || ans === null || ans === '') {
      return <span className="text-slate-400 italic">Não respondido</span>;
    }

    if (typeof ans === 'object') {
      if (Array.isArray(ans)) {
        return (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {ans.map((item: string, idx: number) => (
              <span key={idx} className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-200">
                {item}
              </span>
            ))}
          </div>
        );
      } else if (ans.value) {
        return (
          <div className="text-slate-900 font-medium text-sm">
            <span>{ans.value}</span>
            {ans.details && (
              <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-200">
                <strong>Detalhes:</strong> {ans.details}
              </p>
            )}
          </div>
        );
      }
    }

    return <p className="text-slate-900 font-medium text-sm whitespace-pre-line">{String(ans)}</p>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Action Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900">{submission.candidateName}</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-semibold uppercase tracking-wider">
                {submission.candidatePosition}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enviado em {new Date(submission.submittedAt).toLocaleDateString('pt-BR')} às {new Date(submission.submittedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateSubmissionPDF(submission)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
              title="Baixar formulário em PDF com avaliação"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Gerar PDF</span>
            </button>

            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1.5 border border-slate-200"
              title="Enviar formulário por e-mail"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">E-mail</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
          
          {/* Candidate Profile Quick Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Telefone / WhatsApp</span>
              <span className="text-sm font-semibold text-slate-800">{submission.candidatePhone || 'Não informado'}</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">E-mail</span>
              <span className="text-sm font-semibold text-slate-800">{submission.candidateEmail || 'Não informado'}</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Status da Avaliação</span>
              <span className={`inline-flex items-center space-x-1 text-xs font-bold uppercase rounded px-2.5 py-1 mt-0.5 ${
                submission.evaluated
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {submission.evaluated ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Avaliado pelo RH</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pendente de Avaliação</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* ================= HR EXCLUSIVE EVALUATION SECTION ("USO EXCLUSIVO DA EMPRESA") ================= */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">USO EXCLUSIVO DA EMPRESA</h3>
                  <p className="text-xs text-slate-500">Avaliação do Perfil do Candidato e Parecer Final do Entrevistador</p>
                </div>
              </div>

              {evaluationSaved && (
                <span className="bg-emerald-500 text-emerald-950 text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                  ✓ Avaliação Salva!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-6">
              
              {/* Criteria Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Avaliação Inicial dos Critérios:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CRITERIA_KEYS.map(({ key, label }) => {
                    const currentVal = criteria[key];
                    return (
                      <div key={key} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                        <span className="text-xs font-semibold text-slate-700 block truncate">{label}</span>
                        <div className="flex items-center justify-between bg-white p-1 rounded-lg border border-slate-200">
                          {(['Baixa', 'Média', 'Alta'] as EvaluationRating[]).map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => handleRatingChange(key, rating)}
                              className={`flex-1 text-[11px] font-bold py-1 px-1 rounded-md transition-all ${
                                currentVal === rating
                                  ? rating === 'Alta'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : rating === 'Média'
                                    ? 'bg-orange-500 text-white shadow-xs'
                                    : 'bg-rose-500 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation Choice */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Candidato recomendado para entrevista: *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`cursor-pointer rounded-xl p-3 border flex items-center space-x-2.5 transition-all ${
                      recommendation === 'SIM'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value="SIM"
                      checked={recommendation === 'SIM'}
                      onChange={() => setRecommendation('SIM')}
                      className="sr-only"
                    />
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-semibold">Sim (Recomendado)</span>
                  </label>

                  <label
                    className={`cursor-pointer rounded-xl p-3 border flex items-center space-x-2.5 transition-all ${
                      recommendation === 'NAO'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value="NAO"
                      checked={recommendation === 'NAO'}
                      onChange={() => setRecommendation('NAO')}
                      className="sr-only"
                    />
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-semibold">Não (Não recomendado)</span>
                  </label>

                  <label
                    className={`cursor-pointer rounded-xl p-3 border flex items-center space-x-2.5 transition-all ${
                      recommendation === 'AVALIAR_MELHOR'
                        ? 'bg-orange-100 text-orange-800 border-orange-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value="AVALIAR_MELHOR"
                      checked={recommendation === 'AVALIAR_MELHOR'}
                      onChange={() => setRecommendation('AVALIAR_MELHOR')}
                      className="sr-only"
                    />
                    <UserCheck className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-semibold">Avaliar melhor</span>
                  </label>
                </div>
              </div>

              {/* Interviewer Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Observações do Entrevistador:
                </label>
                <textarea
                  rows={3}
                  placeholder="Escreva pareceres adicionais, impressões sobre a experiência ou observações para a entrevista presencial..."
                  value={interviewerNotes}
                  onChange={(e) => setInterviewerNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={savingEvaluation}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg text-xs shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingEvaluation ? 'Salvando...' : 'Salvar Avaliação do RH'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* ================= QUESTIONNAIRE ANSWERS (ALL 10 SECTIONS) ================= */}
          {submission.answers?.isHandwritten ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-emerald-800">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Questionário Preenchido Manuscrito (Em Papel)
                </h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Arquivo Anexado pelo RH:</p>
                    <p className="text-sm font-bold text-emerald-700">{submission.answers.fileName || 'questionario_manuscrito.pdf'}</p>
                    {submission.answers.notes && (
                      <p className="text-xs text-slate-500 italic mt-1">{submission.answers.notes}</p>
                    )}
                  </div>

                  {submission.answers.fileData && (
                    <a
                      href={submission.answers.fileData}
                      download={submission.answers.fileName || 'questionario_manuscrito.pdf'}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-xs shadow-sm inline-flex items-center space-x-2 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar PDF Manuscrito</span>
                    </a>
                  )}
                </div>

                {/* PDF or Image Embed Preview */}
                {submission.answers.fileData && (
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {submission.answers.fileData.startsWith('data:application/pdf') ? (
                      <iframe
                        src={submission.answers.fileData}
                        title="Visualização do PDF Manuscrito"
                        className="w-full h-96 border-0"
                      />
                    ) : (
                      <img
                        src={submission.answers.fileData}
                        alt="Foto do questionário manuscrito"
                        className="max-h-96 mx-auto object-contain p-2"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span>Respostas do Questionário de Pré-Entrevista (41 Questões)</span>
              </h3>

              {FORMULA_PLUS_QUESTIONNAIRE.sections.map((section) => (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  
                  {/* Section Title Bar */}
                  <div className="bg-emerald-800 text-white px-5 py-3 font-bold text-sm">
                    {section.title}
                  </div>

                  {/* Section Questions */}
                  <div className="p-5 space-y-4 divide-y divide-slate-100">
                    {section.questions.map((q) => (
                      <div key={q.id} className="pt-3 first:pt-0 space-y-1">
                        <p className="text-xs font-bold text-slate-700">
                          {q.number}. {q.label}
                        </p>
                        <div className="pl-3 border-l-2 border-emerald-500/60 py-1">
                          {renderAnswerText(q.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Candidate Digital Declaration & Signature Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                  DECLARAÇÃO E ASSINATURA DO CANDIDATO
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                  "Declaro que as informações fornecidas neste questionário são verdadeiras e foram prestadas voluntariamente para participação no processo seletivo. Estou ciente de que os dados fornecidos serão utilizados para fins relacionados ao processo de recrutamento e seleção."
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Nome Assinado:</p>
                    <p className="text-sm font-bold text-slate-900">{submission.signatureName}</p>
                    <p className="text-xs text-slate-500 mt-1">Data: {submission.signatureDate}</p>
                  </div>

                  {submission.signatureData && (
                    <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                      <p className="text-[10px] text-slate-400 mb-1">Assinatura Digital:</p>
                      <img
                        src={submission.signatureData}
                        alt="Assinatura do candidato"
                        className="max-h-16 max-w-xs object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir esta resposta permanentemente?')) {
                onDeleteSubmission(submission.id);
                onClose();
              }
            }}
            className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
          >
            Excluir Resposta
          </button>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2 rounded-xl text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Email Sender Modal */}
      <EmailSendModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        submission={submission}
      />
    </div>
  );
};
