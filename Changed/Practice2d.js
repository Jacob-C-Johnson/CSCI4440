"use strict";

var canvas;
var gl;

var pointsArray = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0.1];

var center = vec3(0.4, 0.4, 0); // Center of the square

var thetaLoc;
var mLoc;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    pointsArray.push(vec4(0.2, 0.2, 0, 1));
    pointsArray.push(vec4(0.6, 0.2, 0, 1));
    pointsArray.push(vec4(0.6, 0.6, 0, 1));
    pointsArray.push(vec4(0.2, 0.6, 0, 1));

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    mLoc = gl.getUniformLocation(program, "uModelViewMatrix");

    render();
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rotate the square
    theta[zAxis] += 0.1;

    var ModelViewMatrix = mat4();
    ModelViewMatrix = mult(ModelViewMatrix, translate(0.4,0.4,0));

    var r = rotateZ(theta[zAxis]);
    ModelViewMatrix = mult(ModelViewMatrix, r);

    ModelViewMatrix = mult(ModelViewMatrix, translate(-0.4,-0.4,0));

    gl.uniformMatrix4fv(mLoc, false, flatten(ModelViewMatrix));


    gl.drawArrays(gl.TRIANGLE_FAN, 0, pointsArray.length);
    requestAnimationFrame(render);
}
