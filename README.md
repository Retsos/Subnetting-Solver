<div align="center">
  <img src="public/icon.svg" width="120" alt="VLSM Solver Logo" />
  <br/>
  <h1>VLSM Subnet Solver // STEALTH EDITION</h1>
  
  <p>
    <i>"Because wasting IP addresses is a crime against the network."</i>
  </p>
  
  <p>
    <b>First-Fit Memory Allocation • Gap Filling Logic • Visual Mapping</b>
  </p>
</div>

---

## 🌑 Overview

Most subnet calculators are glorified spreadsheets. They just append subnets linearly, wasting space and failing to visualize fragmentation. 

**This is different.** This tool treats IP address space like computer memory. It implements a strict **First-Fit Interval Algorithm** (ported from low-level C) to intelligently fill gaps. If a large subnet leaves a "hole" due to binary alignment rules, this solver will circle back and fit smaller subnets (like /30 links) into those empty pockets.

Wrapped in a high-fidelity **Stealth/Matrix UI**, because networking tools shouldn't look like they were built in 1998.

## ⚡ Features

* **Cup Visualization:** A unique visual representation of IP blocks (32 IPs per "Cup"). Instantly spot fragmentation, reserved space, and broadcast overhead.
* **Gap Filling Logic:** Unlike standard linear allocators, this engine creates a map of "Free Intervals" and fits subnets into the first valid slot that adheres to alignment rules (`Offset % BlockSize == 0`).
* **Strict Validation:** Regex-based IP policing, overlap detection, and capacity overflow protection.
* **Stealth UI:** Fully custom dark mode interface with neon accents, `framer-motion` animations, and reactive inputs.
* **Detailed Breakdown:** Provides a line-by-line analysis of Network, Router, Usable Range, and Broadcast IPs for every subnet.

## 🧠 The Algorithm

The core logic is based on **Memory Management Principles**:

1.  **Normalization:** All inputs are converted to unsigned 32-bit integers.
2.  **Sorting:** Subnets are sorted by size (Descending), prioritizing Hosts over Links to minimize fragmentation.
3.  **Interval Scanning:**
    * The network starts as one giant `Free Interval`.
    * For each request, we scan the intervals for a slot where `StartIP % BlockSize == 0`.
    * Once placed, the interval is **split**, creating new (smaller) free intervals before and after the block.
4.  **Backfilling:** Small subnets (like Point-to-Point links) automatically fill the gaps left by the alignment of larger blocks.

## 🛠 Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Language:** TypeScript (Strict Mode)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Retsos/Subnetting-Solver.git
    cd my-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the dev server:**
    ```bash
    npm run dev
    ```

4.  **Open the portal:** Navigate to [http://localhost:3000](http://localhost:3000).

## 👥 Ops / Credits

This tool is a collaboration between low-level logic and high-level visuals.

* **[MasterTsif]**: Logic Core & C Implementation. The one who talks to the metal.
* **[Retsos]**: Frontend Architecture, UI/UX & Visuals. The one who makes the Matrix look good.

## 📄 License

Distributed under the **MIT License**. Use it to optimize your networks, pass your exams, or just stare at the falling code.

<div align="center">
  <br/>
  <span style="color: #15803d; font-family: monospace;">SYSTEM READY</span>
</div>
