import React, { useState } from 'react';
import { X, Printer, User, Pill, FileText, Check } from 'lucide-react';
import { FormTemplateData } from '../types';

interface PrintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: FormTemplateData;
}

export const PrintFormModal: React.FC<PrintFormModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [printMode, setPrintMode] = useState<'generic' | 'personalized'>('generic');

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    // Create printable window content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita popups para abrir a janela de impressão.');
      return;
    }

    const nameText = printMode === 'personalized' && candidateName.trim() ? candidateName.trim() : '___________________________________________________';
    const positionText = printMode === 'personalized' && targetPosition.trim() ? targetPosition.trim() : '____________________________________';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Questionário de Pré-Entrevista - Fórmula Plus</title>
        <style>
          @page { size: A4; margin: 8mm; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            color: #1e293b;
            line-height: 1.2;
            margin: 0;
            padding: 0;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #059669;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .company-name { font-size: 13pt; font-weight: bold; color: #065f46; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 11.5pt; font-weight: bold; margin-top: 4px; color: #0f172a; }
          .subtitle { font-size: 8.5pt; color: #64748b; margin-top: 4px; font-style: italic; }

          .candidate-info-box {
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            padding: 8px 10px;
            border-radius: 6px;
            margin-bottom: 12px;
            font-size: 9.3pt;
          }
          .candidate-field { margin-bottom: 4px; font-weight: bold; }
          .field-value { font-weight: normal; }

          .section { margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid; }
          .section-title {
            font-size: 9.2pt;
            font-weight: bold;
            background-color: #f1f5f9;
            padding: 4px 8px;
            border-left: 4px solid #059669;
            margin-bottom: 8px;
            text-transform: uppercase;
            color: #0f172a;
          }

          .question { margin-bottom: 8px; page-break-inside: avoid; break-inside: avoid; }
          .q-num { font-weight: bold; color: #047857; margin-right: 4px; }
          .q-label { font-weight: bold; }

          .writing-lines { margin-top: 4px; }
          .line { border-bottom: 1px solid #cbd5e1; height: 16px; margin-bottom: 3px; }
          .line.long { height: 15px; }

          .options-grid {
            margin-top: 4px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 4px 12px;
            font-size: 9.2pt;
          }
          .option-box { display: flex; align-items: center; gap: 6px; }
          .checkbox-square { width: 10px; height: 10px; border: 1.5px solid #475569; border-radius: 2px; display: inline-block; }

          .declaration-box {
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 9.1pt;
            margin-top: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .evaluation-box {
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 8px;
            padding: 8px 10px;
            margin-top: 10px;
            font-size: 8.9pt;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .evaluation-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 12px;
            margin-top: 6px;
          }
          .evaluation-row { display: flex; align-items: center; gap: 6px; }
          .checkbox { width: 11px; height: 11px; border: 1.5px solid #475569; border-radius: 2px; display: inline-block; }

          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/logo.png" alt="Fórmula Plus Logo" style="height: 52px; width: auto; margin-bottom: 8px;" />
          <div class="title">${template.title}</div>
          <div class="subtitle">${template.objective ?? 'Fórmula Plus'}</div>
        </div>

        <div class="candidate-info-box">
          <div class="candidate-field">NOME DO CANDIDATO: <span class="field-value">${nameText}</span></div>
          <div class="candidate-field">VAGA PRETENDIDA: <span class="field-value">${positionText}</span></div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <div>TELEFONE: ________________________</div>
            <div>DATA: ____/____/2026</div>
          </div>
        </div>

        ${template.sections
          .map(
            (sec) => `
          <div class="section">
            <div class="section-title">${sec.title}</div>
            ${sec.questions
              .map(
                (q) => `
              <div class="question">
                <div><span class="q-num">${q.number}.</span> <span class="q-label">${q.label}</span></div>
                ${
                  q.type === 'radio' || q.type === 'checkbox' || q.type === 'select'
                    ? `<div class="options-grid">
                        ${(q.options || [])
                          .map(
                            (opt) => `
                          <div class="option-box">
                            <span class="checkbox-square"></span>
                            <span>${opt}</span>
                          </div>
                        `
                          )
                          .join('')}
                       </div>
                       ${
                         q.hasOtherText
                           ? '<div style="margin-top: 6px; font-size: 9.5pt;">Outro: __________________________________________________</div>'
                           : ''
                       }
                      `
                    : `<div class="writing-lines">
                        <div class="line"></div>
                        <div class="line"></div>
                        ${q.type === 'textarea'
                          ? `${Array.from({ length: sec.number >= 2 ? 4 : 3 })
                              .map(() => '<div class="line long"></div>')
                              .join('')}`
                          : ''}
                       </div>`
                }
              </div>
            `
              )
              .join('')}
          </div>
        `
          )
          .join('')}

        <div class="declaration-box">
          <div style="font-weight: bold; margin-bottom: 8px;">DECLARAÇÃO DO CANDIDATO</div>
          <p style="margin: 0 0 8px 0;">
            Declaro que as informações fornecidas neste questionário são verdadeiras e foram prestadas voluntariamente para participação no processo seletivo.
          </p>
          <p style="margin: 0 0 8px 0;">
            Estou ciente de que os dados fornecidos serão utilizados para fins relacionados ao processo de recrutamento e seleção, observadas as normas aplicáveis de proteção de dados pessoais.
          </p>
          <div style="margin-top: 10px;">Nome: ___________________________________________</div>
          <div style="margin-top: 10px;">Data: ____ / ____ / ______</div>
          <div style="margin-top: 10px;">Assinatura: _______________________________________</div>
        </div>

        <div class="evaluation-box">
          <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">USO EXCLUSIVO DA EMPRESA</div>
          <div style="font-weight: bold; margin-bottom: 8px;">Avaliação inicial</div>
          <div class="evaluation-grid">
            <div><strong>Experiência profissional</strong><div class="evaluation-row"><span class="checkbox"></span> Baixa</div><div class="evaluation-row"><span class="checkbox"></span> Média</div><div class="evaluation-row"><span class="checkbox"></span> Alta</div></div>
            <div><strong>Comunicação</strong><div class="evaluation-row"><span class="checkbox"></span> Baixa</div><div class="evaluation-row"><span class="checkbox"></span> Média</div><div class="evaluation-row"><span class="checkbox"></span> Alta</div></div>
            <div><strong>Perfil comercial</strong><div class="evaluation-row"><span class="checkbox"></span> Baixo</div><div class="evaluation-row"><span class="checkbox"></span> Médio</div><div class="evaluation-row"><span class="checkbox"></span> Alto</div></div>
            <div><strong>Atendimento</strong><div class="evaluation-row"><span class="checkbox"></span> Baixo</div><div class="evaluation-row"><span class="checkbox"></span> Médio</div><div class="evaluation-row"><span class="checkbox"></span> Alto</div></div>
            <div><strong>Organização</strong><div class="evaluation-row"><span class="checkbox"></span> Baixa</div><div class="evaluation-row"><span class="checkbox"></span> Média</div><div class="evaluation-row"><span class="checkbox"></span> Alta</div></div>
            <div><strong>Trabalho em equipe</strong><div class="evaluation-row"><span class="checkbox"></span> Baixo</div><div class="evaluation-row"><span class="checkbox"></span> Médio</div><div class="evaluation-row"><span class="checkbox"></span> Alto</div></div>
            <div><strong>Maturidade profissional</strong><div class="evaluation-row"><span class="checkbox"></span> Baixa</div><div class="evaluation-row"><span class="checkbox"></span> Média</div><div class="evaluation-row"><span class="checkbox"></span> Alta</div></div>
            <div><strong>Orientação para resultados</strong><div class="evaluation-row"><span class="checkbox"></span> Baixa</div><div class="evaluation-row"><span class="checkbox"></span> Média</div><div class="evaluation-row"><span class="checkbox"></span> Alta</div></div>
            <div><strong>Compatibilidade com a vaga</strong><div class="evaluation-row"><span class="checkbox"></span> Baixa</div><div class="evaluation-row"><span class="checkbox"></span> Média</div><div class="evaluation-row"><span class="checkbox"></span> Alta</div></div>
          </div>

          <div style="margin-top: 12px; font-weight: bold;">Candidato recomendado para entrevista:</div>
          <div class="evaluation-row" style="margin-top: 6px;"><span class="checkbox"></span> Sim</div>
          <div class="evaluation-row"><span class="checkbox"></span> Não</div>
          <div class="evaluation-row"><span class="checkbox"></span> Avaliar melhor</div>

          <div style="margin-top: 12px; font-weight: bold;">Observações do entrevistador:</div>
          <div style="border-bottom: 1px solid #cbd5e1; margin-top: 8px; height: 26px;"></div>
          <div style="border-bottom: 1px solid #cbd5e1; margin-top: 8px; height: 26px;"></div>
          <div style="border-bottom: 1px solid #cbd5e1; margin-top: 8px; height: 26px;"></div>
        </div>

   
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Imprimir Questionário Físico</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Imprima o modelo em papel para o candidato preencher à mão durante a entrevista presencial.
          </p>

          {/* Print Mode Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPrintMode('generic')}
              className={`p-3 rounded-xl border text-left transition-all ${
                printMode === 'generic'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-5 h-5 text-emerald-600 mb-1" />
              <p className="text-xs font-bold">Modelo em Branco</p>
              <p className="text-[10px] text-slate-500 font-normal">Para qualquer candidato</p>
            </button>
{/* 
            <button
              type="button"
              onClick={() => setPrintMode('personalized')}
              className={`p-3 rounded-xl border text-left transition-all ${
                printMode === 'personalized'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-5 h-5 text-emerald-600 mb-1" />
              <p className="text-xs font-bold">Para Candidato Específico</p>
              <p className="text-[10px] text-slate-500 font-normal">Preenche o nome no topo</p>
            </button> */}
          </div>

          {/* Conditional Personalized Inputs */}
          {printMode === 'personalized' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Candidato:</label>
                <input
                  type="text"
                  placeholder="Ex: Maria Eduarda Santos"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vaga Pretendida:</label>
                <input
                  type="text"
                  placeholder="Ex: Atendente de Farmácia"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 flex items-start space-x-2 text-xs text-emerald-800">
            <Pill className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              O documento gerado incluirá as linhas para escrita à mão, caixas para marcação e a folha de rosto oficial da Fórmula Plus.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleTriggerPrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg text-xs shadow-sm flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Gerar / Imprimir PDF em Papel</span>
          </button>
        </div>

      </div>
    </div>
  );
};
