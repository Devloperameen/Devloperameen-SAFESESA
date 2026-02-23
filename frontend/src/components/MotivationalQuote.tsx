
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quotes } from "@/utils/quotes";
import { Quote } from "lucide-react";

export default function MotivationalQuote() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // Pick a random index on mount
        setIndex(Math.floor(Math.random() * quotes.length));

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % quotes.length);
        }, 8000); // Change every 8 seconds

        return () => clearInterval(interval);
    }, []);

    const quote = quotes[index];

    return (
        <div className="w-full py-12 bg-secondary/30 backdrop-blur-sm border-y border-border overflow-hidden">
            <div className="container px-4 mx-auto text-center relative">
                <Quote className="absolute -top-4 -left-2 h-12 w-12 text-primary/10 -rotate-12" />
                <Quote className="absolute -bottom-4 -right-2 h-12 w-12 text-primary/10 rotate-12" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-3xl mx-auto space-y-4"
                    >
                        <p className="font-display text-xl md:text-2xl lg:text-3xl font-medium text-foreground/90 leading-relaxed italic">
                            "{quote.text}"
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-px w-8 bg-primary/40" />
                            <p className="text-sm md:text-base font-semibold text-primary uppercase tracking-widest">
                                {quote.author}
                            </p>
                            <span className="h-px w-8 bg-primary/40" />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
