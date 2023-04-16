$.Init = function () {
    $.InitGameStates();
    $.InitRequestAnimationFrame();
    $.InitWindowEvents();
    $.InitGameVariables();
    $.InitCanvas();

    $.SetGameState($.GameStateMenu);
    $.GameLoop();
};

$.InitGameStates = function () {
    $.GameStateMenu = 1;
    $.GameStateLoading = 2;
    $.GameStatePlay = 3;
    $.GameStatePause = 4;
    $.GameStateGameOver = 5;

    $.CurrentGameState = 0;    
};

$.InitRequestAnimationFrame = function () {
    var requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

    window.requestAnimationFrame = requestAnimationFrame;
};

$.InitWindowEvents = function () {
    window.addEventListener('mousemove', $.MouseMove);
    window.addEventListener('mousedown', $.MouseDown);
    window.addEventListener('mouseup', $.MouseUp);
    window.addEventListener('keydown', $.KeyDown);
    window.addEventListener('keyup', $.KeyUp);
    window.addEventListener("keypress", $.KeyPress);
    window.addEventListener('resize', $.Resize);    
};

$.InitGameVariables = function () {
    $.Keys = [];
    $.KeyCodes = { A: 65, D: 68, S: 83, W: 87, ESC:27, ENTER: 13, SHIFT: 16, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
    $.MousePoint = new $.Point(0, 0);
    $.IsMouseDown = false;
    $.Delta = 0;
    $.Then = Date.now();

    $.Score = {
        EnemyScore: 0,
        BulletsFired: 0,
        PowerUps: 0
    };

};

$.InitCanvas = function () {
    $.CanvasWidth = window.innerWidth;
    $.CanvasHeight = window.innerHeight;
    $.CanvasBounds = new $.Rectangle(0, 0, $.CanvasWidth, $.CanvasHeight);

    $.Canvas = document.getElementById('canvas');
    $.Canvas.width = $.CanvasWidth;
    $.Canvas.height = $.CanvasHeight;
    $.Canvas.style.marginTop = -$.CanvasHeight / 2 + 'px';
    $.Canvas.style.marginLeft = -$.CanvasWidth / 2 + 'px';
    $.Canvas.style.display = 'block';

    $.Gtx = $.Canvas.getContext('2d');

    $.Canvas1 = document.getElementById('canvas1');
    $.Canvas1.width = $.CanvasWidth;
    $.Canvas1.height = $.CanvasHeight;
    $.Canvas1.style.marginTop = -$.CanvasHeight / 2 + 'px';
    $.Canvas1.style.marginLeft = -$.CanvasWidth / 2 + 'px';
    $.Canvas1.style.display = 'block';

    $.Gtx1 = $.Canvas1.getContext('2d');

    $.Canvas2 = document.getElementById('canvas2');
    $.Canvas2.width = $.CanvasWidth;
    $.Canvas2.height = $.CanvasHeight;
    $.Canvas2.style.marginTop = -$.CanvasHeight / 2 + 'px';
    $.Canvas2.style.marginLeft = -$.CanvasWidth / 2 + 'px';
    $.Canvas2.style.display = 'block';

    $.Gtx2 = $.Canvas2.getContext('2d');

    $.Canvas3 = document.getElementById('canvas3');
    $.Canvas3.width = $.CanvasWidth;
    $.Canvas3.height = $.CanvasHeight;
    $.Canvas3.style.marginTop = -$.CanvasHeight / 2 + 'px';
    $.Canvas3.style.marginLeft = -$.CanvasWidth / 2 + 'px';
    $.Canvas3.style.display = 'block';

    $.Gtx3 = $.Canvas3.getContext('2d');
};


$.MouseMove = function (e) {
    if ($.CurrentGameState == $.GameStatePlay) {
        $.MousePoint = new $.Point(e.clientX - $.Canvas.offsetLeft, e.clientY - $.Canvas.offsetTop);
    }
};

$.MouseDown = function () {
    $.IsMouseDown = true;
};

$.MouseUp = function () {
    $.IsMouseDown = false;
    //if ($.GameStates.Play == 1) { $.GameWorld.MouseUp(); }
};

$.KeyDown = function (e) {
    $.Keys[e.keyCode] = true;

    if ($.Keys[$.KeyCodes.ESC]) {
        if ($.CurrentGameState == $.GameStatePlay) {
            $.MenuPauseGame();
        }
    }
};

$.KeyUp = function (e) {
    $.Keys[e.keyCode] = false;
};

$.KeyPress = function (e) {

};

$.Resize = function () {
    $.InitCanvas();

    if ($.GameWorld) { $.GameWorld.DoMiniMapDraw = true; }
};

$.SetGameState = function (state) {
    var mainMenu = document.getElementById('main-menu');
    mainMenu.style.display = 'none';
    mainMenu.style.visibility = 'hidden';

    var pausedOverlay = document.getElementById('paused-overlay');
    pausedOverlay.style.visibility = 'hidden';
    pausedOverlay.style.display = 'none';

    var gameOverOverlay = document.getElementById('game-over-overlay');
    gameOverOverlay.style.visibility = 'hidden';
    gameOverOverlay.style.display = 'none';

    document.body.style.cursor = '';

    $.CurrentGameState = state;

    $.ActivateMenuGameState(mainMenu);
    $.ActivateLoadingGameState();
    $.ActivatePlayGameState();
    $.ActivatePausedGameState(pausedOverlay);
    $.ActivateGameOverGameState(gameOverOverlay);
};

$.ActivateMenuGameState = function(mainMenu) {
    if ($.CurrentGameState == $.GameStateMenu) {
        mainMenu.style.display = 'block';
        mainMenu.style.visibility = 'visible';
    }
};

$.ActivateLoadingGameState = function() {
    if ($.CurrentGameState == $.GameStateLoading) {
        $.LoadImages();
        $.CreateNewGameWorld();
    }
};

$.ActivatePlayGameState = function() {
    if ($.CurrentGameState == $.GameStatePlay) {
        document.body.style.cursor = 'none';
    }
};

$.ActivatePausedGameState = function(pausedOverlay) {
    if ($.CurrentGameState == $.GameStatePause) {
        pausedOverlay.style.visibility = 'visible';
        pausedOverlay.style.display = 'block';
    }
};

$.ActivateGameOverGameState = function(gameOverOverlay) {
    if ($.CurrentGameState == $.GameStateGameOver) {
        gameOverOverlay.style.visibility = 'visible';
        gameOverOverlay.style.display = 'block';
        $.SetTotalScore();
    }
};

$.MenuStartGame = function () {
    $.SetGameState($.GameStateLoading);
};

$.MenuToMainMenu = function () {
    $.InitCanvas();
    $.SetGameState($.GameStateMenu);
};

$.MenuPauseGame = function () {
    $.SetGameState($.GameStatePause);    
};

$.MenuResumeGame = function () {
    $.SetGameState($.GameStatePlay);
};

$.MenuPlayAgain = function () {
    $.CreateNewGameWorld();
    $.SetGameState($.GameStatePlay);
};

$.CreateNewGameWorld = function () {
    $.GameWorld = null;
    $.GameWorld = new $.World();
    $.GameWorld.Init();
};

$.SetTotalScore = function () {    
    var bulletScore = Math.floor($.Score.BulletsFired / 2);
    var total = bulletScore + $.Score.EnemyScore + $.Score.PowerUps;

    var scoreSpan = document.getElementById('score');
    scoreSpan.innerText = total;
};

$.LoadImages = function () {
    $.ImageCount = 18;
    $.ImagesLoaded = 0;

    $.CursorImage = new Image();
    $.CursorImage.onload = function () { $.ImagesLoaded++; }
    $.CursorImage.src = "img/cursor.png";    

    $.BulletImage = new Image();
    $.BulletImage.onload = function () { $.ImagesLoaded++; }
    $.BulletImage.src = "img/bullet.png";

    $.TilesImage = new Image();
    $.TilesImage.onload = function () { $.ImagesLoaded++; }
    $.TilesImage.src = "img/tiles.png";

    $.ParticlesImage = new Image();
    $.ParticlesImage.onload = function () { $.ImagesLoaded++; }
    $.ParticlesImage.src = "img/particles.png";

    $.EnemyOneImage = new Image();
    $.EnemyOneImage.onload = function () { $.ImagesLoaded++; }
    $.EnemyOneImage.src = "img/enemies1.png";

    $.EnemyTwoImage = new Image();
    $.EnemyTwoImage.onload = function () { $.ImagesLoaded++; }
    $.EnemyTwoImage.src = "img/enemies2.png";

    $.EnemyThreeImage = new Image();
    $.EnemyThreeImage.onload = function () { $.ImagesLoaded++; }
    $.EnemyThreeImage.src = "img/enemy3.png";

    $.HeroHPImage = new Image();
    $.HeroHPImage.onload = function () { $.ImagesLoaded++; }
    $.HeroHPImage.src = "img/hpMask.png";

    $.MiniMapImage = new Image();
    $.MiniMapImage.onload = function () { $.ImagesLoaded++; }
    $.MiniMapImage.src = "img/minimap.png";

    $.HeroBaseImage = new Image();
    $.HeroBaseImage.onload = function () { $.ImagesLoaded++; }
    $.HeroBaseImage.src = "img/base.png";

    $.HeroShooterImage = new Image();
    $.HeroShooterImage.onload = function () { $.ImagesLoaded++; }
    $.HeroShooterImage.src = "img/shooter.png";

    $.SpeedBoostImage = new Image();
    $.SpeedBoostImage.onload = function () { $.ImagesLoaded++; }
    $.SpeedBoostImage.src = "img/speedboost.png";

    $.HpUpImage = new Image();
    $.HpUpImage.onload = function () { $.ImagesLoaded++; }
    $.HpUpImage.src = "img/hpUp.png";

    $.InvulnerableImage = new Image();
    $.InvulnerableImage.onload = function () { $.ImagesLoaded++; }
    $.InvulnerableImage.src = "img/invulnerability.png";

    $.PierceImage = new Image();
    $.PierceImage.onload = function () { $.ImagesLoaded++; }
    $.PierceImage.src = "img/pierce.png";

    $.RapidFireImage = new Image();
    $.RapidFireImage.onload = function () { $.ImagesLoaded++; }
    $.RapidFireImage.src = "img/rapidFire.png";

    $.TripleShotImage = new Image();
    $.TripleShotImage.onload = function () { $.ImagesLoaded++; }
    $.TripleShotImage.src = "img/tripleShot.png";

    $.LaserImage = new Image();
    $.LaserImage.onload = function () { $.ImagesLoaded++; }
    $.LaserImage.src = "img/laser.png";
};

$.Loading = function () {
    if ($.ImagesLoaded == $.ImageCount) {
        $.SetGameState($.GameStatePlay);
    }
};

$.GameLoop = function () {
    requestAnimationFrame($.GameLoop);
    $.UpdateDelta();

    if ($.CurrentGameState == $.GameStateMenu) {

    }

    if ($.CurrentGameState == $.GameStateLoading) {
        $.Loading();
    }

    if ($.CurrentGameState == $.GameStatePlay) {
        $.GameWorld.Tick();
    }

    if ($.CurrentGameState == $.GameStatePause) {
        
    }

    if ($.CurrentGameState == $.GameStateGameOver) {
        
    }
};

$.UpdateDelta = function () {
    var now = Date.now();
    var delta = now - $.Then;
    $.Delta = delta / 1000;
    $.Then = now;
};

$.SoundsShoot = 1;
$.SoundsExplode = 2;