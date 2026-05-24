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

    // 2. Read the fast-index key to avoid quota-restricted list() operations (Class A, 1k limit)
    const indexKey = "machines_index";
    let hostnames = [];
    const indexStr = await env.DASHBOARD_KV.get(indexKey);

    if (indexStr) {
      try {
        hostnames = JSON.parse(indexStr);
      } catch (e) {
        hostnames = [];
      }
    } else {
      // Self-healing Bootstrap fallback: If the index does not exist yet (first load),
      // we perform a one-time list() and populate the index automatically.
      const listResult = await env.DASHBOARD_KV.list({ prefix: "machine:" });
      hostnames = listResult.keys.map((k) => k.name.substring(8)); // strip "machine:" prefix
      if (hostnames.length > 0) {
        await env.DASHBOARD_KV.put(indexKey, JSON.stringify(hostnames));
      }
    }

    // 3. Fetch each machine's payload in parallel using Class B get() reads (100k daily free limit!)
    const fetchPromises = hostnames.map(async (host) => {
      const kvKey = `machine:${host.toLowerCase().trim()}`;
      const dataStr = await env.DASHBOARD_KV.get(kvKey);
      if (dataStr) {
        try {
          return JSON.parse(dataStr);
        } catch (e) {
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
