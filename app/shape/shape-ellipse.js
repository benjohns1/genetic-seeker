function ShapeEllipse(x, y, w, h, color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h === undefined ? w : h;
  this.color = color;
  this.rectBounds = {
    x: Infinity,
    y: Infinity,
    x1: 0,
    y1: 0
  };

  let halfW = this.w / 2.0;
  let halfH = this.h / 2.0;
  this.rectBounds.x = this.x - halfW;
  this.rectBounds.y = this.y - halfH;
  this.rectBounds.x1 = this.x + halfW;
  this.rectBounds.y1 = this.y + halfH;

  this.draw = function () {
    if (this.color !== undefined) {
      push();
      fill(color);
    }
    ellipse(this.x, this.y, this.w, this.h);
    if (this.color !== undefined) {
      pop();
    }
  }

  this.inBounds = function (x, y) {
    return (x >= this.rectBounds.x && x <= this.rectBounds.x1 && y >= this.rectBounds.y && y <= this.rectBounds.y1);
  }
}