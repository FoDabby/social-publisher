import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Calendar, BarChart3, Zap, CheckCircle, Youtube, Instagram, Music, Sparkles, ArrowRight, Star } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Reelaura
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-gray-700 hover:text-purple-600 font-medium">
            Sign In
          </Link>
          <Link
            to="/auth?signup=1"
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full mb-6 shadow-sm">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-700">The smartest way to grow on social</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Schedule, post, and grow{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              everywhere
            </span>{" "}
            at once
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage YouTube, Instagram, and TikTok from one beautiful dashboard. Smart scheduling, real analytics, zero hassle.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/auth?signup=1"
              className="inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition"
            >
              Start free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/billing"
              className="inline-flex items-center gap-2 px-7 py-4 bg-white text-gray-700 rounded-full font-semibold hover:shadow-lg transition border border-gray-200"
            >
              View pricing
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-8 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" /> Free forever plan
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" /> No credit card
            </div>
          </div>
        </div>

        {/* Social Media Mockup Grid */}
        <div className="relative h-[500px]">
          {/* Floating cards with social media post mockups */}
          <div className="absolute top-0 right-0 w-72 bg-white rounded-2xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500"></div>
              <div>
                <p className="font-semibold text-sm">@yourbrand</p>
                <p className="text-xs text-gray-500">Just posted</p>
              </div>
              <Instagram className="h-5 w-5 text-pink-500 ml-auto" />
            </div>
            <div className="aspect-square bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-xl mb-3 flex items-center justify-center">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
            <p className="text-sm">✨ Big news coming this week! Stay tuned 👀</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span>♥ 2.4k</span>
              <span>💬 156</span>
              <span>↗ 89</span>
            </div>
          </div>

          <div className="absolute top-32 left-0 w-72 bg-white rounded-2xl shadow-2xl p-4 transform -rotate-6 hover:rotate-0 transition">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Your Channel</p>
                <p className="text-xs text-gray-500">Scheduled</p>
              </div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-red-500 to-orange-500 rounded-xl mb-3 flex items-center justify-center relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1"></div>
              </div>
              <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">8:42</span>
            </div>
            <p className="text-sm font-semibold">5 AI Tools That Will Save You Hours</p>
            <p className="text-xs text-gray-500 mt-1">Posts Tuesday at 6:00 PM</p>
          </div>

          <div className="absolute bottom-0 right-8 w-64 bg-white rounded-2xl shadow-2xl p-4 transform rotate-6 hover:rotate-0 transition">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">@yourtok</p>
                <p className="text-xs text-gray-500">Trending now</p>
              </div>
            </div>
            <div className="aspect-[9/16] bg-gradient-to-br from-cyan-400 via-pink-500 to-purple-600 rounded-xl mb-3 flex flex-col justify-end p-3 max-h-[200px] overflow-hidden">
              <p className="text-white text-xs">POV: You discovered the best scheduling tool 🤯</p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">12.5k views</span>
              <span className="text-pink-500 font-bold">🔥 Hot</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need, nothing you don't</h2>
            <p className="text-xl text-gray-600">Built for creators who want to spend less time scheduling and more time creating.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
              <p className="text-gray-600">AI suggests optimal times to post based on your audience activity. Wake up to engagement.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl border border-orange-100">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">One-Click Multi-Post</h3>
              <p className="text-gray-600">Post to YouTube, Instagram, and TikTok simultaneously. One click. Three platforms. Zero copy-paste.</p>
            </div>

            <div className="p-8 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl border border-cyan-100">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real Analytics</h3>
              <p className="text-gray-600">Track views, engagement, and growth across every platform. Know what's working and double down.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="py-16 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-700 font-semibold mb-8 uppercase tracking-wider text-sm">Connect All Your Platforms</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Youtube className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">YouTube</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">Instagram</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                <Music className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">TikTok</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to grow faster?</h2>
          <p className="text-xl text-white/90 mb-8">Start free. Upgrade when you're ready. Cancel anytime.</p>
          <Link
            to="/auth?signup=1"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full font-bold hover:scale-105 transition shadow-xl"
          >
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-gray-600 border-t border-gray-200">
        <p>© 2026 Reelaura. Made with ♥ for creators.</p>
      </footer>
    </div>
  );
}
