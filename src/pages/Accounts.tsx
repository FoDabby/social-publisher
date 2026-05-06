import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink, Check } from "lucide-react";

interface Account {
  id: number;
  platform: string;
  username: string;
  profile_image: string | null;
  is_active: number;
  created_at: string;
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showConnect, setShowConnect] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    setAccounts(data.accounts || []);
  }

  async function connectAccount() {
    if (!selectedPlatform) return;
    
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: selectedPlatform, username: `@demo_${selectedPlatform}` }),
    });
    
    if (res.ok) {
      setShowConnect(false);
      setSelectedPlatform("");
      fetchAccounts();
    } else {
      const error = await res.json();
      alert(error.error || "Failed to connect account");
    }
  }

  async function disconnectAccount(id: number) {
    if (!confirm("Disconnect this account?")) return;
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    fetchAccounts();
  }

  const platforms = [
    { id: "youtube", name: "YouTube", color: "bg-red-500", icon: "▶" },
    { id: "instagram", name: "Instagram", color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500", icon: "📷" },
    { id: "tiktok", name: "TikTok", color: "bg-cyan-400", icon: "♪" },
  ];

  const connectedPlatforms = accounts.map((a) => a.platform);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-1">Connect your social media accounts</p>
        </div>
        <button
          onClick={() => setShowConnect(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Connect Account
        </button>
      </div>

      {/* Connected Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const platform = platforms.find((p) => p.id === account.platform);
          return (
            <div
              key={account.id}
              className="bg-card border rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${platform?.color || "bg-gray-500"} flex items-center justify-center text-white text-xl`}>
                    {platform?.icon || account.platform[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{account.platform}</p>
                    <p className="text-sm text-muted-foreground">{account.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Connected {new Date(account.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {accounts.length === 0 && (
          <div className="col-span-full bg-card border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No accounts connected yet</p>
            <button onClick={() => setShowConnect(true)} className="mt-2 text-primary hover:underline">
              Connect your first account
            </button>
          </div>
        )}
      </div>

      {/* Available Platforms */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Available Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const isConnected = connectedPlatforms.includes(platform.id);
            return (
              <div
                key={platform.id}
                className={`p-4 rounded-lg border-2 transition ${
                  isConnected ? "border-green-500/30 bg-green-500/5" : "border-transparent bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center text-white`}>
                      {platform.icon}
                    </div>
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isConnected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {isConnected ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        connectAccount();
                      }}
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Modal */}
      {showConnect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Connect Account</h2>
              <button onClick={() => setShowConnect(false)} className="p-1 hover:bg-muted rounded">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Platform</label>
                <div className="space-y-2">
                  {platforms
                    .filter((p) => !connectedPlatforms.includes(p.id))
                    .map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => {
                          setSelectedPlatform(platform.id);
                          connectAccount();
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                          selectedPlatform === platform.id
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted hover:bg-muted/70"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center text-white`}>
                          {platform.icon}
                        </div>
                        <span className="font-medium">{platform.name}</span>
                      </button>
                    ))}
                  {platforms.every((p) => connectedPlatforms.includes(p.id)) && (
                    <p className="text-center text-muted-foreground py-4">All platforms already connected</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowConnect(false)}
                  className="px-4 py-2 text-sm hover:bg-muted rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
