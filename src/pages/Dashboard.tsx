import { useState, useEffect } from "react";
import { BarChart3, Calendar, FileText, Users, Clock, TrendingUp, Eye, Heart, Share2, MessageSquare } from "lucide-react";

interface DashboardData {
  stats: {
    totalPosts: number;
    scheduledPosts: number;
    totalViews: number;
    totalEngagement: number;
  };
  recentPosts: Array<{
    id: number;
    content: string;
    platforms: string;
    status: string;
    published_at?: string;
    scheduled_at?: string;
  }>;
  platformStats: Array<{
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [postsRes, analyticsRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/analytics?period=30d"),
      ]);
      const posts = await postsRes.json();
      const analytics = await analyticsRes.json();

      const totalPosts = posts.posts?.length || 0;
      const scheduledPosts = posts.posts?.filter((p: any) => p.status === "scheduled").length || 0;
      const totalViews = analytics.totals?.reduce((sum: number, p: any) => sum + (p.views || 0), 0) || 0;
      const totalEngagement = analytics.totals?.reduce((sum: number, p: any) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0) || 0;

      setData({
        stats: { totalPosts, scheduledPosts, totalViews, totalEngagement },
        recentPosts: posts.posts?.slice(0, 5) || [],
        platformStats: analytics.totals || [],
      });
    }
    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Posts", value: data.stats.totalPosts, icon: FileText, color: "text-blue-600" },
    { label: "Scheduled", value: data.stats.scheduledPosts, icon: Clock, color: "text-amber-600" },
    { label: "Total Views", value: formatNumber(data.stats.totalViews), icon: Eye, color: "text-purple-600" },
    { label: "Engagement", value: formatNumber(data.stats.totalEngagement), icon: Heart, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your social media performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-10 w-10 ${stat.color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      {/* Platform Breakdown */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Platform Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.platformStats.map((platform) => (
            <div key={platform.platform} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  platform.platform === "youtube" ? "bg-red-500" :
                  platform.platform === "instagram" ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500" :
                  "bg-cyan-400"
                }`} />
                <span className="font-medium capitalize">{platform.platform}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-medium">{formatNumber(platform.views)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Likes</span>
                  <span className="font-medium">{formatNumber(platform.likes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-medium">{formatNumber(platform.comments)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-medium">{formatNumber(platform.shares)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reach</span>
                  <span className="font-medium">{formatNumber(platform.reach)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Posts
        </h2>
        <div className="space-y-4">
          {data.recentPosts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {post.platforms.split(",").map(p => p.trim()).join(", ")}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    post.status === "published" ? "bg-green-500/20 text-green-600" :
                    post.status === "scheduled" ? "bg-amber-500/20 text-amber-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {post.published_at ? new Date(post.published_at).toLocaleDateString() :
                 post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() :
                 "Draft"}
              </div>
            </div>
          ))}
          {data.recentPosts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No posts yet. Create your first post!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
