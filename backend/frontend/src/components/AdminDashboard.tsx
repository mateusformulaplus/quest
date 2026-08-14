import React, { useState, useEffect } from 'react';
import {
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Mail,
  Trash2,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
  Award,
  Sparkles,
  Users,
  Edit3,
  Printer,
  Upload
} from 'lucide-react';
import { FormSubmissionItem, FormLinkItem, FormTemplateItem } from '../types';
import { FORMULA_PLUS_QUESTIONNAIRE } from '../data/questionnaireTemplate';
import { generateSubmissionPDF } from '../utils/pdfGenerator';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { EmailSendModal } from './EmailSendModal';
import { QuestionnaireEditorModal } from './QuestionnaireEditorModal';
import { PrintFormModal } from './PrintFormModal';
import { UploadHandwrittenModal } from './UploadHandwrittenModal';
import { apiUrl } from '../config';

interface AdminDashboardProps {
  activeTab: 'dashboard' | 'links' | 'templates';
  setActiveTab: (tab: 'dashboard' | 'links' | 'templates') => void;
  onOpenNewLinkModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLinkModal,
}) => {
  const [submissions, setSubmissions] = useState<FormSubmissionItem[]>([]);
  const [links, setLinks] = useState<FormLinkItem[]>([]);
  const [templates, setTemplates] = useState<FormTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRecommendation, setFilterRecommendation] = useState<string>('ALL');

  // Selected Submission Modals
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [emailModalSubmission, setEmailModalSubmission] = useState<FormSubmissionItem | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // New Modals for Editing, Printing, and Uploading Handwritten PDF
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, linksRes, tplRes] = await Promise.all([
        fetch(apiUrl('/api/submissions')),
        fetch(apiUrl('/api/forms')),
        fetch(apiUrl('/api/templates')),
      ]);

      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubmissions(subsData);
      }

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setLinks(linksData);
      }

      if (tplRes.ok) {
        const tplData = await tplRes.json();
        setTemplates(tplData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateSubmission = (updated: FormSubmissionItem) => {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (selectedSubmission?.id === updated.id) {
      setSelectedSubmission(updated);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/submissions/${id}`), { method: 'DELETE' });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      alert('Erro ao excluir resposta');
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Deseja excluir este link permanentemente?')) return;
    try {
      const res = await fetch(apiUrl(`/api/forms/${id}`), { method: 'DELETE' });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      alert('Erro ao excluir link');
    }
  };

  const copyShortLink = (code: string, linkId: string) => {
    const url = `${window.location.origin}/f/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 3000);
  };

  // Metrics
  const totalSubmissions = submissions.length;
  const totalLinks = links.length;
  const recommendedCount = submissions.filter(
    (s) => s.companyEvaluation?.recommendation === 'SIM'
  ).length;
  const pendingEvaluationCount = submissions.filter((s) => !s.evaluated).length;

  // Filtered Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.candidatePosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterRecommendation === 'ALL') return matchesSearch;
    if (filterRecommendation === 'RECOMMENDED')
      return matchesSearch && sub.companyEvaluation?.recommendation === 'SIM';
    if (filterRecommendation === 'NOT_RECOMMENDED')
      return matchesSearch && sub.companyEvaluation?.recommendation === 'NAO';
    if (filterRecommendation === 'PENDING')
      return matchesSearch && !sub.evaluated;

    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome & Quick Overview Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard de Recrutamento</h1>
          <p className="text-slate-500 text-sm">Acompanhe e gerencie os questionários de pré-entrevista digitais e impressos.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsEditorModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg font-medium text-xs transition-colors shadow-2xs"
            title="Editar perguntas, seções e tipos de resposta (check / escrever)"
          >
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span>Editar Questionário</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg font-medium text-xs transition-colors shadow-2xs"
            title="Imprimir modelo para preenchimento manual em papel"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir para Papel</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold text-xs transition-colors shadow-2xs"
            title="Cadastrar questionário preenchido à mão e anexar PDF"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Anexar PDF Manuscrito</span>
          </button>

          <button
            onClick={onOpenNewLinkModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium shadow-sm hover:bg-emerald-700 transition-colors text-xs"
          >
            <span className="text-base leading-none">+</span>
            <span>Gerar Novo Link</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Respostas</p>
            <p className="text-2xl font-bold text-slate-900">{totalSubmissions}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Links Gerados</p>
            <p className="text-2xl font-bold text-slate-900">{totalLinks}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <LinkIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Recomendados (SIM)</p>
            <p className="text-2xl font-bold text-emerald-600">{recommendedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Aguardando Avaliação</p>
            <p className="text-2xl font-bold text-orange-500">{pendingEvaluationCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </section>

      {/* Main Tab Views */}
      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
          
          {/* Table Header Controls */}
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Questionários Respondidos pelos Candidatos</span>
              </h2>
              <p className="text-xs text-slate-500">
                Clique em um candidato para ver o questionário completo (41 questões) e preencher a avaliação do RH.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, vaga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <select
                value={filterRecommendation}
                onChange={(e) => setFilterRecommendation(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Todas as Respostas</option>
                <option value="RECOMMENDED">✓ Recomendados (SIM)</option>
                <option value="NOT_RECOMMENDED">✕ Não Recomendados</option>
                <option value="PENDING">⏱ Pendentes Avaliação</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Carregando formulários...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-sm font-bold text-slate-700">Nenhum questionário encontrado.</p>
                <p className="text-xs text-slate-500">Gere um link para os candidatos preencherem o formulário.</p>
                <button
                  onClick={onOpenNewLinkModal}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Gerar Novo Link
                </button>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-y border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Candidato</th>
                    <th className="px-6 py-3">Vaga Pretendida</th>
                    <th className="px-6 py-3">Contato</th>
                    <th className="px-6 py-3">Data de Envio</th>
                    <th className="px-6 py-3">Parecer do RH</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                  {filteredSubmissions.map((sub) => {
                    const rec = sub.companyEvaluation?.recommendation;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* Candidate Name */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setIsDetailModalOpen(true);
                              }}
                              className="font-semibold text-sm text-slate-900 hover:text-emerald-600 text-left"
                            >
                              {sub.candidateName}
                            </button>
                            <span className="text-xs text-slate-400 italic">{sub.candidateEmail || 'Sem e-mail'}</span>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {sub.candidatePosition}
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {sub.candidatePhone || 'N/A'}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                          {new Date(sub.submittedAt).toLocaleDateString('pt-BR')}
                        </td>

                        {/* RH Recommendation Badge */}
                        <td className="px-6 py-4">
                          {rec === 'SIM' ? (
                            <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-700">
                              Recomendado
                            </span>
                          ) : rec === 'NAO' ? (
                            <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-700">
                              Não Recomendado
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-orange-100 text-orange-700">
                              Pendente
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setIsDetailModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center space-x-1"
                              title="Ver respostas e realizar avaliação de RH"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Avaliar</span>
                            </button>

                            <button
                              onClick={() => generateSubmissionPDF(sub)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                              title="Baixar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEmailModalSubmission(sub)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Enviar E-mail"
                            >
                              <Mail className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteSubmission(sub.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: Generated Form Links */}
      {activeTab === 'links' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <LinkIcon className="w-5 h-5 text-emerald-600" />
                <span>Links de Formulário Gerados</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compartilhe estes links com os candidatos via WhatsApp ou e-mail.
              </p>
            </div>

            <button
              onClick={onOpenNewLinkModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              + Criar Novo Link
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => {
              const fullUrl = `${window.location.origin}/f/${link.code}`;
              const isCopied = copiedLinkId === link.id;

              return (
                <div
                  key={link.id}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 relative hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {link.targetPosition}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-2">
                        {link.candidateName ? `Candidato: ${link.candidateName}` : 'Link Aberto para Candidatos'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      link.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {link.status === 'COMPLETED' ? 'Preenchido' : 'Pendente'}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={fullUrl}
                      className="flex-1 text-xs font-mono text-slate-700 bg-transparent focus:outline-none select-all"
                    />

                    <button
                      onClick={() => copyShortLink(link.code, link.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-bold hover:underline inline-flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Testar Link</span>
                    </a>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-slate-400 hover:text-rose-600 font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Templates */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Gerenciador do Questionário de Pré-Entrevista</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Edite perguntas, altere tipos de resposta (digital ou check) e imprima vias físicas para candidatos.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditorModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Perguntas do Questionário</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  Modelo Ativo Padrão
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {templates[0]?.title || FORMULA_PLUS_QUESTIONNAIRE.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {templates[0]?.companyName || FORMULA_PLUS_QUESTIONNAIRE.companyName} • {templates[0]?.sections?.length || 10} Seções
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors border border-slate-200 flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Imprimir Modelo Físico</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors border border-emerald-300 flex items-center space-x-1.5"
                >
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Anexar Resposta Manuscrita</span>
                </button>

                <button
                  onClick={onOpenNewLinkModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Gerar Link Digital
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
              {(templates[0]?.sections || FORMULA_PLUS_QUESTIONNAIRE.sections).map((sec) => (
                <div key={sec.id} className="bg-white p-3 rounded-xl border border-slate-200 font-semibold text-slate-700 flex items-center justify-between">
                  <span className="truncate">{sec.title}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1 shrink-0">
                    {sec.questions.length} Q
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submission Detail & HR Evaluation Modal */}
      <SubmissionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        submission={selectedSubmission}
        onUpdateSubmission={handleUpdateSubmission}
        onDeleteSubmission={handleDeleteSubmission}
      />

      {/* Email Sender Modal */}
      <EmailSendModal
        isOpen={!!emailModalSubmission}
        onClose={() => setEmailModalSubmission(null)}
        submission={emailModalSubmission}
      />

      {/* Questionnaire Interactive Editor Modal */}
      <QuestionnaireEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        template={templates[0] || ({ ...FORMULA_PLUS_QUESTIONNAIRE, id: 'default' } as any)}
        onSaveSuccess={fetchData}
      />

      {/* Printable Paper Form Modal */}
      <PrintFormModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        template={templates[0] || FORMULA_PLUS_QUESTIONNAIRE}
      />

      {/* Upload Handwritten Questionnaire PDF Modal */}
      <UploadHandwrittenModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={fetchData}
      />
    </div>
  );
};
