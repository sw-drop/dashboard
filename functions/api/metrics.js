// ==============================================================================
// Cloudflare Pages Function - GET /api/metrics
// ==============================================================================

export async function onRequestOptions(context) {
  // Handle CORS preflight requests
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function onRequestGet(context) {
  const { env } = context;

  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=10", // Fast browser cache, keeps queries speedy
  };

  try {
    // 1. Verify D1 Binding
    if (!env.DASHBOARD_DB) {
      return new Response(
        JSON.stringify({ error: "Server Configuration Error: D1 database DASHBOARD_DB not bound" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 2. Query D1
    const { results } = await env.DASHBOARD_DB.prepare("SELECT * FROM machines ORDER BY hostname ASC").all();

    // 3. Format results for frontend compatibility
    const formattedResults = results.map(row => {
      let parsedDisks = [];
      try {
        parsedDisks = JSON.parse(row.disks);
      } catch (e) {}

      return {
        hostname: row.hostname,
        machine_type: row.machine_type,
        os: row.os,
        uptime_seconds: row.uptime_seconds,
        lastSeen: new Date(row.last_seen).toISOString(),
        disks: parsedDisks
      };
    });

    return new Response(JSON.stringify(formattedResults), {
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
