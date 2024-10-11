"use strict";

var gl;
var pointsArray = [];

var thetaX = 0.0;
var thetaY = 0.0;
var thetaZ = 0.0;
var speed = 1.0;

var colorLoc;
var orange1, orange2, orange3, orange4, orange5;

var modelViewMatrixLoc; 
var modelViewMatrix;

var eyes = 0;
var teeth = 0;
var spin = 0;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);

	orange1 = vec4(255/255, 165/255, 0, 1.0);
	orange2 = vec4(255/255, 192/255, 0, 1.0);
	orange3 = vec4(255/255, 117/255, 24/255, 1.0);
	orange4 = vec4(255/255, 234/255, 0, 1.0);
	orange5 = vec4(255/255, 250/255, 160/255, 1.0);
	
	// DO NOT MODIFY OR ADD VERTICES //
 	pointsArray.push(vec4( 0.2, 0.2, 0, 1));
	pointsArray.push(vec4( 0.4, 0.6, 0, 1));
	pointsArray.push(vec4( 0.6, 0.2, 0, 1));
	
    // DO NOT MODIFY OR ADD BUFFERS //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
	
	colorLoc = gl.getUniformLocation(program, "uColor");
	
	modelViewMatrixLoc = gl.getUniformLocation( program, "uModelViewMatrix" );

    // Initialize event handlers
    document.getElementById("Eyes button").onclick = function () {
		eyes = 1;
    };
	
    document.getElementById("Teeth button").onclick = function () {
		teeth = 1;
    };
	
    document.getElementById("Spin button").onclick = function () {
		spin = 1 ;
    };
	
    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);

	modelViewMatrix = mat4();

	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniform4fv(colorLoc, orange1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    // draw other eyes nose and mouth based off first triangle

    // draw eye
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, translate(-0.8, 0 , 0));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniform4fv(colorLoc, orange1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    // draw nose
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, scale(0.5, 1, 0));
    modelViewMatrix = mult(modelViewMatrix, translate(-0.4, -0.4 , 0));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniform4fv(colorLoc, orange2);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    // draw mouth
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, scale(4, -1, 0));
    modelViewMatrix = mult(modelViewMatrix, translate(-0.4, -0.8 , 0));
    modelViewMatrix = mult(modelViewMatrix, translate(-0, 1 , 0));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniform4fv(colorLoc, orange3);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
    
    if (eyes == 1) {
        // left eye
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(0.25, 1, 0));
        // rotate the eye
        if (spin == 1) {
            // rotate around z axis
            modelViewMatrix = mult(modelViewMatrix, translate(2, 0 , 0)); 
            modelViewMatrix = mult(modelViewMatrix, rotateZ(thetaZ));
            modelViewMatrix = mult(modelViewMatrix, translate(-2, 0 , 0)); 
        }
        else {modelViewMatrix = mult(modelViewMatrix, translate(-2, 0 , 0));}

        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange4);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        // right eye
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(0.25, 1, 0));
        if (spin == 1) {
            // rotate around z axis
            modelViewMatrix = mult(modelViewMatrix, translate(1.2, 0 , 0)); 
            modelViewMatrix = mult(modelViewMatrix, rotateZ(thetaZ));
            modelViewMatrix = mult(modelViewMatrix, translate(-1.2, 0 , 0)); 
        }
        else {modelViewMatrix = mult(modelViewMatrix, translate(1.2, 0 , 0));}

        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange4);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    }
    if (teeth == 1) {
        // left tooth
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(0.5, -0.5, 0.5));
        modelViewMatrix = mult(modelViewMatrix, translate(-1, -1 , 0));
        modelViewMatrix = mult(modelViewMatrix, translate(0, 1.6 , 0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

        // right tooth
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale(0.5, -0.5, 0.5));
        modelViewMatrix = mult(modelViewMatrix, translate(0.3, -1 , 0));
        modelViewMatrix = mult(modelViewMatrix, translate(0, 1.6 , 0));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	    gl.uniform4fv(colorLoc, orange5);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
    }
    if (spin == 1) {
        thetaX += speed;
        thetaY += speed;
        thetaZ += speed;

    }



	requestAnimationFrame(render);
 }
