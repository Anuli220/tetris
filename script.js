const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20);

let score = document.getElementById("score");

function restartGame() {
    score = 0;
    arena = "";

}

function createMatrix(w, h) {
    // let rows = [];
    // r.forEach(r => {
    //     r =  
    // });

    // Empty array to store rows
    const matrix = [];
    // Loop until height = 0 (create h number of rows)
    while (h--) {
        // Push a new row with 0s of w
        matrix.push(new Array(w).fill(0));
    }

    return matrix;
}

function createPiece(type) {
  if (type === "T") return [[0,1,0],[1,1,1],[0,0,0]];
  if (type === "O") return [[2,2],[2,2]];
  if (type === "L") return [[0,3,0],[0,3,0],[0,3,3]];
  if (type === "J") return [[0,4,0],[0,4,0],[4,4,0]];
  if (type === "I") return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
  if (type === "S") return [[0,6,6],[6,6,0],[0,0,0]];
  if (type === "Z") return [[7,7,0],[0,7,7],[0,0,0]];
}

const colors = [
    null,
    "#f15454",
    "#0aff8d",
    "#ffa724",
    "#199fdd",
    "#ac3df7",
    "#ee006f",
    "#43a800",
    "#060d6b"
];

const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0
};

function collisionCheck(arena, player) {
    // Destructure player matrix and position into m and o
    const [m, o] = [player.matrix, player.pos];
    // Loop through each row of the player matrix
    for (let y = 0; y < m.length; y++) {
        // Loop through each column of the matrix row
        for (let x = 0; x < m[y].length; x++) {
            // check if block exists and collides with the arena
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                 arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            // If the block is not empty, place the block value into the arena at correct position
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
// clear full rows and update score
function arenaSweep() {
    // loop from the bottom row to the top of arena
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        // loop through each cell in the row
        for (let x = 0; x < arena[y].length; x++) {
            // if the cell is empty, skip it
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        player.score += 10;
        score.innerText = player.score;
        y++;
    }
}

// rotate the piece matrix

function rotate(matrix) {
    // loop through the matrix rows and colums to swap diagonal elements
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] =
            [matrix[y][x], matrix[x][y]];
        }
    }
    // reverse the rows by 90 degrees
    matrix.forEach(row => row.reverse());
}

function playerDrop() {
    // move the player's piece by one block down (y++)
    player.pos.y++;
    // check for collision
    if (collisionCheck(arena, player)) {
        // if collision, move the piece up (y--)
        player.pos.y--;
        // merge the piece with the arena
        merge(arena, player);
        // clear completed rows + update score
        arenaSweep();
        // reset player with a new piece
        playerReset();
    }
    // reset the drop counter for timing
    dropCounter = 0;
}

function playerMove(dir) {
    // move the player piece left or right based on direction (dir)
    player.pos.x += dir;
    // collisionCheck after movement
    if (collisionCheck(arena, player)) {
        // revert the movement (up) if detected
        player.pos.x -= dir;
        // merge the piece with the arena
    }
}

function playerRotate() {
    // store the current horizontal position before rotation
    const pos = player.pos.x;
    // rotate the player piece matrix
    rotate(player.matrix);
    // collisionCheck after movement
    if (collisionCheck(arena, player)) {
        player.pos.x = pos;
    }
}

function playerReset() {
    // select a random tetris piece type
    const pieces = "TJLOSZI"
    // and create a new piece matrix
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    // reset the vertical position to the top
    player.pos.y = 0;
    // center the piece horizontally in the arena
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    // if there is a collision, reset the game
    if (collisionCheck(arena, player)) {
        arena.forEach(row => row.fill(0));
        // reset the player's score
        player.score = 0;
        // display the current score
        score.innerText = player.score;
    }
}

function drawMatrix(matrix, offset) {
    // loop through the matrix rows and colums to draw blocks
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            // draw only non-zero values as coloured blocks
            if (value !== 0) {
                context.fillStyle = colors[value];
                // Use offset to position the piece correctly on canvas
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    // fill the canvas background
    context.fillStyle = "rgb(28, 8, 36)";
    // clear the previous frame
    context.fillRect(0, 0, canvas.width, canvas.height);
    // draw the arena (placed blocks)
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// Track time difference between frames

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    // Increase drop counter using delta time
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;
    // Automatically drop piece based on drop interval
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    // Redraw the game each frame
    draw();
    // Call update continuously using requestAnimationFrame
    requestAnimationFrame(update);
}
// Listen for keyboard input events
document.addEventListener("keydown", event => {
    // Move in prompted direction when the corresponding arrow is pressed
    if (event.key === "ArrowLeft") playerMove(-1);
    else if (event.key === "ArrowRight") playerMove(1);
    else if (event.key === "ArrowDown") playerDrop();
    else if (event.key === "ArrowUp") playerRotate();
});

// clear the arena grid

function resetGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    score.innerText = 0;
    playerReset();
}

playerReset();
update();
