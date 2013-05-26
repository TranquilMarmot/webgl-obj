var ModelRenderer = {
	gl: {},
	shaderProgram: {},

	modelview: {}, projection: {},

	modelviewHandle: {}, projectionHandle: {}, normalMatrixHandle: {},
	positionHandle: {}, normalHandle: {}, texCoordHandle: {},
	lightPosHandle: {}, lightIntensityHandle: {}, lightEnableHandle: {},
	kaHandle: {}, ksHandle: {}, kdHandle: {}, shinyHandle: {},
	texHandle: {},

	init: function(){
		this.initShaders();
	},

	initShaders: function(){
		// create shaders
		var fragmentShader = Renderer.createShader(
			document.getElementById('3DfragmentShader').textContent,
			gl.FRAGMENT_SHADER
		);
		var vertexShader   = Renderer.createShader(
			document.getElementById('3DvertexShader').textContent,
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

		this.modelviewHandle = gl.getUniformLocation(this.shaderProgram, "ModelViewMatrix");
		this.projectionHandle = gl.getUniformLocation(this.shaderProgram, "ProjectionMatrix");
		this.normalMatrixHandle = gl.getUniformLocation(this.shaderProgram, "NormalMatrix");

		this.positionHandle = gl.getAttribLocation(this.shaderProgram, "VertexPosition");
		this.normalHandle   = gl.getAttribLocation(this.shaderProgram, "VertexNormal");
		this.texCoordHandle      = gl.getAttribLocation(this.shaderProgram, "VertexTexCoord");
		
		this.lightPosHandle = gl.getUniformLocation(this.shaderProgram, "Light.LightPosition");
		this.lightIntensityHandle = gl.getUniformLocation(this.shaderProgram, "Light.LightIntensity");
		this.lightEnableHandle = gl.getUniformLocation(this.shaderProgram, "Light.LightEnabled");

		this.kaHandle = gl.getUniformLocation(this.shaderProgram, "Material.Ka");
		this.ksHandle = gl.getUniformLocation(this.shaderProgram, "Material.Ks");
		this.kdHandle = gl.getUniformLocation(this.shaderProgram, "Material.Kd");
		this.shinyHandle = gl.getUniformLocation(this.shaderProgram, "Material.Shininess");

		this.texHandle = gl.getUniformLocation(this.shaderProgram, "Tex1");


		gl.useProgram(null);

		wat = 0;
	},

	renderModel: function(model, matrix){
		// only render if model exists
		if(model){
			gl.enable(gl.DEPTH_TEST);			// Enable depth testing
			gl.depthFunc(gl.LEQUAL);			// Near things obscure far things

			this.projection = makePerspective(45, canvas.width/canvas.height, 0.1, 100.0);
			this.modelview  = Matrix.I(4);
			this.modelview = (this.modelview.x(matrix.ensure4x4())).ensure4x4(); 


			gl.useProgram(this.shaderProgram);

			gl.enableVertexAttribArray(this.positionHandle);
			gl.bindBuffer(gl.ARRAY_BUFFER, model.vertBuff);
			gl.vertexAttribPointer(this.positionHandle, 3, gl.FLOAT, false, 0, 0);

			gl.enableVertexAttribArray(this.normalHandle);
			gl.bindBuffer(gl.ARRAY_BUFFER, model.normBuff);
			gl.vertexAttribPointer(this.normalHandle, 3, gl.FLOAT, false, 0, 0);

			gl.enableVertexAttribArray(this.texCoordHandle);
			gl.bindBuffer(gl.ARRAY_BUFFER, model.texBuff);
			gl.vertexAttribPointer(this.texCoordHandle, 2, gl.FLOAT, false, 0, 0);

			// temp lighting
			gl.uniform4f(this.lightPosHandle, 0.0, 0.0, 5.0, 0.0);
			gl.uniform3f(this.lightIntensityHandle, 0.9, 0.9, 0.9);
			gl.uniform1i(this.lightEnableHandle, 1);

			gl.uniformMatrix4fv(this.projectionHandle, false, new Float32Array(this.projection.flatten()));
	 		gl.uniformMatrix4fv(this.modelviewHandle, false, new Float32Array(this.modelview.flatten()));
	 		var normMat = Matrix.create(
	 					[[this.modelview.elements[0][0], this.modelview.elements[0][1], this.modelview.elements[0][2]],
						[this.modelview.elements[1][0], this.modelview.elements[1][1], this.modelview.elements[1][2]],
                    	[this.modelview.elements[2][0], this.modelview.elements[2][1], this.modelview.elements[2][2]]]);
	 		gl.uniformMatrix3fv(this.normalMatrixHandle, false, new Float32Array(normMat.flatten()));

	 		gl.activeTexture(gl.TEXTURE0);
	 		gl.bindTexture(gl.TEXTURE_2D, Renderer.textures[model.texture]);
	 		gl.uniform1i(this.texHandle, 0);

			for(var i = 0; i < model.parts.length; i++){
				var
				part = model.parts[i],
				mat  = part.material;

				gl.uniform3f(this.kaHandle, mat.Ka[0], mat.Ka[1], mat.Ka[2]);
				gl.uniform3f(this.ksHandle, mat.Ks[0], mat.Ks[1], mat.Ks[2]);
				gl.uniform3f(this.kdHandle, mat.Kd[0], mat.Kd[1], mat.Kd[2]);
				gl.uniform1f(this.shinyHandle, mat.Shininess);

				gl.drawArrays(gl.TRIANGLES, part.index, part.count);
			}

			gl.disableVertexAttribArray(this.positionHandle);
			gl.disableVertexAttribArray(this.normalHandle);
			gl.disableVertexAttribArray(this.texCoordHandle);

			gl.useProgram(null);
		}
	}
}