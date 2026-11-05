/**
 * Build-time / response HTML SEO enhancer.
 * Strengthens mirrored pages vs Krastor: canonicals, OG/Twitter consistency,
 * Ops Spec voice in JSON-LD, breadcrumbs, contactPoint.
 */

const SITE = "https://www.zanwik.com";

const ORG_DESC =
  "Zanwik helps Southeast mid-market operators (11–500 employees) turn expensive handoffs into supervised AI workflows. Map the leak, wire the fix into tools you already pay for, prove it in dollars, and keep a Run Desk on it. Western North Carolina roots; Southeast coverage.";

const HOME_PAGE_DESC =
  "AI that earns its keep in your operation. Zanwik wires supervised AI into the CRM, inbox, phones, and billing you already run — Ops Check free, Ops Spec from $1,500, Run Desk optional.";

function pathFromSlug(slug: string[] | undefined): string {
  if (!slug || slug.length === 0) return "/";
  return "/" + slug.join("/");
}

function absoluteUrl(pathname: string): string {
  if (pathname === "/") return `${SITE}/`;
  return `${SITE}${pathname}`;
}

function upsertMetaByName(html: string, name: string, content: string): string {
  const re = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]*>`,
    "i"
  );
  const tag = `<meta name="${name}" content="${escapeAttr(content)}"/>`;
  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function upsertMetaByProperty(html: string, property: string, content: string): string {
  const re = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]*>`,
    "i"
  );
  const tag = `<meta property="${property}" content="${escapeAttr(content)}"/>`;
  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function upsertLink(html: string, rel: string, href: string): string {
  const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*>`, "i");
  const tag = `<link rel="${rel}" href="${escapeAttr(href)}"/>`;
  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

function getMetaDescription(html: string): string | null {
  const m =
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i
    );
  return m ? m[1] : null;
}

function breadcrumbJsonLd(pathname: string, title: string): string {
  const parts = pathname === "/" ? [] : pathname.split("/").filter(Boolean);
  const items: object[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE}/`,
    },
  ];
  let acc = "";
  parts.forEach((part, i) => {
    acc += "/" + part;
    const isLast = i === parts.length - 1;
    const name = isLast
      ? title.replace(/\s*\|\s*Zanwik.*$/i, "").trim() || part
      : part
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
    items.push({
      "@type": "ListItem",
      position: i + 2,
      name,
      item: absoluteUrl(acc),
    });
  });
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  });
}

function hasSchemaType(html: string, type: string): boolean {
  return (
    html.includes(`"@type":"${type}"`) ||
    html.includes(`"@type": "${type}"`)
  );
}

function patchOrganizationSchema(html: string): string {
  // Refresh org description + ensure contactPoint (Ops Spec voice)
  return html.replace(
    /<script type="application\/ld\+json">(\s*\{[\s\S]*?"@type"\s*:\s*"ProfessionalService"[\s\S]*?\})\s*<\/script>/i,
    (full, body: string) => {
      try {
        const data = JSON.parse(body);
        data.description = ORG_DESC;
        data.url = SITE;
        data.email = "byron@zanwik.com";
        data.telephone = "+1-828-989-3682";
        data.areaServed = data.areaServed || [
          "North Carolina",
          "South Carolina",
          "Tennessee",
          "Georgia",
          "Florida",
          "Mississippi",
          "Southeast United States",
        ];
        data.knowsAbout = data.knowsAbout || [
          "AI implementation",
          "workflow automation",
          "Ops Spec",
          "Run Desk",
          "supervised AI agents",
        ];
        data.contactPoint = [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "byron@zanwik.com",
            telephone: "+1-828-989-3682",
            areaServed: "US",
            availableLanguage: ["English"],
          },
        ];
        if (data.address && data.address.addressLocality === "Clyde") {
          data.address.addressLocality = "Asheville";
          data.address.addressRegion = "NC";
        }
        // Retire Krastor-clone slogans left in JSON text fields
        const raw = JSON.stringify(data);
        const cleaned = raw
          .replace(
            /We build AI into how a business actually runs, then keep it running[^"]*/g,
            ORG_DESC
          )
          .replace(/based in Clyde, NC/gi, "based in Western North Carolina");
        return `<script type="application/ld+json">${cleaned}</script>`;
      } catch {
        return full;
      }
    }
  );
}

function patchHomeWebPageDescription(html: string, pathname: string): string {
  if (pathname !== "/") return html;
  return html.replace(
    /(<script type="application\/ld\+json">\s*\{[\s\S]*?"@type"\s*:\s*"WebPage"[\s\S]*?"description"\s*:\s*")([^"]*)(")/i,
    `$1${HOME_PAGE_DESC.replace(/"/g, '\\"')}$3`
  );
}

function ensureBreadcrumbs(html: string, pathname: string, title: string): string {
  if (pathname === "/") return html;
  if (hasSchemaType(html, "BreadcrumbList")) return html;
  const json = breadcrumbJsonLd(pathname, title);
  return html.replace(
    /<\/head>/i,
    `<script type="application/ld+json">${json}</script></head>`
  );
}

function fixDuplicateBrandTitle(html: string): string {
  // Title tag + RSC flight payloads may both carry "Zanwik | Zanwik"
  return html
    .replace(
      /<title>([^<]*?)\s*[|—]\s*Zanwik\s*\|\s*Zanwik\s*<\/title>/gi,
      "<title>$1 | Zanwik</title>"
    )
    .replace(/Zanwik\s*\|\s*Zanwik/g, "Zanwik");
}

/** Public entry: enhance one mirrored HTML document for the given slug. */
export function enhanceSeoHtml(
  html: string,
  slug: string[] | undefined
): string {
  const pathname = pathFromSlug(slug);
  const url = absoluteUrl(pathname);
  let out = html;

  out = fixDuplicateBrandTitle(out);

  const title = getTitle(out) || "Zanwik";
  let desc = getMetaDescription(out);

  // Strengthen thin legal / geo descriptions without inventing client claims
  if (pathname === "/privacy" || pathname === "/terms" || pathname === "/cookies") {
    const legalDescs: Record<string, string> = {
      "/privacy":
        "Privacy policy for zanwik.com — how Zanwik Inc. collects, uses, and protects personal data for Ops Check, Ops Spec, and Run Desk inquiries. Contact byron@zanwik.com.",
      "/terms":
        "Terms of service for zanwik.com and Zanwik Inc. AI implementation engagements (Ops Check, Ops Spec, Run Desk). Questions: byron@zanwik.com · 828-989-3682.",
      "/cookies":
        "Cookie policy for zanwik.com — what cookies Zanwik sets, why we use them, and how to control them. Contact byron@zanwik.com for privacy questions.",
    };
    desc = legalDescs[pathname];
    out = upsertMetaByName(out, "description", desc);
  } else if (desc && desc.length < 120 && pathname.startsWith("/ai-automation")) {
    const enriched = `${desc.replace(/\.\s*$/, "")}. Free Ops Check, fixed-fee Ops Spec, and optional Run Desk — Western NC roots, Southeast coverage.`;
    desc = enriched.slice(0, 160);
    out = upsertMetaByName(out, "description", desc);
  } else if (pathname === "/" && desc) {
    // Prefer Ops Spec home description when still Krastor-shaped
    if (/build AI into how your business runs/i.test(desc)) {
      desc = HOME_PAGE_DESC;
      out = upsertMetaByName(out, "description", desc);
    }
  }

  out = upsertLink(out, "canonical", url);
  out = upsertMetaByProperty(out, "og:url", url);
  out = upsertMetaByProperty(out, "og:locale", "en_US");
  out = upsertMetaByProperty(out, "og:site_name", "Zanwik");
  if (title) out = upsertMetaByProperty(out, "og:title", title);
  if (desc) {
    out = upsertMetaByProperty(out, "og:description", desc);
    out = upsertMetaByName(out, "twitter:description", desc);
  }
  out = upsertMetaByName(out, "twitter:card", "summary_large_image");
  if (title) out = upsertMetaByName(out, "twitter:title", title);
  // Default OG image already present on most pages; ensure twitter:image mirrors og:image when missing
  const ogImg = out.match(
    /property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogImg && !/name=["']twitter:image["']/i.test(out)) {
    out = upsertMetaByName(out, "twitter:image", ogImg[1]);
  }

  out = upsertMetaByName(
    out,
    "robots",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  );

  out = patchOrganizationSchema(out);
  out = patchHomeWebPageDescription(out, pathname);
  out = ensureBreadcrumbs(out, pathname, title);

  // Theme-color for mobile SERP chrome (Signal Teal)
  if (!/name=["']theme-color["']/i.test(out)) {
    out = upsertMetaByName(out, "theme-color", "#0F8A7A");
  }

  return out;
}
