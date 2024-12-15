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
                if (this.y > canvas.height + this.size) {
                    this.reset();
                }
            }
        },
        
        reset() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.isFalling = false;
        },
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    canyons: [
        {
            x: 200,
            y: canvas.height/2,
            width: 100,
            height: canvas.height/2,
            color: '#4A4A4A',
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            },
            
            checkCollision(player) {
                return (player.x + player.size > this.x &&
                        player.x < this.x + this.width &&
                        player.y + player.size > this.y);
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
    
    // Отрисовка каньонов
    gameObjects.canyons.forEach(canyon => {
        canyon.draw();
        if (canyon.checkCollision(gameObjects.player)) {
            gameObjects.player.isFalling = true;
        }
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