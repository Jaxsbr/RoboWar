$.Menu = function() {
    this.PlayButtonBounds = new $.Rectangle(0, 0, 100, 65);

    this.HeaderTextFontSize = 42;
    this.HeaderText = "Robo War";    
    $.Gtx1.font = this.HeaderTextFontSize.toString() + "px Impact";
    this.HeaderTextWidth = $.Gtx1.measureText(this.HeaderText).width;
    this.HeaderTextPoint = new $.Point (0, this.HeaderTextFontSize * 2);

    this.ButtonYAdjustmentPadding = 5;
    this.ButtonText = "Play";    
    this.ButtonTextFontSize = 32;
    $.Gtx1.font = this.ButtonTextFontSize.toString() + "px Impact";
    this.ButtonTextHeightPadding = this.ButtonTextFontSize / 2;
    this.ButtonTextWidth = $.Gtx1.measureText(this.ButtonText).width;
    this.ButtonTextPoint = new $.Point (0, 0);

    this.Loading = true;
    
    this.BackgroundImage = new Image();
    this.BackgroundImage.onload = function() {
        $.MenuBackgroundLoading = false;
    };
    this.BackgroundImage.src = "img/robobackground.jpg";
};

$.Menu.prototype.Update = function() {
    if ($.MenuBackgroundLoading) { this.UpdateLoading(); return; }

    this.PlayButtonBounds.X = $.CanvasBounds.Centre.X - Math.round(this.PlayButtonBounds.Width / 2);
    this.PlayButtonBounds.Y = $.CanvasBounds.Centre.Y - Math.round(this.PlayButtonBounds.Height / 2);
    this.PlayButtonBounds.Update();

    this.ButtonTextPoint.X = this.PlayButtonBounds.Centre.X - (this.ButtonTextWidth / 2);
    this.ButtonTextPoint.Y = this.PlayButtonBounds.Centre.Y + (this.ButtonTextFontSize / 2) - this.ButtonYAdjustmentPadding;

    this.HeaderTextPoint.X = $.CanvasBounds.Centre.X - Math.round(this.HeaderTextWidth / 2);
};

$.Menu.prototype.UpdateLoading = function() {

};

$.Menu.prototype.Draw = function() {
    if ($.MenuBackgroundLoading) { this.DrawLoading(); return; }
    
    $.Gtx1.clearRect($.CanvasBounds.X, $.CanvasBounds.Y, $.CanvasBounds.Width, $.CanvasBounds.Height);

    $.Gtx1.drawImage(this.BackgroundImage, 0, 0, $.CanvasBounds.Width, $.CanvasBounds.Height);

    $.Gtx1.font = this.HeaderTextFontSize.toString() + "px Impact";
    $.Gtx1.fillStyle = "purple";
    $.Gtx1.fillText(this.HeaderText, this.HeaderTextPoint.X, this.HeaderTextPoint.Y);

    $.Gtx1.fillStyle = "purple";
    $.Gtx1.fillRect(this.PlayButtonBounds.X, this.PlayButtonBounds.Y, this.PlayButtonBounds.Width, this.PlayButtonBounds.Height);

    $.Gtx1.font = this.ButtonTextFontSize.toString() + "px Impact";
    $.Gtx1.fillStyle = "orange";
    $.Gtx1.fillText(this.ButtonText, this.ButtonTextPoint.X, this.ButtonTextPoint.Y);
};

$.Menu.prototype.DrawLoading = function() {

};