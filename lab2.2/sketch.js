let player;
let platforms = [];
let enemies = [];
let coins = [];
let bullets = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let enemyRespawnTime = 5000;
let bgSound, coinSound, rainSound;
let playerDirection = 1;
let bgVolumeSlider, rainVolumeSlider, coinVolumeSlider;
let isMuted = false;

function preload() {
    bgSound = loadSound('background.mp3');
    coinSound = loadSound('coin.mp3');
    rainSound = loadSound('rain.mp3');
}

function setup() {
    createCanvas(800, 600);

    bgSound.setVolume(0.20);
    bgSound.loop();
    coinSound.setVolume(0.10);
    rainSound.setVolume(0.30);
    rainSound.loop();

    bgVolumeSlider = createSlider(0, 1, 0.20, 0.01);
    bgVolumeSlider.position(width + 20, 20);
    rainVolumeSlider = createSlider(0, 1, 0.30, 0.01);
    rainVolumeSlider.position(width + 20, 60);
    coinVolumeSlider = createSlider(0, 1, 0.10, 0.01);
    coinVolumeSlider.position(width + 20, 100);
}

function draw() {
    background(30, 30, 46);

    if (!gameStarted) {
        startScreen();
        return;
    }

    if (gameOver) {
        gameOverScreen();
        return;
    }

    bgSound.setVolume(bgVolumeSlider.value());
    rainSound.setVolume(rainVolumeSlider.value());
    coinSound.setVolume(coinVolumeSlider.value());

    platforms.forEach(platform => platform.show());
    player.update();
    player.show();

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        enemies[i].show();
        if (enemies[i].collidesWith(player)) {
            gameOver = true;
            rainSound.stop();
            bgSound.stop();
        }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        coins[i].show();
        if (coins[i].collidesWith(player)) {
            score++;
            coins.splice(i, 1);
            spawnCoin();
            coinSound.play();
        }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].show();
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].collidesWith(enemies[j])) {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                setTimeout(spawnEnemy, enemyRespawnTime);
                break;
            }
        }
    }

    textSize(24);
    fill(255);
    text(`Score: ${score}`, 70, 30);
}

function startScreen() {
    textSize(32);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Кликните мышкой, чтобы начать игру", width / 2, height / 2 - 50);

    if (mouseIsPressed) {
        gameStarted = true;
        startGame();
    }
}

function gameOverScreen() {
    textSize(32);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2 - 50);
    textSize(24);
    fill(255);
    text("Кликните мышкой, чтобы перезапустить", width / 2, height / 2);

    if (mouseIsPressed) {
        resetGame();
    }
}

function startGame() {
    player = new Player();

    platforms.push(new Platform(0, height - 50, width, 50));
    platforms.push(new Platform(200, height - 150, 200, 20));
    platforms.push(new Platform(500, height - 250, 200, 20));

    spawnEnemy();
    spawnCoin();

    bgSound.loop();
}

function resetGame() {
    gameOver = false;
    gameStarted = true;
    score = 0;
    player = new Player();
    platforms = [];
    enemies = [];
    coins = [];
    bullets = [];

    platforms.push(new Platform(0, height - 50, width, 50));
    platforms.push(new Platform(200, height - 150, 200, 20));
    platforms.push(new Platform(500, height - 250, 200, 20));

    spawnEnemy();
    spawnCoin();

    rainSound.loop();
    bgSound.loop();
}

function keyPressed() {
    if (keyCode === 32) {
        player.jump();
    } else if (keyCode === LEFT_ARROW) {
        player.move(-1);
        playerDirection = -1;
    } else if (keyCode === RIGHT_ARROW) {
        player.move(1);
        playerDirection = 1;
    } else if (keyCode === 70) {
        bullets.push(new Bullet(player.x + player.w / 2, player.y, 10 * playerDirection));
    } else if (keyCode === 77) {
        isMuted = !isMuted;
        if (isMuted) {
            bgSound.setVolume(0);
            rainSound.setVolume(0);
            coinSound.setVolume(0);
        } else {
            bgSound.setVolume(bgVolumeSlider.value());
            rainSound.setVolume(rainVolumeSlider.value());
            coinSound.setVolume(coinVolumeSlider.value());
        }
    }
}

function spawnEnemy() {
    let platform = random(platforms);
    let x = random(platform.x, platform.x + platform.w - 40);
    let y = platform.y - 40;
    enemies.push(new Enemy(x, y, platform.x, platform.x + platform.w));
}

function spawnCoin() {
    let platform = random(platforms);
    let x = random(platform.x, platform.x + platform.w - 20);
    let y = platform.y - 20;
    coins.push(new Coin(x, y));
}

class Player {
    constructor() {
        this.x = 50;
        this.y = height - 100;
        this.w = 40;
        this.h = 40;
        this.vy = 0;
        this.vx = 0;
        this.gravity = 0.5;
        this.jumpForce = -10;
        this.onGround = false;
    }

    update() {
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        this.onGround = false;
        for (let platform of platforms) {
            if (this.collidesWith(platform)) {
                this.vy = 0;
                this.y = platform.y - this.h;
                this.onGround = true;
            }
        }

        this.x = constrain(this.x, 0, width - this.w);
    }

    show() {
        fill(100, 150, 255);
        rect(this.x, this.y, this.w, this.h);
    }

    jump() {
        if (this.onGround) {
            this.vy = this.jumpForce;
        }
    }

    move(dir) {
        this.vx = dir * 5;
    }

    collidesWith(obj) {
        return !(this.x + this.w < obj.x ||
                 this.x > obj.x + obj.w ||
                 this.y + this.h < obj.y ||
                 this.y > obj.y + obj.h);
    }
}

class Platform {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    show() {
        fill(70, 70, 90);
        rect(this.x, this.y, this.w, this.h);
    }
}

class Enemy {
    constructor(x, y, leftBound, rightBound) {
        this.x = x;
        this.y = y;
        this.w = 40;
        this.h = 40;
        this.vx = 2;
        this.leftBound = leftBound;
        this.rightBound = rightBound;
    }

    update() {
        this.x += this.vx;

        if (this.x < this.leftBound || this.x + this.w > this.rightBound) {
            this.vx *= -1;
        }
    }

    show() {
        fill(255, 100, 100);
        rect(this.x, this.y, this.w, this.h);
    }

    collidesWith(obj) {
        return !(this.x + this.w < obj.x ||
                 this.x > obj.x + obj.w ||
                 this.y + this.h < obj.y ||
                 this.y > obj.y + obj.h);
    }
}

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 20;
    }

    show() {
        fill(255, 215, 0);
        ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w, this.h);
    }

    collidesWith(obj) {
        return !(this.x + this.w < obj.x ||
                 this.x > obj.x + obj.w ||
                 this.y + this.h < obj.y ||
                 this.y > obj.y + obj.h);
    }
}

class Bullet {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.w = 10;
        this.h = 5;
        this.speed = speed;
    }

    update() {
        this.x += this.speed;
    }

    show() {
        fill(255, 255, 0);
        rect(this.x, this.y, this.w, this.h);
    }

    collidesWith(obj) {
        return !(this.x + this.w < obj.x ||
                 this.x > obj.x + obj.w ||
                 this.y + this.h < obj.y ||
                 this.y > obj.y + obj.h);
    }
}