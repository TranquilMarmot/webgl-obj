var Renderer = {
	canvas: {}, gl: {},   // canvas being drawn to and WebGL context
	shaderProgram:  {},   // shader program handle
	quadBuffer:     {},   // buffer to hold position vertices for quad
	models:         {},   // list of loaded models
	textures:       {},   // list of loaded textures

	// used for timing
	time: 0, startTime: Date.now(),

	diamondLocs: [],

	diamondRots: [],

	// size of window
	windowWidth: 0.0, windowHeight: 0.0,

	/** Called when canvas is created */
	init: function() {
		for(var i = 5; i < 100; i++){
			var x = Math.random() * i, y = Math.random() * i, z = -i;
			if(Math.random() > 0.5)
				x = -x;
			if(Math.random() < 0.5)
				y = -y;
			this.diamondLocs.push([x, y, z]);
			this.diamondRots.push([Math.random(), Math.random(), Math.random(), Math.random()]);
		}


		this.initGL(canvas);
	  
		// only continue if WebGL is available
		if (gl) {
			// set window resize listener; intial call sets canvas size and gl viewport
			this.onWindowResize();
			window.addEventListener('resize', this.onWindowResize, false);

			Sandbox.init();
			ModelRenderer.init();
	  	}

	  	loadTexture("bitwaffle", "models/bitwaffle/bitwaffle.png");

	  	ModelLoader.loadModel(
			"models/bitwaffle/bitwaffle.obj", "models/bitwaffle/bitwaffle.mtl", "bitwaffle",
			function(model){
				Renderer.models['bitwaffle'] = model;
			}
		);

		loadTexture("diamond", "models/diamond/diamond.png");
		ModelLoader.loadModel(
			"models/diamond/diamond.obj", "models/diamond/diamond.mtl", "diamond",
			function(model){
				Renderer.models['diamond'] = model;
			}
		);

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
			alert("Oh man, couldn't initialize WebGL! What gives, you using an old browser or something? Psh.");
		}

		if (gl) {
			gl.clearColor(0.0, 0.0, 0.0, 1.0);	// Clear to black, fully opaque
			gl.clearDepth(1.0);					// Clear everything
		}
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

	/** Renders the scene */
	render: function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		Sandbox.render();

		wat += 0.05;
		var rads = wat * Math.PI / 180.0;

		for(var i = 0; i < this.diamondLocs.length; i++){
			this.diamondLocs[i][1] -= 0.025;
			if(this.diamondLocs[i][1] < -10.0)
				this.diamondLocs[i][1] = 10.0;

			var m = Matrix.Translation($V(this.diamondLocs[i])).ensure4x4();
			var rot = this.diamondRots[i];
			m = m.x(Matrix.Rotation(rot[0], $V([rot[1], rot[2], rot[3]])).ensure4x4());
				
			rot[0] += (Math.random() / 100.0) + 0.05;

			ModelRenderer.renderModel(Renderer.models['diamond'], m);
		}

		var initwafflerot = 90 * Math.PI / 180.0;
		var m = Matrix.I(4);
		m = m.x(Matrix.Translation($V([0.0, 0.0, -7.0])));
	  	m = m.x(Matrix.Rotation(initwafflerot, $V([1.0, 0.0, 0.0])).ensure4x4());
	  	m = m.x(Matrix.Rotation(wat, $V([0.0, 0.0, 1.0])).ensure4x4());

		ModelRenderer.renderModel(Renderer.models['bitwaffle'], m);
	}
}
