"use client";

import { useState } from "react";
import { Network, Server, Plus, Trash2, Activity, Database, List, AlertCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { calculateVLSM, SubnetResult } from "./components/subnet-logic";
import { SubnetVisualizer } from "./components/subnet-visualizer";
import { SubnetExplainer } from "./components/subnet-explainer";
import { StatusDisplay } from "./components/status-display";
import Snowfall from "react-snowfall";

// Helper: IP Validation Regex
const isValidIP = (ip: string) => {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip);
};

// Helper: Add count to IP
const addIPs = (ip: string, count: number): string => {
  const parts = ip.split('.').map(Number);
  let val = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  val += count;
  return [
    (val >>> 24) & 0xff,
    (val >>> 16) & 0xff,
    (val >>> 8) & 0xff,
    val & 0xff,
  ].join('.');
}

// Helper: Check if Spare Range exists
const hasSpareIPs = (assignedEndIP: string, rangeEndIP: string) => {
  return assignedEndIP !== rangeEndIP;
}

export default function VLSMCalculator() {
  const INITIAL_IP = "192.251.123.0";
  const INITIAL_PREFIX = 24;
  const INITIAL_SUBNETS = [{ id: "1", name: "A1", hosts: 12 }];
  const INITIAL_LINKS = 4;

  const [baseIP, setBaseIP] = useState(INITIAL_IP);
  const [basePrefix, setBasePrefix] = useState<number | string>(INITIAL_PREFIX);
  const [subnets, setSubnets] = useState(INITIAL_SUBNETS);
  const [links, setLinks] = useState<number | string>(INITIAL_LINKS);

  const [results, setResults] = useState<SubnetResult[] | null>(null);
  const [showLineByLine, setShowLineByLine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- ACTIONS ---

  const resetResults = () => {
    if (results) {
      setResults(null);
      setError(null);
    }
  };

  const handleReset = () => {
    setBaseIP(INITIAL_IP);
    setBasePrefix(INITIAL_PREFIX);
    setSubnets([{ id: Date.now().toString(), name: "A1", hosts: 12 }]);
    setLinks(INITIAL_LINKS);
    setResults(null);
    setError(null);
    setShowLineByLine(false);
  };

  const addSubnet = () => {
    setSubnets([...subnets, { id: Date.now().toString(), name: "", hosts: 0 }]);
    resetResults();
  };

  const removeSubnet = (id: string) => {
    setSubnets(subnets.filter(s => s.id !== id));
    resetResults();
  };

  const updateSubnet = (id: string, field: 'name' | 'hosts', value: string | number) => {
    setSubnets(subnets.map(s => s.id === id ? { ...s, [field]: value } : s));
    resetResults();
  };

  const handleCalculate = () => {
    setError(null);

    const parsedPrefix = basePrefix === "" ? 0 : Number(basePrefix);
    const parsedLinks = links === "" ? 0 : Number(links);

    // VALIDATION
    if (!baseIP || !isValidIP(baseIP)) {
      setError("Invalid Base IP Address format (e.g. 192.168.1.0).");
      return;
    }
    if (parsedPrefix < 8 || parsedPrefix > 30) {
      setError("Prefix must be between /8 and /30.");
      return;
    }
    if (subnets.length === 0 && parsedLinks === 0) {
      setError("Please add at least one subnet or link.");
      return;
    }
    if (subnets.some(s => !s.name || s.hosts <= 0)) {
      setError("All subnets must have a name and at least 1 host.");
      return;
    }
    if (parsedLinks < 0) {
      setError("Links cannot be negative.");
      return;
    }

    try {
      const { results, totalUsed } = calculateVLSM(baseIP, parsedPrefix, subnets, parsedLinks);
      const totalCapacity = Math.pow(2, 32 - parsedPrefix);

      if (totalUsed > totalCapacity) {
        setError(`Insufficient Capacity! Need ${totalUsed} IPs but network /${parsedPrefix} only has ${totalCapacity}.`);
        setResults(null);
        return;
      }

      setResults(results);
      setShowLineByLine(false);
    } catch (e) {
      setError("Calculation failed. Please check your inputs.");
      console.error(e);
    }
  };

  return (
    <>
      <Snowfall color="white" style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 50,
        opacity: 0.2,
        pointerEvents: 'none'
      }} />

      <div className="min-h-screen w-full bg-[#050505] text-green-700 font-mono p-4 md:p-8 selection:bg-green-900/30 selection:text-green-400">

        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-green-900/30 pb-4">
            <Network className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-green-600">VLSM Subnet Solver</h1>
              <p className="text-xs text-green-900 opacity-80">Advanced Allocation // Retsos & MasterTsif</p>
            </div>
          </div>

          {/* ERROR ALERT */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-950/20 border border-red-900/50 text-red-400 p-3 rounded flex items-center gap-3 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: INPUTS */}
            <div className="lg:col-span-1 space-y-6">

              {/* --- BASE NETWORK CARD --- */}
              <Card className="bg-[#0a0a0a] border-green-900/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-widest text-green-800 flex items-center gap-2">
                    <Server className="w-4 h-4" /> Base Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-green-900">Network IP</Label>
                      <Input
                        value={baseIP}
                        onChange={(e) => { setBaseIP(e.target.value); resetResults(); }}
                        className="bg-black/40 border-green-900/30 text-green-500 h-9 font-mono"
                        placeholder="192.168.1.0"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs text-green-900">CIDR (/)</Label>
                      <Input
                        type="number"
                        value={basePrefix}
                        onChange={(e) => {
                          const val = e.target.value === "" ? "" : Number(e.target.value);
                          setBasePrefix(val);
                          resetResults();
                        }}
                        className="bg-black/40 border-green-900/30 text-yellow-600 h-9 font-mono text-center"
                        placeholder="24"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-green-900/20">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm uppercase tracking-widest text-green-800 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Subnets
                  </CardTitle>
                  <Button onClick={addSubnet} size="sm" variant="ghost" className="h-6 text-green-600 hover:text-green-400 hover:bg-green-900/20">
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subnets.map((sub, idx) => (
                    <div key={sub.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                      <span className="text-xs text-green-900 font-bold w-4">{idx + 1}.</span>
                      <Input
                        placeholder="Name (A)"
                        value={sub.name}
                        onChange={(e) => updateSubnet(sub.id, 'name', e.target.value)}
                        className="bg-black/40 border-green-900/30 text-green-500 h-8 font-mono w-20"
                      />
                      <Input
                        type="number"
                        placeholder="Hosts"
                        value={sub.hosts === 0 ? "" : sub.hosts}
                        onChange={(e) => updateSubnet(sub.id, 'hosts', e.target.value === "" ? 0 : Number(e.target.value))}
                        className="bg-black/40 border-green-900/30 text-green-500 h-8 font-mono flex-1"
                      />
                      <Button onClick={() => removeSubnet(sub.id)} size="icon" variant="ghost" className="h-8 w-8 cursor-pointer text-green-900 hover:text-red-500 hover:bg-red-900/10">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-green-900/10">
                    <Label className="text-xs text-green-900 mb-2 block">Ζεύξεις (Z-subnets, 2 hosts)</Label>
                    <Input
                      type="number"
                      value={links === 0 ? "" : links}
                      placeholder="0"
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : Number(e.target.value);
                        setLinks(val);
                        resetResults();
                      }}
                      className="bg-black/40 border-green-900/30 text-green-500 h-8 font-mono"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="cursor-pointer border-green-900/40 text-green-700 hover:text-green-500 hover:bg-green-900/20 hover:border-green-600"
                  title="Reset to Defaults"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button onClick={handleCalculate} className="flex-1 cursor-pointer bg-green-900/20 hover:bg-green-900/30 text-green-500 border border-green-900/50">
                  <Activity className="w-4 h-4 mr-2" />
                  Calculate Allocation
                </Button>
              </div>

            </div>

            {/* RIGHT: RESULTS OR STATUS */}
            <div className="lg:col-span-2 space-y-6">
              {results ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                  {/* Visualizer */}
                  <SubnetVisualizer results={results} basePrefix={Number(basePrefix) || 24} />

                  {/* Table - UPDATED COLUMNS */}
                  <div className="rounded-md border border-green-900/20 bg-[#080808] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-green-900/10 text-green-600 font-bold uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Req/Block</th>
                            <th className="px-4 py-3">Network IP</th>
                            <th className="px-4 py-3">Router IP</th>
                            <th className="px-4 py-3">Broadcast</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-900/10">
                          {results.map((res, i) => (
                            <tr key={i} className="hover:bg-green-900/5 transition-colors">
                              <td className="px-4 py-3 font-bold text-green-500">{res.name}</td>
                              <td className="px-4 py-3">
                                <span className="text-green-700">{res.hostsRequested}</span>
                                <span className="text-green-900 mx-1">/</span>
                                <span className="text-yellow-700 font-bold">{res.allocSize}</span>
                              </td>
                              <td className="px-4 py-3 font-mono text-green-400">
                                {res.networkIP}<span className="text-green-800">/{res.prefix}</span>
                              </td>
                              <td className="px-4 py-3 font-mono text-green-600">
                                {res.type === 'LINK' ? '-' : res.routerIP}
                              </td>
                              <td className="px-4 py-3 font-mono text-red-900/80">{res.broadcastIP}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Line by Line Details - FIXED LINK LOGIC */}
                  <div className="border border-green-900/20 rounded bg-[#0a0a0a]">
                    <button
                      type="button"
                      onClick={() => setShowLineByLine(!showLineByLine)}
                      className="w-full flex items-center justify-between p-3 text-xs uppercase font-bold text-green-700 hover:bg-green-900/5 transition-colors"
                    >
                      <span className="flex items-center gap-2"><List className="w-4 h-4" /> Show IPs Line-by-Line</span>
                      <span className="text-green-900">{showLineByLine ? "Collapse" : "Expand"}</span>
                    </button>

                    {showLineByLine && (
                      <div className="p-4 space-y-6 font-mono text-xs border-t border-green-900/20 max-h-[400px] overflow-y-auto 
                        pr-2
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-[#050505]
                        [&::-webkit-scrollbar-thumb]:bg-green-900/40
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:hover:bg-green-600/60"
                      >
                        {results.map((res, i) => {
                          // Calculate where the "Assigned" hosts end
                          const lastAssigned = addIPs(res.rangeStart, res.hostsRequested - 1);
                          const hasSpare = hasSpareIPs(lastAssigned, res.rangeEnd);
                          const firstSpare = addIPs(lastAssigned, 1);

                          return (
                            <div key={i} className="space-y-1">
                              <div className="text-green-500 font-bold mb-1 flex items-center gap-2">
                                <span>Subnet {res.name} (/{res.prefix})</span>
                                {res.type === 'LINK' && <span className="text-[10px] bg-green-900/20 px-1 rounded text-green-600">LINK</span>}
                              </div>
                              <div className="pl-4 text-green-800 space-y-0.5">
                                {/* Network */}
                                <div className="flex gap-2">
                                  <span className="w-16 text-right opacity-50">Network:</span>
                                  <span className="text-green-600">{res.networkIP}</span>
                                </div>

                                {/* LINK DISPLAY LOGIC - FIXED */}
                                {res.type === 'LINK' ? (
                                  <>
                                    <div className="flex gap-2">
                                      <span className="w-16 text-right opacity-50">Endpoint A:</span>
                                      {/* Στα Links, το RouterIP έχει αποθηκεύσει το (Network + 1) */}
                                      <span className="text-yellow-700">{res.routerIP}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="w-16 text-right opacity-50">Endpoint B:</span>
                                      {/* Στα Links /30, το RangeEnd είναι το (Network + 2) */}
                                      <span className="text-yellow-700">{res.rangeEnd}</span>
                                    </div>
                                  </>
                                ) : (
                                  /* HOST DISPLAY LOGIC */
                                  <>
                                    <div className="flex gap-2">
                                      <span className="w-16 text-right opacity-50">Router:</span>
                                      <span className="text-yellow-700">{res.routerIP}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="w-16 text-right opacity-50">Hosts ({res.hostsRequested}):</span>
                                      <span className="text-green-500">
                                        {res.rangeStart} - {lastAssigned}
                                      </span>
                                    </div>
                                    {/* SHOW SPARE IPS IF ANY */}
                                    {hasSpare && (
                                      <div className="flex gap-2 opacity-50">
                                        <span className="w-16 text-right">Spare:</span>
                                        <span className="text-green-900 italic">
                                          {/* Αν είναι μόνο μία IP, μην δείχνεις εύρος */}
                                          {firstSpare === res.rangeEnd ? firstSpare : `${firstSpare} - ${res.rangeEnd}`}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Broadcast */}
                                <div className="flex gap-2">
                                  <span className="w-16 text-right opacity-50">Broadcast:</span>
                                  <span className="text-red-900/70">{res.broadcastIP}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Explainer */}
                  <SubnetExplainer results={results} />
                </motion.div>
              ) : (
                <StatusDisplay />
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}