$.Tile = function (col, row, width, height) {
    this.TileIndex = new $.Point(col, row);
    this.Bounds = new $.Rectangle(col * width, row * height, width, height);
    this.Simplex = noise.simplex2(col / 100, row / 100).toFixed(1);

    var blue = '#001a4d';
    var brown = '#d2a679';
    var green = '#339933';

    if (this.Simplex >= 0.6 && this.Simplex < 0.7) {
        this.Color = $.ShadeColor(brown, 0);
    }
    else if (this.Simplex >= 0.7 && this.Simplex < 0.8) {
        this.Color = $.ShadeColor(brown, -0.1);
    }
    else if (this.Simplex >= 0.8) {
        this.Color = $.ShadeColor(brown, -0.2);
    }
    else if (this.Simplex == -0.7) {
        this.Color = $.ShadeColor(blue, -0.2);
    }
    else if (this.Simplex <= -0.8) {
        this.Color = $.ShadeColor(blue, -0.4);
    }
    else {
        this.Color = $.ShadeColor(green, this.Simplex * 1.1);
    }

    if (this.Simplex >= 0.6) { this.ImageSourceRect = new $.Rectangle(64, 0, 32, 32); }
    else if (this.Simplex <= -0.7) { this.ImageSourceRect = new $.Rectangle(0, 0, 32, 32); }
    else { this.ImageSourceRect = new $.Rectangle(32, 0, 32, 32); }
};

$.Tile.prototype.Draw = function () {
    if (!$.GameWorld.RenderBounds.ContainsRect(this.Bounds)) { return; }

    var x = this.Bounds.X - $.CanvasBounds.X;
    var y = this.Bounds.Y - $.CanvasBounds.Y;

    $.Gtx.fillStyle = this.Color;
    $.Gtx.fillRect(x, y, this.Bounds.Width, this.Bounds.Height);

    $.Gtx.save();
    $.Gtx.globalAlpha = 0.4;    
    $.Gtx.drawImage(
        $.TilesImage,
        this.ImageSourceRect.X,
        this.ImageSourceRect.Y,
        this.ImageSourceRect.Width,
        this.ImageSourceRect.Height,
        x,
        y,
        this.Bounds.Width,
        this.Bounds.Height);
    $.Gtx.restore();
};