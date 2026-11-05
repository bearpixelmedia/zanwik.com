import { readdirSync, statSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { enhanceSeoHtml } from "@/lib/seoEnhance";

export const dynamic = "force-static";
export const dynamicParams = false;

const MIRROR_ROOT = path.join(process.cwd(), "content", "mirror");

function resolveHtmlPath(slug: string[] | undefined): string {
  if (!slug || slug.length === 0) {
    return path.join(MIRROR_ROOT, "index.html");
  }
  return path.join(MIRROR_ROOT, ...slug, "index.html");
}

/** Collect every mirrored page for static generation. */
export function generateStaticParams(): { slug: string[] }[] {
  const params: { slug: string[] }[] = [{ slug: [] }];

  function walk(dir: string, parts: string[]) {
    let entries: string[] = [];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      const full = path.join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full, [...parts, name]);
      } else if (name === "index.html" && parts.length > 0) {
        params.push({ slug: parts });
      }
    }
  }

  walk(MIRROR_ROOT, []);
  return params;
}

export async function GET(
  _req: NextRequest,
  context: { params: { slug?: string[] } }
) {
  const filePath = resolveHtmlPath(context.params.slug);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(MIRROR_ROOT))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const raw = await readFile(resolved, "utf8");
    const html = enhanceSeoHtml(raw, context.params.slug);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
