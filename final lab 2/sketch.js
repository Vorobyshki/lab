let player;
let platforms = [];
let enemies = [];
let coins = [];
let bullets = [];
let pits = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let enemyRespawnTime = 5000;
let bgSound, coinSound, rainSound;
let playerDirection = 1;
let bgVolumeSlider, rainVolumeSlider, coinVolumeSlider;
let isMuted = false;
let showMenu = false;
let cameraOffset = 0;
let levelWidth = 1600;

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
    background(135, 205, 235);
    
    push();
    translate(-cameraOffset, 0);
    drawSun(100, 100);
    drawCloud(300, 80); 
    drawCloud(500, 50);
    drawCloud(700, 90);
    drawCloud(1100, 70);
    drawCloud(1400, 60);
    pop();

    if (showMenu) {
        displayMenu();
        return;
    }

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

    cameraOffset = constrain(player.x - width / 2, 0, levelWidth - width);
    
    push();
    translate(-cameraOffset, 0);

    platforms.forEach(platform => platform.show());
    pits.forEach(pit => pit.show());
    
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
    pop();

    textSize(24);
    fill(0);
    text(`Score: ${score}`,50, 20);
}

function drawSun(x, y) {
    noStroke();
    fill(255, 204, 0);
    ellipse(x, y, 80, 80);
}

function drawCloud(x, y) {
    fill(255);
    ellipse(x, y, 60, 40);
    ellipse(x + 20, y, 80, 50);
    ellipse(x - 20, y, 80, 50);
    ellipse(x + 10, y - 15, 70, 40);
}

function displayMenu() {
    background(30, 30, 46);
    textSize(32);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Меню", width / 2, height / 2 - 50);
    textSize(24);
    text("Регулировка громкости ->", width / 2, height / 2 - 10);
    text("ESC для возврата в игру", width / 2, height / 2 + 40);
    bgVolumeSlider.show();
    rainVolumeSlider.show();
    coinVolumeSlider.show();
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

    platforms.push(new Platform(0, height - 50, 300, 50));
    platforms.push(new Platform(350, height - 150, 200, 20));
    platforms.push(new Platform(600, height - 50, 200, 50));
    platforms.push(new Platform(850, height - 200, 200, 20)); // Изменена высота для доступности
    platforms.push(new Platform(1100, height - 50, 500, 50));
    
    
    pits.push(new Pit(800, height - 50, 50));
    pits.push(new Pit(1300, height - 50, 100));

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
    pits = [];

    startGame();
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
    } else if (keyCode === ESCAPE) {
        showMenu = !showMenu;
        if (showMenu) {
            noLoop();
        } else {
            loop();
        }
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
        this.jumpForce = -12;
        this.onGround = false;
        this.fallingToDeath = false;
        this.fallSpeed = 0;
    }

    update() {
        if (this.fallingToDeath) {
            this.fallSpeed += 0.2;
            this.y += this.fallSpeed;
            if (this.y > height + 100) {
                gameOver = true;
                rainSound.stop();
                bgSound.stop();
            }
            return;
        }

        let inPit = true;
        for (let pit of pits) {
            if (this.x + this.w > pit.x && this.x < pit.x + pit.w && 
                this.y + this.h >= pit.y) {
                this.fallingToDeath = true;
                this.fallSpeed = 0;
                return;
            }
        }

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

        this.x = constrain(this.x, 0, levelWidth - this.w);
    }

    show() {
        if (this.fallingToDeath) {
            fill(255, 0, 0);
        } else {
            fill(100, 150, 255);
        }
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

class Pit {
    constructor(x, y, w) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = 100;
    }

    show() {
        fill(0);
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
        this.jumpTimer = 0;
        this.vy = 0;
        this.gravity = 0.5;
        this.onGround = true;
        this.platformBelow = null;
    }

    update() {
        this.vy += this.gravity;
        this.y += this.vy;
        
        // Проверка столкновений с платформами
        this.onGround = false;
        this.platformBelow = null;
        for (let platform of platforms) {
            if (this.collidesWith(platform)) {
                this.vy = 0;
                this.y = platform.y - this.h;
                this.onGround = true;
                this.platformBelow = platform;
            }
        }
        
        // Проверка на края платформы
        if (this.onGround) {
            let atLeftEdge = this.x <= this.leftBound + 5;
            let atRightEdge = this.x + this.w >= this.rightBound - 5;
            
            if (atLeftEdge || atRightEdge) {
                // 75% остаться на платформе, 25% спрыгнуть
                if (random() < 0.25) {
                    this.vy = -10;
                    this.onGround = false;
                }
            }
        }
        
        // Проверка на приближение к другой платформе
        if (this.onGround) {
            for (let platform of platforms) {
                if (platform !== this.platformBelow) {
                    let platformInFront = false;
                    if (this.vx > 0 && this.x + this.w + 50 > platform.x && this.x < platform.x) {
                        platformInFront = true;
                    } else if (this.vx < 0 && this.x - 50 < platform.x + platform.w && this.x > platform.x + platform.w) {
                        platformInFront = true;
                    }
                    
                    if (platformInFront && abs(platform.y - this.y - this.h) < 20) {
                        // 50% вероятность запрыгнуть на платформу
                        if (random() < 0.5) {
                            this.vy = -12;
                            this.onGround = false;
                        }
                    }
                }
            }
        }
        
        // Проверка на ямы
        let willFall = false;
        for (let pit of pits) {
            if ((this.vx > 0 && this.x + this.w + this.vx > pit.x && this.x + this.w <= pit.x) ||
                (this.vx < 0 && this.x + this.vx < pit.x + pit.w && this.x >= pit.x + pit.w)) {
                if (this.y + this.h >= pit.y) {
                    willFall = true;
                }
            }
        }
        
        if (willFall && this.onGround) {
            this.vy = -10;
            this.onGround = false;
        }
        
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