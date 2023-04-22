$.FPS = {
    StartTime: 0,
    FrameNumber: 0,
    GetFPS: function () {
        this.FrameNumber++;

        var date = new Date().getTime();
        var currentTime = (date - this.StartTime) / 1000;
		var	result = Math.floor((this.FrameNumber / currentTime));

        if (currentTime > 1) {
            this.StartTime = new Date().getTime();
            this.FrameNumber = 0;
        }

        return result;
    }
}


$.RandomBetween = function(min, max) {
    return Math.random() * (max - min) + min;
}

$.RandomVariation = function(center, variation) {
    return center + variation * $.RandomBetween(-0.5, 0.5);
}

$.CalculateAngle = function(PointA, PointB) {
    var ra = Math.PI / 180;
    var deg = 180 / Math.PI;
    var x = PointB.X - PointA.X;
    var y = PointA.Y - PointB.Y;
    var angle = 0;

    y = y * ra;
    x = x * ra;

    if (x >= 0 && y >= 0) { angle = 90 - Math.atan(y / x) * deg; }
    else if (x >= 0 && y <= 0) { angle = 90 + Math.abs(Math.atan(y / x) * deg); }
    else if (x <= 0 && y <= 0) { angle = 270 - Math.atan(y / x) * deg; }
    else if (x <= 0 && y >= 0) { angle = 270 + Math.abs(Math.atan(y / x) * deg); }

    return angle;
}

$.FromAngle = function (angle, magnitude) {
    return new $.Point(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

//To convert degrees to radians, multiply the value by (Math.PI / 180):
//var radians = degrees * (Math.PI / 180);

//To convert radians to degrees, multiply the value by (180 / Math.PI):
//var degrees = radians * (180 / Math.PI);

$.GetRadiansFromPoints = function(PointA, PointB) {
    var tx = PointA.X - PointB.X;
    var ty = PointA.Y - PointB.Y;
    return Math.atan2(ty, tx);
}

$.ShadeColor = function (color, percent) {
    // color: hex (7char)   percent: float -1.0 >> 1.0;
    var f = parseInt(color.slice(1), 16);
    var t = percent < 0 ? 0 : 255;
    var p = percent < 0 ? percent * -1 : percent;
    var R = f >> 16;
    var G = f >> 8 & 0x00FF;
    var B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
};

$.GridContainsTile = function (col, row, gridCols, gridRows) {
    if (col < 0 || row < 0 || col > gridCols - 1 || row > gridRows - 1) {
        return false;
    }

    return true;
};

$.CheckCollision = function (rectA, rectB) {
    // get the vectors to check against
    var distancePoint = new $.Point(
        (rectA.X + (rectA.Width / 2)) - (rectB.X + (rectB.Width / 2)),
        (rectA.Y + (rectA.Height / 2)) - (rectB.Y + (rectB.Height / 2)));

    // add the half widths and half heights of the objects
    var halfWidths = (rectA.Width / 2) + (rectB.Width / 2);
    var halfHeights = (rectA.Height / 2) + (rectB.Height / 2);
    var collisionSide = null;

    // if the x and y vector are less than the half width or half height, 
    // they we must be inside the object, causing a collision
    if (Math.abs(distancePoint.X) < halfWidths && Math.abs(distancePoint.Y) < halfHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        var resultPoint = new $.Point(
            halfWidths - Math.abs(distancePoint.X),
            halfHeights - Math.abs(distancePoint.Y));

        if (resultPoint.X >= resultPoint.Y) {
            if (distancePoint.Y > 0) {
                collisionSide = $.top_collision;
                rectA.Y += resultPoint.Y;
            }
            else if (distancePoint.Y < 0) {
                collisionSide = $.bottom_collision;
                rectA.Y -= resultPoint.Y;
            }
        }
        else if (resultPoint.X < resultPoint.Y) {
            if (distancePoint.X > 0) {
                collisionSide = $.left_collision;
                rectA.X += resultPoint.X;
            }
            else if (distancePoint.X < 0) {
                collisionSide = $.right_collision;
                rectA.X -= resultPoint.X;
            }
        }
    }
    return collisionSide;
};

$.top_collision = "top";
$.bottom_collision = "bottom";
$.left_collision = "left";
$.right_collision = "right";


$.Point = function (x, y) {
    this.X = x;
    this.Y = y;
;}

$.Point.prototype.Set = function (x, y) {
    this.X = x;
    this.Y = y;
};

$.Point.prototype.Equals = function (point) {
    return this.X == point.X && this.Y == point.Y;
};

$.Point.prototype.Copy = function () {
    return new $.Point(this.X, this.Y);
};

$.Point.prototype.Add = function (point) {
    this.X += point.X;
    this.Y += point.Y;
}

$.Point.prototype.Subtract = function (point) {
    this.X -= point.X;
    this.Y -= point.Y;
}

$.Point.prototype.Multiply = function (point) {
    this.X *= point.X;
    this.Y *= point.Y;
}

$.Point.prototype.Divide = function (point) {
    if (this.X != 0 && point.X != 0) { this.X /= point.X; }
    if (this.Y != 0 && point.Y != 0) { this.Y /= point.Y; }
}

$.Point.prototype.FromPolar = function (angle, radians) {
    var p = this.Copy();
    p.X = radians * Math.cos(angle);
    p.Y = radians * Math.sin(angle);
    return p;
}

$.Point.prototype.DistanceBetween = function (point) {
    var px = this.X - point.X;
    var py = this.Y - point.Y;
    return Math.sqrt(px * px + py * py);
}

$.Point.prototype.Normalize = function (point) {
    var px = this.X - point.X;
    var py = this.Y - point.Y;
    var dist = Math.sqrt(px * px + py * py);
    return new $.Point(px / dist, py / dist);
}

$.Point.prototype.GetMagnitude = function () {
    return Math.sqrt(this.X * this.X + this.Y * this.Y);
};

$.Point.prototype.GetAngle = function () {
    return Math.atan2(this.Y, this.X);
};

$.Point.prototype.RotatePoint = function (origin, angle) {
    // calculate distance vector
    var dx = this.X - origin.X;
    var dy = this.Y - origin.Y;

    // apply rotation matrix
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var rotatedDx = dx * cos - dy * sin;
    var rotatedDy = dx * sin + dy * cos;

    // add rotated vector to origin
    return new $.Point(origin.X + rotatedDx, origin.Y + rotatedDy);
}

$.Point.prototype.Truncate = function (maxValue) {
    if (this.X != 0) {
        if (this.X < 0) { if (this.X < -maxValue) { this.X = -maxValue; } }
        else if (this.X > 0) { if (this.X > maxValue) { this.X = maxValue; } }
    }

    if (this.Y != 0) {
        if (this.Y < 0) { if (this.Y < -maxValue) { this.Y = -maxValue; } }
        else if (this.Y > 0) { if (this.Y > maxValue) { this.Y = maxValue; } }
    }
};


$.Line = function (pointA, pointB) {
    this.PointA = pointA;
    this.PointB = pointB;
};

$.Line.prototype.Slope = function () {
    var x1 = this.PointA.X;
    var x2 = this.PointB.X;
    var y1 = this.PointA.Y;
    var y2 = this.PointB.Y;

    if (x1 == x2) return false;
    return (y1 - y2) / (x1 - x2);
};

$.Line.prototype.YInt = function () {
    var x1 = this.PointA.X;
    var x2 = this.PointB.X;
    var y1 = this.PointA.Y;
    var y2 = this.PointB.Y;

    if (x1 === x2) return y1 === 0 ? 0 : false;
    if (y1 === y2) return y1;

    return y1 - this.Slope() * x1;
};

$.Line.prototype.XInt = function () {
    var x1 = this.PointA.X;
    var x2 = this.PointB.X;
    var y1 = this.PointA.Y;
    var y2 = this.PointB.Y;

    if (y1 === y2) return x1 == 0 ? 0 : false;
    if (x1 === x2) return x1;

    var slope = this.Slope();
    return (-1 * (slope * x1 - y1)) / slope;
};

$.Line.prototype.GetIntersectionPoint = function (line) {
    var x11 = this.PointA.X;
    var x12 = this.PointB.X;
    var y11 = this.PointA.Y;
    var y12 = this.PointB.Y;
    var x21 = line.PointA.X;
    var x22 = line.PointB.X;
    var y21 = line.PointA.Y;
    var y22 = line.PointB.Y;

    var slope1, slope2, yint1, yint2, intx, inty;
    if (x11 == x21 && y11 == y21) return new $.Point(x11, y11);
    if (x12 == x22 && y12 == y22) return new $.Point(x12, y22);

    slope1 = this.Slope();
    slope2 = line.Slope();
    if (slope1 === slope2) return false;

    yint1 = this.YInt();
    yint2 = line.YInt();
    if (yint1 === yint2) return yint1 === false ? false : new $.Point(0, yint1);

    if (slope1 === false) return new $.Point(y21, slope2 * y21 + yint2);
    if (slope2 === false) return new $.Point(y11, slope1 * y11 + yint1);
    intx = (slope1 * x11 + yint1 - yint2) / slope2;
    return new $.Point(intx, slope1 * intx + yint1);
};


$.Rectangle = function(x, y, width, height) {
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
    this.Left = this.X;
    this.Top = this.Y;
    this.Right = 0
    this.Bottom = 0;
    this.Centre = new $.Point(0, 0);
    this.Radius = this.Width >= this.Height ? this.Width / 2 : this.Height / 2;
    this.Update();
}

$.Rectangle.prototype.Set = function(x, y, w, h) {
    this.X = x;
    this.Y = y;
    this.Width = w;
    this.Height = h;
    this.Update();
};

$.Rectangle.prototype.Copy = function () {
    var rect = new $.Rectangle(this.X, this.Y, this.Width, this.Height);
    return rect;
}

$.Rectangle.prototype.Update = function () {
    this.Left = this.X;
    this.Top = this.Y;
    this.Right = this.Left + this.Width;
    this.Bottom = this.Top + this.Height;
    this.Centre = new $.Point(
		this.Left + (this.Width / 2),
		this.Top + (this.Height / 2));
    this.Radius = this.Width >= this.Height ? this.Width / 2 : this.Height / 2;
}

$.Rectangle.prototype.IntersectRect = function (rectangle) {
    this.Update();
    rectangle.Update();

    return !(rectangle.Left > (this.Left + this.Width) ||
             (rectangle.Left + rectangle.Width) < this.Left ||
             rectangle.Top > (this.Top + this.Height) ||
             (rectangle.Top + rectangle.Height) < this.Top);
}

$.Rectangle.prototype.ContainsRect = function (rectangle) {
    this.Update();
    rectangle.Update();

    return (this.Left <= rectangle.Left &&
           rectangle.Right <= this.Right &&
           this.Top <= rectangle.Top &&
           rectangle.Bottom <= this.Bottom);
}

$.Rectangle.prototype.GetIntersectionDepth = function (rectangle) {
    this.Update();
    rectangle.Update();

    // Calculate half sizes.
    var halfWidthA = this.Width / 2.0;
    var halfHeightA = this.Height / 2.0;
    var halfWidthB = rectangle.Width / 2.0;
    var halfHeightB = rectangle.Height / 2.0;

    // Calculate centers.
    var centerA = this.Centre;
    var centerB = rectangle.Centre;

    // Calculate current and minimum-non-intersecting distances between centers.
    var distanceX = centerA.X - centerB.X;
    var distanceY = centerA.Y - centerB.Y;
    var minDistanceX = halfWidthA + halfWidthB;
    var minDistanceY = halfHeightA + halfHeightB;

    // If we are not intersecting at all, return (0, 0).
    if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY)
        return new $.Point(0, 0);

    // Calculate and return intersection depths.
    var depthX = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
    var depthY = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;
    return new $.Point(depthX, depthY);
};

$.Rectangle.prototype.GetLineIntersectionPoint = function (line) {
    var lines = [];
    lines.push(new $.Line(
        new $.Point(this.Left, this.Top),
        new $.Point(this.Left, this.Bottom)));
    lines.push(new $.Line(
        new $.Point(this.Left, this.Bottom),
        new $.Point(this.Right, this.Bottom)));
    lines.push(new $.Line(
        new $.Point(this.Right, this.Bottom),
        new $.Point(this.Right, this.Top)));
    lines.push(new $.Line(
        new $.Point(this.Right, this.Top),
        new $.Point(this.Left, this.Top)));

    for (var i = 0; i < lines.length; i++) {
        var point = line.GetIntersectionPoint(lines[i]);
        if (point) { return point;}
    }

    return false; // No intersection
};


// Angular Directions
$.none = 0;
$.north = 360;
$.south = 180;
$.east = 90;
$.west = 270;
$.northEast = 45;
$.northWest = 315;
$.southEast = 135;
$.southWest = 225;