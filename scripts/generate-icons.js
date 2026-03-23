const fs = require("fs");
const path = require("path");

console.log("📱 Checking PWA icon requirements...\n");

const requiredIcons = [
  { name: "pwa-192x192.png", size: "192x192" },
  { name: "pwa-512x512.png", size: "512x512" },
  { name: "favicon.ico", size: "32x32 or 64x64" },
  { name: "apple-touch-icon.png", size: "180x180" },
  { name: "masked-icon.svg", size: "any" },
];

const publicDir = path.join(__dirname, "../public");
let missingIcons = [];

requiredIcons.forEach((icon) => {
  const iconPath = path.join(publicDir, icon.name);
  if (fs.existsSync(iconPath)) {
    console.log(`✅ ${icon.name} (${icon.size}) - Found`);
  } else {
    console.log(`❌ ${icon.name} (${icon.size}) - MISSING`);
    missingIcons.push(icon);
  }
});

if (missingIcons.length > 0) {
  console.log("\n⚠️  Missing icons detected!");
  console.log("Create these files in /public/ or download from:");
  console.log("https://www.favicon-generator.org/ (generate all formats)");

  // Create a simple HTML file to test icon generation
  const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Generate Icons</title>
</head>
<body>
  <h1>PWA Icon Generator</h1>
  <p>Upload a 512x512 PNG image to generate all required icons:</p>
  
  <div style="margin: 20px 0;">
    <input type="file" id="imageInput" accept="image/png,image/jpeg">
    <button onclick="generateIcons()">Generate Icons</button>
  </div>
  
  <script>
    function generateIcons() {
      const input = document.getElementById('imageInput');
      if (!input.files[0]) {
        alert('Please select an image first');
        return;
      }
      
      const img = new Image();
      img.onload = function() {
        if (this.width < 512 || this.height < 512) {
          alert('Image must be at least 512x512 pixels');
          return;
        }
        
        // Create canvas for each size
        const sizes = [512, 192, 180, 64, 32];
        
        sizes.forEach(size => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, size, size);
          
          // Trigger download
          const link = document.createElement('a');
          link.download = \`pwa-\${size}x\${size}.png\`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
        
        alert('Icons generated! Save them to /public/ folder');
      };
      
      img.src = URL.createObjectURL(input.files[0]);
    }
  </script>
</body>
</html>
  `;

  fs.writeFileSync(path.join(__dirname, "icon-generator.html"), testHtml);
  console.log(
    "\n📄 Generated icon-generator.html - open in browser to create icons"
  );
}
