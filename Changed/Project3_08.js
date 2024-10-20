"use strict";

var canvas;
var gl;

// project variables
var awake = 0;
var power = 0;
var light = 0;
var animationActive = false;
var movingRight = true;
var pulseAnimationActive = false; 
var increasing = true; 

var numTimesToSubdivide = 6;

var index = 0;

var positionsArray = [];
var normalsArray = [];

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(0.7, 0.3, 0.9, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var nMatrix, nMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var firstSphere = vec3(-1.5, 0.0, 0.0);
var secondSphere = vec3(1.5, 0.0, 0.0);

function triangle(a, b, c) {

     positionsArray.push(a);
     positionsArray.push(b);
     positionsArray.push(c);

          // normals are vectors

     normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
     normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
     normalsArray.push(vec4(c[0],c[1], c[2], 0.0));


     index += 3;
}


function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( normalLoc);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    document.getElementById("Awakening").onclick = function(event) {
        awake = 1 - awake;
        if(awake){
            materialDiffuse = vec4(0.0, 0.9, 0.3, 1.0);
        }
        else{
            materialDiffuse = vec4(0.7, 0.3, 0.9, 1.0);
        }
        var diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), flatten(diffuseProduct));
    };

    let pulseIntervalId = null; // Store the interval ID for toggling
    let increasing = true; // Track if values are increasing or decreasing
    document.getElementById("Power").onclick = function () {
        power = 1 - power; // Toggle power state
        if (power) {
            pulseAnimationActive = true; // Start pulsing
            pulseDiffuse(); // Begin the animation
        } else {
            pulseAnimationActive = false; // Pause pulsing
        }
    };

    document.getElementById("Seeking").onclick = function(event) {
        light = 1 - light; // Toggle power state

        if (light) {
            animationActive = true; // Start the animation
            animateLight(); // Begin animating the light
        } else {
            animationActive = false; // Pause the animation
        }
    };

    document.getElementById("Focused").onclick = function(event) {
        
    };

    gl.uniform4fv(gl.getUniformLocation(program,
       "uAmbientProduct"),flatten(ambientProduct));

    gl.uniform4fv(gl.getUniformLocation(program,
       "uDiffuseProduct"),flatten(diffuseProduct));

    gl.uniform4fv(gl.getUniformLocation(program,
       "uSpecularProduct"),flatten(specularProduct));

    gl.uniform4fv(gl.getUniformLocation(program,
       "uLightPosition"),flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program,
       "uShininess"),materialShininess);

    render();
    
    function pulseDiffuse() {
        if (!pulseAnimationActive) return; // Stop if animation is inactive

        // Adjust the material diffuse values
        for (let i = 0; i < 3; i++) {
            if (increasing) {
                materialDiffuse[i] = Math.min(1.0, materialDiffuse[i] + 0.01); // Increase
            } else {
                materialDiffuse[i] = Math.max(0.0, materialDiffuse[i] - 0.01); // Decrease
            }
        }

        // Reverse direction when reaching limits
        if (materialDiffuse[0] === 1.0) increasing = false;
        if (materialDiffuse[0] === 0.0) increasing = true;

        // Send the updated values to the shader
        const diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), flatten(diffuseProduct));

        // Request the next animation frame
        requestAnimationFrame(pulseDiffuse);
    }

    function animateLight() {
        if (!animationActive) return; // Stop if animation is inactive
    
        // Move the light along the x-axis
        if (movingRight) {
            lightPosition[0] = Math.min(2.0, lightPosition[0] + 0.01); // Move right
        } else {
            lightPosition[0] = Math.max(-2.0, lightPosition[0] - 0.01); // Move left
        }
    
        // Reverse direction at the boundaries
        if (lightPosition[0] === 2.0) movingRight = false;
        if (lightPosition[0] === -2.0) movingRight = true;
    
        // Send the updated light position to the shader
        gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition));
    
        // Request the next frame
        requestAnimationFrame(animateLight);
    }
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));


    var ViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // First Sphere
    var sphereMatrix = translate(firstSphere[0], firstSphere[1], firstSphere[2]);
    var modelViewMatrix = mult(ViewMatrix, sphereMatrix);
    nMatrix = normalMatrix(modelViewMatrix, true );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix) );

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );


    // second sphere
    var sphere2Matrix = translate(secondSphere[0], secondSphere[1], secondSphere[2]);
    var modelViewMatrix = mult(ViewMatrix, sphere2Matrix);
    nMatrix =normalMatrix(modelViewMatrix, true );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix) );

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    requestAnimationFrame(render);
}

