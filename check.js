// Get the canvas element from the HTML using its ID "tetris"
const canvas = document.getElementById("tetris");

// Get the 2D drawing context of the canvas for rendering shapes
const context = canvas.getContext("2d");

// Scale the canvas grid so 1 unit = 20 pixels (bigger blocks)
context.scale(20, 20);

// Get the score display element from HTML
const scoreElement = document.getElementById("score");

// Create a function to generate a 2D matrix (game grid)
function createMatrix(w, h) {
    // Create an empty array to store rows
    const matrix = [];

    // Loop until height becomes zero (create h rows)
    while (h--) {
        // Push a new row filled with 0s of width w
        matrix.push(new Array(w).fill(0));
    }

    // Return the completed matrix
    return matrix;
}

// Create a function to generate different Tetris pieces
function createPiece(type) {
    // If piece type is T, return T shape matrix
    if (type === "T") return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];

    // If piece type is O, return square shape matrix
    if (type === "O") return [[2, 2], [2, 2]];

    // If piece type is L, return L shape matrix
    if (type === "L") return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];

    // If piece type is J, return J shape matrix
    if (type === "J") return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];

    // If piece type is I, return long line shape matrix
    if (type === "I") return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];

    // If piece type is S, return S shape matrix
    if (type === "S") return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];

    // If piece type is Z, return Z shape matrix
    if (type === "Z") return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
}

// Create an array of colors for each block type index
const colors = [
    null,        // 0 means empty cell (no color)
    "#ff0d72",   // Color for piece type 1
    "#0dc2ff",   // Color for piece type 2
    "#0dff72",   // Color for piece type 3
    "#f538ff",   // Color for piece type 4
    "#ff8e0d",   // Color for piece type 5
    "#ffe138",   // Color for piece type 6
    "#3877ff"    // Color for piece type 7
];

// Create the main game arena grid of 12 columns and 20 rows
const arena = createMatrix(12, 20);

// Create a player object to store position, piece, and score
const player = {
    pos: { x: 0, y: 0 }, // Store player's x and y position
    matrix: null,      // Store current falling piece matrix
    score: 0           // Store player score
};

// Create a function to check collision between player and arena
function collide(arena, player) {
    // Destructure player matrix and position into m and o
    const [m, o] = [player.matrix, player.pos];

    // Loop through each row of the player matrix
    for (let y = 0; y < m.length; y++) {

        // Loop through each column of the matrix row
        for (let x = 0; x < m[y].length; x++) {

            // Check if block exists and collides with arena grid
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {

                // Return true if collision detected
                return true;
            }
        }
    }

    // Return false if no collision occurs
    return false;
}

// Create a function to merge the player's piece into the arena grid
function merge(arena, player) {
    // Loop through each row of the player's matrix
    player.matrix.forEach((row, y) => {

        // Loop through each value in the row
        row.forEach((value, x) => {

            // If the block is not empty
            if (value !== 0) {

                // Place the block value into the arena at correct position
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Create a function to clear full rows and update score
function arenaSweep() {
    // Loop from bottom row to top row of arena
    outer: for (let y = arena.length - 1; y >= 0; y--) {

        // Loop through each cell in the row
        for (let x = 0; x < arena[y].length; x++) {

            // If any cell is empty, skip this row
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
    }
}

function rotate(matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] =
      [matrix[y][x], matrix[x][y]];
    }
  }
  matrix.forEach(row => row.reverse());
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate() {
  const pos = player.pos.x;
  rotate(player.matrix);
  if (collide(arena, player)) {
    player.pos.x = pos;
  }
}

function playerReset() {
  const pieces = "TJLOSZI";
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    scoreElement.innerText = player.score;
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = "#020617";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") playerMove(-1);
  else if (event.key === "ArrowRight") playerMove(1);
  else if (event.key === "ArrowDown") playerDrop();
  else if (event.key === "ArrowUp") playerRotate();
});

function resetGame() {
  arena.forEach(row => row.fill(0));
  player.score = 0;
  scoreElement.innerText = 0;
  playerReset();
}

playerReset();
update();