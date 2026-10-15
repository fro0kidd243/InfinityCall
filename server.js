require("dotenv").config();
const express = require("express");
const path = require("path");
const twilio = require("twilio");

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const port = Number(process.env.PORT || 3000);
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
const voiceUrl = process.env.TWIML_APP_URL;
const client = sid && token ? twilio(sid, token) : null;
const activeCalls = new Set();

app.get("/api/status", (_req, res) => {
  res.json({ configured: Boolean(client && from && voiceUrl) });
});

app.post("/api/call", async (req, res) => {
  const to = String(req.body?.to || "").trim();

  if (!/^\+[1-9]\d{7,14}$/.test(to)) {
    return res.status(400).json({ message: "Número inválido. Use o formato internacional (+55...)." });
  }

  if (!client || !from || !voiceUrl) {
    return res.status(503).json({
      message: "Servidor instalado, mas falta configurar as credenciais e a URL TwiML no .env."
    });
  }

  try {
    const call = await client.calls.create({
      to,
      from,
      url: voiceUrl,
      method: "POST"
    });
    activeCalls.add(call.sid);
    return res.json({ message: "Chamada solicitada. O provedor pode cobrar por ela.", callId: call.sid });
  } catch (err) {
    console.error("Falha ao criar chamada:", err.message);
    return res.status(502).json({ message: "O provedor recusou a chamada. Confira conta, número e configuração." });
  }
});

app.post("/api/hangup", async (_req, res) => {
  if (!client) {
    return res.status(503).json({ message: "Configure o provedor no arquivo .env primeiro." });
  }

  try {
    if (!activeCalls.size) {
      return res.json({ message: "Nenhuma chamada iniciada por esta sessão do servidor." });
    }
    const results = await Promise.allSettled(
      [...activeCalls].map(sid => client.calls(sid).update({ status: "completed" }))
    );
    activeCalls.clear();
    const failed = results.some(result => result.status === "rejected");
    return res.json({ message: failed ? "Pedido enviado; algumas chamadas não puderam ser encerradas." : "Chamada encerrada." });
  } catch (err) {
    console.error("Falha ao encerrar chamada:", err.message);
    return res.status(502).json({ message: "Não foi possível encerrar a chamada no provedor." });
  }
});

app.listen(port, () => {
  console.log(`InfinityCall disponível em http://localhost:${port}`);
});
