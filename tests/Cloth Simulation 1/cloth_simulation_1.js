/*
 * WebGL related variables and constants.
 * 
 */
var gl;
var program;
var esize = 4 * 3 * 2;
var vertexBuffer;
var rawbuf;

/*
 * Mesh geometry and material properties.
 * 
 */
var positions = [];
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
 * Input related parameters and status.
 * 
 */
var mousePressed = false;
var dx = 0.0;
var dy = 0.0;
var phi = 0.0;
var dphi = 0.0;
var theta = 0.0;
var dtheta = 0.0;
var mag = 1 / 300;

/*
 * Cloth.
 * 
 */

// Cloth geometry properties.

var pos0 = [-1.0, 1.0, -1.0];
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

// Physics constants.

// The mass of a single vertex.
var mass = 0.1;
var g = [0.0, -1, 0.0];
var stiff = 100.0;
var resistanceCo = 0.0;
var dampCo = 0.0;

// Physics variables.

var xs = [];
// Positions in the previous step.
var xs0 = [];
var vs = [];
var fs = [];
var fixed = [];

// Forces.

var gravity = function() {

	for(var i = 0; i < fs.length / 3; ++i) {
		
		if(fixed[i]) continue;
		
		var x0 = xs[3 * i + 0];
		var x1 = xs[3 * i + 1];
		var x2 = xs[3 * i + 2];

		// We can use a little trick here to make it look as if
		// the cloth is covering something below it.
		if(Math.abs(x0) < 0.25 && Math.abs(x2) < 0.25 && x1 < 0.8) continue;
		else if(x1 < 0) continue;
		
		fs[i * 3 + 0] += mass * g[0];
		fs[i * 3 + 1] += mass * g[1];
		fs[i * 3 + 2] += mass * g[2];
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
		
		// Compute damping force.
		var f = DGL.v3mult(v, -dampCo);
		
		fs[i * 3 + 0] += f[0];
		fs[i * 3 + 1] += f[1];
		fs[i * 3 + 2] += f[2];
	}
}
var wind = function() {
	
	for(var i = 0; i < fs.length / 3; ++i) {

		if(fixed[i]) continue;
		
		var x0 = xs[i * 3 + 0];
		var x1 = xs[i * 3 + 1];
		var x2 = xs[i * 3 + 2];

		// Compute wind force.
		var f = [0.0, 0.0, 0.0];

		fs[i * 3 + 0] += f[0];
		fs[i * 3 + 1] += f[1];
		fs[i * 3 + 2] += f[2];
	}
};
var resistance = function() {
	
	for(var i = 0; i < fs.length / 3; ++i) {
		
		if(fixed[i]) continue;
		
		var v = [
			vs[i * 3 + 0],
			vs[i * 3 + 1],
			vs[i * 3 + 2]
		];
		
		// Compute air resistance.
		var f = DGL.v3mult(v, -resistanceCo);
		
		fs[i * 3 + 0] += f[0];
		fs[i * 3 + 1] += f[1];
		fs[i * 3 + 2] += f[2];
	}
};
var forces = [gravity, spring, damp, wind, resistance];

function initCloth() {
	
	// Initialize positions in current and previous steps (equal).
	xs = positions;
	xs0 = new Array(3 * nverts);
	for(var i = 0; i < 3 * nverts; ++i) {
		xs0[i] = xs[i];
	}
	
	// Initialize velocities.
	vs = new Array(3 * nverts);
	for(var i = 0; i < nverts; ++i) {
		vs[3 * i + 0] = 0.0;
		vs[3 * i + 1] = 0.0;
		vs[3 * i + 2] = 0.0;
	}
	
	// Initialize forces.
	fs = new Array(3 * nverts);
	for(var i = 0; i < 3 * nverts; ++i) {
		fs[i] = 0.0;
	}
	
	// Initialize fixed setup.
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

function step(dt) {
	
	// Clear force.
	for(var i = 0; i < 3 * nverts; ++i) {
		fs[i] = 0.0;
	}
	
	// Apply each force to each vertex.
	for(var i = 0; i < forces.length; ++i) {		
		forces[i]();
	}
	
	// Update 'vs'.
	for(var i = 0; i < 3 * nverts; ++i) {
		
		vs[i] += fs[i] / mass * dt;
	}
	
	// Update 'xs0' as 'xs'.
	for(var i = 0; i < 3 * nverts; ++i) {
		xs0[i] = xs[i];
	}
	
	// Use Verlet Algorithm (explicit integration) to update positions.
	// x(t + dt) = 2 * x(t) - x(t - dt) + f / m * dt * dt;
	for(var i = 0; i < 3 * nverts; ++i) {
		
		xs[i] = 2 * xs[i] - xs0[i] + fs[i] / mass * dt * dt;
	}
};

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
	
	DGL.addMouseDown(gl, function(e) { mousePressed = true; },
		program, { mousePressed: "mousePressed" });
	
	DGL.addMouseUp(gl, function(e) { mousePressed = false; },
		program, { mousePressed: "mousePressed" });
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
	
	for(var v = 0; v < nv - 1; ++v) {
		for(var u = 0; u < nu - 1; ++u) {

			var i = nu * v + u;
			var i1 = nu * v + u + 1;
			var i2 = nu * (v + 1) + u + 1;
			var i3 = nu * (v + 1) + u;
			var i4 = nu * (v + 1) + u - 1;
			var i5 = nu * v + u - 1;
			var i6 = nu * (v - 1) + u - 1;
			var i7 = nu * (v - 1) + u;
			var i8 = nu * (v - 1) + u + 1;
			
			var pos = [
				xs[3 * i + 0],
				xs[3 * i + 1],
				xs[3 * i + 2]
			];
			
			var nn = 0;
			var normal = [0.0, 0.0, 0.0];
			
			if(u + 1 < nu && v + 1 < nv) {
				
				var pos1 = [
					xs[3 * i1 + 0],
					xs[3 * i1 + 1],
					xs[3 * i1 + 2]
				];				
				var pos2 = [
					xs[3 * i2 + 0],
					xs[3 * i2 + 1],
					xs[3 * i2 + 2]
				];
				var pos3 = [
					xs[3 * i3 + 0],
					xs[3 * i3 + 1],
					xs[3 * i3 + 2]
				];
				
				normal = DGL.v3add(normal, DGL.triangleNormal(pos, pos1, pos2));
				normal = DGL.v3add(normal, DGL.triangleNormal(pos, pos2, pos3));
			}
			if(v + 1 < nv && u - 1 >= 0) {
				
				var pos1 = [
					xs[3 * i3 + 0],
					xs[3 * i3 + 1],
					xs[3 * i3 + 2]
				];				
				var pos2 = [
					xs[3 * i4 + 0],
					xs[3 * i4 + 1],
					xs[3 * i4 + 2]
				];
				var pos3 = [
					xs[3 * i5 + 0],
					xs[3 * i5 + 1],
					xs[3 * i5 + 2]
				];
				
				normal = DGL.v3add(normal, DGL.triangleNormal(pos, pos1, pos3));
			}
			if(u - 1 >= 0 && v - 1 >= 0) {
				
				var pos1 = [
					xs[3 * i5 + 0],
					xs[3 * i5 + 1],
					xs[3 * i5 + 2]
				];				
				var pos2 = [
					xs[3 * i6 + 0],
					xs[3 * i6 + 1],
					xs[3 * i6 + 2]
				];
				var pos3 = [
					xs[3 * i7 + 0],
					xs[3 * i7 + 1],
					xs[3 * i7 + 2]
				];
				
				normal = DGL.v3add(normal, DGL.triangleNormal(pos, pos1, pos2));
				normal = DGL.v3add(normal, DGL.triangleNormal(pos, pos2, pos3));
			}
			if(v - 1 >= 0 && u + 1 < nu) {
				
				var pos1 = [
					xs[3 * i7 + 0],
					xs[3 * i7 + 1],
					xs[3 * i7 + 2]
				];				
				var pos2 = [
					xs[3 * i8 + 0],
					xs[3 * i8 + 1],
					xs[3 * i8 + 2]
				];
				var pos3 = [
					xs[3 * i1 + 0],
					xs[3 * i1 + 1],
					xs[3 * i1 + 2]
				];
				
				normal = DGL.v3add(normal, DGL.triangleNormal(pos, pos1, pos3));
			}
			normal = DGL.v3normalize(normal);
			normals[3 * i + 0] = -normal[0];
			normals[3 * i + 1] = -normal[1];
			normals[3 * i + 2] = -normal[2];
		}
	}
}

function update() {
	
	// Step the physics.
	step(0.01);
	
	// Update normals.
	updateNormals();
	
	// Update the camera.
	updateCamera();
}

function onload() {
	
	// WebGL setup.
	setupGl();
	setupLights();
	setupCamera();
	setupMeshes();
	setupInput();
	
	// Cloth simulation setup.
	initCloth();
	
	DGL.loop(function() {
		
		// Update.
		update();
		
		// Copy the updated position and normal arrays into the buffer.
		var posbuf = DGL.arrayV3(gl, rawbuf, esize, 0, positions);
		var normbuf = DGL.arrayV3(gl, rawbuf, esize, 12, normals);
		DGL.bufferArray(gl, vertexBuffer, rawbuf);
		
		// Draw.
		gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
	});
}

window.addEventListener("load", onload, false);
