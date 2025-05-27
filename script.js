// Configurar canvas principal
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('tetris');
  const context = canvas.getContext('2d');
  context.scale(20, 20);

  const nextCanvas = document.getElementById('next');
  const nextCtx = nextCanvas.getContext('2d');
  nextCtx.scale(20, 20);

  const arena = createMatrix(12, 20);
  const colors = [
    null,
    '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
  ];

  const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
  };

  let dropCounter = 0;
  let dropInterval = 1000;
  let lastTime = 0;
  let pieceBag = [];

  function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
  }

  function createPiece(type) {
    switch (type) {
      case 'T': return [ [0, 0, 0], [1, 1, 1], [0, 1, 0] ];
      case 'O': return [ [2, 2], [2, 2] ];
      case 'L': return [ [0, 3, 0], [0, 3, 0], [0, 3, 3] ];
      case 'J': return [ [0, 4, 0], [0, 4, 0], [4, 4, 0] ];
      case 'I': return [ [0, 0, 0, 0], [5, 5, 5, 5], [0, 0, 0, 0], [0, 0, 0, 0] ];
      case 'S': return [ [0, 6, 6], [6, 6, 0], [0, 0, 0] ];
      case 'Z': return [ [7, 7, 0], [0, 7, 7], [0, 0, 0] ];
    }
  }

  function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const px = x + offset.x;
          const py = y + offset.y;
          context.fillStyle = colors[value];
          context.fillRect(px, py, 1, 1);
          context.strokeStyle = '#000';
          context.lineWidth = 0.05;
          context.strokeRect(px, py, 1, 1);
        }
      });
    });
  }

  function drawGrid() {
    context.strokeStyle = '#222';
    context.lineWidth = 0.05;
    for (let x = 0; x < 12; x++) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 20);
      context.stroke();
    }
    for (let y = 0; y < 20; y++) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(12, y);
      context.stroke();
    }
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
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
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
    if (collide(arena, player)) {
      player.pos.x -= dir;
    }
  }

  function playerReset() {
    if (pieceBag.length === 0) refillBag();
    const nextType = pieceBag.pop();
    player.matrix = createPiece(nextType);
    player.pos.y = 0;
    player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

    if (collide(arena, player)) {
      arena.forEach(row => row.fill(0));
      player.score = 0;
      updateScore();
    }
    drawNextPiece();
  }

  function refillBag() {
    const pieces = ['T', 'J', 'Z', 'O', 'S', 'L', 'I'];
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    pieceBag = pieces;
  }

  function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < y; x++) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
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

  function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; y--) {
      for (let x = 0; x < arena[y].length; x++) {
        if (arena[y][x] === 0) continue outer;
      }
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      y++;
      player.score += 10;
    }
  }

  function updateScore() {
    document.getElementById('score').innerText = player.score;
  }

  function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, 4, 4);
    if (pieceBag.length === 0) return;
    const nextType = pieceBag[pieceBag.length - 1];
    const matrix = createPiece(nextType);
    const offsetX = Math.floor((4 - matrix[0].length) / 2);
    const offsetY = Math.floor((4 - matrix.length) / 2);
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          nextCtx.fillStyle = colors[value];
          nextCtx.fillRect(x + offsetX, y + offsetY, 1, 1);
          nextCtx.strokeStyle = '#000';
          nextCtx.lineWidth = 0.05;
          nextCtx.strokeRect(x + offsetX, y + offsetY, 1, 1);
        }
      });
    });
  }

  function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
    requestAnimationFrame(update);
  }

  document.addEventListener('keydown', event => {
    if (event.repeat) return;
    if (event.key === 'ArrowLeft') playerMove(-1);
    else if (event.key === 'ArrowRight') playerMove(1);
    else if (event.key === 'ArrowDown') playerDrop();
    else if (event.key === 'ArrowUp') playerRotate(1);
  });

  playerReset();
  updateScore();
  update();
});
