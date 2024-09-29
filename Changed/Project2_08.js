"use strict";

var canvas;
var gl;

// positions and colors varibles
var numPositions  = 36;
var positions = [];
var solidColors = [];
var interpColors = [];

//axis of rotation varibles
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var pause = 1;

var axis = 0;
var theta = [0.1, 0.1, 0.1];

// vertex location varibles
var thetaLoc;
var uMatrixLoc;

// varibles to conrol the menu states
var nebula = 1;
var star = 0;
var planets = 0;
var solar = 0;

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

    // Create and bind buffers for colors and positions
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(solidColors), gl.STATIC_DRAW);

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
            // varibles control what the render function will draw via if statements
            case 0:
                nebula = 1;
                star = 0;
                planets = 0;
                solar = 0;
                break;
            case 1:
                nebula = 0;
                star = 1;
                planets = 0;
                solar = 0;
                break;
            case 2:
                nebula = 0;
                star = 1;
                planets = 1;
                solar = 0;
                break;
            case 3:
                nebula = 0;
                star = 1;
                planets = 1;
                solar = 1 - solar;
                break; 
        }
        // Change the color of the cube based on menu option
        if (solar == 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(solidColors), gl.STATIC_DRAW);
        }
        else {
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(interpColors), gl.STATIC_DRAW);
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
        vec4(-0.18, -0.18,  0.18, 1.0),
        vec4(-0.18,  0.18,  0.18, 1.0),
        vec4(0.18,  0.18,  0.18, 1.0),
        vec4(0.18, -0.18,  0.18, 1.0),
        vec4(-0.18, -0.18, -0.18, 1.0),
        vec4(-0.18,  0.18, -0.18, 1.0),
        vec4(0.18,  0.18, -0.18, 1.0),
        vec4(0.18, -0.18, -0.18, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(0.5, 0.2, 0.3, 1.0),  // Dark purple
        vec4(0.6, 0.0, 0.45, 1.0),  // maroon purple
        vec4(0.9, 0.0, 0.4, 1.0),  // bright pink
        vec4(0.3, 0.4, 0.2, 1.0),  // forest green
        vec4(0.3, 0.0, 0.7, 1.0),  // Dark magenta
        vec4(0.0, 0.5, 0.5, 1.0),  // Dark teal
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex
    var indices = [ a, b, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        // send position and color data to the arrays
        positions.push(vertices[indices[i]]);
        interpColors.push( vertexColors[indices[i]] );
        solidColors.push(vertexColors[a]);
    }

}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rotate the square
    theta[xAxis] += 0.4 * pause;
    theta[yAxis] += 0.3 * pause;
    theta[zAxis] += 0.2 * pause;

    // new model view matrix for cube operations
    var modelViewMatrix = mat4();

    // Apply rotations to show all six faces
    modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));

    // send matrix to shader
    gl.uniformMatrix4fv(uMatrixLoc, false, flatten(modelViewMatrix));

    // draw the cube
    drawCube();
    
    // Draw the planets if the plantetary formation is selected
    if (planets == 1) {
        drawPlanets();
    }

    requestAnimationFrame( render );
}

function drawCube() {
    // Draw cube lines for wireframe
    if (nebula == 1) {
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
function drawPlanets() {
    // information for the planets
    var numPlanets = 4;
    var planetScales = [0.6, 0.4, 0.35, 0.5];
    var planetDistances = [1.2, 0.9, 1.5, 1.7];
    var angularOffsets = [0.0, 90.0, 180.0, 270.0]; 

    for (var i = 0; i < numPlanets; i++) {
        var modelViewMatrix = mat4();

        // Scale the planet
        modelViewMatrix = mult(modelViewMatrix, scale(planetScales[i], planetScales[i], planetScales[i]));

        // Apply rotation around the main cube with angular offset
        var r = rotateY(theta[yAxis] + angularOffsets[i]);
        modelViewMatrix = mult(modelViewMatrix, r);

        // Translate to position around the main cube
        modelViewMatrix = mult(modelViewMatrix, translate(planetDistances[i], 0.0, 0.0));

        // Apply additional rotations to the planet itself
        modelViewMatrix = mult(modelViewMatrix, rotateX(theta[xAxis]));
        modelViewMatrix = mult(modelViewMatrix, rotateY(theta[yAxis]));
        modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[zAxis]));

        // Send matrix to shader and draw the planet
        gl.uniformMatrix4fv(uMatrixLoc, false, flatten(modelViewMatrix));
        drawCube();
    }
}
