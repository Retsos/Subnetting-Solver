"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { LoadingDots } from "./loading-dots";

export function StatusDisplay() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full min-h-[450px] flex flex-col items-center justify-center border border-dashed border-green-900/30 rounded-lg bg-[#0a0a0a]/50 p-12 text-center"
        >
            <div className="w-20 h-20 rounded-full bg-green-900/10 flex items-center justify-center mb-6 animate-pulse shadow-[0_0_15px_rgba(21,128,61,0.2)]">
                <Terminal className="w-8 h-8 text-green-600/80" />
            </div>

            <div className="flex items-center gap-1 mb-2">
                <h3 className="text-green-600 font-bold tracking-widest text-sm uppercase">
                    System Standby
                </h3>
                <span className="text-green-600 font-bold">
                    <LoadingDots />
                </span>
            </div>

            <p className="text-green-900 text-xs max-w-xs mx-auto leading-relaxed mt-2 opacity-80">
                Awaiting network parameters.<br />
                Configure Base Network and Subnets on the left console to initiate VLSM calculation protocols.
            </p>
        </motion.div>
    );
}