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
    // 1. Verify KV Binding
    if (!env.DASHBOARD_KV) {
      return new Response(
        JSON.stringify({ error: "Server Configuration Error: KV namespace DASHBOARD_KV not bound" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 2. List all keys with prefix "machine:"
    const listResult = await env.DASHBOARD_KV.list({ prefix: "machine:" });
    const machineKeys = listResult.keys;

    // 3. Fetch each machine's payload in parallel
    const fetchPromises = machineKeys.map(async (keyObj) => {
      const dataStr = await env.DASHBOARD_KV.get(keyObj.name);
      if (dataStr) {
        try {
          return JSON.parse(dataStr);
        } catch (e) {
          // Exclude corrupted JSON data quietly
          return null;
        }
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    const activeMachines = results.filter((m) => m !== null);

    // 4. Sort machines alphabetically by hostname for presentation consistency
    activeMachines.sort((a, b) => a.hostname.localeCompare(b.hostname));

    return new Response(JSON.stringify(activeMachines), {
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
