import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FEEDS = [
  { url: 'https://www.moto.it/rss', src: 'Moto.it' },
  { url: 'https://www.motociclismo.it/rss', src: 'Motociclismo' },
  { url: 'https://www.insella.it/feed', src: 'Insella.it' },
];

function extract(tag: string, xml: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function extractImg(xml: string): string {
  let m = xml.match(/<media:content[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  m = xml.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  m = xml.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i);
  if (m) return m[1];
  m = xml.match(/<img[^>]+src="([^"]+)"/i);
  if (m) return m[1];
  return '';
}

export async function GET() {
  const all: any[] = [];

  await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (MotoShotAI)' },
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return;
        const xml = await res.text();
        const items = xml.split(/<item>/i).slice(1, 5);
        items.forEach((raw) => {
          const block = raw.split(/<\/item>/i)[0];
          const title = extract('title', block);
          const link = extract('link', block).replace(/<[^>]+>/g, '').trim();
          const pubDate = extract('pubDate', block);
          const img = extractImg(block);
          if (title && link) {
            all.push({ t: title, src: feed.src, url: link, img, pubDate });
          }
        });
      } catch {}
    })
  );

  all.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  return NextResponse.json(
    { items: all.slice(0, 6) },
    { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate' } }
  );
}

