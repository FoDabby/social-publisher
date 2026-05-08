import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Instagram, Link, Image, TrendingUp, Users, Heart, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstagramPage() {
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
      const ig = (data.accounts || []).find((a: any) => a.platform === "instagram");
      if (ig) {
        setConnected(true);
        setAccount(ig);
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
          <span>Loading Instagram...</span>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-6 max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mx-auto">
          <Instagram className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Connect Instagram</h1>
          <p className="text-muted-foreground mt-2">
            Link your Instagram account to schedule posts, view insights, and manage your content — all in one place.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-left">
          {[
            { icon: Image, label: "Schedule Posts", desc: "Plan photos & reels ahead of time" },
            { icon: TrendingUp, label: "View Analytics", desc: "Track reach, impressions & growth" },
            { icon: Heart, label: "Engagement Stats", desc: "Monitor likes, comments & saves" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border rounded-xl p-4 text-center">
              <Icon className="h-6 w-6 mx-auto mb-2 text-pink-500" />
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/accounts")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-lg font-medium hover:opacity-90 transition"
        >
          <Link className="h-4 w-4" />
          Connect Instagram Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Instagram className="h-8 w-8 text-pink-500" />
            Instagram
          </h1>
          {account && (
            <p className="text-muted-foreground mt-1">
              Connected as <span className="font-medium">{account.username}</span>
            </p>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="font-medium">Instagram content management coming soon</p>
        <p className="text-sm text-muted-foreground mt-1">
          You're connected! Full post scheduling and analytics will be available here shortly.
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
