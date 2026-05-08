import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Film, X, Sparkles, Calendar, Send, Wand2 } from "lucide-react";

interface MediaItem {
  url: string;
  type: string;
  filename: string;
  size: number;
}

export default function Studio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["youtube"]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingCaption, setGeneratingCaption] = useState(false);

  function getAuthToken() {
    return localStorage.getItem("token") || "";
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);
    try {
      const newMedia: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          newMedia.push(data);
        }
      }
      setMedia([...media, ...newMedia]);
      setMessage({ type: "success", text: `Uploaded ${newMedia.length} file(s)` });
    } catch (err) {
      setMessage({ type: "error", text: "Upload failed" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeMedia(index: number) {
    setMedia(media.filter((_, i) => i !== index));
  }

  function togglePlatform(platform: string) {
    setPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  }

  async function generateCaption() {
    if (!aiPrompt.trim()) {
      setMessage({ type: "error", text: "Enter what your post is about" });
      return;
    }
    setGeneratingCaption(true);
    // Simple template-based caption suggestions (no AI API needed)
    const templates = [
      `🚀 ${aiPrompt}\n\nWhat are your thoughts? Drop a comment below! 👇\n\n#viral #trending`,
      `Just dropped: ${aiPrompt} ✨\n\nLet me know what you think in the comments!`,
      `${aiPrompt} — here's what I learned 🎯\n\n👉 Save this for later!\n\n#tips #inspiration`,
      `Y'all asked, so here it is: ${aiPrompt} 💯\n\nDouble tap if this helped you!`,
    ];
    const randomCaption = templates[Math.floor(Math.random() * templates.length)];
    setContent(randomCaption);
    setGeneratingCaption(false);
    setMessage({ type: "success", text: "Caption generated! Edit as needed." });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setMessage({ type: "error", text: "Add some content for your post" });
      return;
    }
    if (platforms.length === 0) {
      setMessage({ type: "error", text: "Select at least one platform" });
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          content,
          platforms: platforms.join(","),
          scheduled_at: scheduledAt || null,
          media_urls: media.map(m => m.url),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: scheduledAt ? "Post scheduled!" : "Draft saved!" });
        setContent("");
        setMedia([]);
        setScheduledAt("");
        setAiPrompt("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create post" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setPosting(false);
    }
  }

  const platformOptions = [
    { id: "youtube", label: "YouTube", color: "from-red-500 to-red-600" },
    { id: "instagram", label: "Instagram", color: "from-purple-500 via-pink-500 to-orange-400" },
    { id: "tiktok", label: "TikTok", color: "from-cyan-500 to-pink-500" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wand2 className="h-7 w-7 text-purple-500" />
          Studio
        </h1>
        <p className="text-gray-500 mt-1">Create posts with your own photos and videos</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      {/* Media Upload */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Media</h2>
          <p className="text-sm text-gray-500">Upload photos or videos from your device</p>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition"
        >
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            {uploading ? "Uploading..." : "Click or tap to upload"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Photos and videos supported</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {media.map((item, index) => (
              <div key={index} className="relative group">
                {item.type.startsWith("video/") ? (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Film className="h-8 w-8 text-gray-400" />
                  </div>
                ) : (
                  <img src={item.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full hover:bg-white shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Caption Helper */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border border-purple-100 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="font-semibold text-gray-900">Caption Helper</h2>
        </div>
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="What's your post about? (e.g., 'my morning routine')"
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          type="button"
          onClick={generateCaption}
          disabled={generatingCaption}
          className="w-full py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {generatingCaption ? "Generating..." : "✨ Generate Caption"}
        </button>
      </div>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{content.length} characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
          <div className="flex gap-2 flex-wrap">
            {platformOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  platforms.includes(p.id)
                    ? `bg-gradient-to-r ${p.color} text-white shadow-sm`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Schedule (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={posting}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {posting ? "Saving..." : scheduledAt ? "Schedule Post" : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
