function start(){
	new Runner.start();
}

var Runner = {
	models: {},


	/** Starts and runs app */
	start: function(){
		Renderer.canvas = Runner.initCanvas();
		Renderer.init();
		var bitwaffle = ModelLoader.loadModel(
			"models/bitwaffle/bitwaffle.obj", "models/bitwaffle/bitwaffle.mtl",
			function(model){
				Runner.models['bitwaffle'] = model;
			}
		);
		Runner.update();
	},

	/** What actually gets called every frame */
	update: function(){
		// request next update call before doing anything
		requestAnimationFrame(Runner.update);
		// render scene
		Renderer.render();
	},

	/** Initializes the HTML5 canvas*/
	initCanvas: function(){
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

		return canvas;
	}
}