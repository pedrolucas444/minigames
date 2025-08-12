const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('startModal');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

const onePlayerBtn = document.getElementById('onePlayerBtn');
const twoPlayersBtn = document.getElementById('twoPlayersBtn');
const difficultyBtns = document.querySelectorAll('.difficultyBtn');

const winnerDiv = document.getElementById('winner');
const winnerText = document.getElementById('winner-text');
const playAgainBtn = document.getElementById('playAgainBtn');
const mainMenuBtn = document.getElementById('mainMenuBtn');

let mode = null; // '1p' ou '2p'
let difficulty = null;
let animationId;

const paddleWidth = 15, paddleHeight = 90;
const player1 = { x: 10, y: canvas.height/2 - paddleHeight/2, w: paddleWidth, h: paddleHeight, score: 0, dy: 0 };
const player2 = { x: canvas.width - paddleWidth - 10, y: canvas.height/2 - paddleHeight/2, w: paddleWidth, h: paddleHeight, score: 0, dy: 0 };
const ball = { x: canvas.width/2, y: canvas.height/2, r: 10, speed: 6, dx: 6, dy: 3 };

let botSpeed = 4;

function setDifficulty(diff) {
    const speeds = { facil: 3, medio: 5, dificil: 7, impossivel: 10 };
    botSpeed = speeds[diff] || 5;
}

function resetBall() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * (Math.random()*4+2);
}

function drawRect(x, y, w, h, color='#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, color='#fff') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
}
function drawText(text, x, y, size=40, color='#fff') {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<canvas.height; i+=30) drawRect(canvas.width/2-2, i, 4, 20, '#888');
    drawText(player1.score, canvas.width/2-60, 50);
    drawText(player2.score, canvas.width/2+30, 50);
    drawRect(player1.x, player1.y, player1.w, player1.h);
    drawRect(player2.x, player2.y, player2.w, player2.h);
    drawCircle(ball.x, ball.y, ball.r);
}

function update() {
    player1.y += player1.dy;
    if(player1.y < 0) player1.y = 0;
    if(player1.y + player1.h > canvas.height) player1.y = canvas.height - player1.h;

    if(mode === '1p') {
        let target = ball.y - player2.h/2;
        if(player2.y < target) player2.y += Math.min(botSpeed, target-player2.y);
        else if(player2.y > target) player2.y -= Math.min(botSpeed, player2.y-target);
    } else {
        player2.y += player2.dy;
    }
    if(player2.y < 0) player2.y = 0;
    if(player2.y + player2.h > canvas.height) player2.y = canvas.height - player2.h;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if(ball.y-ball.r < 0 || ball.y+ball.r > canvas.height) ball.dy *= -1;

    // colisão player1
    if(ball.x-ball.r < player1.x+player1.w && ball.y > player1.y && ball.y < player1.y+player1.h) {
        ball.dx *= -1;
        ball.x = player1.x+player1.w+ball.r;
        let rel = ((ball.y - player1.y) - player1.h/2) / (player1.h/2);
        ball.dy = rel * ball.speed;
        ball.dy += (Math.random()-0.5)*1.2;
    }
    // colisão player2
    if(ball.x+ball.r > player2.x && ball.y > player2.y && ball.y < player2.y+player2.h) {
        ball.dx *= -1;
        ball.x = player2.x-ball.r;
        let rel = ((ball.y - player2.y) - player2.h/2) / (player2.h/2);
        ball.dy = rel * ball.speed;
        ball.dy += (Math.random()-0.5)*1.2;
    }

    if(ball.x < 0) { player2.score++; resetBall(); }
    if(ball.x > canvas.width) { player1.score++; resetBall(); }
}

function checkWinner() {
    if(player1.score >= 7) return mode === '1p' ? 'Você venceu!' : 'Jogador 1 venceu!';
    if(player2.score >= 7) return mode === '1p' ? 'O bot venceu!' : 'Jogador 2 venceu!';
    return null;
}

function gameLoop() {
    update();
    draw();
    let win = checkWinner();
    if(win) {
        cancelAnimationFrame(animationId);
        canvas.style.display = 'none';
        winnerText.innerText = win;
        winnerDiv.style.display = 'flex';
        return;
    }
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    modal.style.display = 'none';
    canvas.style.display = 'block';
    player1.score = 0;
    player2.score = 0;
    player1.y = canvas.height/2 - paddleHeight/2;
    player2.y = canvas.height/2 - paddleHeight/2;
    resetBall();
    animationId = requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
    if(e.key === 'w') player1.dy = -8;
    if(e.key === 's') player1.dy = 8;
    if(mode === '2p') {
        if(e.key === 'ArrowUp') player2.dy = -8;
        if(e.key === 'ArrowDown') player2.dy = 8;
    }
}
function keyUpHandler(e) {
    if(e.key === 'w' || e.key === 's') player1.dy = 0;
    if(mode === '2p') {
        if(e.key === 'ArrowUp' || e.key === 'ArrowDown') player2.dy = 0;
    }
}

window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// Botões do modal
onePlayerBtn.onclick = () => {
    mode = '1p';
    step1.style.display = 'none';
    step2.style.display = 'block';
};
twoPlayersBtn.onclick = () => {
    mode = '2p';
    startGame();
};
difficultyBtns.forEach(btn => {
    btn.onclick = () => {
        difficulty = btn.dataset.diff;
        setDifficulty(difficulty);
        startGame();
    };
});

// Botões de vencedor
playAgainBtn.onclick = () => {
    winnerDiv.style.display = 'none';
    startGame();
};
mainMenuBtn.onclick = () => {
    window.location.reload();
};
