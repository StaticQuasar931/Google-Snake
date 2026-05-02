const body = document.body;
const gameWindow = document.getElementById("gameWindow");
const gameFrame = document.getElementById("gameFrame");
const frameStatus = document.getElementById("frameStatus");
const fullscreenButton = document.getElementById("fullscreenButton");
const maximizeButton = document.getElementById("maximizeButton");
const minimizeButton = document.getElementById("minimizeButton");
const reloadButton = document.getElementById("reloadButton");
const overlayMinButton = document.getElementById("overlayMinButton");
const overlayGrowButton = document.getElementById("overlayGrowButton");
const sceneClassroomButton = document.getElementById("sceneClassroomButton");
const sceneNightButton = document.getElementById("sceneNightButton");
const sceneNotesButton = document.getElementById("sceneNotesButton");

const sizeOrder = ["size-compact", "size-normal", "size-large"];
let currentSizeIndex = 1;

function applySize() {
  gameWindow.classList.remove(...sizeOrder);
  gameWindow.classList.add(sizeOrder[currentSizeIndex]);
}

function growGame() {
  currentSizeIndex = Math.min(sizeOrder.length - 1, currentSizeIndex + 1);
  applySize();
}

function shrinkGame() {
  currentSizeIndex = Math.max(0, currentSizeIndex - 1);
  applySize();
}

function setScene(sceneName, activeButton) {
  body.dataset.scene = sceneName;
  [sceneClassroomButton, sceneNightButton, sceneNotesButton].forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
  });
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

function reloadGame() {
  frameStatus.textContent = "Reloading actual Google Snake...";
  frameStatus.classList.remove("is-hidden");
  gameFrame.src = "./live-snake.html?ts=" + Date.now();
}

gameFrame.addEventListener("load", () => {
  frameStatus.textContent = "Actual Google Snake loaded.";
  setTimeout(() => {
    frameStatus.classList.add("is-hidden");
  }, 900);
});

fullscreenButton.addEventListener("click", toggleFullscreen);
maximizeButton.addEventListener("click", growGame);
minimizeButton.addEventListener("click", shrinkGame);
overlayGrowButton.addEventListener("click", growGame);
overlayMinButton.addEventListener("click", shrinkGame);
reloadButton.addEventListener("click", reloadGame);

sceneClassroomButton.addEventListener("click", () => {
  setScene("classroom-day", sceneClassroomButton);
});

sceneNightButton.addEventListener("click", () => {
  setScene("classroom-night", sceneNightButton);
});

sceneNotesButton.addEventListener("click", () => {
  setScene("notes-desk", sceneNotesButton);
});

document.addEventListener("fullscreenchange", updateFullscreenLabel);

applySize();
updateFullscreenLabel();
