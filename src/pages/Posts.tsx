import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Send, Clock, X } from "lucide-react";

interface Post {
  id: number;
  content: string;
  media_urls: string;
  platforms: string;
  status: string;
  scheduled_at?: string;
  published_at?: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    platforms: [] as string[],
    scheduled_at: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data.posts || []);
  }

  function openCreate() {
    setEditingPost(null);
    setFormData({ content: "", platforms: [], scheduled_at: "" });
    setShowModal(true);
  }

  function openEdit(post: Post) {
    setEditingPost(post);
    setFormData({
      content: post.content,
      platforms: post.platforms.split(",").map((p) => p.trim()),
      scheduled_at: post.scheduled_at ? post.scheduled_at.slice(0, 16) : "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.platforms.length === 0) {
      alert("Select at least one platform");
      return;
    }

    const payload = {
      content: formData.content,
      platforms: formData.platforms.join(","),
      scheduled_at: formData.scheduled_at || null,
    };

    if (editingPost) {
      await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowModal(false);
    fetchPosts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  async function handlePublish(post: Post) {
    if (!confirm(`Publish this post to ${post.platforms}?`)) return;
    await fetch(`/api/posts/${post.id}/publish`, { method: "POST" });
    fetchPosts();
  }

  const platforms = ["youtube", "instagram", "tiktok"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Posts</h1>
          <p className="text-muted-foreground mt-1">Create and manage your social media posts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {/* Posts List */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="divide-y">
          {posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-muted/50 transition">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{post.content}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex gap-1">
                      {post.platforms.split(",").map((p) => (
                        <span
                          key={p}
                          className={`px-2 py-0.5 rounded text-xs ${
                            p.trim() === "youtube" ? "bg-red-500/20 text-red-600" :
                            p.trim() === "instagram" ? "bg-pink-500/20 text-pink-600" :
                            "bg-cyan-500/20 text-cyan-600"
                          }`}
                        >
                          {p.trim()}
                        </span>
                      ))}
                    </div>
                    {post.scheduled_at && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(post.scheduled_at).toLocaleString()}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      post.status === "published" ? "bg-green-500/20 text-green-600" :
                      post.status === "scheduled" ? "bg-amber-500/20 text-amber-600" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.status !== "published" && (
                    <button
                      onClick={() => handlePublish(post)}
                      className="p-2 text-green-600 hover:bg-green-500/10 rounded-lg transition"
                      title="Publish now"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No posts yet</p>
              <button onClick={openCreate} className="mt-2 text-primary hover:underline">
                Create your first post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingPost ? "Edit Post" : "Create Post"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full h-32 px-3 py-2 bg-muted border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="What do you want to share?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        const plat = formData.platforms.includes(p)
                          ? formData.platforms.filter((x) => x !== p)
                          : [...formData.platforms, p];
                        setFormData({ ...formData, platforms: plat });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition ${
                        formData.platforms.includes(p)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/70"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm hover:bg-muted rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition"
                >
                  {editingPost ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
