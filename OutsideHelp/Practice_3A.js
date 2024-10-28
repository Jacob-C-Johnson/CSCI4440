"use strict";



var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eye = vec3(1.0, 1.0, 1.0);

var switchView = false; // Initialize switchview variable
var fovy = 45.0; // Field of view in the y direction (degrees)
var aspect;


function orthoExample() {
    var canvas;
    var gl;

    var numVertices = 36;

    var positionsArray = [];
    var colorsArray = [];

    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0),
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0), // black
        vec4(1.0, 0.0, 0.0, 1.0), // red
        vec4(1.0, 1.0, 0.0, 1.0), // yellow
        vec4(0.0, 1.0, 0.0, 1.0), // green
        vec4(0.0, 0.0, 1.0, 1.0), // blue
        vec4(1.0, 0.0, 1.0, 1.0), // magenta
        vec4(0.0, 1.0, 1.0, 1.0), // cyan
        vec4(1.0, 1.0, 1.0, 1.0), // white
    ];

    var near = .3;
    var far = 3.0;


    var left = -1.0;
    var right = 1.0;
    var top = 1.0;
    var bottom = -1.0;

    var modelViewMatrixLoc, projectionMatrixLoc;
    var modelViewMatrix, projectionMatrix;
 




    function quad(a, b, c, d) {
        positionsArray.push(vertices[a]);
        colorsArray.push(vertexColors[a]);
        positionsArray.push(vertices[b]);
        colorsArray.push(vertexColors[a]);
        positionsArray.push(vertices[c]);
        colorsArray.push(vertexColors[a]);
        positionsArray.push(vertices[a]);
        colorsArray.push(vertexColors[a]);
        positionsArray.push(vertices[c]);
        colorsArray.push(vertexColors[a]);
        positionsArray.push(vertices[d]);
        colorsArray.push(vertexColors[a]);
    }

    function colorCube() {
        quad(1, 0, 3, 2);
        quad(2, 3, 7, 6);
        quad(3, 0, 4, 7);
        quad(6, 5, 1, 2);
        quad(4, 5, 6, 7);
        quad(5, 4, 0, 1);
    }


    window.onload = function init() {
        canvas = document.getElementById("gl-canvas");

        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");

        gl.viewport(0, 0, canvas.width, canvas.height);

        aspect =  canvas.width/canvas.height;

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);




        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        

        colorCube();

        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

        var colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

        // Button handlers for moving the camera
        document.getElementById("Button1").onclick = function() {eye[0] += 0.1 }; 
        document.getElementById("Button2").onclick = function() {eye[0] -= 0.1 }; 
        document.getElementById("Button3").onclick = function() {eye[1] += 0.1}; 
        document.getElementById("Button4").onclick = function() {eye[1] -= 0.1 }; 
        document.getElementById("Button5").onclick = function() {eye[2] += 0.1 }; 
        document.getElementById("Button6").onclick = function() {eye[2] -= 0.1};
        document.getElementById("Perspective").onclick = function () {switchView = !switchView;
        }

        projectionMatrix = ortho(left, right, bottom, top, near, far);

        render();
    }

    var render = function() {


    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        modelViewMatrix = lookAt(eye, at, up);
        if (switchView) {
            projectionMatrix = perspective(fovy, aspect, near, far);
            console.log(switchView, "perspective");
        }
        else{
            projectionMatrix = ortho(left, right, bottom, top, near, far);

            console.log(switchView, "ortho");            
        }


        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
        requestAnimationFrame(render);
    }
}
orthoExample();
