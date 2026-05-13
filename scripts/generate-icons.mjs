import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('./public/icons', { recursive: true })

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of SIZES) {
  await sharp('./public/mwohae_icon.png')
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(`./public/icons/icon-${size}x${size}.png`)
  console.log(`✓ icon-${size}x${size}.png`)
}

// favicon.ico 대신 사용할 favicon.png (32x32)
await sharp('./public/mwohae_icon.png')
  .resize(32, 32, { fit: 'cover' })
  .png()
  .toFile('./public/favicon.png')
console.log('✓ favicon.png')

// Apple touch icon (180x180)
await sharp('./public/mwohae_icon.png')
  .resize(180, 180, { fit: 'cover' })
  .png()
  .toFile('./public/apple-touch-icon.png')
console.log('✓ apple-touch-icon.png')

console.log('Done!')
