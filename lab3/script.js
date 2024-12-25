const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 50,
    color: 'orange',
    direction: 1,
    speed: 2,
    changeDirectionTimer: 0,
    
    move() {
        this.changeDirectionTimer++;
        if (this.changeDirectionTimer > 100) {
            this.direction = Math.random() > 0.5 ? 1 : -1;
            this.changeDirectionTimer = 0;
        }
        
        this.x += this.speed * this.direction;
        
        // Проверка границ
        if (this.x <= 0 || this.x >= canvas.width - this.size) {
            this.direction *= -1;
        }
    },
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
        ctx.fill();
    }
};

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем фон
    ctx.fillStyle = '#87CEEB'; // небо
    ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#90EE90'; // земля
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
    
    player.move();
    player.draw();
    
    requestAnimationFrame(gameLoop);
}

gameLoop(); 