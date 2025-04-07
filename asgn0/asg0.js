// DrawTriangle.js (c) 2012 matsuda
function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return false;
    }
  
    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');
  
    // Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color
  
    let v1 = new Vector3([2.25, 2.25]);
    drawVector(v1, "red")
  }
  
  function drawVector(v, color){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
  
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
  
    var scaledX = v.elements[0] * 20;
    var scaledY = v.elements[1] * 20;
  
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + scaledX, centerY - scaledY);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  
  function handleDrawEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    var x1= parseFloat(document.getElementById("x1").value);
    var y1 = parseFloat(document.getElementById("y1").value);
  
    var x2 = parseFloat(document.getElementById("x2").value);
    var y2 = parseFloat(document.getElementById("y2").value);
  
    var v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");
  
  
    var v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");
  
  }
  
  function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    var x1 = parseFloat(document.getElementById("x1").value);
    var y1 = parseFloat(document.getElementById("y1").value);
  
    var x2 = parseFloat(document.getElementById("x2").value);
    var y2 = parseFloat(document.getElementById("y2").value);
    var scalar = parseFloat(document.getElementById("scalar").value);
    var operation = document.getElementById("operation").value;
  
    var v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");
    var v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");
  
    if (operation === "add") {
          var v3 = new Vector3().set(v1).add(v2);
          drawVector(v3, "green");
    } else if (operation === "sub") {
          var v3 = new Vector3().set(v1).sub(v2);
          drawVector(v3, "green");
    } else if (operation === "mul") {
          var v3 = new Vector3().set(v1).mul(scalar);
          var v4 = new Vector3().set(v2).mul(scalar);
          drawVector(v3, "green");
          drawVector(v4, "green");
    } else if (operation === "div") {
          var v3 = new Vector3().set(v1).div(scalar);
          var v4 = new Vector3().set(v2).div(scalar);
          drawVector(v3, "green");
          drawVector(v4, "green");
    } else if (operation === "mag"){
          var v1_magnitude = new Vector3().set(v1).magnitude();
          var v2_magnitude = new Vector3().set(v2).magnitude();
          console.log("Magnitude v1: ", v1_magnitude);
          console.log("Magnitude v2: ", v2_magnitude);
    } else if (operation === "norm"){
          var v3 = new Vector3().set(v1).normalize(v3);
          var v4 = new Vector3().set(v2).normalize(v4);
          drawVector(v3, "green");
          drawVector(v4, "green");
    } else if (operation == "angle"){
          angleDegrees = angleBetween(v1, v2);
          console.log("Angle: ", angleDegrees);
    }
      else if (operation == "area"){
          area = areaTriangle(v1, v2);
          console.log("Area of the triangle: ", area);
      }
  
  }
  
  function angleBetween(v1, v2){
    var dot_product = Vector3.dot(v1, v2);
    var v1_magnitude = new Vector3().set(v1).magnitude();
    var v2_magnitude = new Vector3().set(v2).magnitude();
    var alpha = dot_product/(v1_magnitude * v2_magnitude);
    var angle = Math.acos(alpha);
    var angleDegrees = angle * (180 / Math.PI);
    return angleDegrees;
  }
  
  function areaTriangle(v1, v2) {
    var cross_vector = Vector3.cross(v1, v2);
    var cross_magnitude = new Vector3().set(cross_vector).magnitude();
    let area = cross_magnitude / 2
    return area;
  }
  
  
  