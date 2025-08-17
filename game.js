const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: 50,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    color: 'red',
    speed: 5,
    jumping: false,
    jumpHeight: 15,
    velocityY: 0,
    health: 100
};

const keys = {};
const touch = { x: 0, y: 0, startX: 0, startY: 0 };
let gamepad = null;

const healthSpan = document.getElementById('health');
const tutorialDiv = document.getElementById('tutorial');

document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Mobile controls
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');

leftBtn.addEventListener('touchstart', () => { keys['ArrowLeft'] = true; });
leftBtn.addEventListener('touchend', () => { keys['ArrowLeft'] = false; });
rightBtn.addEventListener('touchstart', () => { keys['ArrowRight'] = true; });
rightBtn.addEventListener('touchend', () => { keys['ArrowRight'] = false; });
jumpBtn.addEventListener('touchstart', () => { keys['Space'] = true; });
jumpBtn.addEventListener('touchend', () => { keys['Space'] = false; });

// Swipe controls
canvas.addEventListener('touchstart', (e) => {
    touch.startX = e.touches[0].clientX;
    touch.startY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    touch.x = e.touches[0].clientX;
    touch.y = e.touches[0].clientY;
    const dx = touch.x - touch.startX;
    const dy = touch.y - touch.startY;

    if (Math.abs(dx) > Math.abs(dy)) { // Horizontal swipe
        if (dx > 0) {
            keys['ArrowRight'] = true;
            keys['ArrowLeft'] = false;
        } else {
            keys['ArrowLeft'] = true;
            keys['ArrowRight'] = false;
        }
    } else { // Vertical swipe
        if (dy < 0) { // Swipe up
            keys['Space'] = true;
        }
    }
});

canvas.addEventListener('touchend', () => {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['Space'] = false;
});

// Gamepad support
window.addEventListener("gamepadconnected", (e) => {
    gamepad = e.gamepad;
    console.log("Gamepad connected:", gamepad.id);
});

window.addEventListener("gamepaddisconnected", () => {
    gamepad = null;
    console.log("Gamepad disconnected");
});

function handleGamepad() {
    if (!gamepad) return;

    // D-pad or analog stick for movement
    const horizontalAxis = gamepad.axes[0];
    if (horizontalAxis < -0.5) {
        keys['ArrowLeft'] = true;
    } else {
        keys['ArrowLeft'] = false;
    }
    if (horizontalAxis > 0.5) {
        keys['ArrowRight'] = true;
    } else {
        keys['ArrowRight'] = false;
    }

    // A button for jump
    if (gamepad.buttons[0].pressed) {
        keys['Space'] = true;
    } else {
        keys['Space'] = false;
    }
}

function update() {
    handleGamepad();
    // Keyboard controls
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += player.speed;
    }
    if ((keys['Space'] || keys['KeyW']) && !player.jumping) {
        player.jumping = true;
        player.velocityY = -player.jumpHeight;
    }

    // Apply gravity
    player.velocityY += 1;
    player.y += player.velocityY;

    // Prevent falling through the floor
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.velocityY = 0;
    }

    // Prevent going off-screen
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x > canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }

    // Update UI
    healthSpan.textContent = player.health;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function showTutorial() {
    tutorialDiv.style.display = 'block';
    setTimeout(() => {
        tutorialDiv.style.display = 'none';
    }, 5000); // Hide after 5 seconds
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

if (!localStorage.getItem('visited')) {
    showTutorial();
    localStorage.setItem('visited', 'true');
}

gameLoop();