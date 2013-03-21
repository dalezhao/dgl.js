/*
 * Dale's framework for WebGL applications.
 * Foundation: WebGL API wrappers and utilities, etc.
 * 
 */

var DGL = DGL || {}

/*
 * Context, programs and shaders.
 * 
 */

/*
 * Create a WebGL context with a given canvas DOM object.
 * 
 * [params]
 * canvas: A canvas DOM object.
 * 
 * [return]
 * A 'WebGLRenderingContext' object on success. 'null' on failure.
 * 
 */
DGL.context = function(canvas) {
	
	var names = ["webgl", "experimental-webgl"];
	
	var context = null;
	
	for(var i = 0; i < names.length; ++i) {
		try {
			context = canvas.getContext(names[i]);
		} catch(e) {}
		if(context) break;
	}
	
	return context;
};

DGL.shader = function(gl, type, source) {
	
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	} else {
		return shader;
	}
};

/*
 * Create a vertex shader.
 * 
 * [params]
 * gl: The WebGL context this shader is related to.
 * source: The source string of the shader code.
 * 
 * [return]
 * A 'WebGLShader' object on success. 'null' on failure.
 * 
 */
DGL.vshader = function(gl, source) {
	
	return DGL.shader(gl, gl.VERTEX_SHADER, source);
};

/*
 * Create a fragment shader.
 * 
 * [params]
 * gl: The WebGL context this shader is related to.
 * source: The source string of the shader code.
 * 
 * [return]
 * A 'WebGLShader' object on success. 'null' on failure.
 * 
 */
DGL.fshader = function(gl, source) {
	
	return DGL.shader(gl, gl.FRAGMENT_SHADER, source);
};

/*
 * Create a shader program with two given shaders.
 * 
 * [params]
 * gl: The WebGL context this shader program is related to.
 * vshader: The vertex shader to attach to this shader program.
 * fshader: The fragment shader to attach to this shader program.
 * 
 * [return]
 * A 'WebGLProgram' object on success. 'null' on failure.
 * 
 */
DGL.program = function(gl, vshader, fshader) {
	
	var program = gl.createProgram();
	if(vshader) gl.attachShader(program, vshader);
	if(fshader) gl.attachShader(program, fshader);
	gl.linkProgram(program);
	
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return null;
	} else {
		return program;
	}
};

/*
 * Creating buffers.
 */

/*
 * Create a view for an array of 3-D vectors in a buffer.
 * 
 * [params]
 * gl: The WebGL context the buffer is related to.
 * buffer: An 'ArrayBuffer' object as the raw buffer storing the data.
 * esize: The size (in bytes) of each element in the buffer.
 * offset: The offset (in bytes) of 3-D vector in each element of the buffer.
 * data: An array containing the 3-D vectors.
 * 
 * [return]
 * A 'Float32Array' object as the view for the 3D vector array.
 * 
 */
DGL.arrayV3 = function(gl, buffer, esize, offset, data) {
	
	var posBuffer = new Float32Array(buffer);
	var esizef = esize / Float32Array.BYTES_PER_ELEMENT;
	var offsetf = offset / Float32Array.BYTES_PER_ELEMENT;
	for(var i = 0, k = 0; i < data.length; i += 3) {
		posBuffer[k + offsetf + 0] = data[i + 0];
		posBuffer[k + offsetf + 1] = data[i + 1];
		posBuffer[k + offsetf + 2] = data[i + 2];
		k += esizef;
	}
	return posBuffer;
};

/*
 * Fill a WebGL array buffer with data in an array.
 * 
 * [params]
 * gl: The WebGL context the buffer is related to.
 * buffer: A 'WebGLBuffer' object to store the data in 'array'. 
 * array: A WebGL array containing the data. 
 * 
 */
DGL.bufferArray = function(gl, buffer, array) {
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
};

/*
 * Fill a WebGL element array buffer with data in an array.
 * 
 * [params]
 * gl: The WebGL context the buffer is related to.
 * buffer: A 'WebGLBuffer' object to store the data in 'array'. 
 * array: A WebGL array containing the data. 
 * 
 */
DGL.bufferIdxArray = function(gl, buffer, array) {
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
};

/*
 * Setting variables: uniforms and attributes.
 * 
 */

/*
 * Setting a uniform float variable in the shader program.
 * 
 * [params]
 * gl: The WebGL context the buffer is related to.
 * program: The shader program whose variable is to be set.
 * name: The name string of the variable to be set.
 * value: An array containing the float(s) to assign to the uniform. 
 * 
 */
DGL.uniformF = function(gl, program, name, value) {	
	
	var loc = gl.getUniformLocation(program, name);
	gl.uniform1fv(loc, value);
};

/*
 * Setting a uniform integer variable in the shader program.
 * 
 * [params]
 * gl: The WebGL context the buffer is related to.
 * program: The shader program whose variable is to be set.
 * name: The name string of the variable to be set.
 * value: An array containing the integer(s) to assign to the uniform. 
 * 
 */
DGL.uniformI = function(gl, program, name, value) {	
	
	var loc = gl.getUniformLocation(program, name);
	gl.uniform1iv(loc, value);
};

/*
 * Setting a uniform 3-D vector variable in the shader program.
 * 
 * [params]
 * gl: The WebGL context the buffer is related to.
 * program: The shader program whose variable is to be set.
 * name: The name string of the variable to be set.
 * value: An array containing the 3-D vector(s) to assign to the uniform. 
 * 
 */
DGL.uniformV3 = function(gl, program, name, value) {	
	
	var loc = gl.getUniformLocation(program, name);
	gl.uniform3fv(loc, value);
};

/*
 * Setting a uniform 4x4 matrix variable in the shader program.
 * 
 * [params]
 * gl: The WebGL context the buffer is related to.
 * program: The shader program whose variable is to be set.
 * name: The name string of the variable to be set.
 * value: A flat array containing the 4x4 matrix (matrices) to assign to the
 *        uniform. 
 * 
 */
DGL.uniformM4 = function(gl, program, name, value) {	
	
	var loc = gl.getUniformLocation(program, name);
	gl.uniformMatrix4fv(loc, false, value);
};

/*
 * Setting an attribute 3-D vector variable in the shader program.
 * 
 * [params]
 * gl: The WebGL context the buffer is related to.
 * program: The shader program whose variable is to be set.
 * name: The name string of the variable to be set.
 * value: A flat array containing the 3-D vector(s) to assign to the attribute. 
 * 
 */
DGL.attrV3 = function(gl, program, name, buffer, esize, offset) {
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	var index = gl.getAttribLocation(program, name);
	gl.vertexAttribPointer(index, 3, gl.FLOAT, false, esize, offset);
	gl.enableVertexAttribArray(index);
};
