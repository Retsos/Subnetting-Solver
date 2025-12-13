"use client";

import { SubnetResult } from "./subnet-logic";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CUP_SIZE = 32;

// Βοηθητική για υπολογισμό συνολικής χωρητικότητας βάσει prefix
const getNetworkCapacity = (prefix: number) => Math.pow(2, 32 - prefix);

interface VisualizerProps {
    results: SubnetResult[];
    basePrefix: number;
}

type Segment = {
    type: 'FREE' | 'USED';
    size: number;
    label: string;
    ip?: string;
    originalSize?: number;
};

export function SubnetVisualizer({ results, basePrefix }: VisualizerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalCapacity = getNetworkCapacity(basePrefix);

    const cupsNeeded = 5;
    const cups = Array.from({ length: cupsNeeded }, (_, i) => i);

    if (!mounted) return null;

    return (
        <div className="space-y-4 font-mono">
            <h3 className="text-xs uppercase tracking-widest text-green-800 font-bold border-b border-green-900/30 pb-2">
                Cup Visualization (32 IPs per Block)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cups.map((cupIndex) => {
                    const cupStart = cupIndex * CUP_SIZE;
                    const cupEnd = cupStart + CUP_SIZE;

                    // 1. ΕΛΕΓΧΟΣ: Είμαστε εκτός ορίων δικτύου;
                    if (cupStart >= totalCapacity) {
                        return (
                            <div key={cupIndex} className="border border-green-900/10 bg-[#050505] rounded-sm p-2 opacity-50 relative">
                                <div className="absolute -top-3 left-2 bg-[#050505] px-2 text-[10px] text-green-900 font-bold">
                                    Cup {cupIndex + 1}
                                </div>
                                <div className="h-[160px] flex items-center justify-center border-l border-r border-green-900/10 border-dashed text-green-900/20 text-xs">
                                    N/A
                                </div>
                            </div>
                        );
                    }

                    // 2. ΒΡΙΣΚΟΥΜΕ ΤΑ SUBNETS
                    const itemsInCup = results
                        .filter(r => {
                            const rStart = r.offset;
                            const rEnd = r.offset + r.allocSize;
                            return (rStart < cupEnd && rEnd > cupStart);
                        })
                        .sort((a, b) => a.offset - b.offset);

                    // 3. ΔΗΜΙΟΥΡΓΙΑ ΣΕΙΡΑΣ RENDER (Segments)
                    let currentCursor = cupStart;
                    const segments: Segment[] = []; 

                    itemsInCup.forEach((item) => {
                        const itemStart = item.offset;
                        const itemEnd = item.offset + item.allocSize;

                        const effectiveStart = Math.max(itemStart, cupStart);
                        const effectiveEnd = Math.min(itemEnd, cupEnd);

                        // Α. FREE
                        if (effectiveStart > currentCursor) {
                            segments.push({
                                type: 'FREE',
                                size: effectiveStart - currentCursor,
                                label: 'FREE'
                            });
                        }

                        // Β. Subnet (USED)
                        segments.push({
                            type: 'USED',
                            size: effectiveEnd - effectiveStart,
                            label: item.name,
                            ip: item.networkIP,
                            originalSize: item.allocSize
                        });

                        currentCursor = effectiveEnd;
                    });

                    // Γ. Κενό στο τέλος (FREE)
                    const validCupEnd = Math.min(cupEnd, totalCapacity);
                    if (currentCursor < validCupEnd) {
                        segments.push({
                            type: 'FREE',
                            size: validCupEnd - currentCursor,
                            label: 'FREE'
                        });
                    }

                    return (
                        <motion.div
                            key={cupIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: cupIndex * 0.1 }}
                            className="border border-green-900/40 bg-[#0c0c0c] rounded-sm p-2 relative"
                        >
                            <div className="absolute -top-3 left-2 bg-[#050505] px-2 text-[10px] text-green-600 font-bold">
                                Cup {cupIndex + 1} <span className="opacity-50">({cupStart} - {cupEnd - 1})</span>
                            </div>

                            <div className="flex flex-col w-full h-full min-h-[160px] border-l border-r border-dashed border-green-900/20 py-2">
                                {segments.length > 0 ? (
                                    segments.map((seg, idx) => {
                                        const heightPercent = ((seg.size / CUP_SIZE) * 100).toFixed(2);

                                        if (seg.type === 'FREE') {
                                            return (
                                                <div
                                                    key={`free-${idx}`}
                                                    className="w-full border-b border-green-900/10 bg-transparent flex items-center justify-between px-3 text-xs opacity-40"
                                                    style={{ height: `${heightPercent}%` }}
                                                >
                                                    <span className="text-green-900 border-r border-green-900/30 pr-2 w-8 text-center">{seg.size}</span>
                                                    <span className="text-green-900 pl-2 text-right flex-1">FREE</span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={`used-${idx}`}
                                                className="w-full border-b border-green-900/30 bg-green-900/10 flex items-center justify-between px-3 text-xs overflow-hidden relative group"
                                                style={{ height: `${heightPercent}%` }}
                                            >
                                                <span className="text-yellow-600 font-bold border-r border-green-900/30 pr-2 w-8 text-center">
                                                    {seg.size}
                                                </span>
                                                <span className="text-green-400 font-bold pl-2 truncate flex-1 text-right">
                                                    {seg.label}
                                                </span>
                                                <div className="absolute inset-0 bg-green-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] pointer-events-none">
                                                    {seg.ip}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex items-center justify-center h-full text-green-900/30 text-xs italic">
                                        Empty / Free
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}