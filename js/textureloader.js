function loadTexture(name, source){
  var cubeTexture = gl.createTexture();
  var cubeImage = new Image();
  cubeImage.onload = function() { handleTextureLoaded(name, cubeImage, cubeTexture); }
  cubeImage.src = source;
}

function handleTextureLoaded(name, image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);

  Renderer.textures[name] = texture;
}