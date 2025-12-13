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
                <span>Βημα-Βημα Επεξηγηση (VLSM)</span>
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

                            <div className="space-y-2">
                                <h4 className="font-bold text-green-600 border-b border-green-900/30 inline-block">Βήμα 1: Ταξινόμηση & Μέγεθος</h4>
                                <p className="opacity-80">
                                    Υπολογίζουμε το Block Size για κάθε υποδίκτυο με τον κανόνα: <br />
                                    <code className="text-yellow-700">Hosts + 3 (Net + Router + Broad)</code>.
                                    Στη συνέχεια τα τοποθετούμε με φθίνουσα σειρά μεγέθους.
                                </p>
                                <div className="overflow-x-auto mt-2 bg-black/40 p-2 rounded border border-green-900/10">
                                    <table className="w-full text-left text-xs font-mono text-green-800">
                                        <thead>
                                            <tr className="border-b border-green-900/20 text-green-600">
                                                <th className="py-1 px-2">Subnet</th>
                                                <th className="py-1 px-2">Hosts</th>
                                                <th className="py-1 px-2">Calculation</th>
                                                <th className="py-1 px-2">Block</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((r, i) => (
                                                <tr key={i} className="border-b border-green-900/10">
                                                    <td className="py-1 px-2 font-bold text-green-500">{r.name}</td>
                                                    <td className="py-1 px-2">{r.hostsRequested}</td>
                                                    <td className="py-1 px-2 opacity-70">
                                                        {r.hostsRequested} + 3 &le; {r.allocSize}
                                                    </td>
                                                    <td className="py-1 px-2 text-yellow-700 font-bold">{r.allocSize}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-green-600 border-b border-green-900/30 inline-block">Βήμα 2: Κατανομή</h4>
                                <p className="opacity-80">
                                    {"Ξεκινάμε από την αρχική διεύθυνση και κολλάμε τα δίκτυα το ένα μετά το άλλο. Κάθε δίκτυο ξεκινάει εκεί που τελειώνει το προηγούμενο."}
                                </p>
                                <ul className="list-disc list-inside text-xs space-y-1 text-green-800 mt-2">
                                    <li><strong>Router IP:</strong> Είναι η πρώτη διαθέσιμη (Network + 1).</li>
                                    <li><strong>Hosts:</strong> Ξεκινούν μετά τον Router (Network + 2).</li>
                                    <li><strong>Broadcast:</strong> Η τελευταία διεύθυνση του Block.</li>
                                </ul>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}