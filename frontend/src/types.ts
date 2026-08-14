export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  number: number;
  label: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'email' | 'select';
  options?: string[];
  hasOtherText?: boolean;
  hasFollowUpText?: boolean;
  followUpLabel?: string;
  placeholder?: string;
  required?: boolean;
}

export interface Section {
  id: string;
  number: number;
  title: string;
  description?: string;
  questions: Question[];
}

export interface FormTemplateData {
  title: string;
  companyName: string;
  objective: string;
  orientation: string;
  sections: Section[];
}

export interface FormTemplateItem extends FormTemplateData {
  id: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateAnswers {
  [questionId: string]: any; // string, string[], or { value: string, details?: string }
}

export type EvaluationRating = 'Baixa' | 'Média' | 'Alta';

export interface CompanyEvaluationCriteria {
  experienciaProfissional?: EvaluationRating;
  comunicacao?: EvaluationRating;
  perfilComercial?: EvaluationRating;
  atendimento?: EvaluationRating;
  organizacao?: EvaluationRating;
  trabalhoEmEquipe?: EvaluationRating;
  maturidadeProfissional?: EvaluationRating;
  orientacaoResultados?: EvaluationRating;
  compatibilidadeVaga?: EvaluationRating;
}

export type RecommendationType = 'SIM' | 'NAO' | 'AVALIAR_MELHOR';

export interface CompanyEvaluation {
  criteria: CompanyEvaluationCriteria;
  recommendation: RecommendationType;
  interviewerNotes: string;
  evaluatedAt?: string;
  evaluatorName?: string;
}

export interface FormLinkItem {
  id: string;
  code: string;
  formTemplateId: string;
  targetPosition: string;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  expiresAt?: string | null;
  createdAt: string;
  submissionCount?: number;
}

export interface FormSubmissionItem {
  id: string;
  formLinkId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidatePosition: string;
  answers: CandidateAnswers;
  signatureName: string;
  signatureData?: string | null;
  signatureDate: string;
  submittedAt: string;
  evaluated: boolean;
  companyEvaluation?: CompanyEvaluation | null;
  formLink?: FormLinkItem;
}

export interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface EmailSendRequest {
  toEmail: string;
  subject: string;
  messageText: string;
  includePdfAttachment?: boolean;
}
