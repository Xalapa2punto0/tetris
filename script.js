const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const game = document.getElementById("game");

const width = 10;
let pacmanPosition = 11;
const layout = [
  1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,1,0,0,0,0,1,
  1,0,1,0,1,0,1,1,0,1,
  1,0,1,0,0,0,0,1,0,1,
  1,0,1,1,1,1,0,1,0,1,
  1,0,0,0,0,1,0,1,0,1,
  1,1,1,1,0,1,0,1,0,1,
  1,0,0,1,0,0,0,1,0,1,
  1,0,0,0,0,1,0,0,0,1,
  1,1,1,1,1,1,1,1,1,1
];

// Dibuja el tablero
function drawBoard() {
  game.innerHTML = '';
  layout.forEach((cell, i) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    if (cell === 1) div.classList.add("wall");
    if (cell === 0 || cell === 2) {
      const pellet = document.createElement("div");
      pellet.classList.add("pellet");
      if (cell === 2) pellet.style.backgroundColor = 'transparent';
      div.appendChild(pellet);
    }
    if (i === pacmanPosition) div.classList.add("pacman");
    game.appendChild(div);
  });
}

function movePacman(key) {
  let newPos = pacmanPosition;

  if (key === "ArrowUp") newPos -= width;
  if (key === "ArrowDown") newPos += width;
  if (key === "ArrowLeft") newPos -= 1;
  if (key === "ArrowRight") newPos += 1;

  if (layout[newPos] !== 1 && newPos >= 0 && newPos < layout.length) {
    if (layout[newPos] === 0) layout[newPos] = 2; // Comer pellet
    pacmanPosition = newPos;
    drawBoard();
  }
}

document.addEventListener("keydown", e => movePacman(e.key));

// Para controles móviles
function move(direction) {
  movePacman(direction);
}

// Mostrar juego al tocar la pantalla
startScreen.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameContainer.style.display = "block";
  drawBoard();
});
