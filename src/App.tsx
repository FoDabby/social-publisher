import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Accounts from "./pages/Accounts";
import Sidebar from "./components/Sidebar";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/posts" element={<Layout><Posts /></Layout>} />
          <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/accounts" element={<Layout><Accounts /></Layout>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
