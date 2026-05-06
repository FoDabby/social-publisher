import { Hono } from "hono";
import { db, DEMO_USER_ID } from "../src/lib/db";

const app = new Hono();

// ===== ACCOUNTS =====

app.get("/api/accounts", (c) => {
  const accounts = db
    .query(
      `SELECT id, platform, username, profile_image, is_active, created_at 
       FROM accounts WHERE user_id = ? ORDER BY platform`
    )
    .all(DEMO_USER_ID);
  return c.json({ accounts });
});

app.post("/api/accounts", async (c) => {
  const { platform, username } = await c.req.json();
  
  const existing = db
    .query("SELECT id FROM accounts WHERE user_id = ? AND platform = ?")
    .get(DEMO_USER_ID, platform);
  
  if (existing) {
    return c.json({ error: `${platform} account already connected` }, 400);
  }
  
  const result = db
    .query(
      "INSERT INTO accounts (user_id, platform, username) VALUES (?, ?, ?) RETURNING *"
    )
    .run(DEMO_USER_ID, platform, username);
  
  return c.json({ account: result.get() }, 201);
});

app.delete("/api/accounts/:id", (c) => {
  const id = parseInt(c.req.param("id"));
  db.run("DELETE FROM accounts WHERE id = ? AND user_id = ?", id, DEMO_USER_ID);
  return c.json({ success: true });
});

// ===== POSTS =====

app.get("/api/posts", (c) => {
  const status = c.req.query("status");
  const platform = c.req.query("platform");
  
  let query = "SELECT * FROM posts WHERE user_id = ?";
  const params: any[] = [DEMO_USER_ID];
  
  if (status) {
    query += " AND status = ?";
    params.push(status);
  }
  if (platform) {
    query += " AND platforms LIKE ?";
    params.push(`%${platform}%`);
  }
  
  query += " ORDER BY created_at DESC";
  
  const posts = db.query(query).all(...params);
  return c.json({ posts });
});

app.get("/api/posts/:id", (c) => {
  const id = parseInt(c.req.param("id"));
  const post = db
    .query("SELECT * FROM posts WHERE id = ? AND user_id = ?")
    .get(id, DEMO_USER_ID);
  
  if (!post) return c.json({ error: "Post not found" }, 404);
  return c.json({ post });
});

app.post("/api/posts", async (c) => {
  const { content, media_urls, platforms, scheduled_at } = await c.req.json();
  
  if (!content || !platforms) {
    return c.json({ error: "Content and platforms are required" }, 400);
  }
  
  const result = db
    .query(
      `INSERT INTO posts (user_id, content, media_urls, platforms, scheduled_at, status) 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
    )
    .run(
      DEMO_USER_ID,
      content,
      JSON.stringify(media_urls || []),
      platforms,
      scheduled_at || null,
      scheduled_at ? "scheduled" : "draft"
    );
  
  return c.json({ post: result.get() }, 201);
});

app.put("/api/posts/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { content, media_urls, platforms, scheduled_at, status } = await c.req.json();
  
  const existing = db
    .query("SELECT id FROM posts WHERE id = ? AND user_id = ?")
    .get(id, DEMO_USER_ID);
  
  if (!existing) return c.json({ error: "Post not found" }, 404);
  
  const updates: string[] = [];
  const params: any[] = [];
  
  if (content !== undefined) { updates.push("content = ?"); params.push(content); }
  if (media_urls !== undefined) { updates.push("media_urls = ?"); params.push(JSON.stringify(media_urls)); }
  if (platforms !== undefined) { updates.push("platforms = ?"); params.push(platforms); }
  if (scheduled_at !== undefined) { updates.push("scheduled_at = ?"); params.push(scheduled_at); }
  if (status !== undefined) { updates.push("status = ?"); params.push(status); }
  
  if (updates.length === 0) return c.json({ error: "No fields to update" }, 400);
  
  params.push(id, DEMO_USER_ID);
  
  const result = db
    .query(`UPDATE posts SET ${updates.join(", ")} WHERE id = ? AND user_id = ? RETURNING *`)
    .run(...params);
  
  return c.json({ post: result.get() });
});

app.delete("/api/posts/:id", (c) => {
  const id = parseInt(c.req.param("id"));
  db.run("DELETE FROM posts WHERE id = ? AND user_id = ?", id, DEMO_USER_ID);
  return c.json({ success: true });
});

app.post("/api/posts/:id/publish", async (c) => {
  const id = parseInt(c.req.param("id"));
  
  const post = db
    .query("SELECT * FROM posts WHERE id = ? AND user_id = ?")
    .get(id, DEMO_USER_ID) as any;
  
  if (!post) return c.json({ error: "Post not found" }, 404);
  
  db.run(
    "UPDATE posts SET status = 'published', published_at = datetime('now') WHERE id = ?",
    id
  );
  
  // Simulate analytics being created
  const platforms = post.platforms.split(",");
  for (const platform of platforms) {
    db.run(
      `INSERT INTO analytics (post_id, platform, views, likes, comments, shares, reach, impressions) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, platform.trim(), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 200), Math.floor(Math.random() * 50), Math.floor(Math.random() * 30), Math.floor(Math.random() * 5000), Math.floor(Math.random() * 8000)]
    );
  }
  
  return c.json({ success: true, message: `Post published to ${platforms.join(", ")}` });
});

// ===== ANALYTICS =====

app.get("/api/analytics", (c) => {
  const platform = c.req.query("platform");
  const period = c.req.query("period") || "30d";
  
  let dateFilter = "datetime('now', '-30 days')";
  if (period === "7d") dateFilter = "datetime('now', '-7 days')";
  else if (period === "90d") dateFilter = "datetime('now', '-90 days')";
  else if (period === "all") dateFilter = "datetime('now', '-1 year')";
  
  let query = `
    SELECT a.*, p.content, p.platforms, p.published_at 
    FROM analytics a 
    JOIN posts p ON a.post_id = p.id 
    WHERE p.user_id = ? AND p.published_at >= ${dateFilter}
  `;
  const params: any[] = [DEMO_USER_ID];
  
  if (platform) {
    query += " AND a.platform = ?";
    params.push(platform);
  }
  
  query += " ORDER BY a.fetched_at DESC";
  
  const analytics = db.query(query).all(...params);
  
  // Aggregate totals
  const totals = db
    .query(
      `SELECT platform, 
              SUM(views) as views, SUM(likes) as likes, SUM(comments) as comments,
              SUM(shares) as shares, SUM(reach) as reach, SUM(impressions) as impressions
       FROM analytics a 
       JOIN posts p ON a.post_id = p.id 
       WHERE p.user_id = ? AND p.published_at >= ${dateFilter}
       GROUP BY platform`,
      { type: "all" }
    )
    .all(DEMO_USER_ID);
  
  return c.json({ analytics, totals });
});

app.get("/api/calendar", (c) => {
  const month = c.req.query("month"); // YYYY-MM format
  
  let query = `
    SELECT id, content, platforms, status, scheduled_at, published_at 
    FROM posts 
    WHERE user_id = ? AND (status = 'scheduled' OR status = 'published')
  `;
  const params: any[] = [DEMO_USER_ID];
  
  if (month) {
    query += ` AND (scheduled_at LIKE ? OR published_at LIKE ?)`;
    params.push(`${month}%`, `${month}%`);
  }
  
  query += " ORDER BY scheduled_at ASC";
  
  const posts = db.query(query).all(...params);
  return c.json({ posts });
});

export default app;
