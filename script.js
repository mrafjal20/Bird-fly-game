const game = document.querySelector(".game");
const bird = document.querySelector(".bird-png");

const scoreElement = document.querySelector("#score");
const overlay = document.querySelector("#overlay");

const startBtn = document.querySelector("#start-btn");
const gameTitle = document.querySelector("#game-title");
const gameMessage = document.querySelector("#game-message");

let birdTop;
let birdVelocity;

let gravity = 800;
let jumpStrength = -350;

let pipes = [];
let score = 0;

let gameStarted = false;
let isGameOver = false;

let lastTime = 0;
let pipeTimer = 0;

const pipeSpeed = 120;
const pipeGap = 220;
const pipeWidth = 60;


// Game Start

function startGame() {

    pipes.forEach(pipe => {
        pipe.top.remove();
        pipe.bottom.remove();
    });

    pipes = [];

    score = 0;
    pipeTimer = 0;

    scoreElement.innerText = score;

    birdTop = game.clientHeight * 0.4;
    birdVelocity = 0;

    bird.style.top = birdTop + "px";
    bird.style.transform = "rotate(0deg)";

    gameStarted = true;
    isGameOver = false;

    overlay.style.display = "none";

    lastTime = 0;

    requestAnimationFrame(gameLoop);
}


// Bird Jump

function jump() {

    if (!gameStarted && !isGameOver) {
        startGame();
        birdVelocity = jumpStrength;
        return;
    }

    if (isGameOver) return;

    birdVelocity = jumpStrength;
}


// Create Pipes

function createPipe() {

    const gameHeight = game.clientHeight;
    const groundHeight = 25;

    const minPipeHeight = 40;

    const availableHeight = gameHeight - groundHeight - pipeGap;

    const topHeight = Math.random() *
        (availableHeight - minPipeHeight * 2) + minPipeHeight;

    const bottomHeight = availableHeight - topHeight;

    const topPipe = document.createElement("div");
    const bottomPipe = document.createElement("div");

    topPipe.className = "pipe top";
    bottomPipe.className = "pipe bottom";

    topPipe.style.height = topHeight + "px";
    bottomPipe.style.height = bottomHeight + "px";

    topPipe.style.top = "0px";
    bottomPipe.style.bottom = "25px";

    topPipe.style.left = game.clientWidth + "px";
    bottomPipe.style.left = game.clientWidth + "px";

    game.append(topPipe, bottomPipe);

    pipes.push({
        top: topPipe,
        bottom: bottomPipe,
        left: game.clientWidth,
        passed: false
    });
}


// Collision Detection

function checkCollision(birdRect, pipeRect) {

    const padding = 8;

    return (
        birdRect.right - padding > pipeRect.left &&
        birdRect.left + padding < pipeRect.right &&
        birdRect.bottom - padding > pipeRect.top &&
        birdRect.top + padding < pipeRect.bottom
    );
}


// Game Over

function gameOver() {

    if (isGameOver) return;

    isGameOver = true;
    gameStarted = false;

    gameTitle.innerText = "Game Over!";

    gameMessage.innerText = `Your Score: ${score}`;

    startBtn.innerText = "Play Again";

    overlay.style.display = "flex";
}


// Game Loop

function gameLoop(timestamp) {

    if (!gameStarted || isGameOver) return;

    const deltaTime = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.05)
        : 0;

    lastTime = timestamp;


    // Bird Gravity

    birdVelocity += gravity * deltaTime;

    birdTop += birdVelocity * deltaTime;

    bird.style.top = birdTop + "px";

    bird.style.transform =
        `rotate(${Math.min(birdVelocity * 0.06, 35)}deg)`;


    const birdRect = bird.getBoundingClientRect();

    const gameRect = game.getBoundingClientRect();


    // Boundary Collision

    if (
        birdRect.top <= gameRect.top ||
        birdRect.bottom >= gameRect.bottom - 25
    ) {
        gameOver();
        return;
    }


    // Pipe Creation

    pipeTimer += deltaTime;

    if (pipeTimer >= 2.2) {

        createPipe();

        pipeTimer = 0;
    }


    // Move Pipes

    pipes.forEach((pipe, index) => {

        pipe.left -= pipeSpeed * deltaTime;

        pipe.top.style.left = pipe.left + "px";
        pipe.bottom.style.left = pipe.left + "px";


        const topRect = pipe.top.getBoundingClientRect();
        const bottomRect = pipe.bottom.getBoundingClientRect();


        // Collision

        if (
            checkCollision(birdRect, topRect) ||
            checkCollision(birdRect, bottomRect)
        ) {
            gameOver();
            return;
        }


        // Score

        if (!pipe.passed && pipe.left + pipeWidth < 80) {

            score++;

            scoreElement.innerText = score;

            pipe.passed = true;
        }


        // Remove Pipes

        if (pipe.left < -pipeWidth) {

            pipe.top.remove();
            pipe.bottom.remove();

            pipes.splice(index, 1);
        }

    });


    if (gameStarted) {
        requestAnimationFrame(gameLoop);
    }
}


// Keyboard Controls

document.addEventListener("keydown", (e) => {

    if (e.code === "Space" || e.code === "ArrowUp") {

        e.preventDefault();

        if (e.repeat) return;

        jump();
    }

});


// Mobile / Mouse Controls

game.addEventListener("pointerdown", (e) => {

    if (e.target.closest("#start-btn")) return;

    jump();

});


// Start Button

startBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    gameTitle.innerText = "Flappy Bird";

    startGame();

});


// Initial Position

birdTop = game.clientHeight * 0.4;

bird.style.top = birdTop + "px";