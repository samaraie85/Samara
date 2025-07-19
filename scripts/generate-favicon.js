const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512
};

async function generateFavicons() {
    const inputFile = path.join(__dirname, '../app/components/assets/logo.png');
    const publicDir = path.join(__dirname, '../public');

    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }

    // Generate PNG favicons
    for (const [filename, size] of Object.entries(sizes)) {
        await sharp(inputFile)
            .resize(size, size)
            .toFile(path.join(publicDir, filename));
    }

    // Generate ICO file
    await sharp(inputFile)
        .resize(32, 32)
        .toFile(path.join(publicDir, 'favicon.ico'));

    console.log('Favicons generated successfully!');
}

generateFavicons().catch(console.error); 