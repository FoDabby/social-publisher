import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Video, Calendar, Clock, ExternalLink, TrendingUp, ChevronRight, RefreshCw, AlertCircle, Trash2 } from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  videoUrl: string;
  duration: string;
}

interface ChannelStats {
  title: string;
  handle: string;
  subscribers: number;
  totalViews: string;
  videoCount: number;
}

interface BestTime {
  day: string;
  time: string;
  engagement: string;
  note: string;
}

export default function YouTubeVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [channel, setChannel] = useState<ChannelStats | null>(null);
  const [bestTimes, setBestTimes] = useState<BestTime[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ day: "", time: "", note: "" });
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchYouTubeData();
    fetchPosts();
  }, []);

  async function fetchYouTubeData() {
    setLoading(true);
    setError("");
    try {
      const [videosRes, analyticsRes] = await Promise.all([
        apiFetch("/api/youtube/videos"),
        apiFetch("/api/youtube/analytics"),
      ]);

      const videosData = await videosRes.json();
      const analyticsData = await analyticsRes.json();

      if (!videosRes.ok) {
        if (videosData.expired) {
          setError("YouTube token expired. Please reconnect your account.");
        } else {
          setError(videosData.error || "Failed to load YouTube videos");
        }
        return;
      }

      setVideos(videosData.videos || []);
      
      if (analyticsRes.ok && !analyticsData.error) {
        setChannel(analyticsData.channel);
        setBestTimes(analyticsData.bestTimes || []);
      }
    } catch (err) {
      setError("Failed to connect to YouTube");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPosts() {
    try {
      const res = await apiFetch("/api/posts?platform=youtube");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }

  function openSchedule(video: YouTubeVideo) {
    setSelectedVideo(video);
    setScheduleForm({ day: "", time: "", note: "" });
    setShowScheduleModal(true);
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVideo) return;

    const scheduled_at = `${scheduleForm.day}T${scheduleForm.time}:00`;

    // Create a new post for this video
    const response = await apiFetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `📺 ${selectedVideo.title}\n\n${selectedVideo.videoUrl}`,
        platforms: "youtube",
        scheduled_at,
        media_urls: JSON.stringify([{ videoId: selectedVideo.id, title: selectedVideo.title }]),
      }),
    });

    if (response.ok) {
      setShowScheduleModal(false);
      fetchPosts();
      alert("Video scheduled for " + new Date(scheduled_at).toLocaleString());
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatNumber(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }

  function getOptimalTime() {
    if (bestTimes.length === 0) return null;
    const best = bestTimes.find(bt => bt.engagement === "High");
    return best || bestTimes[0];
  }

  const scheduledPosts = posts.filter(p => p.status === "scheduled" && p.platforms.includes("youtube"));

  async function handleDeletePost(id: number) {
    if (!confirm("Remove this video from the schedule?")) return;
    await apiFetch(`/api/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading your YouTube videos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          {error}
        </div>
        <button onClick={fetchYouTubeData} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  const optimalTime = getOptimalTime();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Video className="h-8 w-8 text-red-500" />
            YouTube Videos
          </h1>
          {channel && (
            <p className="text-muted-foreground mt-1">
              {channel.title} • {formatNumber(channel.subscribers)} subscribers • {channel.videoCount} videos
            </p>
          )}
        </div>
        <button onClick={fetchYouTubeData} className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg transition">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Best Times to Post */}
      {optimalTime && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-green-500">Optimal Posting Time</h2>
              <p className="text-2xl font-bold mt-1">{optimalTime.day} at {optimalTime.time}</p>
              <p className="text-muted-foreground mt-1">{optimalTime.note}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {bestTimes.map((bt, i) => (
              <div key={i} className={`p-2 rounded-lg text-center ${bt.engagement === "High" ? "bg-green-500/20 border border-green-500/30" : "bg-muted"}`}>
                <p className="text-xs font-medium">{bt.day}</p>
                <p className="text-xs text-muted-foreground">{bt.time}</p>
                <p className={`text-xs mt-1 ${bt.engagement === "High" ? "text-green-500" : "text-muted-foreground"}`}>{bt.engagement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Queue Section */}
      {scheduledPosts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Scheduled Upload Queue</h2>
                <p className="text-sm text-muted-foreground">{scheduledPosts.length} video{scheduledPosts.length > 1 ? "s" : ""} scheduled</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-500">{scheduledPosts.length}</p>
              <p className="text-xs text-muted-foreground">pending</p>
            </div>
          </div>
          <div className="divide-y">
            {scheduledPosts.map((post) => {
              const media = JSON.parse(post.media_urls || "[]")[0];
              const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null;
              const isPast = scheduledDate && scheduledDate < new Date();
              return (
                <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {media?.thumbnail ? (
                      <img src={media.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{media?.title || "Video Post"}</p>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-600 rounded text-xs flex-shrink-0">YouTube</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className={`text-sm ${isPast ? "text-amber-500 font-medium" : "text-muted-foreground"}`}>
                        {scheduledDate ? (
                          <>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {scheduledDate.toLocaleString()}
                          </>
                        ) : "Not scheduled"}
                      </p>
                      {isPast && (
                        <span className="text-xs text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded">Overdue</span>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                      title="Remove from schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Your Videos Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5" />
          Your Uploaded Videos ({videos.length})
        </h2>
        {videos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No videos found on your channel.</p>
            <p className="text-sm mt-1">Upload videos to YouTube first, then they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-card border rounded-xl overflow-hidden hover:border-primary/50 transition">
                <div className="aspect-video bg-muted relative">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/90 rounded-full">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{formatDate(video.publishedAt)}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => openSchedule(video)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </button>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border rounded-lg hover:bg-muted transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Videos */}
      {posts.filter(p => p.status === "scheduled" && p.media_urls).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Videos
          </h2>
          <div className="bg-card border rounded-xl divide-y">
            {posts.filter(p => p.status === "scheduled").map(post => {
              const media = JSON.parse(post.media_urls || "[]")[0];
              return (
                <div key={post.id} className="p-4 flex items-center gap-4">
                  {media?.thumbnail && (
                    <img src={media.thumbnail} alt="" className="w-20 h-14 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{media?.title || "Video Post"}</p>
                    <p className="text-sm text-muted-foreground">
                      Scheduled for {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "Not set"}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-600 rounded text-xs">{post.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Schedule Video</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-muted rounded">×</button>
            </div>
            <div className="p-4 border-b bg-muted/50">
              <p className="font-medium">{selectedVideo.title}</p>
              <a href={selectedVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                View on YouTube <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <form onSubmit={handleSchedule} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Best Time: {optimalTime?.day} at {optimalTime?.time}</label>
                <p className="text-xs text-muted-foreground mb-3">{optimalTime?.note}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Day</label>
                    <select
                      value={scheduleForm.day}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select day</option>
                      {bestTimes.map((bt) => (
                        <option key={bt.day} value={`2026-05-${bt.day === "Saturday" ? "16" : bt.day === "Sunday" ? "17" : bt.day === "Wednesday" ? "20" : "19"}`}>
                          {bt.day} ({bt.time})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-sm hover:bg-muted rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition">
                  Schedule Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}