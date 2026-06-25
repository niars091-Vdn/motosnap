import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FEEDS = [
  { url: 'https://www.moto.it/rss/news.xml', src: 'Moto.it' },
  { url: 'https://www.moto.it/rss/news-motogp.xml', src: 'Moto.it MotoGP' },
  { url: 'https://it.motor1.com/rss/news/all/', src: 'Motor1' },
];

function extract(tag: string, xml: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function extractImg(xml: string): string {
  // 1. media:content
  let m = xml.match(/<media:content[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  // 2. media:thumbnail
  m = xml.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  // 3. enclosure immagine
  m = xml.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i);
  if (m) return m[1];
  // 4. image dentro content:encoded o description (anche CDATA)
  m = xml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return m[1];
  // 5. url generico a immagine .jpg/.png nel blocco
  m = xml.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i);
  if (m) return m[0];
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
        const items = xml.split(/<item>/i).slice(1, 8);
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
    { items: all.slice(0, 15) },
    { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate' } }
  );
}
