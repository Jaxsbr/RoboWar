$.Bullet = function (x, y, direction, speed, size, ttl, color, pierce, isPlayer) {            
    this.Bounds = new $.Rectangle(x, y, size, size);
    this.Velocity = new $.Point(0, 0);
    this.Direction = direction;
    this.Speed = speed;
    this.TTL = ttl;
    this.Color = color;
    this.Pierce = pierce;
    this.HitCount = 1;
    this.IsPlayer = isPlayer;
};

$.Bullet.prototype.Update = function () {
    this.Bounds.Update();
    this.TTL -= $.Delta;

    this.UpdateMovement();

    $.GameWorld.EmitBulletParticles(this);
};

$.Bullet.prototype.UpdateMovement = function () {
    this.Velocity.X = this.Direction.X * ($.Delta * this.Speed);
    this.Velocity.Y = this.Direction.Y * ($.Delta * this.Speed);

    this.Bounds.X += this.Velocity.X;
    this.Bounds.Y += this.Velocity.Y;
};

$.Bullet.prototype.Draw = function () {
    if (!$.GameWorld.RenderBounds.ContainsRect(this.Bounds)) { return; }

    var x = this.Bounds.Centre.X - $.CanvasBounds.X;
    var y = this.Bounds.Centre.Y - $.CanvasBounds.Y;

    $.Gtx1.fillStyle = this.Color;
    $.Gtx1.beginPath();
    $.Gtx1.arc(x, y, this.Bounds.Radius, 0, 2 * Math.PI);
    $.Gtx1.fill();
};
