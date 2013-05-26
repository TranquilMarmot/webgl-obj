var Sandbox = {
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

	init: function(){
		this.initShaders();
		this.initBuffers();
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
		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, vertexShader);
		gl.attachShader(this.shaderProgram, fragmentShader);
		gl.linkProgram(this.shaderProgram);
	  
	  	// alert if linking fails
		if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
			alert(gl.getProgramInfoLog(this.shaderProgram));
		}
	  
		// use program
		gl.useProgram(this.shaderProgram);
	  
	  	// get locations of attributes and uniforms
		positionHandle   = gl.getAttribLocation(this.shaderProgram, "position");
		timeHandle       = gl.getUniformLocation(this.shaderProgram, "time");
		resolutionHandle = gl.getUniformLocation(this.shaderProgram, "resolution");
		projectionHandle = gl.getUniformLocation(this.shaderProgram, "projection");
		modelviewHandle  = gl.getUniformLocation(this.shaderProgram, "modelview");

		gl.useProgram(null);
	},

	/** Initializes buffer to send vertex position info to WebGL */
	initBuffers: function() {
		// create buffer for the quad's vertices.  
		this.quadBuffer = gl.createBuffer();
	  
		// bind array buffer and send data
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			1.0,  1.0,	0.0,
			-1.0, 1.0,	0.0,
			1.0,  -1.0, 0.0,
			-1.0, -1.0, 0.0
		]), gl.STATIC_DRAW);
	},

	render: function(){
		gl.disable(gl.DEPTH_TEST);			// Enable depth testing
		gl.useProgram(this.shaderProgram);
		this.time = Date.now() - this.startTime;
	  
		this.projection = makePerspective(45, canvas.width/canvas.height, 0.1, 100.0);
		this.modelview  = Matrix.I(4);
	  
	  	this.modelview = this.modelview.x(Matrix.Translation($V([-0.0, 0.0, -0.101])));

	  	//var rads = (this.time / 10.0) * Math.PI / 180.0;

	  	//var m = Matrix.Rotation(rads, $V([0.0, 1.0, 0.0])).ensure4x4();
		//this.modelview = this.modelview.x(m);	  	
	  
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
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