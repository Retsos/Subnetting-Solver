# VLSM Subnet Solver // Stealth Edition

<img src="public/icon.svg" width="100" alt="VLSM Solver Banner" />
Designed and developed by **Retsos & MasterTsif**.

## 🌑 Overview

Most subnet calculators just spit out a table. This one visualizes the memory allocation.
Using a custom **First-Fit Interval Algorithm**, this tool mimics the way computer memory (and strictly aligned IP blocks) are allocated. It solves the fragmentation problem by "backfilling" smaller subnets into the gaps left by larger ones, ensuring 100% adherence to binary alignment rules.

Wrapped in a high-fidelity **Stealth/Matrix UI**, because networking tools don't have to be ugly.

## ⚡ Features

* **Cup Visualization:** A unique visual representation of IP blocks (32 IPs per "Cup") to easily identify fragmentation and overlaps.
* **Gap Filling Logic:** Implements a C-style memory allocator logic (ported to TypeScript) to correctly place subnets in available gaps.
* **Strict Validation:** Prevents invalid IP formats, capacity overflows, and overlapping ranges.
* **Stealth UI:** Fully custom dark mode interface with neon accents, framer-motion animations, and "cyber-snow" effects.
* **Step-by-Step Explainer:** Generates a human-readable explanation of the VLSM logic applied.
* **Real-time Interaction:** React-based architecture for instant feedback.

## 🛠 Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Effects:** React Snowfall

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/vlsm-solver.git](https://github.com/your-username/vlsm-solver.git)
    cd my-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🧠 The Algorithm

Unlike standard calculators that append subnets sequentially (often wasting space), this solver treats the network as a set of **Free Intervals**.

1.  **Sort:** Subnets are sorted by size (Largest to Smallest).
2.  **Scan:** For each subnet, the algorithm scans available Free Intervals.
3.  **Align & Fit:** It finds the first available slot where:
    * The Start IP is divisible by the Block Size (`IP % Size == 0`).
    * The subnet fits within the interval.
4.  **Split:** Once placed, the interval is split, and remaining gaps are kept for smaller subnets (like /30 links).

## 📸 Screenshots
<img width="1919" height="786" alt="image" src="https://github.com/user-attachments/assets/42cf8e13-5f35-4acb-9250-05c658a7a08d" />

## 🤝 Credits

* **Core Logic & UI:** MasterTsif & Retsos
* **Inspiration:** Classical networking memory allocation diagrams.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
