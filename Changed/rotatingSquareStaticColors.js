window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    var gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("WebGL 2.0 isn't available");
    }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vertices = [
        vec2(.5, .5),
        vec2(.5, -.5),
        vec2(-.5, -.5),
        vec2(-.5, .5)
    ];

    var colors = [
        vec4(1.0, 1.0, 0.0, 1.0),  // Red
        vec4(1.0, 0.0, 1.0, 1.0),  // Green
        vec4(0.0, 0.0, 1.0, 1.0),  // Blue
        vec4(1.0, 1.0, 0.0, 1.0)   // Yellow
    ];

    // Load the vertex data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate shader variables with our data buffer
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Pass the colors to the fragment shader
    var colorLoc = gl.getUniformLocation(program, "uColors");
    gl.uniform4fv(colorLoc, flatten(colors));

    var thetaLoc = gl.getUniformLocation(program, "uTheta");

    // Initialize the rotation angle
    var theta = 0.0;

    // Render function
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Update the rotation angle
        theta += -0.005;
        gl.uniform1f(thetaLoc, theta);

        // Draw the square
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // Request the next frame
        requestAnimationFrame(render);
    }

    // Start rendering
    render();
};