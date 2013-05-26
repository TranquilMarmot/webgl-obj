var Sandbox = {
	gl: {},
	shaderProgram: {},
	quadBuffer: {},

	modelview: {}, projection: {},

	// location of attributes and uniforms in shaders
	positionHandle: {}, timeHandle: {}, resolutionHandle: {},
	modelviewHandle: {}, projectionHandle: {},

	// used for timing
	time: 0, startTime: Date.now(),

	// size of window
	windowWidth: 0.0, windowHeight: 0.0,

	init: function(gl){
		this.gl = gl;
		Sandbox.initShaders();
		Sandbox.initBuffers();
	},

	initShaders: function(){
		// create shaders
		var fragmentShader = Renderer.createShader(
			document.getElementById('sandboxFragmentShader').textContent,
			gl.FRAGMENT_SHADER
		);
		var vertexShader   = Renderer.createShader(
			document.getElementById('sandboxVertexShader').textContent,
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
		positionHandle   = gl.getAttribLocation(shaderProgram, "position");
		timeHandle       = gl.getUniformLocation(shaderProgram, "time");
		resolutionHandle = gl.getUniformLocation(shaderProgram, "resolution");
		projectionHandle = gl.getUniformLocation(shaderProgram, "projection");
		modelviewHandle  = gl.getUniformLocation(shaderProgram, "modelview");

		gl.useProgram(null);
	},

	/** Initializes buffer to send vertex position info to WebGL */
	initBuffers: function() {
		// create buffer for the quad's vertices.  
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

	render: function(){
		gl.useProgram(shaderProgram);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.time = Date.now() - this.startTime;
	  
		this.projection = makePerspective(45, canvas.width/canvas.height, 0.1, 100.0);
		this.modelview  = Matrix.I(4);
	  
	  	this.modelview = this.modelview.x(Matrix.Translation($V([-0.0, 0.0, -5.0])));

	  	var rads = (this.time / 10.0) * Math.PI / 180.0;

	  	var m = Matrix.Rotation(rads, $V([0.0, 1.0, 0.0])).ensure4x4();
		this.modelview = this.modelview.x(m);	  	
	  
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