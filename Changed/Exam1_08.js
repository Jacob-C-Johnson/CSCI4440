"use strict";

var gl;

var theta = 0.0;
var toggle = 0;
var thetaLoc;

var speed = 0.02;

var posColor = -1.0;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vertices = [
        // triangle 1
        vec3( 0.1, 0.1, 0.0),
        vec3( 0.8, 0.1, 0.0),
        vec3( 0.1, 0.8, 0.0),
        // triangle 2
        vec3( -0.1, -0.1, 0.0),
        vec3( -0.8, -0.1, 0.0),
        vec3( -0.1, -0.8, 0.0)        

    ];

    var colors = [
        vec4( 1.0, 0.0, 0.0, 1.0),  // red
        vec4( 0.0, 0.0, 1.0, 1.0),  // blue
        vec4( 0.0, 1.0, 0.0, 1.0),  // green
        vec4( 0.0, 1.0, 1.0, 1.0), // cyan 
        vec4( 1.0, 0.0, 1.0, 1.0),  // magenta
        vec4( 1.0, 1.0, 0.0, 1.0)  // yellow
    ];

    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation( program, "uTheta" );

    // Get posColor location
    var posColorLoc = gl.getUniformLocation(program, "uPosColor");

    // Load color data into the GPU
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var aColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    // Initialize event handlers
    document.getElementById("Color").onclick = function () {
        posColor = -posColor;
        if (posColor == -1) {
            gl.uniform1f(posColorLoc, 0.0);
        }
        else {
            gl.uniform1f(posColorLoc, 1.0);
        }
    };

    document.getElementById("Controls" ).onclick = function(event) {
        switch(event.target.index) {
         case 0:
            // set toggle value to oppisite of current value
            if (toggle == 1) {
                toggle = 0;
            }
            else {
                toggle = 1;
            }
            break;
         case 1:
            // invert the direction of rotation
            speed = -speed;
            break;
         case 2:
            // speeds theta up
            speed += 0.02;

            break;
         case 3:
            // slows theta down
            speed -= 0.02;
            break;
		}
    };

    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += speed * toggle;
	gl.uniform1f(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    gl.drawArrays(gl.TRIANGLE_STRIP, 3, 3);

	requestAnimationFrame(render);

 }
