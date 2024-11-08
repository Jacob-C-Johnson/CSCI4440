"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var spin = false;
var spin2 = false;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

// figure 1
var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

// Figure 2
var torsoId2 = 11;
var headId2 = 12;
var head1Id2 = 12;
var head2Id2 = 21;
var leftUpperArmId2 = 13;
var leftLowerArmId2 = 14;
var rightUpperArmId2 = 15;
var rightLowerArmId2 = 16;
var leftUpperLegId2 = 17;
var leftLowerLegId2 = 18;
var rightUpperLegId2 = 19;
var rightLowerLegId2 = 20;

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 2.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.2;

// number of nodes and angles for figure 1 and 2
var numNodes = 22;
var numAngles = 22;
var angle = 0;

// Adjusted theta values for figure 1 and 2
var theta = [
    0, 0, -180, 0, -180, 0, 180, 0, 180, 0, 0,
    0, 0, -180, 0, -180, 0, 180, 0, 180, 0, 0
];

var stack = [];

// Array of nodes for figure 1 and figure 2
var figure = [];

// All things color related
var normalsArray = [];
var lightPosition = vec4(5.0, 5.0, 5.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var ambientProduct, diffuseProduct, specularProduct;
var lightPositionLoc, diffuseProductLoc, ambientProductLoc, specularProductLoc, shininessLoc;

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:
    
    
    m = mult(m,translate(-5.0, 0.0, 0.0)); // Move figure 1 to the left
    m = mult(m, rotate(theta[torsoId], vec3(0, 1, 0)));
    m = mult(m,scale(0.5, 1.1, 0.5)); // Thin and tall scaling

    figure[torsoId] = createNode(m, torso, null, headId);
    break;
 
    case headId:
    case head1Id:
    case head2Id:


    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	  m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
	  m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    case leftUpperArmId:

    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
    
    // Figure 2 case statements
    case torsoId2:
    m = mult(m,translate(5.0, 0.0, 0.0)); // Move figure 2 to the right
    m = mult(m, rotate(theta[torsoId2], vec3(0, 1, 0)));
    m = mult(m,scale(1.2, 0.8, 1.2)); // Wide and short scaling
    figure[torsoId2] = createNode(m, torso, null, headId2);        
    break;

    case headId2:
    case head1Id2:
    case head2Id2:
    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
    m = mult(m, rotate(theta[head1Id2], vec3(1, 0, 0)))
    m = mult(m, rotate(theta[head2Id2], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId2] = createNode( m, head, leftUpperArmId2, null);
    break;

    case leftUpperArmId2:
    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
    m = mult(m, rotate(theta[leftUpperArmId2], vec3(1, 0, 0)));
    figure[leftUpperArmId2] = createNode( m, leftUpperArm, rightUpperArmId2, leftLowerArmId2 );
    break;

    case rightUpperArmId2:
    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
    m = mult(m, rotate(theta[rightUpperArmId2], vec3(1, 0, 0)));
    figure[rightUpperArmId2] = createNode( m, rightUpperArm, leftUpperLegId2, rightLowerArmId2 );
    break;

    case leftUpperLegId2:
    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
    m = mult(m , rotate(theta[leftUpperLegId2], vec3(1, 0, 0)));
    figure[leftUpperLegId2] = createNode( m, leftUpperLeg, rightUpperLegId2, leftLowerLegId2 );
    break;

    case rightUpperLegId2:
    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightUpperLegId2], vec3(1, 0, 0)));
    figure[rightUpperLegId2] = createNode( m, rightUpperLeg, null, rightLowerLegId2 );
    break;

    case leftLowerArmId2:
    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId2], vec3(1, 0, 0)));
    figure[leftLowerArmId2] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId2:
    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId2], vec3(1, 0, 0)));
    figure[rightLowerArmId2] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId2:
    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId2],vec3(1, 0, 0)));
    figure[leftLowerLegId2] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId2:
    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId2], vec3(1, 0, 0)));
    figure[rightLowerLegId2] = createNode( m, rightLowerLeg, null, null );
    break;



    }

}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
    // From shaded cube
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 0.5 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();
    // From shaded cube to create normal buffer and location
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);


    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    // From shaded cube mults
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    // Location varibles
    ambientProductLoc = gl.getUniformLocation(program, "uAmbientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "uDiffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "uSpecularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "uLightPosition");
    shininessLoc = gl.getUniformLocation(program, "uShininess");


    // From shaded cube send to vertex shader
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(shininessLoc, materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"),
       false, flatten(projectionMatrix));
    
    
    document.getElementById("slider0").onchange = function(event) {
        theta[torsoId ] = event.target.value;
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function(event) {
        theta[head1Id] = event.target.value;
        initNodes(head1Id);
    };
    document.getElementById("slider2").onchange = function(event) {
         theta[leftUpperArmId] = event.target.value;
         initNodes(leftUpperArmId);
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[leftLowerArmId] =  event.target.value;
         initNodes(leftLowerArmId);
    };

        document.getElementById("slider4").onchange = function(event) {
        theta[rightUpperArmId] = event.target.value;
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").onchange = function(event) {
         theta[rightLowerArmId] =  event.target.value;
         initNodes(rightLowerArmId);
    };
        document.getElementById("slider6").onchange = function(event) {
        theta[leftUpperLegId] = event.target.value;
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").onchange = function(event) {
         theta[leftLowerLegId] = event.target.value;
         initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").onchange = function(event) {
         theta[rightUpperLegId] =  event.target.value;
         initNodes(rightUpperLegId);
    };
        document.getElementById("slider9").onchange = function(event) {
        theta[rightLowerLegId] = event.target.value;
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider10").onchange = function(event) {
         theta[head2Id] = event.target.value;
         initNodes(head2Id);
    };


    document.getElementById("reset").onclick = function() { 
        theta = [
            0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0,
            0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0
        ];
        for(i=0; i<numNodes; i++) initNodes(i);
    };

    document.getElementById("spin").onclick = function() {
        spin = !spin;
    };

    document.getElementById("color").onclick = function() {
        spin2 = !spin2;
    };

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );
        if(spin) { 
            theta[torsoId] = (theta[torsoId ] + 2) % 360;
            initNodes(torsoId);
        }
        materialDiffuse = vec4(1.0, 0.2, 0.8, 1.0); // Purple color for the first figure
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
        traverse(torsoId); // Render the first figure


        if(spin2) {
            theta[torsoId2] = (theta[torsoId2] + 2) % 360;
            initNodes(torsoId2);
        }

        materialDiffuse = vec4(0.2, 0.2, 0.7, 1.0); // Blue color for the second figure
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
        traverse(torsoId2); // Render the second figure

        requestAnimationFrame(render);
}
