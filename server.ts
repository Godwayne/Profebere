import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

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
