import { serveStatic } from "hono/bun";
import type { ViteDevServer } from "vite";
import { createServer as createViteServer } from "vite";
import config from "./zosite.json";
import { Hono } from "hono";
import { Database } from "bun:sqlite";
import { mkdir } from "node:fs/promises";

// AI agents: read README.md for navigation and contribution guidance.
type Mode = "development" | "production";
const app = new Hono();
const mode: Mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

// ===== DATABASE =====
const DATA_DIR = "./data";
await mkdir(DATA_DIR, { recursive: true });
const db = new Database(`${DATA_DIR}/social-publisher.db`);
db.run("PRAGMA foreign_keys = ON");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    username TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TEXT,
    profile_image TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT,
    platforms TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    scheduled_at TEXT,
    published_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    fetched_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );
`);

const DEMO_USER_ID = 1;
const existingUser = db.query("SELECT id FROM users WHERE email = ?").get("demo@example.com");
if (!existingUser) {
  db.run("INSERT INTO users (email, name, plan) VALUES (?, ?, ?)", ["demo@example.com", "Demo User", "free"]);
}

const accountCount = (db.query("SELECT COUNT(*) as count FROM accounts WHERE user_id = ?").get(DEMO_USER_ID) as { count: number }).count;
if (accountCount === 0) {
  db.run("INSERT INTO accounts (user_id, platform, username, is_active) VALUES (?, ?, ?, ?)", [DEMO_USER_ID, "youtube", "@demouser", 1]);
  db.run("INSERT INTO accounts (user_id, platform, username, is_active) VALUES (?, ?, ?, ?)", [DEMO_USER_ID, "instagram", "@demouser", 1]);
  db.run("INSERT INTO accounts (user_id, platform, username, is_active) VALUES (?, ?, ?, ?)", [DEMO_USER_ID, "tiktok", "@demouser", 1]);
}

const postCount = (db.query("SELECT COUNT(*) as count FROM posts WHERE user_id = ?").get(DEMO_USER_ID) as { count: number }).count;
if (postCount === 0) {
  db.run("INSERT INTO posts (user_id, content, platforms, status) VALUES (?, ?, ?, ?)", [DEMO_USER_ID, "Check out these amazing AI tools that can transform your workflow! 🚀 #AI #Productivity", "youtube,instagram,tiktok", "draft"]);
  db.run("INSERT INTO posts (user_id, content, platforms, status, scheduled_at) VALUES (?, ?, ?, ?, ?)", [DEMO_USER_ID, "New video! 5 FREE AI Tools That Do $1,000 Worth of Work 💰", "youtube,instagram,tiktok", "scheduled", "2026-05-10 09:00:00"]);
  db.run("INSERT INTO posts (user_id, content, platforms, status, scheduled_at) VALUES (?, ?, ?, ?, ?)", [DEMO_USER_ID, "Quick tip: Use Claude for brainstorming, ChatGPT for writing, and Gemini for research 🤖", "youtube,tiktok", "scheduled", "2026-05-15 14:00:00"]);
  db.run("INSERT INTO posts (user_id, content, platforms, status, published_at) VALUES (?, ?, ?, ?, ?)", [DEMO_USER_ID, "Just launched! My complete guide to AI agents in 2026 🚀", "youtube,instagram,tiktok", "published", "2026-05-01 10:00:00"]);
  const publishedPost = db.query("SELECT id FROM posts WHERE user_id = ? AND status = 'published'").get(DEMO_USER_ID) as { id: number };
  if (publishedPost) {
    db.run("INSERT INTO analytics (post_id, platform, views, likes, comments, shares, reach, impressions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [publishedPost.id, "youtube", 5420, 342, 87, 45, 12000, 18000]);
    db.run("INSERT INTO analytics (post_id, platform, views, likes, comments, shares, reach, impressions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [publishedPost.id, "instagram", 3200, 280, 42, 28, 8500, 12000]);
    db.run("INSERT INTO analytics (post_id, platform, views, likes, comments, shares, reach, impressions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [publishedPost.id, "tiktok", 12500, 890, 156, 210, 25000, 35000]);
  }
}

// ===== API ROUTES =====

app.get("/api/accounts", (c) => {
  const accounts = db.query(`SELECT id, platform, username, profile_image, is_active, created_at FROM accounts WHERE user_id = ? ORDER BY platform`).all(DEMO_USER_ID);
  return c.json({ accounts });
});

app.post("/api/accounts", async (c) => {
  const { platform, username } = await c.req.json();
  const existing = db.query("SELECT id FROM accounts WHERE user_id = ? AND platform = ?").get(DEMO_USER_ID, platform);
  if (existing) return c.json({ error: `${platform} account already connected` }, 400);
  const result = db.query("INSERT INTO accounts (user_id, platform, username) VALUES (?, ?, ?) RETURNING *").run(DEMO_USER_ID, platform, username);
  return c.json({ account: result.get() }, 201);
});

app.delete("/api/accounts/:id", (c) => {
  db.run("DELETE FROM accounts WHERE id = ? AND user_id = ?", parseInt(c.req.param("id")), DEMO_USER_ID);
  return c.json({ success: true });
});

app.get("/api/posts", (c) => {
  const status = c.req.query("status");
  const platform = c.req.query("platform");
  let query = "SELECT * FROM posts WHERE user_id = ?";
  const params: any[] = [DEMO_USER_ID];
  if (status) { query += " AND status = ?"; params.push(status); }
  if (platform) { query += " AND platforms LIKE ?"; params.push(`%${platform}%`); }
  query += " ORDER BY created_at DESC";
  return c.json({ posts: db.query(query).all(...params) });
});

app.get("/api/posts/:id", (c) => {
  const post = db.query("SELECT * FROM posts WHERE id = ? AND user_id = ?").get(parseInt(c.req.param("id")), DEMO_USER_ID);
  if (!post) return c.json({ error: "Post not found" }, 404);
  return c.json({ post });
});

app.post("/api/posts", async (c) => {
  const { content, media_urls, platforms, scheduled_at } = await c.req.json();
  if (!content || !platforms) return c.json({ error: "Content and platforms are required" }, 400);
  const result = db.query(`INSERT INTO posts (user_id, content, media_urls, platforms, scheduled_at, status) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`).run(DEMO_USER_ID, content, JSON.stringify(media_urls || []), platforms, scheduled_at || null, scheduled_at ? "scheduled" : "draft");
  return c.json({ post: result.get() }, 201);
});

app.put("/api/posts/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { content, media_urls, platforms, scheduled_at, status } = await c.req.json();
  const existing = db.query("SELECT id FROM posts WHERE id = ? AND user_id = ?").get(id, DEMO_USER_ID);
  if (!existing) return c.json({ error: "Post not found" }, 404);
  const updates: string[] = []; const params: any[] = [];
  if (content !== undefined) { updates.push("content = ?"); params.push(content); }
  if (media_urls !== undefined) { updates.push("media_urls = ?"); params.push(JSON.stringify(media_urls)); }
  if (platforms !== undefined) { updates.push("platforms = ?"); params.push(platforms); }
  if (scheduled_at !== undefined) { updates.push("scheduled_at = ?"); params.push(scheduled_at); }
  if (status !== undefined) { updates.push("status = ?"); params.push(status); }
  if (updates.length === 0) return c.json({ error: "No fields to update" }, 400);
  params.push(id, DEMO_USER_ID);
  const result = db.query(`UPDATE posts SET ${updates.join(", ")} WHERE id = ? AND user_id = ? RETURNING *`).run(...params);
  return c.json({ post: result.get() });
});

app.delete("/api/posts/:id", (c) => {
  db.run("DELETE FROM posts WHERE id = ? AND user_id = ?", parseInt(c.req.param("id")), DEMO_USER_ID);
  return c.json({ success: true });
});

app.post("/api/posts/:id/publish", async (c) => {
  const id = parseInt(c.req.param("id"));
  const post = db.query("SELECT * FROM posts WHERE id = ? AND user_id = ?").get(id, DEMO_USER_ID) as any;
  if (!post) return c.json({ error: "Post not found" }, 404);
  db.run("UPDATE posts SET status = 'published', published_at = datetime('now') WHERE id = ?", id);
  for (const p of post.platforms.split(",")) {
    db.run("INSERT INTO analytics (post_id, platform, views, likes, comments, shares, reach, impressions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, p.trim(), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 200), Math.floor(Math.random() * 50), Math.floor(Math.random() * 30), Math.floor(Math.random() * 5000), Math.floor(Math.random() * 8000)]);
  }
  return c.json({ success: true });
});

app.get("/api/analytics", (c) => {
  const platform = c.req.query("platform");
  const period = c.req.query("period") || "30d";
  let dateFilter = "datetime('now', '-30 days')";
  if (period === "7d") dateFilter = "datetime('now', '-7 days')";
  else if (period === "90d") dateFilter = "datetime('now', '-90 days')";
  else if (period === "all") dateFilter = "datetime('now', '-1 year')";
  let query = `SELECT a.*, p.content, p.platforms, p.published_at FROM analytics a JOIN posts p ON a.post_id = p.id WHERE p.user_id = ? AND p.published_at >= ${dateFilter}`;
  const params: any[] = [DEMO_USER_ID];
  if (platform) { query += " AND a.platform = ?"; params.push(platform); }
  const analytics = db.query(query + " ORDER BY a.fetched_at DESC").all(...params);
  const totals = db.query(`SELECT platform, SUM(views) as views, SUM(likes) as likes, SUM(comments) as comments, SUM(shares) as shares, SUM(reach) as reach, SUM(impressions) as impressions FROM analytics a JOIN posts p ON a.post_id = p.id WHERE p.user_id = ? AND p.published_at >= ${dateFilter} GROUP BY platform`).all(DEMO_USER_ID);
  return c.json({ analytics, totals });
});

app.get("/api/calendar", (c) => {
  const month = c.req.query("month");
  let query = "SELECT id, content, platforms, status, scheduled_at, published_at FROM posts WHERE user_id = ? AND (status = 'scheduled' OR status = 'published')";
  const params: any[] = [DEMO_USER_ID];
  if (month) { query += " AND (scheduled_at LIKE ? OR published_at LIKE ?)"; params.push(`${month}%`, `${month}%`); }
  return c.json({ posts: db.query(query + " ORDER BY scheduled_at ASC").all(...params) });
});

// Development / Production config
if (mode === "production") {
  configureProduction(app);
} else {
  await configureDevelopment(app);
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : mode === "production" ? (config.publish?.published_port ?? config.local_port) : config.local_port;
export default { fetch: app.fetch, port, idleTimeout: 255 };

function configureProduction(app: Hono) {
  app.use("/assets/*", serveStatic({ root: "./dist" }));
  app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 302));
  app.use(async (c, next) => {
    if (c.req.method !== "GET") return next();
    const path = c.req.path;
    if (path.startsWith("/api/") || path.startsWith("/assets/")) return next();
    const file = Bun.file(`./dist${path}`);
    if (await file.exists()) { const stat = await file.stat(); if (stat && !stat.isDirectory()) return new Response(file); }
    return serveStatic({ path: "./dist/index.html" })(c, next);
  });
}

async function configureDevelopment(app: Hono): Promise<ViteDevServer> {
  const vite = await createViteServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/api/")) return next();
    if (c.req.path === "/favicon.ico") return c.redirect("/favicon.svg", 302);
    const url = c.req.path;
    try {
      if (url === "/" || url === "/index.html") {
        let template = await Bun.file("./index.html").text();
        template = await vite.transformIndexHtml(url, template);
        return c.html(template, { headers: { "Cache-Control": "no-store, must-revalidate" } });
      }
      const publicFile = Bun.file(`./public${url}`);
      if (await publicFile.exists()) { const stat = await publicFile.stat(); if (stat && !stat.isDirectory()) return new Response(publicFile, { headers: { "Cache-Control": "no-store, must-revalidate" } }); }
      let result;
      try { result = await vite.transformRequest(url); } catch { result = null; }
      if (result) return new Response(result.code, { headers: { "Content-Type": "application/javascript", "Cache-Control": "no-store, must-revalidate" } });
      let template = await Bun.file("./index.html").text();
      template = await vite.transformIndexHtml("/", template);
      return c.html(template, { headers: { "Cache-Control": "no-store, must-revalidate" } });
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      console.error(error);
      return c.text("Internal Server Error", 500);
    }
  });
  return vite;
}
