// gameLogic.js
// Contains core game logic for Tetris and Snake, including the draw function

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

// Function to move tetromino left or right
function tetrominoMove(dir) {
  tetrominoPlayer.pos.x += dir;
  if (collide(grid, tetrominoPlayer)) {
    tetrominoPlayer.pos.x -= dir;
  }
}

// Function to drop the tetromino
function tetrominoDrop() {
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
  }
  dropCounter = 0;
}

// Function to rotate the tetromino
function rotate(matrix, dir) {
  // Transpose the matrix
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  // Reverse the rows for clockwise or columns for counter-clockwise rotation
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }

  const pos = tetrominoPlayer.pos.x;
  let offset = 1;
  while (collide(grid, tetrominoPlayer)) {
    tetrominoPlayer.pos.x += offset;
    if (!collide(grid, tetrominoPlayer)) {
      return;
    }
    tetrominoPlayer.pos.x = pos;
    offset = -offset;
    if (offset > matrix[0].length) {
      rotate(matrix, -dir);
      tetrominoPlayer.pos.x = pos;
      return;
    }
  }
}

// Function to handle game updates
function update(time = 0) {
  if (paused) {
    draw();
    requestAnimationFrame(update);
    return;
  }

  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;

  if (dropCounter > tetrominoPlayer.speed) {
    tetrominoDrop();
  }

  if (Date.now() >= nextSpeedIncreaseTime) {
    tetrominoPlayer.speed *= 0.8; // Increase speed by 20%
    nextSpeedIncreaseTime += speedIncreaseInterval;
    showAlert('Tetris speed increased by 20%!');
  }

  // Update countdown display
  let timeUntilSpeedIncrease = Math.ceil((nextSpeedIncreaseTime - Date.now()) / 1000);
  document.getElementById('speedIncreaseDisplay').textContent = `Next speed increase in: ${timeUntilSpeedIncrease}s`;

  snakeMoveCounter += deltaTime;
  if (snakeMoveCounter > snakeMoveInterval) {
    snakeMoveCounter = 0;

    // Handle snake movement
    updateSnake();
  }

  // Handle snake color changes during power-ups
  updateSnakeColor();

  draw();
  if (!gameOver) {
    requestAnimationFrame(update);
  }
}

// Function to draw the game elements
function draw() {
  // Clear the canvas
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the grid
  drawMatrix(grid, { x: 0, y: 0 });

  // Draw ghost piece
  drawGhostPiece();

  // Draw power-ups
  drawPowerUps();

  // Draw current tetromino
  drawMatrix(tetrominoPlayer.matrix, tetrominoPlayer.pos, tetrominoPlayer.color);

  // Draw snake
  snake.forEach((segment, index) => {
    context.fillStyle = index === 0 ? snakeColor : '#FFFFFF'; // Head uses snakeColor, body is white
    context.fillRect(segment.x * blockSize, segment.y * blockSize, blockSize, blockSize);
  });

  // Indicate lines with potential for clearing
  indicateLines();

  // Draw warp timers
  drawWarpTimers();
}

// Function to draw a matrix (tetromino or grid)
function drawMatrix(matrix, offset, color) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = color || '#FFFFFF';
        context.fillRect(
          (x + offset.x) * blockSize,
          (y + offset.y) * blockSize,
          blockSize,
          blockSize
        );
      }
    });
  });
}

// Function to draw the ghost piece
function drawGhostPiece() {
  let ghostPosition = { ...tetrominoPlayer.pos };
  while (!collide(grid, { pos: ghostPosition, matrix: tetrominoPlayer.matrix })) {
    ghostPosition.y++;
  }
  ghostPosition.y--; // Step back to last valid position

  context.globalAlpha = 0.5;
  drawMatrix(tetrominoPlayer.matrix, ghostPosition, 'grey'); // Draw ghost piece in grey
  context.globalAlpha = 1.0;
}

// Function to indicate lines close to being cleared
function indicateLines() {
  context.fillStyle = '#fff';
  context.font = '16px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  for (let y = 0; y < gridHeight; y++) {
    let x = 0;
    while (x < gridWidth) {
      if (grid[y][x] !== 0) {
        let runStart = x;
        let runLength = 1;
        while (x + runLength < gridWidth && grid[y][x + runLength] !== 0) {
          runLength++;
        }
        if (runLength >= 6 && runLength < 12) {
          let blocksNeeded = 12 - runLength;
          // Show numbers on outer blocks
          context.fillStyle = '#000';
          context.fillText(blocksNeeded, (runStart + 0.5) * blockSize, (y + 0.5) * blockSize);
          context.fillText(blocksNeeded, (x + runLength - 0.5) * blockSize, (y + 0.5) * blockSize);
        }
        x += runLength;
      } else {
        x++;
      }
    }
  }
}

// Function to draw warp timers
function drawWarpTimers() {
  const warpTimeDisplay = document.getElementById('warpTimeDisplay');
  let activeWarps = [];
  if (isFullWarpActive()) {
    let remainingTime = Math.ceil((fullWarpEndTime - Date.now()) / 1000);
    activeWarps.push(`Full Warp (${remainingTime}s left)`);
  } else {
    if (isSideWarpActive()) {
      let remainingTime = Math.ceil((sideWarpEndTime - Date.now()) / 1000);
      activeWarps.push(`Side Warp (${remainingTime}s left)`);
    }
    if (isVerticalWarpActive()) {
      let remainingTime = Math.ceil((verticalWarpEndTime - Date.now()) / 1000);
      activeWarps.push(`Vertical Warp (${remainingTime}s left)`);
    }
  }
  if (activeWarps.length > 0) {
    warpTimeDisplay.textContent = `Warp Time Left: ${activeWarps.join(', ')}`;
  } else {
    warpTimeDisplay.textContent = '';
  }
}

// Function to update snake movement
function updateSnake() {
  const snakeHead = snake[0];

  if (!mouseInCanvas) {
    showAlert('Game Paused: Mouse pointer left the game area!');
  } else {
    const targetX = Math.floor(mousePosition.x / blockSize);
    const targetY = Math.floor(mousePosition.y / blockSize);
    const deltaX = targetX - snakeHead.x;
    const deltaY = targetY - snakeHead.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      snakeNewDirection = { x: deltaX > 0 ? 1 : -1, y: 0 };
    } else if (deltaY !== 0) {
      snakeNewDirection = { x: 0, y: deltaY > 0 ? 1 : -1 };
    }

    if (snakeNewDirection.x !== -snakeDirection.x || snakeNewDirection.y !== -snakeDirection.y) {
      snakeDirection = snakeNewDirection;
    }

    let newHead = { x: snakeHead.x + snakeDirection.x, y: snakeHead.y + snakeDirection.y };

    // Wrap-around logic
    if (isFullWarpActive() || isSideWarpActive()) {
      if (newHead.x < 0) {
        newHead.x = gridWidth - 1;
      } else if (newHead.x >= gridWidth) {
        newHead.x = 0;
      }
    }
    if (isFullWarpActive() || isVerticalWarpActive()) {
      if (newHead.y < 0) {
        newHead.y = gridHeight - 1;
      } else if (newHead.y >= gridHeight) {
        newHead.y = 0;
      }
    }

    // Reset livesLostDuringThisMove after the first move
    if (livesLostDuringThisMove) {
      livesLostDuringThisMove = false;
    }

    if (
      (newHead.x < 0 || newHead.x >= gridWidth || newHead.y < 0 || newHead.y >= gridHeight) &&
      !isFullWarpActive() && !isSideWarpActive() && !isVerticalWarpActive()
    ) {
      handleLifeLoss('Snake collided with wall.');
    } else if (
      snakeCollision(newHead) ||
      settledBlockCollision(newHead) ||
      tetrominoCollision(newHead)
    ) {
      handleLifeLoss('Snake collision detected.');
    } else {
      snake.unshift(newHead);
      if (snake.length > snakeLength) {
        snake.pop();
      } else {
        let pointsMultiplier = getPointsMultiplier();
        snakeScore += 5 * pointsMultiplier;
        updateScoreDisplays();
      }
      checkPowerUpCollision(newHead);
    }

    // Achievement: Survive 5 Minutes
    if (!achievements['Survive 5 Minutes'] && (Date.now() - gameStartTime) >= 300000) {
      achievements['Survive 5 Minutes'] = true;
      showAlert('Achievement Unlocked: Survive 5 Minutes!');
      updateNextRewardDisplay();
    }
  }
}

// Function to handle life loss
function handleLifeLoss(message) {
  if (lives > 1) {
    lives--;
    updateLivesDisplay();
    resetSnake();
    showAlert(`You lost a life! ${message} Lives remaining: ${lives}/${maxLives}`);
  } else {
    lives--;
    updateLivesDisplay();
    gameOver = true;
    updateScoreBoard();
    alert(`Game Over! ${message} No lives remaining.`);
  }
}

// Function to reset the snake after life loss
function resetSnake() {
  let safePosition = findSafePosition();
  if (safePosition) {
    snake = [safePosition];
  } else {
    // If no safe position is found, clear some blocks around the default position
    clearAreaAroundPosition({ x: Math.floor(gridWidth / 2), y: gridHeight - 1 });
    snake = [{ x: Math.floor(gridWidth / 2), y: gridHeight - 1 }];
  }
  snakeDirection = { x: 0, y: -1 };
  snakeNewDirection = { x: 0, y: -1 };
  snakeLength = 5;
  livesLostDuringThisMove = true;
}

// Function to find a safe position for the snake to respawn
function findSafePosition() {
  for (let y = gridHeight - 1; y >= 0; y--) {
    for (let x = 0; x < gridWidth; x++) {
      if (grid[y][x] === 0 && isAreaClear({ x, y })) {
        return { x, y };
      }
    }
  }
  return null;
}

// Function to check if the area around a position is clear
function isAreaClear(position) {
  const directions = [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
  ];
  return directions.every(dir => {
    const x = position.x + dir.x;
    const y = position.y + dir.y;
    return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight && grid[y][x] === 0;
  });
}

// Function to clear an area around a position
function clearAreaAroundPosition(position) {
  const radius = 2;
  for (let y = position.y - radius; y <= position.y + radius; y++) {
    for (let x = position.x - radius; x <= position.x + radius; x++) {
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        grid[y][x] = 0;
      }
    }
  }
}

// Function to check for snake collision with itself
function snakeCollision(head) {
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

// Function to check for collision with settled blocks
function settledBlockCollision(head) {
  if (livesLostDuringThisMove) {
    return false; // Allow passing through settled blocks immediately after life loss
  }
  return grid[head.y][head.x] !== 0;
}

// Function to check for collision with falling tetromino
function tetrominoCollision(head) {
  const m = tetrominoPlayer.matrix;
  const o = tetrominoPlayer.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0) {
        let gridY = y + o.y;
        let gridX = x + o.x;
        if (gridY === head.y && gridX === head.x) {
          return true;
        }
      }
    }
  }
  return false;
}

// Function to merge tetromino into the grid
function merge(grid, player) {
  let collisionWithSnake = false;
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        let gridY = y + player.pos.y;
        let gridX = x + player.pos.x;
        grid[gridY][gridX] = value;
        if (snake.some(segment => segment.x === gridX && segment.y === gridY)) {
          collisionWithSnake = true;
        }
      }
    });
  });
  if (collisionWithSnake) {
    handleLifeLoss('Tetris block collided with the snake.');
  }
}

// Function to detect collision
function collide(grid, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0) {
        let gridY = y + o.y;
        let gridX = x + o.x;
        if (
          gridY >= gridHeight ||
          grid[gridY][gridX] !== 0
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Function to clear lines
function sweep() {
  let linesCleared = 0;
  for (let y = grid.length - 1; y >= 0; y--) {
    let x = 0;
    while (x < gridWidth) {
      if (grid[y][x] !== 0) {
        let runStart = x;
        let runLength = 1;
        while (x + runLength < gridWidth && grid[y][x + runLength] !== 0) {
          runLength++;
        }
        if (runLength >= 12) {
          // Remove the entire row
          grid.splice(y, 1);
          grid.unshift(new Array(gridWidth).fill(0));

          // Remove any power-ups in the cleared line and relocate them
          powerUps = powerUps.filter(powerUp => {
            if (powerUp.y === y) {
              relocatePowerUp(powerUp);
              return false;
            }
            return true;
          });

          linesCleared++;
          y++; // Recheck the same line as rows have shifted down
          break; // Exit the while loop and recheck the same y index
        }
        x += runLength;
      } else {
        x++;
      }
    }
  }
  return linesCleared;
}

// Logging game logic setup
console.log('Game logic initialized.');
