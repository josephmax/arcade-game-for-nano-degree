/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        flag = false;

    canvas.width = 606;
    canvas.height = 808;
    window.onload = function () {
        var wrap = doc.getElementById('canvasWrap');
        var char = doc.charactor.char;
        console.log(char)
        wrap.appendChild(canvas);
        resetGame = reset;
    }

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        var enemyLen = allEnemies.length,
            newEnemy,
            gameOver = false;
        /** 
         * check win first, if the player wins stop the following render actions and show the winning message.
        */
        if (player.checkWin()) {
            player.win();
            return false;
        }

        /**
         * check enemies counts according to level config.
         * update enemie according to level config
         * check collisions
         */

        // generate enemies once a tick till the count reachs the level limitation.
        if (enemyLen < levelConfig[level]['enemy_count']) {
            flag = levelConfig[level]['enemy_two_direction'] ? !flag : flag;
            newEnemy = new Enemy({
                row: util.getRandomScope(1, 7),
                reversed: flag
            });
            allEnemies.push(newEnemy);
        }

        // tempEnemies is defined to restore enemies which are still visible on the screen during the present tick.
        // unavailableEnemies is defined to restore enemies which will no longer available on the screen duing the next tick.
        // so for each unavailable enemy, a new Enemy will be generated to replace it.
        var tempEnemies = [], unavailableEnemies = [];
        allEnemies.forEach(function(enemy, index) {
            enemy.update(dt);
            if (enemy.checkCollisions(player.position)) {
                gameOver = true;
            }
            if (enemy.available() === true) {
                tempEnemies.push(enemy);
            } else {
                unavailableEnemies.push(enemy);
            }
        });
        allEnemies = tempEnemies;
        unavailableEnemies.forEach(function(enemy){
            newEnemy = new Enemy({
                row: enemy.row, 
                reversed: levelConfig[level]['enemy_two_direction'] ? !enemy.reversed : enemy.revered
            });
            allEnemies.push(newEnemy);
        })

        // handle game over
        if (gameOver) {
            reset();
        }

        /**
         * check gems, if player reach the gem, generate a new one.
         */
        if (gems.checkCollisions(player.position)) {
            score += gems.score;
            gems = new Gems({
                col: util.getRandomScope(1, 6),
                row: util.getRandomScope(2, 7),
                type: util.getRandomScope(1, 4)
            });
        }
        player.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/grass-block.png',   // Row 1 of 4 of grass
                'images/grass-block.png',   // Row 2 of 4 of grass
                'images/grass-block.png',   // Row 3 of 4 of grass
                'images/stone-block.png',   // Row 1 of 5 of stone
                'images/stone-block.png',   // Row 2 of 5 of stone
                'images/stone-block.png',   // Row 3 of 5 of stone
                'images/stone-block.png',   // Row 4 of 5 of stone
            ],
            numRows = 8,
            numCols = 6,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        renderScoreBar();
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        gems.render();
        player.render();
        if (winning) {
            renderWinMessage();
        }
    }

    /**
     * show score and highscore at the top of canvas.
     * highscore will update only if player wins
     */
    function renderScoreBar() {
        ctx.font = 'bold 36px impact';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, 808, 50);
        ctx.fillStyle = '#000';
        ctx.fillText('SCORE: ' + score, 0, 0);
        ctx.textAlign = 'right';
        ctx.fillText('HIGH SCORE: ' + highScore, 606, 0);
    }
    /**
     * draw winning message when player wins
     */
    function renderWinMessage() {
        ctx.font = 'bold 128px impact';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = 'gold';
        ctx.textBaseline = 'middle';
        ctx.fillText('YOU WIN!!!', canvas.width / 2, canvas.height / 2);
        ctx.strokeText('YOU WIN!!!', canvas.width / 2, canvas.height / 2);
    }
    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset(lv) {
        // noop
        level = lv || level;
        var char = doc.charactor.char.value;
        allEnemies = [];
        winning = false;
        score = 0;
        gems = new Gems({
            col: util.getRandomScope(1, 6),
            row: util.getRandomScope(2, 7),
            type: util.getRandomScope(1, 4)
        })
        player = new Player({
            char: char || 'boy'
        });
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/gem-blue.png',
        'images/gem-green.png',
        'images/gem-orange.png',
        'images/Star.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
