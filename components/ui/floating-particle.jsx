"use client";
import { motion } from "framer-motion";

export function FloatingParticle({ delay, duration, size, color, startX, startY }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        left: startX,
        top: startY,
      }}
      animate={{
        y: [0, -100, -200, -100, 0],
        x: [0, 30, -20, 40, 0],
        opacity: [0, 1, 1, 1, 0],
        scale: [0, 1, 1.2, 1, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

