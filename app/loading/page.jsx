"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUploadStore } from "@/store/upload";
import { analyzeDocument } from "@/lib/api";
import { FloatingParticle } from "@/components/ui/floating-particle";

const loadingMessages = [
  "Analyzing your document...",
  "Detecting income patterns...",
  "Analyzing spending behavior...",
  "Checking BNPL services...",
  "Calculating eligibility score...",
];
export default function LoadingPage() {
  const router = useRouter();
  const { file, setResults, setIsAnalyzing } = useUploadStore();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    if (!file) {
      router.push("/");
      return;
    }
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3;
      });
    }, 200);
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    const analyze = async () => {
      setIsAnalyzing(true);
      setErrorMessage("");
      try {
        const results = await analyzeDocument(file);
        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setResults(results);
        router.push("/results");
      } catch (error) {
        console.error("Analysis failed:", error);
        setProgress(100);
        const errorMsg = error?.message || "Analysis failed. Please try again.";
        const errorDetails = error?.details || "";
        setErrorMessage(errorDetails ? `${errorMsg}\n\n${errorDetails}` : errorMsg);
      } finally {
        setIsAnalyzing(false);
      }
    };
    analyze();
    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [file, router, setResults, setIsAnalyzing]);
  // Use useState with useEffect to ensure particles only render on client (fixes hydration)
  const [particles, setParticles] = useState([]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // Generate particles only on client side
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        delay: i * 0.3,
        duration: 4 + Math.random() * 2,
        size: 4 + Math.random() * 8,
        color: i % 3 === 0 
          ? "rgba(139, 92, 246, 0.6)" 
          : i % 3 === 1 
            ? "rgba(59, 130, 246, 0.6)" 
            : "rgba(236, 72, 153, 0.6)",
        startX: `${Math.random() * 100}%`,
        startY: `${60 + Math.random() * 40}%`,
      }))
    );
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1a] to-[#0a0a0a] flex flex-col items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[900px] h-[900px] rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full blur-[100px]"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
            left: "15%",
            top: "35%",
          }}
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 120, 0],
            y: [0, -60, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px]"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)",
            right: "10%",
            top: "20%",
          }}
          animate={{
            scale: [1.3, 1, 1.3],
            y: [0, 100, 0],
            x: [0, -50, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)",
            left: "55%",
            bottom: "15%",
          }}
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.1, 0.4, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
      {isClient && particles.map((particle, i) => (
        <FloatingParticle key={i} {...particle} />
      ))}
      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <motion.div
            className="inline-block mb-4"
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.h1 
              className="text-6xl md:text-7xl font-extrabold text-white mb-3 tracking-tight"
              style={{
                textShadow: "0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)",
                letterSpacing: "-0.02em",
              }}
            >
              Financial{" "}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 via-pink-400 to-violet-400 bg-[length:200%_auto] animate-[gradient_3s_ease_infinite]">
                  Analyzer
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 rounded-full opacity-60"
                  animate={{ scaleX: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
            </motion.h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center justify-center gap-3 text-neutral-400"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/40 backdrop-blur-md border border-neutral-800/50">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </div>
              <span className="text-xs font-medium">AI-Powered</span>
            </div>
            <div className="h-4 w-px bg-neutral-700"></div>
            <span className="text-xs font-medium">Real-time Analysis</span>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-16"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-48 h-48 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
          </div>
          <motion.div
            className="w-48 h-48 rounded-full border-[3px] border-transparent relative"
            style={{
              borderTopColor: "#8b5cf6",
              borderRightColor: "#3b82f6",
              borderBottomColor: "#ec4899",
              borderLeftColor: "#22d3ee",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border-[2.5px] border-transparent"
            style={{
              borderTopColor: "#ec4899",
              borderRightColor: "#22d3ee",
              borderBottomColor: "#8b5cf6",
              borderLeftColor: "#3b82f6",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-8 rounded-full border-2 border-violet-500/50"
            animate={{ 
              scale: [1, 1.15, 1], 
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-12 rounded-full bg-gradient-to-br from-violet-500/40 via-blue-500/40 to-pink-500/40 backdrop-blur-md border border-violet-500/20"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.08, 1],
              rotate: [0, -180, -360]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div className="absolute inset-0 blur-2xl bg-violet-400/60 rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full p-6 backdrop-blur-sm border border-violet-500/30">
                <svg className="w-16 h-16 text-violet-300 drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mb-8"
        >
          <div className="relative h-3 bg-neutral-900/60 rounded-full overflow-hidden border border-neutral-800/60 backdrop-blur-md shadow-2xl">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 via-blue-500 via-pink-500 to-violet-500 rounded-full relative overflow-hidden shadow-lg"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-sm" />
            </motion.div>
          </div>
          <div className="flex justify-between items-center mt-4 px-1">
            <motion.span 
              className="text-sm text-neutral-400 font-semibold tracking-wide uppercase"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {errorMessage ? "Error" : "Analyzing"}
            </motion.span>
            <motion.span 
              className="text-lg text-violet-400 font-bold tabular-nums"
              key={Math.round(progress)}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 w-full max-w-lg"
        >
          {errorMessage ? (
            <div className="mx-auto">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="shrink-0"
                  >
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </motion.div>
                  <div className="flex-1 text-left">
                    <h3 className="text-red-400 font-bold text-lg mb-3">Analysis Failed</h3>
                    <div className="text-red-300/90 text-sm whitespace-pre-line leading-relaxed mb-5 space-y-2">
                      <p className="font-semibold">{errorMessage.split('\n\n')[0]}</p>
                      {errorMessage.includes('\n\n') && (
                        <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                          <p className="text-xs text-red-200/80 font-mono whitespace-pre-wrap">
                            {errorMessage.split('\n\n').slice(1).join('\n\n')}
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => window.location.href = "/"}
                      className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/40 rounded-xl text-red-300 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              <p className="text-xl md:text-2xl text-neutral-200 font-semibold tracking-tight">
                {loadingMessages[messageIndex]}
              </p>
              <motion.div
                className="flex items-center justify-center gap-1.5 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-neutral-900/60 backdrop-blur-xl border-2 border-neutral-800/60 rounded-2xl px-8 py-5 shadow-2xl"
          >
            <div className="flex items-center gap-5">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center border border-violet-500/30"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Processing</p>
                <p className="text-sm text-white font-semibold truncate">{file.name}</p>
              </div>
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex items-center gap-3 mt-10"
        >
          {loadingMessages.map((_, i) => (
            <motion.div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === messageIndex 
                  ? 'w-3 h-3 bg-violet-500 shadow-lg shadow-violet-500/50' 
                  : 'w-2 h-2 bg-neutral-700'
              }`}
              animate={i === messageIndex ? { 
                scale: [1, 1.4, 1],
                boxShadow: [
                  "0 0 0px rgba(139, 92, 246, 0.5)",
                  "0 0 12px rgba(139, 92, 246, 0.8)",
                  "0 0 0px rgba(139, 92, 246, 0.5)"
                ]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </div>
    </main>
  );
}
