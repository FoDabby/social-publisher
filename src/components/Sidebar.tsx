import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, FileText, Calendar, TrendingUp, Users, Video, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

interface UserData {
  id: number;
  email: string;
  name: string;
  plan: string;
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/posts", label: "Posts", icon: FileText },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/accounts", label: "Accounts", icon: Users },
  { path: "/youtube-videos", label: "YouTube", icon: Video },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

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
    <aside className="w-56 min-h-screen bg-[#0f0f0f] border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-3">
          <span className="text-white font-bold text-lg">R</span>
        </div>
        <h1 className="text-base font-bold text-white">Reelaura</h1>
        <p className="text-xs text-white/40 mt-0.5">Social Publisher</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm ${
                isActive
                  ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/40 capitalize">{user.plan} Plan</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}