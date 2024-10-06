// powerUps.js
// Contains power-ups definitions, functions, and rendering logic

// Function to generate power-ups
function generatePowerUps() {
  const currentTime = Date.now();
  const types = [
    { symbol: '↑', effect: 'increase', color: '#FFA500' }, // Increase length
    { symbol: '↓', effect: 'decrease', color: '#FF0000' }, // Decrease length
    { symbol: '?', effect: 'random', color: '#FFFF00' }    // Random effect
  ];

  // Warp Power-Ups
  const warpTypes = [
    { symbol: '⇄', effect: 'sideWarp', color: '#008000' },
    { symbol: '⇅', effect: 'verticalWarp', color: '#00A000' },
    { symbol: '⤡', effect: 'fullWarp', color: '#00C000' }
  ];

  // Points Power-Ups
  const pointsTypes = [
    { symbol: '2x', effect: 'doublePoints', color: '#1E90FF' },
    { symbol: '3x', effect: 'triplePoints', color: '#9400D3' },
    { symbol: '½x', effect: 'halfPoints', color: '#8B0000' } // Negative effect
  ];

  const extraLifeType = { symbol: '♥', effect: 'extraLife', color: '#FF69B4' };

  // Check if warp power-up can be generated
  let canGenerateWarp = false;
  if (Date.now() - lastWarpPowerUpEndTime >= 90000 && !isWarpActive()) {
    canGenerateWarp = !powerUps.some(p => warpTypes.some(wt => wt.effect === p.effect));
  }

  // Check if extra life power-up can be generated
  const extraLifeCooldown = 120000; // 2 minutes
  let canGenerateExtraLife = false;
  if (Date.now() - lastExtraLifePowerUpTime >= extraLifeCooldown) {
    canGenerateExtraLife = !powerUps.some(p => p.effect === 'extraLife');
  }

  // Adjusted power-up generation timing
  let timeSinceLastPowerUpCollected = Date.now() - lastPowerUpCollectedTime;
  if (timeSinceLastPowerUpCollected >= powerUpRespawnTime && powerUps.length < maxPowerUps) {
    let powerUp;
    let attempts = 0;
    do {
      let powerUpType;

      if (canGenerateExtraLife) {
        powerUpType = extraLifeType;
        canGenerateExtraLife = false;
        lastExtraLifePowerUpTime = Date.now();
      } else if (canGenerateWarp && !powerUps.some(p => warpTypes.some(wt => wt.effect === p.effect))) {
        powerUpType = warpTypes[Math.floor(Math.random() * warpTypes.length)];
        canGenerateWarp = false;
      } else {
        const allTypes = [...types, ...pointsTypes];
        powerUpType = allTypes[Math.floor(Math.random() * allTypes.length)];
      }

      powerUp = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
        spawnTime: Date.now(),
        ...powerUpType
      };

      attempts++;
      if (attempts > 100) break;

    } while (
      grid[powerUp.y][powerUp.x] !== 0 ||
      snake.some(segment => segment.x === powerUp.x && segment.y === powerUp.y) ||
      powerUps.some(p => p.x === powerUp.x && p.y === powerUp.y)
    );

    if (powerUp) {
      powerUps.push(powerUp);
      // Schedule next power-up generation
      powerUpRespawnTime = Math.random() * (30000 - 10000) + 10000; // Between 10 and 30 seconds
    }
  }
}

// Variables to track power-up timing
let lastPowerUpCollectedTime = Date.now();
let powerUpRespawnTime = Math.random() * (30000 - 10000) + 10000; // Between 10 and 30 seconds
let maxPowerUps = 7;

// Function to apply power-up effects
function applyPowerUp(powerUp) {
  if (powerUp.effect === 'increase') {
    snakeLength = Math.ceil(snakeLength * 1.2);
    snakeScore += 10 * getPointsMultiplier();
    updateScoreDisplays();
    showAlert('Snake length increased by 20%! +10 points');
  } else if (powerUp.effect === 'decrease') {
    snakeLength = Math.floor(snakeLength * 0.7);
    snakeScore -= 5 * getPointsMultiplier();
    updateScoreDisplays();
    showAlert('Snake length decreased by 30%! -5 points');
  } else if (powerUp.effect === 'random') {
    // Randomly select any power-up effect except 'random' itself
    const allEffects = ['increase', 'decrease', 'sideWarp', 'verticalWarp', 'fullWarp', 'extraLife', 'doublePoints', 'triplePoints', 'halfPoints'];
    const randomEffect = allEffects[Math.floor(Math.random() * allEffects.length)];
    applyPowerUp({ effect: randomEffect });
    return; // Exit to prevent duplicate processing
  } else if (powerUp.effect === 'sideWarp') {
    sideWarpEndTime = Date.now() + powerUpDuration;
    lastWarpPowerUpEndTime = sideWarpEndTime;
    showAlert('Side Warp Activated! Wrap around side walls.');
    powerUpActive = true;
  } else if (powerUp.effect === 'verticalWarp') {
    verticalWarpEndTime = Date.now() + powerUpDuration;
    lastWarpPowerUpEndTime = verticalWarpEndTime;
    showAlert('Vertical Warp Activated! Wrap around top and bottom walls.');
    powerUpActive = true;
  } else if (powerUp.effect === 'fullWarp') {
    fullWarpEndTime = Date.now() + powerUpDuration;
    lastWarpPowerUpEndTime = fullWarpEndTime;
    showAlert('Full Warp Activated! Wrap around all walls.');
    powerUpActive = true;
  } else if (powerUp.effect === 'extraLife') {
    if (lives < maxLives) {
      lives++;
      updateLivesDisplay();
      showAlert('Extra Life! Lives increased by 1.');
    } else {
      showAlert('Already at maximum lives!');
    }
  } else if (powerUp.effect === 'doublePoints') {
    doublePointsEndTime = Date.now() + pointsPowerUpDuration;
    showAlert('Double Points Activated for 45 seconds!');
    powerUpActive = true;
  } else if (powerUp.effect === 'triplePoints') {
    triplePointsEndTime = Date.now() + pointsPowerUpDuration;
    showAlert('Triple Points Activated for 45 seconds!');
    powerUpActive = true;
  } else if (powerUp.effect === 'halfPoints') {
    halfPointsEndTime = Date.now() + pointsPowerUpDuration;
    showAlert('Half Points Activated for 45 seconds! (Negative Effect)');
    powerUpActive = true;
  }

  powerUpsCollected++;
  if (!powerUpsCollectedTypes.includes(powerUp.effect)) {
    powerUpsCollectedTypes.push(powerUp.effect);
  }
  checkAchievements();

  // Remove the collected power-up and reset timer
  powerUps.splice(powerUps.indexOf(powerUp), 1);
  lastPowerUpCollectedTime = Date.now();
}

// Function to draw power-ups on the canvas
function drawPowerUps() {
  powerUps.forEach(powerUp => {
    context.fillStyle = powerUp.color;
    context.font = `${blockSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      powerUp.symbol,
      (powerUp.x + 0.5) * blockSize,
      (powerUp.y + 0.5) * blockSize
    );
  });
}

// Function to check if any warp is active
function isWarpActive() {
  return isSideWarpActive() || isVerticalWarpActive() || isFullWarpActive();
}

// Functions to check individual warp effects
function isSideWarpActive() {
  return Date.now() < sideWarpEndTime;
}

function isVerticalWarpActive() {
  return Date.now() < verticalWarpEndTime;
}

function isFullWarpActive() {
  return Date.now() < fullWarpEndTime;
}

// Function to get current points multiplier
function getPointsMultiplier() {
  if (Date.now() < triplePointsEndTime) {
    return 3;
  } else if (Date.now() < doublePointsEndTime) {
    return 2;
  } else if (Date.now() < halfPointsEndTime) {
    return 0.5;
  }
  return 1;
}

// Function to update snake color during power-ups
function updateSnakeColor() {
  const currentTime = Date.now();
  const powerUpEndTime = Math.max(
    sideWarpEndTime,
    verticalWarpEndTime,
    fullWarpEndTime,
    doublePointsEndTime,
    triplePointsEndTime,
    halfPointsEndTime
  );

  if (currentTime < powerUpEndTime) {
    powerUpActive = true;
    const timeLeft = powerUpEndTime - currentTime;

    if (timeLeft <= 10000) {
      // Last 10 seconds, alternate colors every second
      const blink = Math.floor(timeLeft / 500) % 2 === 0;
      snakeColor = blink ? '#32CD32' : '#FFD700'; // Lime Green and Gold
    } else {
      snakeColor = '#32CD32'; // Lime Green during power-up
    }
  } else {
    powerUpActive = false;
    snakeColor = '#FFD700'; // Gold when no power-up is active
  }
}

// Function to check for collision with power-ups
function checkPowerUpCollision(head) {
  powerUps.forEach((powerUp, index) => {
    if (powerUp.x === head.x && powerUp.y === head.y) {
      applyPowerUp(powerUp);
    }
  });
}

// Function to relocate a power-up (used when a line is cleared)
function relocatePowerUp(powerUp) {
  let attempts = 0;
  let newPosition;
  do {
    newPosition = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight)
    };
    attempts++;
    if (attempts > 100) break;
  } while (
    grid[newPosition.y][newPosition.x] !== 0 ||
    snake.some(segment => segment.x === newPosition.x && segment.y === newPosition.y) ||
    powerUps.some(p => p.x === newPosition.x && p.y === newPosition.y)
  );

  if (newPosition) {
    powerUp.x = newPosition.x;
    powerUp.y = newPosition.y;
    powerUps.push(powerUp);
  }
}

// Initialize power-ups
generatePowerUps();

// Logging power-ups setup
console.log('Power-ups initialized.');
