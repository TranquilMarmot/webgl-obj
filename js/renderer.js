var Renderer = {
	canvas: {},
	// WebGL instance
	gl: {},
	// buffer to hold position vertices
	quadBuffer: {},
	//  modelview and projection matrices
	modelview: {}, projection: {},
	// shader program handle
	shaderProgram: {},
	// location of attributes and uniforms in shaders
	positionHandle: {}, timeHandle: {}, resolutionHandle: {},
	modelviewHandle: {}, projectionHandle: {},
	// timer
	time: 0,
	// time that application started
	startTime: Date.now(),
	// size of window
	windowWidth: 0.0, windowHeight: 0.0,

	/** Called when canvas is created */
	init: function() {
		this.initGL(canvas);
	  
		// only continue if WebGL is available
		if (gl) {
			// set window resize listener; intial call sets canvas size and gl viewport
			this.onWindowResize();
			window.addEventListener('resize', this.onWindowResize, false);

			this.initShaders();
			this.initBuffers();
	  }
	},

	/** What happens when window gets resized */
	onWindowResize: function(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		if(gl)
			gl.viewport(0, 0, canvas.width, canvas.height);
	},

	/**
	  * Initializes WebGL
	  * After this, if 'gl' is null then it means that WebGl wasn't properly initialized.
	  */
	initGL: function() {
		try {
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		}catch(error) {
			// alert user if gl isn't supported
			alert("Oh man, couldn't initialize WebGL! What gives you using an old browser or something?");
		}

		if (gl) {
			gl.clearColor(0.0, 0.0, 0.0, 1.0);	// Clear to black, fully opaque
			gl.clearDepth(1.0);					// Clear everything
			gl.enable(gl.DEPTH_TEST);			// Enable depth testing
			gl.depthFunc(gl.LEQUAL);			// Near things obscure far things
		}
	},

	/** Initializes buffer to send vertex position info to WebGL */
	initBuffers: function() {
		// Create a buffer for the quad's vertices.  
		quadBuffer = gl.createBuffer();
	  
		// bind array buffer and send data
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			1.0,  1.0,	0.0,
			-1.0, 1.0,	0.0,
			1.0,  -1.0, 0.0,
			-1.0, -1.0, 0.0
		]), gl.STATIC_DRAW);
	},

	/** Creates a shader of the given type with the given string, returns shader object on success, null otherwise */
	createShader: function(src, type){
		var shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			alert(gl.getShaderInfoLog(shader));
			return null;
		} else
			return shader;
	},

	/** Initializes shaders */
	initShaders: function(){
		// create shaders
		var fragmentShader = this.createShader(
			document.getElementById('fragmentShader').textContent,
			gl.FRAGMENT_SHADER
		);
		var vertexShader = this.createShader(
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
		projectionHandle = gl.getUniformLocation(shaderProgram, "projection");
		modelviewHandle = gl.getUniformLocation(shaderProgram, "modelview");

		gl.useProgram(null);
	},

	/** Renders the scene */
	render: function() {
		gl.useProgram(shaderProgram);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.time = Date.now() - this.startTime;
	  
		this.projection = makePerspective(45, canvas.width/canvas.height, 0.1, 100.0);
		this.modelview = Matrix.I(4);
	  
	  	this.modelview = this.modelview.x(Matrix.Translation($V([-0.0, 0.0, -0.5])));
	  
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.vertexAttribPointer(positionHandle, 3, gl.FLOAT, false, 0, 0);
		
		gl.uniform1f(timeHandle, this.time / 1000);
		gl.uniform2f(resolutionHandle, canvas.width, canvas.height);
		gl.uniformMatrix4fv(projectionHandle, false, new Float32Array(this.projection.flatten()));
	 	gl.uniformMatrix4fv(modelviewHandle, false, new Float32Array(this.modelview.flatten()));

	 	gl.enableVertexAttribArray(positionHandle);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disableVertexAttribArray(positionHandle);
		gl.useProgram(null);
	}
}
