import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Music2, Link, Video, TrendingUp, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TikTokPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const res = await apiFetch("/api/accounts");
      const data = await res.json();
      const tt = (data.accounts || []).find((a: any) => a.platform === "tiktok");
      if (tt) {
        setConnected(true);
        setAccount(tt);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading TikTok...</span>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-6 max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mx-auto">
          <Music2 className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Connect TikTok</h1>
          <p className="text-muted-foreground mt-2">
            Link your TikTok account to schedule videos, track views, and grow your audience from one dashboard.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-left">
          {[
            { icon: Video, label: "Schedule Videos", desc: "Queue TikToks for the best times" },
            { icon: TrendingUp, label: "Trend Insights", desc: "See what's performing well" },
            { icon: Eye, label: "View Counts", desc: "Track views, likes & shares" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border rounded-xl p-4 text-center">
              <Icon className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/accounts")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition"
        >
          <Link className="h-4 w-4" />
          Connect TikTok Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Music2 className="h-8 w-8 text-cyan-500" />
            TikTok
          </h1>
          {account && (
            <p className="text-muted-foreground mt-1">
              Connected as <span className="font-medium">{account.username}</span>
            </p>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-8 text-center">
        <Music2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="font-medium">TikTok content management coming soon</p>
        <p className="text-sm text-muted-foreground mt-1">
          You're connected! Full video scheduling and analytics will be available here shortly.
        </p>
        <button
          onClick={() => navigate("/studio")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition"
        >
          Create a Post in Studio
        </button>
      </div>
    </div>
  );
}
