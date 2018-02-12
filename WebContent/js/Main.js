var game;


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
        game.load.image('player', 'assets/sprites/bird.png');
        game.load.image('wall', 'assets/sprites/pipe.png');
        game.load.image('asset', 'assets/sprites/tile.png');
        game.load.image('ditch', 'assets/sprites/pipe.png');
    },

    create: function() { 
        //game.stage.backgroundColor = '#71c5cf';  
        game.stage.backgroundColor = '#3598db';
    
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add the physics engine to all game objects
        game.world.enableBody = true;

        //this.tile = game.add.sprite(70, 245, 'tile');
        // Create the player in the middle of the game
        this.player = game.add.sprite(70, 100, 'player');
        
        //game.physics.arcade.enable(this.tile);

        //this.tile.body.gravity.y = 1000;  
        this.player.body.gravity.y = 1000;  
        
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 
        
        this.walls = game.add.group();
        this.ditches = game.add.group();
        this.assets = game.add.group();
        
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
            'o   o   o',
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

                // Create a coin and add it to the 'coins' group
                else if (level[i][j] == 'o') {
                    var asset = game.add.sprite(30+20*j, 30+20*i, 'asset');
                    this.game.physics.arcade.enable(asset);
                    asset.inputEnabled = true;
                    asset.input.enableDrag();
                    asset.body.immovable = true; 
                    this.assets.add(asset);
                }

                // Create a death trap and add it to the 'enemies' group
                else if (level[i][j] == '!') {
                    var ditch = game.add.sprite(30+20*j, 30+20*i, 'ditch');
                    ditch.tint = 0xff00ff;
                    this.enemies.add(ditch);
                }
            }
        }
        
    },

    update: function() {
//        if (this.tile.y < 0 || this.tile.y > 490)
//        this.restartGame();
            
        game.physics.arcade.collide(this.player, this.walls);
        game.physics.arcade.collide(this.player, this.assets);
        
        // Call the 'restart' function when the player touches the enemy
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
    
    // Restart the game
    reverse: function() {
        this.player.body.velocity.x = -200;
    },

};
