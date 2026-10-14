/* =================================================================
   EVOSIM: ECOSYSTEM WORLD (src/world.js)
   Spatial Partitioning, Food Spawning, Collisions & Climate States
   ================================================================= */

class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.organisms = [];
    this.food = [];
    this.obstacles = [];
    this.particles = [];

    // Spatial Grid for O(1) Proximity Queries
    this.cellSize = 60;
    this.grid = new Map();

    // Population & Ecosystem Settings
    this.initialHerbivores = 45;
    this.initialCarnivores = 6;
    this.maxFood = 160;
    this.foodSpawnInterval = 4; // Ticks between spawns
    this.foodSpawnTimer = 0;

    // Environmental / Climate States: 'normal' | 'ice-age' | 'famine' | 'radiation'
    this.climateState = 'normal';

    // Global Stats
    this.stats = {
      generation: 1,
      totalHerbivores: 0,
      totalCarnivores: 0,
      totalFood: 0,
      averageAge: 0,
      averageEnergy: 0,
      peakGeneration: 1
    };

    this.init();
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  init() {
    this.organisms = [];
    this.food = [];
    this.particles = [];
    this.obstacles = [];

    // Spawn initial Herbivores
    for (let i = 0; i < this.initialHerbivores; i++) {
      const x = Math.random() * (this.width - 40) + 20;
      const y = Math.random() * (this.height - 40) + 20;
      this.organisms.push(new Organism(x, y, 'herbivore', null, 1));
    }

    // Spawn initial Carnivores
    for (let i = 0; i < this.initialCarnivores; i++) {
      const x = Math.random() * (this.width - 40) + 20;
      const y = Math.random() * (this.height - 40) + 20;
      this.organisms.push(new Organism(x, y, 'carnivore', null, 1));
    }

    // Spawn initial food
    for (let i = 0; i < 90; i++) {
      this.spawnFood();
    }
  }

  spawnFood(customX = null, customY = null) {
    if (this.food.length >= this.maxFood && customX === null) return;
    const x = customX !== null ? customX : Math.random() * (this.width - 30) + 15;
    const y = customY !== null ? customY : Math.random() * (this.height - 30) + 15;
    this.food.push({ x, y, radius: 3, energyValue: 35, pulse: Math.random() * Math.PI * 2 });
  }

  spawnObstacle(x, y, radius = 22) {
    this.obstacles.push({ x, y, radius });
  }

  clearObstacles() {
    this.obstacles = [];
  }

  // Spatial Hashing Implementation
  getGridKey(gx, gy) {
    return `${gx},${gy}`;
  }

  rebuildSpatialGrid() {
    this.grid.clear();

    // Index Food
    for (let i = 0; i < this.food.length; i++) {
      const f = this.food[i];
      const gx = Math.floor(f.x / this.cellSize);
      const gy = Math.floor(f.y / this.cellSize);
      const key = this.getGridKey(gx, gy);
      if (!this.grid.has(key)) this.grid.set(key, { food: [], herbivores: [], carnivores: [] });
      this.grid.get(key).food.push(f);
    }

    // Index Organisms
    for (let i = 0; i < this.organisms.length; i++) {
      const org = this.organisms[i];
      const gx = Math.floor(org.x / this.cellSize);
      const gy = Math.floor(org.y / this.cellSize);
      const key = this.getGridKey(gx, gy);
      if (!this.grid.has(key)) this.grid.set(key, { food: [], herbivores: [], carnivores: [] });
      if (org.species === 'herbivore') {
        this.grid.get(key).herbivores.push(org);
      } else {
        this.grid.get(key).carnivores.push(org);
      }
    }
  }

  // Fast neighborhood search
  getNearbyEntities(x, y, range, type) {
    const minGx = Math.floor((x - range) / this.cellSize);
    const maxGx = Math.floor((x + range) / this.cellSize);
    const minGy = Math.floor((y - range) / this.cellSize);
    const maxGy = Math.floor((y + range) / this.cellSize);

    const result = [];
    const rangeSq = range * range;

    for (let gx = minGx; gx <= maxGx; gx++) {
      for (let gy = minGy; gy <= maxGy; gy++) {
        const cell = this.grid.get(this.getGridKey(gx, gy));
        if (cell && cell[type]) {
          const items = cell[type];
          for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const dx = it.x - x;
            const dy = it.y - y;
            if (dx * dx + dy * dy <= rangeSq) {
              result.push(it);
            }
          }
        }
      }
    }
    return result;
  }

  getNearbyFood(x, y, range) { return this.getNearbyEntities(x, y, range, 'food'); }
  getNearbyHerbivores(x, y, range) { return this.getNearbyEntities(x, y, range, 'herbivores'); }
  getNearbyCarnivores(x, y, range) { return this.getNearbyEntities(x, y, range, 'carnivores'); }

  // Spawn visual death / eating particle explosion
  addParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.03,
        color
      });
    }
  }

  // Main simulation tick
  update(speedMultiplier = 1) {
    // 1. Environmental food replenishment
    if (this.climateState !== 'famine') {
      this.foodSpawnTimer++;
      const targetInterval = this.climateState === 'ice-age' ? this.foodSpawnInterval * 2.5 : this.foodSpawnInterval;
      if (this.foodSpawnTimer >= targetInterval) {
        this.foodSpawnTimer = 0;
        this.spawnFood();
      }
    }

    // 2. Rebuild spatial hash grid
    this.rebuildSpatialGrid();

    // 3. Update all organisms
    const newOffspring = [];
    let herbCount = 0;
    let carnCount = 0;
    let totalAge = 0;
    let totalEnergy = 0;
    let maxGen = this.stats.peakGeneration;

    for (let i = 0; i < this.organisms.length; i++) {
      const org = this.organisms[i];
      if (org.isDead) continue;

      if (org.species === 'herbivore') herbCount++;
      else carnCount++;
      totalAge += org.age;
      totalEnergy += org.energy;
      if (org.generation > maxGen) maxGen = org.generation;

      // Obstacle collision resolution
      for (const obs of this.obstacles) {
        const dx = org.x - obs.x;
        const dy = org.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = org.radius + obs.radius;
        if (dist < minDist) {
          const push = minDist - dist;
          org.x += (dx / dist) * push;
          org.y += (dy / dist) * push;
          org.angle = Math.atan2(dy, dx);
        }
      }

      // Organism update
      const baby = org.update(this, speedMultiplier, this.climateState);
      if (baby) {
        newOffspring.push(baby);
        this.addParticles(baby.x, baby.y, '#38bdf8', 6);
      }

      // Feeding logic
      if (org.species === 'herbivore') {
        // Herbivore eats Food
        const nearbyFood = this.getNearbyFood(org.x, org.y, org.radius + 6);
        if (nearbyFood.length > 0) {
          const eatenFood = nearbyFood[0];
          org.energy = Math.min(180, org.energy + eatenFood.energyValue);
          org.foodEaten++;
          this.addParticles(eatenFood.x, eatenFood.y, '#10b981', 5);

          // Remove food
          const idx = this.food.indexOf(eatenFood);
          if (idx !== -1) this.food.splice(idx, 1);
        }
      } else {
        // Carnivore hunts Herbivores
        const nearbyPrey = this.getNearbyHerbivores(org.x, org.y, org.radius + 8);
        if (nearbyPrey.length > 0) {
          const prey = nearbyPrey[0];
          if (!prey.isDead) {
            prey.isDead = true;
            org.energy = Math.min(220, org.energy + 75);
            org.foodEaten++;
            this.addParticles(prey.x, prey.y, '#f43f5e', 14);
          }
        }
      }

      // Check starvation death
      if (org.isDead) {
        this.addParticles(org.x, org.y, 'rgba(148, 163, 184, 0.6)', 8);
      }
    }

    // 4. Prune dead organisms and append new babies
    this.organisms = this.organisms.filter(o => !o.isDead).concat(newOffspring);

    // Prevent total extinction (keep minimum seed alive if wanted)
    if (this.organisms.length === 0) {
      this.init();
    }

    // 5. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // 6. Update Food Pulses
    for (let i = 0; i < this.food.length; i++) {
      this.food[i].pulse += 0.08;
    }

    // 7. Sync Stats
    this.stats.totalHerbivores = herbCount;
    this.stats.totalCarnivores = carnCount;
    this.stats.totalFood = this.food.length;
    this.stats.averageAge = this.organisms.length > 0 ? Math.round(totalAge / this.organisms.length) : 0;
    this.stats.averageEnergy = this.organisms.length > 0 ? Math.round(totalEnergy / this.organisms.length) : 0;
    this.stats.peakGeneration = maxGen;
  }

  // Draw World Canvas
  draw(ctx, selectedOrganismId = null) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Ambient climate tint
    if (this.climateState === 'ice-age') {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (this.climateState === 'radiation') {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.04)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (this.climateState === 'famine') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 1. Draw Obstacles
    for (const obs of this.obstacles) {
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }

    // 2. Draw Food Pellets
    for (const f of this.food) {
      const pulseSize = f.radius + Math.sin(f.pulse) * 0.8;
      ctx.beginPath();
      ctx.arc(f.x, f.y, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 3. Draw Organisms
    for (const org of this.organisms) {
      org.draw(ctx, org.id === selectedOrganismId);
    }

    // 4. Draw Particles
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.life * 2.5), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }
}

// Export for browser
window.World = World;
