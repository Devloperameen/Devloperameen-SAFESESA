import { motion } from "framer-motion";
import { ReactNode } from "react";
import PageBackButton from "@/components/PageBackButton";

export default function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="px-3 pt-3 sm:px-6 sm:pt-4">
        <PageBackButton />
      </div>
      {children}
    </motion.div>
  );
}
