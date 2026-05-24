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

    // 3. Save to Cloudflare D1 Database
    if (!env.DASHBOARD_DB) {
      return new Response(
        JSON.stringify({ error: "Server Configuration Error: D1 database DASHBOARD_DB not bound" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const normalizedHost = hostname.toLowerCase().trim();
    const finalMachineType = machine_type || os;
    const uptimeSecs = parseInt(uptime_seconds) || 0;
    const now = Date.now();
    const disksJson = JSON.stringify(disks);

    const stmt = env.DASHBOARD_DB.prepare(
      `INSERT INTO machines (hostname, machine_type, os, uptime_seconds, last_seen, disks) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON CONFLICT(hostname) DO UPDATE SET 
         machine_type=excluded.machine_type,
         os=excluded.os,
         uptime_seconds=excluded.uptime_seconds,
         last_seen=excluded.last_seen,
         disks=excluded.disks`
    );

    await stmt.bind(normalizedHost, finalMachineType, os, uptimeSecs, now, disksJson).run();

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
