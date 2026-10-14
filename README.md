# 🧬 EvoSim — Neural Evolutionary Ecosystem in the Browser

> A real-time biological sandbox running entirely in the browser where autonomous organisms with feed-forward neural networks evolve survival strategies through natural selection — with zero hardcoded behavior.

![EvoSim Banner](https://img.shields.io/badge/Engine-60FPS_HTML5_Canvas-10b981?style=for-the-badge)
![AI Model](https://img.shields.io/badge/AI-Genetic_Neural_Networks-38bdf8?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-f43f5e?style=for-the-badge)
![Live Demo](https://img.shields.io/badge/Demo-Live_on_GitHub_Pages-a855f7?style=for-the-badge)

🔗 **Live Interactive Demo:** [https://poojakpdoshi-cmd.github.io/evosim/](https://poojakpdoshi-cmd.github.io/evosim/)  
📊 **Interactive Presentation Deck:** [https://poojakpdoshi-cmd.github.io/evosim/presentation.html](https://poojakpdoshi-cmd.github.io/evosim/presentation.html)

---

## 🌟 Overview

In most games or simulations, bots are programmed with deterministic rules (e.g. `if food_nearby -> move_towards(food)`). **EvoSim contains zero hardcoded behavior.**

* **Generation 1 (Chaos)**: Organisms spawn with completely randomized synaptic weight matrices. They spin aimlessly, collide with walls, and 95% quickly starve.
* **Generation 10 (Accidental Selection)**: The rare organisms with forward-propulsion bias accidentally bump into green food pellets, gaining energy to reproduce.
* **Generation 30+ (Emergent Intelligence)**: Sensor rays become functionally wired to steering motors. Organisms actively hunt food, decelerate when safe, and avoid obstacles.
* **Predator-Prey Co-Evolution**: Introducing carnivores creates arms-race dynamics where herbivores evolve flocking and evasion instincts.

---

## 🎮 Key Features

- **🧠 Microscopic Neural Networks**: Each organism has a feed-forward neural network ($7 \text{ Inputs} \rightarrow 8 \text{ Tanh Hidden} \rightarrow 2 \text{ Outputs}$) processing 5 directional raycast whiskers, energy reserves, and bias.
- **🔬 Live Neural X-Ray**: Click any organism to open an inspector HUD showing its live firing neurons and synaptic pathways colored by sign (blue for excitation, red for inhibition).
- **🌪️ God Mode & Climatic Catastrophes**:
  - `Ice Age`: Freezing temperatures double kinetic energy consumption.
  - `Famine`: Natural food replenishment stops entirely.
  - `Radiation Storm`: Drives hyper-mutations during cellular reproduction.
- **📈 Real-Time Population Telemetry**: Smooth rolling history canvas graphing herbivore and carnivore demographic curves.
- **🧱 Interactive Barrier Painting**: Hold `Shift` and drag the mouse on the arena to paint physical barriers that organisms and raycasts must navigate around.
- **🧬 DNA Export & Import**: Download your champion organism's neural weights as a `.json` file and share it or pit it against other evolved species!

---

## 🕹️ Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Inspect Organism** | `Left-Click` on any swimming creature |
| **Drop Food Pellet** | `Right-Click` or press `F` |
| **Draw Obstacles / Walls** | `Shift + Drag Mouse` |
| **Pause / Resume** | `Spacebar` |
| **Engine Speed** | `1` (1x), `2` (2x Warp), `5` (5x Hyper) |
| **Presentation Deck** | Click `Slides` or open `presentation.html` |

---

## 🚀 Running Locally

No npm dependencies, no build tools, no servers required:

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/evosim.git
   cd evosim
   ```
2. Double-click `index.html` to launch the simulation in your browser.
3. Open `presentation.html` or `evosim_presentation.pptx` for the complete architectural slide deck.

---

## 🏛️ Project Structure

```
evosim/
├── index.html                 # Main application dashboard
├── presentation.html          # Interactive 100vh slide deck
├── evosim_presentation.pptx   # Microsoft PowerPoint deck
├── style.css                  # Cyber-bio dark design system
├── src/
│   ├── neural.js              # Neural network & genetic operators
│   ├── organism.js            # Physics, raycasting & kinematics
│   ├── world.js               # Spatial hashing & climate dynamics
│   ├── chart.js               # Real-time population canvas chart
│   ├── ui.js                  # Inspector HUD & neural visualizer
│   └── main.js                # Game loop & user input bindings
└── README.md
```

---

## 📜 License
MIT License. Created with love for artificial life and algorithmic computing.
