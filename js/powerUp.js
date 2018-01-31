$.PowerUp = function (x, y, type) {
    this.Bounds = new $.Rectangle(x, y, 128, 128);
    this.PowerUpType = type;
    this.PulseOpacity = 0.3;

    this.SetupAttributes();
    this.SetupAnimations();
};


$.PowerUp.prototype.SetupAttributes = function () {
    switch (this.PowerUpType) {        
        case $.PowerUpTypeHP:
            this.TTL = 50;
            this.Color = "red";
            break;
        case $.PowerUpTypeSpeed:
            this.TTL = 35;
            this.Color = "yellow";
            break;
        case $.PowerUpTypeInvulnerable:
            this.TTL = 15;
            this.Color = "pink";
            break;
        case $.PowerUpTypePierce:
            this.TTL = 25;
            this.Color = "maroon";
            break;
        case $.PowerUpTypeRapidFire:
            this.TTL = 20;
            this.Color = "purple";
            break;
        case $.PowerUpTypeTripleShot:
            this.TTL = 20;
            this.Color = "blue";
            break;
    }

    this.MaxTTL = this.TTL;
};

$.PowerUp.prototype.SetupAnimations = function () {
    this.CurrentAnimation = null;
    var image = null;

    switch (this.PowerUpType) {
        case $.PowerUpTypeHP:
            image = $.HpUpImage;
            break;
        case $.PowerUpTypeSpeed:
            image = $.SpeedBoostImage;
            break;
        case $.PowerUpTypeInvulnerable:
            image = $.InvulnerableImage;
            break;
        case $.PowerUpTypePierce:
            image = $.PierceImage;
            break;
        case $.PowerUpTypeRapidFire:
            image = $.RapidFireImage;
            break;
        case $.PowerUpTypeTripleShot:
            image = $.TripleShotImage;
            break;
    }
    
    this.CurrentAnimation = new $.Animation(image, [0, 1, 2, 3, 4, 5, 6, 7], 64, 64, 0, 0.05, true);
    this.CurrentAnimation.Play();    
};


$.PowerUp.prototype.Update = function () {
    this.Bounds.Update();
    this.TTL -= $.Delta;
    this.UpdatePulse();

    if (this.CurrentAnimation) { this.CurrentAnimation.Update(); }
};

$.PowerUp.prototype.UpdatePulse = function () {
    //this.PulseValue = this.PulseDirection == 0 ? this.PulseValue + $.Delta : this.PulseValue - $.Delta
    //if (this.PulseDirection == 0 && this.PulseValue >= this.PulseMax) {
    //    this.PulseDirection = 1;
    //}
    //else if (this.PulseDirection == 1 && this.PulseValue <= 0) {
    //    this.PulseDirection = 0;
    //}

    //this.PulseOpacity = this.PulseValue / this.PulseMax;
    //if (this.PulseOpacity > 1) { this.PulseOpacity = 1; }
    //if (this.PulseOpacity < 0) { this.PulseOpacity = 0; }

    var percent = Math.round(this.TTL * 100 / this.MaxTTL);
    if (percent <= 10) { this.PulseOpacity = percent / 10; }
};


$.PowerUp.prototype.Draw = function () {
    if (!$.GameWorld.RenderBounds.ContainsRect(this.Bounds)) { return; }

    var x = this.Bounds.X - $.CanvasBounds.X;
    var y = this.Bounds.Y - $.CanvasBounds.Y;

    if (this.CurrentAnimation) {
        this.CurrentAnimation.Draw(x, y, this.Bounds.Width, this.Bounds.Height, $.Gtx1);
    }
    else {
        $.Gtx1.fillStyle = this.Color;
        $.Gtx1.fillRect(x, y, this.Bounds.Width, this.Bounds.Height);
    }
};


$.PowerUpTypeHP = 1;
$.PowerUpTypeSpeed = 2;
$.PowerUpTypeInvulnerable = 3;
$.PowerUpTypePierce = 4;
$.PowerUpTypeRapidFire = 5;
$.PowerUpTypeTripleShot = 6;