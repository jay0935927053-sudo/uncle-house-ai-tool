const GPT_MODEL = "gpt-5.6-terra";
const ALLOWED_ORIGINS = [
  "https://jay0935927053-sudo.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ message: "Method not allowed" }, 405, origin);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({ message: "Missing OPENAI_API_KEY Worker secret" }, 500, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ message: "Invalid JSON body" }, 400, origin);
    }

    const system = String(payload.system || "").trim();
    const user = String(payload.user || "").trim();

    if (!system || !user) {
      return jsonResponse({ message: "Missing system or user prompt" }, 400, origin);
    }

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: GPT_MODEL,
        max_completion_tokens: 8000,
        stream: true,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!upstream.ok) {
      const error = await upstream.json().catch(() => ({}));
      return jsonResponse(
        { message: error?.error?.message || `OpenAI API error ${upstream.status}` },
        upstream.status,
        origin
      );
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        ...corsHeaders(origin),
      },
    });
  },
};