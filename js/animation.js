$.Animation = function (image, frames, frameWidth, frameHeight, row, speed, loop) {
    this.Image = image;
    this.Frames = frames;
    this.FrameWidth = frameWidth;
    this.FrameHeight = frameHeight;
    this.FrameIndex = this.Frames[0];
    this.Row = row;
    this.Speed = speed;    
    this.Playing = false;
    this.Loop = loop;
    this.PlayedOnce = false;
    this.Ellapsed = 0;
};

$.Animation.prototype.Play = function () {
    this.Playing = true;
    this.FrameIndex = this.Frames[0];
    this.Ellapsed = 0;
    this.PlayedOnce = false;
};

$.Animation.prototype.Update = function () {
    if (!this.Playing)
        return;

    this.Ellapsed += 0.1;
    if (this.Ellapsed >= this.Speed) {
        this.Ellapsed = 0;

        this.FrameIndex += 1;
        if (this.FrameIndex > this.Frames[this.Frames.length - 1]) {
            this.PlayedOnce = true;

            if (this.Loop) { this.FrameIndex = this.Frames[0]; }
            else { this.FrameIndex = this.Frames[this.Frames.length - 1] }
        }
    }
};

$.Animation.prototype.Draw = function (x, y, width, height, context) {
    if (!this.Playing)
        return;

    //if (!this.Loop && this.PlayedOnce) { return; }

    context.drawImage(
		this.Image,
		this.FrameIndex * this.FrameWidth, // Source x
		this.Row * this.FrameHeight, // Source y
		this.FrameWidth, // Source width
		this.FrameHeight, // Source height
		x, // Destination x
		y, // Destination y
		width, // Destination width
		height); // Destination height
};
