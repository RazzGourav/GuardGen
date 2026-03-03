import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

export default function ProgressSteps({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          {/* Step Circle */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{
              scale: currentStep >= index ? 1 : 0.8,
              backgroundColor: currentStep >= index ? "#0ea5e9" : "#1e293b",
            }}
            className="relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-700"
            style={{
              borderColor: currentStep >= index ? "#0ea5e9" : "#374151",
            }}
          >
            {currentStep > index ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <FiCheck className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <span className={currentStep >= index ? "text-white" : "text-gray-500"}>
                {index + 1}
              </span>
            )}

            {/* Pulse Animation for Active Step */}
            {currentStep === index && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary-500"
              />
            )}
          </motion.div>

          {/* Step Label */}
          <div className="ml-3 flex-1">
            <p
              className={`text-sm font-medium ${
                currentStep >= index ? "text-white" : "text-gray-500"
              }`}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-gray-500">{step.description}</p>
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-4 bg-gray-700 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: currentStep > index ? "100%" : "0%" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
