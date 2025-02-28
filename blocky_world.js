
var VSHADER_SOURCE =`

precision mediump float;

  attribute vec4 a_Position;
  attribute vec2 a_UV; 
  attribute vec3 a_Normal;
  varying vec2 v_UV; 
  varying vec3 v_Normal; 
  varying vec4 v_vertPos; 
  varying vec4 v_vertPos2; 
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix; 
  uniform mat4 u_ViewMatrix;

  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix; 
  void main() {
   gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
   v_UV = a_UV;
  
  // v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
   v_Normal = a_Normal; 
   v_vertPos = u_ModelMatrix * a_Position; 
   v_vertPos2 = u_ModelMatrix * a_Position;
  
  }`

// Fragment shader program
var FSHADER_SOURCE =`


  precision mediump float;
  varying vec2 v_UV; 
  varying vec3 v_Normal;

  uniform vec4 u_FragColor;
  uniform vec3 u_lightPos; 
  uniform vec3 u_lightPos2; 
  uniform vec3 u_cameraPos; 
 varying vec4 v_vertPos; 
 varying vec4 v_vertPos2; 
  
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1; 
  uniform sampler2D u_Sampler2; 
  uniform sampler2D u_Sampler3; 
  uniform sampler2D u_Sampler4; 

  
  //direction and cos cutoff


  uniform bool u_lightOn; 
  uniform bool u_spotLight; 
  uniform int u_shiny; 
  
  uniform int u_red;
  uniform int u_green;
  uniform int u_blue;
   

 
  

  uniform int u_whichTexture; 
 
  void main() {

    if(u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0)/2.0,1.0);
    }

   else if(u_whichTexture == -2){
      gl_FragColor = u_FragColor; 
    }

    else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 02.0,1.0);
    }
   else if(u_whichTexture == 0){
   gl_FragColor = texture2D(u_Sampler0, v_UV);
}
  else if(u_whichTexture == 1){
   gl_FragColor = texture2D(u_Sampler1, v_UV)* (vec4(0.8,0.0,0.5,0.7));
}

 else if(u_whichTexture == 2){
   gl_FragColor = texture2D(u_Sampler2, v_UV);
}
    else if(u_whichTexture == 3){
   gl_FragColor = texture2D(u_Sampler3, v_UV) * (0.5 * vec4(0.9,0.6,0.0,1.0));
}
    else if(u_whichTexture == 4){
   gl_FragColor = texture2D(u_Sampler4, v_UV) * (0.5 * vec4(0.9,0.6,0.3,1.0));
}
     else if(u_whichTexture == 5){
   gl_FragColor = vec4(0.0,0.1,0.9,1.0);
}

//citation: I asked claude to help with the spotlight and debug a color issue 

 vec3 lightVector = u_lightPos -  vec3(v_vertPos); 
 vec3 lightVector2 = u_lightPos2 - vec3(v_vertPos2);
 float r = length(lightVector); 
float r2 = length(lightVector2); 



vec3 L = normalize(lightVector);
vec3 L2 = normalize(lightVector2);
vec3 N = normalize(v_Normal);

float nDotL = max(dot(N,L) , 0.0);
float nDotL2 = max(dot(N,L2),0.0);

vec3 R = reflect(-L,N); 
vec3 R2 = reflect(-L2, N);

vec3 E = normalize(u_cameraPos-vec3(v_vertPos));
vec3 E2 = normalize(u_cameraPos-vec3(v_vertPos2));

float spec = pow(max(dot(E,R), 0.0), 50.0);
float spec2 = pow(max(dot(E2,R2), 0.0), 10.0);

  vec3 spotDiffuse = vec3(gl_FragColor) * nDotL2 * 0.7;
 
  vec3 lightToFragment = normalize(vec3(v_vertPos2) - u_lightPos2);
  vec3 spotDirection = vec3(-0.4, -1.0, 0.0);
  float spotCosAngle = dot(normalize(spotDirection), lightToFragment);
    


// cos 30
float spotCutOff = 0.866; 

float spotIntensity = spotCosAngle;



vec3 diffuse = vec3(gl_FragColor) * nDotL *0.7; 

vec3 diffuse2 = vec3(gl_FragColor) * nDotL2 *0.7 *spotIntensity; 
vec3 specular2 = vec3(1.0, 1.0, 1.0) * spec2 * spotIntensity;

vec3 ambient = vec3(gl_FragColor) * 0.3; 
 
vec4 specColor = spec2 * vec4(float(u_red), float(u_green), float(u_blue),1.0);

 if(spotCosAngle > spotCutOff && u_spotLight) {
    
    spotIntensity = spotCosAngle;

if(u_spotLight && !(u_lightOn) && u_shiny == 0){
  
  gl_FragColor = vec4(specular2 + diffuse2 + ambient, 1.0);
}

 if(u_spotLight && u_lightOn && u_shiny == 0){

  gl_FragColor = vec4(spec + spec2 +  diffuse + diffuse2 + ambient, 1.0) * vec4(float(u_red), float(u_green), float(u_blue),1.0);

}

else if(u_spotLight && !(u_lightOn) && u_shiny == 0){
  
gl_FragColor = vec4(specular2 + diffuse2 + ambient, 1.0);
}
}
else if(!(u_spotLight) && u_lightOn && u_shiny == 0){
  gl_FragColor = vec4(spec + diffuse + ambient, 1.0)  * vec4(float(u_red), float(u_green), float(u_blue),1.0);
}

else if(!u_spotLight && u_lightOn && u_shiny == 1){
gl_FragColor = vec4(diffuse + ambient, 1.0)  * vec4(float(u_red), float(u_green), float(u_blue),1.0);

}
else{
 
  gl_FragColor = vec4(ambient, 1.0); 
}

  }`

let canvas;

let gl;
let a_Position;
let u_FragColor;
let a_UV; 
let a_Normal;
let u_Size;
let u_lightPos; 
let u_lightPos2; 
let u_lightOn; 
let u_spotLight; 
let u_spotCutOff;
let u_spotDirection;
let u_cameraPos; 
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix;
let u_ViewMatrix; 
let u_ProjectionMatrix; 
let u_Sampler0; 
let u_Sampler1; 
let u_Sampler2; 
let u_Sampler3; 
let u_Sampler4;
let u_whichTexture; 
let u_shiny; 
let u_red;
let u_blue; 
let u_green;  



function setupWebGL(){
  canvas = document.getElementById('webgl');
  

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  
 // initMouseControl();
  
}

function connectVariablesToGLSL(){

   // Initialize shaders
   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(a_UV < 0){
    console.log('Failed to get storage location of a_UV');
  }
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0){
    console.log('Failed to get storage location of a_Normal');
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }


  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if(!u_ModelMatrix){
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;

  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if(!u_GlobalRotateMatrix){
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;

  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if(!u_ViewMatrix){
    console.log("Failed to get storage location of u_ViewMatrix");
    return; 
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
    if(!u_ProjectionMatrix){
      console.log("Failed to get storage location of u_ProjectionMatrix");
    }
  
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    if(!u_ProjectionMatrix){
      console.log("Failed to get storage location of u_NormalMatrix");
    }
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
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

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
      console.error('Failed to get uniform location for u_whichTexture');
      return false;
  }
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
      console.error('Failed to get uniform location for u_lightPos');
      return false;
  }
  u_lightPos2 = gl.getUniformLocation(gl.program, 'u_lightPos2');
  if (!u_lightPos2) {
      console.error('Failed to get uniform location for u_lightPos2');
      return false;
  }
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
      console.error('Failed to get uniform location for u_cameraPos');
      return false;
  }
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
      console.error('Failed to get uniform location for u_lightOn');
      return false;
  }
  u_spotLight = gl.getUniformLocation(gl.program, 'u_spotLight');
  if (!u_spotLight) {
      console.error('Failed to get uniform location for u_spotLight');
      return false;
  }
  u_shiny = gl.getUniformLocation(gl.program, 'u_shiny');
  if (!u_shiny) {
    console.error('Failed to get uniform location for u_shiny');
    return false;
}
u_red = gl.getUniformLocation(gl.program, 'u_red');
if (!u_red) {
  console.error('Failed to get uniform location for u_red');
  return false;
}
u_green = gl.getUniformLocation(gl.program, 'u_green');
if (!u_green) {
  console.error('Failed to get uniform location for u_green');
  return false;
}
u_blue = gl.getUniformLocation(gl.program, 'u_blue');
if (!u_blue) {
  console.error('Failed to get uniform location for u_blue');
  return false;
}



  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


//problem is in here 


function initTextures() {

  
  var sky_image = new Image();
  var red_grid = new Image();
  var building = new Image(); 
  var palm = new Image(); 
  var wave = new Image(); 

   if (!sky_image || !red_grid || !building || !palm || !wave) {
     console.log('Failed to create image objects');
     return false;
   }
  

 //if(u_whichTexture == 0){
   sky_image.onload = function() { sendIMGtoText0(sky_image); };
   sky_image.src = 'vp_sky.png';
 //
  
  //if (u_whichTexture == 1) {
      red_grid.onload = function() { sendIMGtoText1(red_grid); };
      red_grid.src = 'cropped_grid.png';
  // }
  
  building.onload = function(){sendIMGtoText2(building);};
  building.src = 'obama.png';

  palm.onload = function(){sendIMGtoText3(palm);};
  palm.src = 'palm.png';

  wave.onload = function(){sendIMGtoText4(wave);};
  wave.src = 'wave.png';



return true;
}


function sendIMGtoText0(image) {

  var texture = gl.createTexture();

  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }


  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis
  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);


  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  
  gl.uniform1i(u_Sampler0, 0);
  
//  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

 // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}
function sendIMGtoText1(image) {
  var texture = gl.createTexture();   
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 

  gl.activeTexture(gl.TEXTURE1);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler1, 1);
}

function sendIMGtoText2(image) {
  var texture = gl.createTexture();   
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 

  gl.activeTexture(gl.TEXTURE2);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler2, 2);
}

function sendIMGtoText3(image) {
  var texture = gl.createTexture();   
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 

  gl.activeTexture(gl.TEXTURE3);

  gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler3, 3);
}


function sendIMGtoText4(image) {
  var texture = gl.createTexture();   
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 

  gl.activeTexture(gl.TEXTURE4);

  gl.bindTexture(gl.TEXTURE_2D, texture);


  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler4, 4);
}


//citation: https://math.hws.edu/eck/cs424/notes2013/webgl/cube-with-rotator.html


let isDragging = false;
let lastX = 0;

//initilizing rotation with mouse control 
function initMouseControl() {
  canvas.onmousedown = (ev) => {
      isDragging = true;
      lastX = ev.clientX;
      
  };

  canvas.onmouseup = () => {
      isDragging = false;
  };

  canvas.onmouseleave = () => {
      isDragging = false;
  };

  canvas.onmousemove = (ev) => {
   //  if (!isDragging) return;

      let deltaX = ev.clientX - lastX;
      lastX = ev.clientX;

      //normalize rotationm something is still a little glitchy
      g_globalAngle = (g_globalAngle + deltaX * 0.5) % 360;

      requestAnimationFrame(renderAllShapes);
  };
}
function updateRotationFromSlider(sliderValue) {
  g_globalAngle = parseFloat(sliderValue) % 360;
  if (g_globalAngle < 0) g_globalAngle += 360;
  lastAngle = g_globalAngle; 
  requestAnimationFrame(renderAllShapes);
}




//tick animation function 

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime; 

function tick(){

  g_seconds = performance.now()/1000.0 - g_startTime; 
  console.log(performance.now());

  updateAnimationAngle();

  renderAllShapes();

  requestAnimationFrame(tick);



}





var g_shapesList = [];


function conversion(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return[x,y];
}

function updateAnimationAngle(){
 
  if(g_animate){
  g_lightPos[0] = Math.sin(g_seconds);
 
  }
   

}




  


// var g_eye = [0,0,6];
// var g_at = [-10,0,-1];
// var g_up = [0,1,0];
let camera;
let g_globalMove = 0; 
let g_globalMoveL = 0;
let g_globalTurn = 0; 
let g_lightPos2 = [3.0,2.5,1.0];
//add blocks 
let g_lightOn = 1; 
let g_spotLight = false; 

let g_found = 0; 

  

function renderAllShapes() {
  
gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
gl.uniform3f(u_lightPos2, g_lightPos2[0], g_lightPos2[1], g_lightPos2[2]);
console.log("spotline on: " + g_spotLight);

var startTime = performance.now();
//var projMat = new Matrix4();
//projMat.setPerspective(90,canvas.width/canvas.height, 0.1, 30);
gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

//var viewMat = new Matrix4();
//viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0], g_up[1], g_up[2]);

gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements)
// gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);


var globalRotMatrix = new Matrix4().rotate(g_globalAngle,0,1,0);
gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMatrix.elements);

//gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]) 

gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//  gl.clear(gl.COLOR_BUFFER_BIT);

gl.uniform1i(u_lightOn, g_lightOn);

gl.uniform1i(u_spotLight, g_spotLight);
gl.uniform1i(u_red, g_color[0]);
gl.uniform1i(u_green, g_color[1]);
gl.uniform1i(u_blue, g_color[2]);




// var ball = new Sphere();

// if(g_normalOn == true){
// //   console.log("normal is true"); 
  
//    ball.textureNumber = -3;
//  }
//  if(g_normalOn == false){
//    ball.textureNumber = -2; 
//    }


// ball.matrix.scale(1,1,1);
// ball.matrix.translate(-1.8, 0.5, -0.7);
// ball.render(); 

var ball =  new Sphere();
//ball.color = [0.0,0.0,0.0,1.0];
 if(g_normalOn == true){
//   console.log("normal is true"); 
  this.shiny = 0; 
   ball.textureNumber = -3;
 }
if(g_normalOn == false){
  this.shiny = 0;
   ball.textureNumber = 5; 
 }


ball.matrix.scale(1, 1, 1);
ball.matrix.translate(-1.8, 0.5, -0.7);
ball.render(); 

//sky and floor
var sky =  new Cube();

if(g_normalOn == true){
//   console.log("normal is true"); 
  
   sky.textureNumber = -3;
   sky.shiny = 1; 
   
 }
 if(g_normalOn == false){
   sky.textureNumber = -1;
   sky.shiny = 1;  
 }
 sky.color = [1.0,1.0,1.0,1.0];

sky.matrix.scale(-15, -15, -15);
sky.matrix.translate(-0.5, -0.5, -0.5);
sky.render(); 

var obama =  new Cube();
obama.color = [1.0,1.0,1.0,1.0];

if(g_normalOn == true){
//   console.log("normal is true"); 
  
   obama.textureNumber = -3;
 }
 if(g_normalOn == false){
   obama.textureNumber = 2; 
 }
obama.matrix.scale(1, 1, 1);
obama.matrix.translate(0.8, -0.5, 0.8);
obama.render(); 



 var floor =  new Cube();
 floor.color = [1.0,0.0,1.0,1.0];
 floor.textureNumber = -2; 
 floor.shiny = 1; 
 floor.matrix.translate(0.0, -0.75, 0.0);
 floor.matrix.scale(15,0.02,15);
 floor.matrix.translate(-0.5, 0, -0.5);
floor.render(); 




var light_cube = new Cube();
//light_cube.textureNumber = -2; 
light_cube.textureNumber = -2; 
light_cube.color = [2.0,2.0,0.0,1.0];
light_cube.matrix.translate(0.0,0.0,1.0);
light_cube.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
//console.log('pos', g_lightPos[0], g_lightPos[1], g_lightPos[2] );

//light_cube.matrix.translate(-0.8, -0.8, 0.5);
light_cube.matrix.scale(-0.1,-0.1,-0.1);
light_cube.render();

// var spotlight = new Cube(); 
// spotlight.textureNumber = -2; 
// spotlight.color = [1.0,1.0,1.0,1.0];
// spotlight.matrix.translate(0.6,2.0,0.9);
// spotlight.matrix.rotate(-300,-10,20,1);
// spotlight.matrix.scale(0.25,0.25,0.25);
// spotlight.render();



//dino head 
var head = new Cube();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     head.textureNumber = -3;
   }
   if(g_normalOn == false){
     head.textureNumber = -2; 
   }

head.color = [0.0, 1.0, 0.4, 1.0];  

head.matrix.translate(0.1, 0.2, 0.2);
head.matrix.translate(0, 0,g_globalMove);
head.matrix.translate(g_globalMoveL,0,0);
head.matrix.rotate(0,0,0,1);
head.matrix.rotate(g_globalHead, 0 , 0, 1); 
//head.matrix.rotate(g_globalTurn % 90,0,1,0);

//copy for other elements of face
var head_mat = new Matrix4(head.matrix); 
var head_mat2 = new Matrix4(head.matrix); 
var mouth_mat = new Matrix4(head.matrix);
var eye_mat1 = new Matrix4(head.matrix); 
var eye_mat2 = new Matrix4(head.matrix); 


head.matrix.scale(0.4, 0.3, 0.2);


 
head.render();


//head spikes 
var head_spike1 = new Pyramid();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     head_spike1.textureNumber = -3;
   }
   if(g_normalOn == false){
     head_spike1.textureNumber = -2; 
   }
head_spike1.textureNumber = -2; 
head_spike1.color = [0.8, 0.4, 1.0, 1.0];  
head_spike1.matrix = new Matrix4(head_mat); 
head_spike1.matrix.translate(0.2, 0.3, 0); 
head_spike1.matrix.rotate(0, 0, 1, 0); 

head_spike1.matrix.scale(0.05, 0.1, 0.1);

head_spike1.render();

var head_spike2 = new Pyramid();

if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     head_spike2.textureNumber = -3;
   }
   if(g_normalOn == false){
     head_spike2.textureNumber = -2; 
   }
head_spike2.color = [0.8, 0.4, 1.0, 1.0];  




head_spike2.matrix = new Matrix4(head_mat2); 
head_spike2.matrix.translate(0.1, 0.3, 0); 
head_spike2.matrix.rotate(0, 0, 1, 0);
head_spike2.matrix.scale(0.05, 0.1, 0.1);
head_spike2.render();


//mouth 

var mouth = new Cube();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     mouth.textureNumber = -3;
   }
   if(g_normalOn == false){
     mouth.textureNumber = -2; 
   }
mouth.color = [0.0,0.0,0.0,1.0];
mouth.matrix = new Matrix4(mouth_mat);
mouth.matrix.translate(0.23,0.05, -0.04);
mouth.matrix.rotate(0,1,0,0);
mouth.matrix.scale(0.20,0.019,0.25);
mouth.render();



//eyes


var pupil_1 = new Cylinder();

if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     pupil_1.textureNumber = -3;
   }
   if(g_normalOn == false){
     pupil_1.textureNumber = -2; 
   }
pupil_1.color = [0.0, 0.0, 0.0, 1.0];
pupil_1.matrix = new Matrix4(eye_mat1);
pupil_1.matrix.translate(0.1, 0.2, 0.0);
pupil_1.matrix.rotate(90, 1, 0,0);  
pupil_1.matrix.scale(0.04, 0.02, 0.04);
pupil_1.render();

var pupil_2 = new Cylinder();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     pupil_2.textureNumber = -3;
   }
   if(g_normalOn == false){
     pupil_2.textureNumber = -2; 
   }
pupil_2.color = [0.0, 0.0, 0.0, 1.0];
pupil_2.matrix = new Matrix4(eye_mat2);
pupil_2.matrix.translate(0.1, 0.2, 0.2);

pupil_2.matrix.rotate(90, 1, 0,0);  
pupil_2.matrix.scale(0.04, 0.02, 0.04);
pupil_2.render();


//body and neck

var body = new Cube();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     body.textureNumber = -3;
   }
   if(g_normalOn == false){
     body.textureNumber = -2; 
   }
body.color = [0.0, 1.0, 0.4, 1.0]; 
body.matrix.translate(-0.50,-0.5,0.0);
body.matrix.translate(0, 0, g_globalMove);
body.matrix.translate(g_globalMoveL,0,0);
body.matrix.rotate(0,1,0,0);
//body.matrix.rotate(g_globalTurn % 90,0,1,0);
body.matrix.scale(0.8,0.4,0.6);
body.render();

//spikes for back 
var spike1 = new Pyramid();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     spike1.textureNumber = -3;
   }
   if(g_normalOn == false){
     spike1.textureNumber = -2; 
   }
spike1.color = [0.8, 0.4, 1.0, 1.0]; 

spike1.matrix.setTranslate(-0.3, -0.3, 0.15);
spike1.matrix.translate(0, 0, g_globalMove);
spike1.matrix.translate(g_globalMoveL,0,0);
spike1.matrix.rotate(0, 0, 1, 0);
spike1.matrix.scale(0.2, 0.4, 0.3);
spike1.render();



var spike2 = new Pyramid();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     spike2.textureNumber = -3;
   }
   if(g_normalOn == false){
     spike2.textureNumber = -2; 
   }
spike2.color = [0.8, 0.4, 1.0, 1.0];  
spike2.matrix.setTranslate(-0.5, -0.3, 0.15);
spike2.matrix.translate(0, 0, g_globalMove);
spike2.matrix.translate(g_globalMoveL,0,0);
spike2.matrix.rotate(0, 0, 1, 0);
spike2.matrix.scale(0.2, 0.4, 0.3);
spike2.render();



var spike3 = new Pyramid();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     spike3.textureNumber = -3;
   }
   if(g_normalOn == false){
     spike3.textureNumber = -2; 
   }
spike3.color = [0.8, 0.4, 1.0, 1.0];  
spike3.matrix.setTranslate(-0.1, -0.3, 0.15);
spike3.matrix.translate(0, 0, g_globalMove);
spike3.matrix.translate(g_globalMoveL,0,0);
spike3.matrix.rotate(0, 0, 1, 0);
spike3.matrix.scale(0.2, 0.4, 0.3);
spike3.render();



var neck = new Cube();if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     neck.textureNumber = -3;
   }
   if(g_normalOn == false){
     neck.textureNumber = -2; 
   }
neck.color = [0.0,1.0,0.4,1.0];
neck.matrix.translate(0.15,-0.2,0.2);
neck.matrix.translate(0, 0,g_globalMove);
neck.matrix.translate(g_globalMoveL,0,0);
neck.matrix.rotate(0,1,0,0);
//neck.matrix.rotate(g_globalTurn % 90,0,1,0);
neck.matrix.scale(0.12,0.4,0.15);
neck.render();


//tail stuff 
var tail = new Cube();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     tail.textureNumber = -3;
   }
   if(g_normalOn == false){
     tail.textureNumber = -2; 
   }
tail.color = [0.0,1.0,0.4,1.0];
tail.matrix.setIdentity();
tail.matrix.translate(-0.8,-0.2,0.2);
tail.matrix.translate(0, 0, g_globalMove);
tail.matrix.translate(g_globalMoveL,0,0);
tail.matrix.rotate(g_globalTail, 0, 0, 1); 
tail.matrix.rotate(90,1,0,0); 
tail.matrix.rotate(0,0,1,0);
//tail.matrix.rotate(-g_globalTurn % 90,0,0,1);
var new_tail = new Matrix4(tail.matrix);
//var new_tail_spike = new Matrix4(tail.matrix);
tail.matrix.scale(0.42,0.2,0.12);
tail.render();

var tail2 = new Cube();
if(g_normalOn == true){
  //   console.log("normal is true"); 
    
     tail2.textureNumber = -3;
   }
   if(g_normalOn == false){
     tail2.textureNumber = -2; 
   }
tail2.color = [0.0, 1.0, 0.4, 1.0];
tail2.matrix = new Matrix4(new_tail);
tail2.matrix.translate(0.0, 0.0, 0.09);
tail2.matrix.translate(0, 0, 0);
tail2.matrix.rotate(-275, 0, 1, 0);
tail2.matrix.rotate(g_globalTail2, 0, 1, 0);
//tail2.matrix.rotate(1,0,g_globalTurn % 90,0);

var new_tail2 = new Matrix4(tail2.matrix);
tail2.matrix.scale(0.4, 0.18, 0.1);
tail2.render();




//legs
//make one back and one front move the same
//one back and one front move oppositie so 
//it looks like it is walking 

var back_leg1 = new Cylinder();
back_leg1.textureNumber = -2; 
back_leg1.color = [0.0, 0.6, 0.2, 1.0];
back_leg1.matrix.translate(-0.35, -0.55, 0.1);
back_leg1.matrix.translate(0, 0,g_globalMove);
back_leg1.matrix.translate(g_globalMoveL,0,0);
back_leg1.matrix.rotate(g_globalLeg, 0, 0, 1); 
back_leg1.matrix.scale(0.15, 0.3, 0.1); 
back_leg1.render(); 



var back_leg2 = new Cylinder();
back_leg2.textureNumber = -2; 
back_leg2.color = [0.0, 0.6, 0.2, 1.0];
back_leg2.matrix.setTranslate(-0.35, -0.55, 0.5);
back_leg2.matrix.translate(0, 0,g_globalMove);
back_leg2.matrix.translate(g_globalMoveL,0,0);
back_leg2.matrix.rotate(-g_globalLeg, 0, 0,1);  
back_leg2.matrix.scale(0.15, 0.3, 0.1);
back_leg2.render();



var front_leg1 = new Cylinder();
front_leg1.textureNumber = -2; 
front_leg1.color = [0.0, 0.6, 0.2, 1.0];
front_leg1.matrix.setTranslate(0.1, -0.55, 0.1);
front_leg1.matrix.translate(0, 0,g_globalMove);
front_leg1.matrix.translate(g_globalMoveL,0,0);
front_leg1.matrix.rotate(-g_globalLeg, 0,0);  
front_leg1.matrix.scale(0.15, 0.3, 0.1);
front_leg1.render();


var front_leg2 = new Cylinder();
front_leg2.textureNumber = -2; 
front_leg2.color = [0.0, 0.6, 0.2, 1.0];
front_leg2.matrix.setTranslate(0.1, -0.55, 0.5);
front_leg2.matrix.translate(0, 0,g_globalMove);
front_leg2.matrix.translate(g_globalMoveL,0,0);
front_leg2.matrix.rotate(g_globalLeg, 0, 0,1); 
front_leg2.matrix.scale(0.15, 0.3, 0.1);
front_leg2.render();




var duration = performance.now() - startTime;
sendTextToHTML("ms: " + Math.floor(duration) + "  fps: " + Math.floor(10000/duration)/10, "numbd")
sendTextToHTML("moving light at x: " + g_lightPos[0].toFixed(2) + "  y: " + g_lightPos[1] + " z: " + g_lightPos[2], "lightstatus")


;




}

function sendTextToHTML(text, htmlId){

var HTMLelm = document.getElementById(htmlId);

if(!HTMLelm){
  console.log("Failed to get" +htmlId);
  return;
}

HTMLelm.innerHTML = text;
}


let g_globalAngle = 0;
let g_globalLeg = 0;

let g_globalTail = 0; 
let g_globalTail2 = 0; 
let g_globalTail3 = 0; 
let g_globalHead = 0; 
let g_animate = true; 
let g_lightPos = [0,1,2];
let g_color = [1.0,1.0,1.0,1.0];
//normal stuff 
let g_normalOn = false; 

function userInterface(){

  //document.getElementById("camera_slide").addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
 // document.getElementById("join2_slide").addEventListener('mousemove', function() {g_globalJoin2 = this.value; renderAllShapes();});
 

 document.getElementById("normal_on").onclick = function(){g_normalOn = true;};

document.getElementById("normal_off").onclick = function(){g_normalOn = false;};
document.getElementById("light_on").onclick = function(){g_lightOn = true;};

document.getElementById("light_off").onclick = function(){g_lightOn = false;};
document.getElementById("spotlight_on").onclick = function(){ g_spotLight = true; renderAllShapes(); };
document.getElementById("spotlight_off").onclick = function(){ g_spotLight = false; renderAllShapes(); };
document.getElementById("animate_off").onclick = function(){ g_animate = false;};
document.getElementById("animate_on").onclick = function(){ g_animate = true;};
document.getElementById("camera_slide").addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});

document.getElementById("x_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[0] = this.value/100; renderAllShapes();}});


document.getElementById("y_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[1] = this.value/100; renderAllShapes();}});

document.getElementById("z_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[2] = this.value/100; renderAllShapes();}});
document.getElementById("red_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_color[0] = this.value/255; renderAllShapes();}});


document.getElementById("green_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_color[1] = this.value/255; renderAllShapes();}});

document.getElementById("blue_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_color[2] = this.value/255; renderAllShapes();}});
//document.getElementById("button").onclick = function(){g_found = 1;};



}

function keydown(ev){


  //a
  if(ev.keyCode == 65){

    camera.moveLeft();
  }
  //d
  if(ev.keyCode == 68){
    camera.moveRight(); 
  }
  //w
  if(ev.keyCode == 87){
    camera.moveForward();
  }

  //s
 if(ev.keyCode == 83){
    camera.moveBackward();
  }

  //q

  if(ev.keyCode == 81){

    camera.panLeft(); 
  }

  //e
  if(ev.keyCode == 69){

    camera.panRight();
  }


  //forward and backward
  //up
if(ev.keyCode == 38){
    g_globalMove -= 0.1; 
  }
  //down
  if(ev.keyCode == 40){
    g_globalMove += 0.1; 
  }

  //l
  if(ev.keyCode == 37){
    g_globalMoveL -= 0.1; 
  }
  //r
  if(ev.keyCode == 39){
    g_globalMoveL += 0.1; 
  }
  // else if(ev.keyCode == 37){

  //   g_globalTurn += 10; 

  // }
  // else if(ev.keyCode == 39){

  //   g_globalTurn -= 10; 

  // }



  renderAllShapes();
  console.log(ev.keyCode);

}



function main() {
  // Initialize WebGL and shaders
  setupWebGL();
  connectVariablesToGLSL();
  userInterface();



  
  initTextures();
  //too glitvhy 
  //initMouseControl();
  camera = new Camera(canvas.width/canvas.height, 0, 1000);
  document.onkeydown = keydown;
//  camera.eye = new Vector3([0, 0, 2]);
//  camera.at = new Vector3([0, 0, -1]);
  //camera.updateViewMatrix();
  renderAllShapes(); 


  //drawWalter(); 

  // Set up event handlers
  // canvas.onmousedown = click;
  // canvas.onmousemove = function (ev) {
  //   if (ev.buttons === 1) {
  //     click(ev);
  //   }
  // };

  gl.clearColor(0.0,0.0,0.0,1.0);
 // renderAllShapes();

 requestAnimationFrame(tick);
}
