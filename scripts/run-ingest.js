#!/usr/bin/env node

/**
 * KSAM Deal - Manual Deal Ingestion Trigger (ES Module)
 * Usage:
 *   node scripts/run-ingest.js [category] [secret]
 * Example:
 *   node scripts/run-ingest.js electronics
 */

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://kavvzolevucqleoewlnf.supabase.co";
const ingestSecret = process.argv[3] || process.env.INGEST_SECRET || "dev-ingest-secret";
const category = process.argv[2] || "electronics";

const url = new URL(`${supabaseUrl}/functions/v1/ingest-deals`);

const postData = JSON.stringify({
  trigger: "manual",
  category
});

const req = https.request(
  url,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "X-Ingest-Secret": ingestSecret
    }
  },
  (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log(`\nHTTP Status: ${res.statusCode}`);
      try {
        const parsed = JSON.parse(body);
        console.log("Ingest Summary:\n", JSON.stringify(parsed, null, 2));
      } catch {
        console.log("Response:\n", body);
      }
      console.log("\nTo view the results in Supabase SQL editor:");
      console.log("  SELECT * FROM public.ingest_runs ORDER BY started_at DESC LIMIT 10;");
      console.log("  SELECT * FROM public.v_ingest_health;");
    });
  }
);

req.on("error", (e) => {
  console.error("Error triggering ingest:", e.message);
});

req.write(postData);
req.end();
