function ShapeGroup(polygons) {
  this.polygons = polygons;
  this.rectBounds = {
    x: Infinity,
    y: Infinity,
    x1: 0,
    y1: 0
  };

  this.polygons.forEach(function (polygon) {
    // Save bounding box limits
    if (polygon.rectBounds.x < this.rectBounds.x) {
      this.rectBounds.x = polygon.rectBounds.x;
    } else if (polygon.rectBounds.x1 > this.rectBounds.x1) {
      this.rectBounds.x1 = polygon.rectBounds.x1;
    }
    if (polygon.rectBounds.y < this.rectBounds.y) {
      this.rectBounds.y = polygon.rectBounds.y;
    } else if (polygon.rectBounds.y1 > this.rectBounds.y1) {
      this.rectBounds.y1 = polygon.rectBounds.y1;
    }
  }, this);

  this.draw = function () {
    this.polygons.forEach(function (polygon) {
      polygon.draw();
    });
  }

  this.inBounds = function (x, y) {
    return (x >= this.rectBounds.x && x <= this.rectBounds.x1 && y >= this.rectBounds.y && y <= this.rectBounds.y1);
  }
}