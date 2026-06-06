const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score-val");
const levelEl = document.getElementById("level-val");
const livesEl = document.getElementById("lives-val");
const overlay = document.getElementById("overlay");
const mainTitle = document.getElementById("main-title");
const subTitle = document.getElementById("sub-title");
const startBtn = document.getElementById("start-btn");

const tileSize = 20;
const mapWidth = 22;
const mapHeight = 22;

let score = 0;
let level = 1;
let maxLevels = 20;
let lives = 3;
let gameRunning = false;
let animationId;

// 1 = Wall, 0 = Dot, 2 = Empty Space
const originalMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1,1],
    [2,2,2,2,1,0,1,1,2,2,2,2,2,2,1,1,0,1,2,2,2,2],
    [1,1,1,1,1,0,1,1,2,1,1,1,1,2,1,1,0,1,1,1,1,1],
    [2,2,2,2,2,0,2,2,2,1,2,2,1,2,2,2,0,2,2,2,2,2],
    [1,1,1,1,1,0,1,1,2,1,1,1,1,2,1,1,0,1,1,1,1,1],
    [2,2,2,2,1,0,1,1,2,2,2,2,2,2,1,1,0,1,2,2,2,2],
    [1,1,1,1,1,0,1,1,2,1,1,1,1,2,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,2,2,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,0,1,1,1,1,0,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let currentMap = [];

let pacman = {
    x: 10 * tileSize, y: 16 * tileSize,
    dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0,
    speed: 2, angle: 0.2
};

let ghosts = [];
const ghostColors = ['#ff3333', '#33f0ff', '#ffb8ff', '#ffb852'];

function initMap() {
    currentMap = JSON.parse(JSON.stringify(originalMap));
}

function initEntities() {
    pacman.x = 10 * tileSize;
    pacman.y = 16 * tileSize;
    pacman.dirX = 0; pacman.dirY = 0; pacman.nextDirX = 0; pacman.nextDirY = 0;

    // Use speeds that perfectly divide 20 (tileSize) to prevent getting stuck
    let baseSpeed = 1;
    if (level >= 5) baseSpeed = 1.25;
    if (level >= 10) baseSpeed = 2;
    if (level >= 15) baseSpeed = 2.5;
    
    ghosts = [
        { x: 9 * tileSize, y: 10 * tileSize, dirX: 1, dirY: 0, color: ghostColors[0], speed: baseSpeed },
        { x: 10 * tileSize, y: 10 * tileSize, dirX: -1, dirY: 0, color: ghostColors[1], speed: baseSpeed },
        { x: 11 * tileSize, y: 10 * tileSize, dirX: 0, dirY: -1, color: ghostColors[2], speed: baseSpeed },
        { x: 10 * tileSize, y: 9 * tileSize, dirX: 0, dirY: 1, color: ghostColors[3], speed: baseSpeed }
    ];
}

// Arrow Keys Control
window.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"];
    if (validKeys.includes(e.key)) e.preventDefault(); // Prevents page scroll

    if (e.key === "ArrowUp" || e.key === "w") pacman.nextDirX = 0, pacman.nextDirY = -1;
    if (e.key === "ArrowDown" || e.key === "s") pacman.nextDirX = 0, pacman.nextDirY = 1;
    if (e.key === "ArrowLeft" || e.key === "a") pacman.nextDirX = -1, pacman.nextDirY = 0;
    if (e.key === "ArrowRight" || e.key === "d") pacman.nextDirX = 1, pacman.nextDirY = 0;
}, { passive: false });

// Mobile Touch Controls
const setDir = (x, y) => { pacman.nextDirX = x; pacman.nextDirY = y; };
document.getElementById("btn-up").addEventListener("touchstart", (e) => { e.preventDefault(); setDir(0, -1); });
document.getElementById("btn-down").addEventListener("touchstart", (e) => { e.preventDefault(); setDir(0, 1); });
document.getElementById("btn-left").addEventListener("touchstart", (e) => { e.preventDefault(); setDir(-1, 0); });
document.getElementById("btn-right").addEventListener("touchstart", (e) => { e.preventDefault(); setDir(1, 0); });

function checkWallCollision(x, y) {
    let tileX = Math.floor(x / tileSize);
    let tileY = Math.floor(y / tileSize);
    if (tileX < 0 || tileX >= mapWidth) return false; // Tunnel edges
    return currentMap[tileY][tileX] === 1;
}

function processEntityMovement(entity, isPacman) {
    // Allows instant reverse
    if (entity.nextDirX === -entity.dirX && entity.nextDirY === -entity.dirY) {
        entity.dirX = entity.nextDirX; entity.dirY = entity.nextDirY;
    }

    // Move
    entity.x += entity.dirX * entity.speed;
    entity.y += entity.dirY * entity.speed;

    // Tunnel wrapping
    if (entity.x < 0) entity.x = canvas.width - entity.speed;
    if (entity.x >= canvas.width) entity.x = 0;

    // Check if exactly on a grid square (Safe Intersection)
    if (entity.x % tileSize === 0 && entity.y % tileSize === 0) {
        
        if (isPacman) {
            // Check if user requested a turn
            if (entity.nextDirX !== 0 || entity.nextDirY !== 0) {
                let testX = entity.x + entity.nextDirX * tileSize;
                let testY = entity.y + entity.nextDirY * tileSize;
                if (!checkWallCollision(testX, testY)) {
                    entity.dirX = entity.nextDirX;
                    entity.dirY = entity.nextDirY;
                }
            }
            // Stop if hitting a wall forward
            if (checkWallCollision(entity.x + entity.dirX * tileSize, entity.y + entity.dirY * tileSize)) {
                entity.dirX = 0; entity.dirY = 0;
            }

            // Eat dots exactly on grid center
            let cx = entity.x / tileSize;
            let cy = entity.y / tileSize;
            if (cx >= 0 && cx < mapWidth && currentMap[cy][cx] === 0) {
                currentMap[cy][cx] = 2;
                score += 10;
                scoreEl.innerText = score;
                checkWinCondition();
            }
        } else {
            // Ghost AI Intersections
            let possibleDirs = [];
            const directions = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
            
            directions.forEach(d => {
                if (d.x === -entity.dirX && d.y === -entity.dirY) return; // Don't reverse
                if (!checkWallCollision(entity.x + d.x * tileSize, entity.y + d.y * tileSize)) {
                    possibleDirs.push(d);
                }
            });

            if (possibleDirs.length === 0) possibleDirs.push({x: -entity.dirX, y: -entity.dirY});

            // Target chasing increases slightly by level
            let chaseProb = 0.2 + (level * 0.03); 
            if (Math.random() < chaseProb && possibleDirs.length > 0) {
                possibleDirs.sort((a, b) => {
                    let distA = Math.hypot((entity.x + a.x*tileSize) - pacman.x, (entity.y + a.y*tileSize) - pacman.y);
                    let distB = Math.hypot((entity.x + b.x*tileSize) - pacman.x, (entity.y + b.y*tileSize) - pacman.y);
                    return distA - distB;
                });
                entity.dirX = possibleDirs[0].x;
                entity.dirY = possibleDirs[0].y;
            } else {
                let finalDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                entity.dirX = finalDir.x;
                entity.dirY = finalDir.y;
            }
        }
    }
}

function handlePlayerDeath() {
    lives--;
    livesEl.innerText = lives;
    if (lives <= 0) endGame(false);
    else {
        // Pause briefly before resetting positions
        gameRunning = false;
        setTimeout(() => {
            initEntities();
            pacman.dirX = -1; // Give him a starting push
            gameRunning = true;
            gameLoop();
        }, 1000);
    }
}

function checkWinCondition() {
    let dotsLeft = currentMap.some(row => row.includes(0));
    if (!dotsLeft) {
        gameRunning = false;
        if (level < maxLevels) {
            level++;
            levelEl.innerText = `${level}/${maxLevels}`;
            setTimeout(() => {
                initMap();
                initEntities();
                pacman.dirX = -1;
                gameRunning = true;
                gameLoop();
            }, 1500);
        } else {
            endGame(true);
        }
    }
}

function drawMap() {
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            if (currentMap[r][c] === 1) {
                ctx.fillStyle = "#121230";
                ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                ctx.strokeStyle = "#00ffcc";
                ctx.lineWidth = 1;
                ctx.strokeRect(c * tileSize + 1, r * tileSize + 1, tileSize - 2, tileSize - 2);
            } else if (currentMap[r][c] === 0) {
                ctx.beginPath();
                ctx.arc(c * tileSize + tileSize/2, r * tileSize + tileSize/2, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#ff00ff";
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#ff00ff";
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
}

function drawPacman() {
    ctx.beginPath();
    let rotation = 0;
    if (pacman.dirX === 1) rotation = 0;
    if (pacman.dirX === -1) rotation = Math.PI;
    if (pacman.dirY === 1) rotation = Math.PI / 2;
    if (pacman.dirY === -1) rotation = Math.PI * 1.5;

    pacman.angle += 0.05; // Slightly faster mouth animation
    let mouthSize = Math.abs(Math.sin(pacman.angle)) * 0.2;

    // Adjusted to draw correctly from the top-left coordinate system
    ctx.arc(pacman.x + tileSize/2, pacman.y + tileSize/2, tileSize/2 - 2, rotation + mouthSize, rotation + Math.PI * 2 - mouthSize);
    ctx.lineTo(pacman.x + tileSize/2, pacman.y + tileSize/2);
    ctx.fillStyle = "#ffff00";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffff00";
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        let gx = ghost.x + tileSize/2;
        let gy = ghost.y + tileSize/2;

        ctx.beginPath();
        ctx.arc(gx, gy - 2, tileSize/2 - 1, Math.PI, 0, false);
        ctx.lineTo(gx + tileSize/2 - 1, gy + tileSize/2);
        ctx.lineTo(gx - tileSize/2 + 1, gy + tileSize/2);
        ctx.closePath();
        ctx.fillStyle = ghost.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ghost.color;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(gx - 4, gy - 3, 3, 0, Math.PI * 2);
        ctx.arc(gx + 4, gy - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Process Movements
    processEntityMovement(pacman, true);
    ghosts.forEach(ghost => processEntityMovement(ghost, false));
    
    // Check Hit Detection
    ghosts.forEach(ghost => {
        if (Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y) < tileSize - 2) {
            handlePlayerDeath();
        }
    });
    
    drawMap();
    drawPacman();
    drawGhosts();

    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    score = 0; level = 1; lives = 3;
    scoreEl.innerText = score;
    levelEl.innerText = `${level}/${maxLevels}`;
    livesEl.innerText = lives;
    
    overlay.style.opacity = "0";
    setTimeout(() => overlay.style.display = "none", 500);

    initMap();
    initEntities();
    pacman.dirX = -1; // Gets him moving instantly
    
    gameRunning = true;
    gameLoop();
}

function endGame(isWin) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    overlay.style.display = "flex";
    setTimeout(() => overlay.style.opacity = "1", 10);

    if (isWin) {
        mainTitle.innerText = "VICTORY";
        subTitle.innerText = `YOU BEAT ALL 20 LEVELS! SCORE: ${score}`;
        startBtn.innerText = "Play Again";
    } else {
        mainTitle.innerText = "GAME OVER";
        subTitle.innerText = `FINAL SCORE: ${score} (LEVEL ${level})`;
        startBtn.innerText = "Try Again";
    }
}
