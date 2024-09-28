"use strict";
// Establish global variables
var gl;
// Varibles for rotation
var theta = 0.0;
var thetaLoc;
// Variable to store the color uniform location
var colorLoc;
// Index varibles to control vertex buffer
var modeindex = 0;
var startindex = 0;
// Logic variables to control the rendering of the different parts of the object
var bloombit = 0;
var growbit = 0;

// Color state variables to control the color passed to the uniform
var sproutColor = [0.36, 0.25, 0.20, 1.0]; // Initial sprout color (brown)
var growColor = [0.0, 1.0, 0.0, 1.0];      // Grow color (Green)
var bloomColor = [1.0, 0.0, 0.0, 1.0];     // Bloom color (Red)

window.onload = function init() {
    // Get the canvas and WebGL context
    var canvas = document.getElementById("gl-canvas");

    // Check if WebGL is available
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL 2.0 isn't available");
        return; // Stop execution if WebGL is not available
    }

    // Vertices for the object
    var vertices = [
        // Sprout
        vec2(-0.1, -1), vec2(0.1, -1), vec2(0.1, -0.3), vec2(-0.1, -0.3),
        // Grow
        vec2(0.1, 0.3), vec2(-0.1, 0.3), vec2(-0.1, -1), vec2(0.1, -1),
        vec2(-0.3, 0), vec2(-0.1, -0.1), vec2(-0.1, 0.1),
        vec2(0.3, -0.5), vec2(0.1, -0.4), vec2(0.1, -0.6),
        // Bloom
        vec2(-0.5, 0.3), vec2(0, 0), vec2(0.5, 0.3), vec2(0, 0.5)
    ];

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the vertex data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variable with our data buffer
    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // Set up the uniform variable for the rotation angle
    thetaLoc = gl.getUniformLocation(program, "uTheta");
    
    // Get the color uniform location from vertex shader
    colorLoc = gl.getUniformLocation(program, "uColor"); 

    // Setup control click event
    document.getElementById("Controls").onclick = function (event) {
        switch (event.target.index) {
            case 0:
                // Start rendering sprout at index 0 through 3
                modeindex = 4;
                startindex = 0;
                // Reset bloom and grow bits so they do not render
                bloombit = 0;
                growbit = 0;
                render();
                break;
            case 1:
                // Start rendering grow at index 4 through 7 to render grow part
                modeindex = 4;
                startindex = 4;
                // Set bloom bit to 0 and grow bit to 1 to render grow part
                bloombit = 0;
                growbit = 1;
                render();
                break;
            case 2:
                // Start rendering grow at index 4 through 7 before rendering bloom
                modeindex = 4;
                startindex = 4;
                // Set bloom bit to 1 and grow bit to 1 to render grow and bloom part
                growbit = 1;
                bloombit = 1;
                render();
                break;
        }
    };

    // Call render after setup is complete
    render();
};

function render() {
    // Clear the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set default rotation to 0 to keep objects static
    gl.uniform1f(thetaLoc, 0);

    // Set color based on current mode and render the respective part
    if (startindex === 0) {
        gl.uniform4fv(colorLoc, sproutColor); // Set color for sprout
        gl.drawArrays(gl.TRIANGLE_FAN, startindex, modeindex); // Draw sprout vertices
    } 

    if (growbit == 1) {
        gl.uniform4fv(colorLoc, growColor); // Set color for grow part
        gl.drawArrays(gl.TRIANGLE_FAN, 4, 4); // Grow vertices
        gl.drawArrays(gl.TRIANGLE_FAN, 8, 3); // Leaf left
        gl.drawArrays(gl.TRIANGLE_FAN, 11, 3); // Leaf right
    }

    if (bloombit == 1) {
        theta += 0.1;
        gl.uniform1f(thetaLoc, theta); // Start the rotation
        gl.uniform4fv(colorLoc, bloomColor); // Set color for bloom
        gl.drawArrays(gl.TRIANGLE_FAN, 14, 4); // Draw bloom vertices
    }

    // Request the next frame
    setTimeout(function () { requestAnimationFrame(render); }, 100);
}
