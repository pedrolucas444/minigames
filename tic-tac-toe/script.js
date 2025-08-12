const board = document.getElementById('game-board');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.querySelector('.menu-link');
const difficultySelect = document.getElementById('difficulty');

let cells = [];
let currentPlayer = 'X';
let gameActive = true;
let aiLevel = 'easy';

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
    statusDiv.textContent = `Sua vez!`;
    gameActive = true;
    currentPlayer = 'X';
}

difficultySelect.onchange = function() {
    aiLevel = difficultySelect.value;
    restartBtn.click();
};

function handleCellClick(e) {
    const cell = e.target;
    const index = +cell.dataset.index;
    if (!gameActive || cell.textContent) return;
    if (currentPlayer !== 'X') return;
    cell.textContent = 'X';
    if (checkWin('X')) {
        statusDiv.textContent = 'Você venceu!';
        gameActive = false;
        return;
    }
    if (cells.every(c => c.textContent)) {
        statusDiv.textContent = 'Empate!';
        gameActive = false;
        return;
    }
    currentPlayer = 'O';
    statusDiv.textContent = 'Vez do robô...';
    setTimeout(aiMove, 500);
}

function aiMove() {
    let move;
    if (aiLevel === 'easy') move = randomMove();
    else if (aiLevel === 'medium') move = mediumMove();
    else move = hardMove();
    if (move !== undefined) {
        cells[move].textContent = 'O';
        if (checkWin('O')) {
            statusDiv.textContent = 'Robô venceu!';
            gameActive = false;
            return;
        }
        if (cells.every(c => c.textContent)) {
            statusDiv.textContent = 'Empate!';
            gameActive = false;
            return;
        }
    }
    currentPlayer = 'X';
    statusDiv.textContent = 'Sua vez!';
}

function randomMove() {
    const empty = cells.map((c, i) => c.textContent ? null : i).filter(i => i !== null);
    if (empty.length === 0) return;
    return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove() {
    // Tenta ganhar
    for (let i = 0; i < 9; i++) {
        if (!cells[i].textContent) {
            cells[i].textContent = 'O';
            if (checkWin('O')) { cells[i].textContent = ''; return i; }
            cells[i].textContent = '';
        }
    }
    // Bloqueia o jogador
    for (let i = 0; i < 9; i++) {
        if (!cells[i].textContent) {
            cells[i].textContent = 'X';
            if (checkWin('X')) { cells[i].textContent = ''; return i; }
            cells[i].textContent = '';
        }
    }
    // Aleatório
    return randomMove();
}

function hardMove() {
    // Minimax
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (!cells[i].textContent) {
            cells[i].textContent = 'O';
            let score = minimax(cells, 0, false);
            cells[i].textContent = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(boardCells, depth, isMax) {
    if (checkWin('O', boardCells)) return 10 - depth;
    if (checkWin('X', boardCells)) return depth - 10;
    if ([...boardCells].every(c => c.textContent)) return 0;
    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!boardCells[i].textContent) {
                boardCells[i].textContent = 'O';
                best = Math.max(best, minimax(boardCells, depth + 1, false));
                boardCells[i].textContent = '';
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!boardCells[i].textContent) {
                boardCells[i].textContent = 'X';
                best = Math.min(best, minimax(boardCells, depth + 1, true));
                boardCells[i].textContent = '';
            }
        }
        return best;
    }
}

function checkWin(player, customCells) {
    const c = customCells || cells;
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return wins.some(([a,b,c2]) =>
        c[a].textContent === player &&
        c[b].textContent === player &&
        c[c2].textContent === player
    );
}

restartBtn.onclick = function() {
    createBoard();
};
menuBtn.onclick = function(e) {
    e.preventDefault();
    window.location.href = '../tela-inicial/index.html';
};

// Inicializa o jogo ao carregar
createBoard();
