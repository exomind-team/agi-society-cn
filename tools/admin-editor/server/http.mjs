import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EditorError } from "./store.mjs";
const BODY_LIMIT_BYTES = 1024 * 1024;
const ACTIONS = new Set(["read", "saveDraft", "preview", "publish", "history", "restore", "readVersion", "syncStatus"]);
const WEB_FILES = { "/": "index.html", "/index.html": "index.html", "/styles.css": "styles.css", "/core.js": "core.js", "/app.js": "app.js" };
function createHandler(store, { origin, readOnly = false, webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../web") } = {}) {
  const expected = new URL(origin);
  return async function handle(req, res) {
    const json = (status, value) => {
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      res.end(JSON.stringify(value));
    };
    try {
      if (req.headers.host !== expected.host) throw new EditorError("HOST_DENIED", "请求地址不匹配。", 403);
      if (req.headers.origin && req.headers.origin !== expected.origin) throw new EditorError("ORIGIN_DENIED", "不接受其他网站的请求。", 403);
      if (req.method === "GET" && req.url === "/api/pages") {
        json(200, { ...await store.list(), capabilities: { readOnly, authentication: "local-trusted-user-only", websitePublish: false, remoteSync: false } });
        return;
      }
      if (req.method === "POST" && req.url === "/api/action") {
        if (req.headers.origin !== expected.origin) throw new EditorError("ORIGIN_REQUIRED", "需要同源浏览器请求。", 403);
        if ((req.headers["content-type"] ?? "").split(";")[0].trim() !== "application/json") throw new EditorError("CONTENT_TYPE", "需要 JSON 请求。", 415);
        let bytes = 0;
        const chunks = [];
        for await (const chunk of req) {
          bytes += Buffer.byteLength(chunk);
          if (bytes > BODY_LIMIT_BYTES) throw new EditorError("REQUEST_TOO_LARGE", "单次请求超过原型服务预算，请保留输入并分批编辑。", 413);
          chunks.push(chunk);
        }
        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          throw new EditorError("INVALID_JSON", "请求不是有效 JSON。");
        }
        if (!body || typeof body !== "object" || Array.isArray(body) || !ACTIONS.has(body.action)) throw new EditorError("UNKNOWN_ACTION", "不支持此操作。");
        if (readOnly && ["saveDraft", "publish", "restore"].includes(body.action)) throw new EditorError("READ_ONLY", "当前服务为只读，未保存此次修改。", 403);
        json(200, await store[body.action](body));
        return;
      }
      if (req.method === "GET" && Object.hasOwn(WEB_FILES, req.url)) {
        const file = WEB_FILES[req.url];
        const content = await fs.readFile(path.join(webRoot, file));
        const type = file.endsWith(".html") ? "text/html" : file.endsWith(".css") ? "text/css" : "text/javascript";
        res.writeHead(200, { "Content-Type": type + "; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" });
        res.end(content);
        return;
      }
      throw new EditorError("NOT_FOUND", "找不到此资源。", 404);
    } catch (error) {
      json(error instanceof EditorError ? error.status : 500, { error: { code: error instanceof EditorError ? error.code : "INTERNAL_ERROR", message: error instanceof EditorError ? error.message : "服务未完成此次操作，请保留输入并检查服务日志。" } });
      if (!(error instanceof EditorError)) console.error(error);
    }
  };
}
function createLocalServer(store, { port = 8787, webRoot, readOnly = false } = {}) {
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Use an unprivileged port between 1024 and 65535");
  return http.createServer(createHandler(store, { origin: `http://127.0.0.1:${port}`, webRoot, readOnly }));
}
export {
  BODY_LIMIT_BYTES,
  createHandler,
  createLocalServer
};
