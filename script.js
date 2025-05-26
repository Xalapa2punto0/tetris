const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(20, 20);

const scoreElem = document.getElementById("score");
const levelElem = document.getElementById("level");
const restartBtn = document.getElementById("restart");

const ROWS = 20;
const COLS = 12;

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

let score = 0;
let level = 1;

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF'
];

const arena = createMatrix(COLS, ROWS);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  if (type === 'T') return [[0,1,0],[1,1,1],[0,0,0]];
  if (type === 'O') return [[2,2],[2,2]];
  if (type === 'L') return [[0,3,0],[0,3,0],[0,3,3]];
  if (type === 'J') return [[0,4,0],[0,4,0],[4,4,0]];
  if (type === 'I') return [[0,0,0,0],[5,5,5,5],[0,0,0,0],[0,0,0,0]];
  if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
  if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
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

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (
        m[y][x] !== 0 &&
        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    score = 0;
    level = 1;
    dropInterval = 1000;
    updateScore();
  }
}

function arenaSweep() {
  let rowsCleared = 0;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    rowsCleared++;
  }

  if (rowsCleared > 0) {
    score += rowsCleared * 10;
    if (score >= level * 100) {
      level++;
      dropInterval = Math.max(100, dropInterval - 100);
    }
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function updateScore() {
  scoreElem.textContent = score;
  levelElem.textContent = level;
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") playerMove(-1);
  else if (e.key === "ArrowRight") playerMove(1);
  else if (e.key === "ArrowDown") playerDrop();
  else if (e.key === "q") playerRotate(-1);
  else if (e.key === "w") playerRotate(1);
});

restartBtn.addEventListener("click", () => {
  arena.forEach(row => row.fill(0));
  score = 0;
  level = 1;
  dropInterval = 1000;
  updateScore();
  playerReset();
});
document.getElementById("left").addEventListener("click", () => playerMove(-1));
document.getElementById("right").addEventListener("click", () => playerMove(1));
document.getElementById("down").addEventListener("click", playerDrop);
document.getElementById("rotate").addEventListener("click", () => playerRotate(1));

playerReset();
updateScore();
update();
