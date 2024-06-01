class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.score = 0 ;
        this.text
        this.win = false
        //this.text = this.add.text(16 + this.cameras.main.scrollX, this.cameras.main.scrollY, 'Score:' + this.score, { fontFamily: 'Arial', fontSize: 18, color: '#ffffff' });
       

    }

    create() {
        
       
        //animation for coins
        // this.anims.create({
        //     key: 'coinSpin',
        //     frames: this.anims.generateFrameNames('Coin', { prefix: 'frame', start: 151, end: 152 }),
        //     frameRate: 50,
        //     repeat: -1
        // });
        
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 81, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.waterLayer = this.map.createLayer("Water",this.tileset,0,0)
        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // TODO: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "Coin",
            key: "tilemap_sheet",
            frame: 151
        });
        //sets the spawn point 
        this.spawn = this.map.createFromObjects("Spawnpoint", {
            name: "Spawn",
            key: "tilemap_sheet",
            frame: 145,     
        });

        this.powerup = this.map.createFromObjects("Powerup", {
            name: "Jumpshroom",
            key: "tilemap_sheet",
            frame: 128,     
        });

        this.powerup1 = this.map.createFromObjects("Powerup2", {
            name: "DashVine",
            key: "tilemap_sheet",
            frame: 127,     
        });
        
        this.winflag = this.map.createFromObjects("WinFlag", {
            name: "WinFlag",
            key: "tilemap_sheet",
            frame: 131,     
        });
        //setting the particles for when a coin is collected
      
       


         // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.powerup, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.powerup1, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.winflag, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        
        this.powerGroup = this.add.group(this.powerup)
        
        this.powerGroup2 = this.add.group(this.powerup1)
        this.winflagGroup = this.add.group(this.winflag)
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spawn[0].x, this.spawn[0].y, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        
        this.physics.add.overlap(my.sprite.player, this.winflagGroup, (obj1, obj2) => {
this.win = true
        })
         // Handle collision detection with coins
         this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            //if a coin is collided with it will play the particle effect set
            my.vfx.collection = this.add.particles(obj2.x, obj2.y, "kenny-particles", {
                frame: ['star_01.png', 'star_02.png'],
                scale: {start: 0.03, end: 0.1, random: true},
                
                lifespan: 300,
                maxAliveParticles: 8,

                
                alpha: {start: 1, end: 0.1}, 
                gravityY: -400,
                
            });
           
            obj2.destroy(); // remove coin on overlap
            this.score += 1 // adds one point on collection of coins
            
           
        this.text = this.add.text(my.sprite.player.x, my.sprite.player.y, this.score, { fontFamily: 'Arial', fontSize: 18, color: '#ffffff' });//Updates text
        //starts the visual effect and then stops it after .8  of a second
        my.vfx.collection.start();

        setTimeout(() => {
            this.text.destroy();//destroy text 
            my.vfx.collection.stop(); 
            
        }, 1000);
        
        
        });
        

        // Handle collision detection with powerup
        this.physics.add.overlap(my.sprite.player, this.powerGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.JUMP_VELOCITY = -900 // raise the jump velocity on collection 
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        
         // movement vfx

         my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1, random: true},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 300,
            maxAliveParticles: 8,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
            gravityY: -400,
        });

        my.vfx.walking.stop();

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

       
        
    }

    update() {
        
       
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }
        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.space)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
        if(this.win== true){
            console.log('no')
        }
    }
}