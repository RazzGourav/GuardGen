import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiEdit3,
  FiZap,
  FiShield,
  FiDownload,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
} from "react-icons/fi";
import api from "../api/client";
import { SessionContext } from "../context/SessionContext";
import Layout from "../components/Layout";
import AnimatedCard from "../components/AnimatedCard";
import ProgressSteps from "../components/ProgressSteps";
import StreamingText from "../components/StreamingText";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Session() {
  const { sessionId } = useContext(SessionContext);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [originalDraft, setOriginalDraft] = useState("");
  const [stylized, setStylized] = useState(null);
  const [report, setReport] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const [researchResults, setResearchResults] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mapping, setMapping] = useState([]);
  const [hallucination, setHallucination] = useState(null);

  const draftRef = useRef("");

  const steps = [
    { label: "Research", description: "Search papers" },
    { label: "Draft", description: "Generate content" },
    { label: "Humanize", description: "Refine style" },
    { label: "Compliance", description: "Final check" },
  ];

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) {
      navigate("/");
    }
  }, [sessionId, navigate]);

  // -------------------------
  // Research
  // -------------------------
  const runSearch = async () => {
    if (!query.trim()) {
      alert("Please enter a research query");
      return;
    }

    setLoading(true);
    setLoadingAction("Searching arXiv...");

    try {
      const res = await api.post("/research/search", {
        session_id: sessionId,
        query,
      });
      setResearchResults(res.data);
      setStep(1);
    } catch (error) {
      console.error("Research failed:", error);
      alert("Research failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingAction("");
    }
  };

  // -------------------------
  // Streaming Draft
  // -------------------------
  const generateDraft = () => {
    if (!query.trim()) {
      alert("Please enter a research query first");
      return;
    }

    setStep(1);
    setDraft("");
    setOriginalDraft("");
    setStylized(null);
    setReport(null);
    setMapping([]);
    setHallucination(null);
    draftRef.current = "";
    setIsStreaming(true);

    const wsUrl = `ws://localhost:8000/rag/stream/${sessionId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ research_question: query }));
    };

    ws.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setIsStreaming(false);
        ws.close();

        // Fetch traceability mapping, hallucination risk, and fallback draft
        api
          .post("/rag/generate", { research_question: query })
          .then((res) => {
            // Use streamed content if available, otherwise fall back to API draft
            const streamedDraft = draftRef.current;
            const apiDraft = res.data.draft || "";
            const finalDraft = streamedDraft || apiDraft;

            setDraft(finalDraft);
            setOriginalDraft(finalDraft);
            setMapping(res.data.mapping || []);
            setHallucination(res.data.hallucination_risk);
            setStep(2);
          })
          .catch((err) => {
            console.error("Traceability fetch failed:", err);
            // Still use whatever the stream produced
            if (draftRef.current) {
              setOriginalDraft(draftRef.current);
              setStep(2);
            }
          });

        return;
      }

      draftRef.current += event.data;
      setDraft(draftRef.current);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      alert("Streaming error occurred.");
      setIsStreaming(false);
      ws.close();
    };
  };

  // -------------------------
  // Stylizer
  // -------------------------
  const runStylizer = async () => {
    if (!originalDraft) {
      alert("Please generate a draft first");
      return;
    }

    setLoading(true);
    setLoadingAction("Humanizing content...");

    try {
      const res = await api.post("/stylize/run", {
        session_id: sessionId,
        text: originalDraft,
      });

      setStylized(res.data);
      setStep(3);
    } catch (error) {
      console.error("Stylizer failed:", error);
      alert("Humanization failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingAction("");
    }
  };

  // -------------------------
  // Compliance
  // -------------------------
  const runCompliance = async () => {
    setLoading(true);
    setLoadingAction("Running compliance check...");

    try {
      const res = await api.post(`/filter/run/${sessionId}`);
      setReport(res.data);
      setStep(4);
    } catch (error) {
      console.error("Compliance check failed:", error);
      alert("Compliance check failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingAction("");
    }
  };

  // -------------------------
  // Copy to Clipboard
  // -------------------------
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  if (!sessionId) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <LoadingSpinner size="lg" text="Redirecting..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Session Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Research Session{" "}
                <span className="gradient-text">#{sessionId}</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Follow the steps below to generate compliant academic content
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="btn-secondary"
            >
              New Session
            </motion.button>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <AnimatedCard className="p-6 mb-8" delay={0.1}>
          <ProgressSteps steps={steps} currentStep={step} />
        </AnimatedCard>

        {/* Research Input */}
        <AnimatedCard className="p-6 mb-6" delay={0.2}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiSearch className="text-primary-400" />
            Research Query
          </h2>
          <div className="flex gap-4">
            <input
              className="input-field flex-1"
              placeholder="What would you like to research?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
            />
          </div>
        </AnimatedCard>

        {/* Action Buttons */}
        <AnimatedCard className="p-6 mb-6" delay={0.3}>
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runSearch}
              disabled={loading || !query.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <FiSearch className="w-5 h-5" />
              Research
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateDraft}
              disabled={loading || isStreaming || !query.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <FiEdit3 className="w-5 h-5" />
              Generate Draft
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runStylizer}
              disabled={loading || !originalDraft}
              className="btn-primary flex items-center gap-2"
            >
              <FiZap className="w-5 h-5" />
              Humanize
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runCompliance}
              disabled={loading || !stylized}
              className="btn-primary flex items-center gap-2"
            >
              <FiShield className="w-5 h-5" />
              Compliance Check
            </motion.button>
          </div>

          {/* Loading State */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-center gap-3 text-primary-400"
              >
                <LoadingSpinner size="sm" />
                <span>{loadingAction}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedCard>

        {/* Research Results */}
        <AnimatePresence>
          {researchResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimatedCard className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiInfo className="text-primary-400" />
                  Research Results
                </h2>
                <div className="flex items-center gap-2 text-green-400">
                  <FiCheckCircle />
                  <span>Found {researchResults.papers_found} relevant papers</span>
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Draft */}
        <AnimatePresence>
          {(draft || isStreaming) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimatedCard className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FiEdit3 className="text-primary-400" />
                    {isStreaming ? "Generating Draft..." : "Generated Draft"}
                  </h2>
                  {!isStreaming && draft && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(draft)}
                      className="text-gray-400 hover:text-white flex items-center gap-2"
                    >
                      <FiCopy />
                      Copy
                    </motion.button>
                  )}
                </div>
                <div className="bg-dark-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                  {isStreaming ? (
                    <StreamingText text={draft} />
                  ) : (
                    <p className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                      {draft}
                    </p>
                  )}
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confidence Heatmap */}
        <AnimatePresence>
          {mapping && mapping.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimatedCard className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiInfo className="text-primary-400" />
                  Confidence Heatmap
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {mapping.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-3 text-sm text-gray-100"
                      style={{
                        backgroundColor: `rgba(91, 45, 142, ${m.similarity_score})`,
                      }}
                    >
                      {m.sentence}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Higher similarity → darker purple
                </p>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hallucination Risk */}
        <AnimatePresence>
          {hallucination !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimatedCard className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiShield className="text-primary-400" />
                  Hallucination Risk
                </h2>
                <div className="bg-dark-200 rounded-xl p-4 flex items-center gap-4">
                  <p
                    className={`text-3xl font-bold ${
                      hallucination < 0.3
                        ? "text-green-400"
                        : hallucination < 0.6
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {(hallucination * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-400">
                    {hallucination < 0.3
                      ? "Low risk — well-supported by sources"
                      : hallucination < 0.6
                      ? "Moderate risk — some unsupported claims"
                      : "High risk — many unsupported claims"}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Lower is better
                </p>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stylized Result */}
        <AnimatePresence>
          {stylized && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimatedCard className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FiZap className="text-secondary-400" />
                    Humanized Content
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(stylized.final_text)}
                    className="text-gray-400 hover:text-white flex items-center gap-2"
                  >
                    <FiCopy />
                    Copy
                  </motion.button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-dark-200 rounded-xl p-4">
                    <p className="text-sm text-gray-400">AI Detection Score</p>
                    <p className="text-2xl font-bold gradient-text">
                      {(stylized.score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-dark-200 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Iterations</p>
                    <p className="text-2xl font-bold text-white">
                      {stylized.iterations}
                    </p>
                  </div>
                </div>

                <div className="bg-dark-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-gray-300">
                    {stylized.final_text}
                  </p>
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compliance Report */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimatedCard className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiShield className="text-primary-400" />
                  Compliance Report
                </h2>

                {/* Status Banner */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                    report.passed
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-red-500/10 border border-red-500/30"
                  }`}
                >
                  {report.passed ? (
                    <FiCheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <FiXCircle className="w-8 h-8 text-red-400" />
                  )}
                  <div>
                    <p
                      className={`text-lg font-semibold ${
                        report.passed ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {report.recommendation}
                    </p>
                    <p className="text-sm text-gray-400">
                      Overall Score: {(report.overall_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </motion.div>

                {/* Details */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-dark-200 rounded-xl p-4">
                    <h4 className="font-medium mb-2 text-gray-300">Bias Flags</h4>
                    {report.bias_flags?.length > 0 ? (
                      <ul className="text-sm text-red-400 space-y-1">
                        {report.bias_flags.map((flag, i) => (
                          <li key={i}>• {flag}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-400">No issues found</p>
                    )}
                  </div>

                  <div className="bg-dark-200 rounded-xl p-4">
                    <h4 className="font-medium mb-2 text-gray-300">
                      Missing Citations
                    </h4>
                    {report.missing_citations?.length > 0 ? (
                      <ul className="text-sm text-yellow-400 space-y-1">
                        {report.missing_citations.map((cite, i) => (
                          <li key={i}>• {cite}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-400">All citations valid</p>
                    )}
                  </div>

                  <div className="bg-dark-200 rounded-xl p-4">
                    <h4 className="font-medium mb-2 text-gray-300">
                      Harmful Content
                    </h4>
                    {report.harmful_flags?.length > 0 ? (
                      <ul className="text-sm text-red-400 space-y-1">
                        {report.harmful_flags.map((flag, i) => (
                          <li key={i}>• {flag}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-400">Content is safe</p>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                {report.passed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      try {
                        await api.get(`/filter/download/${sessionId}`);
                        alert("Document saved to uploads folder!");
                      } catch (e) {
                        alert("Download failed");
                      }
                    }}
                    className="mt-6 btn-primary flex items-center gap-2"
                  >
                    <FiDownload />
                    Download Final Draft
                  </motion.button>
                )}
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}