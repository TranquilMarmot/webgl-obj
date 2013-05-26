var ModelLoader = {
	loadModel: function(objurl, mtlurl){
		var model = {};

		$.get(mtlurl, function(mtldata){
			model = ModelLoader.parseMtl(mtldata, objurl);
		});

		return model;
	},

	parseObj: function(mtlLib, text){
		var
			vertices = [[0.0,0.0,0.0]],
			normals = [[0.0,0.0,0.0]],
			textureCoords = [[0.0,0.0]],
			vertexIndices = [],
			normalIndices = [],
			textureIndices = [],
			currentIndex = 0,
			count = 0
			currentMaterial = {},
			currentIndex,
			modelParts = [],
			makingModelPart = false;

		var lines = text.split("\n");
		for(var i = 0; i < lines.length; i++){
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
				// so that nothing gets pushed on first "usemtl" line we use boolean switch
				if(makingModelPart){
					modelParts.push({
						material: currentMaterial,
						index: currentIndex,
						count: count
					});
				}
				makingModelPart = true;

				currentIndex += count;
				count = 0;

				currentMaterial = mtlLib[line[1]];


			// face
			} else if(lineType == "f"){
				var
					numVertices = line.length - 1,
					vIndices = [], nIndices = [], tIndices = [];

				for(var v = 1; v < numVertices; v++){
					var indices = line[v].split("/");

					// the obj file goes vertex/texture-coordinate/normal
					vIndices.push(parseInt(indices[0]));
					nIndices.push(parseInt(indices[2]));
					tIndices.push(parseInt(indices[1]));
				}

				// add triangles
				if(vIndices.length == 3){
					vertexIndices.push(vIndices);
					normalIndices.push(nIndices);
					textureIndices.push(tIndices);
					count += 3;

				// split into two triangles if we have a quad
				} else if(vIndices.length == 4){
					vertexIndices.push([vIndices[0], vIndices[1], vIndices[2]]);
					vertexIndices.push([vIndices[2], vIndices[3], vIndices[0]]);

					normalIndices.push([nIndices[0], nIndices[1], nIndices[2]]);
					normalIndices.push([nIndices[2], nIndices[3], nIndices[0]]);

					textureIndices.push([tIndices[0], tIndices[1], tIndices[2]]);
					textureIndices.push([tIndices[2], tIndices[3], tIndices[0]]);

					count += 6;
				}
			}

			// unused (for now)
			/*
			} else if(lineType == "mtllib"){
				// materials are loaded seperately (see load initial load model function)
			// name of object
			} else if(lineType == "o"){

			}
			*/
		}

		var vertsArr = [], normArr = [], texArr = [];

		for(var i = 0; i < vertexIndices.length; i++){
			var
				triVerts = vertexIndices[i],
				triNorms = normalIndices[i],
				triTex   = textureIndices[i];

			var
				firstVert = vertices[triVerts[0]],
				firstNorm = normals[triNorms[0]],
				firstTex  = textureCoords[triTex[0]],

				secondVert = vertices[triVerts[1]],
				secondNorm = normals[triNorms[1]],
				secondTex  = textureCoords[triTex[1]],

				thirdVert = vertices[triVerts[2]],
				thirdNorm = normals[triNorms[2]],
				thirdTex  = textureCoords[triTex[2]];

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

		var
			vertBuff = new Float32Array(vertsArr),
			normBuff = new Float32Array(normArr),
			texBuff  = new Float32Array(texArr);

		var model = {};
		model.parts = modelParts;
		model.vertBuff = vertBuff;
		model.normBuff = normBuff;
		model.texBuff = texBuff;

		return model;
	},

	/** Pases a material library then calls the given function */
	parseMtl: function(text, objurl){
		var lines = text.split("\n");

		var
			mtlList = {},
			loadingMtl = false,
			mtlLoaded  = false,
			name = "NULL",
			Ka = [], Kd = [], Ks = [],
			shininess = -1.0;

		for(var i = 0; i < lines.length; i++){
			var line = lines[i].split(" ");

			if(line[0] == "newmtl"){
				name = line[1];
				Ka = [];
				Kd = [];
				Ks = [];
				shininess = -1.0;

				loadingMtl = true;
			} else if(loadingMtl) {
				if(line[0] == "Ns")
					shininess = line[1];
				else if(line[0] == "Ka")
					Ka = [parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];
				else if(line[0] == "Kd")
					Kd = [parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];
				else if(line[0] == "Ks")
					Ks = [parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];

				if(shininess != -1 && Ka.length > 1 && Ks.length > 1 && Kd.length > 1)
					mtlLoaded = true;
			}

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

		var model = {};
		$.get(objurl, function(objdata){
			model = ModelLoader.parseObj(mtlList, objdata);
		});
		return model;
	}

}
