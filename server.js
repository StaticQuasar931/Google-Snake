const http = require("http");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = 8787;
const root = __dirname;
const googleRoot = path.join(root, "vendor", "google");
const blankPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9oNcamQAAAAASUVORK5CYII=",
  "base64"
);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".bin": "application/octet-stream"
};

function resolvePath(urlObject) {
  const pathname = decodeURIComponent(urlObject.pathname);
  const xjsKind = urlObject.searchParams.get("xjs");

  if (pathname === "/" || pathname === "/index.html") return path.join(root, "index.html");
  if (pathname === "/google-snake-local.html") return path.join(root, "google-snake-local.html");
  if (pathname === "/gen_204") return null;

  if (pathname.startsWith("/xjs/_/ss/")) {
    return path.join(root, "assets", "vendor", "snake.css");
  }

  if (pathname.startsWith("/xjs/_/js/")) {
    if (xjsKind === "s3") return path.join(root, "assets", "vendor", "snake-s3.js");
    if (xjsKind === "s4") return path.join(root, "assets", "vendor", "snake-s4.js");
    if (pathname.includes("/md=2/")) {
      return path.join(googleRoot, "www.google.com", "xjs", "_", "js", "md=2", "main-md2.js");
    }
    return path.join(googleRoot, "www.google.com", "xjs", "_", "js", "main.js");
  }

  if (pathname.startsWith("/logos/")) {
    return path.join(googleRoot, "www.google.com", pathname.slice(1));
  }

  if (pathname.startsWith("/images/")) {
    return path.join(googleRoot, "www.google.com", pathname.slice(1));
  }

  if (pathname.startsWith("/www.gstatic.com/")) {
    return path.join(googleRoot, pathname.slice(1));
  }

  if (pathname.startsWith("/fonts.gstatic.com/")) {
    return path.join(googleRoot, pathname.slice(1));
  }

  if (pathname.startsWith("/ssl.gstatic.com/")) {
    const exact = path.join(googleRoot, pathname.slice(1));
    if (fs.existsSync(exact)) return exact;

    if (pathname === "/ssl.gstatic.com/ui/social/fb_32x32.png") {
      return path.join(googleRoot, "ssl.gstatic.com", "kpui", "social", "fb_32x32.png");
    }
    if (pathname === "/ssl.gstatic.com/ui/social/whatsapp_solid_bg_36x36.png") {
      return path.join(googleRoot, "ssl.gstatic.com", "kpui", "social", "whatsapp_solid_bg_36x36.png");
    }
    if (pathname === "/ssl.gstatic.com/ui/social/x_32x32.png") {
      return path.join(googleRoot, "ssl.gstatic.com", "kpui", "social", "x_32x32.png");
    }
    if (pathname === "/ssl.gstatic.com/ui/v1/icons/common/x_8px.png") {
      return "__blank_png__";
    }
  }

  return path.join(root, pathname.replace(/^\/+/, ""));
}

http.createServer((req, res) => {
  const urlObject = new URL(req.url || "/", `http://${host}:${port}`);

  if (urlObject.pathname === "/gen_204") {
    res.writeHead(204);
    res.end();
    return;
  }

  const filePath = resolvePath(urlObject);
  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  if (filePath === "__blank_png__") {
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    });
    res.end(blankPng);
    return;
  }

  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      const code = error.code === "ENOENT" ? 404 : 500;
      res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(code === 404 ? "Not found" : "Server error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}).listen(port, host, () => {
  console.log(`Google Snake local server running at http://${host}:${port}`);
  if (process.argv.includes("--open") && process.platform === "win32") {
    exec(`start "" "http://${host}:${port}"`);
  }
});
