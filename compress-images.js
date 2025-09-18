/**
 * Image Compression Script for Chitralaya
 * This script helps compress images for better web performance
 * 
 * Usage: node compress-images.js
 * 
 * Requirements: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  inputDir: './assets',
  outputDir: './assets/compressed',
  quality: 80,
  maxWidth: 800,
  maxHeight: 800,
  formats: ['jpeg', 'webp']
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Recursively find all image files
function findImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findImageFiles(filePath, fileList);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Compress a single image
async function compressImage(inputPath, outputDir) {
  const fileName = path.basename(inputPath, path.extname(inputPath));
  const relativePath = path.relative(config.inputDir, inputPath);
  const outputSubDir = path.dirname(path.join(outputDir, relativePath));
  
  // Create output subdirectory if it doesn't exist
  if (!fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true });
  }
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Processing: ${inputPath}`);
    console.log(`Original size: ${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB`);
    
    // Resize if too large
    if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
      image.resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Generate compressed versions
    for (const format of config.formats) {
      const outputPath = path.join(outputSubDir, `${fileName}.${format}`);
      
      if (format === 'jpeg') {
        await image
          .jpeg({ quality: config.quality, progressive: true })
          .toFile(outputPath);
      } else if (format === 'webp') {
        await image
          .webp({ quality: config.quality })
          .toFile(outputPath);
      }
      
      const outputStats = fs.statSync(outputPath);
      console.log(`  ${format.toUpperCase()}: ${Math.round(outputStats.size / 1024)}KB`);
    }
    
    console.log('✅ Compressed successfully\n');
    
  } catch (error) {
    console.error(`❌ Error compressing ${inputPath}:`, error.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting image compression...\n');
  
  const imageFiles = findImageFiles(config.inputDir);
  console.log(`Found ${imageFiles.length} images to compress\n`);
  
  for (const imagePath of imageFiles) {
    await compressImage(imagePath, config.outputDir);
  }
  
  console.log('🎉 Image compression completed!');
  console.log(`\nCompressed images are saved in: ${config.outputDir}`);
  console.log('\nNext steps:');
  console.log('1. Review the compressed images');
  console.log('2. Update your code to use the compressed versions');
  console.log('3. Test the performance improvement');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { compressImage, findImageFiles };
