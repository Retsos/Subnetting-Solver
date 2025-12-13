"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { SubnetResult } from "./subnet-logic";

export function SubnetExplainer({ results }: { results: SubnetResult[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full mt-6 pt-4 font-mono border-t border-green-900/20">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                animate={{
                    borderColor: isOpen ? "rgba(21, 128, 61, 0.4)" : ["rgba(20, 83, 45, 0.1)", "rgba(21, 128, 61, 0.3)", "rgba(20, 83, 45, 0.1)"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`flex items-center gap-3 text-xs uppercase tracking-widest cursor-pointer transition-all w-full group py-3 px-4 border rounded-sm
                ${isOpen ? "bg-green-950/30 text-green-600 border-green-800/30" : "bg-black/40 text-green-800 hover:text-green-600 border-green-900/20"}`}
            >
                <BookOpen className="w-4 h-4 opacity-70" />
                <span>Βημα-Βημα Επεξηγηση (VLSM Logic) {!isOpen && <span className="text-green-900 ml-2 animate-pulse text-[10px]">_click to decrypt_</span>}</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 text-sm text-green-700 space-y-6 bg-[#0a0a0a] p-6 rounded-b-sm border-x border-b border-green-900/20 shadow-inner">

                            {/* ΒΗΜΑ 1 */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-green-600 border-b border-green-900/30 inline-block">Βήμα 1: Υπολογισμός Μεγέθους (Overhead)</h4>
                                <p className="opacity-80 leading-relaxed">
                                    Υπολογίζουμε το Block Size για κάθε υποδίκτυο προσθέτοντας τα απαραίτητα IPs συστήματος.
                                    <br />
                                    <span className="text-xs text-green-500 block mt-1">
                                        • <strong>LAN Subnets:</strong> <code className="text-yellow-700">Hosts + 3</code> (Gateway + Network + Broadcast).<br />
                                        • <strong>Links (Z):</strong> <code className="text-yellow-700">2 + 2</code> (Endpoints + Network + Broadcast).
                                    </span>
                                </p>
                                <div className="overflow-x-auto mt-2 bg-black/40 p-2 rounded border border-green-900/10">
                                    <table className="w-full text-left text-xs font-mono text-green-800">
                                        <thead>
                                            <tr className="border-b border-green-900/20 text-green-600">
                                                <th className="py-1 px-2">Subnet</th>
                                                <th className="py-1 px-2">Type</th>
                                                <th className="py-1 px-2">Hosts</th>
                                                <th className="py-1 px-2">Math (Overhead)</th>
                                                <th className="py-1 px-2">Block Size (2^n)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((r, i) => {
                                                // ΔΙΟΡΘΩΣΗ ΛΟΓΙΚΗΣ ΕΔΩ:
                                                // Αν είναι Link, το overhead είναι 2 (Net+Broad).
                                                // Αν είναι Host, το overhead είναι 3 (Net+Broad+Router).
                                                const overhead = r.type === 'LINK' ? 2 : 3;
                                                const mathString = `${r.hostsRequested} + ${overhead} ≤ ${r.allocSize}`;

                                                return (
                                                    <tr key={i} className="border-b border-green-900/10">
                                                        <td className="py-1 px-2 font-bold text-green-500">{r.name}</td>
                                                        <td className="py-1 px-2 text-[10px] uppercase opacity-70">{r.type}</td>
                                                        <td className="py-1 px-2">{r.hostsRequested}</td>
                                                        <td className="py-1 px-2 opacity-70 font-mono">
                                                            {mathString}
                                                        </td>
                                                        <td className="py-1 px-2 text-yellow-700 font-bold">{r.allocSize}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ΒΗΜΑ 2 */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-green-600 border-b border-green-900/30 inline-block">Βήμα 2: Ταξινόμηση & First-Fit</h4>
                                <p className="opacity-80">
                                    Τα υποδίκτυα ταξινομούνται φθινουσως (από το μεγαλύτερο στο μικρότερο).
                                    Ο αλγόριθμος σαρώνει τη μνήμη για το <strong>πρώτο διαθέσιμο κενό</strong> που τηρεί τον κανόνα ευθυγράμμισης:
                                    <br />
                                    <code className="text-yellow-700 text-xs mt-1 block">NetworkID % BlockSize == 0</code>
                                </p>
                                <p className="text-xs text-green-800 italic">
                                    *Αυτό επιτρέπει στα μικρά links (Z) να "γεμίζουν" τα κενά που αφήνουν τα μεγάλα δίκτυα για να ευθυγραμμιστούν.
                                </p>
                            </div>

                            {/* ΒΗΜΑ 3 */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-green-600 border-b border-green-900/30 inline-block">Βήμα 3: Αντιστοίχιση Ρόλων</h4>
                                <ul className="list-disc list-inside text-xs space-y-1 text-green-800 mt-2">
                                    <li><strong>Network IP:</strong> Η αρχή του Block (πάντα ζυγός αριθμός).</li>
                                    <li><strong>Router/Gateway:</strong> Συνήθως η πρώτη usable IP (Network + 1).</li>
                                    <li><strong>Broadcast:</strong> Η τελευταία IP του Block (Network + Size - 1).</li>
                                </ul>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}