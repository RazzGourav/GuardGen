import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiFileText, FiZap } from "react-icons/fi";

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: FiHome, label: "Home" },
    { path: "/session", icon: FiFileText, label: "Session" },
  ];

  return (
    <div className="min-h-screen bg-dark-300">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-300/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
              >
                <FiZap className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold gradient-text">GuardGen</span>
            </Link>

            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      location.pathname === item.path
                        ? "bg-primary-500/20 text-primary-400"
                        : "text-gray-400 hover:text-white hover:bg-dark-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}
