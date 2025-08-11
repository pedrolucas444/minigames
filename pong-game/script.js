const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const winnerDiv = document.getElementById('winner');
const mouseBtn = document.getElementById('mouseBtn');
const keyboardBtn = document.getElementById('keyboardBtn');

let controlMode = null;
let animationId;

const paddleWidth = 15, paddleHeight = 90;
const player = { x: 10, y: canvas.height/2 - paddleHeight/2, w: paddleWidth, h: paddleHeight, score: 0, dy: 0 };
const bot = { x: canvas.width - paddleWidth - 10, y: canvas.height/2 - paddleHeight/2, w: paddleWidth, h: paddleHeight, score: 0, dy: 0 };
const ball = { x: canvas.width/2, y: canvas.height/2, r: 10, speed: 6, dx: 6, dy: 3 };

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
    // Meio
    for(let i=0; i<canvas.height; i+=30) drawRect(canvas.width/2-2, i, 4, 20, '#888');
    // Placar
    drawText(player.score, canvas.width/2-60, 50);
    drawText(bot.score, canvas.width/2+30, 50);
    // Raquetes
    drawRect(player.x, player.y, player.w, player.h);
    drawRect(bot.x, bot.y, bot.w, bot.h);
    // Bola
    drawCircle(ball.x, ball.y, ball.r);
}

function update() {
    // Jogador
    if(controlMode === 'keyboard') {
        player.y += player.dy;
        if(player.y < 0) player.y = 0;
        if(player.y + player.h > canvas.height) player.y = canvas.height - player.h;
    }
    // Bot
    let target = ball.y - bot.h/2;
    if(bot.y < target) bot.y += Math.min(5, target-bot.y);
    else if(bot.y > target) bot.y -= Math.min(5, bot.y-target);
    if(bot.y < 0) bot.y = 0;
    if(bot.y + bot.h > canvas.height) bot.y = canvas.height - bot.h;
    // Bola
    ball.x += ball.dx;
    ball.y += ball.dy;
    // Colisão topo/baixo
    if(ball.y-ball.r < 0 || ball.y+ball.r > canvas.height) ball.dy *= -1;
    // Colisão raquete jogador
    if(ball.x-ball.r < player.x+player.w && ball.y > player.y && ball.y < player.y+player.h) {
        ball.dx *= -1;
        ball.x = player.x+player.w+ball.r;
        // Calcula o ponto de impacto relativo (-1 topo, 0 meio, 1 base)
        let rel = ((ball.y - player.y) - player.h/2) / (player.h/2);
        ball.dy = rel * ball.speed;
        // Pequena aleatoriedade
        ball.dy += (Math.random()-0.5)*1.2;
    }
    // Colisão raquete bot
    if(ball.x+ball.r > bot.x && ball.y > bot.y && ball.y < bot.y+bot.h) {
        ball.dx *= -1;
        ball.x = bot.x-ball.r;
        let rel = ((ball.y - bot.y) - bot.h/2) / (bot.h/2);
        ball.dy = rel * ball.speed;
        ball.dy += (Math.random()-0.5)*1.2;
    }
    // Pontuação
    if(ball.x < 0) { bot.score++; resetBall(); }
    if(ball.x > canvas.width) { player.score++; resetBall(); }
}

function checkWinner() {
    if(player.score >= 7) return 'Você venceu!';
    if(bot.score >= 7) return 'O bot venceu!';
    return null;
}

function gameLoop() {
    update();
    draw();
    let win = checkWinner();
    if(win) {
        cancelAnimationFrame(animationId);
        canvas.style.display = 'none';
        // Mostrar tela de vencedor customizada
        const winnerText = document.getElementById('winner-text');
        const playAgainBtn = document.getElementById('playAgainBtn');
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        winnerText.innerText = win;
        winnerDiv.style.display = 'flex';
        winnerText.style.display = 'block';
        playAgainBtn.style.display = 'inline-block';
        mainMenuBtn.style.display = 'inline-block';
        // Remover listener antigo para evitar múltiplos
        playAgainBtn.onclick = function() {
            winnerDiv.style.display = 'none';
            playAgainBtn.style.display = 'none';
            mainMenuBtn.style.display = 'none';
            winnerText.style.display = 'none';
            canvas.style.display = 'block';
            player.score = 0;
            bot.score = 0;
            player.y = canvas.height/2 - paddleHeight/2;
            bot.y = canvas.height/2 - paddleHeight/2;
            resetBall();
            animationId = requestAnimationFrame(gameLoop);
        };
        mainMenuBtn.onclick = function() {
            window.location.href = '../tela-inicial/index.html';
        };
        return;
    }
    animationId = requestAnimationFrame(gameLoop);
}

function startGame(mode) {
    controlMode = mode;
    menu.style.display = 'none';
    canvas.style.display = 'block';
    winnerDiv.style.display = 'none';
    player.score = 0;
    bot.score = 0;
    player.y = canvas.height/2 - paddleHeight/2;
    bot.y = canvas.height/2 - paddleHeight/2;
    resetBall();
    if(controlMode === 'mouse') {
        canvas.addEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('keydown', keyDownHandler);
        window.removeEventListener('keyup', keyUpHandler);
    } else {
        window.addEventListener('keydown', keyDownHandler);
        window.addEventListener('keyup', keyUpHandler);
        canvas.removeEventListener('mousemove', mouseMoveHandler);
    }
    animationId = requestAnimationFrame(gameLoop);
}

function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.h/2;
    if(player.y < 0) player.y = 0;
    if(player.y + player.h > canvas.height) player.y = canvas.height - player.h;
}

function keyDownHandler(e) {
    if(e.key === 'ArrowUp' || e.key === 'w') player.dy = -8;
    if(e.key === 'ArrowDown' || e.key === 's') player.dy = 8;
}
function keyUpHandler(e) {
    if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ArrowDown' || e.key === 's') player.dy = 0;
}

mouseBtn.onclick = () => startGame('mouse');
keyboardBtn.onclick = () => startGame('keyboard');

// (Removido: reiniciar ao clicar no placar final, agora é feito pelos botões)
