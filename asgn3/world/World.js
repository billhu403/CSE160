// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectMatrix;
  void main() {
    gl_Position = u_ProjectMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main(){
    if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else{
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`

//global
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST)

}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV')
  if (a_UV < 0){
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }


  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  
  u_ProjectMatrix = gl.getUniformLocation(gl.program, 'u_ProjectMatrix');
  if(!u_ProjectMatrix) {
    console.log('Failed to get the storage location of u_ProjectMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  } 

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle=0;
let g_yellowAngle =0;
let g_magentaAngle=0;
let g_yellowAnimation=false;
let g_magentaAnimation=false;

function addActionsForHtmlUI(){
  //BUTTONS
  document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation=true;};
  document.getElementById('animationYellowOFFButton').onclick = function() { g_yellowAnimation=false;};

  document.getElementById('animationMagOnButton').onclick = function() { g_magentaAnimation=true;};
  document.getElementById('animationMagOFFButton').onclick = function() { g_magentaAnimation=false;};

  //SLides
  document.getElementById('angleSlide').addEventListener('mousemove',  function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('yellowSlide').addEventListener('mousemove',  function() { g_yellowAngle = this.value; renderAllShapes(); });
  document.getElementById('magentaSlide').addEventListener('mousemove',  function() { g_magentaAngle = this.value; renderAllShapes(); });

}

function initTextures(gl, n){
    var image = new Image();
    if(!image){
        console.log('Failed to create the image object');
        return false;
    }
    image.onload = function(){ sendTextureToGLSL(image)};
    image.src = 'sky.jpg';
    return true;
}

function sendTextureToGLSL(image){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, 0);

    console.log('finished loadTexture');
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev)} };

  document.onkeydown = keydown;
  initTextures();
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){
  g_seconds=performance.now()/1000.0-g_startTime;
  console.log(g_seconds);

  updateAnimationAngles();

  renderAllShapes();
  requestAnimationFrame(tick);
}



var g_shapeList = [];

function click(ev) {
  [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if(g_selectedType == POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  } else{
    point = new Circle();
    point.segments = g_circleSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);

  
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function updateAnimationAngles(){
  if(g_yellowAnimation){
    g_yellowAngle = (20 *Math.sin(g_seconds));
  }

  if(g_magentaAnimation){
    g_magentaAngle = (20 *Math.sin(g_seconds));
  }
}

function keydown(ev){
    let d = 0.2; // movement step
    let angleStep = 5; // rotation step in degrees
  
    let forward = new Vector3([
      g_at.elements[0] - g_eye.elements[0],
      g_at.elements[1] - g_eye.elements[1],
      g_at.elements[2] - g_eye.elements[2]
    ]);
    forward.normalize();
  
    let right = Vector3.cross(forward, g_up);
    right.normalize();
  
    switch (ev.key.toLowerCase()) {
      case 'w': // forward
        g_eye = g_eye.add(forward.mul(d));
        g_at = g_at.add(forward.mul(d));
        break;
      case 's': // backward
        g_eye = g_eye.sub(forward.mul(d));
        g_at = g_at.sub(forward.mul(d));
        break;
      case 'a': // left
        g_eye = g_eye.sub(right.mul(d));
        g_at = g_at.sub(right.mul(d));
        break;
      case 'd': // right
        g_eye = g_eye.add(right.mul(d));
        g_at = g_at.add(right.mul(d));
        break;
      case 'q': // turn left
        g_cameraAngle -= angleStep;
        updateCameraDirection();
        break;
      case 'e': // turn right
        g_cameraAngle += angleStep;
        updateCameraDirection();
        break;
    }
  
    renderAllShapes();
}

function updateCameraDirection() {
    let rad = g_cameraAngle * Math.PI / 180;
    let x = Math.sin(rad);
    let z = -Math.cos(rad);
    g_at.elements[0] = g_eye.elements[0] + x;
    g_at.elements[1] = g_eye.elements[1]; 
    g_at.elements[2] = g_eye.elements[2] + z;
}

let g_eye = new Vector3([0, 0, 3]);
let g_at  = new Vector3([0, 0, -100]);
let g_up  = new Vector3([0, 1, 0]);

function renderAllShapes(){

  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectMatrix, false, projMat.elements);


  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_eye.elements[0], g_eye.elements[1], g_eye.elements[2],
    g_at.elements[0],  g_at.elements[1],  g_at.elements[2],
    g_up.elements[0],  g_up.elements[1],  g_up.elements[2]
  );

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Body
  var body = new Cube();
  body.color = [1.0, 0.6, 0.0, 1.0];
  body.textureNum = 0;
  body.matrix.translate(-0.2, -0.5, 0.0);
  body.matrix.scale(0.4, 0.6, 0.4);
  body.render();

  //Neck
  var neck = new Cube();
  neck.color = [1.0, 0.8, 0.6, 1.0]; 
  neck.matrix.setTranslate(0.0, -.04, 0.0);
  neck.matrix.rotate(g_yellowAngle, 0, 0, 1);
  var neckCoord = new Matrix4(neck.matrix); 
  neck.matrix.scale(0.1, 0.1, 0.1);
  neck.matrix.translate(-0.5, 1.2, -0.001);
  neck.render();

  //Head
  var head = new Cube();
  head.color = [1.0, 1.0, 0.8, 1.0];
  head.textureNum = 0;
  head.matrix = neckCoord;
  head.matrix.translate(0.0, 0.2, 0.0);
  head.matrix.rotate(g_magentaAngle, 0, 0, 1);
  head.matrix.scale(0.2, 0.2, 0.2);
  head.matrix.translate(-0.5, 0.0, 0.0);
  head.render();

  //Left Wing
  var leftWing = new Cube();
  leftWing.color = [0.8, 0.3, 0.3, 1.0];
  leftWing.matrix.setTranslate(-0.2, -0.2, 0.0);
  leftWing.matrix.rotate(10 * Math.sin(g_seconds), 0, 0, 1);
  leftWing.matrix.scale(0.2, 0.4, 0.1);
  leftWing.matrix.translate(-1.0, 0.0, -0.001);
  leftWing.render();

  //Right Wing 
  var rightWing = new Cube();
  rightWing.color = [0.8, 0.3, 0.3, 1.0];
  rightWing.matrix.setTranslate(0.2, -0.2, 0.0);
  rightWing.matrix.rotate(-10 * Math.sin(g_seconds), 0, 0, 1);
  rightWing.matrix.scale(0.2, 0.4, 0.1);
  rightWing.matrix.translate(0.0, 0.0, -0.001);
  rightWing.render();


  //Left Leg 
  var leftLeg = new Cube();
  leftLeg.color = [0.5, 0.3, 0.1, 1.0];
  leftLeg.matrix.setTranslate(-0.2, -0.9, 0.0);
  leftLeg.matrix.scale(0.1, 0.4, 0.1);
  leftLeg.render();

  //Right Leg
  var rightLeg = new Cube();
  rightLeg.color = [0.5, 0.3, 0.1, 1.0];
  rightLeg.matrix.setTranslate(0.1, -0.9, 0.0);
  rightLeg.matrix.scale(0.1, 0.4, 0.1);
  rightLeg.render();

  var beak = new Cube();
  beak.color = [1.0, 0.7, 0.0, 1.0]; 
  beak.matrix = new Matrix4(head.matrix); 
  beak.matrix.translate(0.52, 0.3, -0.2);
  beak.matrix.scale(0.1, 0.1, 0.3); 
  beak.matrix.translate(-0.5, 0.0, 0.0);
  beak.render();
  
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

