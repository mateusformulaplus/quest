import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { FORMULA_PLUS_QUESTIONNAIRE } from './src/data/questionnaireTemplate.js';

dotenv.config();

const DEFAULT_ADMIN = {
  email: 'adm@formulaplus.com',
  password: 'formulaplus',
  name: 'Administrador Fórmula Plus',
};

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper function to generate unique 7-char alphanumeric code for short links
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Seed initial database records
async function initSeed() {
  try {
    const adminExists = await prisma.adminUser.findUnique({
      where: { email: DEFAULT_ADMIN.email },
    });

    if (!adminExists) {
      await prisma.adminUser.create({
        data: {
          email: DEFAULT_ADMIN.email,
          password: DEFAULT_ADMIN.password,
          name: DEFAULT_ADMIN.name,
          role: 'ADMIN',
        },
      });
      console.log(`✅ Default admin user created: ${DEFAULT_ADMIN.email}`);
    } else {
      await prisma.adminUser.update({
        where: { email: DEFAULT_ADMIN.email },
        data: {
          password: DEFAULT_ADMIN.password,
          name: DEFAULT_ADMIN.name,
          role: 'ADMIN',
        },
      });
      console.log(`✅ Default admin user ensured: ${DEFAULT_ADMIN.email}`);
    }

    const existingTemplates = await prisma.formTemplate.findMany();

    if (existingTemplates.length > 0) {
      await prisma.formTemplate.updateMany({
        data: {
          title: FORMULA_PLUS_QUESTIONNAIRE.title,
          description: FORMULA_PLUS_QUESTIONNAIRE.objective,
          companyName: FORMULA_PLUS_QUESTIONNAIRE.companyName,
          active: true,
          sections: JSON.stringify(FORMULA_PLUS_QUESTIONNAIRE.sections),
        },
      });
      console.log('✅ All saved templates were updated to the current questionnaire model');
    } else {
      const createdTemplate = await prisma.formTemplate.create({
        data: {
          title: FORMULA_PLUS_QUESTIONNAIRE.title,
          description: FORMULA_PLUS_QUESTIONNAIRE.objective,
          companyName: FORMULA_PLUS_QUESTIONNAIRE.companyName,
          active: true,
          sections: JSON.stringify(FORMULA_PLUS_QUESTIONNAIRE.sections),
        },
      });
      console.log('✅ Default Fórmula Plus Questionnaire template created');

      const sampleLinkCode = 'formplus1';
      await prisma.formLink.create({
        data: {
          code: sampleLinkCode,
          formTemplateId: createdTemplate.id,
          targetPosition: 'Atendente de Farmácia de Manipulação',
          candidateName: 'Candidato Exemplo',
          candidateEmail: 'candidato@exemplo.com',
          status: 'PENDING',
        },
      });
      console.log(`✅ Demo link created: /f/${sampleLinkCode}`);
    }
  } catch (err) {
    console.error('Error seeding DB:', err);
  }
}

// ==================== API ROUTES ====================

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin || admin.password !== normalizedPassword) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    return res.json({
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      token: `demo-token-${admin.id}`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao realizar login' });
  }
});

// Get Form Templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await prisma.formTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const parsed = templates.map((t) => ({
      ...t,
      sections: JSON.parse(t.sections),
    }));
    return res.json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar formulários' });
  }
});

// Create Custom Form Template
app.post('/api/templates', async (req, res) => {
  const { title, description, companyName, sections } = req.body;
  try {
    const template = await prisma.formTemplate.create({
      data: {
        title: title || FORMULA_PLUS_QUESTIONNAIRE.title,
        description: description || FORMULA_PLUS_QUESTIONNAIRE.objective,
        companyName: companyName || FORMULA_PLUS_QUESTIONNAIRE.companyName,
        sections: JSON.stringify(sections || FORMULA_PLUS_QUESTIONNAIRE.sections),
      },
    });
    return res.json({ ...template, sections: JSON.parse(template.sections) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar modelo de formulário' });
  }
});

// Update Form Template
app.put('/api/templates/:id', async (req, res) => {
  const { title, description, companyName, sections } = req.body;
  try {
    const updated = await prisma.formTemplate.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        companyName: companyName !== undefined ? companyName : undefined,
        sections: sections ? JSON.stringify(sections) : undefined,
      },
    });
    return res.json({ ...updated, sections: JSON.parse(updated.sections) });
  } catch (err) {
    console.error('Error updating template:', err);
    return res.status(500).json({ error: 'Erro ao atualizar modelo de formulário' });
  }
});

// Create Manual / Handwritten Form Submission (With PDF Upload)
app.post('/api/submissions/manual-upload', async (req, res) => {
  const { candidateName, candidateEmail, candidatePhone, candidatePosition, pdfData, pdfFileName, notes } = req.body;
  try {
    // Find or create default form template and form link
    let link = await prisma.formLink.findFirst({
      where: { candidateName: candidateName },
    });

    if (!link) {
      const defaultTpl = await prisma.formTemplate.findFirst({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      });
      if (!defaultTpl) {
        return res.status(400).json({ error: 'Modelo de formulário não encontrado' });
      }
      link = await prisma.formLink.create({
        data: {
          code: generateShortCode(),
          formTemplateId: defaultTpl.id,
          targetPosition: candidatePosition || 'Não informada',
          candidateName: candidateName,
          candidateEmail: candidateEmail || null,
          candidatePhone: candidatePhone || null,
          status: 'COMPLETED',
        },
      });
    }

    const answersPayload = {
      isHandwritten: true,
      fileData: pdfData || null,
      fileName: pdfFileName || 'questionario_manuscrito.pdf',
      notes: notes || 'Questionário preenchido manualmente no papel e digitalizado.',
      q1: candidateName,
      q2: candidatePhone || '',
      q3: candidateEmail || '',
      q4: candidatePosition || '',
    };

    const submission = await prisma.formSubmission.create({
      data: {
        formLinkId: link.id,
        candidateName: candidateName,
        candidateEmail: candidateEmail || 'Preenchido à mão',
        candidatePhone: candidatePhone || 'Preenchido à mão',
        candidatePosition: candidatePosition || 'Não informada',
        answersJson: JSON.stringify(answersPayload),
        signatureName: candidateName,
        signatureData: null,
        signatureDate: new Date().toLocaleDateString('pt-BR'),
      },
    });

    // Update link status
    await prisma.formLink.update({
      where: { id: link.id },
      data: { status: 'COMPLETED' },
    });

    return res.json({
      success: true,
      submissionId: submission.id,
      message: 'Questionário manuscrito cadastrado com sucesso!',
    });
  } catch (err) {
    console.error('Error creating manual submission:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar formulário manuscrito' });
  }
});

// Get Form Links
app.get('/api/forms', async (req, res) => {
  try {
    const links = await prisma.formLink.findMany({
      include: {
        formTemplate: true,
        formSubmissions: { select: { id: true, submittedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const formatted = links.map((l) => ({
      id: l.id,
      code: l.code,
      formTemplateId: l.formTemplateId,
      targetPosition: l.targetPosition,
      candidateName: l.candidateName,
      candidateEmail: l.candidateEmail,
      candidatePhone: l.candidatePhone,
      status: l.status,
      expiresAt: l.expiresAt,
      createdAt: l.createdAt,
      submissionCount: l.formSubmissions.length,
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar links de formulário' });
  }
});

// Create Form Link
app.post('/api/forms', async (req, res) => {
  const { formTemplateId, targetPosition, candidateName, candidateEmail, candidatePhone, expiresAt } = req.body;
  try {
    let templateId = formTemplateId;
    if (!templateId) {
      const defaultTpl = await prisma.formTemplate.findFirst({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      });
      if (defaultTpl) templateId = defaultTpl.id;
    }

    if (!templateId) {
      return res.status(400).json({ error: 'Modelo de formulário não encontrado' });
    }

    let code = generateShortCode();
    // Ensure code uniqueness
    let exists = await prisma.formLink.findUnique({ where: { code } });
    while (exists) {
      code = generateShortCode();
      exists = await prisma.formLink.findUnique({ where: { code } });
    }

    const newLink = await prisma.formLink.create({
      data: {
        code,
        formTemplateId: templateId,
        targetPosition: targetPosition || 'Vaga em Aberto',
        candidateName: candidateName || null,
        candidateEmail: candidateEmail || null,
        candidatePhone: candidatePhone || null,
        status: 'PENDING',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return res.json({
      id: newLink.id,
      code: newLink.code,
      targetPosition: newLink.targetPosition,
      candidateName: newLink.candidateName,
      candidateEmail: newLink.candidateEmail,
      candidatePhone: newLink.candidatePhone,
      status: newLink.status,
      createdAt: newLink.createdAt,
    });
  } catch (err) {
    console.error('Error creating form link:', err);
    return res.status(500).json({ error: 'Erro ao gerar link do formulário' });
  }
});

// Delete Form Link
app.delete('/api/forms/:id', async (req, res) => {
  try {
    await prisma.formLink.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir link' });
  }
});

// Public: Get Form by Code for Candidates
app.get('/api/public/form/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const link = await prisma.formLink.findUnique({
      where: { code },
      include: {
        formTemplate: true,
        formSubmissions: true,
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Formulário não encontrado ou link expirado.' });
    }

    const templateData = {
      title: FORMULA_PLUS_QUESTIONNAIRE.title,
      companyName: FORMULA_PLUS_QUESTIONNAIRE.companyName,
      objective: FORMULA_PLUS_QUESTIONNAIRE.objective,
      orientation: FORMULA_PLUS_QUESTIONNAIRE.orientation,
      sections: FORMULA_PLUS_QUESTIONNAIRE.sections,
    };

    return res.json({
      linkId: link.id,
      code: link.code,
      targetPosition: link.targetPosition,
      candidateName: link.candidateName,
      candidateEmail: link.candidateEmail,
      candidatePhone: link.candidatePhone,
      alreadySubmitted: link.formSubmissions.length > 0,
      template: templateData,
    });
  } catch (err) {
    console.error('Error fetching public form:', err);
    return res.status(500).json({ error: 'Erro ao carregar o formulário' });
  }
});

// Public: Submit Form by Code
app.post('/api/public/form/:code/submit', async (req, res) => {
  const { code } = req.params;
  const { answers, signatureName, signatureData, signatureDate } = req.body;

  try {
    const link = await prisma.formLink.findUnique({ where: { code } });
    if (!link) {
      return res.status(404).json({ error: 'Link de formulário inválido ou expirado.' });
    }

    // Extract basic candidate info from answers
    const candidateName = answers.q1 || answers.q_name || link.candidateName || 'Candidato Sem Nome';
    const candidatePhone = answers.q2 || answers.q_phone || link.candidatePhone || '';
    const candidateEmail = answers.q3 || answers.q_email || link.candidateEmail || '';
    const candidatePosition = answers.q4 || link.targetPosition || 'Não especificada';

    const submission = await prisma.formSubmission.create({
      data: {
        formLinkId: link.id,
        candidateName: String(candidateName),
        candidateEmail: String(candidateEmail),
        candidatePhone: String(candidatePhone),
        candidatePosition: String(candidatePosition),
        answersJson: JSON.stringify(answers),
        signatureName: signatureName || String(candidateName),
        signatureData: signatureData || null,
        signatureDate: signatureDate || new Date().toLocaleDateString('pt-BR'),
      },
    });

    // Update link status
    await prisma.formLink.update({
      where: { id: link.id },
      data: { status: 'COMPLETED' },
    });

    return res.json({
      success: true,
      submissionId: submission.id,
      message: 'Questionário enviado com sucesso! Agradecemos sua participação.',
    });
  } catch (err) {
    console.error('Error submitting form:', err);
    return res.status(500).json({ error: 'Erro ao processar o envio das respostas' });
  }
});

// Admin: Get All Submissions
app.get('/api/submissions', async (req, res) => {
  try {
    const submissions = await prisma.formSubmission.findMany({
      include: {
        formLink: { select: { code: true, createdAt: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const formatted = submissions.map((s) => ({
      id: s.id,
      formLinkId: s.formLinkId,
      candidateName: s.candidateName,
      candidateEmail: s.candidateEmail,
      candidatePhone: s.candidatePhone,
      candidatePosition: s.candidatePosition,
      answers: JSON.parse(s.answersJson),
      signatureName: s.signatureName,
      signatureData: s.signatureData,
      signatureDate: s.signatureDate,
      submittedAt: s.submittedAt,
      evaluated: s.evaluated,
      companyEvaluation: s.companyEvaluationJson ? JSON.parse(s.companyEvaluationJson) : null,
      formLink: s.formLink,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    return res.status(500).json({ error: 'Erro ao buscar respostas' });
  }
});

// Admin: Get Single Submission
app.get('/api/submissions/:id', async (req, res) => {
  try {
    const s = await prisma.formSubmission.findUnique({
      where: { id: req.params.id },
      include: { formLink: true },
    });

    if (!s) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }

    return res.json({
      id: s.id,
      formLinkId: s.formLinkId,
      candidateName: s.candidateName,
      candidateEmail: s.candidateEmail,
      candidatePhone: s.candidatePhone,
      candidatePosition: s.candidatePosition,
      answers: JSON.parse(s.answersJson),
      signatureName: s.signatureName,
      signatureData: s.signatureData,
      signatureDate: s.signatureDate,
      submittedAt: s.submittedAt,
      evaluated: s.evaluated,
      companyEvaluation: s.companyEvaluationJson ? JSON.parse(s.companyEvaluationJson) : null,
      formLink: s.formLink,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar detalhes da resposta' });
  }
});

// Admin: Save HR Evaluation ("USO EXCLUSIVO DA EMPRESA")
app.put('/api/submissions/:id/evaluate', async (req, res) => {
  const { criteria, recommendation, interviewerNotes, evaluatorName } = req.body;
  try {
    const evaluationData = {
      criteria: criteria || {},
      recommendation: recommendation || 'AVALIAR_MELHOR',
      interviewerNotes: interviewerNotes || '',
      evaluatorName: evaluatorName || 'RH Fórmula Plus',
      evaluatedAt: new Date().toISOString(),
    };

    const updated = await prisma.formSubmission.update({
      where: { id: req.params.id },
      data: {
        evaluated: true,
        companyEvaluationJson: JSON.stringify(evaluationData),
        recommendation: recommendation,
        evaluatorNotes: interviewerNotes,
        evaluatedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      evaluated: updated.evaluated,
      companyEvaluation: evaluationData,
    });
  } catch (err) {
    console.error('Error saving evaluation:', err);
    return res.status(500).json({ error: 'Erro ao salvar avaliação de RH' });
  }
});

// Admin: Delete Submission
app.delete('/api/submissions/:id', async (req, res) => {
  try {
    await prisma.formSubmission.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir resposta' });
  }
});

// Admin: Send Submission / Email Notification
app.post('/api/submissions/:id/send-email', async (req, res) => {
  const { toEmail, subject, messageText } = req.body;
  try {
    const s = await prisma.formSubmission.findUnique({ where: { id: req.params.id } });
    if (!s) return res.status(404).json({ error: 'Resposta não encontrada' });

    // Optional Nodemailer transporter setup if SMTP credentials configured in env
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Fórmula Plus RH" <${process.env.SMTP_USER}>`,
        to: toEmail || s.candidateEmail,
        subject: subject || `Questionário de Pré-Entrevista - ${s.candidateName}`,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #065f46;">Fórmula Plus Farmácia de Manipulação</h2>
          <p>${messageText || 'Segue o formulário de pré-entrevista do candidato.'}</p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          <p><strong>Candidato:</strong> ${s.candidateName}</p>
          <p><strong>Vaga:</strong> ${s.candidatePosition}</p>
          <p><strong>E-mail:</strong> ${s.candidateEmail}</p>
          <p><strong>Telefone:</strong> ${s.candidatePhone}</p>
          <p><strong>Data de Envio:</strong> ${new Date(s.submittedAt).toLocaleDateString('pt-BR')}</p>
        </div>`,
      });

      return res.json({ success: true, method: 'smtp', message: 'E-mail enviado com sucesso via servidor SMTP!' });
    } else {
      // Return successful simulation with detailed payload
      return res.json({
        success: true,
        method: 'simulated',
        message: 'E-mail gerado e registrado no sistema! (Para envio real automático via SMTP, configure SMTP_HOST e SMTP_PASS nas variáveis de ambiente).',
        emailDetails: {
          to: toEmail || s.candidateEmail,
          subject: subject || `Questionário de Pré-Entrevista - ${s.candidateName} (${s.candidatePosition})`,
          candidateName: s.candidateName,
          candidatePosition: s.candidatePosition,
          sentAt: new Date().toISOString(),
        },
      });
    }
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ error: 'Erro ao processar envio de e-mail' });
  }
});

// Start Express Server
async function start() {
  await initSeed();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

start();
