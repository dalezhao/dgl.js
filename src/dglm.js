/*
 * Dale's framework for WebGL applications.
 * Mathematics: 3D mathematics utilities, etc.
 * 
 */

var DGL = DGL || {};

/*
 * Get a zero 3-D vector.
 * 
 * [return]
 * A zero 3-D vector.
 * 
 */
DGL.v3zero = function() {
	
	return [0.0, 0.0, 0.0];
};

/*
 * Compute the negation of a 3-D vector. The original vector is not modified.
 * 
 * [params]
 * v: The vector.
 * 
 * [return]
 * The negation of the vector.
 * 
 */
DGL.v3neg = function(v) {
	
	return [-v[0], -v[1], -v[2]];
};

/*
 * Compute the sum of two 3-D vectors. The original vector is not modified.
 * 
 * [params]
 * v1: The first vector.
 * v2: The second vector.
 * 
 * [return]
 * The sum of the two vectors.
 * 
 */
DGL.v3add = function(v1, v2) {
	
	return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
};

/*
 * Compute the difference of two 3-D vectors. The original vector is not modified.
 * 
 * [params]
 * v1: The vector to be subtracted from.
 * v2: The vector to be subtracted by.
 * 
 * [return]
 * The difference of the two vectors.
 * 
 */
DGL.v3sub = function(v1, v2) {
	
	return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

/*
 * Compute the produce of a 3-D vector and a scalar.
 * The original vector is not modified.
 * 
 * [params]
 * v: The vector.
 * s: The scalar.
 * 
 * [return]
 * The product of the vector and the scalar.
 * 
 */
DGL.v3mult = function(v, s) {
	
	return [v[0] * s, v[1] * s, v[2] * s];
};

/*
 * Compute the quotient of a 3-D vector and a scalar.
 * The original vector is not modified.
 * 
 * [params]
 * v: The vector.
 * s: The scalar.
 * 
 * [return]
 * The quotient of the vector and the scalar.
 * 
 */
DGL.v3div = function(v, s) {
	
	return [v[0] / s, v[1] / s, v[2] / s];
};

/*
 * Compute the dot product of two 3-D vectors. The original vector is not modified.
 * 
 * [params]
 * v1: The first vector.
 * v2: The second vector.
 * 
 * [return]
 * The dot product of the two vectors.
 * 
 */
DGL.v3dot = function(v1, v2) {
	
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

/*
 * Compute the cross product of two 3-D vectors. The original vector is not modified.
 * 
 * [params]
 * v1: The first vector.
 * v2: The second vector.
 * 
 * [return]
 * The cross product of the two vectors.
 * 
 */
DGL.v3cross = function(v1, v2) {
	
	return [
		v1[1] * v2[2] - v1[2] * v2[1],
		v1[2] * v2[0] - v1[0] * v2[2],
		v1[0] * v2[1] - v1[1] * v2[0]
	];
};

/*
 * Compute the normalized vector of the vector. The original vector is not modified.
 * 
 * [params]
 * v: The vector.
 * 
 * [return]
 * The normalized vector of the vector.
 * 
 */
DGL.v3normalize = function(v) {
	
	var norm = Math.sqrt(DGL.v3dot(v, v));
	if(norm == 0.0) return [0.0, 0.0, 0.0];
	else return [v[0] / norm, v[1] / norm, v[2] / norm];
};

/*
 * Get an identity 4x4 matrix.
 * 
 * [return]
 * An identity 4x4 matrix.
 * 
 */
DGL.m4i = function() {
	
	return [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	];
};

/*
 * Get a translation matrix.
 * 
 * [params]
 * tx: Translation along x-axis.
 * ty: Translation along y-axis.
 * tz: Translation along z-axis.
 * 
 * [return]
 * The translation matrix.
 * 
 */
DGL.translate = function(tx, ty, tz) {
	
	return [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		tx, ty, yz, 1.0
	];
};

/*
 * Get a scaling matrix.
 * 
 * [params]
 * tx: Scaling along x-axis.
 * ty: Scaling along y-axis.
 * tz: Scaling along z-axis.
 * 
 * [return]
 * The scaling matrix.
 * 
 */
DGL.scale = function(sx, sy, sz) {
	
	return [
		sx, 0.0, 0.0, 0.0,
		0.0, sy, 0.0, 0.0,
		0.0, 0.0, sz, 0.0,
		0.0, 0.0, 0.0, 1.0
	];
};

DGL.rotate = function(rx, ry, rz) {
	
	// TODO
	return DGL.m4i();
};

/*
 * Get an orthogonal matrix.
 * 
 * [params]
 * w: Width of the view plane.
 * h: Height of the view plane.
 * n: Distance of the near plane from the origin in camera coordinates.
 * f: Distance of the far plane from the origin in camera coordinates.
 * 
 * [return]
 * The orthogonal matrix.
 * 
 */
DGL.ortho = function(w, h, n, f) {
	
	return [
		2 / w, 0.0, 0.0, 0.0,
		0.0, 2 / h, 0.0, 0.0,
		0.0, 0.0, -2 / (n - f), 0.0,
		0.0, 0.0, -(n + f) / (n - f), 1
	];
};

/*
 * Get a perspective matrix.
 * 
 * [params]
 * w: Width of the view plane.
 * h: Height of the view plane.
 * n: Distance of the near plane from the origin in camera coordinates.
 * f: Distance of the far plane from the origin in camera coordinates.
 * 
 * [return]
 * The perspective matrix.
 * 
 */
DGL.perspective = function(w, h, n, f) {
	
	return [
		2 * n / w, 0.0, 0.0, 0.0,
		0.0, 2 * n / h, 0.0, 0.0,
		0.0, 0.0, (f + n) / (n - f), -1.0,
		0.0, 0.0, 2 * f * n / (n - f), 0.0
	];
};

/*
 * Get a perspective matrix with field-of-view parameters.
 * 
 * [params]
 * angle: The angle from the horizon to the top.
 * ar: Aspect ratio between width and height of the view plane.
 * n: Distance of the near plane from the origin in camera coordinates.
 * f: Distance of the far plane from the origin in camera coordinates.
 * 
 * [return]
 * The perspective matrix.
 * 
 */
DGL.fov = function(angle, ar, n, f) {
	
	var h = n * Math.tan(angle * Math.PI / 180);
	var w = h * ar;
	return DGL.perspective(w, h, n, f);
};

/*
 * Get a transformation matrix from world to camera coordinates.
 * 
 * [params]
 * e: The position of the camera in world coordinates.
 * d: The direction of the camera in world coordinates.
 * t: The up vector.
 * 
 * [return]
 * The transformation matrix.
 * 
 */
DGL.camera = function(e, d, t) {
	
	var w = DGL.v3normalize(DGL.v3neg(d));
	var u = DGL.v3normalize(DGL.v3cross(t, w));
	var v = DGL.v3normalize(DGL.v3cross(w, u));
	
	return [
		u[0], v[0], w[0], 0.0,
		u[1], v[1], w[1], 0.0,
		u[2], v[2], w[2], 0.0,
			-u[0] * e[0] - u[1] * e[1] - u[2]* e[2],
			-v[0] * e[0] - v[1] * e[1] - v[2]* e[2],
			-w[0] * e[0] - w[1] * e[1] - w[2]* e[2],
			1.0
	];
};