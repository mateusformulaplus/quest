import { FormTemplateData } from '../types';

export const FORMULA_PLUS_QUESTIONNAIRE: FormTemplateData = {
  title: 'QUESTIONÁRIO DE PRÉ-ENTREVISTA',
  companyName: 'Fórmula Plus Farmácia de Manipulação',
  objective: 'Conhecer melhor o perfil profissional do candidato antes da entrevista presencial ou online.',
  orientation: 'Responda às perguntas com sinceridade. As informações serão utilizadas exclusivamente para fins de recrutamento e seleção.',
  sections: [
    {
      id: 'sec_1',
      number: 1,
      title: '1. DADOS DO CANDIDATO',
      questions: [
        { id: 'q1', number: 1, label: 'Nome completo:', type: 'text', required: true },
        { id: 'q2', number: 2, label: 'Telefone:', type: 'text', placeholder: '______________', required: true },
        { id: 'q3', number: 3, label: 'E-mail:', type: 'email', placeholder: '_________________', required: true },
        { id: 'q4', number: 4, label: 'Vaga pretendida:', type: 'text', placeholder: '_____________', required: true },
      ]
    },
    {
      id: 'sec_2',
      number: 2,
      title: '2. EXPERIÊNCIA PROFISSIONAL',
      questions: [
        {
          id: 'q5',
          number: 1,
          label: 'Resuma sua experiência profissional relacionada à vaga:',
          type: 'textarea',
          required: true
        },
        {
          id: 'q6',
          number: 2,
          label: 'Qual foi seu último trabalho e quais eram suas principais atividades?',
          type: 'textarea',
          required: true
        },
        {
          id: 'q7',
          number: 3,
          label: 'Você possui experiência com:',
          type: 'checkbox',
          options: [
            'Atendimento ao cliente',
            'Vendas',
            'Metas comerciais',
            'Administração',
            'Estoque/organização',
            'Área farmacêutica',
            'Outro'
          ],
          hasOtherText: true,
          required: true
        }
      ]
    },
    {
      id: 'sec_3',
      number: 3,
      title: '3. PERFIL PROFISSIONAL',
      questions: [
        {
          id: 'q8',
          number: 4,
          label: 'Como você se avalia em atendimento ao cliente?',
          type: 'radio',
          options: ['Excelente', 'Muito bom', 'Bom', 'Preciso melhorar'],
          required: true
        },
        {
          id: 'q9',
          number: 5,
          label: 'Você já trabalhou com metas ou objetivos de desempenho?',
          type: 'radio',
          options: ['Sim', 'Não'],
          hasFollowUpText: true,
          followUpLabel: 'Se sim, explique brevemente:',
          required: true
        },
        {
          id: 'q10',
          number: 6,
          label: 'Como você lidaria com um cliente insatisfeito?',
          type: 'textarea',
          required: true
        },
        {
          id: 'q11',
          number: 7,
          label: 'Cite três qualidades profissionais que você considera seus pontos fortes:',
          type: 'textarea',
          required: true
        }
      ]
    },
    {
      id: 'sec_4',
      number: 4,
      title: '4. COMPORTAMENTO E EQUIPE',
      questions: [
        {
          id: 'q12',
          number: 8,
          label: 'Como você reage quando recebe uma crítica ou correção no trabalho?',
          type: 'textarea',
          required: true
        },
        {
          id: 'q13',
          number: 9,
          label: 'Quando você não sabe realizar uma tarefa, o que costuma fazer?',
          type: 'textarea',
          required: true
        },
        {
          id: 'q14',
          number: 10,
          label: 'Você prefere trabalhar:',
          type: 'radio',
          options: ['Individualmente', 'Em equipe', 'Ambos, dependendo da atividade'],
          required: true
        }
      ]
    },
    {
      id: 'sec_5',
      number: 5,
      title: '5. DISPONIBILIDADE E EXPECTATIVAS',
      questions: [
        {
          id: 'q15',
          number: 11,
          label: 'Qual sua disponibilidade de horário?',
          type: 'textarea',
          required: true
        },
        {
          id: 'q16',
          number: 12,
          label: 'Qual sua pretensão salarial?',
          type: 'text',
          placeholder: 'R$ ___________',
          required: true
        },
        {
          id: 'q17',
          number: 13,
          label: 'Por que você tem interesse em trabalhar na Fórmula Plus?',
          type: 'textarea',
          required: true
        },
        {
          id: 'q18',
          number: 14,
          label: 'Por que deveríamos considerar você para esta vaga?',
          type: 'textarea',
          required: true
        }
      ]
    }
  ]
};
