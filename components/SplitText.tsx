"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SplitTextProps {
  children: string;
  className?: string;
  staggerDelay?: number;
  duration?: number;
  renderWord?: (word: string, index: number) => ReactNode;
}

const SplitText = ({ children, className = "", staggerDelay = 0.08, duration = 0.6, renderWord }: SplitTextProps) => {
  const words = children.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay: i * staggerDelay, ease: "easeOut" }}
          className="inline-block mr-[0.3em]"
        >
          {renderWord ? renderWord(word, i) : word}
        </motion.span>
      ))}
    </span>
  );
};

export default SplitText;
