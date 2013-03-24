/*
 * Dale's framework for WebGL applications.
 * Interaction: animation, input handling, etc.
 * 
 */

DGL.requestAnimationFrame = function(callback) {
	
	// TODO Improve compatibility.
	
	callback = callback || function() {};
	
	return window.requestAnimationFrame(callback);
};

DGL.addMouseMove = function(gl, callback, program, names) {
	
	var canvas = gl.canvas;

	var names = names || {};
	var nameVpx = names.viewportX;
	var nameVpy = names.viewportY;
	var nameSvpx = names.scaledViewportX;
	var nameSvpy = names.scaledViewportY;
	
	var lastArgs = null;
	var curArgs = null;
	
	var callback0 = function(e) {
		
		var vpx = e.clientX - (canvas.offsetLeft - window.scrollX);
		var vpy = e.clientY - (canvas.offsetTop - window.scrollY);
		var svpx = vpx / canvas.width;
		var svpy = vpy / canvas.height;
		
		if(lastArgs == null) {
			
			lastArgs = {
				viewportX: vpx,
				viewportY: vpy,
				scaledViewportX: svpx,
				scaledViewportY: svpy
			};
			
		} else {
			
			lastArgs = {
				viewportX: curArgs.viewportX,
				viewportY: curArgs.viewportY,
				scaledViewportX: curArgs.scaledViewportX,
				scaledViewportY: curArgs.scaledViewportY
			};
		}
		
		curArgs = {
			viewportX: vpx,
			viewportY: vpy,
			scaledViewportX: svpx,
			scaledViewportY: svpy,
			lastArgs: lastArgs
		};
		
		if(callback) callback(curArgs);
		
		if(program) {
			
			if(nameVpx) DGL.uniformF(gl, program, nameVpx, [vpx]);
			if(nameVpy) DGL.uniformF(gl, program, nameVpy, [vpy]);
			if(nameSvpx) DGL.uniformF(gl, program, nameSvpx, [svpx]);
			if(nameSvpy) DGL.uniformF(gl, program, nameSvpy, [svpy]);
		}
	};
	
	if(canvas.addEventListener) {
		canvas.addEventListener("mousemove", callback0, false);
	} else {
		canvas.attachEvent("mousemove", callback0, false);
	}
};

DGL.addMouseDown = function(gl, callback, program, names) {
	
	var canvas = gl.canvas;

	var names = names || {};
	var nameVpx = names.viewportX;
	var nameVpy = names.viewportY;
	var nameSvpx = names.scaledViewportX;
	var nameSvpy = names.scaledViewportY;
	var nameMousePressed = names.mousePressed;
	
	var lastArgs = null;
	var curArgs = null;
	
	var callback0 = function(e) {
		
		var vpx = e.clientX - (canvas.offsetLeft - window.scrollX);
		var vpy = e.clientY - (canvas.offsetTop - window.scrollY);
		var svpx = vpx / canvas.width;
		var svpy = vpy / canvas.height;
		
		if(lastArgs == null) {
			
			lastArgs = {
				viewportX: vpx,
				viewportY: vpy,
				scaledViewportX: svpx,
				scaledViewportY: svpy
			};
			
		} else {
			
			lastArgs = {
				viewportX: curArgs.viewportX,
				viewportY: curArgs.viewportY,
				scaledViewportX: curArgs.scaledViewportX,
				scaledViewportY: curArgs.scaledViewportY
			};
		}
		
		curArgs = {
			viewportX: vpx,
			viewportY: vpy,
			scaledViewportX: svpx,
			scaledViewportY: svpy,
			lastArgs: lastArgs
		};
		
		if(callback) callback(curArgs);
		
		if(program) {
			
			if(nameVpx) DGL.uniformF(gl, program, nameVpx, [vpx]);
			if(nameVpy) DGL.uniformF(gl, program, nameVpy, [vpy]);
			if(nameSvpx) DGL.uniformF(gl, program, nameSvpx, [svpx]);
			if(nameSvpy) DGL.uniformF(gl, program, nameSvpy, [svpy]);
			if(nameMousePressed) DGL.uniformI(gl, program, nameMousePressed, [1]);
		}		
	};
	
	if(canvas.addEventListener) {
		canvas.addEventListener("mousedown", callback0, false);
	} else {
		canvas.attachEvent("mousedown", callback0, false);
	}
};

DGL.addMouseUp = function(gl, callback, program, names) {
	
	var canvas = gl.canvas;

	var names = names || {};
	var nameVpx = names.viewportX;
	var nameVpy = names.viewportY;
	var nameSvpx = names.scaledViewportX;
	var nameSvpy = names.scaledViewportY;
	var nameMousePressed = names.mousePressed;
	
	var lastArgs = null;
	var curArgs = null;
	
	var callback0 = function(e) {
		
		var vpx = e.clientX - (canvas.offsetLeft - window.scrollX);
		var vpy = e.clientY - (canvas.offsetTop - window.scrollY);
		var svpx = vpx / canvas.width;
		var svpy = vpy / canvas.height;
		
		if(lastArgs == null) {
			
			lastArgs = {
				viewportX: vpx,
				viewportY: vpy,
				scaledViewportX: svpx,
				scaledViewportY: svpy
			};
			
		} else {
			
			lastArgs = {
				viewportX: curArgs.viewportX,
				viewportY: curArgs.viewportY,
				scaledViewportX: curArgs.scaledViewportX,
				scaledViewportY: curArgs.scaledViewportY
			};
		}
		
		curArgs = {
			viewportX: vpx,
			viewportY: vpy,
			scaledViewportX: svpx,
			scaledViewportY: svpy,
			lastArgs: lastArgs
		};
		
		if(callback) callback(curArgs);
		
		if(program) {
			
			if(nameVpx) DGL.uniformF(gl, program, nameVpx, [vpx]);
			if(nameVpy) DGL.uniformF(gl, program, nameVpy, [vpy]);
			if(nameSvpx) DGL.uniformF(gl, program, nameSvpx, [svpx]);
			if(nameSvpy) DGL.uniformF(gl, program, nameSvpy, [svpy]);
			if(nameMousePressed) DGL.uniformI(gl, program, nameMousePressed, [0]);
		}
	};
	
	if(canvas.addEventListener) {
		canvas.addEventListener("mouseup", callback0, false);
	} else {
		canvas.attachEvent("mouseup", callback0, false);
	}
};

DGL.addUpdate = function(gl, callback, program, names) {
	
	// TODO
};

DGL.addTimedUpdate = function(gl, callback, program, names) {
	
	// TODO
};

DGL.loop = function(draw) {
	
	draw();
	
	DGL.requestAnimationFrame(function() { DGL.loop(draw) });	
};
