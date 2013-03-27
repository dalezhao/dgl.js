// TODO Adjust parameter to make stepping more stable.

var gl;
var program;
var vertexBuffer;
var esize = 4 * 3 * 2;
var rawbuf;

/*
 * Mesh.
 * 
 */
var positions = [
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		-1.0, 0.0, 0.0
];
var idx = [];
var normals = [];
var ambient = [0.0, 0.0, 0.0];
var diffuse = [0.8, 0.8, 0.8];
var specular = [0.6, 0.6, 0.6];
var specPwr = [50.0];

/*
 * Lights.
 * 
 */
var ambientLightAmbient = [0.0, 0.0, 0.0];
var pointLightPosition = [
	0, 0.5, 4.2,
	0.0, 3.6, -1.0
];
var pointLightDiffuse = [
	0.4, 0.4, 0.4,
	0.4, 0.4, 0.4
];
var pointLightSpecular = [
	0.4, 0.4, 0.4,
	0.5, 0.5, 0.5
];
var pointLightAttenuateCos = [16.0, 24.0];

/*
 * Camera.
 * 
 */
var rz = 3.2;
var cameraPosition = [0.0, 1.5, rz];
var cameraDir = [0.0, -1.0, -rz];

/*
 * Input.
 * 
 */
var mousePressed = false;
var phi = 0.0;
var dphi = 0.0;
var theta = 0.0;
var dtheta = 0.0;
var mag = 1 / 300;
var dx = 0.0;
var dy = 0.0;

// Cloth intrinsic geometry.
var sizeu = 2.0;
var sizev = 2.0;
var gridu = 0.02;
var gridv = 0.02;
var gridd = Math.sqrt(gridu * gridu + gridv * gridv);
var gridu0 = gridu * 1;
var gridv0 = gridv * 1;
var gridd0 = gridd * 1;
// The number of vertices per row/column, not grids!
var nu = Math.ceil(sizeu / gridu) + 1;
var nv = Math.ceil(sizev / gridv) + 1;
var nverts = nu * nv;

// Cloth instance geometry.
var pos0 = [-1.0, 1.0, -1.0];
var fixed = [];

// Physics constants.
var mass = 0.1;
var g = [0.0, -10, 0.0];
var resistance = 0.0;
var stiff = 200.0;
var dampCo = 0.01;

// Physics variables.
var xs = [];
var xs0 = [];
var vs = [];
var fs = [];

// Forces.

var wind = function() {
	
	for(var i = 0; i < fs.length / 3; ++i) {

		if(fixed[i]) continue;
		
		var x0 = xs[i * 3 + 0];
		var x1 = xs[i * 3 + 1];
		var x2 = xs[i * 3 + 2];

		// compute wind force.

		fs[i * 3 + 0] += 0.0
		fs[i * 3 + 1] += 0.0
		fs[i * 3 + 2] += 0.0
	}
};
var gravity = function() {

	for(var i = 0; i < fs.length / 3; ++i) {
		
		if(fixed[i]) continue;
		
		var x0 = xs[3 * i + 0];
		var x1 = xs[3 * i + 1];
		var x2 = xs[3 * i + 2];
		// if(x0 * x0 + x1 * x1 + x2 * x2 < 0.25) continue;
		if(Math.abs(x0) < 0.5 && Math.abs(x2) < 0.25 && x1 < 0.25) continue;
		
		
		fs[i * 3 + 0] += mass * g[0];
		fs[i * 3 + 1] += mass * g[1];
		fs[i * 3 + 2] += mass * g[2];
	}
};
var resistance = function() {
	
	for(var i = 0; i < fs.length / 3; ++i) {
		
		if(fixed[i]) continue;
		
		var x0 = xs[i * 3 + 0];
		var x1 = xs[i * 3 + 1];
		var x2 = xs[i * 3 + 2];
		
		var v0 = vs[i * 3 + 0];
		var v1 = vs[i * 3 + 1];
		var v2 = vs[i * 3 + 2];
		
		// compute air resistance.
		
		fs[i * 3 + 0] += 0.0
		fs[i * 3 + 1] += 0.0
		fs[i * 3 + 2] += 0.0
	}
};
var spring = function() {
	
	var computeSpringForce = function(pos1, pos2, l0, stiff) {
		
		var dir = DGL.v3normalize(DGL.v3sub(pos2, pos1));
		var dl = DGL.v3norm(DGL.v3sub(pos2, pos1)) - l0;
		var f = DGL.v3mult(dir, dl * stiff);
		
		return f;
	};
	
	for(var v = 0; v < nv; ++v) {
		for(var u = 0; u < nu; ++u) {
			
			var i = nu * v + u;
			
			if(fixed[i]) continue;
		
			var pos =[
				xs[i * 3 + 0],
				xs[i * 3 + 1],
				xs[i * 3 + 2]
			];
			
			// Spring force.
			var f = [0.0, 0.0, 0.0];
			
			// Find the neighbor positions to determine the
			// stretching of the springs.
			
			if(u < nu - 1 && v < nv - 1) {
				
				var i1 = nu * v + u + 1;
				var i2 = nu * (v + 1) + u + 1;
				
				var pos1 = [
					xs[i1 * 3 + 0],
					xs[i1 * 3 + 1],
					xs[i1 * 3 + 2]
				];
				
				var pos2 = [
					xs[i2 * 3 + 0],
					xs[i2 * 3 + 1],
					xs[i2 * 3 + 2]
				];
				
				f = DGL.v3add(f, computeSpringForce(pos, pos1, gridu0, stiff));
				f = DGL.v3add(f, computeSpringForce(pos, pos2, gridd0, stiff));
			}
			
			if(u > 0 && v < nv - 1) {
				
				var i1 = nu * (v + 1) + u;
				var i2 = nu * (v + 1) + u - 1;
				
				var pos1 = [
					xs[i1 * 3 + 0],
					xs[i1 * 3 + 1],
					xs[i1 * 3 + 2]
				];
				
				var pos2 = [
					xs[i2 * 3 + 0],
					xs[i2 * 3 + 1],
					xs[i2 * 3 + 2]
				];
				
				f = DGL.v3add(f, computeSpringForce(pos, pos1, gridv0, stiff));
				f = DGL.v3add(f, computeSpringForce(pos, pos2, gridd0, stiff));
			}
			
			if(u > 0 && v > 0) {
				
				var i1 = nu * v + u - 1;
				var i2 = nu * (v - 1) + u - 1;
				
				var pos1 = [
					xs[i1 * 3 + 0],
					xs[i1 * 3 + 1],
					xs[i1 * 3 + 2]
				];
				
				var pos2 = [
					xs[i2 * 3 + 0],
					xs[i2 * 3 + 1],
					xs[i2 * 3 + 2]
				];
				
				f = DGL.v3add(f, computeSpringForce(pos, pos1, gridu0, stiff));
				f = DGL.v3add(f, computeSpringForce(pos, pos2, gridd0, stiff));
			}
			
			if(u < nu - 1 && v > 0) {
				
				var i1 = nu * (v - 1) + u;
				var i2 = nu * (v - 1) + u + 1;
				
				var pos1 = [
					xs[i1 * 3 + 0],
					xs[i1 * 3 + 1],
					xs[i1 * 3 + 2]
				];
				
				var pos2 = [
					xs[i2 * 3 + 0],
					xs[i2 * 3 + 1],
					xs[i2 * 3 + 2]
				];
				
				f = DGL.v3add(f, computeSpringForce(pos, pos1, gridv0, stiff));
				f = DGL.v3add(f, computeSpringForce(pos, pos2, gridd0, stiff));
			}
			
			fs[i * 3 + 0] += f[0];
			fs[i * 3 + 1] += f[1];
			fs[i * 3 + 2] += f[2];
		}
	}
};
var damp = function() {
	
	for(var i = 0; i < nverts; ++i) {
		
		if(fixed[i]) continue;
		
		var v =[
			vs[i * 3 + 0],
			vs[i * 3 + 1],
			vs[i * 3 + 2]
		];
		
		var f = DGL.v3mult(v, -dampCo);
		
		fs[i * 3 + 0] += f[0];
		fs[i * 3 + 1] += f[1];
		fs[i * 3 + 2] += f[2];
	}
}
var forces = [gravity, spring, damp, wind, resistance];

function initCloth() {
	
	// Initialize xs and xs0 (equal).
	xs = positions;
	xs0 = new Array(3 * nverts);
	for(var i = 0; i < 3 * nverts; ++i) {
		xs0[i] = xs[i];
	}
	
	// Initialize vs.
	vs = new Array(3 * nverts);
	for(var i = 0; i < nverts; ++i) {
		vs[3 * i + 0] = 0.0;
		vs[3 * i + 1] = 0.0;
		vs[3 * i + 2] = 0.0;
	}
	
	// Initialize force.
	fs = new Array(3 * nverts);
	for(var i = 0; i < 3 * nverts; ++i) {
		fs[i] = 0.0;
	}
	
	// Initialize fixed.
	fixed = new Array(nverts);
	for(var i = 0; i < nverts; ++i) {
		fixed[i] = false;
	}
	fixed[0] = true;
	fixed[nu - 1] = true;
	/*
	fixed[Math.ceil(nu / 4)] = true;
	fixed[Math.ceil(nu / 2)] = true;
	fixed[Math.ceil(nu / 4 * 3)] = true;
	fixed[Math.ceil(nv / 2) * nu] = true;
	fixed[Math.ceil(nv / 2) * nu + nu - 1] = true;
	*/
	fixed[Math.ceil(nu / 2) + (nv - 1) * nu] = true;
}

// Only physics related code goes into this function.
function step(dt) {
	
	// Clear force.
	for(var i = 0; i < 3 * nverts; ++i) {
		fs[i] = 0.0;
	}
	
	for(var i = 0; i < forces.length; ++i) {		
		forces[i]();
	}
	
	// Update xs and xs0:
	// xs0 = xs
	for(var i = 0; i < 3 * nverts; ++i) {
		xs0[i] = xs[i];
	}
	
	// xs = new xs
	// Verlet Algorithm (explicit integration)
	// x(t + dt) = 2 * x(t) - x(t - dt) + f / m * dt * dt;
	for(var i = 0; i < 3 * nverts; ++i) {
		
		xs[i] = 2 * xs[i] - xs0[i] + fs[i] / mass * dt * dt;
	}
	
	// Update vs.
	for(var i = 0; i < 3 * nverts; ++i) {
		
		vs[i] += fs[i] / mass * dt;
	}
};

function draw() {
	
	// fill the buffer with updated data (xs) again
	// compute the normals and update the buffer
	// send the buffer to the graphics card	
}

function setupGl() {
	
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
	
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupLights() {
	
	DGL.uniformV3(gl, program, "ambientLightAmbients", ambientLightAmbient);
	DGL.uniformV3(gl, program, "pointLightPositions", pointLightPosition);
	DGL.uniformV3(gl, program, "pointLightDiffuses", pointLightDiffuse);
	DGL.uniformV3(gl, program, "pointLightSpeculars", pointLightSpecular);
	DGL.uniformF(gl, program, "pointLightAttenuateCos", pointLightAttenuateCos);
}

function setupCamera() {

	DGL.uniformM4(gl, program, "perspective", DGL.perspective(
		2.4, 1.8, 2.0, 1000));
	DGL.uniformM4(gl, program, "camera", DGL.camera(
		cameraPosition, cameraDir, [0.0, 1.0, 0.0]
	));	
	
	DGL.uniformV3(gl, program, "cameraPosition", cameraPosition);
}

function setupMeshes() {
	
	var mesh = DGL.createSurface(
		function(x, z) {
			
			return pos0[1];
		},
		pos0[0], pos0[2], pos0[0] + sizeu, pos0[2] + sizev, gridu, gridv
	);
	
	positions = mesh.pos;
	normals = mesh.normals;
	idx = mesh.idx;
	
	// Vertices.
	vertexBuffer = gl.createBuffer();
	rawbuf = new ArrayBuffer(esize * positions.length / 3);
	var posbuf = DGL.arrayV3(gl, rawbuf, esize, 0, positions);
	var normbuf = DGL.arrayV3(gl, rawbuf, esize, 12, normals);
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

function setupInput() {
	
	DGL.addMouseMove(gl, function(e) {
		
		dx = e.viewportX - e.lastArgs.viewportX;
		dy = e.viewportY - e.lastArgs.viewportY; 
		
		if(mousePressed) dphi = dx * mag;
		
	}, program, {
		viewportX: "viewportX",
		viewportY: "viewportY",
		scaledViewportX: "scaledViewportX",
		scaledViewportY: "scaledViewportY"
	});
	
	DGL.addMouseDown(gl, function(e) {
		
		mousePressed = true;
		
	}, program, {
		mousePressed: "mousePressed"
	});
	
	DGL.addMouseUp(gl, function(e) {
		
		mousePressed = false;
		
	}, program, {
		mousePressed: "mousePressed"
	});
}

function updateCamera() {
	
	phi += dphi;

	if(phi < 0) phi += Math.PI * 2;
	if(phi > Math.PI * 2) phi -= Math.PI * 2;
	
	cameraPosition[0] = rz * Math.sin(phi);
	cameraPosition[2] = rz * Math.cos(phi);
	
	cameraDir[0] = -cameraPosition[0];
	cameraDir[2] = -cameraPosition[2];
	
	if(Math.abs(dphi) < 0.001) dphi = 0.0;
	else dphi *= 0.95;
	
	DGL.uniformM4(gl, program, "camera", DGL.camera(
		cameraPosition, cameraDir, [0.0, 1.0, 0.0]));
	DGL.uniformV3(gl, program, "cameraPosition", cameraPosition);
}

function updateNormals() {
	
	// TODO Correct normal computation (by using averaging).
	for(var v = 0; v < nv - 1; ++v) {
		for(var u = 0; u < nu - 1; ++u) {
			
			var i1 = nu * v + u;
			var i2 = nu * (v + 1) + u;
			var i3 = nu * (v + 1) + u + 1;
			var i4 = nu * v + u + 1;
			
			var pos1 = [
				xs[i1 * 3 + 0],
				xs[i1 * 3 + 1],
				xs[i1 * 3 + 2]
			];
				
			var pos2 = [
				xs[i2 * 3 + 0],
				xs[i2 * 3 + 1],
				xs[i2 * 3 + 2]
			];
			
			var pos3 = [
				xs[i3 * 3 + 0],
				xs[i3 * 3 + 1],
				xs[i3 * 3 + 2]
			];
			
			var pos4 = [
				xs[i4 * 3 + 0],
				xs[i4 * 3 + 1],
				xs[i4 * 3 + 2]
			];
			
			var n1 = DGL.triangleNormal(pos1, pos2, pos3);
			n1 = DGL.v3add(n1, DGL.triangleNormal(pos1, pos3, pos4));
			n1 = DGL.v3add(n1, DGL.triangleNormal(pos1, pos2, pos3));
			n1 = DGL.v3add(n1, DGL.triangleNormal(pos2, pos3, pos4));
			n1 = DGL.v3mult(n1, 0.25);
			var n4 = n1;
			
			normals[3 * i1 + 0] = n1[0];
			normals[3 * i1 + 1] = n1[1];
			normals[3 * i1 + 2] = n1[2];
			normals[3 * i4 + 0] = n4[0];
			normals[3 * i4 + 1] = n4[1];
			normals[3 * i4 + 2] = n4[2];
		}
	}
}

function update() {
	
	// TODO
	// Step the physics!
	step(0.01);
	// Update normals.
	updateNormals();
	
	updateCamera();
	
	var posbuf = DGL.arrayV3(gl, rawbuf, esize, 0, positions);
	var normbuf = DGL.arrayV3(gl, rawbuf, esize, 12, normals);
	DGL.bufferArray(gl, vertexBuffer, rawbuf);
}

function onload() {
	
	setupGl();
	setupLights();
	setupCamera();
	setupMeshes();
	setupInput();
	
	initCloth();
	
	DGL.loop(function() {
		
		// Update.
		update();
		
		// Draw.
		gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
	});
}

window.addEventListener("load", onload, false);
