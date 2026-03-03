import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import {
  FiSearch,
  FiFileText,
  FiShield,
  FiZap,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import api from "../api/client";
import { SessionContext } from "../context/SessionContext";
import Layout from "../components/Layout";
import FeatureCard from "../components/FeatureCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSessionId } = useContext(SessionContext);
  const navigate = useNavigate();

  const features = [
    {
      icon: FiSearch,
      title: "Smart Research",
      description: "AI-powered arXiv search with intelligent caching and semantic analysis.",
    },
    {
      icon: FiFileText,
      title: "Auto Drafting",
      description: "Generate structured academic drafts with proper citations in real-time.",
    },
    {
      icon: FiZap,
      title: "Humanization",
      description: "Transform AI text to human-like writing with iterative refinement.",
    },
    {
      icon: FiShield,
      title: "Compliance Check",
      description: "Automated bias detection, citation verification, and content filtering.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Papers Processed" },
    { value: "99%", label: "Accuracy Rate" },
    { value: "50ms", label: "Avg Response" },
    { value: "24/7", label: "Availability" },
  ];

  const createSession = async () => {
    if (!topic.trim()) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/research/create", { topic });
      setSessionId(res.data.id);
      navigate("/session");
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-primary-400">AI Research Assistant</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Research Smarter with{" "}
            <span className="gradient-text">GuardGen</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 mb-8 h-8"
          >
            <TypeAnimation
              sequence={[
                "Generate academic drafts in seconds...",
                2000,
                "Humanize AI-generated content...",
                2000,
                "Ensure compliance automatically...",
                2000,
                "Research with confidence...",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </motion.div>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative flex items-center bg-dark-100 rounded-xl p-2">
                <FiSearch className="w-6 h-6 text-gray-500 ml-4" />
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none px-4 py-4 text-lg text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Enter your research topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createSession()}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createSession}
                  disabled={loading || !topic.trim()}
                  className="btn-primary flex items-center gap-2 mr-1"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Start Research
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Try: "Machine Learning in Healthcare" or "Quantum Computing Applications"
            </p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-12 border-y border-gray-800"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for{" "}
              <span className="gradient-text">Academic Excellence</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              GuardGen combines cutting-edge AI with academic rigor to help you
              produce high-quality, compliant research content.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.6 + index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Your Topic",
                description: "Start with a research topic or question you want to explore.",
              },
              {
                step: "02",
                title: "AI Generates Draft",
                description: "Watch as AI researches, cites, and writes your academic draft.",
              },
              {
                step: "03",
                title: "Review & Export",
                description: "Humanize the content, check compliance, and export your work.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="relative"
              >
                <div className="text-8xl font-bold text-gray-800/50 absolute -top-6 -left-2">
                  {item.step}
                </div>
                <div className="relative card p-6 pt-12">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="py-20"
        >
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
            <div className="relative p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Research?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Join thousands of researchers using GuardGen to produce
                high-quality academic content faster than ever.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.querySelector('input').focus()}
                className="bg-white text-primary-600 font-semibold py-4 px-8 rounded-xl hover:shadow-xl transition-all duration-300"
              >
                Get Started — It's Free
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-800 text-center text-gray-500">
          <p>© 2024 GuardGen. Built for academic excellence.</p>
        </footer>
      </div>
    </Layout>
  );
}