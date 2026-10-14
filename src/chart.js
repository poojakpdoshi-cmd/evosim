/* =================================================================
   EVOSIM: TELEMETRY & POPULATION CHART (src/chart.js)
   Real-Time Rolling Population & Fitness Graph on Canvas
   ================================================================= */

class PopulationChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maxPoints = 80;
    this.history = []; // Array of { herbs, carns, avgEnergy }
    this.sampleInterval = 30; // Sample every 30 ticks (~0.5s)
    this.tickCounter = 0;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
  }

  update(world) {
    this.tickCounter++;
    if (this.tickCounter < this.sampleInterval) return;
    this.tickCounter = 0;

    this.history.push({
      herbs: world.stats.totalHerbivores,
      carns: world.stats.totalCarnivores,
      avgEnergy: world.stats.averageEnergy
    });

    if (this.history.length > this.maxPoints) {
      this.history.shift();
    }
  }

  draw() {
    if (!this.width || !this.height) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.history.length < 2) return;

    // Draw horizontal faint gridlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 0.25; y < 1; y += 0.25) {
      ctx.beginPath();
      ctx.moveTo(0, this.height * y);
      ctx.lineTo(this.width, this.height * y);
      ctx.stroke();
    }

    // Find max value for dynamic scaling
    let maxVal = 20;
    for (const pt of this.history) {
      if (pt.herbs > maxVal) maxVal = pt.herbs;
      if (pt.carns * 3 > maxVal) maxVal = pt.carns * 3; // Carnivores scaled for visibility
    }
    maxVal *= 1.15; // Padding

    const stepX = this.width / (this.maxPoints - 1);
    const startX = (this.maxPoints - this.history.length) * stepX;

    // Helper to draw single line series
    const drawSeries = (key, color, glow, multiplier = 1) => {
      ctx.beginPath();
      for (let i = 0; i < this.history.length; i++) {
        const val = this.history[i][key] * multiplier;
        const x = startX + i * stepX;
        const y = this.height - (val / maxVal) * (this.height - 10) - 5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 4;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    // 1. Herbivores (Green)
    drawSeries('herbs', '#10b981', 'rgba(16, 185, 129, 0.4)');

    // 2. Carnivores (Red/Crimson)
    drawSeries('carns', '#f43f5e', 'rgba(244, 63, 94, 0.4)');
  }
}

// Export for browser
window.PopulationChart = PopulationChart;
