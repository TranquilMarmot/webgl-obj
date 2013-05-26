var ModelLoader = {
	loadModel: function(objurl, mtlurl){
		$.get(mtlurl, function(mtldata){
			var mtl = ModelLoader.parseMtl(mtldata,
				function(){
					$.get(objurl, function(objdata){
						ModelLoader.parseObj(mtl, objdata);
					})
				})
		});
	},

	parseObj: function(mtl, text){
		var lines = text.split("\n");
		for(var i = 0; i < lines.length; i++){
			var line = lines[i].split(" ");
			var lineType = line[0];

			// material list
			if(lineType == "mtllib"){

			// name of object
			} else if(lineType == "o"){

			// vertex
			} else if(lineType == "v"){
				var
					x = parseFloat(line[1]),
					y = parseFloat(line[2]),
					z = parseFloat(line[3]);

			// normal
			} else if(lineType == "vn"){

			// texture coord
			} else if(lineType == "vt"){
				var
					u = parseFloat(line[1]),
					v = parseFloat(line[2]);

			// material group start
			} else if(lineType == "usemtl"){


			// face
			} else if(lineType == "f"){

			}
		}
	},

	/** Pases a material library then calls the given function */
	parseMtl: function(text, onFinish){
		var lines = text.split("\n");
		for(var i = 0; i < lines.length; i++){
			var line = lines[i].split(" ");
		}

		onFinish();
	}

}