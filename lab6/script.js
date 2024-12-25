const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const gameObjects = {
    player: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 50,
        color: 'orange',
        speed: 2,
        isJumping: false,
        isFalling: false,
        
        move() {
            if (!this.isFalling) {
                if (this.isJumping) {
                    this.y -= 5;
                    if (this.y <= canvas.height/2 - 100) {
                        this.isJumping = false;
                    }
                } else if (this.y < canvas.height/2) {
                    this.y += 3;
                }
            } else {
                this.y += 5;
            }
        },
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    enemies: [
        {
            x: 600,
            y: canvas.height/2,
            size: 40,
            color: 'red',
            speed: 1,
            direction: 1,
            patrolStart: 500,
            patrolEnd: 700,
            isAlive: true,
            
            move() {
                if (this.isAlive) {
                    this.x += this.speed * this.direction;
                    if (this.x <= this.patrolStart || this.x >= this.patrolEnd) {
                        this.direction *= -1;
                    }
                }
            },
            
            draw() {
                if (this.isAlive) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            
            checkCollision(player) {
                if (!this.isAlive) return false;
                
                const dx = (this.x) - (player.x + player.size/2);
                const dy = (this.y) - (player.y + player.size/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < (this.size/2 + player.size/2)) {
                    // Если игрок прыгает сверху на врага
                    if (player.y < this.y && player.isJumping) {
                        this.isAlive = false;
                        player.isJumping = true;
                        return false;
                    }
                    return true;
                }
                return false;
            }
        }
    ]
};

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем фон
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
    
    // Обновление и отрисовка врагов
    gameObjects.enemies.forEach(enemy => {
        enemy.move();
        enemy.draw();
        enemy.checkCollision(gameObjects.player);
    });
    
    gameObjects.player.move();
    gameObjects.player.draw();
    
    requestAnimationFrame(gameLoop);
}

// Управление
document.addEventListener('keydown', (e) => {
    if (!gameObjects.player.isFalling) {
        switch(e.key) {
            case ' ':
                gameObjects.player.isJumping = true;
                break;
            case 'ArrowLeft':
                gameObjects.player.x -= gameObjects.player.speed;
                break;
            case 'ArrowRight':
                gameObjects.player.x += gameObjects.player.speed;
                break;
        }
    }
});

gameLoop(); 