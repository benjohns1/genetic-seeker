function ShapePolygon(points) {
  this.points = points;
  this.lines = [];
  this.rectBounds = {
    x: Infinity,
    y: Infinity,
    x1: 0,
    y1: 0
  };

  let prev = null;
  this.points.forEach(function (point) {
    if (prev !== null) {
      this.lines.push([prev, point]);
    }
    prev = point;

    // Save bounding box limits
    if (point[0] < this.rectBounds.x) {
      this.rectBounds.x = point[0];
    } else if (point[0] > this.rectBounds.x1) {
      this.rectBounds.x1 = point[0];
    }
    if (point[1] < this.rectBounds.y) {
      this.rectBounds.y = point[1];
    } else if (point[1] > this.rectBounds.y1) {
      this.rectBounds.y1 = point[1];
    }
  }, this);

  this.draw = function () {
    beginShape();
    this.points.forEach(function (points) {
      vertex(points[0], points[1]);
    });
    endShape(CLOSE);
  }

  this.inBounds = function (x, y) {
    return (x >= this.rectBounds.x && x <= this.rectBounds.x1 && y >= this.rectBounds.y && y <= this.rectBounds.y1);
  }
}