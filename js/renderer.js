var
	// canvas we're drawing to
	canvas,
	// WebGL instance
	gl,
	// buffer to hold position vertices
	quadBuffer,
	// projection and modelview matrix
	mvMatrix, perspectiveMatrix,
	// shader program handle
	shaderProgram,
	// location of position attribute in shader
	positionHandle, timeHandle, resolutionHandle,
	// timer
	time = 0,
	// time that application started
	startTime = Date.now(),
	// size of window
	windowWidth, windowHeight;

/** Called when canvas is created */
function start() {
	initCanvas();
	initGL(canvas);
  
	// only continue if WebGL is available and working
	if (gl) {
		initShaders();
		initBuffers();
		
		// start animation loop
		animate();
  }
}

/** Sets up an infinite loop to render */
function animate(){
	requestAnimationFrame(animate);
	render();
}

/** What happens when window gets resized */
function onWindowResize(){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	if(gl){
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
}

/** Creates a canvas attached to a div and adds it to the document */
function initCanvas(){
	// set animation to be at 60 fps
	if (!window.requestAnimationFrame){
		window.requestAnimationFrame = (function(){
			return window.webkitRequestAnimationFrame ||
				   window.mozRequestAnimationFrame ||
				   window.oRequestAnimationFrame ||
				   window.msRequestAnimationFrame ||
				   function ( callback, element ) {
					window.setTimeout( callback, 1000 / 60 );
				   };
		} )();
	}
	
	// Get older browsers safely through init code, so users can read the
	// message about how to download newer browsers.
	if (!Date.now) {
		Date.now = function() {
			return +new Date();
		};
	}
	
	// create div that holds our canvas and add it to document
	var div = document.createElement('div');
	document.body.appendChild(div);
	// create canvas that we'll be rendering to
	canvas = document.createElement("canvas");
	div.appendChild(canvas);

	// set window resize listener
	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);
}

/**
  * Initializes WebGL
  * After this, if 'gl' is null then it means that WebGl wasn't properly initialized.
  */
function initGL() {
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}
	catch(error) {
		// alert user if gl isn't supported
		alert("Oh man, couldn't initialize WebGL! What gives you using an old browser or something?");
	}

	if (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);	// Clear to black, fully opaque
		gl.clearDepth(1.0);					// Clear everything
		gl.enable(gl.DEPTH_TEST);			// Enable depth testing
		gl.depthFunc(gl.LEQUAL);			// Near things obscure far things
	}
}

/** Initializes buffer to send vertes position info to WebGL */
function initBuffers() {
	// Create a buffer for the square's vertices.  
	quadBuffer = gl.createBuffer();
  
	// Select the quadBuffer as the one to apply vertex
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		1.0,  1.0,	0.0,
		-1.0, 1.0,	0.0,
		1.0,  -1.0, 0.0,
		-1.0, -1.0, 0.0
	]), gl.STATIC_DRAW);
}

/** Renders the scene */
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
	perspectiveMatrix = makePerspective(45, canvas.width/canvas.height, 0.1, 100.0);
	loadIdentity();
  
 	// Now move the drawing position a bit to where we want to start
	// drawing the square.
	mvTranslate([-0.0, 0.0, -0.5]);
  
	// Draw the square by binding the array buffer to the square's vertices
	// array, setting attributes, and pushing it to GL.
	gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
	gl.vertexAttribPointer(positionHandle, 3, gl.FLOAT, false, 0, 0);
	
	time = Date.now() - startTime;
	gl.uniform1f(timeHandle, time / 1000);
	gl.uniform2f(resolutionHandle, canvas.width, canvas.height);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/** Initializes shaders */
function initShaders() {
	// create shaders
	var fragmentShader = createShader(
		document.getElementById('fragmentShader').textContent,
		gl.FRAGMENT_SHADER
	);
	var vertexShader = createShader(
		document.getElementById('vertexShader').textContent,
		gl.VERTEX_SHADER
	);
  
	// create program, attach shaders and link
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
  
  	// alert if linking fails
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert(gl.getProgramInfoLog(program));
	}
  
	// use program
	gl.useProgram(shaderProgram);
  
  	// get locations of attributes and uniforms
	positionHandle = gl.getAttribLocation(shaderProgram, "position");
	timeHandle = gl.getUniformLocation(shaderProgram, "time");
	resolutionHandle = gl.getUniformLocation(shaderProgram, "resolution");
	gl.enableVertexAttribArray(positionHandle);
}

/** Creates a shader of the given type with the given string, returns shader object on success, null otherwise */
function createShader(src, type){
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		alert(gl.getShaderInfoLog(shader));
		return null;
	} else{
		return shader;
	}

}

//
// Matrix utility functions
//
function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "projection");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "modelview");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}
