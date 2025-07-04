import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const iconDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  // Make sure the directory exists
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  for (const size of sizes) {
    const svgPath = path.join(iconDir, `icon-${size}x${size}.svg`);
    const pngPath = path.join(iconDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      
      console.log(`Generated ${pngPath}`);
    } catch (error) {
      console.error(`Error generating ${pngPath}:`, error);
    }
  }
}

generateIcons().catch(console.error);
