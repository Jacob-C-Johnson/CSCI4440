var canvas;
var gl;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    // Define vertices as vec4 positions
    var vertices = [
        vec4(-0.5, -0.5, 0.0, 1.0),  // Bottom-left
        vec4(-0.5, 0.5, 0.0, 1.0),   // Top-left
        vec4(0.5, 0.5, 0.0, 1.0),    // Top-right
        vec4(0.5, -0.5, 0.0, 1.0)    // Bottom-right
    ];

    // Set explicit colors for each corner to ensure the intended output
    var colors = [
        vec4(0.0, 0.0, 1.0, 1.0),  // Bottom-left: Blue
        vec4(0.0, 1.0, 0.0, 1.0),  // Top-left: Green
        vec4(1.0, 0.0, 0.0, 1.0),  // Top-right: Red
        vec4(1.0, 1.0, 1.0, 1.0)   // Bottom-right: White
    ];

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load position data into the GPU
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // Load color data into the GPU
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var aColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
