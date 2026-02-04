"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, Terminal, Lock, Skull, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function Block() {
    const lines = useMemo(
        () => [
            "> booting integrity daemon...",
            "> checking academic_honesty=true",
            "> scanning clipboard... [REDACTED]",
            "> subnet solver-tool status: LOCKED",
            "> reason: exam_mode=ON",
            "> verdict: go study, legend.",
        ],
        []
    );
    const [showToast, setShowToast] = useState(true);
    const [showMeme, setShowMeme] = useState(false);
    const [shown, setShown] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setShowToast(false), 4000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => {
            setShown((s) => (s < lines.length ? s + 1 : s));
        }, 350);
        return () => clearInterval(t);
    }, [lines.length]);

    return (
        <div className="min-h-screen w-full bg-[#050505] text-green-700 flex items-center justify-center p-4 md:p-8 font-mono selection:bg-green-900/30 selection:text-green-400">
            <Card className="w-full max-w-3xl border border-green-900/30 shadow-2xl bg-black relative overflow-hidden">
                {/* subtle scanlines */}
                <div
                    className="
                        absolute inset-0 pointer-events-none opacity-5
                        bg-[linear-gradient(to_bottom,transparent_50%,rgba(20,83,45,0.3)_51%)]
                        bg-[length:100%_4px]
                    "
                />

                <CardHeader className="border-b border-green-900/20 pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle
                                className="text-2xl tracking-tight text-green-600 glitch"
                                data-text="Nope."
                            >
                                Nope.
                            </CardTitle>

                            <CardDescription className="mt-1 italic text-green-900">
                                You are <span className="text-green-700">not</span> cheating today.
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-2 opacity-70">
                            <Lock className="w-5 h-5 text-green-900/60" />
                            <span className="text-xs text-green-900/80 uppercase tracking-wider font-bold">
                                exam lock
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {/* “terminal” output */}
                    <div className="rounded border border-green-900/20 bg-[#080808] p-4 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                            <Terminal className="w-4 h-4 text-green-800" />
                            <span className="text-xs text-green-900 uppercase tracking-wider font-bold opacity-80">
                                console
                            </span>
                            <span className="ml-auto text-[10px] text-green-900/70">RFC 791 says: touch grass</span>
                        </div>

                        <div className="space-y-1 text-sm">
                            {lines.slice(0, shown).map((l) => (
                                <div key={l} className="text-green-700/90">
                                    {l}
                                </div>
                            ))}
                            {shown < lines.length && (
                                <div className="text-green-800/80 animate-pulse">_</div>
                            )}
                        </div>

                        {/* fake progress bar */}
                        <div className="mt-4 h-2 rounded bg-green-950/30 border border-green-900/20 overflow-hidden">
                            <div className="h-full w-2/3 animate-pulse bg-green-900/30" />
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-green-900/80">
                            <Skull className="w-4 h-4 opacity-70" />
                            <span>
                                Attempt logged: <span className="text-green-700">lol jk</span>
                            </span>
                        </div>
                    </div>
                    <div className="border border-green-900/20 rounded bg-[#060606] p-4 text-center">
                        {!showMeme ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMeme(true)}
                                className="
                                    cursor-pointer bg-black
                                    border-green-900/30 text-green-700
                                    hover:bg-green-900/10 hover:text-green-500 hover:border-green-800
                                    transition-colors
                                    animate-pulse
                                    "
                            >
                                I swear I’m studying
                            </Button>
                        ) : (
                            <div className="space-y-2 text-green-700">
                                <div className="text-lg font-bold">🙂 Sure you are.</div>
                                <div className="text-s text-green-900/80 italic">
                                    Subnetting is temporary. βαθμοί είναι forever.
                                </div>
                                <pre className="mt-4 mx-auto w-fit text-[14px] text-green-900/70 whitespace-pre leading-none">
                                    {`
CLOSE THE LAPTOP NOW 🫡   
YOU'LL THANK ME LATER    

`.trim()}
                                </pre>


                            </div>
                        )}
                    </div>


                </CardContent>

                <CardFooter className="border-t border-green-900/20 flex items-center justify-between py-4 bg-green-950/5">
                    <div className="text-[10px] text-green-900 uppercase tracking-wider font-bold opacity-70">
                        status: locked • mode: troll • vibes: immaculate
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-green-900/20 cursor-pointer bg-transparent text-green-800 hover:bg-green-900/10 hover:text-green-600 hover:border-green-800 transition-all"
                        onClick={() => window.location.reload()}
                    >
                        Back to studying <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardFooter>
            </Card>
            {showToast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="
                            border border-red-900/40 bg-black
                            px-6 py-4 text-sm text-red-700
                            shadow-2xl
                            animate-in fade-in zoom-in-95"
                        >
                        <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-800" />
                            <span>
                                Access granted… <span className="text-red-500 font-bold">NOT</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
