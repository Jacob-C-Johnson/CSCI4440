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

var moveR = true;
var moveL = false;
var moveU = true;
var moveD = false;
var scan1 = false;
var scan2 = false;
var zoomIn = false;
var zoomOut = false;
var scanToggle = 1;

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

    document.getElementById("drone").onclick = function(event) {
        switch(event.target.index) {
            case 0:
                // camera right
                eye[0] += 0.2
                break;
            case 1:
                // camera left
                eye[0] -= 0.2
                break;
            case 2:
                // camera up
                eye[1] += 0.2
                break;    
            case 3:
                // camera down
                eye[1] -= 0.2
                break;
            case 4:
                // camera forward
                eye[2] += 0.2
                break;
            case 5:
                // camera backward
                eye[2] -= 0.2
                break;         
        }
    };

    // implement the light menu
    document.getElementById("light").onclick = function(event) {
        switch(event.target.index) {
            case 0:
                // light right
                light[0] += 0.2
                break;
            case 1:
                // light left
                light[0] -= 0.2
                break;
            case 2:
                // light up
                light[1] += 0.2
                break;
            case 3:
                // light down
                light[1] -= 0.2
                break;
            case 4:
                // light forward
                light[2] += 0.2
                break;
            case 5:
                // light backward
                light[2] -= 0.2
                break;
        }
    };

    document.getElementById("scan").onclick = function(event) { 
        switch(event.target.index) {
            case 0:
                //scan 1 move eye left and right
                scan1 = !scan1;
                scan2 = false;
                break;
            case 1:
                //scan2 move eye up and down
                scan1 = false;
                scan2 = !scan2;
                break;
            case 2:
                //zoom in
                zoomIn = !zoomIn;
                break;
            case 3:
                //zoom out
                zoomOut = !zoomOut;
                break;
            case 4:
                //reset drone
                eye = vec3(1.0, 1.0, 1.0);
                left = -2.0;
                right = 2.0;
                top = 2.0;
                bottom = -2.0;

                projectionMatrix = ortho(left, right, bottom, top, near, far);
                gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

                break;
            case 5:
                //reset light
                light = vec3(0.0, 2.0, 0.0);
                break;
        }
    };

    // implement the scan menu

    projectionMatrix = ortho(left, right, bottom, top, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    render();

}


var render = function() {

        // theta += 0.1;
        // if(theta > 2*Math.PI) theta -= 2*Math.PI;
        // console.log("theta = ", theta);

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if(scan1) {
            eye[0] += 0.2 * scanToggle;

            if (eye[0] > 2.0 || eye[0] < -2.0) {
                scanToggle *= -1;
            }
        }

        if(scan2) { 
            eye[1] += 0.2 * scanToggle;

            if (eye[1] > 2.0 || eye[1] < -2.0) {
                scanToggle *= -1;
            }
        }

        if(zoomIn) { 
            left = -1.0;
            right = 1.0;
            top = 1.0;
            bottom = -1.0;

            projectionMatrix = ortho(left, right, bottom, top, near, far);
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
            zoomIn = false;
        }

        if(zoomOut) { 
            left = -4.0;
            right = 4.0;
            top = 4.0;
            bottom = -4.0;

            projectionMatrix = ortho(left, right, bottom, top, near, far);
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
            zoomOut = false;
        }



        // model-view matrix for square

        modelViewMatrix = lookAt(eye, at, up);

        // send color and matrix for square then render

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        //gl.uniform4fv(colorLoc, red);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // rotate light source

        // light[0] = Math.sin(theta);
        // light[2] = Math.cos(theta);


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
