"use strict";

var shadow = function() {

var canvas;
var gl;

var positionsArray = [];

var near = -4;
var far = 4;

var theta  = 0.0;

var left = -2.0;
var right = 2.0;
var top = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var colorLoc;

var eye, at, up;
var light;

var m;

var black;

var colorsArray= [];

var solidColorArray = [];



window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    light = vec3(0.0, 2.0, 0.0);

// matrix for shadow projection

    m = mat4();
    m[3][3] = 0;
    m[3][1] = -1/light[1];

//console.log("m");
//printm(m);

    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    eye = vec3(1.0, 1.0, 1.0);

    // color square red and shadow black

    var vertexColors = [
        vec4(1.0, 0.0, 0.0, 1.0),  // Red for top-right
        vec4(0.0, 1.0, 0.0, 1.0),  // Green for top-left
        vec4(0.0, 0.0, 1.0, 1.0),   // Blue for bottom-left
        vec4(1.0, 1.0, 0.0, 1.0),  // Yellow for bottom-right
        vec4(0.5, .5, .5, 1.0),  // Yellow for bottom-right
        vec4(0.5, .5, .5, 1.0),  // Yellow for bottom-right
        vec4(0.5, .5, .5, 1.0),  // Yellow for bottom-right
        vec4(0.5, .5, .5, 1.0)  // Yellow for bottom-right

    ];

    

    black = vec4(0.0, 0.0, 0.0, 1.0);

    // square

    positionsArray.push(vec4(-0.5, 0.5,  -0.5, 1.0));
    positionsArray.push(vec4(-0.5,  0.5,  0.5, 1.0));
    positionsArray.push(vec4(0.5, 0.5,  0.5, 1.0));
    positionsArray.push(vec4(0.5,  0.5,  -0.5, 1.0));

    
    positionsArray.push(vec4(-0.5, 0.5,  -0.5, 1.0));
    positionsArray.push(vec4(-0.5,  0.5,  0.5, 1.0));
    positionsArray.push(vec4(0.5, 0.5,  0.5, 1.0));
    positionsArray.push(vec4(0.5,  0.5,  -0.5, 1.0));

    colorsArray.push(vec4(1.0, 0.0, 0.0, 1.0)); // Red for top-right
    colorsArray.push(vec4(0.0, 1.0, 0.0, 1.0));  // Green for top-left
    colorsArray.push(vec4(0.0, 0.0, 1.0, 1.0));   // Blue for bottom-left
    colorsArray.push(vec4(1.0, 1.0, 0.0, 1.0)); 
    
    
    colorsArray.push(vec4(0.0, 0.0, 0.0, 1.0)); // Red for top-right
    colorsArray.push(vec4(0.0, 0.0, 0.0, 1.0));  // Green for top-left
    colorsArray.push(vec4(0.0, 0.0, 0.0, 1.0));   // Blue for bottom-left
    colorsArray.push(vec4(0.0, 0.0, 0.0, 1.0));// Yellow for bottom-right


    /*quad()


    function quad() {
        for (var i = 0; i < vertexColors.length; i++){
            colorsArray.push(vertexColors[i])
        }
    }
*/

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color buffer
    var cBuffer = gl.createBuffer(); // creation
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer); // binding
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    
    colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    colorLoc = gl.getUniformLocation(program, "uColor");

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    document.getElementById("Button1").onclick = function() {eye[0] += 0.1 }; 
    document.getElementById("Button2").onclick = function() {eye[0] -= 0.1 }; 
    document.getElementById("Button3").onclick = function() {eye[1] += 0.1}; 
    document.getElementById("Button4").onclick = function() {eye[1] -= 0.1 }; 
    document.getElementById("Button5").onclick = function() {eye[2] += 0.1 }; 
    document.getElementById("Button6").onclick = function() {eye[2] -= 0.1};
    document.getElementById("Button7").onclick = function() {light[1] += .02 };
    document.getElementById("Button8").onclick = function() {light[1] -= .02 };

    projectionMatrix = ortho(left, right, bottom, top, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    render();

}


var render = function() {

        theta += 0.1;
        if(theta > 2*Math.PI) theta -= 2*Math.PI;

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // model-view matrix for square

        modelViewMatrix = lookAt(eye, at, up);

        // send color and matrix for square then render

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        //gl.uniform4fv(colorLoc, red);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // rotate light source

        light[0] = Math.sin(theta);
        light[2] = Math.cos(theta);


        modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));

        modelViewMatrix = mult(modelViewMatrix, m);

        modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1],
           -light[2]));

        // send color and matrix for shadow

        //gl.uniform4fv(colorLoc, black); // Set the color to black for the shadow
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);

        requestAnimationFrame(render);
    }

}

shadow();
