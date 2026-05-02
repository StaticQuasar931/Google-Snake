const STORAGE_KEY = "google-snake-local-settings";
const GRID_SIZE = 18;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlayMessage = document.getElementById("overlayMessage");
const scoreValue = document.getElementById("scoreValue");
const bestValue = document.getElementById("bestValue");
const topBestValue = document.getElementById("topBestValue");
const statusValue = document.getElementById("statusValue");
const topSpeedValue = document.getElementById("topSpeedValue");
const topThemeValue = document.getElementById("topThemeValue");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const restartButton = document.getElementById("restartButton");
const shuffleButton = document.getElementById("shuffleButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const speedSelect = document.getElementById("speedSelect");
const wallsToggle = document.getElementById("wallsToggle");
const gridToggle = document.getElementById("gridToggle");
const themeButtons = Array.from(document.querySelectorAll(".theme-button"));
const backgroundButtons = Array.from(document.querySelectorAll(".background-button"));
const touchButtons = Array.from(document.querySelectorAll(".touch-button[data-direction]"));
const canvasShell = document.getElementById("canvasShell");

const speedLabels = {
  "160": "Chill",
  "120": "Normal",
  "90": "Fast",
  "65": "Wild"
};

const themeLabels = {
  classic: "Classic",
  dark: "Black",
  light: "White",
  neon: "Neon"
};

const state = {
  snake: [],
  direction: "right",
  queuedDirection: "right",
  apple: { x: 0, y: 0 },
  running: false,
  paused: false,
  timerId: null,
  score: 0,
  best: 0,
  speed: "120",
  walls: true,
  showGrid: true,
  theme: "classic",
  background: "arcade"
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.best) state.best = saved.best;
    if (saved.speed && speedLabels[saved.speed]) state.speed = saved.speed;
    if (typeof saved.walls === "boolean") state.walls = saved.walls;
    if (typeof saved.showGrid === "boolean") state.showGrid = saved.showGrid;
    if (saved.theme && themeLabels[saved.theme]) state.theme = saved.theme;
    if (saved.background) state.background = saved.background;
  } catch (error) {
    console.warn("Could not load saved settings.", error);
  }
}

function saveSettings() {
  const payload = {
    best: state.best,
    speed: state.speed,
    walls: state.walls,
    showGrid: state.showGrid,
    theme: state.theme,
    background: state.background
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function setOverlay(title, copy, hide = false) {
  if (hide) {
    overlayMessage.classList.add("hidden");
    return;
  }

  overlayMessage.classList.remove("hidden");
  overlayMessage.innerHTML = `<h2>${title}</h2><p>${copy}</p>`;
}

function updateHud() {
  scoreValue.textContent = String(state.score);
  bestValue.textContent = String(state.best);
  topBestValue.textContent = String(state.best);
  statusValue.textContent = state.paused ? "Paused" : state.running ? "Playing" : "Ready";
  topSpeedValue.textContent = speedLabels[state.speed];
  topThemeValue.textContent = themeLabels[state.theme];
  pauseButton.textContent = state.paused ? "Resume" : "Pause";
}

function applySelections() {
  document.body.dataset.theme = state.theme;
  document.body.dataset.background = state.background;
  speedSelect.value = state.speed;
  wallsToggle.checked = state.walls;
  gridToggle.checked = state.showGrid;

  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.themeOption === state.theme);
  });

  backgroundButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.backgroundOption === state.background);
  });

  updateHud();
}

function randomCell() {
  return Math.floor(Math.random() * GRID_SIZE);
}

function spawnApple() {
  let applePosition = { x: randomCell(), y: randomCell() };

  while (state.snake.some((segment) => segment.x === applePosition.x && segment.y === applePosition.y)) {
    applePosition = { x: randomCell(), y: randomCell() };
  }

  state.apple = applePosition;
}

function resetSnake() {
  state.snake = [
    { x: 5, y: 9 },
    { x: 4, y: 9 },
    { x: 3, y: 9 }
  ];
  state.direction = "right";
  state.queuedDirection = "right";
  state.score = 0;
  spawnApple();
}

function startLoop() {
  clearInterval(state.timerId);
  state.timerId = setInterval(stepGame, Number(state.speed));
}

function startGame() {
  resetSnake();
  state.running = true;
  state.paused = false;
  startLoop();
  setOverlay("", "", true);
  updateHud();
  draw();
}

function stopGame(messageTitle, messageCopy) {
  state.running = false;
  state.paused = false;
  clearInterval(state.timerId);
  setOverlay(messageTitle, messageCopy);
  updateHud();
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  if (state.paused) {
    clearInterval(state.timerId);
    setOverlay("Paused", "Press Pause again or hit Start to jump back in.");
  } else {
    setOverlay("", "", true);
    startLoop();
  }
  updateHud();
}

function getColor(variableName) {
  return getComputedStyle(document.body).getPropertyValue(variableName).trim();
}

function drawGrid(tileSize) {
  if (!state.showGrid) return;

  ctx.strokeStyle = getColor("--board-grid");
  ctx.lineWidth = 1;

  for (let i = 1; i < GRID_SIZE; i += 1) {
    const point = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(point, 0);
    ctx.lineTo(point, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, point);
    ctx.lineTo(canvas.width, point);
    ctx.stroke();
  }
}

function drawRoundedCell(x, y, size, fill, radiusScale = 0.22) {
  const radius = Math.max(4, size * radiusScale);
  const px = x + 2;
  const py = y + 2;
  const box = size - 4;

  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(px + radius, py);
  ctx.arcTo(px + box, py, px + box, py + box, radius);
  ctx.arcTo(px + box, py + box, px, py + box, radius);
  ctx.arcTo(px, py + box, px, py, radius);
  ctx.arcTo(px, py, px + box, py, radius);
  ctx.closePath();
  ctx.fill();
}

function drawApple(tileSize) {
  const x = state.apple.x * tileSize;
  const y = state.apple.y * tileSize;
  const centerX = x + tileSize / 2;
  const centerY = y + tileSize / 2 + 2;
  const appleColor = getColor("--apple");

  ctx.fillStyle = appleColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, tileSize * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.arc(centerX - 6, centerY - 5, tileSize * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = state.theme === "light" ? "#101214" : "#5d3c18";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - tileSize * 0.25);
  ctx.quadraticCurveTo(centerX + 1, centerY - tileSize * 0.4, centerX + 6, centerY - tileSize * 0.46);
  ctx.stroke();

  ctx.fillStyle = "#4bc46d";
  ctx.beginPath();
  ctx.ellipse(centerX + 8, centerY - tileSize * 0.35, tileSize * 0.1, tileSize * 0.06, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake(tileSize) {
  const headColor = getColor("--snake-head");
  const bodyColor = getColor("--snake-body");

  state.snake.forEach((segment, index) => {
    const x = segment.x * tileSize;
    const y = segment.y * tileSize;
    drawRoundedCell(x, y, tileSize, index === 0 ? headColor : bodyColor, index === 0 ? 0.28 : 0.22);
  });

  const head = state.snake[0];
  const headX = head.x * tileSize;
  const headY = head.y * tileSize;
  const eyeColor = state.theme === "light" ? "#ffffff" : "#08110c";
  const leftEyeX = headX + tileSize * 0.34;
  const rightEyeX = headX + tileSize * 0.62;
  const eyeY = headY + tileSize * 0.34;

  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY, tileSize * 0.06, 0, Math.PI * 2);
  ctx.arc(rightEyeX, eyeY, tileSize * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  const tileSize = canvas.width / GRID_SIZE;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = getColor("--board-bg");
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid(tileSize);
  drawApple(tileSize);
  drawSnake(tileSize);
}

function getNextHead() {
  const head = { ...state.snake[0] };

  if (state.queuedDirection === "up") head.y -= 1;
  if (state.queuedDirection === "down") head.y += 1;
  if (state.queuedDirection === "left") head.x -= 1;
  if (state.queuedDirection === "right") head.x += 1;

  if (!state.walls) {
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;
  }

  return head;
}

function hitWall(head) {
  return head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
}

function hitSelf(head) {
  return state.snake.some((segment) => segment.x === head.x && segment.y === head.y);
}

function stepGame() {
  if (!state.running || state.paused) return;

  state.direction = state.queuedDirection;
  const nextHead = getNextHead();

  if (state.walls && hitWall(nextHead)) {
    stopGame("Game Over", `You hit the wall. Final score: ${state.score}.`);
    return;
  }

  if (hitSelf(nextHead)) {
    stopGame("Game Over", `You ran into yourself. Final score: ${state.score}.`);
    return;
  }

  state.snake.unshift(nextHead);

  if (nextHead.x === state.apple.x && nextHead.y === state.apple.y) {
    state.score += 1;
    state.best = Math.max(state.best, state.score);
    spawnApple();
    saveSettings();
  } else {
    state.snake.pop();
  }

  updateHud();
  draw();
}

function canTurn(nextDirection) {
  const opposites = {
    up: "down",
    down: "up",
    left: "right",
    right: "left"
  };
  return opposites[state.direction] !== nextDirection;
}

function setDirection(nextDirection) {
  if (!canTurn(nextDirection)) return;
  state.queuedDirection = nextDirection;
}

function restartGame() {
  startGame();
}

function shuffleApple() {
  spawnApple();
  draw();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function syncFullscreenLabel() {
  fullscreenButton.textContent = document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen";
}

function handleKeydown(event) {
  const keyMap = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right"
  };

  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  const nextDirection = keyMap[event.key];
  if (!nextDirection) return;
  event.preventDefault();
  setDirection(nextDirection);
}

function attachEvents() {
  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", togglePause);
  restartButton.addEventListener("click", restartGame);
  shuffleButton.addEventListener("click", shuffleApple);
  fullscreenButton.addEventListener("click", toggleFullscreen);

  speedSelect.addEventListener("change", () => {
    state.speed = speedSelect.value;
    saveSettings();
    updateHud();
    if (state.running && !state.paused) startLoop();
  });

  wallsToggle.addEventListener("change", () => {
    state.walls = wallsToggle.checked;
    saveSettings();
  });

  gridToggle.addEventListener("change", () => {
    state.showGrid = gridToggle.checked;
    saveSettings();
    draw();
  });

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.theme = button.dataset.themeOption;
      applySelections();
      saveSettings();
      draw();
    });
  });

  backgroundButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.background = button.dataset.backgroundOption;
      applySelections();
      saveSettings();
    });
  });

  touchButtons.forEach((button) => {
    const handler = (event) => {
      event.preventDefault();
      setDirection(button.dataset.direction);
    };
    button.addEventListener("click", handler);
    button.addEventListener("touchstart", handler, { passive: false });
  });

  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("fullscreenchange", syncFullscreenLabel);
  window.addEventListener("resize", draw);

  canvasShell.addEventListener("click", () => {
    if (!state.running) startGame();
  });
}

function init() {
  loadSettings();
  applySelections();
  resetSnake();
  attachEvents();
  updateHud();
  syncFullscreenLabel();
  setOverlay("Press Start", "Pick a theme, go fullscreen if you want, and play.");
  draw();
}

init();
