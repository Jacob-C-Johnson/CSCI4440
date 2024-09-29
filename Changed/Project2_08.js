"use strict";

var canvas;
var gl;

var numPositions  = 36;
var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var pause = 1;

var axis = 0;
var theta = [0.1, 0.1, 0.1];

var thetaLoc;
var uMatrixLoc;

var nebula = 1;
var star = 0;
var planets = 0;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Grab Location for motel view matrix
    uMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");

    // menu controls
    document.getElementById("controls" ).onclick = function(event) {
        switch(event.target.index) {
            case 0:
                nebula = 1;
                star = 0;
                planets = 0;
                break;
            case 1:
                nebula = 0;
                star = 1;
                planets = 0;
                break;
            case 2:
                nebula = 0;
                star = 1;
                planets = 1;
                break;
            case 3:
                break; 
        }
    };

    // Pause button
    document.getElementById("pause").onclick = function() {
        pause = 1 - pause;
    };

    render();
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4(-0.25, -0.25,  0.25, 1.0),
        vec4(-0.25,  0.25,  0.25, 1.0),
        vec4(0.25,  0.25,  0.25, 1.0),
        vec4(0.25, -0.25,  0.25, 1.0),
        vec4(-0.25, -0.25, -0.25, 1.0),
        vec4(-0.25,  0.25, -0.25, 1.0),
        vec4(0.25,  0.25, -0.25, 1.0),
        vec4(0.25, -0.25, -0.25, 1.0)
    ];

    var vertexColors = [
      vec4(0.0, 0.0, 0.0, 1.0),  // black
      vec4(1.0, 0.0, 0.0, 1.0),  // red
      vec4(1.0, 1.0, 0.0, 1.0),  // yellow
      vec4(0.0, 1.0, 0.0, 1.0),  // green
      vec4(0.0, 0.0, 1.0, 1.0),  // blue
      vec4(1.0, 0.0, 1.0, 1.0),  // magenta
      vec4(0.0, 1.0, 1.0, 1.0),  // cyan
      vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex
    var indices = [ a, b, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push(vertices[indices[i]]);
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }

}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rotate the square
    theta[xAxis] += 0.4 * pause;
    theta[yAxis] += 0.3 * pause;
    theta[zAxis] += 0.2 * pause;

    var modelViewMatrix = mat4();

    // Apply rotations
    modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));

    // send matrix to shader
    gl.uniformMatrix4fv(uMatrixLoc, false, flatten(modelViewMatrix));

    drawCube();
    
    // Draw the cube wireframe if nebula is selected
    if (planets == 1) {
        modelViewMatrix = mat4(); 

        modelViewMatrix = mult(modelViewMatrix, scale(0.6, 0.6, 0.6));
        
        var r = rotateY(theta[yAxis])
        modelViewMatrix = mult(modelViewMatrix, r);

        modelViewMatrix = mult(modelViewMatrix, translate(1.0, 0.0, 0));

        modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
        modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
        modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));

        gl.uniformMatrix4fv(uMatrixLoc, false, flatten(modelViewMatrix));
        drawCube();
    }

    requestAnimationFrame( render );
}

function drawCube() {
    if (nebula == 1) {
        // For loop to draw each face of the cube
        for (var i = 0; i < positions.length; i += 4)
        {
            gl.drawArrays( gl.LINE_LOOP, i, 4);
        }
    }
    // Draw cube solid faces if star has been slected
    if (star == 1) {
        for (var i = 0; i < positions.length; i += 4)
        {
            gl.drawArrays( gl.TRIANGLE_FAN, i, 4);
        }
    }
}
