const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));
copyDir(path.join(root, "css"), path.join(dist, "css"));
copyDir(path.join(root, "js"), path.join(dist, "js"));
copyDir(path.join(root, "assets"), path.join(dist, "assets"));

const threeSource = path.join(root, "node_modules", "three", "build", "three.min.js");
if (!fs.existsSync(threeSource)) {
  console.error("Three.js bulunamadı. Önce npm install çalıştırın.");
  process.exit(1);
}
fs.mkdirSync(path.join(dist, "js"), { recursive: true });
fs.copyFileSync(threeSource, path.join(dist, "js", "three.min.js"));
console.log("Build tamamlandı: dist/");
