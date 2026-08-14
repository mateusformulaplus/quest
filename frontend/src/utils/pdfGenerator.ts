import { jsPDF } from 'jspdf';
import { FORMULA_PLUS_QUESTIONNAIRE } from '../data/questionnaireTemplate';
import { FormSubmissionItem } from '../types';

function loadLogoPng(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 500, 160);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch (e) {
        console.error('Error rendering logo for PDF:', e);
      }
      resolve('');
    };
    img.onerror = () => resolve('');
    img.src = '/logo.png';
  });
}

export async function generateSubmissionPDF(submission: FormSubmissionItem) {
  const logoPngDataUrl = await loadLogoPng();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  function checkNewPage(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      addHeaderFooter();
    }
  }

  function addHeaderFooter() {
    // Header banner
    doc.setFillColor(6, 95, 70); // Emerald 800
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('FÓRMULA PLUS - FARMÁCIA DE MANIPULAÇÃO | QUESTIONÁRIO DE PRÉ-ENTREVISTA', pageWidth / 2, 8, { align: 'center' });

    // Page Number
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Página ${pageCount}`, pageWidth - margin - 15, pageHeight - 8);
  }

  addHeaderFooter();
  y = 18;

  // Logo + Title block
  if (logoPngDataUrl) {
    try {
      const logoWidth = 36;
      const logoHeight = 14;
      doc.addImage(logoPngDataUrl, 'PNG', (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
      y += 16;
    } catch (e) {
      console.warn('Could not draw logo on PDF:', e);
    }
  }

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('QUESTIONÁRIO DE PRÉ-ENTREVISTA', pageWidth / 2, y + 5, { align: 'center' });
  y += 10;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Fórmula Plus Farmácia de Manipulação', pageWidth / 2, y + 5, { align: 'center' });
  y += 13;

  // Candidate Overview Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 2, 2, 'S');

  const submitDateStr = submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('pt-BR') : submission.signatureDate;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Candidato: ${submission.candidateName}`, margin + 5, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Vaga Pretendida: ${submission.candidatePosition}`, margin + 5, y + 12);
  doc.text(`Telefone: ${submission.candidatePhone || 'N/A'}  |  E-mail: ${submission.candidateEmail || 'N/A'}`, margin + 5, y + 18);
  doc.text(`Data de Envio: ${submitDateStr}`, pageWidth - margin - 42, y + 6);

  y += 28;

  // Iterate over all questionnaire sections
  const sections = FORMULA_PLUS_QUESTIONNAIRE.sections;

  sections.forEach((sec) => {
    checkNewPage(18);

    // Section Header
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(6, 95, 70);
    doc.text(sec.title, margin + 4, y + 5.5);
    y += 11;

    sec.questions.forEach((q) => {
      const rawAns = submission.answers[q.id];
      let ansStr = 'Não respondido';

      if (rawAns !== undefined && rawAns !== null) {
        if (typeof rawAns === 'object') {
          if (Array.isArray(rawAns)) {
            ansStr = rawAns.join(', ');
          } else if (rawAns.value) {
            ansStr = rawAns.value;
            if (rawAns.details) ansStr += ` (${rawAns.details})`;
          } else {
            ansStr = JSON.stringify(rawAns);
          }
        } else {
          ansStr = String(rawAns);
        }
      }

      const qTitleText = `${q.number}. ${q.label}`;
      const splitQuestion = doc.splitTextToSize(qTitleText, pageWidth - 2 * margin - 6);
      const splitAnswer = doc.splitTextToSize(`R: ${ansStr}`, pageWidth - 2 * margin - 10);

      const blockHeight = (splitQuestion.length * 4) + (splitAnswer.length * 4) + 5;
      checkNewPage(blockHeight);

      // Question text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(splitQuestion, margin + 2, y);
      y += (splitQuestion.length * 4.2);

      // Answer text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(6, 95, 70);
      doc.text(splitAnswer, margin + 6, y);
      y += (splitAnswer.length * 4.2) + 3;
    });

    y += 3;
  });

  // Candidate Declaration & Signature Section
  checkNewPage(40);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 32, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('DECLARAÇÃO E ASSINATURA DO CANDIDATO', margin + 5, y + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Declaro que as informações fornecidas neste questionário são verdadeiras e prestadas voluntariamente.', margin + 5, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Nome Assinado: ${submission.signatureName}`, margin + 5, y + 18);
  doc.text(`Data: ${submission.signatureDate}`, margin + 5, y + 24);

  if (submission.signatureData && submission.signatureData.startsWith('data:image')) {
    try {
      doc.addImage(submission.signatureData, 'PNG', pageWidth - margin - 45, y + 10, 40, 15);
    } catch (e) {
      doc.setFont('helvetica', 'italic');
      doc.text('[Assinatura Digital]', pageWidth - margin - 40, y + 20);
    }
  }

  y += 38;

  // HR Exclusive Company Evaluation Section ("USO EXCLUSIVO DA EMPRESA")
  checkNewPage(65);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70);
  doc.text('USO EXCLUSIVO DA EMPRESA - AVALIAÇÃO DE RH', margin + 4, y + 5.5);
  y += 12;

  const evalData = submission.companyEvaluation;
  if (evalData && evalData.criteria) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);

    const criteriaLabels: { [key: string]: string } = {
      experienciaProfissional: 'Experiência profissional',
      comunicacao: 'Comunicação',
      perfilComercial: 'Perfil comercial',
      atendimento: 'Atendimento',
      organizacao: 'Organização',
      trabalhoEmEquipe: 'Trabalho em equipe',
      maturidadeProfissional: 'Maturidade profissional',
      orientacaoResultados: 'Orientação para resultados',
      compatibilidadeVaga: 'Compatibilidade com a vaga',
    };

    const keys = Object.keys(criteriaLabels);
    let col = 0;
    let startY = y;

    keys.forEach((key) => {
      const label = criteriaLabels[key];
      const val = evalData.criteria[key as keyof typeof evalData.criteria] || 'Não avaliado';
      const xPos = margin + (col * (pageWidth - 2 * margin) / 2);

      doc.setFont('helvetica', 'normal');
      doc.text(`${label}:`, xPos + 2, startY);
      doc.setFont('helvetica', 'bold');
      
      if (val === 'Alta') doc.setTextColor(5, 150, 105);
      else if (val === 'Média') doc.setTextColor(217, 119, 6);
      else doc.setTextColor(100, 116, 139);

      doc.text(val, xPos + 55, startY);
      doc.setTextColor(15, 23, 42);

      col++;
      if (col >= 2) {
        col = 0;
        startY += 6;
      }
    });

    y = startY + 8;

    // Recommendation
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Candidato recomendado para entrevista:', margin + 2, y);
    
    const rec = evalData.recommendation;
    let recText = 'Aguardando avaliação';
    if (rec === 'SIM') recText = '[ X ] SIM - Recomendado';
    else if (rec === 'NAO') recText = '[ X ] NÃO - Não recomendado';
    else if (rec === 'AVALIAR_MELHOR') recText = '[ X ] Avaliar melhor';

    doc.setTextColor(6, 95, 70);
    doc.text(recText, margin + 70, y);
    doc.setTextColor(15, 23, 42);
    y += 8;

    // Interviewer Notes
    if (evalData.interviewerNotes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observações do Entrevistador:', margin + 2, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const splitNotes = doc.splitTextToSize(evalData.interviewerNotes, pageWidth - 2 * margin - 10);
      doc.text(splitNotes, margin + 4, y);
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Formulário ainda não avaliado pelo setor de RH.', margin + 4, y);
  }

  // Save PDF
  const filename = `Questionario_${submission.candidateName.replace(/\s+/g, '_')}_FormulaPlus.pdf`;
  doc.save(filename);
}
