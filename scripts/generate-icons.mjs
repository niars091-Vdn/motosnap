// scripts/generate-icons.mjs
// Run: node scripts/generate-icons.mjs
// Requires: npm install sharp (once)

import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = join(__dir, '../public/icons')
mkdirSync(OUT, { recursive: true })

// SVG source — the MotoSnap logo
const SVG = `<svg width="512" height="512" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="44" fill="#2a6644"/>
  <g stroke="#e8dfc8" stroke-width="5" stroke-linecap="round" fill="none">
    <circle cx="100" cy="90" r="62"/>
    <line x1="100" y1="28" x2="62" y2="152"/>
    <line x1="100" y1="28" x2="138" y2="152"/>
    <line x1="38" y1="90" x2="152" y2="62"/>
    <line x1="38" y1="90" x2="145" y2="128"/>
    <line x1="162" y1="90" x2="55" y2="62"/>
    <line x1="162" y1="90" x2="55" y2="128"/>
  </g>
  <g stroke="#e8dfc8" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <circle cx="76" cy="148" r="22"/>
    <circle cx="148" cy="148" r="18"/>
    <path d="M76 148 L90 112 L118 108 L148 130 L148 148"/>
    <path d="M90 112 L105 98 L126 100 L118 108"/>
    <path d="M105 98 L108 82 L120 80 L118 96"/>
  </g>
  <text x="100" y="188" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#e8dfc8">MotoSnap</text>
</svg>`

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512]

const svgBuf = Buffer.from(SVG)

for (const size of SIZES) {
  const name = size === 180 ? 'apple-touch-icon' : `icon-${size}`
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(join(OUT, `${name}.png`))
  console.log(`✅ ${name}.png (${size}x${size})`)
}

// Favicon 32x32
await sharp(svgBuf).resize(32, 32).png().toFile(join(OUT, 'icon-32.png'))
console.log('✅ icon-32.png (32x32)')

// Also copy 32x32 as favicon.ico placeholder
writeFileSync(
  join(__dir, '../public/favicon.ico'),
  await sharp(svgBuf).resize(32, 32).png().toBuffer()
)
console.log('✅ favicon.ico')
console.log('\n🎉 Tutti gli icon generati in public/icons/')
