// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectMatrix;
  uniform mat4 u_NormalMatrix;
  void main() {
    gl_Position = u_ProjectMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main(){
    if (u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal+1.0)/2.0 , 1.0);
    } else if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if(u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if(u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if(u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if(u_whichTexture == 4){
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else if(u_whichTexture == 5){
      gl_FragColor = texture2D(u_Sampler5, v_UV);
    } else{
      gl_FragColor = vec4(1,.2,.2,1);
    }
    
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    //Red/Green 
    //if(r<1.0){
    //  gl_FragColor = vec4(1,0,0,1);
    //} else if (r<2.0){
    //  gl_FragColor = vec4(0,1,0,1);
    //}

    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);

    //N Dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    //Reflection
    vec3 R = reflect(-L, N);
    
    //eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    //Specular
    float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;
    
    vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL *0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;
    if(u_lightOn){
      if(u_whichTexture == 0){
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      }else{
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
    }
  }`

//global
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal')
  if (a_Normal < 0){
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos')
  if (!u_lightPos){
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn')
  if (!u_lightOn){
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos')
  if (!u_cameraPos){
    console.log('Failed to get the storage location of u_cameraPos');
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

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if(!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  } 

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
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
let g_cameraAngle = 0;
let g_textureUnit = 0;
let g_mouseDown = false;
let g_lastX = null;
let g_normalOn = false;
let g_lightPos = [0,1,-2];
let g_lightOn = true;



function addActionsForHtmlUI(){
  //BUTTONS
  document.getElementById('normalOn').onclick = function() { g_normalOn=true;};
  document.getElementById('normalOff').onclick = function() { g_normalOn=false;};
  document.getElementById('lightOnButton').onclick = function() { g_lightOn=true;};
  document.getElementById('lightOffButton').onclick = function() { g_lightOn=false;};
  document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation=true;};
  document.getElementById('animationYellowOFFButton').onclick = function() { g_yellowAnimation=false;};
  document.getElementById('animationMagOnButton').onclick = function() { g_magentaAnimation=true;};
  document.getElementById('animationMagOFFButton').onclick = function() { g_magentaAnimation=false;};

  //SLides
  document.getElementById('angleSlide').addEventListener('mousemove',  function(ev) {if(ev.buttons ==1) { g_globalAngle = this.value; renderAllShapes(); }});
  document.getElementById('yellowSlide').addEventListener('mousemove',  function(ev) {if(ev.buttons ==1) {g_yellowAngle = this.value; renderAllShapes(); }});
  document.getElementById('magentaSlide').addEventListener('mousemove',  function(ev) {if(ev.buttons ==1) {g_magentaAngle = this.value; renderAllShapes(); }});
  document.getElementById('lightSlideX').addEventListener('mousemove',  function(ev) {if(ev.buttons ==1) {g_lightPos[0] = this.value/100; renderAllShapes(); }});
  document.getElementById('lightSlideY').addEventListener('mousemove',  function(ev) {if(ev.buttons ==1) {g_lightPos[1] = this.value/100; renderAllShapes(); }});
  document.getElementById('lightSlideZ').addEventListener('mousemove',  function(ev) {if(ev.buttons ==1) {g_lightPos[2] = this.value/100; renderAllShapes(); }});

  canvas.onmousemove = function(ev) { if(ev.buttons ==1) {click(ev)}};

}

function initTextures() {
  const textureList = [
    { src: 'sky.jpg', unit: 0, sampler: u_Sampler0 },
    { src: 'grass.jpg', unit: 1, sampler: u_Sampler1 },
    { src: 'wall.jpg', unit: 2, sampler: u_Sampler2 },
    { src: 'wings.jpg', unit: 3, sampler: u_Sampler3 },
    { src: 'body.jpg', unit: 4, sampler: u_Sampler4 },
    { src: 'ball.jpg', unit: 5, sampler: u_Sampler5 }

  ];

  textureList.forEach(({ src, unit, sampler }) => {
    const image = new Image();
    image.onload = () => {
      const texture = gl.createTexture();
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(sampler, unit);
      console.log(`Bound ${src} to texture unit ${unit}`);
    };
    image.src = src;
  });
}



function sendTextureToGLSL(image){
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  if (g_textureUnit === 0) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_Sampler0, 0);
  } else if (g_textureUnit === 1) {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_Sampler1, 1);
  } else if (g_textureUnit === 2) {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_Sampler2, 2);
  } else if (g_textureUnit === 3) {
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_Sampler3, 3);
  } else if (g_textureUnit === 4) {
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_Sampler4, 4);
  } else if (g_textureUnit === 5) {
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_Sampler5, 5);
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  console.log('finished loading texture');
  g_textureUnit++;
   
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev)} };

  
  canvas.onmousedown = (ev) => {
  g_mouseDown = true;
  g_lastX = ev.clientX;
  };

  document.onmouseup = () => {
  g_mouseDown = false;
  g_lastX = null;
  };

  document.onmousemove = (ev) => {
  if (g_mouseDown) onMouseMove(ev);
  };

  document.onkeydown = keydown;
  initTextures();
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //renderAllShapes();
  g_camera.eye.elements[0] *= -1;
  g_camera.eye.elements[1] *= -1;
  g_camera.eye.elements[2] *= -1;

  g_camera.at.elements[0] *= -1;
  g_camera.at.elements[1] *= -1;
  g_camera.at.elements[2] *= -1;
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function onMouseMove(ev) {
  if (g_lastX === null) {
    g_lastX = ev.clientX;
    return;
  }

  const deltaX = ev.clientX - g_lastX;
  g_lastX = ev.clientX;

  const ROTATE_SENSITIVITY = 0.3; 
  g_camera.turn(deltaX * ROTATE_SENSITIVITY);
}

function tick(){
  g_seconds=performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);

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

  g_lightPos[0] = 2.3 * Math.cos(g_seconds);
}

function keydown(ev) {
  console.log("Key pressed:", ev.key); 
  switch (ev.key.toLowerCase()) {
    case 'w': g_camera.forward(); break;
    case 's': g_camera.back(); break;
    case 'a': g_camera.left(); break;
    case 'd': g_camera.right(); break;
    case 'q': g_camera.turnLeft(); break;
    case 'e': g_camera.turnRight(); break;
    case 'f': 
      console.log("Pressed F");
      addBlockInFront(); 
      break;
    case 'g': 
      console.log("Pressed G");
      removeBlockInFront(); 
      break;
  }
  renderAllShapes();
}

function getMapCoordsInFront() {
  let dir = new Vector3(g_camera.at.elements).sub(g_camera.eye).normalize();
  let target = new Vector3([
  g_camera.eye.elements[0] + dir.elements[0] * 0.3,
  g_camera.eye.elements[1] + dir.elements[1] * 0.3,
  g_camera.eye.elements[2] + dir.elements[2] * 0.3
]);
  let x = Math.floor((target.elements[0] + 4.8) / 0.3);
  let z = Math.floor((target.elements[2] + 4.8) / 0.3);
  x = Math.max(0, Math.min(31, x));
  z = Math.max(0, Math.min(31, z));
  return [z, x]; 
}

function addBlockInFront() {
  const [z, x] = getMapCoordsInFront();
  console.log("Add at", z, x);
  if (worldMap[z][x] < 6) worldMap[z][x]++;
}

function removeBlockInFront() {
  const [x, z] = getMapCoordsInFront();

  if (worldMap[z] && worldMap[z][x] > 0) {
    console.log(`Removing block at ${z}, ${x}`);
    worldMap[z][x]--;
  } else {
    console.log(`No block to remove at ${z}, ${x}`);
  }
}


var g_camera = new Camera();

let worldMap = new Array(32).fill(0).map(() => new Array(32).fill(0));
for (let i = 0; i < 32; i++) {
  worldMap[i][0] = 3;
  worldMap[i][31] = 2;
  worldMap[0][i] = 1;
  worldMap[31][i] = 4;
}

for (let z = 6; z < 26; z += 6) {
  for (let x = 6; x < 26; x += 6) {
    worldMap[z][x] = Math.floor(Math.random() * 2) + 1;
  }
}

function drawMap() {
  let cube = new Cube();
  for (let z = 0; z < worldMap.length; z++) {
    for (let x = 0; x < worldMap[z].length; x++) {
      let height = worldMap[z][x];
      for (let y = 0; y < height; y++) {
        cube.matrix.setIdentity(); 
        cube.color = [0.7, 0.7, 0.7, 1];
        cube.textureNum = 2;
        cube.matrix.translate(x * 0.3 - 4.8, y * 0.3 - 0.75, z * 0.3 - 4.8);
        cube.matrix.scale(0.3, 0.3, 0.3);
        cube.renderfaster();
      }
    }
  }
}



function renderAllShapes(){

  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectMatrix, false, projMat.elements);


  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
  );

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);


  //drawMap();

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);
  gl.uniform1i(u_lightOn, g_lightOn);

  var floor = new Cube();
  floor.color = [1.0, 0.0, 0.0, 1.0];
  floor.textureNum = 1;
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(10,0,10);
  floor.matrix.translate(-0.5, -0, -0.5);
  floor.render();

  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  if(g_normalOn) sky.textureNum = -3;
  sky.matrix.translate(0, -0.75, 0.0);
  sky.matrix.scale(-50,-50,-50);
  sky.matrix.translate(-0.5, -.5, -0.5);
  sky.render();

  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5, -.5, -.5);
  light.render();

  //sphere
  var sp  = new Sphere();
  sp.textureNum = 5;
  if(g_normalOn) sp.textureNum = -3;
  sp.matrix.translate(1.5, 0.3, 0.3);
  sp.render();
  
  //Body
  var body = new Cube();
  body.color = [1.0, 0.6, 0.0, 1.0];
  body.textureNum = 4;
  if(g_normalOn) body.textureNum = -3;
  body.matrix.translate(-0.2, -0.5, 0.0);
  body.matrix.scale(0.4, 0.6, 0.4);
  body.normalMatrix.setInverseOf(body.matrix).transpose();
  body.render();

  //Neck
  var neck = new Cube();
  neck.color = [1.0, 0.8, 0.6, 1.0]; 
  neck.textureNum = -2;
  if(g_normalOn) neck.textureNum = -3;
  neck.matrix.setTranslate(0.0, -.04, 0.0);
  neck.matrix.rotate(g_yellowAngle, 0, 0, 1);
  var neckCoord = new Matrix4(neck.matrix); 
  neck.matrix.scale(0.09, 0.09, 0.08);
  neck.matrix.translate(-0.5, 1.2, -0.001);
  neck.normalMatrix.setInverseOf(neck.matrix).transpose();
  neck.render();

  //Head
  var head = new Cube();
  head.color = [1.0, 1.0, 0.8, 1.0];
  head.textureNum = 4;
  if(g_normalOn) head.textureNum = -3;
  head.matrix = neckCoord;
  head.matrix.translate(0.0, 0.2, 0.0);
  head.matrix.rotate(g_magentaAngle, 0, 0, 1);
  head.matrix.scale(0.2, 0.2, 0.2);
  head.matrix.translate(-0.5, 0.0, 0.0);
  head.normalMatrix.setInverseOf(head.matrix).transpose();
  head.render();

  //Left Wing
  var leftWing = new Cube();
  leftWing.color = [0.8, 0.3, 0.3, 1.0];
  leftWing.textureNum = 3;
  if(g_normalOn) leftWing.textureNum = -3;
  leftWing.matrix.setTranslate(-0.2, -0.2, 0.0);
  leftWing.matrix.rotate(10 * Math.sin(g_seconds), 0, 0, 1);
  leftWing.matrix.scale(0.2, 0.4, 0.1);
  leftWing.matrix.translate(-1.0, 0.0, -0.001);
  leftWing.normalMatrix.setInverseOf(leftWing.matrix).transpose();
  leftWing.render();

  //Right Wing 
  var rightWing = new Cube();
  rightWing.color = [0.8, 0.3, 0.3, 1.0];
  rightWing.textureNum = 3;
  if(g_normalOn) rightWing.textureNum = -3;
  rightWing.matrix.setTranslate(0.2, -0.2, 0.0);
  rightWing.matrix.rotate(-10 * Math.sin(g_seconds), 0, 0, 1);
  rightWing.matrix.scale(0.2, 0.4, 0.1);
  rightWing.matrix.translate(0.0, 0.0, -0.001);
  rightWing.normalMatrix.setInverseOf(rightWing.matrix).transpose();
  rightWing.render();


  //Left Leg 
  var leftLeg = new Cube();
  leftLeg.color = [0.5, 0.3, 0.1, 1.0];
  leftLeg.textureNum = -2;
  if(g_normalOn) leftLeg.textureNum = -3;
  leftLeg.matrix.setTranslate(-0.2, -0.9, 0.0);
  leftLeg.matrix.scale(0.1, 0.4, 0.1);
  leftLeg.normalMatrix.setInverseOf(leftLeg.matrix).transpose();
  leftLeg.render();

  //Right Leg
  var rightLeg = new Cube();
  rightLeg.color = [0.5, 0.3, 0.1, 1.0];
  rightLeg.textureNum = -2;
  if(g_normalOn) rightLeg.textureNum = -3;
  rightLeg.matrix.setTranslate(0.1, -0.9, 0.0);
  rightLeg.matrix.scale(0.1, 0.4, 0.1);
  rightLeg.normalMatrix.setInverseOf(rightLeg.matrix).transpose();
  rightLeg.render();

  var beak = new Cube();
  beak.color = [1.0, 0.7, 0.0, 1.0]; 
  beak.textureNum = -2;
  if(g_normalOn) beak.textureNum = -3;
  beak.matrix = new Matrix4(head.matrix); 
  beak.matrix.translate(0.52, 0.3, -0.2);
  beak.matrix.scale(0.1, 0.1, 0.3); 
  beak.matrix.translate(-0.5, 0.0, 0.0);
  beak.normalMatrix.setInverseOf(beak.matrix).transpose();
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

