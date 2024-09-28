"use strict";

var canvas;
var gl;

var numPositions  = 24;

var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0.1, 0.1, 0.1];

var thetaLoc;
var uMatrixLoc;

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

    var colorLoc =gl.getAttribLocation( program, "aColor");
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

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
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
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
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
    theta[xAxis] += 0.1;
    theta[yAxis] += 0.1;
    theta[zAxis] += 0.1;

    var modelViewMatrix = mat4();

    // Translate the center of the cube to the origin
    //modelViewMatrix = mult(modelViewMatrix, translate(-0.5, -0.5, -0.5));

    // Apply rotations
    modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));

    // Translate the center of the cube back to its original position
    //modelViewMatrix = mult(modelViewMatrix, translate(0.5, 0.5, 0.5));
    gl.uniformMatrix4fv(uMatrixLoc, false, flatten(modelViewMatrix));



    // DRAW CUBES FACES INDIVIDUALLY
    gl.drawArrays( gl.LINE_LOOP, 0, 4);
    gl.drawArrays( gl.LINE_LOOP, 4, 4);
    gl.drawArrays( gl.LINE_LOOP, 8, 4);
    gl.drawArrays( gl.LINE_LOOP, 12, 4);
    gl.drawArrays( gl.LINE_LOOP, 16, 4);
    gl.drawArrays( gl.LINE_LOOP, 20, 4);
    gl.drawArrays( gl.LINE_LOOP, 24, 4);
    requestAnimationFrame( render );
}
