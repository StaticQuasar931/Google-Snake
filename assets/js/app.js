const body = document.body;
const gameWindow = document.getElementById("gameWindow");
const gameFrame = document.getElementById("gameFrame");
const frameStatus = document.getElementById("frameStatus");
const fullscreenButton = document.getElementById("fullscreenButton");
const growButton = document.getElementById("growButton");
const shrinkButton = document.getElementById("shrinkButton");
const resetSizeButton = document.getElementById("resetSizeButton");
const reloadButton = document.getElementById("reloadButton");
const hideGameButton = document.getElementById("hideGameButton");
const miniButton = document.getElementById("miniButton");
const maxiButton = document.getElementById("maxiButton");
const launchNote = document.getElementById("launchNote");
const themeButtons = [...document.querySelectorAll("[data-theme-button]")];
const sizeOrder = ["size-compact", "size-normal", "size-large", "size-xl"];
const savedTheme = localStorage.getItem("google-snake-theme");
const savedSize = localStorage.getItem("google-snake-size");
const savedHidden = localStorage.getItem("google-snake-hidden");
const supportedRuntime = location.protocol.startsWith("http") && ["127.0.0.1", "localhost"].includes(location.hostname);
let sizeIndex = Math.max(0, Math.min(sizeOrder.length - 1, Number(savedSize ?? 1)));

function setStatus(message, hideAfter = true) {
  frameStatus.textContent = message;
  frameStatus.classList.remove("is-hidden");
  if (hideAfter) {
    clearTimeout(setStatus.timer);
    setStatus.timer = setTimeout(() => {
      frameStatus.classList.add("is-hidden");
    }, 900);
  }
}

function applySize() {
  gameWindow.classList.remove(...sizeOrder);
  gameWindow.classList.add(sizeOrder[sizeIndex]);
  localStorage.setItem("google-snake-size", String(sizeIndex));
}

function setTheme(theme) {
  body.dataset.theme = theme;
  localStorage.setItem("google-snake-theme", theme);
  themeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.themeButton === theme);
  });
}

function growGame() {
  sizeIndex = Math.min(sizeOrder.length - 1, sizeIndex + 1);
  applySize();
  setStatus("Game window enlarged.");
}

function shrinkGame() {
  sizeIndex = Math.max(0, sizeIndex - 1);
  applySize();
  setStatus("Game window reduced.");
}

function resetSize() {
  sizeIndex = 1;
  applySize();
  setStatus("Game window reset.");
}

function toggleHide() {
  const hidden = body.dataset.hidden === "on" ? "off" : "on";
  body.dataset.hidden = hidden;
  localStorage.setItem("google-snake-hidden", hidden);
  hideGameButton.textContent = hidden === "on" ? "Show Game" : "Hide Game";
  setStatus(hidden === "on" ? "Game hidden." : "Game visible.");
}

function reloadGame() {
  setStatus("Reloading local Google Snake...", false);
  gameFrame.src = `./google-snake-local.html?ts=${Date.now()}`;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    gameWindow.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function updateFullscreenLabel() {
  fullscreenButton.textContent = document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen";
}

function applyRuntimeMode() {
  body.dataset.runtime = supportedRuntime ? "supported" : "unsupported";

  if (supportedRuntime) {
    launchNote.innerHTML = "<strong>Running locally.</strong> This build is using the local server and local game assets only.";
    return;
  }

  gameFrame.src = "about:blank";
  hideGameButton.textContent = "Hide Game";
  body.dataset.hidden = "on";
  localStorage.setItem("google-snake-hidden", "on");
  launchNote.innerHTML = "<strong>Wrong launch method.</strong> Run <code>start-google-snake.bat</code>, then open <code>http://127.0.0.1:8787</code>. Direct file opens and GitHub Pages will break the local game scripts.";
  setStatus("Start the local server to play.", false);
}

fullscreenButton.addEventListener("click", toggleFullscreen);
growButton.addEventListener("click", growGame);
shrinkButton.addEventListener("click", shrinkGame);
resetSizeButton.addEventListener("click", resetSize);
reloadButton.addEventListener("click", reloadGame);
hideGameButton.addEventListener("click", toggleHide);
miniButton.addEventListener("click", shrinkGame);
maxiButton.addEventListener("click", growGame);
document.addEventListener("fullscreenchange", updateFullscreenLabel);
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "h" && !event.repeat) {
    toggleHide();
  }
});
themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.themeButton));
});
gameFrame.addEventListener("load", () => {
  if (supportedRuntime) {
    setStatus("Local Google Snake loaded.");
  }
});

applySize();
setTheme(savedTheme || "light");
body.dataset.hidden = savedHidden === "on" ? "on" : "off";
hideGameButton.textContent = body.dataset.hidden === "on" ? "Show Game" : "Hide Game";
applyRuntimeMode();
updateFullscreenLabel();
