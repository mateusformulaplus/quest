"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_client = require("@prisma/client");
var import_nodemailer = __toESM(require("nodemailer"), 1);

// src/data/questionnaireTemplate.ts
var FORMULA_PLUS_QUESTIONNAIRE = {
  title: "QUESTION\xC1RIO DE PR\xC9-ENTREVISTA",
  companyName: "F\xF3rmula Plus Farm\xE1cia de Manipula\xE7\xE3o",
  objective: "Conhecer melhor o perfil profissional do candidato antes da entrevista presencial ou online.",
  orientation: "Responda \xE0s perguntas com sinceridade. As informa\xE7\xF5es ser\xE3o utilizadas exclusivamente para fins de recrutamento e sele\xE7\xE3o.",
  sections: [
    {
      id: "sec_1",
      number: 1,
      title: "1. DADOS DO CANDIDATO",
      questions: [
        { id: "q1", number: 1, label: "Nome completo:", type: "text", required: true },
        { id: "q2", number: 2, label: "Telefone:", type: "text", placeholder: "______________", required: true },
        { id: "q3", number: 3, label: "E-mail:", type: "email", placeholder: "_________________", required: true },
        { id: "q4", number: 4, label: "Vaga pretendida:", type: "text", placeholder: "_____________", required: true }
      ]
    },
    {
      id: "sec_2",
      number: 2,
      title: "2. EXPERI\xCANCIA PROFISSIONAL",
      questions: [
        {
          id: "q5",
          number: 1,
          label: "Resuma sua experi\xEAncia profissional relacionada \xE0 vaga:",
          type: "textarea",
          required: true
        },
        {
          id: "q6",
          number: 2,
          label: "Qual foi seu \xFAltimo trabalho e quais eram suas principais atividades?",
          type: "textarea",
          required: true
        },
        {
          id: "q7",
          number: 3,
          label: "Voc\xEA possui experi\xEAncia com:",
          type: "checkbox",
          options: [
            "Atendimento ao cliente",
            "Vendas",
            "Metas comerciais",
            "Administra\xE7\xE3o",
            "Estoque/organiza\xE7\xE3o",
            "\xC1rea farmac\xEAutica",
            "Outro"
          ],
          hasOtherText: true,
          required: true
        }
      ]
    },
    {
      id: "sec_3",
      number: 3,
      title: "3. PERFIL PROFISSIONAL",
      questions: [
        {
          id: "q8",
          number: 4,
          label: "Como voc\xEA se avalia em atendimento ao cliente?",
          type: "radio",
          options: ["Excelente", "Muito bom", "Bom", "Preciso melhorar"],
          required: true
        },
        {
          id: "q9",
          number: 5,
          label: "Voc\xEA j\xE1 trabalhou com metas ou objetivos de desempenho?",
          type: "radio",
          options: ["Sim", "N\xE3o"],
          hasFollowUpText: true,
          followUpLabel: "Se sim, explique brevemente:",
          required: true
        },
        {
          id: "q10",
          number: 6,
          label: "Como voc\xEA lidaria com um cliente insatisfeito?",
          type: "textarea",
          required: true
        },
        {
          id: "q11",
          number: 7,
          label: "Cite tr\xEAs qualidades profissionais que voc\xEA considera seus pontos fortes:",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      id: "sec_4",
      number: 4,
      title: "4. COMPORTAMENTO E EQUIPE",
      questions: [
        {
          id: "q12",
          number: 8,
          label: "Como voc\xEA reage quando recebe uma cr\xEDtica ou corre\xE7\xE3o no trabalho?",
          type: "textarea",
          required: true
        },
        {
          id: "q13",
          number: 9,
          label: "Quando voc\xEA n\xE3o sabe realizar uma tarefa, o que costuma fazer?",
          type: "textarea",
          required: true
        },
        {
          id: "q14",
          number: 10,
          label: "Voc\xEA prefere trabalhar:",
          type: "radio",
          options: ["Individualmente", "Em equipe", "Ambos, dependendo da atividade"],
          required: true
        }
      ]
    },
    {
      id: "sec_5",
      number: 5,
      title: "5. DISPONIBILIDADE E EXPECTATIVAS",
      questions: [
        {
          id: "q15",
          number: 11,
          label: "Qual sua disponibilidade de hor\xE1rio?",
          type: "textarea",
          required: true
        },
        {
          id: "q16",
          number: 12,
          label: "Qual sua pretens\xE3o salarial?",
          type: "text",
          placeholder: "R$ ___________",
          required: true
        },
        {
          id: "q17",
          number: 13,
          label: "Por que voc\xEA tem interesse em trabalhar na F\xF3rmula Plus?",
          type: "textarea",
          required: true
        },
        {
          id: "q18",
          number: 14,
          label: "Por que dever\xEDamos considerar voc\xEA para esta vaga?",
          type: "textarea",
          required: true
        }
      ]
    }
  ]
};

// server.ts
import_dotenv.default.config();
var DEFAULT_ADMIN = {
  email: "adm@formulaplus.com",
  password: "formulaplus",
  name: "Administrador F\xF3rmula Plus"
};
var prisma = new import_client.PrismaClient();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use((0, import_cors.default)());
app.use(import_express.default.json({ limit: "10mb" }));
function generateShortCode() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
async function initSeed() {
  try {
    const adminExists = await prisma.adminUser.findUnique({
      where: { email: DEFAULT_ADMIN.email }
    });
    if (!adminExists) {
      await prisma.adminUser.create({
        data: {
          email: DEFAULT_ADMIN.email,
          password: DEFAULT_ADMIN.password,
          name: DEFAULT_ADMIN.name,
          role: "ADMIN"
        }
      });
      console.log(`\u2705 Default admin user created: ${DEFAULT_ADMIN.email}`);
    } else {
      await prisma.adminUser.update({
        where: { email: DEFAULT_ADMIN.email },
        data: {
          password: DEFAULT_ADMIN.password,
          name: DEFAULT_ADMIN.name,
          role: "ADMIN"
        }
      });
      console.log(`\u2705 Default admin user ensured: ${DEFAULT_ADMIN.email}`);
    }
    const existingTemplates = await prisma.formTemplate.findMany();
    if (existingTemplates.length > 0) {
      await prisma.formTemplate.updateMany({
        data: {
          title: FORMULA_PLUS_QUESTIONNAIRE.title,
          description: FORMULA_PLUS_QUESTIONNAIRE.objective,
          companyName: FORMULA_PLUS_QUESTIONNAIRE.companyName,
          active: true,
          sections: JSON.stringify(FORMULA_PLUS_QUESTIONNAIRE.sections)
        }
      });
      console.log("\u2705 All saved templates were updated to the current questionnaire model");
    } else {
      const createdTemplate = await prisma.formTemplate.create({
        data: {
          title: FORMULA_PLUS_QUESTIONNAIRE.title,
          description: FORMULA_PLUS_QUESTIONNAIRE.objective,
          companyName: FORMULA_PLUS_QUESTIONNAIRE.companyName,
          active: true,
          sections: JSON.stringify(FORMULA_PLUS_QUESTIONNAIRE.sections)
        }
      });
      console.log("\u2705 Default F\xF3rmula Plus Questionnaire template created");
      const sampleLinkCode = "formplus1";
      await prisma.formLink.create({
        data: {
          code: sampleLinkCode,
          formTemplateId: createdTemplate.id,
          targetPosition: "Atendente de Farm\xE1cia de Manipula\xE7\xE3o",
          candidateName: "Candidato Exemplo",
          candidateEmail: "candidato@exemplo.com",
          status: "PENDING"
        }
      });
      console.log(`\u2705 Demo link created: /f/${sampleLinkCode}`);
    }
  } catch (err) {
    console.error("Error seeding DB:", err);
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail }
    });
    if (!admin || admin.password !== normalizedPassword) {
      return res.status(401).json({ error: "E-mail ou senha inv\xE1lidos" });
    }
    return res.json({
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      token: `demo-token-${admin.id}`
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno ao realizar login" });
  }
});
app.get("/api/templates", async (req, res) => {
  try {
    const templates = await prisma.formTemplate.findMany({
      orderBy: { createdAt: "desc" }
    });
    const parsed = templates.map((t) => ({
      ...t,
      sections: JSON.parse(t.sections)
    }));
    return res.json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar formul\xE1rios" });
  }
});
app.post("/api/templates", async (req, res) => {
  const { title, description, companyName, sections } = req.body;
  try {
    const template = await prisma.formTemplate.create({
      data: {
        title: title || FORMULA_PLUS_QUESTIONNAIRE.title,
        description: description || FORMULA_PLUS_QUESTIONNAIRE.objective,
        companyName: companyName || FORMULA_PLUS_QUESTIONNAIRE.companyName,
        sections: JSON.stringify(sections || FORMULA_PLUS_QUESTIONNAIRE.sections)
      }
    });
    return res.json({ ...template, sections: JSON.parse(template.sections) });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao criar modelo de formul\xE1rio" });
  }
});
app.put("/api/templates/:id", async (req, res) => {
  const { title, description, companyName, sections } = req.body;
  try {
    const updated = await prisma.formTemplate.update({
      where: { id: req.params.id },
      data: {
        title: title !== void 0 ? title : void 0,
        description: description !== void 0 ? description : void 0,
        companyName: companyName !== void 0 ? companyName : void 0,
        sections: sections ? JSON.stringify(sections) : void 0
      }
    });
    return res.json({ ...updated, sections: JSON.parse(updated.sections) });
  } catch (err) {
    console.error("Error updating template:", err);
    return res.status(500).json({ error: "Erro ao atualizar modelo de formul\xE1rio" });
  }
});
app.post("/api/submissions/manual-upload", async (req, res) => {
  const { candidateName, candidateEmail, candidatePhone, candidatePosition, pdfData, pdfFileName, notes } = req.body;
  try {
    let link = await prisma.formLink.findFirst({
      where: { candidateName }
    });
    if (!link) {
      const defaultTpl = await prisma.formTemplate.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" }
      });
      if (!defaultTpl) {
        return res.status(400).json({ error: "Modelo de formul\xE1rio n\xE3o encontrado" });
      }
      link = await prisma.formLink.create({
        data: {
          code: generateShortCode(),
          formTemplateId: defaultTpl.id,
          targetPosition: candidatePosition || "N\xE3o informada",
          candidateName,
          candidateEmail: candidateEmail || null,
          candidatePhone: candidatePhone || null,
          status: "COMPLETED"
        }
      });
    }
    const answersPayload = {
      isHandwritten: true,
      fileData: pdfData || null,
      fileName: pdfFileName || "questionario_manuscrito.pdf",
      notes: notes || "Question\xE1rio preenchido manualmente no papel e digitalizado.",
      q1: candidateName,
      q2: candidatePhone || "",
      q3: candidateEmail || "",
      q4: candidatePosition || ""
    };
    const submission = await prisma.formSubmission.create({
      data: {
        formLinkId: link.id,
        candidateName,
        candidateEmail: candidateEmail || "Preenchido \xE0 m\xE3o",
        candidatePhone: candidatePhone || "Preenchido \xE0 m\xE3o",
        candidatePosition: candidatePosition || "N\xE3o informada",
        answersJson: JSON.stringify(answersPayload),
        signatureName: candidateName,
        signatureData: null,
        signatureDate: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")
      }
    });
    await prisma.formLink.update({
      where: { id: link.id },
      data: { status: "COMPLETED" }
    });
    return res.json({
      success: true,
      submissionId: submission.id,
      message: "Question\xE1rio manuscrito cadastrado com sucesso!"
    });
  } catch (err) {
    console.error("Error creating manual submission:", err);
    return res.status(500).json({ error: "Erro ao cadastrar formul\xE1rio manuscrito" });
  }
});
app.get("/api/forms", async (req, res) => {
  try {
    const links = await prisma.formLink.findMany({
      include: {
        formTemplate: true,
        formSubmissions: { select: { id: true, submittedAt: true } }
      },
      orderBy: { createdAt: "desc" }
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
      submissionCount: l.formSubmissions.length
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar links de formul\xE1rio" });
  }
});
app.post("/api/forms", async (req, res) => {
  const { formTemplateId, targetPosition, candidateName, candidateEmail, candidatePhone, expiresAt } = req.body;
  try {
    let templateId = formTemplateId;
    if (!templateId) {
      const defaultTpl = await prisma.formTemplate.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" }
      });
      if (defaultTpl) templateId = defaultTpl.id;
    }
    if (!templateId) {
      return res.status(400).json({ error: "Modelo de formul\xE1rio n\xE3o encontrado" });
    }
    let code = generateShortCode();
    let exists = await prisma.formLink.findUnique({ where: { code } });
    while (exists) {
      code = generateShortCode();
      exists = await prisma.formLink.findUnique({ where: { code } });
    }
    const newLink = await prisma.formLink.create({
      data: {
        code,
        formTemplateId: templateId,
        targetPosition: targetPosition || "Vaga em Aberto",
        candidateName: candidateName || null,
        candidateEmail: candidateEmail || null,
        candidatePhone: candidatePhone || null,
        status: "PENDING",
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });
    return res.json({
      id: newLink.id,
      code: newLink.code,
      targetPosition: newLink.targetPosition,
      candidateName: newLink.candidateName,
      candidateEmail: newLink.candidateEmail,
      candidatePhone: newLink.candidatePhone,
      status: newLink.status,
      createdAt: newLink.createdAt
    });
  } catch (err) {
    console.error("Error creating form link:", err);
    return res.status(500).json({ error: "Erro ao gerar link do formul\xE1rio" });
  }
});
app.delete("/api/forms/:id", async (req, res) => {
  try {
    await prisma.formLink.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao excluir link" });
  }
});
app.get("/api/public/form/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const link = await prisma.formLink.findUnique({
      where: { code },
      include: {
        formTemplate: true,
        formSubmissions: true
      }
    });
    if (!link) {
      return res.status(404).json({ error: "Formul\xE1rio n\xE3o encontrado ou link expirado." });
    }
    const templateData = {
      title: FORMULA_PLUS_QUESTIONNAIRE.title,
      companyName: FORMULA_PLUS_QUESTIONNAIRE.companyName,
      objective: FORMULA_PLUS_QUESTIONNAIRE.objective,
      orientation: FORMULA_PLUS_QUESTIONNAIRE.orientation,
      sections: FORMULA_PLUS_QUESTIONNAIRE.sections
    };
    return res.json({
      linkId: link.id,
      code: link.code,
      targetPosition: link.targetPosition,
      candidateName: link.candidateName,
      candidateEmail: link.candidateEmail,
      candidatePhone: link.candidatePhone,
      alreadySubmitted: link.formSubmissions.length > 0,
      template: templateData
    });
  } catch (err) {
    console.error("Error fetching public form:", err);
    return res.status(500).json({ error: "Erro ao carregar o formul\xE1rio" });
  }
});
app.post("/api/public/form/:code/submit", async (req, res) => {
  const { code } = req.params;
  const { answers, signatureName, signatureData, signatureDate } = req.body;
  try {
    const link = await prisma.formLink.findUnique({ where: { code } });
    if (!link) {
      return res.status(404).json({ error: "Link de formul\xE1rio inv\xE1lido ou expirado." });
    }
    const candidateName = answers.q1 || answers.q_name || link.candidateName || "Candidato Sem Nome";
    const candidatePhone = answers.q2 || answers.q_phone || link.candidatePhone || "";
    const candidateEmail = answers.q3 || answers.q_email || link.candidateEmail || "";
    const candidatePosition = answers.q4 || link.targetPosition || "N\xE3o especificada";
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
        signatureDate: signatureDate || (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")
      }
    });
    await prisma.formLink.update({
      where: { id: link.id },
      data: { status: "COMPLETED" }
    });
    return res.json({
      success: true,
      submissionId: submission.id,
      message: "Question\xE1rio enviado com sucesso! Agradecemos sua participa\xE7\xE3o."
    });
  } catch (err) {
    console.error("Error submitting form:", err);
    return res.status(500).json({ error: "Erro ao processar o envio das respostas" });
  }
});
app.get("/api/submissions", async (req, res) => {
  try {
    const submissions = await prisma.formSubmission.findMany({
      include: {
        formLink: { select: { code: true, createdAt: true } }
      },
      orderBy: { submittedAt: "desc" }
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
      formLink: s.formLink
    }));
    return res.json(formatted);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    return res.status(500).json({ error: "Erro ao buscar respostas" });
  }
});
app.get("/api/submissions/:id", async (req, res) => {
  try {
    const s = await prisma.formSubmission.findUnique({
      where: { id: req.params.id },
      include: { formLink: true }
    });
    if (!s) {
      return res.status(404).json({ error: "Resposta n\xE3o encontrada" });
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
      formLink: s.formLink
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar detalhes da resposta" });
  }
});
app.put("/api/submissions/:id/evaluate", async (req, res) => {
  const { criteria, recommendation, interviewerNotes, evaluatorName } = req.body;
  try {
    const evaluationData = {
      criteria: criteria || {},
      recommendation: recommendation || "AVALIAR_MELHOR",
      interviewerNotes: interviewerNotes || "",
      evaluatorName: evaluatorName || "RH F\xF3rmula Plus",
      evaluatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updated = await prisma.formSubmission.update({
      where: { id: req.params.id },
      data: {
        evaluated: true,
        companyEvaluationJson: JSON.stringify(evaluationData),
        recommendation,
        evaluatorNotes: interviewerNotes,
        evaluatedAt: /* @__PURE__ */ new Date()
      }
    });
    return res.json({
      success: true,
      evaluated: updated.evaluated,
      companyEvaluation: evaluationData
    });
  } catch (err) {
    console.error("Error saving evaluation:", err);
    return res.status(500).json({ error: "Erro ao salvar avalia\xE7\xE3o de RH" });
  }
});
app.delete("/api/submissions/:id", async (req, res) => {
  try {
    await prisma.formSubmission.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao excluir resposta" });
  }
});
app.post("/api/submissions/:id/send-email", async (req, res) => {
  const { toEmail, subject, messageText } = req.body;
  try {
    const s = await prisma.formSubmission.findUnique({ where: { id: req.params.id } });
    if (!s) return res.status(404).json({ error: "Resposta n\xE3o encontrada" });
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = import_nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: `"F\xF3rmula Plus RH" <${process.env.SMTP_USER}>`,
        to: toEmail || s.candidateEmail,
        subject: subject || `Question\xE1rio de Pr\xE9-Entrevista - ${s.candidateName}`,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #065f46;">F\xF3rmula Plus Farm\xE1cia de Manipula\xE7\xE3o</h2>
          <p>${messageText || "Segue o formul\xE1rio de pr\xE9-entrevista do candidato."}</p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          <p><strong>Candidato:</strong> ${s.candidateName}</p>
          <p><strong>Vaga:</strong> ${s.candidatePosition}</p>
          <p><strong>E-mail:</strong> ${s.candidateEmail}</p>
          <p><strong>Telefone:</strong> ${s.candidatePhone}</p>
          <p><strong>Data de Envio:</strong> ${new Date(s.submittedAt).toLocaleDateString("pt-BR")}</p>
        </div>`
      });
      return res.json({ success: true, method: "smtp", message: "E-mail enviado com sucesso via servidor SMTP!" });
    } else {
      return res.json({
        success: true,
        method: "simulated",
        message: "E-mail gerado e registrado no sistema! (Para envio real autom\xE1tico via SMTP, configure SMTP_HOST e SMTP_PASS nas vari\xE1veis de ambiente).",
        emailDetails: {
          to: toEmail || s.candidateEmail,
          subject: subject || `Question\xE1rio de Pr\xE9-Entrevista - ${s.candidateName} (${s.candidatePosition})`,
          candidateName: s.candidateName,
          candidatePosition: s.candidatePosition,
          sentAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    }
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).json({ error: "Erro ao processar envio de e-mail" });
  }
});
async function start() {
  try {
    await prisma.$connect();
    await initSeed();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\u{1F680} Backend running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("\u274C Failed to start backend:", error);
    process.exit(1);
  }
}
start();
//# sourceMappingURL=server.cjs.map
