$.Enemy = function (x, y, gameWorld, enemyType, bossValue) {
    this.GameWorld = gameWorld;
    this.EnemyType = enemyType;

    this.Velocity = new $.Point(0, 0);
    this.DesiredVelocity = new $.Point(0, 0);
    this.MaxCollisionForce = 2;
    this.Alive = true;
    this.Target = null;
    this.Rotation = 0;
    this.Charging = false;
    this.CurrentTile = null;
    this.MaxSteerForce = 0.8;
    this.BossValue = bossValue ? bossValue : 0;

    this.Enemy1MinSpeed = 150;
    this.Enemy1MaxSpeed = 180;

    this.CalculateAttributes(x, y);
    this.SetupAnimations();
    this.SetupStates();
    this.ToggleState(this.StateMoving);

    this.KilledSound = new $.Sound('sounds/shoot.mp3', 1);
    this.MeleeSound = new $.Sound('sounds/melee2.mp3', 1);
};


$.Enemy.prototype.CalculateAttributes = function (x, y) {
    switch (this.EnemyType) {
        case $.EnemyTypeNormal:
            this.Bounds = new $.Rectangle(x, y, 100, 100);
            this.Speed = Math.floor($.RandomBetween(this.Enemy1MinSpeed, this.Enemy1MaxSpeed));
            this.MaxHP = 12;
            this.HP = this.MaxHP;
            this.MaxEnergy = Math.floor($.RandomBetween(450, 500));
            this.Energy = Math.floor($.RandomBetween(0, this.MaxEnergy));
            this.MeleeAttackTick = 0.8;
            this.MeleeAttackTime = this.MeleeAttackTick;
            this.KillScore = 10;
            this.EnergyRegen = 5;
            break;
        case $.EnemyTypeCommander:
            this.Bounds = new $.Rectangle(x, y, 75, 75);
            this.Speed = Math.floor($.RandomBetween(200, 220));
            this.MaxHP = 25;
            this.HP = this.MaxHP;
            this.MaxEnergy = Math.floor($.RandomBetween(300, 350));
            this.Energy = this.MaxEnergy;
            this.MeleeAttackTick = 0.4;
            this.MeleeAttackTime = this.MeleeAttackTick;
            this.KillScore = 25;
            this.EnergyRegen = 6;
            break;
        case $.EnemyTypeBoss:
            this.Bounds = new $.Rectangle(x, y, 115, 115);
            this.Speed = Math.floor($.RandomBetween(160, 180));
            this.MaxHP = 200 + (this.BossValue * 20);
            this.HP = this.MaxHP;
            this.MaxEnergy = Math.floor($.RandomBetween(200, 250));
            this.Energy = this.MaxEnergy;
            this.MeleeAttackTick = 0.7;
            this.MeleeAttackTime = this.MeleeAttackTick;
            this.RangedAttackTick = 1.5;
            this.RangedAttackTime = this.RangedAttackTick;
            this.RangedAttackDistance = this.Bounds.Width * 3;
            this.KillScore = 50;
            this.EnergyRegen = 8;
            break;
    }

    this.MaxSpeed = new $.Point(this.Speed, this.Speed);
};

$.Enemy.prototype.BulletHit = function (damageResult) {
    if (this.EnemyType == $.EnemyTypeBoss && this.States.Charging == 1) {
        // TODO:
        // Immune hit effect
        return;
    }


    damageResult.point = this.Bounds.Centre;

    this.HP -= damageResult.dp;
    this.GameWorld.AddBulletHitEffect(damageResult);

    if (this.HP <= 0) {
        // TODO:
        // Died
        $.Score.EnemyScore += this.KillScore;

        if (this.States.Charging == 1 && this.EnemyType == $.EnemyTypeNormal) {
            // Bot retaliates if charging on death
            this.AimedShot(350, 15);
        }

        var random = Math.floor($.RandomBetween(0, 2.99));
        var color = "white";
        if (random == 0) { color = "#ffd800"; } // yellow
        if (random == 1) { color = "#8205ff"; } // purple
        if (random == 2) { color = "#ff6a00"; } // orange

        this.GameWorld.AddExplosionEffect(this.Bounds.Centre);

        if (damageResult.crit) {
            var point = this.Bounds.Centre.Copy();
            point.Add(new $.Point(25, 25));
            var col = $.ShadeColor(color, 0.2);
            this.GameWorld.AddText(col, $.GameWorld.GetKillPhrase(), point, "56px Impact");
        }
        this.GameWorld.AddText(color, "+" + this.KillScore, this.Bounds.Centre, "42px Impact");        

        var shake = 0;
        var distanceFromHero = this.Bounds.Centre.DistanceBetween(this.GameWorld.Hero.Bounds.Centre);
        if (distanceFromHero < this.Bounds.Width * 4) { shake = 15; }
        if (distanceFromHero < this.Bounds.Width * 7) { shake = 8; }
        if (distanceFromHero >= this.Bounds.Width * 7) { shake = 4; }
        this.GameWorld.AddShake(shake);

        this.Alive = false;
        this.KilledSound.Play();
    }
};

$.Enemy.prototype.SetupAnimations = function () {
    var variation = Math.floor($.RandomBetween(0, 2.99));
    switch (this.EnemyType) {
        case $.EnemyTypeNormal:
            this.MoveAnimation = new $.Animation($.EnemyOneImage, [0, 1], 50, 50, variation, 0.6, true);
            this.AttackAnimation = new $.Animation($.EnemyOneImage, [1, 2, 3, 2], 50, 50, variation, 0.8, true);
            this.ChargeAnimation = new $.Animation($.EnemyOneImage, [4, 5, 6, 7], 50, 50, variation, 0.8, true);
            break;
        case $.EnemyTypeCommander:
            this.MoveAnimation = new $.Animation($.EnemyTwoImage, [0, 1], 50, 50, 0, 0.2, true);
            this.AttackAnimation = new $.Animation($.EnemyTwoImage, [2, 3, 4, 5, 6], 50, 50, 0, 0.3, true);
            this.ChargeAnimation = new $.Animation($.EnemyTwoImage, [1, 2], 50, 50, 0, 0.4, true);
            break;
        case $.EnemyTypeBoss:
            this.MoveAnimation = new $.Animation($.EnemyThreeImage, [0], 150, 150, 0, 1, true);
            this.AttackAnimation = new $.Animation($.EnemyThreeImage, [0, 1, 2, 3, 4, 5], 150, 150, 0, 0.4, true);
            this.ChargeAnimation = new $.Animation($.EnemyThreeImage, [0, 1, 2, 3], 150, 150, 0, 1, true);
            break;
    }


    this.MoveAnimation.Playing = true;
    this.AttackAnimation.Playing = true;
    this.ChargeAnimation.Playing = true;
};

$.Enemy.prototype.SetupStates = function () {
    this.States = { Moving: 0, Charging: 0, Attacking: 0 };
    this.StateMoving = 1;
    this.StateCharging = 2;
    this.StateAttacking = 3;
};

$.Enemy.prototype.ToggleState = function (state) {
    this.States = { Moving: 0, Charging: 0, Attacking: 0 };

    switch (state) {
        case this.StateMoving:
            this.States.Moving = 1;
            this.CurrentAnimation = this.MoveAnimation;
            break;
        case this.StateCharging:
            this.States.Charging = 1;
            this.CurrentAnimation = this.ChargeAnimation;
            break;
        case this.StateAttacking:
            this.States.Attacking = 1;
            this.CurrentAnimation = this.AttackAnimation;
            break;
    }

    this.CurrentAnimation.Play();
}

$.Enemy.prototype.GetMoveSpeed = function () {
    if (this.CurrentTile == null) { return this.Speed; }

    var simplex = this.CurrentTile.Simplex;
    var newSpeed = this.Speed;

    if (simplex <= -0.7) {// blue
        newSpeed -= this.Speed / 3;
    }

    return newSpeed;
};

$.Enemy.prototype.PlayerCollision = function () {
    // TODO:
    // Move out of players bounding sphere.
    var player = this.GameWorld.Hero;
};

$.Enemy.prototype.ChargingDone = function () {
    if (this.EnemyType == $.EnemyTypeNormal) { return; }

    if (this.EnemyType == $.EnemyTypeCommander) {
        this.AimedTriShot();
    }

    if (this.EnemyType == $.EnemyTypeBoss) {
        this.SpreadBomb();
    }
};

$.Enemy.prototype.AimedShot = function (speed, size) {
    var playerBounds = this.GameWorld.Hero.Bounds;
    var ttl = 3.5;
    var color = "white";
    var direction = playerBounds.Centre.Normalize(this.Bounds.Centre);

    var randomColor = Math.floor($.RandomBetween(0, 2.99));
    if (randomColor == 0) { color = "orange"; }
    if (randomColor == 1) { color = "violet"; }
    if (randomColor == 2) { color = "purple"; }

    $.GameWorld.AddBullet(
        false,
        this.Bounds.Centre.X - size / 2,
        this.Bounds.Centre.Y - size / 2,
        direction,
        speed,
        size,
        ttl,
        color,
        false);
};

$.Enemy.prototype.AimedTriShot = function () {
    var playerBounds = this.GameWorld.Hero.Bounds;
    var speed = 550;
    var size = 10;
    var ttl = 3.5;
    var angle = Math.atan2(
        playerBounds.Centre.Y - this.Bounds.Centre.Y,
        playerBounds.Centre.X - this.Bounds.Centre.X) * 180 / Math.PI;
    var color = "white";

    for (var i = 0; i < 3; i++) {
        var aim;
        var newAngle = angle;
        var radians;
        var direction;

        var randomColor = Math.floor($.RandomBetween(0, 2.99));
        if (randomColor == 0) { color = "orange"; }
        if (randomColor == 1) { color = "maroon"; }
        if (randomColor == 2) { color = "red"; }

        if (i == 0) {
            // left angle
            newAngle -= 5;
            radians = newAngle * Math.PI / 180;
            aim = new $.Point(this.Bounds.Centre.X + Math.cos(radians) * 200, this.Bounds.Centre.Y + Math.sin(radians) * 200);
            direction = aim.Normalize(this.Bounds.Centre);
        }
        else if (i == 2) {
            // right angle
            newAngle += 5;
            radians = newAngle * Math.PI / 180;
            aim = new $.Point(this.Bounds.Centre.X + Math.cos(radians) * 200, this.Bounds.Centre.Y + Math.sin(radians) * 200);
            direction = aim.Normalize(this.Bounds.Centre);
        }
        else {
            direction = playerBounds.Centre.Normalize(this.Bounds.Centre);
        }

        $.GameWorld.AddBullet(
            false,
            this.Bounds.Centre.X - size / 2,
            this.Bounds.Centre.Y - size / 2,
            direction,
            speed,
            size,
            ttl,
            color,
            false);
    }
};

$.Enemy.prototype.SpreadBomb = function () {
    var speed = 500;
    var size = 8;
    var ttl = 3.5;
    var divider = 20;
    var degrees = 360 / divider;
    var angle = 0;
    var color = "white";

    for (var i = 1; i < degrees; i++) {

        var randomColor = Math.floor($.RandomBetween(0, 2.99));
        if (randomColor == 0) { color = "black"; }
        if (randomColor == 1) { color = "darkblue"; }
        if (randomColor == 2) { color = "maroon"; }

        var direction = new $.Point(-Math.sin(angle), -Math.cos(angle));
        $.GameWorld.AddBullet(
            false,
            this.Bounds.Centre.X - size / 2,
            this.Bounds.Centre.Y - size / 2,
            direction,
            speed,
            size,
            ttl,
            color,
            false);
        angle += divider;
    }
};


$.Enemy.prototype.Update = function () {
    this.Bounds.Update();
    this.Target = this.GameWorld.Hero.Bounds.Centre;

    // How far is the enemies target from it.
    var distance = this.Target.DistanceBetween(this.Bounds.Centre);
    var radiusIntersection = (this.Bounds.Width / 2) + (this.GameWorld.Hero.Bounds.Width / 2);

    // Moving
    if (this.States.Moving == 1) {
        this.UpdateEnergy();
        this.UpdateRotation();
        this.UpdateMovement();
        this.UpdateCurrentTile();
        this.UpdateRangedAttack(distance);

        // Reset attack time
        //this.MeleeAttackTime = this.MeleeAttackTick;

        if (distance <= radiusIntersection + 2) { this.ToggleState(this.StateAttacking); }
        if (this.Energy <= 0) { this.ToggleState(this.StateCharging); }
    }

    // Charging
    if (this.States.Charging == 1) {
        this.UpdateCharging();

        // Decelerate movement
        if (this.Velocity.X != 0) { this.Velocity.X *= 0.9; }
        if (this.Velocity.Y != 0) { this.Velocity.Y *= 0.9; }

        this.Bounds.X += this.Velocity.X;
        this.Bounds.Y += this.Velocity.Y;

        // Check if charging is done
        if (this.Energy >= this.MaxEnergy) {
            this.Energy = this.MaxEnergy;
            this.ChargingDone();
            this.ToggleState(this.StateMoving);
        }
    }

    // Attacking
    if (this.States.Attacking == 1) {
        this.UpdateMeleeAttack();

        if (distance > radiusIntersection + 2) { this.ToggleState(this.StateMoving); }
    }


    this.CurrentAnimation.Update();
};

$.Enemy.prototype.UpdateMovement = function () {
    var speed = this.GetMoveSpeed();
    var targetPoint = this.Target.Copy();

    if (this.EnemyType == $.EnemyTypeCommander || this.EnemyType == $.EnemyTypeBoss) {
        // Predictive pursuit.
        var hero = this.GameWorld.Hero;
        var distance = this.Bounds.Centre.DistanceBetween(hero.Bounds.Centre);
        var t = distance / speed;
        targetPoint = new $.Point(
            hero.Bounds.Centre.X + hero.Velocity.X * t,
            hero.Bounds.Centre.Y + hero.Velocity.Y * t);
    }

    var direction = targetPoint.Normalize(this.Bounds.Centre);

    this.DesiredVelocity.X = direction.X * ($.Delta * speed);
    this.DesiredVelocity.Y = direction.Y * ($.Delta * speed);

    var sX = this.DesiredVelocity.X - this.Velocity.X;
    var sY = this.DesiredVelocity.Y - this.Velocity.Y;

    if (sX < 0) {
        sX = sX < -this.MaxSteerForce ? -this.MaxSteerForce : sX;
    }
    else if (sX > 0) {
        sX = sX > this.MaxSteerForce ? this.MaxSteerForce : sX;
    }

    if (sY < 0) {
        sY = sY < -this.MaxSteerForce ? -this.MaxSteerForce : sY;
    }
    else if (sY > 0) {
        sY = sY > this.MaxSteerForce ? this.MaxSteerForce : sY;
    }

    this.Velocity.Add(new $.Point(sX, sY));

    this.UpdateCollision();

    this.Velocity.Truncate(this.MaxSpeed);

    this.Bounds.X += this.Velocity.X;
    this.Bounds.Y += this.Velocity.Y;
};

$.Enemy.prototype.UpdateCollision = function () {
    if (this.NearestEnemy == null) { return; }
    if (!this.NearestEnemy.Alive) { this.NearestEnemy = null; return; }
    if (this.States.Moving == 0) { return; }

    var myRadius = this.Bounds.Radius;
    var myCentre = this.Bounds.Centre;
    var myForce = 0;
    var myReverse = 0;
    var obsRadius = this.NearestEnemy.Bounds.Radius;
    var obsCentre = this.NearestEnemy.Bounds.Centre;
    var obsForce = 0;
    var obsReverse = 0;

    var betweenDistance = myCentre.DistanceBetween(obsCentre);
    var collideDistance = myRadius + obsRadius;

    // Collision based on sphere intersection.
    if (betweenDistance <= collideDistance) {
        var collisionVector = myCentre.Copy();
        collisionVector.Subtract(obsCentre);
        collisionVector.X = collisionVector.X == 0 || collideDistance == 0 ? 0 : collisionVector.X / collideDistance;
        collisionVector.Y = collisionVector.Y == 0 || collideDistance == 0 ? 0 : collisionVector.Y / collideDistance;

        //dot function
        myForce = myCentre.X * collisionVector.X + myCentre.Y * collisionVector.Y;
        obsForce = obsCentre.X * collisionVector.X + obsCentre.Y * collisionVector.Y;

        myReverse = obsForce;
        //obsReverse = myForce;

        var myValue = myReverse - myForce;
        //var obsValue = obsReverse - obsForce;

        var myReverseVelocity = new $.Point(myValue * collisionVector.X, myValue * collisionVector.Y);
        //var obsReverseVelocity = new Point(obsValue * collisionVector.X, obsValue * collisionVector.Y);

        if (myReverseVelocity.X < 0) {
            myReverseVelocity.X = myReverseVelocity.X < -this.MaxCollisionForce ? -this.MaxCollisionForce : myReverseVelocity.X;
        }
        else if (myReverseVelocity.X > 0) {
            myReverseVelocity.X = myReverseVelocity.X > this.MaxCollisionForce ? this.MaxCollisionForce : myReverseVelocity.X;
        }

        if (myReverseVelocity.Y < 0) {
            myReverseVelocity.Y = myReverseVelocity.Y < -this.MaxCollisionForce ? -this.MaxCollisionForce : myReverseVelocity.Y;
        }
        else if (myReverseVelocity.Y > 0) {
            myReverseVelocity.Y = myReverseVelocity.Y > this.MaxCollisionForce ? this.MaxCollisionForce : myReverseVelocity.Y;
        }

        this.Velocity.X -= myReverseVelocity.X;
        this.Velocity.Y -= myReverseVelocity.Y;


        //if (obsReverseVelocity.X < 0) {
        //    obsReverseVelocity.X = obsReverseVelocity.X < -this.MaxReverseForce ? -this.MaxReverseForce : obsReverseVelocity.X;
        //}
        //else if (obsReverseVelocity.X > 0) {
        //    obsReverseVelocity.X = obsReverseVelocity.X > this.MaxReverseForce ? this.MaxReverseForce : obsReverseVelocity.X;
        //}

        //if (obsReverseVelocity.Y < 0) {
        //    obsReverseVelocity.Y = obsReverseVelocity.Y < -this.MaxReverseForce ? -this.MaxReverseForce : obsReverseVelocity.Y;
        //}
        //else if (obsReverseVelocity.Y > 0) {
        //    obsReverseVelocity.Y = obsReverseVelocity.Y > this.MaxReverseForce ? this.MaxReverseForce : obsReverseVelocity.Y;
        //}

        //if (obsReverseVelocity) {
        //    if (!isNaN(obsReverseVelocity.X) && this.ClosestAvoidEntity.Velocity) {
        //        this.ClosestAvoidEntity.Velocity.X -= obsReverseVelocity.X;
        //    }
        //    if (!isNaN(obsReverseVelocity.Y) && this.ClosestAvoidEntity.Velocity) {
        //        this.ClosestAvoidEntity.Velocity.Y -= obsReverseVelocity.Y;
        //    }
        //}
    }
}

$.Enemy.prototype.UpdateMeleeAttack = function () {
    this.MeleeAttackTime += $.Delta;
    if (this.MeleeAttackTime >= this.MeleeAttackTick) {
        this.MeleeAttackTime = 0;

        var dp = 5;
        if (this.EnemyType == $.EnemyTypeCommander) { dp = 8; }
        if (this.EnemyType == $.EnemyTypeBoss) { dp = 12; }
        this.GameWorld.Hero.MeleeHit(dp);
        this.MeleeSound.Play();
    }
};

$.Enemy.prototype.UpdateRangedAttack = function (distance) {
    if (this.EnemyType == $.EnemyTypeBoss) {
        this.RangedAttackTime += $.Delta;

        if (this.RangedAttackTime >= this.RangedAttackTick) {

            // Only fire if in range
            if (this.RangedAttackDistance < distance) {
                this.RangedAttackTime = 0;
                this.AimedShot(650, 12);
            }
        }
    }
};

$.Enemy.prototype.UpdateEnergy = function () {
    if (this.CurrentTile == null) { return; }

    var simplex = this.CurrentTile.Simplex;
    var energyDeduction = 1;

    //if (simplex >= 0.6) {// brown
    //    energyDeduction = 2;
    //}
    //else if (simplex <= -0.6) {// blue
    //    energyDeduction = 3;
    //}

    this.Energy -= energyDeduction;
};

$.Enemy.prototype.UpdateCharging = function () {
    this.Energy += this.EnergyRegen;
};

$.Enemy.prototype.UpdateRotation = function () {
    var rotation = $.CalculateAngle(this.Bounds.Centre, this.Target);
    this.Rotation = ((rotation) * (Math.PI / 180));
};

$.Enemy.prototype.UpdateCurrentTile = function () {
    var tx = Math.floor(this.Bounds.Centre.X / this.GameWorld.TileSize);
    var ty = Math.floor(this.Bounds.Centre.Y / this.GameWorld.TileSize);

    if ($.GridContainsTile(tx, ty, this.GameWorld.TileCols, this.GameWorld.TileRows)) {
        this.CurrentTile = this.GameWorld.Tiles[tx][ty];
    }
};


$.Enemy.prototype.Draw = function () {
    if (!this.GameWorld.RenderBounds.ContainsRect(this.Bounds)) { return; }

    this.DrawBody();
    this.DrawHP();
    //this.DrawEP();
};

$.Enemy.prototype.DrawBody = function () {
    var x = this.Bounds.Centre.X - $.CanvasBounds.X;
    var y = this.Bounds.Centre.Y - $.CanvasBounds.Y;

    $.Gtx1.save();
    $.Gtx1.translate(x, y);
    $.Gtx1.rotate(this.Rotation);
    this.CurrentAnimation.Draw(
        -((this.Bounds.Width) / 2),
        -((this.Bounds.Height) / 2),
        this.Bounds.Width,
        this.Bounds.Height,
        $.Gtx1);
    $.Gtx1.restore();
};

$.Enemy.prototype.DrawHP = function () {
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

$.Enemy.prototype.DrawEP = function () {
    var percentage = this.Energy * 100 / this.MaxEnergy;
    var epLength = this.Bounds.Width * percentage / 100;

    var x = this.Bounds.X - $.CanvasBounds.X;
    var y = this.Bounds.Y - $.CanvasBounds.Y;

    $.Gtx1.fillStyle = 'violet';
    $.Gtx1.fillRect(
        x,
        y - 14,
        this.Bounds.Width,
        4);

    $.Gtx1.fillStyle = 'yellow';
    $.Gtx1.fillRect(
        x,
        y - 14,
        epLength,
        4);
};


$.EnemyTypeNormal = 1;
$.EnemyTypeCommander = 2;
$.EnemyTypeBoss = 3;