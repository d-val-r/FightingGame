// represents any rendered sprite
class Sprite {
    constructor(width, height, position, imgSrc, scale = 1, totalFrames = 1, currentFrame = -1) {
        this.position = position;
        this.height = height;
        this.width = width;
        this.image = new Image();
        this.image.src = imgSrc;
        this.scale = scale;
        this.totalFrames = totalFrames;
        this.framesElapsed = 0;
        this.currentFrame = currentFrame;
    }

    draw() {
        ctx.drawImage(
            this.image, 
            (this.currentFrame === -1 ? 0 : this.currentFrame) * (this.image.width / this.totalFrames),
            0,
            this.image.width / this.totalFrames,
            this.image.height,
            this.position.x, 
            this.position.y, 
            this.image.width / this.totalFrames * this.scale, 
            this.image.height * this.scale);
    }

    update() {
        this.framesElapsed++;
        if (this.framesElapsed % 17 === 0) {
            this.currentFrame = (this.currentFrame === -1 ? -1 : (this.currentFrame  + 1) % this.totalFrames);
        }

        this.draw();

    }
}





// Represents the player sprite rendered on the canvas
class Fighter {
    constructor(width, height, {position, velocity}, direction) {
        this.position = position;
        this.height = height;
        this.width = width;
        this.velocity = velocity;
        this.crouch = false;
        this.lastKey;
        this.falling = false;
        this.direction = direction
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: 100,
            height: width
        },
        this.isAttacking = false,
        this.health = 100
    }

    attack() {
        this.isAttacking = true
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    draw() {
        
        // draw the sprite
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // draw the attackbox
        if (this.isAttacking) {
            ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
    }

    update() {
        this.draw();
        
        // update the sprite's position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // update the position of the attackbox
        // reverse the direction of the attack box based on the direction the
        // sprite is facing
        this.attackBox.position.x = this.position.x - (this.direction === "left" ? this.width : 0);
        this.attackBox.position.y = this.position.y;
        
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


class Player extends Sprite {
    constructor(width, height, position, velocity, direction, imgSrc, scale, totalFrames, currentFrame) {
        super(width, height, position, imgSrc, scale, totalFrames, currentFrame);
        this.velocity = velocity;
        this.crouch = false;
        this.lastKey;
        this.falling = false;
        this.direction = direction
        this.attackBox = {
            position: {
                x: position.x,
                y: position.y
            },
            width: 100,
            height: width
        },
        this.isAttacking = false;
        this.health = 100;
        this.rectangle = false;
    }

    attack() {
        this.isAttacking = true
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }


    draw() {
        if (this.rectangle) {

            // draw the sprite background for testing purposes
            ctx.fillStyle = 'red';
            ctx.fillRect(
                this.position.x + (this.direction === "left" ? this.image.width / (this.totalFrames - 2) : 0),
                this.position.y, 
                this.image.width / this.totalFrames * this.scale / 2, 
                this.image.height * this.scale);

            // draw the attackbox
            if (this.isAttacking) {
                ctx.fillStyle = 'black';
                ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
        } 
        super.draw();
        
    }

    update() {
        
        super.update();
        
        // update the sprite's position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // update the position of the attackbox
        // reverse the direction of the attack box based on the direction the
        // sprite is facing
        this.attackBox.position.x = this.position.x + this.image.width / this.totalFrames - (this.direction === "left" ? this.width : 0);
        this.attackBox.position.y = this.position.y + this.image.height;
        
        // bounds on the x-axis
        if (this.position.x + this.width * this.scale >= canvas.width || this.position.x <= 0) {
            this.velocity.x = 0;
        }

        // bounds on the y-axis
        if (this.position.y + this.height >= canvas.height + 150) {

            console.log("here!");
            
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