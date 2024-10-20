"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 5;

var index = 0;

var pointsArray = [];
var normalsArray = [];

var near = -10;
var far = 10;
var radius = 1.5;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI / 180.0;

var renderCount = 0;

var col1Check = false;
var col2Check = false;
var col3Check = false;


var col1 = vec4(.84, .31, 1, 1);
var col2 = vec4(.54, .71, 1, 1);

var col3a = vec4(.4, 1, .6, 1);
var col3b = vec4(.24, .71, .8, 1);

var pulseCheck = false;

var squintCheck = false;
var SqueezeCheck = false;

var chi = 0.0;
var delta;

var lr = false;
var ud = false;
var fb = false;

var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;


var va = vec4(0., 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
var lightPositionLoc;

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var diffuseProduct;
var diffuseProductLoc;

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {

    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal);

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    index += 3;
}

function divideTriangle(a, b, c, count) {

    if (count > 0) {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

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

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");



    document.getElementById("Controls3").onclick = function (event) {
        switch (event.target.index) {
            case 0:
                lr = true;
                ud = false;
                fb = false;
                break;
            case 1:
                lr = false;
                ud = true;
                fb = false;
                break;
            case 2:
                lr = false;
                ud = false;
                fb = true;
                break;
            case 3:
                lr = false;
                ud = false;
                fb = false;
                lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
                break;
        }
    };
    document.getElementById("Controls4").onclick = function (event) { //colors
        switch (event.target.index) {
            case 0:
                pulseCheck = false;
                col1Check=true;
                col2Check =false;
                coll3Check= false;  


                init();
                break;
            case 1:
                pulseCheck = false;
                col1Check=false;
                col2Check =true;
                coll3Check= false;  

                init();
                break;

            case 2:
                pulseCheck = false;
                col1Check=false;
                col2Check =false;
                coll3Check= true;  
              
                init();
                break;


            case 3:
                pulseCheck = true;
                init();
                break;

        }
    };
    document.getElementById("Controls5").onclick = function (event) {
        switch (event.target.index) {
            case 0:
                squintCheck = true;
                SqueezeCheck = false;
                break;
            case 1:
                squintCheck = false;
                SqueezeCheck = true;
                break;

            case 2:
                squintCheck = false;
                SqueezeCheck = false;
                break;


        }
    };


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    // gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    // gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    renderCount++
    render();
}

function render() {

    chi += (.1 / renderCount);
    delta = Math.sin(chi);
    if (lr) {

        lightPosition[0] = Math.sin(chi);
    }
    if (ud) {
        lightPosition[1] = Math.sin(chi);
    }
    if (fb) {
        lightPosition[0] = -Math.sin(chi);
        lightPosition[1] = Math.sin(chi);
    }
    if (col1Check){
        materialDiffuse = col1;
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    }
    if (col2Check){
        materialDiffuse = col2;
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    }
    if (col3Check){
        materialDiffuse = col3a;
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    }
    if (pulseCheck) {
        materialDiffuse = vec4(delta, .6, .8, 1);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, diffuseProduct);

    }



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));


    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
    if (squintCheck) {
        modelViewMatrix = mult(modelViewMatrix, scalem((.2 * delta) + .8, 1, 1));
    }
    if (SqueezeCheck) {
        modelViewMatrix = mult(modelViewMatrix, scalem(1, (.2 * delta) + .8, 1));
    }

    gl.uniform4fv(lightPositionLoc, lightPosition);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    projectionMatrix = mult(projectionMatrix, translate(1.25, 0, 0));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    for (var i = 0; i < index; i += 3)
        gl.drawArrays(gl.TRIANGLES, i, 3);

    

    projectionMatrix = mult(projectionMatrix, translate(-2.5, 0, 0));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
    if (pulseCheck){

        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    }
    
    for (var i = 0; i < index; i += 3) //sphere on left
    gl.drawArrays(gl.TRIANGLES, i, 3);
    

    window.requestAnimFrame(render);
}
