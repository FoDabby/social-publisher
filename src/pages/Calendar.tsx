import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPost {
  id: number;
  content: string;
  platforms: string;
  status: string;
  scheduled_at?: string;
  published_at?: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);

  useEffect(() => {
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    fetch(`/api/calendar?month=${month}`)
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const postsByDay: Record<number, CalendarPost[]> = {};
  posts.forEach((post) => {
    const dateStr = post.scheduled_at || post.published_at;
    if (dateStr) {
      const day = new Date(dateStr).getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function getPlatformColor(platform: string) {
    if (platform.includes("youtube")) return "bg-red-500";
    if (platform.includes("instagram")) return "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500";
    if (platform.includes("tiktok")) return "bg-cyan-400";
    return "bg-gray-400";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and view your posts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold min-w-[180px] text-center">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border rounded-xl p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[100px] p-2 bg-muted/30 rounded-lg" />
          ))}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const dayPosts = postsByDay[day] || [];
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`min-h-[100px] p-2 rounded-lg border transition ${
                  isToday ? "border-primary bg-primary/5" : "border-transparent bg-muted/30"
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate ${getPlatformColor(post.platforms)} text-white`}
                    >
                      {post.status === "published" ? "✓" : "◔"} {post.content.slice(0, 30)}
                    </button>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">+{dayPosts.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-card border rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Post Details</h2>
              <button onClick={() => setSelectedPost(null)} className="p-1 hover:bg-muted rounded">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p className="font-medium capitalize">{selectedPost.status}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Content</label>
                <p className="text-sm mt-1">{selectedPost.content}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Platforms</label>
                <div className="flex gap-2 mt-1">
                  {selectedPost.platforms.split(",").map((p) => (
                    <span key={p} className="px-2 py-0.5 bg-muted rounded text-xs capitalize">{p.trim()}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  {selectedPost.status === "published" ? "Published" : "Scheduled"}
                </label>
                <p className="text-sm">
                  {new Date(selectedPost.scheduled_at || selectedPost.published_at || "").toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
