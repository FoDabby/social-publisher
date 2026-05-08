import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Eye, Heart, MessageSquare, Share2, TrendingUp, BarChart3 } from "lucide-react";

interface AnalyticsData {
  analytics: Array<{
    id: number;
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
    content: string;
    published_at: string;
  }>;
  totals: Array<{
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState("30d");
  const [platform, setPlatform] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams({ period });
    if (platform !== "all") params.append("platform", platform);
    apiFetch(`/api/analytics?${params}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [period, platform]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const grandTotals = data.totals.reduce(
    (acc, p) => ({
      views: acc.views + p.views,
      likes: acc.likes + p.likes,
      comments: acc.comments + p.comments,
      shares: acc.shares + p.shares,
      reach: acc.reach + p.reach,
      impressions: acc.impressions + p.impressions,
    }),
    { views: 0, likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your content performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 bg-muted border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-muted border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Grand Totals */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Views", value: grandTotals.views, icon: Eye, color: "text-blue-600" },
          { label: "Reach", value: grandTotals.reach, icon: TrendingUp, color: "text-purple-600" },
          { label: "Likes", value: grandTotals.likes, icon: Heart, color: "text-rose-600" },
          { label: "Comments", value: grandTotals.comments, icon: MessageSquare, color: "text-amber-600" },
          { label: "Shares", value: grandTotals.shares, icon: Share2, color: "text-cyan-600" },
          { label: "Impressions", value: grandTotals.impressions, icon: BarChart3, color: "text-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
          </div>
        ))}
      </div>

      {/* Platform Breakdown */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Platform Breakdown</h2>
        <div className="space-y-4">
          {data.totals.map((platform) => (
            <div key={platform.platform} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    platform.platform === "youtube" ? "bg-red-500" :
                    platform.platform === "instagram" ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500" :
                    "bg-cyan-400"
                  }`} />
                  <span className="font-medium capitalize">{platform.platform}</span>
                </div>
                <span className="text-sm text-muted-foreground">{formatNumber(platform.views)} views</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: "Views", value: platform.views, color: "bg-blue-500" },
                  { label: "Likes", value: platform.likes, color: "bg-rose-500" },
                  { label: "Comments", value: platform.comments, color: "bg-amber-500" },
                  { label: "Shares", value: platform.shares, color: "bg-cyan-500" },
                  { label: "Reach", value: platform.reach, color: "bg-purple-500" },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${metric.color} rounded-full`}
                        style={{ width: `${Math.min(100, (metric.value / Math.max(grandTotals[metric.label.toLowerCase() as keyof typeof grandTotals] || 1, 1)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{formatNumber(metric.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {data.totals.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No analytics data available yet</p>
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
