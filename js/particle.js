$.Particle = function() { };


$.Particle.prototype.Reset = function (x, y, color, direction, ttl, speed, w, h) {
    if (this.Bounds) {
        this.Bounds.Set(x, y, w, h);
    } else {
        this.Bounds = new $.Rectangle(x, y, w, h);
    }    

    if (this.Velocity) {
        this.Velocity.Set(0, 0);
    } else {
        this.Velocity = new $.Point(0, 0);
    }    

    this.Color = color;    
    this.Direction = direction;
    this.Opacity = 1;
    this.Speed = speed;
    this.MaxTTL = ttl;
    this.TTL = this.MaxTTL;
    this.Image = null;
};

$.Particle.prototype.Update = function () {
    this.Bounds.Update();

    this.TTL -= $.Delta;//0.1;
    var percentage = this.TTL * 100 / this.MaxTTL;

    if (percentage < 50) {
        this.Opacity = this.MaxTTL * percentage / 100;
    }
     
    this.Velocity.X = this.Direction.X * ($.Delta * this.Speed);
    this.Velocity.Y = this.Direction.Y * ($.Delta * this.Speed);

    this.Bounds.X += this.Velocity.X;
    this.Bounds.Y += this.Velocity.Y;
};

$.Particle.prototype.Draw = function (context) {    
    if (!$.GameWorld.RenderBounds.ContainsRect(this.Bounds)) { return; }

    var x = this.Bounds.X - $.CanvasBounds.X;
    var y = this.Bounds.Y - $.CanvasBounds.Y;

    $.Gtx1.save();
    $.Gtx1.globalAlpha = this.Opacity < 0 ? 0 : this.Opacity;
    if (this.Image && this.Image.Image) {
        context.drawImage(
           this.Image.Image,
           this.Image.xSource,
           this.Image.ySource,
           this.Image.wSource,
           this.Image.hSource,
           x,
           y,
           this.Bounds.Width,
           this.Bounds.Height);
    }
    else {

        context.fillStyle = this.Color;
        context.fillRect(
            x,
            y,
            this.Bounds.Width,
            this.Bounds.Height);        
    }
     $.Gtx1.restore();
};