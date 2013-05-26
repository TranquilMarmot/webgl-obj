function start(){
	new Runner.start();
}

var Runner = {
	/** Starts and runs app */
	start: function(){
		Renderer.canvas = Runner.initCanvas();
		Renderer.init();
		ModelLoader.loadModel("models/bitwaffle/bitwaffle.mtl", "models/bitwaffle/bitwaffle.obj");
		Runner.update();
	},

	update: function(){
		requestAnimationFrame(Runner.update);
		Renderer.render();
	},

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