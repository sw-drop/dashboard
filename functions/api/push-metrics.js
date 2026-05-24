// ==============================================================================
// Cloudflare Pages Function - POST /api/push-metrics
// ==============================================================================

export async function onRequestOptions(context) {
  // Handle CORS preflight requests
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get("Authorization");
    const expectedToken = env.API_SECRET_TOKEN || "f3b9c4501a2d4807a9e3a6c9d2f5e70c";

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or malformed Authorization header" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = authHeader.substring(7).trim();
    if (token !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid secret API token" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // 2. Parse and Validate Payload
    const payload = await request.json();
    const { hostname, machine_type, os, uptime_seconds, disks } = payload;

    if (!hostname || !os || !Array.isArray(disks)) {
      return new Response(
        JSON.stringify({ error: "Bad Request: Missing required payload fields (hostname, os, disks)" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Construct Unified System State
    const systemState = {
      hostname,
      machine_type: machine_type || os,
      os,
      uptime_seconds: parseInt(uptime_seconds) || 0,
      disks,
      lastSeen: new Date().toISOString(),
    };

    // 4. Save to Cloudflare KV Namespace
    // Note: The KV binding must be named 'DASHBOARD_KV' in your Cloudflare dashboard
    if (!env.DASHBOARD_KV) {
      return new Response(
        JSON.stringify({ error: "Server Configuration Error: KV namespace DASHBOARD_KV not bound" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const normalizedHost = hostname.toLowerCase().trim();
    const kvKey = `machine:${normalizedHost}`;
    await env.DASHBOARD_KV.put(kvKey, JSON.stringify(systemState));

    // Maintain a fast-read machines index to avoid costly and quota-restricted list() operations
    const indexKey = "machines_index";
    let machines = [];
    const indexStr = await env.DASHBOARD_KV.get(indexKey);
    if (indexStr) {
      try {
        machines = JSON.parse(indexStr);
      } catch (e) {
        machines = [];
      }
    }

    if (!machines.includes(normalizedHost)) {
      machines.push(normalizedHost);
      await env.DASHBOARD_KV.put(indexKey, JSON.stringify(machines));
    }

    return new Response(JSON.stringify({ success: true, message: "Telemetry saved successfully" }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Internal Server Error: ${error.message}` }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
