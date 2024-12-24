// Game settings
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');
CANVAS.width = 800;
CANVAS.height = 600;

// Load images
const IMAGES = {
    player: document.getElementById('playerImg'),
    coin: document.getElementById('coinImg'),
    enemy: document.getElementById('enemyImg'),
    background: document.getElementById('backgroundImg'),
    attack: document.getElementById('fireballImg')
};

// Initial settings
const INITIAL_SETTINGS = {
    x: 100,
    y: 300,
    health: 100,
    score: 0
};

// Player settings
const PLAYER = {
    x: INITIAL_SETTINGS.x,
    y: INITIAL_SETTINGS.y,
    width: 75,
    height: 75,
    speed: 5,
    jumpForce: -15,
    gravity: 0.35,
    onGround: false,
    velocityY: 0,
    velocityX: 0,
    health: INITIAL_SETTINGS.health,
    score: INITIAL_SETTINGS.score,
    canJump: true,
    isAttacking: false,
    attackCooldown: 0,
    attackX: 0,
    attackY: 0,
    facingRight: true
};

// Attack settings
const ATTACK = {
    width: 40,
    height: 40,
    speed: 15,
    cooldown: 30
};

// Game objects arrays
let coins = [];
let enemies = [];
let pits = [];

// Sound settings
let soundEnabled = true;
let musicStarted = false;

// Load sounds
const backgroundMusic = document.getElementById('backgroundMusic');
const jumpSound = document.getElementById('jumpSound');
const hitSound = document.getElementById('hitSound');

// Sound volume settings
backgroundMusic.volume = 0.4;
jumpSound.volume = 0.6;
hitSound.volume = 0.6;

// Initialize sounds
function initSounds() {
    if (!musicStarted && soundEnabled && backgroundMusic) {
        musicStarted = true;
        backgroundMusic.currentTime = 0;
        let playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented:", error);
                musicStarted = false;
            });
        }
    }
}

// Play sound with error handling
function playSound(sound) {
    if (soundEnabled && sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log("Error playing sound:", error);
        });
    }
}

// Sound control
const soundButton = document.getElementById('soundToggle');
soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundButton.textContent = soundEnabled ? '🔊' : '🔈';
    if (soundEnabled) {
        if (!musicStarted) {
            initSounds();
        } else {
            backgroundMusic.play();
        }
    } else {
        backgroundMusic.pause();
    }
});

// Controls
const keys = {
    left: false,
    right: false,
    jump: false,
    attack: false
};

// Key handlers
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = true;
            PLAYER.facingRight = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = true;
            PLAYER.facingRight = true;
            break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            if (PLAYER.onGround) {
                keys.jump = true;
                PLAYER.velocityY = PLAYER.jumpForce;
                playSound(jumpSound);
            }
            break;
        case 'KeyX':
            if (!PLAYER.isAttacking && PLAYER.attackCooldown <= 0) {
                keys.attack = true;
                PLAYER.isAttacking = true;
                PLAYER.attackCooldown = ATTACK.cooldown;
                if (PLAYER.facingRight) {
                    PLAYER.attackX = PLAYER.x + PLAYER.width;
                } else {
                    PLAYER.attackX = PLAYER.x - ATTACK.width;
                }
                PLAYER.attackY = PLAYER.y + PLAYER.height/4;
                playSound(hitSound);
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = false;
            break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            keys.jump = false;
            break;
        case 'KeyX':
            keys.attack = false;
            break;
    }
});

// Object generators
function createCoin() {
    return {
        x: Math.random() * (CANVAS.width - 30),
        y: Math.random() * (CANVAS.height - 200) + 50,
        width: 50,
        height: 50
    };
}

function createEnemy() {
    return {
        x: CANVAS.width,
        y: CANVAS.height - 150,
        width: 160,
        height: 160,
        speed: 2
    };
}

function createPit() {
    return {
        x: Math.random() * (CANVAS.width - 100),
        y: CANVAS.height - 20,
        width: 100,
        height: 20
    };
}

// Game initialization
function initGame() {
    // Reset player
    PLAYER.x = INITIAL_SETTINGS.x;
    PLAYER.y = INITIAL_SETTINGS.y;
    PLAYER.health = INITIAL_SETTINGS.health;
    PLAYER.score = INITIAL_SETTINGS.score;
    PLAYER.velocityX = 0;
    PLAYER.velocityY = 0;
    PLAYER.onGround = false;
    
    // Clear arrays
    coins = [];
    enemies = [];
    pits = [];
    
    // Create initial objects
    for (let i = 0; i < 5; i++) {
        coins.push(createCoin());
    }
    enemies.push(createEnemy());
    pits.push(createPit());
    
    // Update interface
    updateScore();
    updateHealth();
    
    // Hide game over screen
    document.getElementById('gameOver').classList.add('hidden');
    
    // Start music
    initSounds();
}

// Update game state
function updateGame() {
    // Player movement
    if (keys.left && PLAYER.x > 0) PLAYER.velocityX = -PLAYER.speed;
    if (keys.right && PLAYER.x < CANVAS.width - PLAYER.width) PLAYER.velocityX = PLAYER.speed;
    if (!keys.left && !keys.right) {
        PLAYER.velocityX *= 0.8;
        if (Math.abs(PLAYER.velocityX) < 0.1) PLAYER.velocityX = 0;
    }

    // Update attack cooldown
    if (PLAYER.attackCooldown > 0) {
        PLAYER.attackCooldown--;
    }

    // Apply gravity
    PLAYER.velocityY += PLAYER.gravity;
    PLAYER.y += PLAYER.velocityY;
    PLAYER.x += PLAYER.velocityX;

    // Ground collision
    if (PLAYER.y + PLAYER.height > CANVAS.height) {
        PLAYER.y = CANVAS.height - PLAYER.height;
        PLAYER.velocityY = 0;
        PLAYER.onGround = true;
    } else {
        PLAYER.onGround = false;
    }

    // Keep player in bounds
    if (PLAYER.x < 0) {
        PLAYER.x = 0;
        PLAYER.velocityX = 0;
    }
    if (PLAYER.x + PLAYER.width > CANVAS.width) {
        PLAYER.x = CANVAS.width - PLAYER.width;
        PLAYER.velocityX = 0;
    }

    // Coin collisions
    coins = coins.filter(coin => {
        if (checkCollision(PLAYER, coin)) {
            PLAYER.score += 1;
            updateScore();
            return false;
        }
        return true;
    });

    // Enemy collisions
    enemies.forEach(enemy => {
        if (checkCollision(PLAYER, enemy)) {
            takeDamage();
        }
        enemy.x -= enemy.speed;
        if (enemy.x + enemy.width < 0) {
            enemy.x = CANVAS.width;
        }
    });
    // Enemy collisions and movement
    enemies = enemies.filter(enemy => {
        if (!enemy.isDead) {
            enemy.x -= enemy.speed;
            
            // Если враг ушел за экран, перемещаем его в начало
            if (enemy.x + enemy.width < 0) {
                enemy.x = CANVAS.width + Math.random() * 200;
                return true;
            }

            if (checkCollision(PLAYER, enemy)) {
                if (PLAYER.velocityY > 0 && PLAYER.y + PLAYER.height < enemy.y + enemy.height/2) {
                    enemy.isDead = true;
                    PLAYER.velocityY = PLAYER.jumpForce;
                    PLAYER.score += 2;
                    updateScore();
                    playSound(hitSound);
                } else {
                    takeDamage();
                }
            }
        } else {
            // Если враг убит, создаем нового справа
            enemy.isDead = false;
            enemy.x = CANVAS.width + Math.random() * 200;
        }
        return true;
    });
    // Pit collisions
    pits.forEach(pit => {
        if (checkCollision(PLAYER, pit)) {
            fallIntoPit();
        }
    });

    // Add new coins if needed
    if (coins.length < 3) {
        coins.push(createCoin());
    }

    // Update attack position if attacking
    if (PLAYER.isAttacking) {
        if (PLAYER.facingRight) {
            PLAYER.attackX += ATTACK.speed;
            if (PLAYER.attackX > CANVAS.width) {
                PLAYER.isAttacking = false;
            }
        } else {
            PLAYER.attackX -= ATTACK.speed;
            if (PLAYER.attackX < -ATTACK.width) {
                PLAYER.isAttacking = false;
            }
        }

        // Проверяем попадание атаки по врагам
        enemies.forEach(enemy => {
            if (checkCollision(
                {x: PLAYER.attackX, y: PLAYER.attackY, width: ATTACK.width, height: ATTACK.height},
                enemy
            )) {
                enemy.x = CANVAS.width;
                PLAYER.score += 2;
                updateScore();
                playSound(hitSound);
            }
        });
    }
}

// Draw game
function drawGame() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

    // Draw background
    if (IMAGES.background) {
        CTX.drawImage(IMAGES.background, 0, 0, CANVAS.width, CANVAS.height);
    }

    // Draw player
    if (IMAGES.player) {
        CTX.save();
        if (!PLAYER.facingRight) {
            CTX.scale(-1, 1);
            CTX.drawImage(IMAGES.player, -PLAYER.x - PLAYER.width, PLAYER.y, PLAYER.width, PLAYER.height);
        } else {
            CTX.drawImage(IMAGES.player, PLAYER.x, PLAYER.y, PLAYER.width, PLAYER.height);
        }
        CTX.restore();
    }
    
    // Draw attack effect if attacking
    if (PLAYER.isAttacking && IMAGES.attack) {
        CTX.save();
        if (PLAYER.facingRight) {
            CTX.drawImage(IMAGES.attack, PLAYER.attackX, PLAYER.attackY, ATTACK.width, ATTACK.height);
        } else {
            CTX.scale(-1, 1);
            CTX.drawImage(IMAGES.attack, -PLAYER.attackX - ATTACK.width, PLAYER.attackY, ATTACK.width, ATTACK.height);
        }
        CTX.restore();
    }

    // Draw coins
    if (IMAGES.coin) {
        coins.forEach(coin => {
            CTX.drawImage(IMAGES.coin, coin.x, coin.y, coin.width, coin.height);
        });
    }

    // Draw enemies
    if (IMAGES.enemy) {
        enemies.forEach(enemy => {
            CTX.drawImage(IMAGES.enemy, enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }

    // Draw pits
    CTX.fillStyle = 'rgba(0, 0, 0, 0.5)';
    pits.forEach(pit => {
        CTX.fillRect(pit.x, pit.y, pit.width, pit.height);
    });
}

// Helper functions
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function takeDamage() {
    PLAYER.health -= 2;
    playSound(hitSound);
    updateHealth();
    if (PLAYER.health <= 0) {
        gameOver();
    }
}

function fallIntoPit() {
    if (PLAYER.score >= 5) {
        PLAYER.score -= 5;
    } else {
        PLAYER.score = 0;
    }
    
    PLAYER.x = INITIAL_SETTINGS.x;
    PLAYER.y = INITIAL_SETTINGS.y;
    PLAYER.velocityX = 0;
    PLAYER.velocityY = 0;
    updateScore();
}

function updateScore() {
    document.getElementById('score').textContent = PLAYER.score;
    document.getElementById('finalScore').textContent = PLAYER.score;
}

function updateHealth() {
    document.getElementById('health').textContent = PLAYER.health;
}

function gameOver() {
    if (soundEnabled) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        musicStarted = false;
        playSound(hitSound);
    }
    document.getElementById('gameOver').classList.remove('hidden');
}

// Restart game
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
    initGame();
    gameLoop();
});

// Game loop
let animation;
function gameLoop() {
    if (PLAYER.health > 0) {
        updateGame();
        drawGame();
        animation = requestAnimationFrame(gameLoop);
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting game...');
    initGame();
    gameLoop();
}); 
