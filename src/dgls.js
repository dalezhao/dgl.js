/*
 * Dale's framework for WebGL applications.
 * Scene: camera, lights, geometries, materials, rendering etc.
 * 
 */

var DGL = DGL || {};

/*
 * Create a triangle mesh for a cuboid.
 * 
 * [params]
 * pos: The position of the vertex of the cuboid with minimal coornidates in
 *      all three axes.
 * sx: The length of the edge along x-axis.
 * sy: The length of the edge along y-axis.
 * sz: The length of the edge along z-axis.
 * 
 * [return]
 * An object describing the mesh for the cuboid. 
 * 
 */
DGL.createCuboid = function(pos, sx, sy, sz) {
	
	var x0 = pos[0];
	var y0 = pos[1];
	var z0 = pos[2];
	
	var pos = [
		// Bottom (-y).
		x0, y0, z0,
		x0, y0, z0 + sz,
		x0 + sx, y0, z0 + sz,
		x0 + sx, y0, z0,
		// Left (-x).
		x0, y0, z0,
		x0, y0, z0 + sz,
		x0, y0 + sy, z0 + sz,
		x0, y0 + sy, z0,
		// Front (z).
		x0, y0, z0 + sz,
		x0 + sx, y0, z0 + sz,
		x0 + sx, y0 + sy, z0 + sz,
		x0, y0 + sy, z0 + sz,
		// Right (x).
		x0 + sx, y0, z0 + sz,
		x0 + sx, y0, z0,
		x0 + sx, y0 + sy, z0,
		x0 + sx, y0 + sy, z0 + sz,
		// Back (-z).
		x0 + sx, y0, z0,
		x0, y0, z0,
		x0, y0 + sy, z0,
		x0 + sx, y0 + sy, z0,
		// Top (y).
		x0, y0 + sy, z0,
		x0, y0 + sy, z0 + sz,
		x0 + sx, y0 + sy, z0 + sz,
		x0 + sx, y0 + sy, z0
	];
	
	var normals = [
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0
	];
	
	var idx = [
		0, 2, 1,
		0, 3, 2,
		4, 5, 6,
		4, 6, 7,
		8, 9, 10,
		8, 10, 11,
		12, 13, 14,
		12, 14, 15,
		16, 17, 18,
		16, 18, 19,
		20, 21, 22,
		20, 22, 23
	];
	
	return {
		pos: pos,
		idx: idx,
		normals: normals,
		mode: "TRIANGLES"
	};
};


DGL.createSphere = function(pos, r, rings, segs) {
	
	// TODO
};

/*
 * A utility function to compute the normal of a triangle specified by
 * its vertices in counterclockwise order.
 * 
 * [params]
 * p0: The first vertex.
 * p1: The second vertex.
 * p2: The third vertex.
 * 
 * [return]
 * The normal of the triangle.
 * 
 */
DGL.triangleNormal = function(p0, p1, p2) {
	
	var v1 = DGL.v3sub(p1, p0);
	var v2 = DGL.v3sub(p2, p0);
	return DGL.v3normalize(DGL.v3cross(v1, v2));
};

/*
 * Create a triangle mesh for a surface. The surface is computed on the plane
 * of x-axis and z-axis.
 * 
 * [params]
 * f: The function for computing the surface.
 * x0: The starting x coordinate of the domain to compute.
 * z0: The starting z coordinate of the domain to compute.
 * x1: The ending x coordinate of the domain to compute.
 * z1: The ending z coordinate of the domain to compute.
 * sx: The step along x-axis.
 * sz: The step along z-axis.
 * 
 * [return]
 * An object describing the mesh for the surface. 
 * 
 */
DGL.createSurface = function(f, x0, z0, x1, z1, sx, sz) {

	// TODO Optional rotation to generate surfaces based another plane.

	var nx = Math.ceil((x1 - x0) / sx) + 1;
	var nz = Math.ceil((z1 - z0) / sz) + 1;
	var pos = new Array(3 * nx * nz);
	var normals = new Array(3 * nx * nz);
	
	for(var iz = 0, z = z0, i = 0; iz < nz; ++iz, z += sz) {
		for(var ix = 0, x = x0; ix < nx; ++ix, x += sx, i += 3) {
			pos[i] = x;
			pos[i + 1] = f(x, z);
			pos[i + 2] = z;
		}
	}
	
	// Set up normals.
	var getPos = function(i, j) {
		var idx = 3 * (i + j * nx);
		return pos.slice(idx, idx + 3);
	}
	var setNormal = function(i, j, normal) {
		var idx = 3 * (i + j * nx);
		normals[idx + 0] = normal[0];
		normals[idx + 1] = normal[1];
		normals[idx + 2] = normal[2];
	};
	for(var j = 0; j < nz; ++j) {
		for(var i = 0; i < nx; ++i) {
			var xyz = getPos(i, j);
			var x = xyz[0];
			var z = xyz[2];
			var dx = sx / 100;
			var dz = sz / 100;
			var xa = x - dx / 2;
			var xb = x + dx / 2;
			var za = z - dz / 2;
			var zb = z + dz / 2;
			var fx = (f(xb, z) - f(xa, z)) / dx;
			var fz = (f(x, zb) - f(x, za)) / dz;
			var n = DGL.v3normalize([-fx, 1, -fz]);
			setNormal(i, j, n);
		}
	}

	var idx = new Array(6 * (nx - 1) * (nz - 1));
	for(var j = 0, k = 0; j < nz - 1; ++j) {
		for(var i = 0; i < nx - 1; ++i, k += 6) {
			idx[k + 0] = i + j * nx;
			idx[k + 1] = i + (j + 1) * nx;
			idx[k + 2] = i + 1 + j * nx;
			idx[k + 3] = i + 1 + j * nx;
			idx[k + 4] = i + (j + 1) * nx;
			idx[k + 5] = i + 1 + (j + 1) * nx;
		}
	}
	
	return {
		pos: pos,
		idx: idx,
		normals: normals,
		mode: "TRIANGLES"
	}; 
}; 

DGL.setAmbientLights = function(gl, program, idx, lights) {
	
	// TODO	
	/* 
	 * lights: [{
	 * 	ambient: value
	 * }]
	 * 
	 */
};

DGL.setPointLights = function(gl, program, idx, lights) {
	
	// TODO
	/* 
	 * lights: [{
	 * 	position: value,
	 * 	diffuse: value,
	 * 	specular: value,
	 * 	specPwr: value,
	 * 	attenuateCo: value
	 * }]
	 * 
	 */
};

DGL.setMesh = function(gl, program, mesh, esize) {
	
	// TODO
};

DGL.draw = function(gl, mesh) {

	// TODO
};

DGL.drawNode = function(gl, node) {
	
	// TODO
};

/*
 * node properties:
 * 
 * - name
 * - type
 * - mesh
 * - camera
 * - children
 * - transformations
 * - ...
 * 
 */

DGL.ndget = function(root, name) {
	
	// TODO	
};

DGL.ndadd = function(root, name, node) {
	
	// TODO
};

DGL.ndrem = function(root, name) {
	
	// TODO
};