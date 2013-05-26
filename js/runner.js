function start(){
	new Runner.start();
}

var Runner = {
	// used for timing
	time: 0, startTime: Date.now(),

	/** Starts and runs app */
	start: function(){
		Renderer.canvas = Runner.initCanvas();
		Renderer.init();
		Runner.animate();
	},

	/** What actually gets called every frame */
	animate: function(){
		// request next update call before doing anything
		requestAnimationFrame(Runner.animate);
		Runner.update();
		// render scene
		Renderer.render();

	},

	update: function(){
		this.time =  Date.now() - this.startTime;

		Sandbox.update(this.time);
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
					   function (callback, element) {
						window.setTimeout(callback, 1000 / 60);
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