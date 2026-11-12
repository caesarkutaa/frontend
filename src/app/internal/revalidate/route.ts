import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

const ALLOWED_TAGS = new Set(['perfumes', 'brands', 'categories', 'settings']);

/** Called by the NestJS backend after admin changes */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: unknown };
  const tags = (Array.isArray(body.tags) ? body.tags : []).filter(
    (tag): tag is string => typeof tag === 'string' && ALLOWED_TAGS.has(tag),
  );

  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

  return NextResponse.json({ ok: true, revalidated: tags });
}