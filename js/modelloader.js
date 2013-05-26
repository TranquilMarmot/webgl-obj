var ModelLoader = {
	/**
	  * Loads a model from the given URLs.
	  * objurl: URL of .obj file
	  * mtlutl: URL of .mtl file that has material lib for .obj file
	  * onFinish: Called with finished model as parameter
	  */
	loadModel: function(objurl, mtlurl, onFinish){
		$.get(mtlurl, function(mtldata){
			ModelLoader.parseMtl(mtldata, objurl, onFinish);
		});
	},

	/**
	  * Actually creates a model object and returns it via onFinish function
	  * parts: List of parts of model (each part has its own material)
	  * vertBuff: Buffer of position vertices
	  * normBuff: Buffer of normal vertices
	  * texBuff: Buffer of texture coordinates
	  * onFinish: Called with finished model as parameter
	  */
	makeModel: function(parts, vertBuff, normBuff, texBuff, onFinish){
		var model = {};
		model.parts = modelParts;
		model.vertBuff = vertBuff;
		model.normBuff = normBuff;
		model.texBuff = texBuff;

		model.render = function(gl, program){
			var
			positionHandle = gl.getAttribLocation(program, "VertexPosition"),
			normalHandle   = gl.getAttribLocation(program, "VertexNormal"),
			texHandle      = gl.getAttribLocation(program, "VertexTexCoord"),
			kaHandle       = gl.getUniformLocation(program, "Material.Ka"),
			kdHandle       = gl.getUniformLocation(program, "Material.Kd"),
			ksHandle       = gl.getUniformLocation(program, "Material.Ks"),
			shinyHandle    = gl.getUniformLocation(program, "Material.Shininess");

			gl.enableVertexAttribArray(positionHandle);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuff);
			gl.vertexAttribPointer(positionHandle, 3, gl.FLOAT, false, 0, 0);

			gl.enableVertexAttribArray(normalHandle);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuff);
			gl.vertexAttribPointer(normalHandle, 3, gl.FLOAT, false, 0, 0);

			gl.enableVertexAttribArray(texHandle);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuff);
			gl.vertexAttribPointer(texHandle, 2, gl.FLOAT, false, 0, 0);

			for(var i = 0; i < this.parts.length; i++){
				var
				part = this.parts[i],
				mat  = part.material;

				gl.uniform3f(kaHandle, mat.Ka);
				gl.uniform3f(ksHandle, mat.Ks);
				gl.uniform3f(kdHandle, mat.Kd);
				gl.uniform1f(shinyHandle, mat.Shininess);
				gl.drawArrays(gl.TRIANGLES, part.index, part.count);
			}


			gl.disableVertexAttribArray(positionHandle);
			gl.disableVertexAttribArray(normalHandle);
			gl.disableVertexAttribArray(texHandle);
		}


		onFinish(model);
	},

	/**
	  * Parses a material library then calls the given function
	  * text: Plaintext of mtl file
	  * objurl: URL of obj file to load after loading mtl file
	  * onFinish: Called with finished model as parameter
	  */
	parseMtl: function(text, objurl, onFinish){
		var lines = text.split("\n");

		var
			/*
			 * The actual list of materials
			 * Materials are added as objects by their name to this
			 * A material can be accessed with mtlList[materialName]
			 * 
			 * Material list has the following fields:
			 * Ka: Ambient color
			 * Ks: Specular color
			 * Kd: Diffuse color
			 * shininess: How shiny material is
			 */
			mtlList = {},

			// used to determine state of reading file
			loadingMtl = false,
			mtlLoaded  = false,

			// values read from file
			name = "NULL",
			Ka = [], Kd = [], Ks = [],
			shininess = -1.0;

		// loop through every line in the file
		for(var i = 0; i < lines.length; i++){
			var line = lines[i].split(" ");

			// new material
			if(line[0] == "newmtl"){
				// grab name
				name = line[1];

				// set these to be empty arrays; we know we're done loading a material when none are empty
				Ka = [];
				Kd = [];
				Ks = [];
				shininess = -1.0;

				loadingMtl = true;

			// if we're loading a material, grab value from line
			} else if(loadingMtl) {
				// grab specular
				if(line[0] == "Ns")
					shininess = line[1];

				// grab ambient
				else if(line[0] == "Ka")
					Ka = [parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];

				// grab diffuse
				else if(line[0] == "Kd")
					Kd = [parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];

				// grab specular
				else if(line[0] == "Ks")
					Ks = [parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];

				// check to see if we're done loading the current material
				if(shininess != -1 && Ka.length > 1 && Ks.length > 1 && Kd.length > 1)
					mtlLoaded = true;
			}

			// add material to 
			if(mtlLoaded){
				var mtl = {};
				mtl.Ka = Ka;
				mtl.Ks = Ks;
				mtl.Kd = Kd;
				mtl.shininess = shininess;
				mtlList[name] = mtl;
				mtlLoaded = false;
				loadingMtl = false;
			}
		}

		// END FILE PARSING

		// parse obj file with loaded mtl library
		$.get(objurl, function(objdata){
			model = ModelLoader.parseObj(mtlList, objdata, onFinish);
		});
	},

	/**
	  * Parses an obj file and fills required buffers
	  * mtllib: Material library
	  * text: Plaintext of obj file
	  * onFinish: Called with finished model as parameter
	  */
	parseObj: function(mtlLib, text, onFinish){
		var
			/* list of every vertex/normal/texture coordinate */
			vertices = [[0.0,0.0,0.0]],
			normals = [[0.0,0.0,0.0]],
			textureCoords = [[0.0,0.0]],
			
			/*
			 * Each element in these is a three-dimensioal array
			 * that has an index that refers to a spot in the above arrays
			 * to make a triangle
			 */
			vertexIndices = [], 
			normalIndices = [],
			textureIndices = [],

			/* used for model parts (each model has a material, a start index, and a vertex count) */
			currentIndex = 0,
			count = 0
			currentMaterial = {},
			currentIndex,
			modelParts = [],
			makingModelPart = false;

		// read through whole file
		var lines = text.split("\n");
		for(var i = 0; i < lines.length; i++){
			// grab line
			var line = lines[i].split(" ");
			var lineType = line[0];

			// vertex
			if(lineType == "v"){
				var
					x = parseFloat(line[1]),
					y = parseFloat(line[2]),
					z = parseFloat(line[3]);
				vertices.push([x,y,z]);

			// normal
			} else if(lineType == "vn"){
				var
					x = parseFloat(line[1]),
					y = parseFloat(line[2]),
					z = parseFloat(line[3]);
				normals.push([x,y,z]);

			// texture coord
			} else if(lineType == "vt"){
				var
					u = parseFloat(line[1]),
					v = parseFloat(line[2]);
				textureCoords.push([u,v]);

			// material group start
			} else if(lineType == "usemtl"){
				// so that nothing gets pushed on first "usemtl" line, we use boolean switch
				if(makingModelPart){
					modelParts.push({
						material: currentMaterial,
						index: currentIndex,
						count: count
					});
				}
				makingModelPart = true;

				// advance current index and reset count for next model part
				currentIndex += count;
				count = 0;

				// grab next material from material library (see mtl parsing code)
				currentMaterial = mtlLib[line[1]];


			// face
			} else if(lineType == "f"){
				var
					numVertices = line.length - 1,               // -1 since 0 is the line type ("f")
					vIndices = [], nIndices = [], tIndices = []; // temporary triangle/quad

				// grab every vertex
				for(var v = 1; v < numVertices; v++){
					var indices = line[v].split("/");

					// the obj file goes vertex/texture-coordinate/normal
					vIndices.push(parseInt(indices[0]));
					nIndices.push(parseInt(indices[2]));
					tIndices.push(parseInt(indices[1]));
				}

				// split into two triangles if we have a quad
				if(vIndices.length == 4){
					vertexIndices.push([vIndices[0], vIndices[1], vIndices[2]]);
					vertexIndices.push([vIndices[2], vIndices[3], vIndices[0]]);

					normalIndices.push([nIndices[0], nIndices[1], nIndices[2]]);
					normalIndices.push([nIndices[2], nIndices[3], nIndices[0]]);

					textureIndices.push([tIndices[0], tIndices[1], tIndices[2]]);
					textureIndices.push([tIndices[2], tIndices[3], tIndices[0]]);

					count += 6;
				}
				// else just add triangle
				else if(vIndices.length == 3){
					vertexIndices.push(vIndices);
					normalIndices.push(nIndices);
					textureIndices.push(tIndices);
					count += 3;

				
				}

			// unused (for now)
			/*
			else if(lineType == "mtllib"){}
			else if(lineType == "o"){}
			*/
		}
	}

		// END FILE PARSING

		// finish up current model part
		if(makingModelPart){
			modelParts.push({
				material: currentMaterial,
				index: currentIndex,
				count: count
			});
		}

		// temporary arrays to step through indices and fill (what actually gets sent to WebGL)
		var vertsArr = [], normArr = [], texArr = [];

		// loop through every triangle
		for(var i = 0; i < vertexIndices.length; i++){
			// grab triangle indices
			var
			triVerts = vertexIndices[i],
			triNorms = normalIndices[i],
			triTex   = textureIndices[i],

			// grab vectors for each triangle from the right arrays
			firstVert = vertices[triVerts[0]],
			firstNorm = normals[triNorms[0]],
			firstTex  = textureCoords[triTex[0]],

			secondVert = vertices[triVerts[1]],
			secondNorm = normals[triNorms[1]],
			secondTex  = textureCoords[triTex[1]],

			thirdVert = vertices[triVerts[2]],
			thirdNorm = normals[triNorms[2]],
			thirdTex  = textureCoords[triTex[2]];

			// fill arrays
			vertsArr.push(firstVert[0]);
			vertsArr.push(firstVert[1]);
			vertsArr.push(firstVert[2]);
			normArr.push(firstNorm[0]);
			normArr.push(firstNorm[1]);
			normArr.push(firstNorm[2]);

			texArr.push(firstTex[0]);
			texArr.push(firstTex[1]);

			vertsArr.push(secondVert[0]);
			vertsArr.push(secondVert[1]);
			vertsArr.push(secondVert[2]);

			normArr.push(secondNorm[0]);
			normArr.push(secondNorm[1]);
			normArr.push(secondNorm[2]);

			texArr.push(secondTex[0]);
			texArr.push(secondTex[1]);

			vertsArr.push(thirdVert[0]);
			vertsArr.push(thirdVert[1]);
			vertsArr.push(thirdVert[2]);

			normArr.push(thirdNorm[0]);
			normArr.push(thirdNorm[1]);
			normArr.push(thirdNorm[2]);

			texArr.push(thirdTex[0]);
			texArr.push(thirdTex[1]);

		}

		// create buffers for sending data to WebGL
		var
		vertBuff = new Float32Array(vertsArr),
		normBuff = new Float32Array(normArr),
		texBuff  = new Float32Array(texArr);

		// actually make the model
		this.makeModel(modelParts, vertBuff, normBuff, texBuff, onFinish);
	}
}