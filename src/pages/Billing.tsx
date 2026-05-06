import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  posts_per_month: number | null;
  scheduled_limit: number | null;
  platforms: string[];
  features: string[];
}

interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  role: string;
}

export default function Billing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPlans();
    fetchUser();
  }, []);

  async function fetchPlans() {
    const res = await fetch("/api/billing/plans");
    const data = await res.json();
    setPlans(data.plans);
  }

  async function fetchUser() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  }

  async function handleSubscribe(planId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please sign in first");
      return;
    }

    if (planId === "free") {
      setMessage("Free plan doesn't need checkout");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to start checkout");
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage("Stripe not configured yet. Please set up Stripe first.");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setMessage("Unable to open billing portal");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Pricing Plans</h1>
        <p className="text-muted-foreground mt-2">Choose the plan that fits your needs</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes("not configured") || message.includes("Please") ? "bg-amber-500/10 border border-amber-500/20 text-amber-600" : "bg-rose-500/10 border border-rose-500/20 text-rose-600"}`}>
          {message}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-card border rounded-xl p-6 ${
                plan.id === "pro" ? "border-primary ring-2 ring-primary/20" : ""
              } ${isCurrent ? "ring-2 ring-green-500/50" : ""}`}
            >
              {plan.id === "pro" && (
                <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full w-fit mb-3">
                  Most Popular
                </div>
              )}
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{plan.posts_per_month ? `${plan.posts_per_month} posts/month` : "Unlimited posts"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{plan.scheduled_limit ? `${plan.scheduled_limit} scheduled` : "Unlimited scheduled"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{plan.platforms.join(", ")}</span>
                </div>
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                {isCurrent ? (
                  <div className="w-full py-2 bg-green-500/10 text-green-600 rounded-lg text-center font-medium">
                    ✓ Current Plan
                  </div>
                ) : plan.price === 0 ? (
                  <button className="w-full py-2 bg-muted text-muted-foreground rounded-lg font-medium cursor-default">
                    Free Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {loading ? "Loading..." : user ? "Subscribe" : "Sign in to subscribe"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Subscription */}
      {user && (
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Your Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">{user.plan} Plan</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {user.plan !== "free" && (
              <button
                onClick={handleManage}
                className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg text-sm transition"
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stripe Setup Instructions */}
      <div className="bg-muted/50 border border-dashed rounded-xl p-6">
        <h2 className="font-semibold mb-2">Stripe Setup Required</h2>
        <p className="text-sm text-muted-foreground">
          To enable payments, you need to set up Stripe. The Pro plan is $19/mo and Business is $49/mo.
        </p>
        <div className="mt-4 text-sm space-y-1">
          <p><strong>Steps to set up:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Create a Stripe account at <span className="text-primary">dashboard.stripe.com</span></li>
            <li>Create 3 products in Stripe: "Pro Plan - $19/mo" and "Business Plan - $49/mo"</li>
            <li>Get the Price IDs and add them as <code className="bg-muted px-1 rounded">STRIPE_PRICE_PRO</code> and <code className="bg-muted px-1 rounded">STRIPE_PRICE_BUSINESS</code> in your secrets</li>
            <li>Add your Stripe keys as <code className="bg-muted px-1 rounded">STRIPE_SECRET_KEY</code> and <code className="bg-muted px-1 rounded">STRIPE_WEBHOOK_SECRET</code></li>
            <li>Set webhook URL to: <code className="bg-muted px-1 rounded">https://social-publisher-mshor1216.zocomputer.io/api/billing/webhook</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}