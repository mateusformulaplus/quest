import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, CheckCircle2, ChevronDown, ChevronUp, Save, HelpCircle, Layers, FileText } from 'lucide-react';
import { FormTemplateItem, Section, Question } from '../types';

interface QuestionnaireEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: FormTemplateItem | null;
  onSaveSuccess: () => void;
}

export const QuestionnaireEditorModal: React.FC<QuestionnaireEditorModalProps> = ({
  isOpen,
  onClose,
  template,
  onSaveSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [objective, setObjective] = useState('');
  const [orientation, setOrientation] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{ sectionId: string; question: Question } | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (template) {
      setTitle(template.title || 'QUESTIONÁRIO DE PRÉ-ENTREVISTA');
      setCompanyName(template.companyName || 'Fórmula Plus Farmácia de Manipulação');
      setObjective(template.objective || template.description || '');
      setOrientation(template.orientation || 'Responda com sinceridade.');
      setSections(template.sections || []);
      if (template.sections && template.sections.length > 0) {
        setActiveSectionId(template.sections[0].id);
      }
    }
  }, [template, isOpen]);

  if (!isOpen || !template) return null;

  // Re-number all questions sequentially across sections
  const renumberQuestions = (secs: Section[]): Section[] => {
    let globalCounter = 1;
    return secs.map((sec, secIdx) => ({
      ...sec,
      number: secIdx + 1,
      questions: sec.questions.map((q) => {
        const qNum = globalCounter++;
        return {
          ...q,
          number: qNum,
        };
      }),
    }));
  };

  // Add new section
  const handleAddSection = () => {
    const newSecNumber = sections.length + 1;
    const newSecId = `sec_${Date.now()}`;
    const newSection: Section = {
      id: newSecId,
      number: newSecNumber,
      title: `${newSecNumber}. NOVA SEÇÃO`,
      questions: [],
    };
    const updated = renumberQuestions([...sections, newSection]);
    setSections(updated);
    setActiveSectionId(newSecId);
  };

  // Delete section
  const handleDeleteSection = (secId: string) => {
    if (sections.length <= 1) {
      alert('O formulário precisa ter pelo menos 1 seção.');
      return;
    }
    if (confirm('Tem certeza que deseja remover esta seção e todas as suas perguntas?')) {
      const filtered = sections.filter((s) => s.id !== secId);
      const updated = renumberQuestions(filtered);
      setSections(updated);
      if (activeSectionId === secId && updated.length > 0) {
        setActiveSectionId(updated[0].id);
      }
    }
  };

  // Update section title
  const handleSectionTitleChange = (secId: string, newTitle: string) => {
    const updated = sections.map((sec) => (sec.id === secId ? { ...sec, title: newTitle } : sec));
    setSections(updated);
  };

  // Add question to active section
  const handleAddQuestion = (secId: string) => {
    const targetSec = sections.find((s) => s.id === secId);
    if (!targetSec) return;

    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      number: 0, // renumbered
      label: 'Digite a pergunta aqui...',
      type: 'textarea', // Default to digital text area
      required: true,
      options: ['Opção 1', 'Opção 2', 'Opção 3'],
    };

    const updated = sections.map((sec) => {
      if (sec.id === secId) {
        return {
          ...sec,
          questions: [...sec.questions, newQuestion],
        };
      }
      return sec;
    });

    const renumbered = renumberQuestions(updated);
    setSections(renumbered);
    
    // Find the newly added question in renumbered array to set editing state
    const currentSec = renumbered.find((s) => s.id === secId);
    if (currentSec && currentSec.questions.length > 0) {
      const addedQ = currentSec.questions[currentSec.questions.length - 1];
      setEditingQuestion({ sectionId: secId, question: addedQ });
    }
  };

  // Delete question
  const handleDeleteQuestion = (secId: string, qId: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === secId) {
        return {
          ...sec,
          questions: sec.questions.filter((q) => q.id !== qId),
        };
      }
      return sec;
    });
    setSections(renumberQuestions(updated));
    if (editingQuestion?.question.id === qId) {
      setEditingQuestion(null);
    }
  };

  // Save changes to question currently being edited
  const handleSaveEditedQuestion = (updatedQ: Question) => {
    if (!editingQuestion) return;
    const secId = editingQuestion.sectionId;

    const updated = sections.map((sec) => {
      if (sec.id === secId) {
        return {
          ...sec,
          questions: sec.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q)),
        };
      }
      return sec;
    });

    setSections(renumberQuestions(updated));
    setEditingQuestion(null);
  };

  // Save entire template to server
  const handleSaveTemplate = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const renumbered = renumberQuestions(sections);
      const res = await fetch(apiUrl(`/api/templates/${template.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          companyName,
          description: objective,
          orientation,
          sections: renumbered,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar alterações no formulário.');
      }

      setFeedback({ type: 'success', message: 'Modelo de questionário salvo com sucesso!' });
      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao salvar questionário.' });
    } finally {
      setSaving(false);
    }
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Editor de Questionário</h3>
              <p className="text-xs text-slate-500">Adicione, edite e escolha o tipo de resposta (texto para escrever ou múltipla escolha/check)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center space-x-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          
          {/* General Information Header Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Informações Gerais do Formulário</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Título do Questionário:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nome da Empresa:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Objetivo / Introdução:</label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Orientação ao Candidato:</label>
              <input
                type="text"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Sections & Questions Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Sections List Nav */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Seções ({sections.length})</span>
                </span>
                <button
                  onClick={handleAddSection}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Seção</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {sections.map((sec) => (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`p-3 rounded-lg text-xs font-semibold border cursor-pointer transition-all flex items-center justify-between ${
                      activeSectionId === sec.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {sec.number}
                      </span>
                      <span className="truncate">{sec.title}</span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({sec.questions.length})
                      </span>
                      {sections.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(sec.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          title="Excluir Seção"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Questions in Active Section */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              {activeSection ? (
                <>
                  {/* Section Title Editor Header */}
                  <div className="space-y-2 border-b border-slate-100 pb-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Título da Seção Selecionada:
                    </label>
                    <input
                      type="text"
                      value={activeSection.title}
                      onChange={(e) => handleSectionTitleChange(activeSection.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* List of Questions in Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Perguntas desta Seção ({activeSection.questions.length})
                      </h5>
                      <button
                        onClick={() => handleAddQuestion(activeSection.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Pergunta</span>
                      </button>
                    </div>

                    {activeSection.questions.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-500 font-medium">Nenhuma pergunta nesta seção.</p>
                        <button
                          onClick={() => handleAddQuestion(activeSection.id)}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          + Criar Primeira Pergunta
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeSection.questions.map((q) => {
                          const isEditing = editingQuestion?.question.id === q.id;

                          return (
                            <div
                              key={q.id}
                              className={`rounded-xl border p-4 transition-all ${
                                isEditing
                                  ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-200'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {isEditing ? (
                                /* Interactive Question Editor Form */
                                <QuestionForm
                                  question={editingQuestion.question}
                                  onSave={(updated) => handleSaveEditedQuestion(updated)}
                                  onCancel={() => setEditingQuestion(null)}
                                />
                              ) : (
                                /* Read-only Preview View of Question */
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                        Nº {q.number}
                                      </span>
                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                        q.type === 'radio' || q.type === 'checkbox' || q.type === 'select'
                                          ? 'bg-purple-100 text-purple-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}>
                                        {q.type === 'radio'
                                          ? 'Múltipla Escolha (Check/Radio)'
                                          : q.type === 'checkbox'
                                          ? 'Caixas de Seleção (Check)'
                                          : q.type === 'select'
                                          ? 'Lista de Seleção'
                                          : q.type === 'textarea'
                                          ? 'Texto Longo (Para Escrever Digital)'
                                          : 'Texto Curto (Para Escrever Digital)'}
                                      </span>
                                      {q.required && (
                                        <span className="text-[10px] text-rose-600 font-semibold">* Obrigt.</span>
                                      )}
                                    </div>

                                    <p className="text-xs font-bold text-slate-900 pt-1">{q.label}</p>

                                    {/* Options preview if check type */}
                                    {(q.type === 'radio' || q.type === 'checkbox' || q.type === 'select') && q.options && (
                                      <div className="flex flex-wrap gap-1.5 pt-1">
                                        {q.options.map((opt, idx) => (
                                          <span
                                            key={idx}
                                            className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded"
                                          >
                                            ☐ {opt}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-1 shrink-0">
                                    <button
                                      onClick={() => setEditingQuestion({ sectionId: activeSection.id, question: q })}
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                                      title="Editar Pergunta"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteQuestion(activeSection.id, q.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Excluir Pergunta"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  Selecione ou crie uma seção no painel à esquerda.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg text-xs hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg text-xs shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando Questionário...' : 'Salvar Alterações no Modelo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// Sub-component for Question Form Editor
interface QuestionFormProps {
  question: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, onSave, onCancel }) => {
  const [label, setLabel] = useState(question.label);
  const [type, setType] = useState<Question['type']>(question.type);
  const [required, setRequired] = useState(question.required ?? true);
  const [options, setOptions] = useState<string[]>(question.options || ['Opção 1', 'Opção 2', 'Opção 3']);
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    setOptions([...options, newOption.trim()]);
    setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      ...question,
      label,
      type,
      required,
      options: type === 'radio' || type === 'checkbox' || type === 'select' ? options : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="text-xs font-extrabold text-emerald-800">
          Editando Pergunta Nº {question.number}
        </span>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-600 font-semibold flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Resposta Obrigatória</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">Enunciado da Pergunta:</label>
        <textarea
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          rows={2}
          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Select Type: Digital vs Check */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Tipo de Campo / Resposta do Candidato:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          
          {/* Check/Choice Option */}
          <button
            type="button"
            onClick={() => setType('checkbox')}
            className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all ${
              type === 'checkbox' || type === 'radio' || type === 'select'
                ? 'bg-purple-50 text-purple-900 border-purple-300 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="w-4 h-4 rounded border border-purple-600 bg-purple-100 flex items-center justify-center text-[10px]">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold">Marcar (Check / Múltipla Escolha)</p>
              <p className="text-[10px] text-slate-500 font-normal">Candidato marca caixas de seleção</p>
            </div>
          </button>

          {/* Digital Text Option */}
          <button
            type="button"
            onClick={() => setType('textarea')}
            className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all ${
              type === 'textarea' || type === 'text'
                ? 'bg-blue-50 text-blue-900 border-blue-300 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="w-4 h-4 rounded border border-blue-600 bg-blue-100 flex items-center justify-center text-[10px]">
              ✎
            </div>
            <div>
              <p className="text-xs font-bold">Para Escrever (Texto Digital)</p>
              <p className="text-[10px] text-slate-500 font-normal">Candidato digita a resposta em texto</p>
            </div>
          </button>

        </div>
      </div>

      {/* Sub-type selection if Check */}
      {(type === 'checkbox' || type === 'radio' || type === 'select') && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-700">
            <span>Subtipo de seleção:</span>
            <label className="inline-flex items-center space-x-1 cursor-pointer">
              <input
                type="radio"
                name="subtype"
                checked={type === 'checkbox'}
                onChange={() => setType('checkbox')}
              />
              <span>Várias Seleções (Checkbox)</span>
            </label>
            <label className="inline-flex items-center space-x-1 cursor-pointer">
              <input
                type="radio"
                name="subtype"
                checked={type === 'radio'}
                onChange={() => setType('radio')}
              />
              <span>Escolha Única (Radio)</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Opções de Escolha:</label>
            <div className="space-y-1.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">☐</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[idx] = e.target.value;
                      setOptions(copy);
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remover opção"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Nova opção..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded text-xs font-bold"
              >
                + Adicionar Opção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
        >
          Concluir Edição da Pergunta
        </button>
      </div>
    </div>
  );
};
