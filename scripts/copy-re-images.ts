import * as fs from 'fs';
import * as path from 'path';

const srcDir = path.join(__dirname, '../re');
const destDir = path.join(__dirname, '../public/uploads');
const galleryHtmlPath = path.join(__dirname, '../public/re-gallery.html');

function main() {
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory ${srcDir} does not exist.`);
    return;
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created destination directory ${destDir}`);
  }

  const files = fs.readdirSync(srcDir);
  console.log(`Found ${files.length} files in ${srcDir}.`);

  const copiedFiles: string[] = [];

  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    // Only copy if it's a file
    const stat = fs.statSync(srcFile);
    if (stat.isFile()) {
      fs.copyFileSync(srcFile, destFile);
      copiedFiles.push(file);
    }
  }

  console.log(`Successfully copied ${copiedFiles.length} files to public/uploads.`);

  // Generate gallery HTML
  let html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GMF Bilder Galerie</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 24px;
    }
    h1 {
      text-align: center;
      color: #3b82f6;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }
    .card {
      background-color: white;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }
    .img-container {
      width: 100%;
      height: 200px;
      background-color: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    img {
      width: 100%;
      height: 100%;
      object-cover: cover;
    }
    .info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-grow: 1;
    }
    .filename {
      font-weight: bold;
      word-break: break-all;
    }
    .size {
      color: #64748b;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <h1>GMF Eventmodule Bilder Galerie</h1>
  <p style="text-align: center;">Hier sind die Bilder aus dem Ordner <strong>/re</strong>, die nach <strong>/public/uploads</strong> kopiert wurden.</p>
  
  <div class="grid">
  `;

  for (const file of copiedFiles) {
    const sizeBytes = fs.statSync(path.join(destDir, file)).size;
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    html += `
    <div class="card">
      <div class="img-container">
        <img src="/uploads/${file}" alt="${file}">
      </div>
      <div class="info">
        <div class="filename">${file}</div>
        <div class="size">Größe: ${sizeMb} MB (${sizeBytes} Bytes)</div>
      </div>
    </div>
    `;
  }

  html += `
  </div>
</body>
</html>
  `;

  fs.writeFileSync(galleryHtmlPath, html);
  console.log(`Generated HTML gallery at ${galleryHtmlPath}`);
}

main();
