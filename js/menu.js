// menu shows play button and leaderboard

$.Menu = function() {
    $.PlayButtonBounds = new $.Rectangle(0, 0, 100, 60);
}

$.Menu.prototype.Update = function() {
    $.PlayButtonBounds.X = $.CanvasBounds.Centre.X - Math.round($.PlayButtonBounds.Width / 2);
    $.PlayButtonBounds.Y = $.CanvasBounds.Centre.Y - Math.round($.PlayButtonBounds.Height / 2);
} 

$.Menu.prototype.Draw = function() {
    $.Gtx1.clearRect($.CanvasBounds.X, $.CanvasBounds.Y, $.CanvasBounds.Width, $.CanvasBounds.Height);

    $.Gtx1.fillStyle = "yellow";
    $.Gtx1.fillRect($.PlayButtonBounds.X, $.PlayButtonBounds.Y, $.PlayButtonBounds.Width, $.PlayButtonBounds.Height);


    $.Gtx1.font = "20px Calibri";
    $.Gtx1.fillStyle = "red";
    $.Gtx1.fillText("Robo War", 20, 20);
}