/*
 * Dale's framework for WebGL applications.
 * Formats: 3D model format parsing, etc.
 * 
 */

var DGL = DGL || {};

/*
 * Parse a 3D model description in WaveFront OBJ format.
 * 
 * [params]
 * src: The source of the description.
 * smooth: Decide whether to average the normals to give a smooth lighting or
 *         not.
 * 
 * [return]
 * An object describing the mesh parsed from the description.
 * 
 */
DGL.parseObj = function(src, smooth) {
	
	smooth = smooth || false;
	
	var lines = src.split("\n");
	var vlines = lines.filter(
		function(l) { return l[0] == "v"; }
	);
	var flines = lines.filter(
		function(l) { return l[0] == "f"; }
	);
	
	var verts = new Array(3 * vlines.length);
	
	for(var i = 0; i < vlines.length; ++i) {
		
		var posStr = vlines[i].split(" ");
		verts[3 * i + 0] = parseFloat(posStr[1]);
		verts[3 * i + 1] = parseFloat(posStr[2]);
		verts[3 * i + 2] = parseFloat(posStr[3]);
	}
	
	var pos = new Array(3 * 3 * flines.length);
	var idx = new Array(3 * flines.length);
	var normals = new Array(3 * 3 * flines.length);
	var normalsAvg = new Array(3 * vlines.length);
	
	for(var i = 0; i < normalsAvg.length; ++i) {
		normalsAvg[i] = 0.0;
	}
	
	for(var i = 0; i < flines.length; ++i) {
		
		var triStr = flines[i].split(" ");
		
		var idx0 = parseInt(triStr[1]) - 1;
		var pos0 = verts.slice(idx0 * 3, idx0 * 3 + 3);
		pos[(i * 3 + 0) * 3 + 0] = pos0[0];
		pos[(i * 3 + 0) * 3 + 1] = pos0[1];
		pos[(i * 3 + 0) * 3 + 2] = pos0[2];
		idx[i * 3 + 0] = i * 3 + 0;
		
		var idx1 = parseInt(triStr[2]) - 1;
		var pos1 = verts.slice(idx1 * 3, idx1 * 3 + 3);
		pos[(i * 3 + 1) * 3 + 0] = pos1[0];
		pos[(i * 3 + 1) * 3 + 1] = pos1[1];
		pos[(i * 3 + 1) * 3 + 2] = pos1[2];
		idx[i * 3 + 1] = i * 3 + 1;
		
		var idx2 = parseInt(triStr[3]) - 1;
		var pos2 = verts.slice(idx2 * 3, idx2 * 3 + 3);
		pos[(i * 3 + 2) * 3 + 0] = pos2[0];
		pos[(i * 3 + 2) * 3 + 1] = pos2[1];
		pos[(i * 3 + 2) * 3 + 2] = pos2[2];
		idx[i * 3 + 2] = i * 3 + 2;
		
		var n = DGL.triangleNormal(pos0, pos1, pos2);
		
		if(smooth) {
						
			normalsAvg[idx0 * 3 + 0] += n[0];
			normalsAvg[idx0 * 3 + 1] += n[1];
			normalsAvg[idx0 * 3 + 2] += n[2];
			normalsAvg[idx1 * 3 + 0] += n[0];
			normalsAvg[idx1 * 3 + 1] += n[1];
			normalsAvg[idx1 * 3 + 2] += n[2];
			normalsAvg[idx2 * 3 + 0] += n[0];
			normalsAvg[idx2 * 3 + 1] += n[1];
			normalsAvg[idx2 * 3 + 2] += n[2];
			
		} else {
			
			normals[(i * 3 + 0) * 3 + 0] = n[0];
			normals[(i * 3 + 0) * 3 + 1] = n[1];
			normals[(i * 3 + 0) * 3 + 2] = n[2];
			normals[(i * 3 + 1) * 3 + 0] = n[0];
			normals[(i * 3 + 1) * 3 + 1] = n[1];
			normals[(i * 3 + 1) * 3 + 2] = n[2];
			normals[(i * 3 + 2) * 3 + 0] = n[0];
			normals[(i * 3 + 2) * 3 + 1] = n[1];
			normals[(i * 3 + 2) * 3 + 2] = n[2];
		}		
	}
	
	if(smooth) {
		
		for(var i = 0; i < flines.length; ++i) {
		
			var triStr = flines[i].split(" ");
			
			var idx0 = parseInt(triStr[1]) - 1;
			var idx1 = parseInt(triStr[2]) - 1;
			var idx2 = parseInt(triStr[3]) - 1;
			
			var n0 = DGL.v3normalize(normalsAvg.slice(3 * idx0, 3 * idx0 + 3));
			var n1 = DGL.v3normalize(normalsAvg.slice(3 * idx1, 3 * idx1 + 3));
			var n2 = DGL.v3normalize(normalsAvg.slice(3 * idx2, 3 * idx2 + 3));
			
			normals[(i * 3 + 0) * 3 + 0] = n0[0];
			normals[(i * 3 + 0) * 3 + 1] = n0[1];
			normals[(i * 3 + 0) * 3 + 2] = n0[2];
			normals[(i * 3 + 1) * 3 + 0] = n1[0];
			normals[(i * 3 + 1) * 3 + 1] = n1[1];
			normals[(i * 3 + 1) * 3 + 2] = n1[2];
			normals[(i * 3 + 2) * 3 + 0] = n2[0];
			normals[(i * 3 + 2) * 3 + 1] = n2[1];
			normals[(i * 3 + 2) * 3 + 2] = n2[2];
		}
	}
	
	return {
		pos: pos,
		idx: idx,
		normals: normals,
		mode: "TRIANGLES"
	}; 
};
