class Camera {
  constructor() {
    this.eye = new Vector3([0, 0, 3]);
    this.at = new Vector3([0, 0, -100]);
    this.up = new Vector3([0, 1, 0]);
    this.angle = 0;       // angle in degrees
    this.step = 0.1;
  }

  forward() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye).normalize().mul(this.step);
    this.eye.add(f);
    this.at.add(f);
  }

  back() {
    let f = new Vector3(this.eye.elements);
    f.sub(this.at).normalize().mul(this.step);
    this.eye.add(f);
    this.at.add(f);
  }

  left() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye).normalize();
    let s = Vector3.cross(f, this.up).normalize().mul(-this.step);
    this.eye.add(s);
    this.at.add(s);
  }

  right() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye).normalize();
    let s = Vector3.cross(f, this.up).normalize().mul(this.step);
    this.eye.add(s);
    this.at.add(s);
  }

  turnLeft() {
    this.turn(-2); 
  }

  turnRight() {
    this.turn(2); 
  }

  turn(angleDelta) {
    this.angle += angleDelta;
    this.updateLookAt();
  }

  updateLookAt() {
    let rad = (this.angle * Math.PI) / 180;
    let dir = new Vector3([Math.sin(rad), 0, -Math.cos(rad)]);
    this.at.set(new Vector3([
      this.eye.elements[0] + dir.elements[0],
      this.eye.elements[1] + dir.elements[1],
      this.eye.elements[2] + dir.elements[2]
    ]));
  }
}