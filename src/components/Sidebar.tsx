import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Calendar, TrendingUp, Users, Video, Wand2, Settings, CreditCard, LogOut, Sparkles, Instagram, Music2 } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/studio", label: "Studio", icon: Wand2 },
  { path: "/posts", label: "Posts", icon: FileText },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/youtube-videos", label: "YouTube", icon: Video },
  { path: "/instagram", label: "Instagram", icon: Instagram },
  { path: "/tiktok", label: "TikTok", icon: Music2 },
  { path: "/accounts", label: "Accounts", icon: Users },
  { path: "/billing", label: "Billing", icon: CreditCard },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">Reelaura</h1>
            <p className="text-xs text-gray-500">Social Publisher</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white font-semibold shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.plan} Plan</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
