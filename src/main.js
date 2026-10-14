/* =================================================================
   EVOSIM: MAIN APPLICATION RUNTIME (src/main.js)
   Game Loop, Canvas Resizing, Mouse/Touch Handlers & God Tools
   ================================================================= */

window.addEventListener('DOMContentLoaded', () => {
  // 1. Canvases & Contexts
  const simCanvas = document.getElementById('simCanvas');
  const simCtx = simCanvas.getContext('2d');
  const brainCanvas = document.getElementById('brainCanvas');
  const chartCanvas = document.getElementById('chartCanvas');

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  // 2. Core Systems
  const world = new World(800, 600);
  const brainViz = new BrainVisualizer(brainCanvas);
  const chart = new PopulationChart(chartCanvas);
  const ui = new UIController(world, brainViz, chart);

  // Simulation State
  let isPaused = false;
  let simSpeed = 1; // 1x, 2x, 5x, 10x
  let isDrawingObstacle = false;
  let mousePos = { x: 0, y: 0 };

  // FPS calculation
  let lastTime = performance.now();
  let frameCount = 0;
  let currentFps = 60;

  // 3. Responsive Resize Handler
  function handleResize() {
    const viewport = simCanvas.parentElement;
    width = viewport.clientWidth;
    height = viewport.clientHeight;
    dpr = window.devicePixelRatio || 1;

    simCanvas.width = width * dpr;
    simCanvas.height = height * dpr;
    simCtx.scale(dpr, dpr);

    world.resize(width, height);
    brainViz.resize();
    chart.resize();
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  // 4. Mouse / Touch Interactions
  simCanvas.addEventListener('mousedown', (e) => {
    const rect = simCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.shiftKey) {
      // Shift + Click: Place obstacle
      world.spawnObstacle(x, y, 20);
      isDrawingObstacle = true;
      return;
    }

    if (e.button === 2) {
      // Right Click: Spawn Food cluster
      for (let i = 0; i < 5; i++) {
        world.spawnFood(x + (Math.random() * 24 - 12), y + (Math.random() * 24 - 12));
      }
      return;
    }

    // Left Click: Select Organism
    let clickedOrg = null;
    let minDist = 25; // Click tolerance

    for (const org of world.organisms) {
      const dist = Math.hypot(org.x - x, org.y - y);
      if (dist < org.radius + minDist) {
        minDist = dist;
        clickedOrg = org;
      }
    }

    if (clickedOrg) {
      ui.selectOrganism(clickedOrg);
    } else {
      // If clicked empty space, spawn single food pellet
      world.spawnFood(x, y);
    }
  });

  simCanvas.addEventListener('mousemove', (e) => {
    const rect = simCanvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;

    if (isDrawingObstacle && e.shiftKey) {
      // Prevent placing too dense
      const lastObs = world.obstacles[world.obstacles.length - 1];
      if (!lastObs || Math.hypot(lastObs.x - mousePos.x, lastObs.y - mousePos.y) > 28) {
        world.spawnObstacle(mousePos.x, mousePos.y, 16);
      }
    }
  });

  window.addEventListener('mouseup', () => {
    isDrawingObstacle = false;
  });

  // Prevent default context menu on canvas
  simCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // 5. Connect UI Controls
  // Play / Pause
  const btnPause = document.getElementById('btnPause');
  btnPause.addEventListener('click', () => {
    isPaused = !isPaused;
    btnPause.innerHTML = isPaused ? '<span>▶</span> Resume' : '<span>⏸</span> Pause';
    btnPause.classList.toggle('active', isPaused);
  });

  // Speed Toggle Buttons
  const speedBtns = document.querySelectorAll('.speed-btn');
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      simSpeed = parseInt(btn.dataset.speed, 10) || 1;
    });
  });

  // God Tools: Spawn Food Rain
  document.getElementById('btnRainFood').addEventListener('click', () => {
    for (let i = 0; i < 40; i++) world.spawnFood();
  });

  // God Tools: Spawn Predator
  document.getElementById('btnSpawnPredator').addEventListener('click', () => {
    const x = Math.random() * (world.width - 40) + 20;
    const y = Math.random() * (world.height - 40) + 20;
    const pred = new Organism(x, y, 'carnivore', null, 1);
    pred.energy = 140;
    world.organisms.push(pred);
    ui.selectOrganism(pred);
  });

  // God Tools: Clear Obstacles
  document.getElementById('btnClearWalls').addEventListener('click', () => {
    world.clearObstacles();
  });

  // God Tools: Reset World
  document.getElementById('btnResetWorld').addEventListener('click', () => {
    if (confirm('Reset entire ecosystem to Generation 1?')) {
      world.init();
      ui.selectOrganism(null);
    }
  });

  // Climate / Disaster Event Buttons
  const disasterBtns = document.querySelectorAll('.disaster-btn');
  disasterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const disaster = btn.dataset.disaster;
      if (world.climateState === disaster) {
        // Toggle off
        world.climateState = 'normal';
        btn.classList.remove('active');
      } else {
        disasterBtns.forEach(b => b.classList.remove('active'));
        world.climateState = disaster;
        btn.classList.add('active');
      }
    });
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      btnPause.click();
    } else if (e.key === 'f' || e.key === 'F') {
      // Spawn food at mouse
      world.spawnFood(mousePos.x, mousePos.y);
    } else if (e.key === '1') {
      document.querySelector('[data-speed="1"]').click();
    } else if (e.key === '2') {
      document.querySelector('[data-speed="2"]').click();
    } else if (e.key === '5') {
      document.querySelector('[data-speed="5"]').click();
    }
  });

  // 6. Main Simulation & Render Loop
  function loop(currentTime) {
    requestAnimationFrame(loop);

    // FPS Meter
    frameCount++;
    if (currentTime - lastTime >= 1000) {
      currentFps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
      ui.updateTopBar(currentFps);
    }

    // Step physics & neural passes
    if (!isPaused) {
      for (let s = 0; s < simSpeed; s++) {
        world.update(simSpeed);
      }
      chart.update(world);
    }

    // Render Canvas
    simCtx.clearRect(0, 0, width, height);
    world.draw(simCtx, ui.selectedOrganism ? ui.selectedOrganism.id : null);

    // Update UI Sidebars
    ui.updateInspector();
    chart.draw();
  }

  requestAnimationFrame(loop);
});
