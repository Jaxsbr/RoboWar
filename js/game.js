$.Init = function () {
    $.InitGameStates();
    $.InitRequestAnimationFrame();
    $.InitWindowEvents();
    $.InitGameVariables();
    $.InitCanvas();

    $.ToggleGameState($.GameStateMenu);
    $.TogglePlayMenuShowState(true);

    $.GameLoop();

    $.MenuNewGame($.GameStateMenu);
};

$.InitGameStates = function () {
    $.GameStates = { Menu: 0, Loading: 0, Play: 0, Pause: 0, Score: 0, HighScore: 0 };
    $.GameStateMenu = 1;
    $.GameStateLoading = 2;
    $.GameStatePlay = 3;
    $.GameStatePause = 4;
    $.GameStateScore = 5;
    $.GameStateHighScore = 6;
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

    $.Gtx = $.Canvas.getContext('2d');

    $.Canvas1 = document.getElementById('canvas1');
    $.Canvas1.width = $.CanvasWidth;
    $.Canvas1.height = $.CanvasHeight;
    $.Canvas1.style.marginTop = -$.CanvasHeight / 2 + 'px';
    $.Canvas1.style.marginLeft = -$.CanvasWidth / 2 + 'px';

    $.Gtx1 = $.Canvas1.getContext('2d');

    $.Canvas2 = document.getElementById('canvas2');
    $.Canvas2.width = $.CanvasWidth;
    $.Canvas2.height = $.CanvasHeight;
    $.Canvas2.style.marginTop = -$.CanvasHeight / 2 + 'px';
    $.Canvas2.style.marginLeft = -$.CanvasWidth / 2 + 'px';

    $.Gtx2 = $.Canvas2.getContext('2d');

    $.Canvas3 = document.getElementById('canvas3');
    $.Canvas3.width = $.CanvasWidth;
    $.Canvas3.height = $.CanvasHeight;
    $.Canvas3.style.marginTop = -$.CanvasHeight / 2 + 'px';
    $.Canvas3.style.marginLeft = -$.CanvasWidth / 2 + 'px';

    $.Gtx3 = $.Canvas3.getContext('2d');
};


$.MouseMove = function (e) {
    if ($.GameStates.Play == 1) {
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
        if ($.GameStates.Play == 1) {
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

$.ToggleGameState = function (state) {
    $.GameStates.Menu = 0;
    $.GameStates.Loading = 0;
    $.GameStates.Play = 0;
    $.GameStates.Pause = 0;
    $.GameStates.Score = 0;
    $.GameStates.HighScore = 0;

    document.body.style.cursor = '';

    switch (state) {
        case $.GameStateMenu:
            $.GameStates.Menu = 1;
            break;
        case $.GameStateLoading:
            $.GameStates.Loading = 1;
            break;
        case $.GameStatePlay:
            $.GameStates.Play = 1;
            document.body.style.cursor = 'none';
            break;
        case $.GameStatePause:
            $.GameStates.Pause = 1;
            break;
        case $.GameStateScore:
            $.GameStates.Score = 1;
            break;
        case $.GameStateHighScore:
            $.GameStates.HighScore = 1;
            break;
    }
};

$.TogglePlayMenuShowState = function (show) {
    // var menu = document.getElementById('playMenu');
    // menu.style.visibility = show ? 'visible' : 'hidden';
};

$.TogglePauseMenuShowState = function (show) {
    // var menu = document.getElementById('pauseMenu');
    // menu.style.visibility = show ? 'visible' : 'hidden';
};

$.ToggleScoreMenuShowState = function (show) {
    // var menu = document.getElementById('scoreMenu');
    // menu.style.visibility = show ? 'visible' : 'hidden';
};

$.ToggleHighScoreMenuShowState = function (show) {
    // var menu = document.getElementById('highScoreMenu');
    // menu.style.visibility = show ? 'visible' : 'hidden';
};

$.MenuNewGame = function (previousState) {
    if (previousState && previousState == $.GameStateHighScore) {
        $.ToggleHighScoreMenuShowState(false);
        $.ToggleGameState($.GameStateMenu);
        $.TogglePlayMenuShowState(true);
    }
    else {
        $.ToggleGameState($.GameStateLoading);
        // TODO:
        // Show loading
        $.LoadImages();
        $.TogglePlayMenuShowState(false);
        $.GameWorld = new $.World();
        $.GameWorld.Init();
    }
};

$.MenuHighScores = function (currentMenuState) {    
    if (currentMenuState == $.GameStateMenu) {
        $.TogglePlayMenuShowState(false);
    }
    else if (currentMenuState == $.GameStateScore) {
        $.ToggleScoreMenuShowState(false);
    }

    $.ToggleGameState($.GameStateHighScore);
    $.ToggleHighScoreMenuShowState(true);
};

$.MenuPauseGame = function () {
    $.ToggleGameState($.GameStatePause);    
    $.TogglePauseMenuShowState(true);    
};

$.MenuResumeGame = function () {
    $.ToggleGameState($.GameStatePlay);
    $.TogglePauseMenuShowState(false);
};

$.MenuQuitGame = function () {
    $.ToggleGameState($.GameStateScore);
    $.TogglePauseMenuShowState(false);
    $.ToggleScoreMenuShowState(true);

    //var scoreMenu = document.getElementById("scoreMenu");
    //scoreMenu.style.pointerEvents = "none";

    var addScore = document.getElementById("addScore");
    addScore.style.visibility = "visible";    

    var scoreResults = document.getElementById("scoreResults");
    scoreResults.textContent = "You scored: " + $.GetTotalScore();

    //scoreMenu.style.pointerEvents = "";
};

$.MenuPlayAgain = function () {
    $.ToggleScoreMenuShowState(false);
    $.GameWorld = null;
    $.GameWorld = new $.World();
    $.GameWorld.Init();
    $.GameStates.Play = 1;    

    var addScore = document.getElementById("addScore");
    addScore.style.visibility = "hidden";
};

$.GetTotalScore = function () {    
    var bulletScore = Math.floor($.Score.BulletsFired / 2);
    var total = bulletScore + $.Score.EnemyScore + $.Score.PowerUps;

    return total;
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
    $.SpeedBoostImage.src = "img/speedBoost.png";

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
        $.ToggleGameState($.GameStatePlay);
        //document.body.style.cursor = 'none';        
    }
};

$.GameLoop = function () {
    requestAnimationFrame($.GameLoop);

    $.UpdateDelta();

    if ($.GameStates.Menu == 1) {

    }
    else if ($.GameStates.Loading == 1) {
        $.Loading();
    }
    else if ($.GameStates.Play == 1) {
        $.GameWorld.Tick();
    }
    else if ($.GameStates.Pause == 1) {
        
    }
    else if ($.GameStates.Score == 1) {
        
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