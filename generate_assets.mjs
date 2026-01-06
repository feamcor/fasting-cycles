
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_IMAGE = process.argv[2];
const PUBLIC_DIR = path.resolve('public');
const ASSETS_DIR = path.resolve('src/assets');

if (!SOURCE_IMAGE || !fs.existsSync(SOURCE_IMAGE)) {
    console.error('Please provide a valid source image path.');
    console.error('Usage: node generate_assets.mjs <source_image_path>');
    process.exit(1);
}

async function generateAssets() {
    console.log(`Generating assets from ${SOURCE_IMAGE}...`);

    try {
        // 1. Pre-process: Trim aggressive to remove artifacts and zoom in

        // Trim with threshold 50 to catch near-white
        const trimmedBuffer = await sharp(SOURCE_IMAGE)
            .trim({ threshold: 50 })
            .toBuffer();

        const metadata = await sharp(trimmedBuffer).metadata();
        const size = Math.max(metadata.width, metadata.height);

        // ZOOM FACTOR: 1.25x to significantly reduce padding
        const ZOOM = 1.25;
        const zoomedSize = Math.round(size * ZOOM);

        // Create the circle mask
        const circleSvg = Buffer.from(
            `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" /></svg>`
        );

        // Resize to zoomed size then extract center
        const processedBuffer = await sharp(trimmedBuffer)
            .resize(zoomedSize, zoomedSize, {
                fit: 'cover',
                position: 'center',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .extract({
                left: Math.round((zoomedSize - size) / 2),
                top: Math.round((zoomedSize - size) / 2),
                width: size,
                height: size
            })
            .composite([{
                input: circleSvg,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();

        console.log(`Processed source image: trimmed to ${metadata.width}x${metadata.height}, zoomed 1.1x.`);

        // 2. Output files

        await sharp(processedBuffer)
            .resize(192, 192)
            .toFile(path.join(PUBLIC_DIR, 'pwa-192x192.png'));
        console.log('Created pwa-192x192.png');

        await sharp(processedBuffer)
            .resize(512, 512)
            .toFile(path.join(PUBLIC_DIR, 'pwa-512x512.png'));
        console.log('Created pwa-512x512.png');

        await sharp(processedBuffer)
            .resize(64, 64)
            .toFile(path.join(PUBLIC_DIR, 'logo-64.png'));
        console.log('Created logo-64.png');

        await sharp(processedBuffer)
            .resize(180, 180)
            .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
        console.log('Created apple-touch-icon.png');

        await sharp(processedBuffer)
            .resize(512, 512)
            .toFile(path.join(ASSETS_DIR, 'logo.png'));
        console.log('Updated src/assets/logo.png');

        await sharp(processedBuffer)
            .resize(512, 512)
            .toFile(path.join(PUBLIC_DIR, 'logo.png'));
        console.log('Updated public/logo.png');

    } catch (err) {
        console.error('Error processing image:', err);
        process.exit(1);
    }
}

generateAssets();
