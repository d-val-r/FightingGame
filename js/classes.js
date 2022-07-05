// used to replicate effect of gravity on an object
const GRAVITY = 0.4;


// represents any rendered sprite
class Sprite {
    constructor(width, height, position, imgSrc, scale = 1, totalFrames = 1, currentFrame = -999) {
        this.position = position;
        this.height = height;
        this.width = width;
        this.image = new Image();
        this.image.src = imgSrc;
        this.scale = scale;
        this.totalFrames = totalFrames;
        this.framesElapsed = 0;
        this.currentFrame = currentFrame;
        this.incrementor = 1;

        // used primarily in instances where an image needs to be read left-to-right (as in the case of mirrored PNGs)
        this.renderProperties = {
            sx: (this.currentFrame === -999 ? 0 : this.currentFrame) * (this.image.width / this.totalFrames),
            sy: 0,
            sWidth: this.image.width / this.totalFrames,
            sHeight: this.image.height,
            dWidth: this.image.width / this.totalFrames * this.scale, 
            dHeight: this.image.height * this.scale
        }

    }

    draw() {
        ctx.drawImage(
            this.image, 
            this.renderProperties.sx,
            this.renderProperties.sy,
            this.renderProperties.sWidth,
            this.renderProperties.sHeight,
            this.position.x,
            this.position.y,
            this.renderProperties.dWidth,
            this.renderProperties.dHeight
        );
    }



    // the mod value represents how often to update a frame
    // for a background, use the static value of 17; for Players,
    // use a dynamic value
    update(mod = 17) {
        this.framesElapsed++;
        if (this.framesElapsed % mod === 0) {
            this.currentFrame = (this.currentFrame === -999 ? -999 : this.currentFrame === -1 ? this.totalFrames : (this.currentFrame + this.incrementor) % this.totalFrames);
        }

        // update the render properties
        this.renderProperties.sx = (this.currentFrame === -999 ? 0 : this.currentFrame) * (this.image.width / this.totalFrames);
        this.renderProperties.sy = 0;
        this.renderProperties.sWidth = this.image.width / this.totalFrames;
        this.renderProperties.sHeight = this.image.height;
        this.renderProperties.dWidth = this.image.width / this.totalFrames * this.scale;
        this.renderProperties.dHeight = this.image.height * this.scale;

        this.draw();

    }
}


class Player extends Sprite {
    constructor(width, height, position, velocity, direction, imgSrc, scale, totalFrames, currentFrame, sprites = {}, keyset) {
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
        this.hitbox = {
            position: {
                x: this.position.x + (this.direction === "left" ? this.image.width / (this.totalFrames - 2) : 0),
                y: this.position.y
            },

            // on Chrome, the this.image.{width / height} values are undefined
            // so they are hardcoded here based on the PNG file size 
            width: 192 / this.totalFrames * this.scale / 2, 
            height: 48 * this.scale
        };
        this.sprites = sprites;
        this.stance = `idle_${this.direction}`;
        this.keyset = keyset;
        this.mod = sprites[this.stance]["mod"];
        this.jumping = false;
    }

    attack() {
        this.isAttacking = true
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }


    draw() {
        if (this.rectangle) {


            // draw the sprite hitbox for testing purposes
            ctx.fillStyle = 'red';
            ctx.fillRect(
                this.hitbox.position.x,
                this.hitbox.position.y,
                this.hitbox.width,
                this.hitbox.height
                );

            // draw the attackbox
            if (this.isAttacking) {
                ctx.fillStyle = 'black';
                ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
            }
        } 
       
       super.draw(); 
        
    }

    update() {
        
        super.update(this.mod);
        
        // update the sprite's position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // update the position of the attackbox
        // reverse the direction of the attack box based on the direction the
        // sprite is facing
        this.attackBox.position.x = this.position.x + this.image.width / this.totalFrames;
        this.attackBox.position.y = this.position.y + this.image.height;


        this.hitbox.position.x = this.position.x + (this.direction === "left" ? this.image.width / (this.totalFrames - 2) : 0),
        this.hitbox.position.y = this.position.y;
        
        // bounds on the x-axis
        if (this.position.x + this.width * this.scale >= canvas.width || this.position.x <= 0) {
            this.velocity.x = 0;
        }

        // bounds on the y-axis

        // this is the baseline at which character's stand 
        if (this.position.y + this.height >= canvas.height - 100) {
            
            // the player is no longer falling
            this.falling = false;
            this.velocity.y = 0;

            // if the sprite gets too high, simulate the jump ending
            // by telling the program the user is no longer holding the jump button
            // does not actually impact the user's ability to press the button
        } else if (this.position.y <= 200 && !this.falling) {
            this.keyset === "wasd" ? keys.w.pressed = false : keys.upArrow.pressed = false;
            this.falling = true;
        } else {
            this.velocity.y += GRAVITY;
        }

    }

    // handles transitioning the backing source of the image to the appropriate PNG
    // and sets the total and current frames accordingly
    switchSprite(sprite) {

        // setting this.currentFrame to 0 must happen individually for each case
        // because it only gets set if sprite matches a case AND the stance
        // is different from the sprite; otherwise, it's a change of sprites, 
        // but not a change of stances (i.e. the game loop is checking to see
        // if a sprite needs to change), and so the currentFrame must NOT be
        // reset


        // if the player is mid-jump, ensure the sprite is set to jump so that
        // the sprite does not change as the player is in the air
        sprite = this.jumping ? `jump_${this.direction}` : sprite;

        switch (sprite) {
            case "idle_left":
                if (this.stance !== "idle_left") {
                    this.image.src = this.sprites["idle_left"]["src"];
                    this.stance = "idle_left";
                    this.currentFrame = 0;
                    this.totalFrames = 4;
                }
                this.mod = this.sprites["idle_left"]["mod"];
                break;
            case "idle_right":
                if (this.stance !== "idle_right") {
                    this.image.src = this.sprites["idle_right"]["src"];
                    this.stance = "idle_right"
                    this.currentFrame = 0;
                    this.totalFrames = 4;
                }
                this.mod = this.sprites["idle_right"]["mod"];
                break;
            case "run_left":
                if (this.stance !== "run_left") {
                    this.image.src = this.sprites["run_left"]["src"];
                    this.stance = "run_left"
                    this.currentFrame = 0;
                    this.totalFrames = 6;
                }
                this.mod = this.sprites["run_left"]["mod"];
                break;
            case "run_right":
                if (this.stance !== "run_right") {
                    this.image.src = this.sprites["run_right"]["src"];
                    this.stance = "run_right";
                    this.currentFrame = 0;
                    this.totalFrames = 6;
                }
                this.mod = this.sprites["run_right"]["mod"];
                break;
            case "jump_right":
                if (this.jumping && this.stance !== "jump_right") {
                    // this.jumping = false;
                    this.image.src = this.sprites["jump_right"]["src"];
                    this.stance = "jump_right";
                    this.currentFrame = 0;
                    this.totalFrames = 4;
                    this.mod = this.sprites["jump_right"]["mod"];
                    console.log(`Jumping!`);
                }
                break;
            case "jump_left":
                if (this.jumping && this.stance !== "jump_left") {
                    // this.jumping = false;
                    this.image.src = this.sprites["jump_left"]["src"];
                    this.stance = "jump_left";
                    this.currentFrame = 0;
                    this.totalFrames = 4;
                    this.renderProperties.sx = this.image.width;
                    this.renderProperties.sy = 0;
                    this.mod = this.sprites["jump_left"]["mod"];
                    console.log(`Jumping!`);
                }
                break;
            default:
                break;
        }

    }

    // used to reverse direction of character movement and adjust their horizontal
    // position to account for the change in animations displacing them
    changeDirection(dir) {
        
        // ensure the direction is changing
        if (this.direction !== dir) {
            this.position.x += (dir === "right" ? 30 : -30);

            this.direction = dir;
        }
    }
}