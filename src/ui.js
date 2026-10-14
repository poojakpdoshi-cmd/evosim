/* =================================================================
   EVOSIM: UI & NEURAL NETWORK VISUALIZER (src/ui.js)
   Renders Live Neural Activations, Inspector HUD & Gene Importer
   ================================================================= */

class BrainVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
  }

  draw(organism) {
    if (!this.width || !this.height) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (!organism || !organism.brain) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '11px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK AN ORGANISM TO INSPECT', this.width / 2, this.height / 2);
      return;
    }

    const brain = organism.brain;
    const paddingX = 35;
    const paddingY = 18;

    // Node layout positions
    const layerX = [
      paddingX,
      this.width / 2,
      this.width - paddingX
    ];

    // Compute Y positions for each layer
    const getNodePositions = (count, x) => {
      const positions = [];
      const usableH = this.height - paddingY * 2;
      const stepY = count > 1 ? usableH / (count - 1) : usableH / 2;
      for (let i = 0; i < count; i++) {
        positions.push({ x, y: paddingY + i * stepY });
      }
      return positions;
    };

    const inputPos = getNodePositions(brain.inputCount, layerX[0]);
    const hiddenPos = getNodePositions(brain.hiddenCount, layerX[1]);
    const outputPos = getNodePositions(brain.outputCount, layerX[2]);

    // 1. Draw Synapses: Input -> Hidden
    let wIdx = 0;
    for (let h = 0; h < brain.hiddenCount; h++) {
      for (let i = 0; i < brain.inputCount; i++) {
        const weight = brain.weights[wIdx++];
        const alpha = Math.min(0.85, Math.abs(weight) * 0.4 + 0.1);
        ctx.beginPath();
        ctx.moveTo(inputPos[i].x, inputPos[i].y);
        ctx.lineTo(hiddenPos[h].x, hiddenPos[h].y);
        ctx.strokeStyle = weight > 0 ? `rgba(56, 189, 248, ${alpha})` : `rgba(244, 63, 94, ${alpha})`;
        ctx.lineWidth = Math.min(2.5, Math.max(0.5, Math.abs(weight) * 1.2));
        ctx.stroke();
      }
    }

    // Offset past hidden biases
    wIdx += brain.numBiasesH;

    // 2. Draw Synapses: Hidden -> Output
    for (let o = 0; o < brain.outputCount; o++) {
      for (let h = 0; h < brain.hiddenCount; h++) {
        const weight = brain.weights[wIdx++];
        const alpha = Math.min(0.85, Math.abs(weight) * 0.4 + 0.1);
        ctx.beginPath();
        ctx.moveTo(hiddenPos[h].x, hiddenPos[h].y);
        ctx.lineTo(outputPos[o].x, outputPos[o].y);
        ctx.strokeStyle = weight > 0 ? `rgba(16, 185, 129, ${alpha})` : `rgba(244, 63, 94, ${alpha})`;
        ctx.lineWidth = Math.min(2.5, Math.max(0.5, Math.abs(weight) * 1.2));
        ctx.stroke();
      }
    }

    // Helper to draw nodes with activation glow
    const drawNodes = (positions, activations, baseColor, labels = null) => {
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        const val = activations ? activations[i] : 0;
        const normVal = (val + 1) * 0.5; // [-1, 1] -> [0, 1]

        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor}, ${0.3 + normVal * 0.7})`;
        ctx.shadowColor = `rgba(${baseColor}, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Optional tiny label
        if (labels && labels[i]) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '8px Space Mono, monospace';
          ctx.textAlign = p.x < this.width / 2 ? 'right' : 'left';
          const labelX = p.x < this.width / 2 ? p.x - 7 : p.x + 7;
          ctx.fillText(labels[i], labelX, p.y + 3);
        }
      }
    };

    const inLabels = ['R1', 'R2', 'R3', 'R4', 'R5', 'ENG', 'BIAS'];
    const outLabels = ['STEER', 'THRUST'];

    drawNodes(inputPos, brain.lastInputs, '56, 189, 248', inLabels);
    drawNodes(hiddenPos, brain.lastHidden, '129, 140, 248');
    drawNodes(outputPos, brain.lastOutputs, '16, 185, 129', outLabels);
  }
}

// UI Controller Class
class UIController {
  constructor(world, brainViz, chart) {
    this.world = world;
    this.brainViz = brainViz;
    this.chart = chart;
    this.selectedOrganism = null;

    this.bindDOM();
  }

  bindDOM() {
    // Top Stats
    this.domGen = document.getElementById('topGen');
    this.domHerbs = document.getElementById('topHerbs');
    this.domCarns = document.getElementById('topCarns');
    this.domFps = document.getElementById('topFps');

    // Inspector Elements
    this.domInspectorCard = document.getElementById('inspectorCard');
    this.domCreatureId = document.getElementById('creatureId');
    this.domSpeciesTag = document.getElementById('speciesTag');
    this.domEnergyBar = document.getElementById('energyBarFill');
    this.domEnergyVal = document.getElementById('energyVal');
    this.domAgeVal = document.getElementById('ageVal');
    this.domGenVal = document.getElementById('genVal');
    this.domFoodVal = document.getElementById('foodVal');
    this.domOffspringVal = document.getElementById('offspringVal');

    // Export Champion Button
    const btnExport = document.getElementById('btnExportChampion');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportDNA());
    }

    // Import DNA File Input
    const fileImport = document.getElementById('fileImportDNA');
    if (fileImport) {
      fileImport.addEventListener('change', (e) => this.importDNA(e));
    }
  }

  selectOrganism(org) {
    this.selectedOrganism = org;
  }

  updateInspector() {
    if (!this.selectedOrganism || this.selectedOrganism.isDead) {
      // Find oldest living creature or null
      if (this.selectedOrganism && this.selectedOrganism.isDead) {
        this.selectedOrganism = this.world.organisms[0] || null;
      }
    }

    const org = this.selectedOrganism;

    if (!org) {
      this.domCreatureId.textContent = 'None Selected';
      this.domSpeciesTag.textContent = '---';
      this.domSpeciesTag.className = 'species-tag';
      this.domEnergyBar.style.width = '0%';
      this.domEnergyVal.textContent = '0%';
      this.domAgeVal.textContent = '-';
      this.domGenVal.textContent = '-';
      this.domFoodVal.textContent = '-';
      this.domOffspringVal.textContent = '-';
      this.brainViz.draw(null);
      return;
    }

    // Populate Inspector Values
    this.domCreatureId.textContent = `#${org.id}`;
    this.domSpeciesTag.textContent = org.species;
    this.domSpeciesTag.className = `species-tag ${org.species}`;

    const maxEnergy = org.species === 'carnivore' ? 220 : 180;
    const energyPct = Math.max(0, Math.min(100, Math.round((org.energy / maxEnergy) * 100)));
    this.domEnergyBar.style.width = `${energyPct}%`;
    this.domEnergyVal.textContent = `${energyPct}%`;

    this.domAgeVal.textContent = `${Math.floor(org.age / 60)}s`;
    this.domGenVal.textContent = `Gen ${org.generation}`;
    this.domFoodVal.textContent = `${org.foodEaten}`;
    this.domOffspringVal.textContent = `${org.offspringCount}`;

    // Update Live Brain Network
    this.brainViz.draw(org);
  }

  updateTopBar(fps) {
    if (this.domGen) this.domGen.textContent = `GEN ${this.world.stats.peakGeneration}`;
    if (this.domHerbs) this.domHerbs.textContent = `${this.world.stats.totalHerbivores}`;
    if (this.domCarns) this.domCarns.textContent = `${this.world.stats.totalCarnivores}`;
    if (this.domFps) this.domFps.textContent = `${fps}`;
  }

  exportDNA() {
    // Pick selected or smartest organism
    let target = this.selectedOrganism;
    if (!target) {
      target = this.world.organisms.reduce((best, cur) => cur.generation > best.generation ? cur : best, this.world.organisms[0]);
    }
    if (!target) return alert('No organisms to export!');

    const data = {
      specimen: `EvoSim-${target.species}-Gen${target.generation}`,
      species: target.species,
      generation: target.generation,
      brain: target.brain.toJSON()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `champion_dna_gen${target.generation}_${target.species}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importDNA(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.brain && json.brain.weights) {
          const brain = NeuralNetwork.fromJSON(json.brain);
          const x = this.world.width / 2 + (Math.random() * 40 - 20);
          const y = this.world.height / 2 + (Math.random() * 40 - 20);
          const creature = new Organism(x, y, json.species || 'herbivore', brain, (json.generation || 1) + 1);
          creature.energy = 150;
          this.world.organisms.push(creature);
          this.selectOrganism(creature);
          alert(`Successfully imported Champion DNA (${json.species || 'herbivore'}, Gen ${json.generation || 1})!`);
        }
      } catch (err) {
        alert('Invalid DNA JSON file format.');
      }
    };
    reader.readAsText(file);
  }
}

// Export for browser
window.BrainVisualizer = BrainVisualizer;
window.UIController = UIController;
