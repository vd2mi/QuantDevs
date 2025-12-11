"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { FileUpload } from "@/components/ui/file-upload";
import { NoiseBackground } from "@/components/ui/noise-background";
import { useUploadStore } from "@/store/upload";
import { IconFileAnalytics } from "@tabler/icons-react";
export default function HomePage() {
  const router = useRouter();
  const { file, setFile } = useUploadStore();
  const [isHovered, setIsHovered] = useState(false);
  const handleFileChange = (files) => {
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };
  const handleAnalyze = () => {
    if (file) {
      router.push("/loading");
    }
  };
  const showEffect = isHovered || file !== null;
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div
        className="relative w-full max-w-4xl mx-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Spotlight
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Upload your bank statement and get instant credit scoring, spending analysis, and BNPL exposure insights.
          </p>
        </motion.div>
        <div className="relative h-[24rem] w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
          <AnimatePresence mode="wait">
            {showEffect && (
              <motion.div
                key="canvas-effect"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <CanvasRevealEffect
                  animationSpeed={5}
                  containerClassName="bg-transparent"
                  colors={[
                    [59, 130, 246],
                    [139, 92, 246],
                  ]}
                  opacities={[0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 1]}
                  dotSize={2}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 [mask-image:radial-gradient(500px_at_center,white,transparent)] bg-black/50" />
          <div className="relative z-20 h-full flex flex-col items-center justify-center px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-xl"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-neutral-700 rounded-xl p-1">
                <FileUpload onChange={handleFileChange} />
              </div>
            </motion.div>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-neutral-300"
              >
                <IconFileAnalytics className="w-5 h-5 text-violet-400" />
                <span className="text-sm">
                  Selected: <span className="font-medium text-white">{file.name}</span>
                </span>
              </motion.div>
            )}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <NoiseBackground
            containerClassName="w-fit rounded-full"
            gradientColors={[
              "rgb(139, 92, 246)",
              "rgb(99, 102, 241)",
              "rgb(168, 85, 247)",
            ]}
            animating={!!file}
          >
            <button
              onClick={handleAnalyze}
              disabled={!file}
              className={`
                px-8 py-3 rounded-full font-semibold text-white
                transition-all duration-200
                ${file 
                  ? "cursor-pointer hover:scale-105 active:scale-95" 
                  : "cursor-not-allowed opacity-50"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <IconFileAnalytics className="w-5 h-5" />
                Analyze Document
              </span>
            </button>
          </NoiseBackground>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-neutral-500 text-sm mt-4"
        >
          Supported formats: .xlsx, .csv, .pdf, .docx
        </motion.p>
      </div>
    </main>
  );
}
