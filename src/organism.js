/* =================================================================
   EVOSIM: ORGANISM ENGINE (src/organism.js)
   Physics, Raycasting Sensors, Biology, Metabolism & Tail Animation
   ================================================================= */

class Organism {
  static nextId = 1;

  constructor(x, y, species = 'herbivore', brain = null, generation = 1) {
    this.id = Organism.nextId++;
    this.x = x;
    this.y = y;
    this.species = species; // 'herbivore' | 'carnivore'
    this.generation = generation;
    this.age = 0; // In ticks
    this.offspringCount = 0;
    this.foodEaten = 0;

    // Movement & Orientation
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0;
    this.angularVelocity = 0;

    // Species Attributes
    if (this.species === 'carnivore') {
      this.radius = 8;
      this.maxSpeed = 3.2;
      this.sensorRange = 140;
      this.color = '#f43f5e'; // Crimson
      this.glowColor = 'rgba(244, 63, 94, 0.4)';
      this.energy = 110;
      this.reproduceEnergy = 175;
      this.metabolismRate = 0.055;
    } else {
      this.radius = 5.5;
      this.maxSpeed = 2.7;
      this.sensorRange = 110;
      this.color = '#10b981'; // Emerald
      this.glowColor = 'rgba(16, 185, 129, 0.4)';
      this.energy = 90;
      this.reproduceEnergy = 150;
      this.metabolismRate = 0.038;
    }

    // 5 Sensor Ray Angles (Whiskers in radians)
    this.rayAngles = [-0.8, -0.4, 0, 0.4, 0.8]; // approx -45° to +45°
    this.sensorReadings = new Float32Array(this.rayAngles.length); // Values [-1 to 1]

    // Neural Network: 7 Inputs -> 8 Hidden -> 2 Outputs
    // Inputs: [Ray0, Ray1, Ray2, Ray3, Ray4, EnergyLevel, ConstantBias 1.0]
    // Outputs: [SteerAngle (-1 to 1), ThrustSpeed (0 to 1)]
    this.brain = brain || new NeuralNetwork(7, 8, 2);

    // Swimming Tail Animation State
    this.tailWave = Math.random() * Math.PI * 2;
    this.tailSegments = [
      { x: this.x, y: this.y },
      { x: this.x, y: this.y },
      { x: this.x, y: this.y },
      { x: this.x, y: this.y }
    ];

    this.isDead = false;
  }

  // Sense the world around using 5 directional raycasts
  sense(world) {
    const cosHeading = Math.cos(this.angle);
    const sinHeading = Math.sin(this.angle);

    for (let i = 0; i < this.rayAngles.length; i++) {
      const rayAngle = this.angle + this.rayAngles[i];
      const rayCos = Math.cos(rayAngle);
      const raySin = Math.sin(rayAngle);

      let closestDist = this.sensorRange;
      let detectedSignal = 0; // 0 = empty, +1 = food/prey, -1 = danger/wall

      // 1. Raycast against World Boundaries
      const rayEndX = this.x + rayCos * this.sensorRange;
      const rayEndY = this.y + raySin * this.sensorRange;

      if (rayEndX < 0 || rayEndX > world.width || rayEndY < 0 || rayEndY > world.height) {
        // Calculate approx border hit distance
        let dBorder = this.sensorRange;
        if (rayCos < 0) dBorder = Math.min(dBorder, -this.x / rayCos);
        if (rayCos > 0) dBorder = Math.min(dBorder, (world.width - this.x) / rayCos);
        if (raySin < 0) dBorder = Math.min(dBorder, -this.y / raySin);
        if (raySin > 0) dBorder = Math.min(dBorder, (world.height - this.y) / raySin);

        if (dBorder < closestDist) {
          closestDist = dBorder;
          detectedSignal = -0.8; // Border wall is danger
        }
      }

      // 2. Raycast against Obstacles (Custom User-drawn Walls)
      for (const obs of world.obstacles) {
        const d = this.lineIntersectCircle(this.x, this.y, rayEndX, rayEndY, obs.x, obs.y, obs.radius);
        if (d !== null && d < closestDist) {
          closestDist = d;
          detectedSignal = -1.0;
        }
      }

      // 3. Raycast against Targets (Food or other Organisms)
      if (this.species === 'herbivore') {
        // Herbivore senses Plant Food (positive) and Carnivores (negative/danger)
        const nearbyFood = world.getNearbyFood(this.x, this.y, this.sensorRange);
        for (const food of nearbyFood) {
          const d = this.pointToRayDist(this.x, this.y, rayCos, raySin, food.x, food.y, this.sensorRange);
          if (d !== null && d < closestDist) {
            closestDist = d;
            detectedSignal = 1.0 - (d / this.sensorRange); // Closer food = stronger positive signal
          }
        }

        // Herbivore checks for nearby Carnivores
        const nearbyPredators = world.getNearbyCarnivores(this.x, this.y, this.sensorRange);
        for (const pred of nearbyPredators) {
          const d = this.pointToRayDist(this.x, this.y, rayCos, raySin, pred.x, pred.y, this.sensorRange);
          if (d !== null && d < closestDist) {
            closestDist = d;
            detectedSignal = -(1.0 - (d / this.sensorRange)); // Danger!
          }
        }
      } else {
        // Carnivore senses Herbivores (prey = positive)
        const nearbyPrey = world.getNearbyHerbivores(this.x, this.y, this.sensorRange);
        for (const prey of nearbyPrey) {
          const d = this.pointToRayDist(this.x, this.y, rayCos, raySin, prey.x, prey.y, this.sensorRange);
          if (d !== null && d < closestDist) {
            closestDist = d;
            detectedSignal = 1.0 - (d / this.sensorRange); // Prey is positive
          }
        }
      }

      this.sensorReadings[i] = detectedSignal;
    }

    // Build the 7 neural inputs
    const normalizedEnergy = Math.max(0, Math.min(1, this.energy / 150));
    return [
      this.sensorReadings[0],
      this.sensorReadings[1],
      this.sensorReadings[2],
      this.sensorReadings[3],
      this.sensorReadings[4],
      normalizedEnergy,
      1.0 // Bias
    ];
  }

  // Fast point-to-ray distance projection
  pointToRayDist(px, py, rayCos, raySin, targetX, targetY, maxRange) {
    const dx = targetX - px;
    const dy = targetY - py;
    const projection = dx * rayCos + dy * raySin;
    if (projection <= 0 || projection > maxRange) return null;

    // Perpendicular distance
    const perpSq = (dx * dx + dy * dy) - (projection * projection);
    if (perpSq < 144) { // Hit radius tolerance ~12px
      return projection;
    }
    return null;
  }

  // Fast circle ray intersection
  lineIntersectCircle(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = (fx * fx + fy * fy) - r * r;
    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
      const t = (-b - Math.sqrt(discriminant)) / (2 * a);
      if (t >= 0 && t <= 1) return t * Math.hypot(dx, dy);
    }
    return null;
  }

  // Core Simulation Step
  update(world, speedMultiplier = 1, climateState = 'normal') {
    this.age++;

    // 1. Neural decision pass
    const inputs = this.sense(world);
    const outputs = this.brain.predict(inputs);

    // Output 0: Steering (-1 left to +1 right)
    const steer = outputs[0] * 0.12;
    this.angle += steer;

    // Output 1: Forward Thrust (map [-1, 1] to [0.1, 1.0])
    const thrust = (outputs[1] + 1) * 0.5;
    const targetSpeed = thrust * this.maxSpeed;
    this.speed += (targetSpeed - this.speed) * 0.15; // Smooth acceleration

    // 2. Physical motion update
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Boundary wrapping or bouncing
    if (this.x < this.radius) { this.x = this.radius; this.angle = Math.PI - this.angle; }
    if (this.x > world.width - this.radius) { this.x = world.width - this.radius; this.angle = Math.PI - this.angle; }
    if (this.y < this.radius) { this.y = this.radius; this.angle = -this.angle; }
    if (this.y > world.height - this.radius) { this.y = world.height - this.radius; this.angle = -this.angle; }

    // 3. Biological Metabolism
    let baseBurn = this.metabolismRate;
    let speedBurn = (this.speed / this.maxSpeed) * 0.05;

    // Environmental climate adjustments
    if (climateState === 'ice-age') {
      speedBurn *= 2.0; // Freezing cold doubles kinetic energy cost
    }

    this.energy -= (baseBurn + speedBurn);
    if (this.energy <= 0) {
      this.isDead = true;
      return null;
    }

    // 4. Inverse Kinematics Swimming Tail
    this.tailWave += 0.2 + this.speed * 0.2;
    let leadX = this.x;
    let leadY = this.y;
    const segmentLength = this.radius * 0.85;

    for (let i = 0; i < this.tailSegments.length; i++) {
      const seg = this.tailSegments[i];
      const dx = seg.x - leadX;
      const dy = seg.y - leadY;
      const angle = Math.atan2(dy, dx);
      // Add slight harmonic wiggle
      const waveOffset = Math.sin(this.tailWave - i * 0.8) * (0.8 + this.speed * 0.6);
      seg.x = leadX + Math.cos(angle + waveOffset * 0.15) * segmentLength;
      seg.y = leadY + Math.sin(angle + waveOffset * 0.15) * segmentLength;
      leadX = seg.x;
      leadY = seg.y;
    }

    // 5. Check for Reproduction
    if (this.energy >= this.reproduceEnergy) {
      return this.reproduce(climateState === 'radiation' ? 0.35 : 0.08);
    }

    return null;
  }

  // Reproduce with genetic variation
  reproduce(mutationRate = 0.08) {
    this.offspringCount++;
    this.energy *= 0.5; // Parent shares half energy with baby

    const childBrain = this.brain.mutate(mutationRate, 0.4);
    // Spawn nearby
    const spawnX = this.x + (Math.random() * 20 - 10);
    const spawnY = this.y + (Math.random() * 20 - 10);
    const child = new Organism(spawnX, spawnY, this.species, childBrain, this.generation + 1);
    child.energy = this.energy;
    return child;
  }

  // Render on Canvas
  draw(ctx, isSelected = false) {
    ctx.save();

    // 1. Draw Sensory Whiskers (if selected or faint ambient)
    if (isSelected) {
      ctx.lineWidth = 1;
      for (let i = 0; i < this.rayAngles.length; i++) {
        const rayAngle = this.angle + this.rayAngles[i];
        const signal = this.sensorReadings[i];
        const rayLen = this.sensorRange;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(rayAngle) * rayLen, this.y + Math.sin(rayAngle) * rayLen);

        if (signal > 0.05) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + signal * 0.6})`; // Green detection
        } else if (signal < -0.05) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.4 + Math.abs(signal) * 0.6})`; // Danger detection
        } else {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        }
        ctx.stroke();
      }

      // Selection Halo
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Draw Tail Segments
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    for (let i = 0; i < this.tailSegments.length; i++) {
      ctx.lineTo(this.tailSegments[i].x, this.tailSegments[i].y);
    }
    ctx.strokeStyle = this.species === 'carnivore' ? 'rgba(244, 63, 94, 0.5)' : 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = Math.max(1.5, this.radius * 0.6);
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3. Draw Body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Directional Eye Indicator
    const eyeX = this.x + Math.cos(this.angle) * (this.radius * 0.6);
    const eyeY = this.y + Math.sin(this.angle) * (this.radius * 0.6);
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, Math.max(1.2, this.radius * 0.28), 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }
}

// Export for browser
window.Organism = Organism;
