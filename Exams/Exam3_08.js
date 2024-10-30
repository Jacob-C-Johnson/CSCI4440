"use strict";

var canvas;
var gl;

var nRows = 50;
var nColumns = 50;

// data for radial hat function: sin(Pi*r)/(Pi*r)
var data = [];
for(var i = 0; i < nRows; ++i) {
    data.push([]);
    var x = Math.PI*(4*i/nRows-2.0);
    for(var j = 0; j < nColumns; ++j) {
        var y = Math.PI*(4*j/nRows-2.0);
        var r = Math.sqrt(x*x+y*y);
        // take care of 0/0 for r = 0
        data[i][j] = r ? Math.sin(r) / r : 1.0;
    }
}

var positionsArray = [];
var normalsArray = [];

var eye = vec3(0.0, 0.0, 1.0); 
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var left = -1.5;
var right = 1.5;
var ytop = 1.5;
var bottom = -1.5;
var near = -10;
var far = 10;

var trick1 = false;
var trick2 = false;
var trick3 = false;
var trick4 = false;
var movingRight = true;
var movingLeft = false;
var goingcomp = true;
var growing = true;

var radius = 2.0;
var theta = 0.0;
var phi = 0.0;

var lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;

var ambientProduct, ambientProductLoc; 
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;
var lightPositionLoc, shininessLoc;

var apt, bpt, cpt, dpt;

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    // enable depth testing and polygon offset
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

	// vertex array of nRows*nColumns quadrilaterals
	// (two triangles/quad) from data
    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
			var apt = vec4(2*i/nRows-1, data[i][j], 2*j/nColumns-1, 1.0);
			var bpt = vec4(2*(i+1)/nRows-1, data[i+1][j], 2*j/nColumns-1, 1.0);
			var cpt = vec4(2*(i+1)/nRows-1, data[i+1][j+1], 2*(j+1)/nColumns-1, 1.0);
			var dpt = vec4(2*i/nRows-1, data[i][j+1], 2*(j+1)/nColumns-1, 1.0);
			positionsArray.push(apt);
			positionsArray.push(bpt);
			positionsArray.push(cpt);
			positionsArray.push(dpt);
			normalsArray.push(apt);
			normalsArray.push(bpt);
			normalsArray.push(cpt);
			normalsArray.push(dpt);
		}
	}

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    modelViewMatrixLoc = gl.getUniformLocation( program, "uModelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "uProjectionMatrix" );
    nMatrixLoc = gl.getUniformLocation( program, "uNormalMatrix" );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);	
	
	ambientProductLoc = gl.getUniformLocation(program,"uAmbientProduct");
	diffuseProductLoc = gl.getUniformLocation(program,"uDiffuseProduct");
	specularProductLoc = gl.getUniformLocation(program,"uSpecularProduct");
	lightPositionLoc = gl.getUniformLocation(program,"uLightPosition")
	shininessLoc = gl.getUniformLocation(program, "uShininess");
	
    gl.uniform4fv( ambientProductLoc, ambientProduct );
    gl.uniform4fv( diffuseProductLoc, diffuseProduct );
    gl.uniform4fv( specularProductLoc, specularProduct );
    gl.uniform4fv( lightPositionLoc, lightPosition );
    gl.uniform1f( shininessLoc,materialShininess );
	
	
	// Initialize event handlers
    document.getElementById("Button0").onclick = function () {
        // return everything to its initial state
        trick1 = false;
        trick2 = false;
        trick3 = false;
        trick4 = false;
        movingRight = true;
        movingLeft = false;
        eye = vec3(0.0, 0.0, 1.0);
        lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
        materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
        materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
        bottom = -1.5;
        ytop = 1.5;
    };
    document.getElementById("Button1").onclick = function () {
        trick1 = !trick1;
        trick2 = false;
        trick3 = false;
        trick4 = false;
    };
    document.getElementById("Button2").onclick = function () {
        trick2 = !trick2;
        trick1 = false;
        trick3 = false;
        trick4 = false;
        ytop = -ytop;
        bottom = -bottom;
    };
    document.getElementById("Button3").onclick = function () {
        trick3 = !trick3;
        trick2 = false;
        trick1 = false;
        trick4 = false;
    };
    document.getElementById("Button4").onclick = function () {
        trick4 = !trick4;
        trick2 = false;
        trick1 = false;
        trick3 = false;
    };
    render();
}

// tricks do not preform at the same time
// initial hat is back to what it used to be
// trick1: the hat spins and if you press the button it stops
// trick 2 is upside down and the light spins arround
// trick 3 is the material color changing back and forth
// trick 4 is the squint from the project


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(trick1) { 
        eye[0]  = radius * Math.sin(theta);
        eye[2] = radius * Math.cos(theta);
        theta += 0.02;
        if(theta > 2*Math.PI) theta -= 2*Math.PI;
    }

    if(trick2) {
        // rotate the light around the object
        lightPosition[0] = radius * Math.sin(theta);
        lightPosition[2] = radius * Math.cos(theta);
        theta += 0.02;
        if(theta > 2*Math.PI) theta -= 2*Math.PI;
    }

    if(trick4) {
        // grow the eyes
        if(growing){
            bottom += 0.01;
        }
        // shirnk the eyes
        else{
            bottom -= 0.01;
        }
        // checks to reverse the function at max and min values
        if(bottom <= -3.5) growing = true;
        if(bottom >= -1.5) growing = false;
    }

	
    modelViewMatrix = lookAt(eye, at, up);	
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    nMatrix = normalMatrix(modelViewMatrix, true);
	
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

	gl.uniform4fv( ambientProductLoc, flatten(ambientProduct) );
    gl.uniform4fv( diffuseProductLoc, flatten(diffuseProduct) );
    gl.uniform4fv( specularProductLoc, flatten(specularProduct) );	
    gl.uniform4fv( lightPositionLoc, flatten(lightPosition) );
    gl.uniform1f( shininessLoc, materialShininess );

    if(trick3) { 
        // var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
        // var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

        if(goingcomp){
            if (materialDiffuse[0] >= 0.0) {materialDiffuse[0] -= 0.01;}
            if(materialDiffuse[1] >= 0.0){materialDiffuse[1] -= 0.01;}
            if(materialDiffuse[2] >= 0.0){materialDiffuse[2] -= 0.01;}

            if(materialSpecular[0] <= 1.0){materialSpecular[0] += 0.01;}
            if(materialSpecular[1] <= 1.0){materialSpecular[1] += 0.01;}
            if(materialSpecular[2] <= 1.0){materialSpecular[2] += 0.01;}

            if(materialDiffuse[0] <= 0.0 && materialDiffuse[1] <= 0.0 && materialDiffuse[2] <= 0.0){
                goingcomp = false;
            }
        }
        else {
            if (materialDiffuse[0] <= 1.0) {materialDiffuse[0] += 0.01;}
            if(materialDiffuse[1] <= 1.0){materialDiffuse[1] += 0.01;}
            if(materialDiffuse[2] <= 1.0){materialDiffuse[2] += 0.01;}

            if(materialSpecular[0] >= 1.0){materialSpecular[0] -= 0.01;}
            if(materialSpecular[1] >= 1.0){materialSpecular[1] -= 0.01;}
            if(materialSpecular[2] >= 1.0){materialSpecular[2] -= 0.01;}

            if(materialDiffuse[0] >= 1.0 && materialDiffuse[1] >= 1.0 && materialDiffuse[2] >= 1.0){
                goingcomp = true;
            }
        }
        

        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
        specularProduct = mult(lightSpecular, materialSpecular);
        gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    }

	
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );

    for(var i=0; i<positionsArray.length; i+=4) {
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
    }

    requestAnimationFrame(render);
}
