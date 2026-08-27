const http = require("http");

// Reaches each products own auth-service via the hosts already-published
// port instead of joining every projects internal docker network directly
// -- keeps this gateway decoupled from both products internals.
//
// Any hostname that isn't a *.zetsite.com or *.zetsales.com subdomain falls
// through to zetsite's own allow endpoint -- that's also where merchant
// custom-domain connections live (isDomainConnected in domainController.ts),
// and zetsales has no equivalent custom-domain feature today. Without this
// fallback, every zetsite custom domain 404s here and never gets a cert.
http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const domain = (url.searchParams.get("domain") || "").toLowerCase();

  if (!domain) {
    res.writeHead(400);
    return res.end();
  }

  let target;
  if (domain === "zetsales.com" || domain.endsWith(".zetsales.com")) {
    target = `http://host.docker.internal:3011/api/v1/auth/subdomains/allow?domain=${encodeURIComponent(domain)}`;
  } else {
    target = `http://host.docker.internal:4012/api/v1/auth/subdomains/allow?domain=${encodeURIComponent(domain)}`;
  }

  try {
    const r = await fetch(target);
    res.writeHead(r.status);
  } catch (err) {
    console.error("ask-gateway upstream error:", err.message);
    res.writeHead(502);
  }
  res.end();
}).listen(9999, () => console.log("edge-ask-gateway listening on :9999"));
