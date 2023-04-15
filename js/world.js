// Constructor
$.World = function () {
    this.DoTileDraw = true;
    this.DoMiniMapDraw = true;
    this.ShowMiniMap = true;
    this.ShakeLevel = 0;
    this.RenderBounds = new $.Rectangle(0, 0, 0, 0);

    this.WorldWidth = 4096;
    this.WorldHeight = 4096;
    this.MiniDivider = 20;

    this.LevelModulus = 5;
    this.Enemies = [];
    this.EnemyStartCount = 5;
    this.SpawnedEnemies = 0;
    this.SpawnedCommanders = 0;
    this.CommanderSpawnIndexes = [];
    this.SpawnedBosses = 0;
    this.SpawnCount = 0;
    this.SpawnTick = 1;
    this.SpawnTime = this.SpawnTick;    

    this.ParticlePool = [];
    this.Particles = [];
    this.CombatTexts = [];
    this.Bullets = [];

    this.MaxPowerUps = 10;
    this.PowerUps = [];
    this.PowerUpTick = 5;
    this.PowerUpTime = 0;

    this.SetupSoundTrack();
};


// Functions
$.World.prototype.Init = function () {
    this.GenerateMap();
    this.Hero = new $.Player();
    this.RoundManager = new $.WaveEngine(this);    

    var par = null;
    for (var i = 0; i < 2500; i++) {
        par = new $.Particle(0, 0, '', null, 0, 0, 0, 0);        
        this.Particles.push(par);
    }

    var bul = null;
    for (var i = 0; i < 400; i++) {
        bul = new $.Bullet(0, 0, null, 0, 0, 0, '');
        this.Bullets.push(bul);
    }

    this.TrackSound.Play();
};

$.World.prototype.Tick = function () {    
    this.Update();
    this.Draw();
};

$.World.prototype.GenerateMap = function () {
    this.Map = new $.Rectangle(0, 0, this.WorldWidth, this.WorldHeight);
    this.MiniMapWidth = this.WorldWidth / this.MiniDivider;
    this.MiniMapHeight = this.WorldHeight  / this.MiniDivider;

    this.TileSize = 32;
    this.TileCols = this.Map.Width / this.TileSize;
    this.TileRows = this.Map.Height / this.TileSize;
    this.Tiles = [];

    noise.seed($.RandomBetween(0, 1));

    for (var col = 0; col < this.TileCols; col++) {
        this.Tiles[col] = new Array();

        for (var row = 0; row < this.TileRows; row++) {
            this.Tiles[col][row] = new $.Tile(col, row, this.TileSize, this.TileSize);
        }
    }  
};

$.World.prototype.SetupSoundTrack = function () {
    var track = Math.round($.RandomBetween(1, 4.99));

    this.TrackSound = new $.Sound('sounds/track' + track.toString() + '.mp3', 1);
    this.TrackSound.Loop = true;
};

$.World.prototype.SpawnWave = function () {
    this.SpawnedEnemies = 0;

    var commanderCount = 0;
    var bossCount = 0;
    var bossRound = false;

    if (this.RoundManager.WaveIndex > 0) {
        var mod = this.RoundManager.WaveIndex % this.LevelModulus;
        if (mod == 0) {
            // Every this.LevelModulus increase the difficulty.
            commanderCount = this.RoundManager.WaveIndex / this.LevelModulus;
            this.SpawnedCommanders = 0;
        }
        else if (mod == 1 && this.RoundManager.WaveIndex > this.LevelModulus) {
            // Every this.LevelModulus + 1 level boss level.
            bossRound = true;
            bossCount = 1;//Math.floor(this.RoundManager.WaveIndex / this.LevelModulus);
            this.SpawnedBosses = 0;
        }
    }
    
    this.SpawnCount = bossRound ? bossCount :
        this.EnemyStartCount + Math.floor(((this.RoundManager.WaveIndex * 3) / 2)) + commanderCount;

    if (commanderCount > 0) {
        // Calculate random sequence in which commanders are spawned
        this.CommanderSpawnIndexes = [];

        while (this.CommanderSpawnIndexes.length < commanderCount) {
            var randomIndex = Math.floor($.RandomBetween(0, (this.SpawnCount - 1) + 0.99));
            var usedIndex = false;

            for (var i = 0; i < this.CommanderSpawnIndexes.length; i++) {
                if (this.CommanderSpawnIndexes[i] == randomIndex) {
                    usedIndex = true;
                    break;
                }
            }

            if (!usedIndex) {
                this.CommanderSpawnIndexes.push(randomIndex);
            }
        }
    }   
};

$.World.prototype.GetRandomParticleImage = function () {
    var image = { Image: $.ParticlesImage, xSource: 0, ySource: 0, wSource: 50, hSource: 50 };

    var random = Math.floor($.RandomBetween(0, 5.99));
    image.xSource = random * image.wSource;

    return image;
};

$.World.prototype.GetBulletHitParticleImage = function () {
    var image = { Image: $.ParticlesImage, xSource: 0, ySource: 0, wSource: 50, hSource: 50 };

    var list = [0, 1, 2, 4];

    var random = Math.floor($.RandomBetween(0, (list.length - 1) + 0.99));
    image.xSource = list[random] * image.wSource;

    return image;
};

$.World.prototype.GetEnergyParticleImage = function () {
    var image = { Image: $.ParticlesImage, xSource: 0, ySource: 0, wSource: 50, hSource: 50 };

    var list = [2, 3];

    var random = Math.floor($.RandomBetween(0, (list.length - 1) + 0.99));
    image.xSource = list[random] * image.wSource;

    return image;
};

$.World.prototype.GetHotParticleImage = function () {
    var image = { Image: $.ParticlesImage, xSource: 0, ySource: 0, wSource: 50, hSource: 50 };

    var list = [3, 4, 5];

    var random = Math.floor($.RandomBetween(0, (list.length - 1) + 0.99));
    image.xSource = list[random] * image.wSource;

    return image;
};

$.World.prototype.GetPlayerMeleeHitParticleImage = function () {
    var image = { Image: $.ParticlesImage, xSource: 0, ySource: 0, wSource: 50, hSource: 50 };

    var list = [2, 5];

    var random = Math.floor($.RandomBetween(0, (list.length - 1) + 0.99));
    image.xSource = list[random] * image.wSource;

    return image;
};

$.World.prototype.GetPlayerBulletHitParticleImage = function () {
    var image = { Image: $.ParticlesImage, xSource: 0, ySource: 0, wSource: 50, hSource: 50 };

    var list = [2, 4];

    var random = Math.floor($.RandomBetween(0, (list.length - 1) + 0.99));
    image.xSource = list[random] * image.wSource;

    return image;
};

$.World.prototype.GetBulletPlayerTrailParticleImage = function () {
    var image = { Image: $.ParticlesImage, xSource: 0, ySource: 0, wSource: 50, hSource: 50 };

    var list = [2, 3, 5];

    var random = Math.floor($.RandomBetween(0, (list.length - 1) + 0.99));
    image.xSource = list[random] * image.wSource;

    return image;
};

$.World.prototype.AddBulletHitEffect = function (damageResult) {
    var divider = 6;
    var degrees = 360 / divider;
    var angle = 0;
    var shades = [-0.02, -0.01, 0, 0.01, 0.02];
    var color = damageResult.color;

    for (var i = 1; i < degrees; i++) {
        var ttl = $.RandomBetween(0.3, 0.5);
        var speed = $.RandomBetween(200, 330);
        var direction = new $.Point(-Math.sin(angle), -Math.cos(angle));
        var particleSize = $.RandomBetween(8, 10);

        var random = Math.floor($.RandomBetween(0, (shades.length - 1) + 0.99));
        color = $.ShadeColor(color, shades[random]);

        var par = new $.Particle(damageResult.point.X, damageResult.point.Y, color, direction, ttl, speed, particleSize, particleSize);
        par.Image = this.GetBulletHitParticleImage();
        this.Particles.push(par);
        angle += divider;
    }

    // Random particles
    var randomParticles = 12;
    for (var i = 0; i < randomParticles; i++) {

        var randomAngle = Math.floor($.RandomBetween(1, 360));
        var ttl = $.RandomBetween(0.4, 0.7);
        var speed = $.RandomBetween(300, 450);
        var direction = new $.Point(-Math.sin(randomAngle), -Math.cos(randomAngle));
        var particleSize = $.RandomBetween(7, 9);        
        var image = this.GetEnergyParticleImage();
        this.AddParticle(damageResult.point.X, damageResult.point.Y, color, direction, ttl, speed, particleSize, particleSize, image);
    }
};

$.World.prototype.AddExplosionEffect = function (point) {
    var divider = 10;
    var degrees = 360 / divider;
    var angle = 0;
    var color = 'orange';

    for (var i = 0; i < degrees; i++) {

        var ttl = $.RandomBetween(0.3, 0.5);
        var speed = $.RandomBetween(200, 330);
        var direction = new $.Point(-Math.sin(angle), -Math.cos(angle));
        var particleSize = $.RandomBetween(9, 12);
        
        var image = this.GetHotParticleImage();
        this.AddParticle(point.X, point.Y, color, direction, ttl, speed, particleSize, particleSize, image);
        angle += divider;
    }

    divider = 8;
    degrees = 360 / divider;
    color = 'red';
    angle = 0;

    for (var i = 0; i < degrees; i++) {

        var ttl = $.RandomBetween(0.2, 0.4);
        var speed = $.RandomBetween(230, 350);
        var direction = new $.Point(-Math.sin(angle), -Math.cos(angle));
        var particleSize = $.RandomBetween(7, 9);
        
        var image = null;
        this.AddParticle(point.X, point.Y, color, direction, ttl, speed, particleSize, particleSize, image);
        angle += divider;
    }
    
    // Random particles
    var randomParticles = 12;
    for (var i = 0; i < randomParticles; i++) {

        var randomAngle = Math.floor($.RandomBetween(1, 360));
        var ttl = $.RandomBetween(0.4, 0.7);
        var speed = $.RandomBetween(300, 450);
        var direction = new $.Point(-Math.sin(randomAngle), -Math.cos(randomAngle));
        var particleSize = $.RandomBetween(5, 7);
        
        var image = null;
        this.AddParticle(point.X, point.Y, 'white', direction, ttl, speed, particleSize, particleSize, image);
    }    
};

$.World.prototype.AddPlayerMeleeHitEffect = function () {
    var randomParticles = 48;
    for (var i = 0; i < randomParticles; i++) {

        var randomAngle = Math.floor($.RandomBetween(1, 360));
        var ttl = $.RandomBetween(0.6, 1);
        var speed = $.RandomBetween(50, 150);
        var direction = new $.Point(-Math.sin(randomAngle), -Math.cos(randomAngle));
        var particleSize = $.RandomBetween(4, 8);

        var image = this.GetPlayerMeleeHitParticleImage();
        this.AddParticle(this.Hero.Bounds.Centre.X, this.Hero.Bounds.Centre.Y, 'maroon', direction, ttl, speed, particleSize, particleSize, image);
    }
};

$.World.prototype.AddPlayerBulletHitEffect = function () {
    var randomParticles = 36;
    for (var i = 0; i < randomParticles; i++) {

        var randomAngle = Math.floor($.RandomBetween(1, 360));
        var ttl = $.RandomBetween(0.6, 1);
        var speed = $.RandomBetween(50, 150);
        var direction = new $.Point(-Math.sin(randomAngle), -Math.cos(randomAngle));
        var particleSize = $.RandomBetween(4, 8);

        var image = this.GetPlayerMeleeHitParticleImage();
        this.AddParticle(this.Hero.Bounds.Centre.X, this.Hero.Bounds.Centre.Y, 'maroon', direction, ttl, speed, particleSize, particleSize, image);
    }
};

$.World.prototype.AddParticle = function (x, y, color, direction, ttl, speed, sizeW, sizeH, image) {
    var particle = null;
    for (var i = 0; i < this.Particles.length; i++) {
        particle = this.Particles[i];
        if (particle.TTL <= 0) { break; }
    }

    if (particle) {
        particle.Bounds = new $.Rectangle(x, y, sizeW, sizeH);
        particle.Color = color;
        particle.Velocity = new $.Point(0, 0);
        particle.Direction = direction;
        particle.Opacity = 1;
        particle.Speed = speed;
        particle.MaxTTL = ttl;
        particle.TTL = ttl;
        particle.Image = image;        
    }    
};

$.World.prototype.AddBullet = function (isPlayer, x, y, direction, speed, size, ttl, color, pierce) {
    var bullet = null;
    for (var i = 0; i < this.Bullets.length; i++) {
        bullet = this.Bullets[i];
        if (bullet.TTL <= 0) { break; }
    }

    if (bullet) {
        bullet.Bounds = new $.Rectangle(x, y, size, size);
        bullet.Velocity = new $.Point(0, 0);
        bullet.Direction = direction;
        bullet.Speed = speed;
        bullet.TTL = ttl;
        bullet.Color = color;
        bullet.Pierce = pierce;
        bullet.HitCount = 1;
        bullet.IsPlayer = isPlayer;
    }
};

$.World.prototype.AddShake = function (level) {
    this.ShakeLevel = level;
}

$.World.prototype.AddText = function (color, text, point, font) {
    var combatText = new $.CombatText(color, text, point, font);
    this.CombatTexts.push(combatText);
};

$.World.prototype.GetBulletDamage = function (type) {
    // TODO:
    // Calculate bullet damage points based on all power ups etc.

    var blue = '#0000ff';    
    var purple = '#6600cc';


    var damageResult = { crit: false, dp: 0, color: blue }

    if (type == "bullet") {
        var dp = 2;
        var random = $.RandomBetween(0, 10);
        // 1 in 10
        if (random > 7 && random < 7.99) {
            damageResult.crit = true;
            damageResult.color = purple;
            dp = dp * 2;
        }

        damageResult.dp = dp;
    }
    else if (type == "enemyBullet") {
        damageResult.dp = Math.floor($.RandomBetween(2, 5.99));
    }

    return damageResult;
};

$.World.prototype.GetKillPhrase = function () {
    var phrases = ["boom", "zzaaapp", "bang", "chakala", "dwwarrr"];

    var random = Math.floor($.RandomBetween(0, (phrases.length - 1) + 0.99));
    return phrases[random];
};

$.World.prototype.EmitBulletParticles = function (bullet) {
    var randomParticles = 5;
    var angle = 0;
    for (var i = 0; i < randomParticles; i++) {
        angle = $.RandomVariation(angle, Math.PI * 2);
        var radians = angle;// * Math.PI / 180;
        var aim = new $.Point(Math.cos(radians), Math.sin(radians));
        var direction = bullet.Velocity.Normalize(aim);

        var ttl = $.RandomBetween(0.3, 0.35);
        var speed = bullet.Speed / 2;        
        var particleSize = $.RandomBetween(5, 7);

        var x = bullet.Bounds.Centre.X - particleSize / 2;
        var y = bullet.Bounds.Centre.Y - particleSize / 2;
        // TODO:
        // Differentiate between player and enemy bullet trails.
        var image = this.GetBulletPlayerTrailParticleImage();        
        this.AddParticle(x, y, 'maroon', direction, ttl, speed, particleSize, particleSize, image);
    }
};


// Update Functions
$.World.prototype.Update = function () {
    this.UpdateCamera();
    this.Hero.Update();
    this.RoundManager.Update();
    this.UpdateSpawner();
    this.UpdateEnemies();
    this.UpdateBullets();
    this.UpdateParticles();
    this.UpdateCombatText();
    this.UpdateShake();
    this.UpdatePowerUps();
};

$.World.prototype.UpdateCamera = function () {
    $.CanvasBounds.Update();
    
    // Use player bounds to determine map x/y
    // Player coordinates - map >> distance from screen view borders
    var focus = this.Hero.Bounds.Centre;
    var verticalZone = window.innerHeight / 2.5;
    var horizontalZone = window.innerWidth / 2.5;

    if (focus.X - $.CanvasBounds.X + horizontalZone > $.CanvasBounds.Width) {
        // Right movement
        $.CanvasBounds.X = focus.X - ($.CanvasBounds.Width - horizontalZone);
        this.DoTileDraw = true;
    }
    else if (focus.X - horizontalZone < $.CanvasBounds.X) {
        // Left movement
        $.CanvasBounds.X = focus.X - horizontalZone;
        this.DoTileDraw = true;
    }

    if (focus.Y - $.CanvasBounds.Y + verticalZone > $.CanvasBounds.Height) {
        // Down movement
        $.CanvasBounds.Y = focus.Y - ($.CanvasBounds.Height - verticalZone);
        this.DoTileDraw = true;
    }
    else if (focus.Y - verticalZone < $.CanvasBounds.Y) {
        // Up movement
        $.CanvasBounds.Y = focus.Y - verticalZone;
        this.DoTileDraw = true;
    }

    // Prevent camera from moving out of world bounds
    if (!$.CanvasBounds.ContainsRect(this.Map)) {
        if ($.CanvasBounds.X < this.Map.X) {
            $.CanvasBounds.X = this.Map.X;
            this.DoTileDraw = true;
        }
        if ($.CanvasBounds.Y < this.Map.Y) {
            $.CanvasBounds.Y = this.Map.Y;
            this.DoTileDraw = true;
        }
        if ($.CanvasBounds.Right > this.Map.Right) {
            $.CanvasBounds.X = this.Map.Right - $.CanvasBounds.Width;
            this.DoTileDraw = true;
        }
        if ($.CanvasBounds.Bottom > this.Map.Bottom) {
            $.CanvasBounds.Y = this.Map.Bottom - $.CanvasBounds.Height;
            this.DoTileDraw = true;
        }
    }

    this.RenderBounds = new $.Rectangle(
        $.CanvasBounds.X - this.TileSize,
        $.CanvasBounds.Y - this.TileSize,
        $.CanvasBounds.Width + (this.TileSize * 2),
        $.CanvasBounds.Height + (this.TileSize * 2));

    if (this.DoTileDraw) {
        //this.DoMiniMapDraw = true;

        // Fix up high decimal values that causes line artifacts on tiles.
        $.CanvasBounds.X = Math.round($.CanvasBounds.X);
        $.CanvasBounds.Y = Math.round($.CanvasBounds.Y);
    }
};

$.World.prototype.UpdateSpawner = function () {
    if (this.RoundManager.States.Pending == 1) { return; }
    if (this.SpawnedEnemies >= this.SpawnCount) { return; }
    
    var bossRound = false;
    var bossValue = 0;
    var mod = this.RoundManager.WaveIndex % this.LevelModulus;
    if (mod == 1 && this.RoundManager.WaveIndex > this.LevelModulus) {
        // Every this.LevelModulus + 1 level boss level.
        bossRound = true;
        bossValue = Math.floor(this.RoundManager.WaveIndex / this.LevelModulus)
    }    

    this.SpawnTime += $.Delta;
    if (this.SpawnTime >= this.SpawnTick) {
        this.SpawnTime = 0;        

        // Get random angle
        var angle = Math.floor($.RandomBetween(1, 360));
        var radius = $.CanvasBounds.Width >= $.CanvasBounds.Height ? $.CanvasBounds.Width : $.CanvasBounds.Height;
        radius = radius / 2;
        var point = new $.Point(
            this.Hero.Bounds.Centre.X + (Math.cos(angle) * radius),
            this.Hero.Bounds.Centre.Y + (Math.sin(angle) * radius));


        var spawnCommander = false;
        for (var i = 0; i < this.CommanderSpawnIndexes.length; i++) {
            if (this.CommanderSpawnIndexes[i] == this.SpawnedEnemies) {
                spawnCommander = true;
                break;
            }
        }

        var enemyWidth = 50;
        var enemyHeight = 50;
        var enemyType = $.EnemyTypeNormal;
        if (spawnCommander) {
            enemyType = $.EnemyTypeCommander;
            var enemyWidth = 75;
            var enemyHeight = 75;
        }
        if (bossRound) {
            enemyType = $.EnemyTypeBoss;
            var enemyWidth = 115;
            var enemyHeight = 115;
        }



        if (point.X < 0) { point.X = 0; }
        if (point.X > this.Map.Width - enemyWidth) { point.X = this.Map.Width - enemyWidth; }
        if (point.Y < 0) { point.Y = 0; }
        if (point.Y > this.Map.Height - enemyHeight) { point.Y = this.Map.Height - enemyHeight; }
        
        this.Enemies.push(new $.Enemy(point.X, point.Y, this, enemyType, bossValue));

        this.SpawnedEnemies++;
    }
};

$.World.prototype.UpdateEnemies = function () {
    for (var i = 0; i < this.Enemies.length; i++) {
        var enemy = this.Enemies[i];

        // Check if enemy is dead
        if (!enemy.Alive) {
            this.Enemies.splice(i, 1);
            continue;
        }
                
        // Assign nearest enemy to enemy collision
        var nearestIndex = -1;
        var nearestDistance = 0;

        for (var x = 0; x < this.Enemies.length; x++) {
            if (x == i) { continue; }

            var distance = this.Enemies[x].Bounds.Centre.DistanceBetween(enemy.Bounds.Centre);

            if (nearestIndex == -1) {
                nearestIndex = x;
                nearestDistance = distance;
            }

            if (nearestDistance > distance) {
                nearestIndex = x;
                nearestDistance = distance;
            }            
        }

        if (nearestIndex != -1 && enemy.Bounds.IntersectRect(this.Enemies[nearestIndex].Bounds)) {
            enemy.NearestEnemy = this.Enemies[nearestIndex];
        }

        // Push back from hero
        if (enemy.Bounds.IntersectRect(this.Hero.Bounds)) { enemy.PlayerCollision(); }

        enemy.Update();
    }
};

$.World.prototype.UpdateBullets = function () {
    for (var i = 0; i < this.Bullets.length; i++) {
        var bullet = this.Bullets[i];
        var bulletDone = false;


        // Bullet expired
        if (bullet.TTL <= 0) { continue; }


        // Enemy bullet
        if (!bullet.IsPlayer) {

            // Hero hit
            if (bullet.Bounds.IntersectRect(this.Hero.Bounds)) {            
                this.Hero.BulletHit(10);
                bullet.TTL = 0;
                continue;
            }

            // Friendly fire(enemy hit enemy)
            for (var e = 0; e < this.Enemies.length; e++) {
                var enemy = this.Enemies[e];
                if (bullet.Bounds.IntersectRect(enemy.Bounds)) {

                    // Can't shoot it self.
                    if (enemy.EnemyType == $.EnemyTypeBoss || enemy.EnemyType == $.EnemyTypeCommander) { continue; }
                    
                    enemy.BulletHit(this.GetBulletDamage("enemyBullet"));
                    bullet.TTL = 0;
                    bulletDone = true;
                    break;
                }
            }

            // Bullet has hit and must be recycled.
            if (bulletDone) { continue; }
        }


        // Enemy hit        
        if (bullet.IsPlayer) {
            for (var e = 0; e < this.Enemies.length; e++) {
                var enemy = this.Enemies[e];
                if (bullet.Bounds.IntersectRect(enemy.Bounds)) {
                    enemy.BulletHit(this.GetBulletDamage("bullet"));

                    if (bullet.Pierce && bullet.HitCount > 0) {
                        bullet.HitCount--;
                    }
                    else {
                        bullet.TTL = 0;
                        bulletDone = true;
                        break;
                    }
                }
            }

            // Bullet has hit and must be recycled.
            if (bulletDone) { continue; }
        }


        bullet.Update();
    }
};

$.World.prototype.UpdateParticles = function () {
    for (var i = 0; i < this.Particles.length; i++) {
        var particle = this.Particles[i];
        if (particle.TTL <= 0) {
            continue;
        }

        particle.Update();
    }
};

$.World.prototype.UpdateCombatText = function () {
    for (var i = 0; i < this.CombatTexts.length; i++) {
        var text = this.CombatTexts[i];
        if (text.TTL <= 0) {
            this.CombatTexts.splice(i, 1);
            continue;
        }

        text.Update();
    }
};

$.World.prototype.UpdateShake = function () {
    var x = 0;
    var y = 0;

    if (this.ShakeLevel > 0) {
        this.ShakeLevel -= 0.4;
        this.ShakeLevel = (this.ShakeLevel < 0) ? 0 : this.ShakeLevel;
        x = Math.floor($.RandomBetween(-this.ShakeLevel, this.ShakeLevel));
        y = Math.floor($.RandomBetween(-this.ShakeLevel, this.ShakeLevel));
        this.DoTileDraw = true;
    }
    else {
        this.ShakeLevel = 0;        
    }

    $.CanvasBounds.X += x;
    $.CanvasBounds.Y += y;
};

$.World.prototype.UpdatePowerUps = function () {
    for (var i = 0; i < this.PowerUps.length; i++) {
        var powerUp = this.PowerUps[i];

        // Check expire
        if (powerUp.TTL <= 0) {
            this.PowerUps.splice(i, 1);
            continue;
        }

        // Check player collision
        if (powerUp.Bounds.IntersectRect(this.Hero.Bounds)) {
            this.Hero.CollectPowerUp(powerUp);
            this.PowerUps.splice(i, 1);
            continue;
        }

        powerUp.Update();
    }

    this.PowerUpTime += $.Delta;
    if (this.PowerUpTime >= this.PowerUpTick) {
        this.PowerUpTime = 0;

        if (this.PowerUps.length > this.MaxPowerUps) { return; }

        var spawnHP = this.Hero.HP < this.Hero.MaxHP;
        var start = spawnHP ? 1.99 : 4.99;
        var powerUpType = 0;
        var random = Math.floor($.RandomBetween(start, 18.99));
        if (random >= 1 && random <= 3) { powerUpType = $.PowerUpTypeHP; }
        else if (random >= 4 && random <= 6) { powerUpType = $.PowerUpTypeSpeed; }
        else if (random >= 7 && random <= 9) { powerUpType = $.PowerUpTypeInvulnerable; }
        else if (random >= 10 && random <= 12) { powerUpType = $.PowerUpTypePierce; }
        else if (random >= 13 && random <= 15) { powerUpType = $.PowerUpTypeRapidFire; }
        else if (random >= 16 && random <= 18) { powerUpType = $.PowerUpTypeTripleShot; }
        else { return; }

        var x = $.RandomBetween(0, this.Map.Width - 25);
        var y = $.RandomBetween(0, this.Map.Height - 25);

        var powerUp = new $.PowerUp(x, y, powerUpType);
        this.PowerUps.push(powerUp);

        // Chance to spawn additional hp
        if (spawnHP) {            
            var random = $.RandomBetween(0, 10);
            if (random > 5) {
                x = $.RandomBetween(0, this.Map.Width - 25);
                y = $.RandomBetween(0, this.Map.Height - 25);

                powerUp = new $.PowerUp(x, y, $.PowerUpTypeHP);
                this.PowerUps.push(powerUp);
            }
        }
    }
};


// Draw Functions
$.World.prototype.Draw = function () {
    $.Gtx1.clearRect(0, 0, $.CanvasWidth, $.CanvasHeight);
    $.Gtx3.clearRect(0, 0, $.CanvasWidth, $.CanvasHeight);
    this.DrawTiles();
    this.Hero.Draw();
    this.DrawWaveInfo();
    this.DrawTiles();
    this.DrawEnemies();
    this.DrawBullets();
    this.DrawParticles();
    //this.DrawInfo();
    this.DrawMiniMap();
    this.DrawCombatText();    
    this.DrawPowerUps();
    this.DrawPowerUpCoolDowns();
    this.DrawHUD();
};

$.World.prototype.DrawWaveInfo = function () {
    if (this.RoundManager.States.Pending == 1) {
        $.Gtx1.save();
        $.Gtx1.globalAlpha = 0.7;

        var fontSize = 120;
        var text = Math.round(this.RoundManager.WaitTime);
        if (text < 1) {
            var mod = (this.RoundManager.WaveIndex + 1) % this.LevelModulus;
            if (mod == 1 && this.RoundManager.WaveIndex > 1) {
                text = "BOSS Round"
            }
            else {
                var round = parseInt(this.RoundManager.WaveIndex) + 1;
                text = "Round " + round;
            }
        }
                
        $.Gtx1.fillStyle = "black";
        $.Gtx1.font = fontSize + "px Impact";

        var textLength = $.Gtx1.measureText(text).width;
        var x = ($.CanvasWidth / 2) - (textLength / 2);
        var y = ($.CanvasHeight / 2) - (fontSize / 2) - 100;

        $.Gtx1.fillText(text, x + 1.5, y + 1.5);

        $.Gtx1.fillStyle = "yellow";
        $.Gtx1.fillText(text, x, y);

        $.Gtx1.restore();
    }
};

$.World.prototype.DrawTiles = function () {
    if (!this.DoTileDraw) { return; }
    $.Gtx.clearRect(0, 0, $.CanvasWidth, $.CanvasHeight);

    for (var col = 0; col < this.TileCols; col++) {
        for (var row = 0; row < this.TileRows; row++) {
            this.Tiles[col][row].Draw();
        }
    }

    this.DoTileDraw = false;
};

$.World.prototype.DrawEnemies = function () {
    for (var i = 0; i < this.Enemies.length; i++) {
        this.Enemies[i].Draw();
    }
};

$.World.prototype.DrawBullets = function () {
    for (var i = 0; i < this.Bullets.length; i++) {
        var bullet = this.Bullets[i];

        if (bullet.TTL <= 0) { continue; }

        bullet.Draw();
    }
};

$.World.prototype.DrawParticles = function () {
    // Set the blending operation.
    //$.Gtx1.save();
    //$.Gtx1.globalCompositeOperation = "difference";
    //$.Gtx1.globalAlpha = 0.8;

    for (var i = 0; i < this.Particles.length; i++) {
        var particle = this.Particles[i];
        if (particle.TTL <= 0) {
            continue;
        }

        particle.Draw($.Gtx1);
    }

    //$.Gtx1.restore();
};

$.World.prototype.DrawInfo = function () {
    $.Gtx.font = "20px Impact Bold";

    var info = [
        "FPS: " + $.FPS.GetFPS(),        
        "Enemies: " + this.SpawnedEnemies + "/" + this.SpawnCount,
        "Enemy Score: " + $.GetTotalScore(),
        "CanvasX: " + $.CanvasBounds.X,
        "CanvasY: " + $.CanvasBounds.Y,
    ];
    
    var y = 200;
    for (var i = 0; i < info.length; i++) {
        $.Gtx1.fillStyle = "black";
        $.Gtx1.fillText(info[i], 20.5, y + 0.5);
        $.Gtx1.fillStyle = "white";
        $.Gtx1.fillText(info[i], 20, y);
        y += 20;
    }    
};

$.World.prototype.DrawMiniMap = function () {
    if (!this.ShowMiniMap) { return; }

    var mapRect = new $.Rectangle(
    $.CanvasBounds.Width - (this.MiniMapWidth + 10),
    $.CanvasBounds.Height - (this.MiniMapHeight + 10),
    this.MiniMapWidth,
    this.MiniMapHeight);

    // Hero
    var px = mapRect.X + this.Hero.Bounds.Centre.X / this.MiniDivider;
    var py = mapRect.Y + this.Hero.Bounds.Centre.Y / this.MiniDivider;
    
    $.Gtx3.fillStyle = "lightblue";
    $.Gtx3.fillRect(px, py, 3, 3);

    // Enemies
    for (var i = 0; i < this.Enemies.length; i++) {
        var enemy = this.Enemies[i];

        px = mapRect.X + enemy.Bounds.Centre.X / this.MiniDivider;
        py = mapRect.Y + enemy.Bounds.Centre.Y / this.MiniDivider;

        $.Gtx3.fillStyle = "lime";
        $.Gtx3.fillRect(px, py, 3, 3);
    }
    
    // Power ups
    for (var i = 0; i < this.PowerUps.length; i++) {
        var powerUp = this.PowerUps[i];
        px = mapRect.X + powerUp.Bounds.Centre.X / this.MiniDivider;
        py = mapRect.Y + powerUp.Bounds.Centre.Y / this.MiniDivider;

        // TODO:
        // use pulse opacity to show items on map
        $.Gtx3.fillStyle = powerUp.Color;
        $.Gtx3.fillRect(px, py, 2, 2);
    }


    if (!this.DoMiniMapDraw) { return; }

    $.Gtx2.save();
    $.Gtx2.globalAlpha = 0.6;
    $.Gtx2.fillStyle = "black";
    $.Gtx2.fillRect(mapRect.X, mapRect.Y, mapRect.Width, mapRect.Height);

    // NOTE:
    // Since width/height are equal we only need 1 tile size,
    // if this changes, implement tileWidth and tileHeight.
    var miniTileSize = this.MiniMapWidth / this.TileCols;

    for (var col = 0; col < this.TileCols; col++) {
        for (var row = 0; row < this.TileRows; row++) {

            var x = mapRect.X + col * miniTileSize;
            var y = mapRect.Y + row * miniTileSize;

            var tile = this.Tiles[col][row];

            $.Gtx2.fillStyle = tile.Color;
            $.Gtx2.fillRect(x, y, miniTileSize, miniTileSize);
        }
    }

    $.Gtx2.drawImage(
        $.MiniMapImage, 
        mapRect.X - 4, 
        mapRect.Y - 4, 
        this.MiniMapHeight + 10, 
        this.MiniMapWidth + 10);

    $.Gtx2.restore();

    this.DoMiniMapDraw = false;
};

$.World.prototype.DrawCombatText = function () {
    $.Gtx1.save();
    $.Gtx1.globalCompositeOperation = "multiply";

    for (var i = 0; i < this.CombatTexts.length; i++) {
        this.CombatTexts[i].Draw($.Gtx1);
    }

    $.Gtx1.restore();
};

$.World.prototype.DrawPowerUps = function () {
    for (var i = 0; i < this.PowerUps.length; i++) {
        var powerUp = this.PowerUps[i];
        powerUp.Draw();

        //if (!$.CanvasBounds.ContainsRect(powerUp.Bounds)) {
        //    var radians = $.GetRadiansFromPoints(powerUp.Bounds.Centre, $.CanvasBounds.Centre);
        //    var x = ($.CanvasBounds.Centre.X + (Math.cos(radians) * $.CanvasBounds.Radius)) - $.CanvasBounds.X;
        //    var y = ($.CanvasBounds.Centre.Y + (Math.sin(radians) * $.CanvasBounds.Radius)) - $.CanvasBounds.Y;

        //    var gradient = $.Gtx3.createRadialGradient(x, y, 0, x, y, 300);
        //    gradient.addColorStop(1, "transparent");
        //    gradient.addColorStop(0, powerUp.Color);

        //    $.Gtx3.save();
        //    $.Gtx3.globalAlpha = powerUp.PulseOpacity;
        //    $.Gtx3.fillStyle = gradient;
        //    $.Gtx3.beginPath();
        //    $.Gtx3.arc(x, y, 300, 0, 2 * Math.PI);
        //    $.Gtx3.fill();
        //    $.Gtx3.restore();
        //}
    }
};

$.World.prototype.DrawPowerUpCoolDowns = function () {
    var player = this.Hero;
    var coolDownCount = 0;

    if (player.SpeedBoost) { coolDownCount++; }
    if (player.Invulnerable) { coolDownCount++; }
    if (player.Pierce) { coolDownCount++; }
    if (player.RapidFire) { coolDownCount++; }
    if (player.TripleShot) { coolDownCount++; }

    var x = 10;//$.CanvasWidth / 2;
    var y = 75;//20;
    var length = 0;
    var itemSize = 48;
    var itemPadding = 5;
    
    // Calculate the drawing start point.
    for (var i = 0; i < coolDownCount; i++) {
        if (i == coolDownCount - 1) {
            length += itemSize;
        }
        else {
            length += itemSize;
            length += itemPadding
        }
    }

    //x -= length / 2;

    $.Gtx3.save();
    $.Gtx3.globalAlpha = 0.7;    
    $.Gtx3.font = "24px Impact";
    
    if (player.SpeedBoost) {
        $.Gtx3.drawImage($.SpeedBoostImage, 0, 0, 64, 64, x, y, itemSize, itemSize);

        $.Gtx3.fillStyle = "black";
        $.Gtx3.fillText(Math.round(player.SpeedBoostTime), x + 0.5, y + 24.5);

        $.Gtx3.fillStyle = "white";
        $.Gtx3.fillText(Math.round(player.SpeedBoostTime), x, y + 24);

        x += itemSize;
        x += itemPadding;        
    }

    if (player.Invulnerable) {
        $.Gtx3.drawImage($.InvulnerableImage, 0, 0, 64, 64, x, y, itemSize, itemSize);

        $.Gtx3.fillStyle = "black";
        $.Gtx3.fillText(Math.round(player.InvulnerableTime), x + 0.5, y + 24.5);

        $.Gtx3.fillStyle = "white";
        $.Gtx3.fillText(Math.round(player.InvulnerableTime), x, y + 24);
        x += itemSize;
        x += itemPadding;
    }

    if (player.Pierce) {
        $.Gtx3.drawImage($.PierceImage, 0, 0, 64, 64, x, y, itemSize, itemSize);

        $.Gtx3.fillStyle = "black";
        $.Gtx3.fillText(Math.round(player.PierceTime), x + 0.5, y + 24.5);

        $.Gtx3.fillStyle = "white";
        $.Gtx3.fillText(Math.round(player.PierceTime), x, y + 24);
        x += itemSize;
        x += itemPadding;        
    }

    if (player.RapidFire) {
        $.Gtx3.drawImage($.RapidFireImage, 0, 0, 64, 64, x, y, itemSize, itemSize);

        $.Gtx3.fillStyle = "black";
        $.Gtx3.fillText(Math.round(player.RapidFireTime), x + 0.5, y + 24.5);

        $.Gtx3.fillStyle = "white";
        $.Gtx3.fillText(Math.round(player.RapidFireTime), x, y + 24);
        x += itemSize;
        x += itemPadding;        
    }

    if (player.TripleShot) {
        $.Gtx3.drawImage($.TripleShotImage, 0, 0, 64, 64, x, y, itemSize, itemSize);

        $.Gtx3.fillStyle = "black";
        $.Gtx3.fillText(Math.round(player.TripleShotTime), x + 0.5, y + 24.5);

        $.Gtx3.fillStyle = "white";
        $.Gtx3.fillText(Math.round(player.TripleShotTime), x, y + 24);        
    }

    $.Gtx3.restore();
};

$.World.prototype.DrawHUD = function () {
    // HERO
    $.Gtx3.save();
    $.Gtx3.globalAlpha = 0.8;
    $.Gtx3.drawImage($.HeroBaseImage, 0,  0,  50,  50,  10,  10,  50,  50);
    $.Gtx3.restore();

    $.Gtx3.save();
    $.Gtx3.globalAlpha = 0.7;
    var x = 75;
    var y = 15;
    var w = 200;
    var h = 35;
    var percentage = this.Hero.HP * 100 / this.Hero.MaxHP;
    var hpLength = (w - 22) * percentage / 100;

    $.Gtx3.fillStyle = 'red';
    $.Gtx3.fillRect(x + 10, y + 5, w - 22, h - 10);

    $.Gtx3.fillStyle = 'lime';
    $.Gtx3.fillRect(x + 10, y + 5, hpLength, h - 10);

    $.Gtx3.drawImage($.HeroHPImage, x, y, w, h);


    // BOSS 
    var mod = this.RoundManager.WaveIndex % this.LevelModulus;
    if (mod == 1 && this.RoundManager.WaveIndex > this.LevelModulus) {
        // TODO:
        // Draw boss hud's
    }


    // CURSOR
    $.Gtx3.drawImage($.CursorImage, $.MousePoint.X, $.MousePoint.Y, 25, 25);
    $.Gtx3.restore();
};
