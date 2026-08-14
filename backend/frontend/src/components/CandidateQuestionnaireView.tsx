import React, { useState, useRef, useEffect } from 'react';
import { Pill, CheckCircle, Send, Sparkles, ArrowRight, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { FormTemplateData, CandidateAnswers } from '../types';
import { FORMULA_PLUS_QUESTIONNAIRE } from '../data/questionnaireTemplate';

interface CandidateQuestionnaireViewProps {
  formCode?: string;
  onSubmittedSuccess?: () => void;
}

export const CandidateQuestionnaireView: React.FC<CandidateQuestionnaireViewProps> = ({
  formCode,
  onSubmittedSuccess,
}) => {
  const [template, setTemplate] = useState<FormTemplateData>(FORMULA_PLUS_QUESTIONNAIRE);
  const [targetPosition, setTargetPosition] = useState('Atendente de Farmácia');
  const [candidateNamePreset, setCandidateNamePreset] = useState('');
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<CandidateAnswers>({});
  
  // Signature States
  const [signatureName, setSignatureName] = useState('');
  const [signatureDate, setSignatureDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Fetch form details if code provided
  useEffect(() => {
    if (formCode) {
      fetch(apiUrl(`/api/public/form/${formCode}`))
        .then((res) => {
          if (!res.ok) throw new Error('Formulário não encontrado');
          return res.json();
        })
        .then((data) => {
          if (data.template) setTemplate(data.template);
          if (data.targetPosition) {
            setTargetPosition(data.targetPosition);
            setAnswers((prev) => ({ ...prev, q4: data.targetPosition }));
          }
          if (data.candidateName) {
            setCandidateNamePreset(data.candidateName);
            setSignatureName(data.candidateName);
            setAnswers((prev) => ({ ...prev, q1: data.candidateName }));
          }
          if (data.candidateEmail) {
            setAnswers((prev) => ({ ...prev, q3: data.candidateEmail }));
          }
          if (data.candidatePhone) {
            setAnswers((prev) => ({ ...prev, q2: data.candidatePhone }));
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [formCode]);

  // Sync Signature Name with Q1 Name if available
  useEffect(() => {
    if (answers.q1 && !signatureName) {
      setSignatureName(String(answers.q1));
    }
  }, [answers.q1]);

  // Helper to compute scaled canvas coordinates accurately on all screens (mobile/desktop)
  const getCanvasCoords = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(canvas, e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#065f46'; // Emerald color
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDataUrl(null);
    }
  };

  // Answer handlers
  const handleInputChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxToggle = (questionId: string, option: string, hasOtherText?: boolean) => {
    const currentList: string[] = Array.isArray(answers[questionId]) ? [...answers[questionId]] : [];
    if (currentList.includes(option)) {
      const updated = currentList.filter((item) => item !== option);
      setAnswers((prev) => ({ ...prev, [questionId]: updated }));
    } else {
      currentList.push(option);
      setAnswers((prev) => ({ ...prev, [questionId]: currentList }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Ensure Name and Required items
    if (!answers.q1) {
      setErrorMsg('Por favor, informe seu Nome Completo na Questão 1.');
      setCurrentSectionIndex(0);
      setLoading(false);
      return;
    }

    try {
      const submitCode = formCode || 'demo';
      const res = await fetch(apiUrl(`/api/public/form/${submitCode}/submit`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          signatureName: signatureName || String(answers.q1),
          signatureData: signatureDataUrl,
          signatureDate,
        }),
      });

      if (!res.ok) throw new Error('Erro no servidor ao enviar formulário.');

      setSubmitted(true);
      if (onSubmittedSuccess) onSubmittedSuccess();
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao enviar suas respostas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const currentSection = template.sections[currentSectionIndex];
  const progressPercent = Math.round(((currentSectionIndex + 1) / (template.sections.length + 1)) * 100);

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Questionário Enviado!</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Agradecemos sua participação. Suas respostas foram salvas com sucesso e serão analisadas exclusivamente pela equipe de Seleção e RH da <strong>Fórmula Plus Farmácia de Manipulação</strong>.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 text-left space-y-1 font-medium">
            <p>✓ As informações fornecidas têm garantia de sigilo profissional.</p>
            <p>✓ Caso seu perfil seja selecionado, entraremos em contato para agendar a entrevista presencial.</p>
          </div>

          {/* <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
          >
            Preencher Novo Questionário
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 shadow-xs">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Fórmula Plus Logo"
              className="h-16 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {template.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {template.objective}
          </p>

          <div className="pt-2 text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
            "Orientação: {template.orientation}"
          </div>
        </div>
      </div>

      {/* Sticky Progress Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-xs px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs font-bold text-slate-700">
          <span>
            Etapa {currentSectionIndex + 1} de {template.sections.length + 1}: {currentSectionIndex < template.sections.length ? currentSection.title : 'DECLARAÇÃO FINAL'}
          </span>
          <span className="text-emerald-700">{progressPercent}%</span>
        </div>
        <div className="max-w-3xl mx-auto w-full bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Form Box */}
      <div className="max-w-3xl mx-auto px-4 mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {errorMsg && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 text-rose-800 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Section Render */}
          {currentSectionIndex < template.sections.length ? (
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Section Header Title */}
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-extrabold text-emerald-950">
                  {currentSection.title}
                </h2>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {currentSection.questions.map((q) => {
                  const currentVal = answers[q.id];

                  return (
                    <div key={q.id} className="space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                      <label className="block text-sm font-bold text-slate-900 leading-snug">
                        {q.number}. {q.label} {q.required && <span className="text-rose-500">*</span>}
                      </label>

                      {/* Text Input */}
                      {(q.type === 'text' || q.type === 'email') && (
                        <input
                          type={q.type}
                          required={q.required}
                          placeholder={q.placeholder || 'Digite sua resposta...'}
                          value={currentVal || ''}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      )}

                      {/* Textarea Input */}
                      {q.type === 'textarea' && (
                        <textarea
                          rows={3}
                          required={q.required}
                          placeholder={q.placeholder || 'Escreva com detalhes sua resposta...'}
                          value={currentVal || ''}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      )}

                      {/* Radio Single Select */}
                      {q.type === 'radio' && q.options && (
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt) => {
                            const isSelected = currentVal?.value === opt || currentVal === opt;
                            return (
                              <label
                                key={opt}
                                className={`cursor-pointer rounded-xl p-3 border flex items-center space-x-3 transition-all ${
                                  isSelected
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => handleInputChange(q.id, opt)}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium">{opt}</span>
                              </label>
                            );
                          })}

                          {/* Follow-up text if specified */}
                          {q.hasFollowUpText && (
                            <div className="pt-2 pl-2">
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                {q.followUpLabel || 'Explique brevemente:'}
                              </label>
                              <input
                                type="text"
                                placeholder="Digite a explicação..."
                                value={typeof currentVal === 'object' ? currentVal.details || '' : ''}
                                onChange={(e) =>
                                  handleInputChange(q.id, {
                                    value: typeof currentVal === 'object' ? currentVal.value : currentVal || 'Sim',
                                    details: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Checkbox Multi Select */}
                      {q.type === 'checkbox' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => {
                            const list: string[] = Array.isArray(currentVal) ? currentVal : [];
                            const checked = list.includes(opt);
                            return (
                              <label
                                key={opt}
                                className={`cursor-pointer rounded-xl p-3 border flex items-center space-x-3 transition-all ${
                                  checked
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleCheckboxToggle(q.id, opt, q.hasOtherText)}
                                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-xs font-semibold">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Final Step: Section 10 Declaration & Signature */
            <div className="p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-extrabold text-emerald-950 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>10. DECLARAÇÃO DO CANDIDATO</span>
                </h2>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 leading-relaxed font-medium space-y-2">
                <p>
                  Declaro que as informações fornecidas neste questionário são verdadeiras e foram prestadas voluntariamente para participação no processo seletivo.
                </p>
                <p>
                  Estou ciente de que os dados fornecidos serão utilizados para fins relacionados ao processo de recrutamento e seleção, observadas as normas aplicáveis de proteção de dados pessoais.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo do Candidato *
                  </label>
                  <input
                    type="text"
                    required
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Seu nome completo para confirmação..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data *
                  </label>
                  <input
                    type="text"
                    required
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="w-full sm:w-48 bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Signature Pad */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Assinatura Digital (Rubrica no quadro abaixo)
                    </label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Limpar Desenho</span>
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-emerald-600/40 rounded-2xl bg-slate-50 p-2 text-center">
                    <canvas
                      ref={canvasRef}
                      width={450}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="touch-none bg-white rounded-xl border border-slate-200 cursor-crosshair mx-auto w-full max-w-md h-28"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Desenhe sua rubrica ou assinatura digital utilizando o mouse ou a tela sensível ao toque.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation Controls */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            {currentSectionIndex > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentSectionIndex((prev) => prev - 1)}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <div />
            )}

            {currentSectionIndex < template.sections.length ? (
              <button
                type="button"
                onClick={() => setCurrentSectionIndex((prev) => prev + 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5 ml-auto"
              >
                <span>Próxima Seção</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-2.5 rounded-lg text-sm transition-colors shadow-sm flex items-center space-x-2 ml-auto disabled:opacity-50"
              >
                {loading ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Concluir e Enviar Questionário</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
