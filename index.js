// Represents the sprite rendered on the canvas
class Sprite {
    constructor(width, height, {position, velocity}) {
        this.position = position;
        this.height = height;
        this.width = width;
        this.velocity = velocity;
        this.crouch = false;
        this.lastKey;
        this.falling = false;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        // bounds on the x-axis
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = 0;
        }

        // bounds on the y-axis
        if (this.position.y + this.height >= canvas.height) {
            
            // the player is no longer falling
            this.falling = false;
            this.velocity.y = 0;

            // if the sprite gets to high, simulate the jump ending
            // by telling the program the user is no longer holding the jump button
            // does not actually impact the user's ability to press the button
        } else if (this.position.y >= 300) {
            keys.w.pressed = false;
            keys.upArrow.pressed = false;
        } else {
            this.velocity.y += GRAVITY;
        }

    }
}


// used to replicate effect of gravity on an object
const GRAVITY = 0.4;


const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    s: {
        pressed: false
    },
    w: {
        pressed: false
    },
    rightArrow: {
        pressed: false
    },
    leftArrow: {
        pressed: false
    },
    upArrow: {
        pressed: false
    },
    downArrow: {
        pressed: false
    }
}

canvas.width = 1024;
canvas.height = 576;

// render a rectangle at (0,0), filling the whole canvas
ctx.fillRect(0,0, canvas.width, canvas.height);

const player1 = new Sprite(
    50, 
    150, 
    {
        position: 
            {x:0, y:canvas.height - 150}, 
        velocity: 
            {x: 0, y:0}
    });

player1.draw();

const player2 = new Sprite(
    50, 
    150, 
    {
        position: 
            {x:canvas.width - 50, y:canvas.height - 150}, 
        velocity: 
            {x:0, y:0}
    });

player2.draw();


// create an infinite animation loop that relies on the velocities 
// of the sprites to animate them; keypresses alter the velocity
const animate = () => {
    window.requestAnimationFrame(animate);
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    player1.update();
    player2.update();

    
    // player animation controls

    // horizontal controls
    if (keys.a.pressed && player1.lastKey === 'a') {
        player1.velocity.x = -2;
    } else if (keys.d.pressed && player1.lastKey === 'd') {
        player1.velocity.x = 2;
    } else {
        player1.velocity.x = 0;
    }

    // crouch and jump controls
    if (keys.s.pressed && !player1.crouch) {
        player1.height /= 2;
        player1.position.y += player1.height;
        player1.crouch = true
    } else if (!keys.s.pressed && player1.crouch) {
        player1.height *= 2;
        player1.position.y -= player1.height / 2;
        player1.crouch = false;
    }

    if (keys.w.pressed && !player1.falling) {
        player1.velocity.y = -5;
    } 


    // enemy animation controls

    // horizontal controls
    if (keys.leftArrow.pressed && player2.lastKey === 'ArrowLeft') {
        player2.velocity.x = -2;
    } else if (keys.rightArrow.pressed && player2.lastKey === 'ArrowRight') {
        player2.velocity.x = 2;
    } else {
        player2.velocity.x = 0;
    }

    // crouch and jump controls
    if (keys.downArrow.pressed && !player2.crouch) {
        player2.height /= 2;
        player2.position.y += player2.height;
        player2.crouch = true
    } else if (!keys.downArrow.pressed && player2.crouch) {
        player2.height *= 2;
        player2.position.y -= player2.height / 2;
        player2.crouch = false;
    }

    if (keys.upArrow.pressed && !player2.falling) {
        player2.velocity.y = -5;
    } 

}

// movement while key is held
window.addEventListener('keydown', (event) => {

    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            player1.lastKey = 'd';
            break
        case 'a':
            keys.a.pressed = true;
            player1.lastKey = 'a';
            break
        case 's':
            keys.s.pressed = true;
            break;
        case 'w':
            keys.w.pressed = true;

            // set the sprite's falling variable to true; that way, the user cannot
            // keep clicking 'w' (or up arrow) to "double jump"
            player1.falling = true;
            break;
        case 'ArrowRight':
            keys.rightArrow.pressed = true;
            player2.lastKey = 'ArrowRight';
            break
        case 'ArrowLeft':
            keys.leftArrow.pressed = true;
            player2.lastKey = 'ArrowLeft';
            break
        case 'ArrowDown':
            keys.downArrow.pressed = true;
            break;
        case 'ArrowUp':
            keys.upArrow.pressed = true;
            player2.falling = true;
            break;
    }
});

// reset velocity to 0 when the key is let go
window.addEventListener('keyup', (event) => {

    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            
            // reset the last key to the opposite key so that if
            // both keys are held the character will move in the correct direction
            player1.lastKey = 'a';
            break
        case 'a':
            keys.a.pressed = false;
            player1.lastKey = 'd';
            break
        case 's':
            keys.s.pressed = false;
            break;
        case 'w':
            keys.w.pressed = false;
            break;
        case 'ArrowRight':
            keys.rightArrow.pressed = false;
            player2.lastKey = 'ArrowLeft';
            break
        case 'ArrowLeft':
            keys.leftArrow.pressed = false;
            player2.lastKey = 'ArrowRight';
            break
        case 'ArrowDown':
            keys.downArrow.pressed = false;
            break;
        case 'ArrowUP':
            keys.upArrow.pressed = false;
            break;
    }
});

animate();