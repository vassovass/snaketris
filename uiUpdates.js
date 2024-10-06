// uiUpdates.js
// Contains code for updating UI elements and modals

// Function to update the instructions content
function updateInstructionsContent() {
  document.getElementById('instructionsContent').innerHTML = `
    <h2>Instructions</h2>
    <p>
      Welcome to SnakeTris! This game combines the classic games of Snake and Tetris into one exciting challenge.
    </p>
    <h3>Objective:</h3>
    <p>
      Survive as long as possible by controlling both the falling Tetris blocks and the Snake simultaneously.
      Clear lines by filling rows with blocks and collect power-ups to enhance your snake.
    </p>
    <h3>Tetris Rules:</h3>
    <p>
      Use the keyboard controls to move and rotate the falling Tetris blocks. Fill rows with blocks to clear lines.
      You need at least 12 consecutive blocks in a row to clear a line. The more lines you clear, the higher your score.
      The Tetris blocks speed up every minute, increasing the challenge.
    </p>
    <h3>Snake Rules:</h3>
    <p>
      Control the snake using your mouse. The snake will follow your mouse pointer within the game area.
      Avoid colliding with the walls, your own body, settled Tetris blocks, and falling Tetris blocks.
      Collect power-ups to gain advantages, but be careful—some power-ups can have negative effects.
    </p>
    <h3>Lives:</h3>
    <p>
      You start with 3 lives out of a maximum of 6. Losing a life occurs when the snake collides with obstacles.
      Extra life power-ups can increase your lives up to the maximum.
    </p>
    <h3>Power-Ups:</h3>
    <p>
      Various power-ups appear on the screen. Collect them to gain different effects.
      Some power-ups have a time-limited effect, during which the snake changes color.
      In the last 10 seconds, the snake alternates colors every second as a countdown.
    </p>
    <h3>Scoring:</h3>
    <ul>
      <li>Clearing a line in Tetris: 50 points per line, affected by point multipliers.</li>
      <li>Collecting a positive power-up: Varies (e.g., +10 points).</li>
      <li>Collecting a negative power-up: May deduct points.</li>
      <li>Snake grows longer: Earn points as the snake grows.</li>
    </ul>
    <h3>Controls:</h3>
    <ul>
      <li>Move Left: <span id="leftKeyDisplay">${leftKey.toUpperCase()}</span></li>
      <li>Move Right: <span id="rightKeyDisplay">${rightKey.toUpperCase()}</span></li>
      <li>Rotate Clockwise: <span id="rotateCWKeyDisplay">${rotateCWKey.toUpperCase()}</span></li>
      <li>Rotate Counter-Clockwise: <span id="rotateCCWKeyDisplay">${rotateCCWKey.toUpperCase()}</span></li>
      <li>Soft Drop: <span id="dropKeyDisplay">${dropKey.toUpperCase()}</span></li>
    </ul>
  `;
}

// Function to load achievements into the modal
function loadAchievements() {
  const achievementsList = document.getElementById('achievementsList');
  achievementsList.innerHTML = ''; // Clear existing content

  // Define achievements categories
  const achievementsCategories = {
    'Easy': [
      'First Line Clear',
      'Score 100 Points',
      'Collect 5 Power-Ups',
      'Clear 3 Lines',
      'Collect 10 Power-Ups',
      'Clear 5 Lines',
      'Reach Snake Length of 20',
      'Survive 2 Minutes'
    ],
    'Hard': [
      'Survive 10 Minutes',
      'Collect 20 Power-Ups',
      'Clear 10 Lines',
      'Score 500 Points',
      'Snake Length 50',
      'Collect All Power-Up Types',
      'Achieve 5x Multiplier',
      'Complete 5 Achievements'
    ],
    'Almost Impossible': [
      'Survive 30 Minutes',
      'Collect 50 Power-Ups',
      'Clear 20 Lines',
      'Score 2000 Points',
      'Snake Length 100',
      'No Lives Lost',
      'Collect 100 Power-Ups',
      'Complete All Achievements'
    ]
  };

  for (let category in achievementsCategories) {
    const categoryHeader = document.createElement('h3');
    categoryHeader.textContent = category;
    achievementsList.appendChild(categoryHeader);

    const categoryList = document.createElement('ul');

    achievementsCategories[category].forEach(achievementName => {
      const listItem = document.createElement('li');
      const unlocked = achievements[achievementName] || false;
      listItem.textContent = `${achievementName}: ${unlocked ? 'Unlocked' : 'Locked'}`;
      categoryList.appendChild(listItem);
    });

    achievementsList.appendChild(categoryList);
  }
}

// Function to update key bindings display
function updateKeyDisplay() {
  document.getElementById('leftKeyDisplay').textContent = leftKey.toUpperCase();
  document.getElementById('rightKeyDisplay').textContent = rightKey.toUpperCase();
  document.getElementById('rotateCWKeyDisplay').textContent = rotateCWKey.toUpperCase();
  document.getElementById('rotateCCWKeyDisplay').textContent = rotateCCWKey.toUpperCase();
  document.getElementById('dropKeyDisplay').textContent = dropKey.toUpperCase();
}

// Function to update the next achievement display
function updateNextRewardDisplay() {
  const nextRewardDiv = document.getElementById('nextReward');
  const pendingAchievements = Object.keys(achievements).filter(a => !achievements[a]);
  nextRewardDiv.textContent = pendingAchievements.length > 0 ? `Next Achievement: ${pendingAchievements[0]}` : 'All Achievements Unlocked!';
}

// Function to update score displays
function updateScoreDisplays() {
  document.getElementById('tetrisScore').textContent = `Tetris Score: ${tetrominoPlayer.score}`;
  document.getElementById('snakeScore').textContent = `Snake Score: ${snakeScore}`;
}

// Function to update lives display
function updateLivesDisplay() {
  document.getElementById('livesDisplay').textContent = `Lives: ${lives}/${maxLives}`;
}

// Function to draw Next Tetromino
const nextBlockCanvas = document.getElementById('nextBlockCanvas');
const nextBlockContext = nextBlockCanvas.getContext('2d');

function drawNextTetromino() {
  nextBlockCanvas.width = 100;
  nextBlockCanvas.height = 100;
  nextBlockContext.fillStyle = '#000';
  nextBlockContext.fillRect(0, 0, nextBlockCanvas.width, nextBlockCanvas.height);

  if (nextTetromino) {
    const scale = 20;
    const offset = {
      x: (nextBlockCanvas.width / 2) - (nextTetromino[0].length * scale) / 2,
      y: (nextBlockCanvas.height / 2) - (nextTetromino.length * scale) / 2
    };
    nextTetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          nextBlockContext.fillStyle = nextTetrominoColor;
          nextBlockContext.fillRect(
            offset.x + x * scale,
            offset.y + y * scale,
            scale,
            scale
          );
        }
      });
    });
  }
}

// Function to show alert messages
const alertBox = document.getElementById('alertBox');
let alertTimeout;

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.style.display = 'block';
  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    alertBox.style.display = 'none';
  }, 3000);
}

function hideAlert() {
  alertBox.style.display = 'none';
}

// Function to check achievements
function checkAchievements() {
  // Easy Achievements
  if (linesClearedTotal >= 1 && !achievements['First Line Clear']) {
    achievements['First Line Clear'] = true;
    showAlert('Achievement Unlocked: First Line Clear!');
    updateNextRewardDisplay();
  }
  if (tetrominoPlayer.score >= 100 && !achievements['Score 100 Points']) {
    achievements['Score 100 Points'] = true;
    showAlert('Achievement Unlocked: Score 100 Points!');
    updateNextRewardDisplay();
  }
  if (powerUpsCollected >= 5 && !achievements['Collect 5 Power-Ups']) {
    achievements['Collect 5 Power-Ups'] = true;
    showAlert('Achievement Unlocked: Collect 5 Power-Ups!');
    updateNextRewardDisplay();
  }
  if (linesClearedTotal >= 3 && !achievements['Clear 3 Lines']) {
    achievements['Clear 3 Lines'] = true;
    showAlert('Achievement Unlocked: Clear 3 Lines!');
    updateNextRewardDisplay();
  }
  if (powerUpsCollected >= 10 && !achievements['Collect 10 Power-Ups']) {
    achievements['Collect 10 Power-Ups'] = true;
    showAlert('Achievement Unlocked: Collect 10 Power-Ups!');
    updateNextRewardDisplay();
  }
  if (linesClearedTotal >= 5 && !achievements['Clear 5 Lines']) {
    achievements['Clear 5 Lines'] = true;
    showAlert('Achievement Unlocked: Clear 5 Lines!');
    updateNextRewardDisplay();
  }
  if (snakeLength >= 20 && !achievements['Reach Snake Length of 20']) {
    achievements['Reach Snake Length of 20'] = true;
    showAlert('Achievement Unlocked: Reach Snake Length of 20!');
    updateNextRewardDisplay();
  }
  if ((Date.now() - gameStartTime) >= 120000 && !achievements['Survive 2 Minutes']) {
    achievements['Survive 2 Minutes'] = true;
    showAlert('Achievement Unlocked: Survive 2 Minutes!');
    updateNextRewardDisplay();
  }

  // Hard Achievements
  if ((Date.now() - gameStartTime) >= 600000 && !achievements['Survive 10 Minutes']) {
    achievements['Survive 10 Minutes'] = true;
    showAlert('Achievement Unlocked: Survive 10 Minutes!');
    updateNextRewardDisplay();
  }
  if (powerUpsCollected >= 20 && !achievements['Collect 20 Power-Ups']) {
    achievements['Collect 20 Power-Ups'] = true;
    showAlert('Achievement Unlocked: Collect 20 Power-Ups!');
    updateNextRewardDisplay();
  }
  if (linesClearedTotal >= 10 && !achievements['Clear 10 Lines']) {
    achievements['Clear 10 Lines'] = true;
    showAlert('Achievement Unlocked: Clear 10 Lines!');
    updateNextRewardDisplay();
  }
  if (tetrominoPlayer.score >= 500 && !achievements['Score 500 Points']) {
    achievements['Score 500 Points'] = true;
    showAlert('Achievement Unlocked: Score 500 Points!');
    updateNextRewardDisplay();
  }
  if (snakeLength >= 50 && !achievements['Snake Length 50']) {
    achievements['Snake Length 50'] = true;
    showAlert('Achievement Unlocked: Reach Snake Length of 50!');
    updateNextRewardDisplay();
  }
  if (collectedAllPowerUpTypes() && !achievements['Collect All Power-Up Types']) {
    achievements['Collect All Power-Up Types'] = true;
    showAlert('Achievement Unlocked: Collect All Power-Up Types!');
    updateNextRewardDisplay();
  }
  if (getPointsMultiplier() >= 5 && !achievements['Achieve 5x Multiplier']) {
    achievements['Achieve 5x Multiplier'] = true;
    showAlert('Achievement Unlocked: Achieve 5x Multiplier!');
    updateNextRewardDisplay();
  }
  if (countUnlockedAchievements() >= 5 && !achievements['Complete 5 Achievements']) {
    achievements['Complete 5 Achievements'] = true;
    showAlert('Achievement Unlocked: Complete 5 Achievements!');
    updateNextRewardDisplay();
  }

  // Almost Impossible Achievements
  if ((Date.now() - gameStartTime) >= 1800000 && !achievements['Survive 30 Minutes']) {
    achievements['Survive 30 Minutes'] = true;
    showAlert('Achievement Unlocked: Survive 30 Minutes!');
    updateNextRewardDisplay();
  }
  if (powerUpsCollected >= 50 && !achievements['Collect 50 Power-Ups']) {
    achievements['Collect 50 Power-Ups'] = true;
    showAlert('Achievement Unlocked: Collect 50 Power-Ups!');
    updateNextRewardDisplay();
  }
  if (linesClearedTotal >= 20 && !achievements['Clear 20 Lines']) {
    achievements['Clear 20 Lines'] = true;
    showAlert('Achievement Unlocked: Clear 20 Lines!');
    updateNextRewardDisplay();
  }
  if (tetrominoPlayer.score >= 2000 && !achievements['Score 2000 Points']) {
    achievements['Score 2000 Points'] = true;
    showAlert('Achievement Unlocked: Score 2000 Points!');
    updateNextRewardDisplay();
  }
  if (snakeLength >= 100 && !achievements['Snake Length 100']) {
    achievements['Snake Length 100'] = true;
    showAlert('Achievement Unlocked: Reach Snake Length of 100!');
    updateNextRewardDisplay();
  }
  if (lives === maxLives && !achievements['No Lives Lost']) {
    achievements['No Lives Lost'] = true;
    showAlert('Achievement Unlocked: No Lives Lost!');
    updateNextRewardDisplay();
  }
  if (powerUpsCollected >= 100 && !achievements['Collect 100 Power-Ups']) {
    achievements['Collect 100 Power-Ups'] = true;
    showAlert('Achievement Unlocked: Collect 100 Power-Ups!');
    updateNextRewardDisplay();
  }
  if (countUnlockedAchievements() >= Object.keys(achievements).length && !achievements['Complete All Achievements']) {
    achievements['Complete All Achievements'] = true;
    showAlert('Achievement Unlocked: Complete All Achievements!');
    updateNextRewardDisplay();
  }
}

// Helper function to check if all power-up types have been collected
function collectedAllPowerUpTypes() {
  const allPowerUpTypes = ['increase', 'decrease', 'sideWarp', 'verticalWarp', 'fullWarp', 'extraLife', 'doublePoints', 'triplePoints', 'halfPoints'];
  return allPowerUpTypes.every(type => powerUpsCollectedTypes.includes(type));
}

// Helper function to count unlocked achievements
function countUnlockedAchievements() {
  return Object.values(achievements).filter(unlocked => unlocked).length;
}

// Function to update the scoreboard
function updateScoreBoard() {
  const totalScore = tetrominoPlayer.score + snakeScore;
  const dateTime = new Date().toLocaleString();

  const newScore = {
    name: playerName,
    score: totalScore,
    dateTime: dateTime,
    orientation: currentOrientation,
    device: navigator.userAgent
  };

  let scores = JSON.parse(localStorage.getItem('tetrisSnakeScores')) || [];
  scores.push(newScore);

  // Sort scores in descending order
  scores.sort((a, b) => b.score - a.score);

  // Keep only top 10 scores
  scores = scores.slice(0, 10);

  localStorage.setItem('tetrisSnakeScores', JSON.stringify(scores));
}

// Function to load the scoreboard
function loadScoreBoard() {
  const scoreTableBody = document.querySelector('#scoreTable tbody');
  scoreTableBody.innerHTML = ''; // Clear existing scores
  let scores = JSON.parse(localStorage.getItem('tetrisSnakeScores')) || [];
  scores.forEach(score => {
    const newRow = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = score.name;
    newRow.appendChild(nameCell);

    const scoreCell = document.createElement('td');
    scoreCell.textContent = score.score;
    newRow.appendChild(scoreCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = score.dateTime;
    newRow.appendChild(dateCell);

    const orientationCell = document.createElement('td');
    orientationCell.textContent = score.orientation;
    newRow.appendChild(orientationCell);

    const deviceCell = document.createElement('td');
    deviceCell.textContent = score.device;
    newRow.appendChild(deviceCell);

    scoreTableBody.appendChild(newRow);
  });
}

// Start the game loop when the game is reset
function resetGame() {
  // Reset all game variables (from gameSetup.js)
  grid = createMatrix(gridWidth, gridHeight);
  tetrominoPlayer.score = 0;
  tetrominoPlayer.speed = 1000;
  tetrominoPlayer.matrix = null;
  nextTetromino = null;
  snakeScore = 0;
  snakeLength = 5;
  tetrominoReset();
  snake = [{ x: Math.floor(gridWidth / 2), y: gridHeight - 1 }];
  snakeDirection = { x: 0, y: -1 };
  snakeNewDirection = { x: 0, y: -1 };
  powerUps = [];
  sideWarpEndTime = 0;
  verticalWarpEndTime = 0;
  fullWarpEndTime = 0;
  lastWarpPowerUpEndTime = 0;
  lastExtraLifePowerUpTime = 0;
  gameOver = false;
  lastTime = 0;
  dropCounter = 0;
  snakeMoveCounter = 0;
  achievementsUnlocked = [];
  linesClearedTotal = 0;
  powerUpsCollected = 0;
  powerUpsCollectedTypes = [];
  gameStartTime = Date.now();
  paused = false;
  lives = 3;
  updateLivesDisplay();
  nextSpeedIncreaseTime = Date.now() + speedIncreaseInterval;
  generatePowerUps();
  updateNextRewardDisplay();
  updateScoreDisplays();
  requestAnimationFrame(update);
}

// Logging UI updates setup
console.log('UI updates initialized.');
