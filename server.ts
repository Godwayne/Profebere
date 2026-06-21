import express from "express";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
let aiClient: any = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
} catch (e) {
  console.warn("Error initializing Gemini SDK in server:", e);
}

function buildEmailTemplate(type: string, metadata: any) {
  const brandColor = "#0f172a"; // Slate/Navy
  const accentColor = "#D4AF37"; // Gold

  const header = `
    <div style="background-color: ${brandColor}; padding: 30px; text-align: center; border-bottom: 3px solid ${accentColor}; font-family: 'Georgia', serif;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 1px;">Prof. Ebere Okorie</h1>
      <p style="color: ${accentColor}; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Academic Portal & Criminological Research</p>
    </div>
  `;

  const footer = `
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #64748b; line-height: 1.5;">
      <p style="margin: 0 0 5px 0;">This email was sent from the Official Academic Portal of Prof. Ebere Okorie.</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} Prof. Ebere Okorie. All academic and editorial rights reserved.</p>
    </div>
  `;

  let body = "";
  let subject = "";

  if (type === "welcome") {
    subject = "Welcome to Prof. Ebere Okorie's Academic Portal 🎓";
    body = `
      <div style="padding: 40px 30px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #334155; line-height: 1.6;">
        <h2 style="color: ${brandColor}; font-family: 'Georgia', serif; font-size: 20px; margin-top: 0;">Respected Scholar, Welcome.</h2>
        <p>Thank you for registering on my official academic platform. This portal is designed to foster criminology studies, research publishing, and interactive scholastic dialogue.</p>
        <p>As a registered member, you now hold active access to:</p>
        <ul style="padding-left: 20px; margin: 15px 0;">
          <li style="margin-bottom: 8px;">Explore completed and active criminological research works.</li>
          <li style="margin-bottom: 8px;">Engage in news discussion comments and research book purchases.</li>
          <li style="margin-bottom: 8px;">Official correspondence channels for professional inquiries.</li>
        </ul>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background-color: ${accentColor}; color: #ffffff; text-decoration: none; padding: 12px 25px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Explore Scholar Gateway</a>
        </div>
        <p style="margin-bottom: 0;">Sincerely,<br/><strong style="color: ${brandColor};">Office of Prof. Ebere Okorie</strong><br/>Professor of Criminology & Social Justice</p>
      </div>
    `;
  } else if (type === "purchase") {
    const itemName = metadata.itemName || "Academic Publication / Book";
    const amount = metadata.amount ? `₦${Number(metadata.amount).toLocaleString()}` : "N/A";
    const reference = metadata.reference || "N/A";
    const userName = metadata.name || "Scholar";
    subject = `Receipt: Purchase of ${itemName} 📚`;
    body = `
      <div style="padding: 40px 30px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #334155; line-height: 1.6;">
        <h2 style="color: ${brandColor}; font-family: 'Georgia', serif; font-size: 20px; margin-top: 0;">Purchase Receipt</h2>
        <p>Dear ${userName}, thank you for your academic item purchase. Your payment transaction was processed successfully. The acquired intellectual materials are now unlocked for your reading.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: ${brandColor}; margin-top: 0; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Transaction Receipt</h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.8;">
            <tr>
              <td style="color: #64748b; width: 35%;">Item Purchased:</td>
              <td style="font-weight: bold; color: ${brandColor};">${itemName}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Amount Paid:</td>
              <td style="font-weight: bold; color: #0f172a;">${amount}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Transaction ID:</td>
              <td style="font-family: monospace; font-size: 12px;">${reference}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Date:</td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <p>Please log into your profile on the portal to access your item at any time from your interactive console drawer.</p>
        <p style="margin-bottom: 0;">Sincerely,<br/><strong style="color: ${brandColor};">Office of Prof. Ebere Okorie</strong></p>
      </div>
    `;
  } else if (type === "donation") {
    const amount = metadata.amount ? `₦${Number(metadata.amount).toLocaleString()}` : "N/A";
    const reference = metadata.reference || "N/A";
    const userName = metadata.name || "Outreach Supporter";
    subject = "Deep Appreciation for Your Research Contribution 💖";
    body = `
      <div style="padding: 40px 30px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #334155; line-height: 1.6;">
        <h2 style="color: ${brandColor}; font-family: 'Georgia', serif; font-size: 20px; margin-top: 0;">Research Support Acknowledgment</h2>
        <p>Dear ${userName}, we are delighted to acknowledge your generous financial contribution of <strong>${amount}</strong> to support Prof. Ebere Okorie’s active criminological field studies and community development programs.</p>
        
        <p>Criminological fieldwork requires significant resources to retrieve reliable data, empower youth, support rehab initiatives, and advocate for criminal justice restructuring in Nigeria. Your support moves this vision closer to fulfillment.</p>
        
        <div style="background-color: #fdfaf2; border: 1px solid #fbefd3; padding: 18px; border-radius: 8px; margin: 25px 0; font-size: 13px;">
          <strong style="color: #c2930f; display: block; margin-bottom: 5px;">Contribution Confirmation</strong>
          Amount Donated: <strong style="color: ${brandColor}; font-size: 15px;">${amount}</strong><br/>
          Reference Receipt ID: <span style="font-family: monospace;">${reference}</span><br/>
          Date: <span>${new Date().toLocaleDateString()}</span>
        </div>

        <p>Your support is highly valued and makes a direct impact.</p>
        <p style="margin-bottom: 0;">With deep appreciation,<br/><strong style="color: ${brandColor};">Prof. Ebere Okorie</strong> & Outreach Research Trustees</p>
      </div>
    `;
  } else if (type === "admin_alert") {
    subject = `Portal Alert: ${metadata.alertTitle || "Administrative Event"}`;
    const alertBody = metadata.alertBody || "An administrative event occurred.";
    body = `
      <div style="padding: 40px 30px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #334155; line-height: 1.6;">
        <h2 style="color: #991b1b; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 18px; margin-top: 0;">Academic Portal System Notification</h2>
        <p style="font-size: 14px;">Hello Admin, this automated tracker alerts you of recent site updates:</p>
        
        <div style="border-left: 4px solid #b91c1c; background-color: #fef2f2; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <strong style="color: #991b1b; font-size: 14px; display: block; margin-bottom: 5px;">${metadata.alertTitle || "System Update"}</strong>
          <p style="margin: 0; font-size: 13px; color: #475569;">${alertBody}</p>
        </div>

        <p style="font-size: 12px; color: #64748b;">Log into the Scholar Console / Admin Portal to manage this transaction, moderate comments, or read user messages.</p>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 20px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);">
                <tr>
                  <td>
                    ${header}
                    ${body}
                    ${footer}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { subject, html };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add body parser middleware
  app.use(express.json());

  // API or backend health endpoints can be added here
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Ebere Okorie Academic Portal Backend"
    });
  });

  // Secure Live Chat Assistant powered by Gemini 3.5-flash & Criminological corpus fallback
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Missing message payload." });
      return;
    }

    const lowerMsg = message.toLowerCase();

    // High quality scholar-specific rule map fallback
    const ruleResponses = [
      {
        keywords: ["publication", "book", "article", "paper", "journal", "published", "write", "writing"],
        answer: "Professor Ebere Okorie has published over 60 articles, reviews, and criminological textbooks on security studies, juvenile delinquency, and deviant behavior in Nigeria. You can view his complete interactive catalog in the 'Publications' section."
      },
      {
        keywords: ["contact", "office", "email", "phone", "address", "reach", "touch", "location", "visit"],
        answer: "You can contact Professor Ebere Okorie's office via email at younggist212@gmail.com, or visit the Department of Sociology and Anthropology at the University of Uyo, Akwa Ibom State, Nigeria. For quick messages, please fill out the contact form under the 'Get in Touch' tab."
      },
      {
        keywords: ["donate", "outreach", "support", "contribution", "funding", "paystack", "opay", "money", "outreach"],
        answer: "Professor Okorie's academic outreach programs, prison wellness, and local community reforms are supported by grants and contributions from civic organizations and readers. You can support securely via Paystack or OPay by navigating to the 'Support Outreach' tab."
      },
      {
        keywords: ["who are you", "who is", "ebere", "okorie", "biography", "bio", "background"],
        answer: "Professor Ebere James Okorie is a distinguished Professor of Criminology & Sociology at the Department of Sociology and Anthropology, University of Uyo, Nigeria. With over 25 years of service, he has championed research into youth delinquency and grassroots crime prevention. See his full biography in the 'About' tab."
      },
      {
        keywords: ["research", "study", "project", "criminology", "sociology", "field", "crime", "delinquency"],
        answer: "Prof. Okorie's research focuses on Criminology and socio-cultural anthropology. Specific directions include West African juvenile rehabilitation, grassroots community policing, and family cohesiveness. You can explore active and past academic studies in the 'Research' area."
      }
    ];

    // Check if we can find a local match first
    let fallbackReply = "";
    for (const rule of ruleResponses) {
      if (rule.keywords.some(kw => lowerMsg.includes(kw))) {
        fallbackReply = rule.answer;
        break;
      }
    }

    if (!fallbackReply) {
      fallbackReply = "Professor Ebere Okorie's academic portal welcomes queries on criminology, sociol-anthropology, research supervision, and scholarly collaboration. Let me know if you would like information on publications, active research projects, contacts, or outreach programs.";
    }

    // Try to call Gemini API if initialized
    if (aiClient) {
      try {
        const systemInstruction = `You are the highly professional AI Academic Assistant for Professor Ebere Okorie. 
Professor Ebere James Okorie is a distinguished Professor of Criminology & Sociology at the Department of Sociology and Anthropology, University of Uyo (UNIUYO), Nigeria.
His research spans safety & security studies, juvenile delinquency, deviant behavior, local family therapy, and community surveillance. He has over 25 years of academic service, 60+ publications, 1200+ citations, and has supervised 50+ postgraduate candidates.
Answer questions on his behalf in a helpful, warm, scholarly, and professional manner. Keep answers concise, factual, and brief (under 3-4 sentences/bullets if possible) so they fit elegantly in a live chat interface. Mention standard menu pages and tabs like 'publications', 'research', 'contact', 'gallery', or 'donate' where relevant. Do not invent facts, only speak on academic socio-anthropological concepts or details about his career.`;

        // Format history for chat
        const contentsArray: any[] = [];
        if (history && Array.isArray(history)) {
          history.slice(-6).forEach((h: any) => {
            contentsArray.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }]
            });
          });
        }
        contentsArray.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: contentsArray,
          config: {
            systemInstruction: systemInstruction,
            maxOutputTokens: 500,
            temperature: 0.7,
          }
        });

        if (response.text) {
          res.json({ reply: response.text.trim() });
          return;
        }
      } catch (geminiError: any) {
        console.warn("Gemini API call returned an error, using local scholarly index:", geminiError.message || geminiError);
      }
    }

    // Return the safe matches in simulated/fallback mode
    res.json({ 
      reply: fallbackReply, 
      note: "Offline academic response cache."
    });
  });

  // Dynamic Mail Dispatcher with Graceful Fallbacks & Templates
  app.post("/api/send-email", async (req, res) => {
    const { to, type, metadata } = req.body;

    if (!to && type !== "admin_alert") {
      res.status(400).json({ error: "Missing recipient 'to' parameter for client notifications." });
      return;
    }

    try {
      const { subject, html } = buildEmailTemplate(type || "welcome", metadata || {});
      
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || `"Prof. Ebere Okorie" <admin@okorie.edu.ng>`;
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@okorie.edu.ng";

      const finalRecipient = (type === "admin_alert") ? adminEmail : to;

      if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        // Safe, highly explicit local simulation logging representing real success without crash.
        console.log(`\n======================================================`);
        console.log(`✉️  [SIMULATED EMAIL DISPATCH] (SMTP Unconfigured in .env)`);
        console.log(`➡️  To:      ${finalRecipient}`);
        console.log(`📝  Type:    ${type}`);
        console.log(`📋  Subject: ${subject}`);
        console.log(`📜  Body metadata:`, JSON.stringify(metadata, null, 2));
        console.log(`======================================================\n`);

        res.status(200).json({ 
          success: true, 
          simulated: true, 
          message: "Email successfully registered in delivery queue (Simulated mode; configure your SMTP details in settings to send real email)." 
        });
        return;
      }

      // Real SMTP transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // true for 465, false for 587/other
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: finalRecipient,
        subject,
        html
      });

      console.log(`✨ [REAL SMTP EMAIL SENT] Successfully sent email to ${finalRecipient} [Type: ${type}]`);
      res.status(200).json({ success: true, simulated: false });

    } catch (err: any) {
      console.error("Mail Dispatch Error:", err);
      res.status(500).json({ error: "Failed to dispatch email: " + err.message });
    }
  });

  // Secure Paystack Webhook endpoint
  app.post("/api/webhook/paystack", async (req, res) => {
    try {
      const signature = req.headers["x-paystack-signature"] as string;
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY || "sk_test_paystack_secret_key_placeholder";

      if (!signature) {
        res.status(400).json({ error: "Missing x-paystack-signature header." });
        return;
      }

      const hash = crypto
        .createHmac("sha512", paystackSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash !== signature) {
        console.warn("Invalid Paystack Webhook Signature received.");
        res.status(401).json({ error: "Unauthorized Signature Matches Failure." });
        return;
      }

      const { event, data } = req.body;
      console.log(`Paystack Webhook Event: ${event}`, data);

      if (event === "charge.success") {
        const reference = data.reference;
        console.log(`Webhooks transaction completed successfully for Paystack reference: ${reference}`);
        // Can integrate with Firestore directly if authenticated backend service account exists, 
        // but client also verifies and calls updateTransactionStatus from the frontend on completion.
      }

      res.status(200).json({ received: true, status: "success" });
    } catch (err: any) {
      console.error("Paystack Webhook Processing Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Secure OPay Webhook endpoint
  app.post("/api/webhook/opay", async (req, res) => {
    try {
      const signature = req.headers["x-opay-signature"] as string;
      const opaySecret = process.env.OPAY_SECRET_KEY || "opay_secret_key_placeholder";

      if (!signature) {
        res.status(400).json({ error: "Missing x-opay-signature header." });
        return;
      }

      const hash = crypto
        .createHmac("sha512", opaySecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash !== signature) {
        console.warn("Invalid OPay Webhook Signature received.");
        res.status(401).json({ error: "Unauthorized signature." });
        return;
      }

      const { event, data } = req.body;
      console.log(`OPay Webhook status: ${event}`, data);

      res.status(200).json({ received: true, status: "success" });
    } catch (err: any) {
      console.error("OPay Webhook Processing Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve statically built files from dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer();
