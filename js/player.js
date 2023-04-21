$.Player = function () {
    var spawn = this.GenerateSpawnPoint();
    this.Bounds = new $.Rectangle(spawn.X, spawn.Y, 125, 125);
    this.Aim = 0;
    this.Rotation = 0;
    this.RotationVelocity = 0;
    this.RotationDeceleration = 0.92;
    this.Direction = $.none;
    this.Acceleration = 50;
    this.Deceleration = 0.9;
    this.MaxVelocity = 300;
    this.AccelerationTurnSpeed = 2;
    this.TurnSpeed = 4;
    this.Velocity = new $.Point(0, 0);
    this.Moving = false;

    this.MaxHP = 75;
    this.HP = this.MaxHP;

    this.BulletRate = 0.2;
    this.BulletTime = this.BulletRate;
    this.Bullets = [];    

    this.SetupPowerUpTimers();
    this.CurrentTile = null;
    this.SetupAnimations();

    this.ShootSound = new $.Sound('sounds/shoot1.mp3', 3);
    this.PowerupSound = new $.Sound('sounds/powerup.mp3', 3);
};


$.Player.prototype.SetupPowerUpTimers = function () {
    this.SpeedBoost = false;
    this.SpeedBoostTick = 18;
    this.SpeedBoostTime = 0;

    this.Invulnerable = false;
    this.InvulnerableTick = 18;
    this.InvulnerableTime = 0;

    this.Pierce = false;
    this.PierceTick = 15;
    this.PierceTime = 0;

    this.RapidFire = false;
    this.RapidFireTick = 10;
    this.RapidFireTime = 0;

    this.TripleShot = false;
    this.TripleShotTick = 12;
    this.TripleShotTime = 0;
};

$.Player.prototype.GenerateSpawnPoint = function () {
    var spawn = new $.Point(0, 0);

    while (spawn.X == 0 && spawn.Y == 0) {
        var rx = $.RandomBetween(0, $.GameWorld.Map.Width);
        var ry = $.RandomBetween(0, $.GameWorld.Map.Height);

        var tx = Math.floor(rx / $.GameWorld.TileSize);
        var ty = Math.floor(ry/ $.GameWorld.TileSize);

        if ($.GridContainsTile(tx, ty, $.GameWorld.TileCols, $.GameWorld.TileRows)) {
            var tile = $.GameWorld.Tiles[tx][ty];
            if (tile.Simplex > -0.7) {
                spawn = new $.Point(
                    tx * $.GameWorld.TileSize + $.GameWorld.TileSize / 2,
                    ty * $.GameWorld.TileSize + $.GameWorld.TileSize / 2);
                continue;
            }
        }

        spawn = new $.Point(0, 0);
    }

    return spawn;
};

$.Player.prototype.SetupAnimations = function () {
    this.MoveAnimation = new $.Animation($.HeroBaseImage, [0, 1, 2], 50, 50, 0, 0.2, true);
    this.MoveAnimation.Play();

    this.IdleAnimation = new $.Animation($.HeroBaseImage, [9, 10, 11], 50, 50, 0, 0.4, true);
    this.IdleAnimation.Play();

    this.ShootIdleAnimation = new $.Animation($.HeroBaseImage, [12, 13, 14, 15, 16, 17], 50, 50, 0, 0.3, true);
    this.ShootIdleAnimation.Play();

    this.ShootMoveAnimation = new $.Animation($.HeroBaseImage, [3, 4, 5, 6, 7, 8], 50, 50, 0, 0.2, true);
    this.ShootMoveAnimation.Play();

    this.CurrentAnimation = this.IdleAnimation;
};

$.Player.prototype.ColorFromPowerUp = function () {
    var color = "white";

    if (this.Pierce) { color = "maroon"; }
    if (this.RapidFire) { color = "purple"; }
    if (this.TripleShot) { color = "blue"; }

    return color;
};

$.Player.prototype.ShootBullet = function () {
    var mouse = new $.Point($.MousePoint.X + $.CanvasBounds.X, $.MousePoint.Y + $.CanvasBounds.Y);

    var speed = 800;
    var size = 12;
    var ttl = 3.5;
    var shots = this.TripleShot ? 3 : 1;    
    var angle = Math.atan2(
        mouse.Y - this.Bounds.Centre.Y,
        mouse.X - this.Bounds.Centre.X) * 180 / Math.PI;
    var color = this.ColorFromPowerUp();

    for (var i = 0; i < shots; i++) {
        var aim;
        var newAngle = angle;
        var radians;
        var direction;

        if (shots > 1 && i == 0) {
            // left angle
            newAngle -= 15;
            radians = newAngle * Math.PI / 180;
            aim = new $.Point(this.Bounds.Centre.X + Math.cos(radians) * 200, this.Bounds.Centre.Y + Math.sin(radians) * 200);
            direction = aim.Normalize(this.Bounds.Centre);
        }
        else if (shots > 1 && i == 2) {
            // right angle
            newAngle += 15;
            radians = newAngle * Math.PI / 180;
            aim = new $.Point(this.Bounds.Centre.X + Math.cos(radians) * 200, this.Bounds.Centre.Y + Math.sin(radians) * 200);
            direction = aim.Normalize(this.Bounds.Centre);
        }
        else {
            direction = mouse.Normalize(this.Bounds.Centre);
        }
                
        var x = this.Bounds.Centre.X - size / 2;
        var y = this.Bounds.Centre.Y - size / 2;                    
        $.GameWorld.AddBullet(
            true, 
            x,
            y,
            direction,
            speed,
            size,
            ttl,
            color,
            this.Pierce ? true : false);
    }

    $.Score.BulletsFired += shots;    
    this.ShootSound.Play();
};

$.Player.prototype.MeleeHit = function (dp) {
    if (this.Invulnerable) {
        // TODO:
        // Show invulnerable hit effect.
        return;
    }

    this.HP -= dp;
    $.GameWorld.AddPlayerMeleeHitEffect();

    if (this.HP <= 0) {
        // Player is dead
        $.SetGameState($.GameStateGameOver);
    }
};

$.Player.prototype.BulletHit = function (dp) {
    if (this.Invulnerable) {
        // TODO:
        // Show invulnerable hit effect.
        return;
    }

    this.HP -= dp;
    $.GameWorld.AddPlayerBulletHitEffect();

    if (this.HP <= 0) {
        // TODO:
        // Died!
        $.MenuQuitGame();
    }
};

$.Player.prototype.GetMoveSpeed = function () {
    if (this.CurrentTile == null) { return this.Acceleration; }

    var simplex = this.CurrentTile.Simplex;
    var newSpeed = this.SpeedBoost ? this.Acceleration + (this.Acceleration / 3) : this.Acceleration;

    if (simplex <= -0.7) {// blue
        newSpeed -= newSpeed / 4;
    }

    return newSpeed;
};

$.Player.prototype.CollectPowerUp = function (powerUp) {
    var point = new $.Point(powerUp.Bounds.Centre.X, powerUp.Bounds.Centre.Y);
    var font = "42px Impact";

    switch (powerUp.PowerUpType) {
        case $.PowerUpTypeHP:
            this.HP += Math.floor(this.MaxHP / 5);
            if (this.HP > this.MaxHP) { this.HP = this.MaxHP; }
            $.GameWorld.AddText(powerUp.Color, "+hp", point, font);
            break;

        case $.PowerUpTypeSpeed:
            this.SpeedBoost = true;
            this.SpeedBoostTime = this.SpeedBoostTick;
            $.GameWorld.AddText(powerUp.Color, "speed", point, font);
            break;

        case $.PowerUpTypeInvulnerable:
            this.Invulnerable = true;
            this.InvulnerableTime = this.InvulnerableTick;
            $.GameWorld.AddText(powerUp.Color, "invulnerable", point, font);
            break;

        case $.PowerUpTypePierce:
            this.Pierce = true;
            this.PierceTime = this.PierceTick;
            $.GameWorld.AddText(powerUp.Color, "pierce", point, font);
            break;

        case $.PowerUpTypeRapidFire:
            this.RapidFire = true;
            this.RapidFireTime = this.RapidFireTick;
            $.GameWorld.AddText(powerUp.Color, "rapid fire", point, font);
            break;

        case $.PowerUpTypeTripleShot:
            this.TripleShot = true;
            this.TripleShotTime = this.TripleShotTick;
            $.GameWorld.AddText(powerUp.Color, "triple shot", point, font);
            break;

        default:
            $.GameWorld.AddText("white", "pU " + powerUp.PowerUpType, point, font);
            break;
    }

    $.Score.PowerUps += 25;
    this.PowerupSound.Play();
};


$.Player.prototype.Update = function () {
    this.Bounds.Update();
    this.UpdateCurrentTile();
    this.UpdateAim();
    this.UpdateRotation();
    //this.UpdateDirection();
    this.UpdateMovement();
    this.UpdateShooting();
    this.UpdatePowerUps();
    this.CurrentAnimation.Update();
    this.UpdateCollision();
    this.UpdateJetTrails();
};

$.Player.prototype.UpdateCurrentTile = function () {
    var tx = Math.floor(this.Bounds.Centre.X / $.GameWorld.TileSize);
    var ty = Math.floor(this.Bounds.Centre.Y / $.GameWorld.TileSize);

    if ($.GridContainsTile(tx, ty, $.GameWorld.TileCols, $.GameWorld.TileRows)) {
        this.CurrentTile = $.GameWorld.Tiles[tx][ty];
    }
};

$.Player.prototype.UpdateRotation = function () {
    var accelerate = false;
    var speed = this.GetMoveSpeed() * $.Delta;

    if ($.Keys[$.KeyCodes.W] || $.Keys[$.KeyCodes.UP]) {
        accelerate = true;
    }

    if ($.Keys[$.KeyCodes.A] || $.Keys[$.KeyCodes.LEFT]) {
        this.RotationVelocity = accelerate ? -this.AccelerationTurnSpeed : -this.TurnSpeed;
    }

    if ($.Keys[$.KeyCodes.D] || $.Keys[$.KeyCodes.RIGHT]) {
        this.RotationVelocity = accelerate ? this.AccelerationTurnSpeed : this.TurnSpeed;
    }

    if (accelerate) {
        // Create a fake target destination in the line of the angle.
        var point = $.FromAngle(this.Rotation * (Math.PI / 180), 100);
        point.Add(this.Bounds.Centre);
        var direction = this.Bounds.Centre.Normalize(point);
        
        this.Velocity.X += speed * direction.X;
        this.Velocity.Y += speed * direction.Y;        
    }

    // Apply rotation deceleration
    this.RotationVelocity *= this.RotationDeceleration;

    // Apply rotation force
    this.Rotation += this.RotationVelocity;

    this.Moving = accelerate;
};

$.Player.prototype.UpdateAim = function () {
    var mouse = new $.Point($.MousePoint.X + $.CanvasBounds.X, $.MousePoint.Y + $.CanvasBounds.Y);

    var aim = $.CalculateAngle(this.Bounds.Centre, mouse);
    this.Aim = ((aim) * (Math.PI / 180));
};

$.Player.prototype.UpdateDirection = function () {
    var xMove = 0;
    var yMove = 0;
    var speed = this.GetMoveSpeed() * $.Delta;

    var left = false;
    var right = false;
    var up = false;
    var down = false;

    if ($.Keys[$.KeyCodes.A]) { // A Key		
        xMove = -speed;
        left = true;
    }
    if ($.Keys[$.KeyCodes.D]) { // D Key
        xMove = speed;
        right = true;
    }
    if ($.Keys[$.KeyCodes.S]) { // S Key
        yMove = speed;
        down = true;
    }
    if ($.Keys[$.KeyCodes.W]) { // W Key
        yMove = -speed;
        up = true;
    }

    if (up && !left && !right) {
        this.Direction = $.north;
    }
    if (up && right) {
        this.Direction = $.northEast;
    }
    if (right && !up && !down) {
        this.Direction = $.east;
    }
    if (right && down) {
        this.Direction = $.southEast;
    }
    if (down && !right && !left) {
        this.Direction = $.south;
    }
    if (down && left) {
        this.Direction = $.southWest;
    }
    if (left && !down && !up) {
        this.Direction = $.west;
    }
    if (left && up) {
        this.Direction = $.northWest
    }
    if (!left && !up && !right && !down) {
        //this.Direction = $.none;        
    }

    this.Velocity.X += xMove;
    this.Velocity.Y += yMove;
}

$.Player.prototype.UpdateMovement = function () {
    this.Velocity.Truncate(this.MaxVelocity);

    this.Bounds.X += this.Velocity.X;
    this.Bounds.Y += this.Velocity.Y;

    this.Velocity.X *= this.Deceleration;
    this.Velocity.Y *= this.Deceleration;
}

$.Player.prototype.UpdateCollision = function () {
    if (!this.Bounds.ContainsRect($.GameWorld.Map)) {
        if (this.Bounds.X < $.GameWorld.Map.X) {
            this.Bounds.X = $.GameWorld.Map.X;
        }
        if (this.Bounds.Y < $.GameWorld.Map.Y) {
            this.Bounds.Y = $.GameWorld.Map.Y;
        }
        if (this.Bounds.Right > $.GameWorld.Map.Right) {
            this.Bounds.X = $.GameWorld.Map.Right - this.Bounds.Width;
        }
        if (this.Bounds.Bottom > $.GameWorld.Map.Bottom) {
            this.Bounds.Y = $.GameWorld.Map.Bottom - this.Bounds.Height;
        }
    }
};

$.Player.prototype.UpdateShooting = function () {
    if ($.IsMouseDown) {
        var bulletRate = this.RapidFire ? this.BulletRate / 1.5 : this.BulletRate;
        this.BulletTime += $.Delta;
        if (this.BulletTime >= bulletRate) {
            this.BulletTime = 0;
            this.ShootBullet();
        }

        if (this.Moving) {
            this.CurrentAnimation = this.ShootMoveAnimation;
        }
        else {
            this.CurrentAnimation = this.ShootIdleAnimation;
        }
    }
    else {
        this.BulletTime = this.BulletRate;
        if (this.Moving) {
            this.CurrentAnimation = this.MoveAnimation;
        }
        else {
            this.CurrentAnimation = this.IdleAnimation;
        }
    }
};

$.Player.prototype.UpdatePowerUps = function () {
    // Speed
    if (this.SpeedBoost) {
        this.SpeedBoostTime -= $.Delta;
        if (this.SpeedBoostTime <= 0) { this.SpeedBoost = false; }
    }

    // Invulnerable
    if (this.Invulnerable) {
        this.InvulnerableTime -= $.Delta;
        if (this.InvulnerableTime <= 0) { this.Invulnerable = false; }
    }

    // Pierce
    if (this.Pierce) {
        this.PierceTime -= $.Delta;
        if (this.PierceTime <= 0) { this.Pierce = false; }
    }

    // RapidFire
    if (this.RapidFire) {
        this.RapidFireTime -= $.Delta;
        if (this.RapidFireTime <= 0) { this.RapidFire = false; }
    }

    // TripleShot
    if (this.TripleShot) {
        this.TripleShotTime -= $.Delta;
        if (this.TripleShotTime <= 0) { this.TripleShot = false; }
    }
};

$.Player.prototype.UpdateJetTrails = function () {
    if (this.Moving) {
        var particleSize = $.RandomBetween(9, 12);
        var ttl = $.RandomBetween(0.3, 1);

        var leftPoint = new $.Point(this.Bounds.Left + (this.Bounds.Width / 4), this.Bounds.Bottom);
        var rightPoint = new $.Point(this.Bounds.Right - (this.Bounds.Width / 4), this.Bounds.Bottom);

        var radians = (this.Rotation - 90) * (Math.PI / 180);
        var rotationPoint = new $.Point(this.Bounds.Centre.X, this.Bounds.Centre.Y);

        var leftPointRotated = leftPoint.RotatePoint(rotationPoint, radians);
        var rightPointRotated = rightPoint.RotatePoint(rotationPoint, radians);

        $.GameWorld.EmitParticles(leftPointRotated, ttl, particleSize, this.Velocity);
        $.GameWorld.EmitParticles(rightPointRotated, ttl, particleSize, this.Velocity);
    }
};

$.Player.prototype.Draw = function () {
    //this.DrawLaser();
    this.DrawBody();    
    this.DrawHP();
};

$.Player.prototype.DrawLaser = function () {
    if (!$.IsMouseDown) { return; }

    var x = this.Bounds.Centre.X - $.CanvasBounds.X;
    var y = this.Bounds.Centre.Y - $.CanvasBounds.Y;

    var mouse = new $.Point($.MousePoint.X + $.CanvasBounds.X, $.MousePoint.Y + $.CanvasBounds.Y);
    var point = new $.Point(x + Math.sin(this.Aim), y + Math.cos(this.Aim));

    var w = 50;
    var h = this.Bounds.Centre.DistanceBetween(mouse);

    $.Gtx1.save();
    $.Gtx1.translate(point.X, point.Y);
    $.Gtx1.rotate(this.Aim);
    $.Gtx1.drawImage(
        $.LaserImage,
        -(w / 2),
        -h,
        w,
        h);
    $.Gtx1.restore();
}

$.Player.prototype.DrawBody = function () {
    var x = this.Bounds.Centre.X - $.CanvasBounds.X;
    var y = this.Bounds.Centre.Y - $.CanvasBounds.Y;

    $.Gtx1.fillStyle = 'red';
    $.Gtx1.save();
    $.Gtx1.translate(x, y);
    $.Gtx1.rotate((this.Rotation - 90) * (Math.PI / 180));
    //$.Gtx1.fillRect(
    this.CurrentAnimation.Draw(
    //$.Gtx1.drawImage(
		//$.HeroBaseImage,
		-((this.Bounds.Width) / 2),
		-((this.Bounds.Height) / 2),
		this.Bounds.Width,
		this.Bounds.Height,
        $.Gtx1);
    $.Gtx1.restore();

    //$.Gtx1.save();
    //$.Gtx1.translate(x, y);    
    //$.Gtx1.rotate(this.Aim);
    //this.CurrentAnimation.Draw(
    ////$.Gtx1.drawImage(
    // //$.HeroShooterImage,
    //    -((this.Bounds.Width) / 2),
    //    -((this.Bounds.Height) / 2),
    //    this.Bounds.Width,
    //    this.Bounds.Height,
    //    $.Gtx1);
    //$.Gtx1.restore();
};

$.Player.prototype.DrawHP = function () {
    var percentage = this.HP * 100 / this.MaxHP;
    var barWidth = this.Bounds.Width / 1.6;
    var barHeight = 10;
    var hFloat = 15;
    var hpLength = barWidth * percentage / 100;

    var x = this.Bounds.Centre.X - $.CanvasBounds.X - (barWidth / 2);
    var y = this.Bounds.Y - $.CanvasBounds.Y;

    $.Gtx1.fillStyle = 'black';
    $.Gtx1.fillRect(
        x - 0.5,
        y - hFloat + 0.5,
        barWidth + 1,
        barHeight + 1);

    $.Gtx1.fillStyle = 'red';
    $.Gtx1.fillRect(
        x,
        y - hFloat,
        barWidth,
        barHeight);

    $.Gtx1.fillStyle = 'lime';
    $.Gtx1.fillRect(
        x,
        y - hFloat,
        hpLength,
        barHeight);
};