const board = document.getElementById('game-board');
const statusDiv = document.getElementById('status');
let restartBtn = null;
const winLine = document.getElementById('win-line');
const victoryModal = document.getElementById('victory-modal');
const victorySymbol = document.getElementById('victory-symbol');

let cells = [];
let currentPlayer = 'X';
let gameActive = true;

function createBoard() {
    board.innerHTML = '';
    cells = [];
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
        cells.push(cell);
    }
    statusDiv.textContent = `Vez de: ${currentPlayer}`;
    gameActive = true;
    winLine.style.display = 'none';
    winLine.innerHTML = '';
}

function handleCellClick(e) {
    const cell = e.target;
    const index = cell.dataset.index;
    if (!gameActive || cell.textContent) return;
    cell.textContent = currentPlayer;
    const winResult = checkWin();
    if (winResult) {
        statusDiv.textContent = `Vitória de ${currentPlayer}!`;
        gameActive = false;
        drawWinLine(winResult);
        showVictoryModal(currentPlayer);
        return;
    }
    if (cells.every(c => c.textContent)) {
        statusDiv.textContent = 'Empate!';
        gameActive = false;
        return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDiv.textContent = `Vez de: ${currentPlayer}`;
}

function showVictoryModal(symbol) {
    victorySymbol.textContent = symbol;
    victoryModal.style.display = 'flex';
    // Seleciona os botões toda vez que o modal aparece (garante que estão no DOM)
    restartBtn = document.getElementById('restart-btn');
    const menuBtn = document.querySelector('.menu-link');
    if (restartBtn) {
        restartBtn.onclick = function() {
            currentPlayer = 'X';
            createBoard();
            victoryModal.style.display = 'none';
        };
    }
    if (menuBtn) {
        menuBtn.onclick = function(e) {
            e.preventDefault();
            window.location.href = '../tela-inicial/index.html';
        };
    }
}

function checkWin() {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8], // linhas
        [0,3,6],[1,4,7],[2,5,8], // colunas
        [0,4,8],[2,4,6]          // diagonais
    ];
    for (let i = 0; i < wins.length; i++) {
        const [a, b, c] = wins[i];
        if (
            cells[a].textContent &&
            cells[a].textContent === cells[b].textContent &&
            cells[a].textContent === cells[c].textContent
        ) {
            return {comb: [a, b, c], idx: i};
        }
    }
    return null;
}

function drawWinLine(winResult) {
    // Mapeamento das posições das células para coordenadas SVG (ajuste fino)
    const yOffset = 20; // valor positivo desce a linha (leve ajuste)
    const xOffset = -5;  // valor positivo move para a direita (leve ajuste)
    const cellCoords = [
        [40 + xOffset, 40 + yOffset], [135 + xOffset, 40 + yOffset], [230 + xOffset, 40 + yOffset],
        [40 + xOffset, 135 + yOffset], [135 + xOffset, 135 + yOffset], [230 + xOffset, 135 + yOffset],
        [40 + xOffset, 230 + yOffset], [135 + xOffset, 230 + yOffset], [230 + xOffset, 230 + yOffset]
    ];
    const [a, , c] = winResult.comb;
    const [x1, y1] = cellCoords[a];
    const [x2, y2] = cellCoords[c];
    winLine.innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e53935" stroke-width="8" stroke-linecap="round" />`;
    winLine.style.display = 'block';
}

// Botão de reiniciar agora é tratado no showVictoryModal

// Inicializa o jogo ao carregar
createBoard();
