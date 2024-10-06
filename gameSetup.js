// gameSetup.js
// Contains game setup and initialization code

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Responsive canvas dimensions
let gridWidth;
let gridHeight;
let blockSize; // This will be adjusted based on screen size and orientation

// Game variables
let grid;
let tetrominoPlayer;
let tetrominoBag = [];
let nextTetromino = null;
let nextTetrominoColor = '#FFFFFF';
let tetrominoes = [];
const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF'];

let mousePosition = { x: 0, y: 0 };
let snake = [];
let snakeDirection = { x: 0, y: -1 };
let snakeNewDirection = { x: 0, y: -1 };
let snakeScore = 0;
let snakeLength = 5;
let powerUps = [];
let sideWarpEndTime = 0;
let verticalWarpEndTime = 0;
let fullWarpEndTime = 0;
let lastWarpPowerUpEndTime = 0;
let lastExtraLifePowerUpTime = 0;
let powerUpDuration = 30000; // 30 seconds
let powerUpActive = false;
let powerUpCountdownStartTime = 0;
let doublePointsEndTime = 0;
let triplePointsEndTime = 0;
let halfPointsEndTime = 0;
let pointsPowerUpDuration = 45000; // 45 seconds
let lives = 3;
let maxLives = 6;
let gameOver = false;
let lastTime = 0;
let dropCounter = 0;
let snakeMoveCounter = 0;
let snakeMoveInterval = 200 / 0.8; // milliseconds
let achievements = {};
let achievementsUnlocked = [];
let linesClearedTotal = 0;
let powerUpsCollected = 0;
let powerUpsCollectedTypes = [];
let gameStartTime = Date.now();
let paused = false;
let livesLostDuringThisMove = false;
let snakeColor = '#FFD700'; // Gold when no power-up is active
let mouseInCanvas = true;
let nextSpeedIncreaseTime = Date.now() + 60000; // Next speed increase in 1 minute
let speedIncreaseInterval = 60000; // Speed increases every 1 minute

// Orientation variable
let currentOrientation = 'landscape'; // Default to landscape

// Function to adjust canvas size
function adjustCanvasSize(orientation = 'landscape') {
  currentOrientation = orientation;
  if (orientation === 'landscape') {
    gridWidth = 30;
    gridHeight = 20;
  } else {
    gridWidth = 20;
    gridHeight = 30;
  }

  // Calculate blockSize based on available screen size
  const maxWidth = window.innerWidth * 0.8;
  const maxHeight = window.innerHeight * 0.8;
  blockSize = Math.min(
    Math.floor(maxWidth / gridWidth),
    Math.floor(maxHeight / gridHeight)
  );

  canvas.width = gridWidth * blockSize;
  canvas.height = gridHeight * blockSize;

  // Recreate grid with new dimensions
  grid = createMatrix(gridWidth, gridHeight);

  // Adjust snake position
  snake = [{ x: Math.floor(gridWidth / 2), y: gridHeight - 1 }];
}

// Initial canvas adjustment
adjustCanvasSize('landscape'); // Default to landscape mode

// Create the grid
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// Initialize tetromino player
tetrominoPlayer = {
  pos: { x: 0, y: 0 },
  matrix: null,
  next: null,
  score: 0,
  speed: 1000, // Initial speed
  color: '#FFFFFF'
};

// Define tetromino shapes (including new shapes up to 6 blocks)
// Define tetromino shapes (including new shapes up to 6 blocks)
tetrominoes = [
  // Long-block
  [
    [1, 1, 1, 1]
  ],
  // J-block
  [
    [0, 1],
    [0, 1],
    [1, 1]
  ],
  // Small L-block
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  // O-block
  [
    [1, 1],
    [1, 1]
  ],
  // S-block
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  // T-block
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  // Z-block
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  // U-block (new)
  [
    [1, 0, 1],
    [1, 1, 1]
  ],
  // Plus-block (new)
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  // Large L-block (new)
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1]
  ],
  // X-block (new)
  [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1]
  ],
  // V-block (new)
  [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0]
  ]
];

// Function to shuffle the tetromino bag
function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle
  while (currentIndex !== 0) {
    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap it with the current element
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}

// Initialize tetromino bag
tetrominoBag = tetrominoes.slice();
shuffle(tetrominoBag);

// Initialize achievements
achievements = {
  // Achievement definitions...
  // (Same as before)
};

// Function to reset the tetromino player
function tetrominoReset() {
  if (tetrominoPlayer.matrix === null) {
    // Initialize both current and next tetromino
    if (tetrominoBag.length === 0) {
      tetrominoBag = tetrominoes.slice();
      shuffle(tetrominoBag);
    }
    tetrominoPlayer.matrix = tetrominoBag.pop();
    tetrominoPlayer.color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];

    if (tetrominoBag.length === 0) {
      tetrominoBag = tetrominoes.slice();
      shuffle(tetrominoBag);
    }
    nextTetromino = tetrominoBag.pop();
    nextTetrominoColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
  } else {
    tetrominoPlayer.matrix = nextTetromino;
    tetrominoPlayer.color = nextTetrominoColor;

    if (tetrominoBag.length === 0) {
      tetrominoBag = tetrominoes.slice();
      shuffle(tetrominoBag);
    }
    nextTetromino = tetrominoBag.pop();
    nextTetrominoColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
  }

  tetrominoPlayer.pos.y = 0;
  tetrominoPlayer.pos.x = (gridWidth / 2 | 0) - (tetrominoPlayer.matrix[0].length / 2 | 0);
  drawNextTetromino();

  if (collide(grid, tetrominoPlayer)) {
    handleLifeLoss('Tetris block cannot be placed.');
  }
}

// Initialize the game
function initGame() {
  tetrominoPlayer.matrix = null;
  tetrominoReset();
  generatePowerUps();
}

// Call the initGame function
initGame();

// Event listener for orientation switch
document.getElementById('orientationSwitch').addEventListener('click', () => {
  const newOrientation = currentOrientation === 'landscape' ? 'portrait' : 'landscape';
  adjustCanvasSize(newOrientation);
  tetrominoReset();
  draw();
});

// Logging game setup
console.log('Game setup completed.');
