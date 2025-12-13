"use client";
import { motion,Variants } from "framer-motion";

export const LoadingDots = () => {
    const dotVariants: Variants = {
        initial: { opacity: 0 },
        animate: (i: number) => ({
            opacity: [0, 1, 1, 0],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                times: [0, 0.2, 0.8, 1],
                ease: "easeInOut",
            },
        }),
    };

    return (
        <span className="inline-flex ml-1 tracking-widest">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    custom={i}
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                >
                    .
                </motion.span>
            ))}
        </span>
    );
};