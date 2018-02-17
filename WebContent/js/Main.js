var game;
const DELAY = 2000;

var graphicAssets = {

    explosionLarge:{URL:'assets/sprites/explosionLarge.png', name:'explosionLarge', width:64, height:64, frames:8},
    explosionMedium:{URL:'assets/sprites/explosionMedium.png', name:'explosionMedium', width:58, height:58, frames:8},
    explosionSmall:{URL:'assets/sprites/explosionSmall.png', name:'explosionSmall', width:41, height:41, frames:8}
};

window.onload = function() {
	
    // Initialize the game and start our state
    game = new Phaser.Game(700, 490);  
    game.state.add('main', mainState);  
    game.state.start('main')
};


var mainState = function() {};
mainState.prototype = {
    preload: function() { 
        //game.load.image('tile', 'assets/bird.png');
        game.load.spritesheet('player', 'assets/sprites/professorSpriteSheet.png', 258, 258);
        game.load.image('wall', 'assets/sprites/pipe.png');
        game.load.image('asset', 'assets/sprites/tile.png');
        game.load.image('ditch', 'assets/sprites/pipe.png');
        game.load.image('spring', 'assets/sprites/tile.png');
        game.load.image('tnt', 'assets/sprites/bird.png');
        game.load.spritesheet(graphicAssets.explosionLarge.name, graphicAssets.explosionLarge.URL,
            graphicAssets.explosionLarge.width, graphicAssets.explosionLarge.height,
            graphicAssets.explosionLarge.frames);
    },

    create: function() { 
        //game.stage.backgroundColor = '#71c5cf';  
        game.stage.backgroundColor = '#3598db';

        game.world.setBounds(-20, -20, game.width+40, game.height+40);
        game.camera.x = 2;
        game.camera.y = 2;

        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add the physics engine to all game objects
        game.world.enableBody = true;

        //this.tile = game.add.sprite(70, 245, 'tile');
        // Create the player in the middle of the game
        this.player = game.add.sprite(70, 100, 'player');
        this.player.body.bounce.y = 0.2;
        //game.physics.arcade.enable(this.tile);

        this.player.body.gravity.y = 1000;  
        
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 
        
        this.walls = game.add.group();
        this.ditches = game.add.group();
        this.assets = game.add.group();
        this.springs = game.add.group();
        this.tnts = game.add.group();

        this.explosionSmallGroup = game.add.group();
        this.explosionSmallGroup.createMultiple(20, graphicAssets.explosionLarge.name, 0);
        this.explosionSmallGroup.setAll('anchor.x', 0.5);
        this.explosionSmallGroup.setAll('anchor.y', 0.5);
        this.explosionSmallGroup.callAll('animations.add', 'animations', 'explode', null, 30);

        // Design the level. x = wall, o = coin, ! = lava.
        var level = [
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            '                         ',
            '                         ',
            '                         ',
            '                         ',
            '                         ',
            'xxxxxxxxxxxxxxxxx       x',
            'xxxxxxxxxxxxxxxxx       x',
            'xxxxxxxxxxxxxxxxx       xxxxxxxxxxxxxxxxxx',
            'xxxxxxxxxxxxxxxxx       xxxxxxxxxxxxxxxxxx',
            'xxxxxxxxxxxxxxxxx! ! !!!x',
            '                      ',
            'o   t   s'
        ];
        
        // Create the level by going through the array
        for (var i = 0; i < level.length; i++) {
            for (var j = 0; j < level[i].length; j++) {

                // Create a wall and add it to the 'walls' group
                if (level[i][j] == 'x') {
                    var wall = game.add.sprite(30+20*j, 30+20*i, 'wall');
                    this.walls.add(wall);
                    wall.body.immovable = true; 
                }

                // Create a spring and add it to the 'springs' group
                else if (level[i][j] == 's') {
                    var spring = game.add.sprite(30+20*j, 30+20*i, 'spring');
                    this.game.physics.arcade.enable(spring);
                    spring.tint = 0xff00ff; //'#DAA520';
                    spring.inputEnabled = true;
                    spring.input.enableDrag();
                    spring.body.immovable = true;
                    this.springs.add(spring);
                }

                // Create a asset and add it to the 'assets' group
                else if (level[i][j] == 'o') {
                    var asset = game.add.sprite(30+20*j, 30+20*i, 'asset');
                    this.game.physics.arcade.enable(asset);
                    asset.inputEnabled = true;
                    asset.input.enableDrag();
                    asset.body.immovable = true;
                    this.assets.add(asset);

                }
                // Create a tnt and add it to the 'tnts' group
                else if (level[i][j] == 't') {
                    var tnt = game.add.sprite(30+20*j, 30+20*i, 'tnt');
                    this.game.physics.arcade.enable(tnt);
                    tnt.tint = 0xff000f; //'#DAA520';
                    tnt.inputEnabled = true;
                    tnt.input.enableDrag();
                    tnt.body.immovable = true;
                    this.tnts.add(tnt);
                }

                // Create a death trap and add it to the 'ditches' group
                else if (level[i][j] == '!') {
                    var ditch = game.add.sprite(30+20*j, 30+20*i, 'ditch');
                    ditch.tint = 0xff00ff;
                    this.ditches.add(ditch);
                }
            }
        }
        
    },

    update: function() {
//        if (this.tile.y < 0 || this.tile.y > 490)
//        this.restartGame();
        this.checkBoundaries(this.player);
        game.physics.arcade.collide(this.player, this.walls);
        game.physics.arcade.collide(this.player, this.assets, this.reverse, null, this);
        game.physics.arcade.collide(this.player, this.springs, this.springCollisionHandler, null, this);
        game.physics.arcade.collide(this.player, this.tnts, this.tntCollision, null, this);

        // Call the 'restart' function when the player falls in a ditch
        game.physics.arcade.overlap(this.player, this.ditches, this.restartGame, null, this);

    },

    // Make the bird jump 
    jump: function() {
        // Add a vertical velocity to the bird
        //this.tile.body.velocity.y = -350;
        this.player.body.velocity.x = 200;
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },
    

    reverse: function(player) {
        if (player.body.touching.right){
            player.body.velocity.x = -200;
        } else if (player.body.touching.down) {
            //player.body.velocity.y = -250;
        } else if (player.body.touching.left) {
            player.body.velocity.x = 200;
        }

    },

    //Make player jump if he touches the top of a spring or change direction if he touches the side
    springCollisionHandler: function (player) {
        if (player.body.touching.right){
            player.body.velocity.x = -200;
        } else if (player.body.touching.down) {
            player.body.velocity.y = -250;
        } else if (player.body.touching.left) {
            player.body.velocity.x = 200;
        }
    },

    doubleSpringCollisionHandler: function (player) {
        if (player.body.touching.right){
            player.body.velocity.x = -200;
        } else if (player.body.touching.down) {
            player.body.velocity.y = -500;
        } else if (player.body.touching.left) {
            player.body.velocity.x = 200;
        }
    },

    checkBoundaries: function (sprite) {
        if (sprite.x < 0 || sprite.x > 700) {
            this.restartGame();
        }

        if (sprite.y < 0 || sprite.y > 400) {
            this.restartGame();
        }
    },

    resetCam: function(){
        //Reset camera after shake
        game.camera.x = 2;
        game.camera.y = 2;
    },

    shake: function(){
        var min = -2;
        var max = 2;
        game.camera.x+= Math.floor(Math.random() * (max - min + 1)) + min;
        game.camera.y+= Math.floor(Math.random() * (max - min + 1)) + min;
    },

    tntCollision: function (player, tnt) {
        var him = this;

        if (player.body.touching.right){
            player.body.velocity.x = -200;
        } else if (player.body.touching.down) {
            setTimeout(function () {
                him.explode(tnt);
            }, DELAY)
        } else if (player.body.touching.left) {
            player.body.velocity.x = 200;
        }
    },

    explode: function (tnt) {
        console.table("I am in the explode function");
        tnt.kill();
        var t = game.time.create(true);
        t.repeat(20,10,this.shake,this);
        t.start();
        var explosionGroup = "explosionSmallGroup";
        var explosion = this[explosionGroup].getFirstExists(false);
        explosion.reset(tnt.x, tnt.y);
        explosion.animations.play('explode', 30, false, true);
        t.onComplete.addOnce(this.resetCam,this);
    }

};
