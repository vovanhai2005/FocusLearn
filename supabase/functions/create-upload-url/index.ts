// filepath: supabase/functions/create-upload-url/index.ts
// Supabase Edge Function (Deno runtime)
// Creates a Cloudflare Stream direct-upload URL and returns it to the app.
// The app uploads the video directly to Cloudflare — this function never
// handles the video bytes, only the credential exchange.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const CF_ACCOUNT_ID = Deno.env.get("CF_ACCOUNT_ID");
  const CF_API_TOKEN = Deno.env.get("CF_API_TOKEN");

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error("[create-upload-url] Missing CF_ACCOUNT_ID or CF_API_TOKEN");
    return json({ error: "Upload service not configured" }, 503);
  }

  let maxDurationSeconds = 300;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.maxDurationSeconds === "number") {
      maxDurationSeconds = Math.min(Math.max(body.maxDurationSeconds, 60), 3600);
    }
  } catch {
    // use default
  }

  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds,
        requireSignedURLs: false,
      }),
    }
  );

  if (!cfRes.ok) {
    const errBody = await cfRes.text();
    console.error("[create-upload-url] Cloudflare error", cfRes.status, errBody);
    return json({ error: "Could not create upload URL" }, 502);
  }

  const cfData = await cfRes.json();
  const uploadURL: string | undefined = cfData?.result?.uploadURL;
  const videoId: string | undefined = cfData?.result?.uid;

  if (!uploadURL || !videoId) {
    console.error("[create-upload-url] Unexpected CF response", cfData);
    return json({ error: "Invalid response from upload service" }, 502);
  }

  return json({ uploadUrl: uploadURL, videoId });
});
