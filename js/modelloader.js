function loadModel(){
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList) {
  		// Great success! All the File APIs are supported.
	} else {
		alert("File APIs not fully supported in this browser!");
	}



}