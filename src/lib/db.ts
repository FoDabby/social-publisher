import { Database } from "bun:sqlite";
import { mkdir } from "node:fs/promises";

const DB_PATH = "./data/social-publisher.db";

// Ensure data directory exists
await mkdir("./data", { recursive: true });

const db = new Database(DB_PATH);

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Create tables
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

// Create default user if not exists
const existingUser = db.query("SELECT id FROM users WHERE email = ?").get("demo@example.com");
if (!existingUser) {
  db.run("INSERT INTO users (email, name, plan) VALUES (?, ?, ?)", ["demo@example.com", "Demo User", "free"]);
}

const DEMO_USER_ID = 1;

// Seed demo data if tables are empty
const accountCount = db.query("SELECT COUNT(*) as count FROM accounts WHERE user_id = ?").get(DEMO_USER_ID) as { count: number };
if (accountCount.count === 0) {
  db.run(
    "INSERT INTO accounts (user_id, platform, username, is_active) VALUES (?, ?, ?, ?)",
    [DEMO_USER_ID, "youtube", "@demouser", 1]
  );
  db.run(
    "INSERT INTO accounts (user_id, platform, username, is_active) VALUES (?, ?, ?, ?)",
    [DEMO_USER_ID, "instagram", "@demouser", 1]
  );
  db.run(
    "INSERT INTO accounts (user_id, platform, username, is_active) VALUES (?, ?, ?, ?)",
    [DEMO_USER_ID, "tiktok", "@demouser", 1]
  );
}

const postCount = db.query("SELECT COUNT(*) as count FROM posts WHERE user_id = ?").get(DEMO_USER_ID) as { count: number };
if (postCount.count === 0) {
  // Draft post
  db.run(
    "INSERT INTO posts (user_id, content, platforms, status) VALUES (?, ?, ?, ?)",
    [DEMO_USER_ID, "Check out these amazing AI tools that can transform your workflow! 🚀 #AI #Productivity", "youtube,instagram,tiktok", "draft"]
  );
  // Scheduled post
  db.run(
    "INSERT INTO posts (user_id, content, platforms, status, scheduled_at) VALUES (?, ?, ?, ?, ?)",
    [DEMO_USER_ID, "New video! 5 FREE AI Tools That Do $1,000 Worth of Work 💰", "youtube,instagram,tiktok", "scheduled", "2026-05-10 09:00:00"]
  );
  // Another scheduled
  db.run(
    "INSERT INTO posts (user_id, content, platforms, status, scheduled_at) VALUES (?, ?, ?, ?, ?)",
    [DEMO_USER_ID, "Quick tip: Use Claude for brainstorming, ChatGPT for writing, and Gemini for research 🤖", "youtube,tiktok", "scheduled", "2026-05-15 14:00:00"]
  );
  // Published post
  db.run(
    "INSERT INTO posts (user_id, content, platforms, status, published_at) VALUES (?, ?, ?, ?, ?)",
    [DEMO_USER_ID, "Just launched! My complete guide to AI agents in 2026 🚀", "youtube,instagram,tiktok", "published", "2026-05-01 10:00:00"]
  );

  // Analytics for published post
  const publishedPost = db.query("SELECT id FROM posts WHERE user_id = ? AND status = 'published'").get(DEMO_USER_ID) as { id: number };
  if (publishedPost) {
    db.run(
      "INSERT INTO analytics (post_id, platform, views, likes, comments, shares, reach, impressions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [publishedPost.id, "youtube", 5420, 342, 87, 45, 12000, 18000]
    );
    db.run(
      "INSERT INTO analytics (post_id, platform, views, likes, comments, shares, reach, impressions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [publishedPost.id, "instagram", 3200, 280, 42, 28, 8500, 12000]
    );
    db.run(
      "INSERT INTO analytics (post_id, platform, views, likes, comments, shares, reach, impressions) VALUES (?, ?, ?, ?, ?, ?)",
      [publishedPost.id, "tiktok", 12500, 890, 156, 210, 25000, 35000]
    );
  }
}

export { db, DEMO_USER_ID };
