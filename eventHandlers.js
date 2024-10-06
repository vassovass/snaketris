// eventHandlers.js
// Contains event listeners and user input handling

// Default Key Bindings
let leftKey = 'a';
let rightKey = 'd';
let rotateCWKey = 'w';
let rotateCCWKey = 'q';
let dropKey = 's';

// Event listener for keyboard inputs
document.addEventListener('keydown', event => {
  if (gameOver || paused) return;

  const key = event.key.toLowerCase();

  // Tetris Controls
  if (key === leftKey) {
    tetrominoMove(-1);
  } else if (key === rightKey) {
    tetrominoMove(1);
  } else if (key === rotateCWKey) {
    rotate(tetrominoPlayer.matrix, 1);
  } else if (key === rotateCCWKey) {
    rotate(tetrominoPlayer.matrix, -1);
  } else if (key === dropKey) {
    // Soft drop by 5 rows
    for (let i = 0; i < 5; i++) {
      tetrominoPlayer.pos.y++;
      if (collide(grid, tetrominoPlayer)) {
        tetrominoPlayer.pos.y--;
        merge(grid, tetrominoPlayer);
        tetrominoReset();
        let linesCleared = sweep();
        let pointsMultiplier = getPointsMultiplier();
        tetrominoPlayer.score += linesCleared * 50 * pointsMultiplier;
        updateScoreDisplays();
        linesClearedTotal += linesCleared;

        checkAchievements();

        break;
      }
    }
    dropCounter = 0;
  }
});

// Mouse Control for Snake
// mousePosition is declared in gameSetup.js
canvas.addEventListener('mousemove', event => {
  const rect = canvas.getBoundingClientRect();
  mousePosition = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
});

canvas.addEventListener('mouseleave', () => {
  mouseInCanvas = false;
  paused = true;
  showAlert('Game Paused: Mouse pointer left the game area!');
});

canvas.addEventListener('mouseenter', () => {
  mouseInCanvas = true;
  paused = false;
  hideAlert();
});

// Event listeners for UI buttons
const restartButton = document.getElementById('restartButton');
const playerNameInput = document.getElementById('playerNameInput');
let playerName = '';

restartButton.addEventListener('click', () => {
  playerName = playerNameInput.value.trim() || 'Player';
  resetGame();
});

// Instructions Modal Event Listeners
const instructionsButton = document.getElementById('instructionsButton');
const instructionsModal = document.getElementById('instructionsModal');

instructionsButton.addEventListener('click', () => {
  updateInstructionsContent();
  instructionsModal.style.display = 'flex';
});

// Close Instructions Modal
document.getElementById('closeInstructions').addEventListener('click', () => {
  instructionsModal.style.display = 'none';
});

// Power-Ups Modal Event Listeners
const powerUpsButton = document.getElementById('powerUpsButton');
const powerUpsModal = document.getElementById('powerUpsModal');
const closePowerUps = document.getElementById('closePowerUps');

powerUpsButton.addEventListener('click', () => {
  powerUpsModal.style.display = 'flex';
});

closePowerUps.addEventListener('click', () => {
  powerUpsModal.style.display = 'none';
});

// Score Board Modal Event Listeners
const scoreBoardButton = document.getElementById('scoreBoardButton');
const scoreBoardModal = document.getElementById('scoreBoardModal');
const closeScoreBoard = document.getElementById('closeScoreBoard');

scoreBoardButton.addEventListener('click', () => {
  loadScoreBoard();
  scoreBoardModal.style.display = 'flex';
});

closeScoreBoard.addEventListener('click', () => {
  scoreBoardModal.style.display = 'none';
});

// Key Bindings Modal Event Listeners
const keyBindingsButton = document.getElementById('keyBindingsButton');
const keyBindingsModal = document.getElementById('keyBindingsModal');
const closeKeyBindings = document.getElementById('closeKeyBindings');
const saveKeyBindings = document.getElementById('saveKeyBindings');

keyBindingsButton.addEventListener('click', () => {
  keyBindingsModal.style.display = 'flex';
});

closeKeyBindings.addEventListener('click', () => {
  keyBindingsModal.style.display = 'none';
});

saveKeyBindings.addEventListener('click', () => {
  leftKey = document.getElementById('leftKey').value.toLowerCase();
  rightKey = document.getElementById('rightKey').value.toLowerCase();
  rotateCWKey = document.getElementById('rotateCWKey').value.toLowerCase();
  rotateCCWKey = document.getElementById('rotateCCWKey').value.toLowerCase();
  dropKey = document.getElementById('dropKey').value.toLowerCase();
  updateKeyDisplay();
  keyBindingsModal.style.display = 'none';
});

// Achievements Modal Event Listeners
const achievementsButton = document.getElementById('achievementsButton');
const achievementsModal = document.getElementById('achievementsModal');
const closeAchievements = document.getElementById('closeAchievements');

achievementsButton.addEventListener('click', () => {
  loadAchievements();
  achievementsModal.style.display = 'flex';
});

closeAchievements.addEventListener('click', () => {
  achievementsModal.style.display = 'none';
});

// Speed slider for snake
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

speedSlider.addEventListener('input', () => {
  const speed = parseFloat(speedSlider.value);
  speedValue.textContent = `${speed.toFixed(1)} blocks/sec`;
  snakeMoveInterval = 1000 / speed;
});

// Orientation Switch Button
document.getElementById('orientationSwitch').addEventListener('click', () => {
  const newOrientation = currentOrientation === 'landscape' ? 'portrait' : 'landscape';
  adjustCanvasSize(newOrientation);
  tetrominoReset();
  draw();
});

// Prevent default scrolling on arrow keys
window.addEventListener('keydown', function (e) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) > -1) {
    e.preventDefault();
  }
}, false);

// Logging event handlers setup
console.log('Event handlers initialized.');
