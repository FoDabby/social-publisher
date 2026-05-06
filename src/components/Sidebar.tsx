import { NavLink } from "react-router-dom";
import { BarChart3, FileText, Calendar, TrendingUp, Users, Video } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/posts", label: "Posts", icon: FileText },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/youtube-videos", label: "YouTube Videos", icon: Video },
  { path: "/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/accounts", label: "Accounts", icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Social Publisher</h1>
        <p className="text-sm text-muted-foreground">Multi-platform scheduler</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            M
          </div>
          <div>
            <p className="text-sm font-medium">Demo User</p>
            <p className="text-xs text-muted-foreground">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
