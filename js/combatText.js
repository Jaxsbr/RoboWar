$.CombatText = function () {};

$.CombatText.prototype.Reset = function (color, text, point, font) {
    this.Color = color;
    this.Text = text;
    this.ActualPoint = point;
    this.Font = font;
    this.MaxTTL = 0.7;
    this.TTL = this.MaxTTL;
    this.Opacity = 1;
    this.FloatSpeed = 45;
    this.Direction = Math.floor($.RandomBetween(0, 1.99)); 
};

$.CombatText.prototype.Update = function () {    
    if (this.TTL <= 0) { return; }

    this.TTL -= $.Delta;
    if (this.TTL > 0) {
        var percentage = this.TTL * 100 / this.MaxTTL;
        this.Opacity = percentage / 100;
    }

    this.ActualPoint.Y -= $.Delta * this.FloatSpeed;

    if (this.Direction == 0) { this.ActualPoint.X -= $.Delta * this.FloatSpeed / 3; }
    else { this.ActualPoint.X += $.Delta * this.FloatSpeed / 3; }
};

$.CombatText.prototype.Draw = function (context) {
    //if (!$.GameWorld.RenderBounds.ContainsRect(this.Bounds)) { return; }
    if (this.TTL <= 0) { return; }

    var x = this.ActualPoint.X - $.CanvasBounds.X;
    var y = this.ActualPoint.Y - $.CanvasBounds.Y;

    context.save();
    context.globalAlpha = this.Opacity;
    context.font = this.Font;
    context.fillStyle = "black";
    context.fillText(this.Text, x + 0.5, y + 0.5);
    context.fillStyle = this.Color;
    context.fillText(this.Text, x, y);
    context.restore();
};