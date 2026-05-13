import zlib from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'

// CRC32 table
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c
}
function crc32(buf) {
  let crc = 0xffffffff
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcVal = Buffer.alloc(4)
  crcVal.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))
  return Buffer.concat([len, typeBytes, data, crcVal])
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2 // 8-bit RGB

  // Build pixel rows: 1 filter byte + size*3 RGB bytes per row
  const row = Buffer.alloc(1 + size * 3)
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b
  }
  const rows = []
  for (let y = 0; y < size; y++) rows.push(row)
  const idat = zlib.deflateSync(Buffer.concat(rows))

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('./public/icons', { recursive: true })

// #FF6B9D → R:255 G:107 B:157
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
for (const size of SIZES) {
  const buf = createPNG(size, 255, 107, 157)
  writeFileSync(`./public/icons/icon-${size}x${size}.png`, buf)
  console.log(`✓ icon-${size}x${size}.png`)
}
console.log('Done!')
