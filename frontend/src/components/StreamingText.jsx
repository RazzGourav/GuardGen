import { motion } from "framer-motion";

export default function StreamingText({ text, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300"
      >
        {text}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-2 h-5 ml-1 bg-primary-500"
        />
      </motion.div>
    </div>
  );
}
