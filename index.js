// Represents the sprite rendered on the canvas
class Sprite {
    constructor(width, height, {position, velocity}) {
        this.position = position;
        this.height = height;
        this.width = width;
        this.velocity = velocity;
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
            this.velocity.y = 0;
        } else if (this.position.y >= 300) {
            keys.w.pressed = false;
        } else {
            this.velocity.y += GRAVITY;
        }

    }
}


// used to help control what happens when the user presses both a and d
let lastKey;

// boolean used to control crouching
let crouch = false;


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

const player = new Sprite(
    50, 
    150, 
    {
        position: 
            {x:0, y:canvas.height - 150}, 
        velocity: 
            {x: 0, y:0}
    });

player.draw();

const enemy = new Sprite(
    50, 
    150, 
    {
        position: 
            {x:canvas.width - 50, y:canvas.height - 150}, 
        velocity: 
            {x:0, y:0}
    });

enemy.draw();


// create an infinite animation loop that relies on the velocities 
// of the sprites to animate them; keypresses alter the velocity
const animate = () => {
    window.requestAnimationFrame(animate);
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    
    // player animation controls

    // horizontal controls
    if (keys.a.pressed && lastKey === 'a') {
        player.velocity.x = -2;
    } else if (keys.d.pressed && lastKey === 'd') {
        player.velocity.x = 2;
    } else {
        player.velocity.x = 0;
    }

    // crouch and jump controls
    if (keys.s.pressed && !crouch) {
        player.height /= 2;
        player.position.y += player.height;
        crouch = true
    } else if (!keys.s.pressed && crouch) {
        player.height *= 2;
        player.position.y -= player.height / 2;
        crouch = false;
    }

    if (keys.w.pressed) {
        player.velocity.y = -5;
    } 


    // enemy animation controls

    // horizontal controls
    if (keys.a.pressed && lastKey === 'a') {
        player.velocity.x = -2;
    } else if (keys.d.pressed && lastKey === 'd') {
        player.velocity.x = 2;
    } else {
        player.velocity.x = 0;
    }

    // crouch and jump controls
    if (keys.s.pressed && !crouch) {
        player.height /= 2;
        player.position.y += player.height;
        crouch = true
    } else if (!keys.s.pressed && crouch) {
        player.height *= 2;
        player.position.y -= player.height / 2;
        crouch = false;
    }

    if (keys.w.pressed) {
        player.velocity.y = -5;
    } 

}

// movement while key is held
window.addEventListener('keydown', (event) => {

    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break
        case 's':
            keys.s.pressed = true;
            break;
        case 'w':
            keys.w.pressed = true;
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
            lastKey = 'a';
            break
        case 'a':
            keys.a.pressed = false;
            lastKey = 'd';
            break
        case 's':
            keys.s.pressed = false;
            break;
        case 'w':
            keys.w.pressed = false;
            break;
    }
});

animate();