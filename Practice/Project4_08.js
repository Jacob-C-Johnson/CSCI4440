"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

// Trick 1 varibles
var trick1 = false;
var swinging = true;

// Trick 2 varibles
var trick2 = false;
var nodding = true;
var kicking = true;

// Trick 3 varibles
var trick3 = false;
var twisting = true;
var jumpHeight = 0;
var jumping = true;

// Trick 4 varibles
var trick4 = false;

// Axis varibles for initNodes
var arms2 = vec3(0, 0, 1); // figure 2 arms
var head2 = vec3(1, 0, 0); // figure 2 head
var legAxis = vec3(0, 0, 1); // figure 1 legs
var armAxis = vec3(0, 0, 1); // figure 1 arms

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

// figure 1 theta indexes
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

// Figure 2 theta indexes
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

// Both figures share same original sizing until scaling in the initNodes function
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

// Theta positions for figure 1 and figure 2
var theta = [
    180, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, // Figure 1 thetas
    180, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0  // Figure 2 thetas
];

var stack = [];

// Array of nodes for figure 1 and figure 2
var figure = [];

// Starting color and lighting values
var normalsArray = [];
var lightPosition = vec4(10.0, 5.0, 10.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

// Lighting varibles
var ambientProduct, diffuseProduct, specularProduct;
var lightPositionLoc, diffuseProductLoc, ambientProductLoc, specularProductLoc, shininessLoc;

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

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

    // Figure 1 case statements
    case torsoId:
    
    m = mult(m,translate(-4.0, jumpHeight - 0.8, 0.0)); // Move figure 1 to the left and down to match fig 2
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
	  m = mult(m, rotate(theta[leftUpperArmId], armAxis)); // Axis parameter
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperArmId], armAxis)); // Axis parameter
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], legAxis)); // Axis parameter
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], legAxis)); // Axis parameter
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
    m = mult(m, rotate(theta[leftLowerLegId],vec3(0, 0, 1))); // Changed to Z axis for trick 3
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(0, 0, 1))); // Changed to Z axis for trick 3
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
    
    // Figure 2 case statements
    case torsoId2:
    m = mult(m,translate(4.0, -2.0, 0.0)); // Move figure 2 to the right and down
    m = mult(m, rotate(theta[torsoId2], vec3(0, 1, 0)));
    m = mult(m,scale(1.2, 0.8, 1.2)); // Wide and short scaling
    figure[torsoId2] = createNode(m, torso, null, headId2);        
    break;

    case headId2:
    case head1Id2:
    case head2Id2:
    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
    m = mult(m, rotate(theta[head1Id2], head2)) // Axis parameter
    m = mult(m, rotate(theta[head2Id2], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId2] = createNode( m, head, leftUpperArmId2, null);
    break;

    case leftUpperArmId2:
    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
    m = mult(m, rotate(theta[leftUpperArmId2], arms2)); // Axis parameter
    figure[leftUpperArmId2] = createNode( m, leftUpperArm, rightUpperArmId2, leftLowerArmId2 );
    break;

    case rightUpperArmId2:
    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
    m = mult(m, rotate(theta[rightUpperArmId2], arms2)); // Axis parameter
    figure[rightUpperArmId2] = createNode( m, rightUpperArm, leftUpperLegId2, rightLowerArmId2 );
    break;

    case leftUpperLegId2:
    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
    m = mult(m , rotate(theta[leftUpperLegId2], arms2)); // Axis parameter
    figure[leftUpperLegId2] = createNode( m, leftUpperLeg, rightUpperLegId2, leftLowerLegId2 );
    break;

    case rightUpperLegId2:
    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightUpperLegId2], arms2)); // Axis parameter
    figure[rightUpperLegId2] = createNode( m, rightUpperLeg, null, rightLowerLegId2 );
    break;

    case leftLowerArmId2:
    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId2], arms2)); // Axis parameter
    figure[leftLowerArmId2] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId2:
    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId2], arms2)); // Axis parameter
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
    // From shaded cube calculate normal and push to normal array
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
    gl.clearColor( 0.5, 0.6, 0.7, 1 ); // Canvas color is a light blue

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

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));

    // Button event listeners
    document.getElementById("reset").onclick = function() { 
        resetFigures();
        trick1 = false;
        trick2 = false;
        trick3 = false;
        trick4 = false;
    };

    document.getElementById("trick1").onclick = function() {
        trick1 = !trick1;
        trick2 = false;
        trick3 = false;
        trick4 = false;
        resetFigures();
    };

    document.getElementById("trick2").onclick = function() {
        trick1 = false;
        trick2 = !trick2;
        trick3 = false;
        trick4 = false;
        resetFigures();
    };

    document.getElementById("trick3").onclick = function() {
        trick1 = false;
        trick2 = false;
        trick3 = !trick3;
        trick4 = false;
        resetFigures();
    };

    document.getElementById("trick4").onclick = function() {
        trick1 = false;
        trick2 = false;
        trick3 = false;
        trick4 = !trick4;
        resetFigures();
    }

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );

        if(trick1) { 
            // Spin the first figure
            theta[torsoId] = (theta[torsoId ] + 2) % 360;
            initNodes(torsoId);

            // Spin the second figures arms in a wave motion
            if  (swinging) {
                // Change axis to y axis for the wave motion
                arms2 = vec3(0, 1, 0);
                theta[leftUpperArmId2] += 2; 
                theta[rightUpperArmId2] += 2;
                // Change axis to z axis for the wave motion 
                arms2 = vec3(0, 0, 1);
                theta[leftLowerArmId2] += 2; 
                theta[rightLowerArmId2] += 2; 
            } else {
                // Change axis to y axis for the wave motion
                arms2 = vec3(0, 1, 0);
                theta[leftUpperArmId2] -= 2; 
                theta[rightUpperArmId2] -= 2; 
                // Change axis to z axis for the wave motion
                arms2 = vec3(0, 0, 1);
                theta[leftLowerArmId2] -= 2; 
                theta[rightLowerArmId2] -= 2;
            }

            // Initialize each node after updating theta
            initNodes(leftUpperArmId2);
            initNodes(rightUpperArmId2);
            initNodes(leftLowerArmId2);
            initNodes(rightLowerArmId2);

            // Check for limit angles to reverse direction
            if (theta[leftUpperArmId2] <= -90 || theta[leftUpperArmId2] >= 90) swinging = !swinging;
            if (theta[leftLowerArmId2] >= 270 || theta[leftLowerArmId2] <= 90) swinging = !swinging;

        }

        if(trick2) {
            // Kick first figures legs side to side
            legAxis = vec3(0, 0, 1); // Change leg axis to Z axis for the side to side motion
            if (kicking) {
                theta[leftUpperLegId] -= 2;
                theta[rightUpperLegId] -= 2;
            }
            else {
                theta[leftUpperLegId] += 2;
                theta[rightUpperLegId] += 2;
            }
            // Apply transformations to leg nodes after updating theta
            initNodes(leftUpperLegId);
            initNodes(rightUpperLegId);

            // Check for max angle to reverse direction
            if (theta[rightUpperLegId] <= 140) kicking = !kicking;
            if (theta[rightUpperLegId] >= 220) kicking = !kicking;

            // Wave second figures arms
            armAxis = vec3(0, 0, 1); // Adjust axis for arms
            if (swinging) { 
                theta[leftUpperArmId] -= 2;
                theta[rightUpperArmId] -= 2;
            }
            else {
                theta[leftUpperArmId] += 2;
                theta[rightUpperArmId] += 2;
            }
            // Apply transformations to arm nodes after updating theta
            initNodes(leftUpperArmId);
            initNodes(rightUpperArmId);

            // Check for max angle to reverse direction
            if (theta[leftUpperArmId] <= 140) swinging = !swinging;
            if (theta[leftUpperArmId] >= 220) swinging = !swinging;
            

            // Nod second figure's head back and fourth
            head2 = vec3(0, 0, 1);
            if (nodding){
                theta[head1Id2] += 2;
            }
            else {
                theta[head1Id2] -= 2;
            }

            // Apply transformations to head nodes after updating theta
            initNodes(head1Id2);

            // Check for max angle to reverse direction
            if (theta[head1Id2] <= -65 || theta[head1Id2] >= 65) nodding = !nodding;
        }

        if (trick3) {
            // Figure 1 jumps
            if (jumping) {
                jumpHeight += 0.05;
                
                // Gradually bend legs as character approaches the peak of the jump
                if (jumpHeight >= 1.5) {
                    if (theta[leftUpperLegId] > 0.0) {
                        theta[leftUpperLegId] -= 0.5; // Bend upper leg
                    }
                    if (theta[rightUpperLegId] > 0.0) {
                        theta[rightUpperLegId] -= 0.5;
                    }
                    if (theta[leftLowerLegId] > -25) {
                        theta[leftLowerLegId] -= 0.5; // Bend lower leg
                    }
                    if (theta[rightLowerLegId] > -25) {
                        theta[rightLowerLegId] -= 0.5;
                    }
                }
            } else {
                jumpHeight -= 0.05;
    
                // Gradually straighten legs as character returns to the ground
                if (jumpHeight <= 0.5) {
                    if (theta[leftUpperLegId] < 180) {
                        theta[leftUpperLegId] += 0.5; // Straighten upper leg
                    }
                    if (theta[rightUpperLegId] < 180) {
                        theta[rightUpperLegId] += 0.5;
                    }
                    if (theta[leftLowerLegId] > 180) {
                        theta[leftLowerLegId] += 0.5; // Straighten lower leg
                    }
                    if (theta[rightLowerLegId] > 180) {
                        theta[rightLowerLegId] += 0.5;
                    }
                }
            }

            // Apply transformations to leg nodes after updating theta
            initNodes(torsoId);
            initNodes(leftUpperLegId);
            initNodes(rightUpperLegId);
            initNodes(leftLowerLegId);
            initNodes(rightLowerLegId);

            // Check for max height to reverse direction
            if (jumpHeight >= 2.0) jumping = false; // Max jump height
            if (jumpHeight <= 0.0) jumping = true;  // Return to ground level


            // Figure 2 twists its torso
            if (twisting) {
                theta[torsoId2] += 1; 
            } else {
                theta[torsoId2] -= 1;
            }

            // Apply transformations to torso node after updating theta
            initNodes(torsoId2);

            // Check for max angle to reverse direction
            if (theta[torsoId2] >= 215) twisting = false; 
            if (theta[torsoId2] <= 145) twisting = true; 
        }

        if (trick4) { 
            // figure 1 raises his arms  and starts jumping

            // left upper arm to 0
            if (theta[leftUpperArmId] > 0) { theta[leftUpperArmId] -= 0.5; }
            // right upper arm to 170
            if (theta[rightUpperArmId] > 160) { theta[rightUpperArmId] -= 0.5; }
            
            // make figure jump
            if (jumping) {
                jumpHeight += 0.05;
            }
            else {
                jumpHeight -= 0.05;
            }

            // Check for max height to reverse direction
            if (jumpHeight >= 2.0) jumping = false;
            if (jumpHeight <= 0.0) jumping = true;

            // Apply transformations to nodes after updating theta
            initNodes(torsoId);
            initNodes(leftUpperArmId);
            initNodes(rightUpperArmId);

            // figure 2 arms cross he shakes his head and rotates his torso
            arms2 = vec3(0, 0, 1); // Adjust axis for arms
            if (theta[leftUpperArmId2] > 135) { theta[leftUpperArmId2] -= 0.5; } // Cross left arm
            if (theta[rightUpperArmId2] < 225) { theta[rightUpperArmId2] += 0.5; } // Cross right arm

            // Apply transformations to nodes after updating theta
            initNodes(leftUpperArmId2);
            initNodes(rightUpperArmId2);

            // Head shake on Y axis to give the 'no' appearence
            head2 = vec3(0, 1, 0); 
            if (nodding){
                theta[head1Id2] += 2;
            }
            else {
                theta[head1Id2] -= 2;
            }

            // Apply transformations to head nodes after updating theta
            initNodes(head1Id2);

            // Check for max angle to reverse direction
            if (theta[head1Id2] <= -45 || theta[head1Id2] >= 45) nodding = !nodding;

        }

        // Add Material colors and lighting to the figures

        materialDiffuse = vec4(1.0, 0.2, 0.8, 1.0); // Purple color for the first figure
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
        traverse(torsoId); // Render the first figure

        materialDiffuse = vec4(0.2, 0.2, 0.7, 1.0); // Blue color for the second figure
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
        traverse(torsoId2); // Render the second figure

        requestAnimationFrame(render);
}

// Reset all figures to their original positions
function resetFigures() {
    // Reset axis varibles to originals
    arms2 = vec3(0, 0, 1);
    head2 = vec3(1, 0, 0);
    legAxis = vec3(0, 0, 1);
    jumpHeight = 0;
    armAxis = vec3(0, 0, 1);
 
    // reset figure angles and reinitialize nodes
    theta = [
        180, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0,
        180, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0
    ];
    for(i=0; i<numNodes; i++) initNodes(i);
}
