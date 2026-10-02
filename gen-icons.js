const sharp = require('sharp');
const fs = require('fs');

const svg = fs.readFileSync('icon.svg');

(async () => {
  // any-purpose
  await sharp(svg).resize(512, 512).png().toFile('icon-512.png');
  await sharp(svg).resize(192, 192).png().toFile('icon-192.png');
  // maskable: sama (bg full-bleed aman untuk mask)
  await sharp(svg).resize(512, 512).png().toFile('maskable-512.png');
  console.log('OK: icon-512.png, icon-192.png, maskable-512.png dibuat');
})();
