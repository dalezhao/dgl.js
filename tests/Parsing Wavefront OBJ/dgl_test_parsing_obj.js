var gl;
var program;

var positions = [
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		-1.0, 0.0, 0.0
];
var idx = [];
var normals = [];
var ambient = [1.0, 1.0, 1.0];
var diffuse = [0.4, 0.7, 0.8];
var specular = [0.8, 0.8, 0.8];
var specPwr = [20.0];

var ambientLightAmbient = [0.0, 0.0, 0.0];
var pointLightPosition = [
	0, 3.2, 4.0,
	0.6, 3.2, 2.0
];
var pointLightDiffuse = [
	0.4, 0.4, 0.4,
	0.4, 0.4, 0.4
];
var pointLightSpecular = [
	0.4, 0.4, 0.4,
	0.5, 0.5, 0.5
];
var pointLightAttenuateCos = [24.0, 24.0];

var cameraPosition = [0.0, 0.1, 3.0];
var cameraDir = [0.0, 0.0, -3.0];

function setupLights() {
	
	DGL.uniformV3(gl, program, "ambientLightAmbients", ambientLightAmbient);
	DGL.uniformV3(gl, program, "pointLightPositions", pointLightPosition);
	DGL.uniformV3(gl, program, "pointLightDiffuses", pointLightDiffuse);
	DGL.uniformV3(gl, program, "pointLightSpeculars", pointLightSpecular);
	DGL.uniformF(gl, program, "pointLightAttenuateCos", pointLightAttenuateCos);
}

function setupCamera() {

	// DGL.uniformM4(gl, program, "ortho", DGL.ortho(2.0, 2.0, 0.0, 0.5));
	DGL.uniformM4(gl, program, "perspective", DGL.perspective(
		0.2, 0.15, 2.0, 1000));
	DGL.uniformM4(gl, program, "camera", DGL.camera(
		cameraPosition, cameraDir, [0.0, 1.0, 0.0]
	));	
	
	DGL.uniformV3(gl, program, "cameraPosition", cameraPosition);
}

function setupMeshes() {
	
	/*var mesh = DGL.createSurface(
		function(x, z) {
			x *= 1.5;
			z *= 1.5;
			// return Math.sin(x + 0.2 * z) / (x * x + z * z + 1) * 1.5;
			return -0.6 * (Math.sin(Math.abs(x * x + z * z)) / (x * x + z * z) - x * x / 5);
		},
		-2, -2, 2, 2, 0.04, 0.04
	);
	*/
	// var mesh = DGL.createCuboid([-1, 1.0, 0.0], 2.5, 1.5, 1.5);
	var mesh = DGL.parseObj(objSrc, false);
	
	positions = mesh.pos;
	normals = mesh.normals;
	idx = mesh.idx;
	
	// Vertices.
	var esize = 4 * 3 * 2;
	var rawbuf = new ArrayBuffer(esize * positions.length / 3);
	var posbuf = DGL.arrayV3(gl, rawbuf, esize, 0, positions);
	var normbuf = DGL.arrayV3(gl, rawbuf, esize, 12, normals);
	var vertexBuffer = gl.createBuffer();
	DGL.bufferArray(gl, vertexBuffer, rawbuf);
	
	DGL.attrV3(gl, program, "aPosition", vertexBuffer, esize, 0);
	DGL.attrV3(gl, program, "aNormal", vertexBuffer, esize, 12);
	
	DGL.uniformV3(gl, program, "ambient", ambient);
	DGL.uniformV3(gl, program, "diffuse", diffuse);
	DGL.uniformV3(gl, program, "specular", specular);
	DGL.uniformF(gl, program, "specPwr", specPwr);
	
	// Indices.
	var indexBuffer = gl.createBuffer();
	DGL.bufferIdxArray(gl, indexBuffer, new Uint16Array(idx));
}

var objSrc;

function onload() {
	
	objSrc = document.getElementById("obj").innerText
		|| document.getElementById("obj").textContent;
	
	var canvas = document.getElementById("canvas");
	
	gl = DGL.context(canvas);
	gl.enable(gl.DEPTH_TEST);
	
	var vsource = document.getElementById("vshader").innerText
		|| document.getElementById("vshader").textContent;
	var fsource = document.getElementById("fshader").innerText
		|| document.getElementById("fshader").textContent;
	
	var vshader = DGL.vshader(gl, vsource);
	var fshader = DGL.fshader(gl, fsource);
	
	program = DGL.program(gl, vshader, fshader);
	gl.useProgram(program);
	
	setupLights();
	setupCamera();
	setupMeshes();
	
	// Start drawing.
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
	gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
}

window.addEventListener("load", onload, false);
