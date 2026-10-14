const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

// Theme Palette (Cyberpunk / Bio-Lab Dark Theme)
const COLORS = {
  bg: "0B0F19",
  cardBg: "161F30",
  cardBorder: "1E293B",
  emerald: "10B981",
  cyan: "38BDF8",
  purple: "818CF8",
  amber: "F59E0B",
  textMuted: "94A3B8",
  textLight: "F8FAFC",
  white: "FFFFFF",
};

// Helper: Add Standard Header
function addHeader(slide, title, category, slideNum) {
  // Category Pill
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.5,
    w: 4.0,
    h: 0.3,
    fontSize: 10,
    fontFace: "Arial",
    color: COLORS.emerald,
    bold: true,
  });

  // Main Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.8,
    w: 10.0,
    h: 0.6,
    fontSize: 24,
    fontFace: "Arial",
    color: COLORS.textLight,
    bold: true,
  });

  // Slide Number
  slide.addText(`${slideNum} / 6`, {
    x: 11.5,
    y: 0.5,
    w: 1.0,
    h: 0.3,
    fontSize: 11,
    fontFace: "Arial",
    color: COLORS.textMuted,
    align: "right",
  });
}

// -------------------------------------------------------------
// SLIDE 1: TITLE SLIDE
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };

  // Decorative badge
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 2.8,
    h: 0.35,
    fill: { color: "1E293B" },
    line: { color: COLORS.emerald, width: 1 },
  });
  slide.addText("ARTIFICIAL LIFE & GENETIC AI", {
    x: 0.8,
    y: 1.5,
    w: 2.8,
    h: 0.35,
    fontSize: 9,
    fontFace: "Arial",
    color: COLORS.emerald,
    bold: true,
    align: "center",
  });

  // Main Big Title
  slide.addText("EvoSim", {
    x: 0.8,
    y: 2.0,
    w: 11.0,
    h: 1.2,
    fontSize: 60,
    fontFace: "Arial",
    color: COLORS.white,
    bold: true,
  });

  // Subtitle
  slide.addText("Neural Evolutionary Ecosystem in the Browser", {
    x: 0.8,
    y: 3.2,
    w: 11.0,
    h: 0.6,
    fontSize: 22,
    fontFace: "Arial",
    color: COLORS.cyan,
  });

  // Pitch Tagline
  slide.addText(
    "A real-time simulation where autonomous digital creatures with microscopic neural networks evolve survival strategies through natural selection — zero scripted behaviors.",
    {
      x: 0.8,
      y: 4.0,
      w: 8.5,
      h: 0.8,
      fontSize: 14,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 22,
    }
  );

  // Stats / Highlights Row
  const highlights = [
    { label: "AI ENGINE", val: "Genetic Neural Nets" },
    { label: "EXECUTION", val: "100% Client-Side 60FPS" },
    { label: "EVOLUTION", val: "Darwinian Selection" },
  ];

  highlights.forEach((h, i) => {
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8 + i * 3.4,
      y: 5.4,
      w: 3.1,
      h: 1.2,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
    });
    slide.addText(h.label, {
      x: 1.0 + i * 3.4,
      y: 5.55,
      w: 2.7,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      color: COLORS.emerald,
      bold: true,
    });
    slide.addText(h.val, {
      x: 1.0 + i * 3.4,
      y: 5.85,
      w: 2.7,
      h: 0.5,
      fontSize: 14,
      fontFace: "Arial",
      color: COLORS.white,
      bold: true,
    });
  });
}

// -------------------------------------------------------------
// SLIDE 2: WHAT IS EVOSIM?
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };
  addHeader(slide, "The Core Concept: A Living Digital Terrarium", "Project Overview", 2);

  // Left Big Card: The Metaphor
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.6,
    w: 5.5,
    h: 5.0,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 },
  });
  slide.addText("THE DIGITAL TERRARIUM", {
    x: 1.1,
    y: 1.9,
    w: 4.9,
    h: 0.3,
    fontSize: 11,
    fontFace: "Arial",
    color: COLORS.cyan,
    bold: true,
  });
  slide.addText(
    "Instead of programming bots with hardcoded 'if-else' rules, EvoSim creates a sandbox of artificial life.\n\n" +
      "• Organisms swim through a 2D physics ecosystem.\n" +
      "• They constantly expend energy by moving.\n" +
      "• Eating food replenishes energy and enables reproduction.\n" +
      "• Starvation leads to death and removal from the gene pool.",
    {
      x: 1.1,
      y: 2.3,
      w: 4.9,
      h: 3.8,
      fontSize: 13,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 22,
    }
  );

  // Right Top Card: Zero Hardcoding
  slide.addShape(pres.ShapeType.rect, {
    x: 6.7,
    y: 1.6,
    w: 5.8,
    h: 2.35,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 },
  });
  slide.addText("100% UNPROGRAMMED BEHAVIOR", {
    x: 7.0,
    y: 1.9,
    w: 5.2,
    h: 0.3,
    fontSize: 11,
    fontFace: "Arial",
    color: COLORS.emerald,
    bold: true,
  });
  slide.addText(
    "No one tells the creature 'turn toward the food'. Generation 1 is born with totally random brain weights and moves in chaotic circles. Intelligent behavior is purely discovered through evolutionary pressure.",
    {
      x: 7.0,
      y: 2.3,
      w: 5.2,
      h: 1.4,
      fontSize: 12,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 20,
    }
  );

  // Right Bottom Card: The Emergence
  slide.addShape(pres.ShapeType.rect, {
    x: 6.7,
    y: 4.25,
    w: 5.8,
    h: 2.35,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 },
  });
  slide.addText("EMERGENT COMPLEXITY", {
    x: 7.0,
    y: 4.55,
    w: 5.2,
    h: 0.3,
    fontSize: 11,
    fontFace: "Arial",
    color: COLORS.purple,
    bold: true,
  });
  slide.addText(
    "Over time, complex strategies naturally emerge: vision-guided chasing, gliding to conserve energy, corner foraging, and flocking behaviors to out-compete rivals for limited food reserves.",
    {
      x: 7.0,
      y: 4.95,
      w: 5.2,
      h: 1.4,
      fontSize: 12,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 20,
    }
  );
}

// -------------------------------------------------------------
// SLIDE 3: HOW THEY THINK (NEURAL ARCHITECTURE)
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };
  addHeader(slide, "Organism Anatomy: Sensors, Brain & Muscles", "Technical Architecture", 3);

  const pillars = [
    {
      title: "1. SENSORY INPUTS",
      color: COLORS.cyan,
      items: [
        "Raycast Vision: 5–7 sensory whiskers",
        "Distance to nearest food dot",
        "Angle to food relative to heading",
        "Wall proximity & barrier detection",
        "Internal state: Current energy level",
      ],
    },
    {
      title: "2. NEURAL BRAIN",
      color: COLORS.emerald,
      items: [
        "Feed-Forward Neural Network",
        "Input Layer: 6 sensory neurons",
        "Hidden Layer: 8 dense neurons (Tanh)",
        "Output Layer: 2 motor command neurons",
        "DNA = Array of synaptic weights & biases",
      ],
    },
    {
      title: "3. MOTOR OUTPUTS",
      color: COLORS.purple,
      items: [
        "Steering Velocity: Turn Left / Right",
        "Thrust Acceleration: Forward speed",
        "Energy Cost: Fast bursts consume more energy",
        "Inertia: Realistic physics & momentum",
        "Natural drag & water friction",
      ],
    },
  ];

  pillars.forEach((p, i) => {
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8 + i * 3.9,
      y: 1.6,
      w: 3.6,
      h: 5.0,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
    });

    slide.addText(p.title, {
      x: 1.1 + i * 3.9,
      y: 1.9,
      w: 3.0,
      h: 0.35,
      fontSize: 12,
      fontFace: "Arial",
      color: p.color,
      bold: true,
    });

    let listText = p.items.map((it) => `• ${it}`).join("\n\n");
    slide.addText(listText, {
      x: 1.1 + i * 3.9,
      y: 2.4,
      w: 3.0,
      h: 4.0,
      fontSize: 12,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 18,
    });
  });
}

// -------------------------------------------------------------
// SLIDE 4: THE EVOLUTION TIMELINE
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };
  addHeader(slide, "The Evolutionary Timeline: From Chaos to Smarts", "Natural Selection In Action", 4);

  const steps = [
    {
      phase: "GEN 1: RANDOM CHAOS",
      time: "Minute 0:00",
      color: COLORS.amber,
      desc: "Creatures spawn with random synaptic weights. They spin wildly, crash into arena borders, fail to notice food right next to them, and 95% quickly starve.",
    },
    {
      phase: "GEN 10: ACCIDENTAL WINNERS",
      time: "Minute 2:30",
      color: COLORS.cyan,
      desc: "A handful of creatures happened to have forward-moving bias. They bumped into food, survived longer, and produced offspring with slight random DNA mutations.",
    },
    {
      phase: "GEN 30: TARGETED HUNTING",
      time: "Minute 6:00",
      color: COLORS.emerald,
      desc: "Whiskers are now connected to steering motors. The moment a green food dot triggers a sensor, the creature immediately aligns its trajectory and accelerates.",
    },
    {
      phase: "GEN 60+: HYPER-EFFICIENT ALPHAS",
      time: "Minute 12:00+",
      color: COLORS.purple,
      desc: "Creatures master energy conservation: coasting when food is scarce, sharp braking at food clusters, and avoiding arena corners where they might get trapped.",
    },
  ];

  steps.forEach((st, i) => {
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8 + i * 2.9,
      y: 1.6,
      w: 2.7,
      h: 5.0,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
    });

    slide.addText(st.time, {
      x: 1.0 + i * 2.9,
      y: 1.9,
      w: 2.3,
      h: 0.25,
      fontSize: 9,
      fontFace: "Arial",
      color: st.color,
      bold: true,
    });

    slide.addText(st.phase, {
      x: 1.0 + i * 2.9,
      y: 2.2,
      w: 2.3,
      h: 0.6,
      fontSize: 12,
      fontFace: "Arial",
      color: COLORS.white,
      bold: true,
    });

    slide.addText(st.desc, {
      x: 1.0 + i * 2.9,
      y: 2.9,
      w: 2.3,
      h: 3.4,
      fontSize: 11,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 18,
    });
  });
}

// -------------------------------------------------------------
// SLIDE 5: GOD MODE & INTERACTIVE SANDBOX
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };
  addHeader(slide, "User Experience: You are the Ecosystem 'God'", "Interactive Features", 5);

  const features = [
    {
      title: "🔬 Live Neural X-Ray",
      color: COLORS.cyan,
      desc: "Click any organism to pause or inspect it. Watch its neural nodes light up in real-time as signals travel from its eyes to its steering fins.",
    },
    {
      title: "🌪️ Climatic Catastrophes",
      color: COLORS.amber,
      desc: "Test evolutionary resilience! Trigger an 'Ice Age' (higher movement cost), 'Drought' (food famine), or 'Radiation Spike' (hyper-mutation rates).",
    },
    {
      title: "📊 Population Analytics",
      color: COLORS.emerald,
      desc: "Live charts tracking average lifespan, swimming speed, neural density, and food consumption efficiency across all generations.",
    },
    {
      title: "🧬 DNA Export & Import",
      color: COLORS.purple,
      desc: "Save the smartest creature's neural weights as a JSON file. Share your champion organism with others or pit two evolved species against each other!",
    },
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 5.8;
    const y = 1.6 + row * 2.5;

    slide.addShape(pres.ShapeType.rect, {
      x,
      y,
      w: 5.5,
      h: 2.2,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
    });

    slide.addText(f.title, {
      x: x + 0.3,
      y: y + 0.3,
      w: 4.9,
      h: 0.35,
      fontSize: 14,
      fontFace: "Arial",
      color: f.color,
      bold: true,
    });

    slide.addText(f.desc, {
      x: x + 0.3,
      y: y + 0.75,
      w: 4.9,
      h: 1.2,
      fontSize: 12,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 18,
    });
  });
}

// -------------------------------------------------------------
// SLIDE 6: TECH STACK & GITHUB WOW-FACTOR
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };
  addHeader(slide, "Why EvoSim is an Elite GitHub Portfolio Project", "Architecture & Portfolio Impact", 6);

  // Left Box: Technical Highlights
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.6,
    w: 5.5,
    h: 5.0,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 },
  });
  slide.addText("TECH ARCHITECTURE", {
    x: 1.1,
    y: 1.9,
    w: 4.9,
    h: 0.3,
    fontSize: 11,
    fontFace: "Arial",
    color: COLORS.cyan,
    bold: true,
  });
  slide.addText(
    "• Zero Expensive Dependencies: Pure JavaScript / HTML5 Canvas rendering at 60 FPS.\n\n" +
      "• Lightweight Neural Engine: Matrix math written from scratch for maximum speed & clarity.\n\n" +
      "• Spatial Hash Grid: Optimized collision detection allowing 300+ simultaneous creatures without lag.\n\n" +
      "• Zero Cloud/API Bills: Runs completely offline in any web browser.",
    {
      x: 1.1,
      y: 2.3,
      w: 4.9,
      h: 3.8,
      fontSize: 12,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 20,
    }
  );

  // Right Box: Why it stands out
  slide.addShape(pres.ShapeType.rect, {
    x: 6.7,
    y: 1.6,
    w: 5.8,
    h: 5.0,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 },
  });
  slide.addText("PORTFOLIO WOW FACTOR", {
    x: 7.0,
    y: 1.9,
    w: 5.2,
    h: 0.3,
    fontSize: 11,
    fontFace: "Arial",
    color: COLORS.emerald,
    bold: true,
  });
  slide.addText(
    "1. Not another boring CRUD app or generic API wrapper: Demonstrates deep algorithmic and mathematical competence.\n\n" +
      "2. Instant Live Demo: Anyone opening your GitHub Pages link sees the living ecosystem immediately.\n\n" +
      "3. Highly Shareable: People love watching evolution simulations on Twitter/Reddit; high potential for GitHub stars.\n\n" +
      "4. Interdisciplinary: Combines AI, evolutionary biology, graphics programming, and UI design.",
    {
      x: 7.0,
      y: 2.3,
      w: 5.2,
      h: 3.8,
      fontSize: 12,
      fontFace: "Arial",
      color: COLORS.textMuted,
      lineSpacing: 20,
    }
  );
}

// Generate PPTX File
const outputPath = path.join(__dirname, "evosim_presentation.pptx");
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log(`PPTX Successfully generated at: ${outputPath}`);
});
