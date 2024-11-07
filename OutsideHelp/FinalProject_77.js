"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;
var instanceMatrix;
var modelViewMatrixLoc;

var pause = false;
var returnTo=0;
var reset = false;

var t = 0;
var a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

var aspect;
var walk =0;
var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];
// Initialize the red variable with a random value
let red, green, blue = Math.random();

// Set up an interval to update the red variable every second
setInterval(function() {
    red = Math.random();
    green = Math.random();
    blue = Math.random();
}, Math.random()*1500);

var lightPosition = vec4(-6, 8, 6, 1);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, .3, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1., 1.0, 1.0);
var materialSpecular = vec4(1.0, 1., 1.0, 1.0);
var materialShininess = 100.3;

var normalMatrix, normalMatrixLoc;

var ambientProduct, ambientProductLoc;
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;
var lightPositionLoc;
var shininessLoc;

var torsoId = 0;
var headId = 1;
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

var floorId = 22;
var tableLegId = 23;
var tableId = 24;
var cake1Id = 25
var cake2Id = 26
var drink1Id = 27;
var drink2Id = 28;

var torsoHeight = 5.0;
var torsoWidth = 2.0;
var upperArmHeight = 2.0;
var lowerArmHeight = 1.8;
var upperArmWidth = 0.7;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.7;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;

var numNodes = 29;
var numAngles = 29;

var theta = [
    90, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0,
    -90, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0
];

var stack = [];
var figure = [];

var character = 0;
var food = 0;

var returnToFoodCount=0;
var foodCount = 2;
var returnToDrinkCount=0;
var drinkCount = 2;

var anim = 0;

var numVertices = 36;
var texSize = 256;
var numChecks = 16;

var textureA, textureB;

var imageA = new Uint8Array(4 * texSize * texSize);
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i / (texSize / numChecks));
        var patchy = Math.floor(j / (texSize / numChecks));
        if (patchx % 2 ^ patchy % 2) {
            c = 255;
        } else c = 0;
        // c = 255*(((i & 0x8) == 0) ^ ((j & 0x8) == 0));

        imageA[4 * i * texSize + 4 * j] = c;
        imageA[4 * i * texSize + 4 * j + 1] = c;
        imageA[4 * i * texSize + 4 * j + 2] = c;
        imageA[4 * i * texSize + 4 * j + 3] = 255;
    }
}
var imageB = new Uint8Array(4 * texSize * texSize);
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i / (texSize / numChecks));
        var patchy = Math.floor(j / (texSize / numChecks));
        if (patchx % 2 ^ patchy % 2) {
            c = 255;
        } else c = 0;
        // c = 255*(((i & 0x8) == 0) ^ ((j & 0x8) == 0));

        imageB[4 * i * texSize + 4 * j] = 255;
        imageB[4 * i * texSize + 4 * j + 1] = 255;
        imageB[4 * i * texSize + 4 * j + 2] = 255;
        imageB[4 * i * texSize + 4 * j + 3] = 255;
    }
}

var c;

var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

function configureTexture() {
    textureA = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageA);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    textureB = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureB);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageB);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

}

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;

var pointsArray = [];
var normalsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

var torsoCoords = [-6, -6]
var c1Coords = [.5, -1.45, -6.8, 1]
var c2Coords = [-.5, -1.45, -6.8, 1]
var t1Coords = [.5, -1.45, -4.5, 1]
var t2Coords = [-.5, -1.45, -4.5, 1]

var size = [1, 1]

const HSLToRGB = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0),f(8), f(4)];
  };

function initNodes(Id) {

    var m = mat4();

    switch (Id) {

        case torsoId:
            m = rotate(theta[torsoId], 0, 1, 0);
            m = mult(m, translate(6, -5, torsoCoords[0]));
            m = mult(m, scale4(size[0], size[0], size[0]))
            // Translate here
            figure[torsoId] = createNode(m, torso, null, headId);
            break;
        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(theta[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperArmId, null);
            break;
        case leftUpperArmId:
            m = translate(-(torsoWidth / 1.5), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;
        case rightUpperArmId:
            m = translate(torsoWidth / 1.5, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
            break;
        case leftUpperLegId:
            m = translate(-(torsoWidth / 1.5), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperLegId], 1, 0, 0));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;
        case rightUpperLegId:
            m = translate(torsoWidth / 1.5, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId);
            break;
        case leftLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId], 0, 0, 1));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;
        case rightLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId], 0, 0, 1));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;
        case leftLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;
        case rightLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
            break;

        case torsoId2:
            m = rotate(theta[torsoId2], 0, 1, 0);
            m = mult(m, translate(-6, -5, torsoCoords[1]));
            m = mult(m, scale4(size[1], size[1], size[1]))

            // Translate here
            figure[torsoId2] = createNode(m, torso, null, headId2);
            break;
        case headId2:
        case head1Id2:
        case head2Id2:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(theta[head1Id2], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id2], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId2] = createNode(m, head, leftUpperArmId2, null);
            break;
        case leftUpperArmId2:
            m = translate(-(torsoWidth / 1.5), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperArmId2], 1, 0, 0));
            figure[leftUpperArmId2] = createNode(m, leftUpperArm, rightUpperArmId2, leftLowerArmId2);
            break;
        case rightUpperArmId2:
            m = translate(torsoWidth / 1.5, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperArmId2], 1, 0, 0));
            figure[rightUpperArmId2] = createNode(m, rightUpperArm, leftUpperLegId2, rightLowerArmId2);
            break;
        case leftUpperLegId2:
            m = translate(-(torsoWidth / 1.5), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperLegId2], 1, 0, 0));
            figure[leftUpperLegId2] = createNode(m, leftUpperLeg, rightUpperLegId2, leftLowerLegId2);
            break;
        case rightUpperLegId2:
            m = translate(torsoWidth / 1.5, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperLegId2], 1, 0, 0));
            figure[rightUpperLegId2] = createNode(m, rightUpperLeg, null, rightLowerLegId2);
            break;
        case leftLowerArmId2:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId2], 0, 0, 1));
            figure[leftLowerArmId2] = createNode(m, leftLowerArm, null, null);
            break;
        case rightLowerArmId2:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId2], 0, 0, 1));
            figure[rightLowerArmId2] = createNode(m, rightLowerArm, null, null);
            break;
        case leftLowerLegId2:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId2], 1, 0, 0));
            figure[leftLowerLegId2] = createNode(m, leftLowerLeg, null, null);
            break;
        case rightLowerLegId2:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId2], 1, 0, 0));
            figure[rightLowerLegId2] = createNode(m, rightLowerLeg, null, null);
            break;
        case floorId:
            m = translate(0.0, 0.0, 0.0);
            // m = mult(m, rotate(0, 1, 0, 0));
            figure[floorId] = createNode(m, floor, null, null);
            break;
        case tableLegId:
            m = translate(0.0, 0.0, 0.0);
            // m = mult(m, rotate(0, 1, 0, 0));
            figure[tableLegId] = createNode(m, tableLeg, null, tableId);
            break;
        case tableId:
            m = translate(0.0, 0.0, 0.0);
            // m = mult(m, rotate(0, 1, 0, 0));
            figure[tableId] = createNode(m, table, null, null);
            break;
        case cake1Id:
            m = translate(c1Coords[0], c1Coords[1], c1Coords[2]);
            m = mult(m, scale4(c1Coords[3], c1Coords[3], c1Coords[3]))
            // m = mult(m, rotate(0, 1, 0, 0));
            figure[cake1Id] = createNode(m, cake1, cake2Id, null);
            break;
        case cake2Id:
            m = translate(c2Coords[0], c2Coords[1], c2Coords[2]);
            m = mult(m, scale4(c2Coords[3], c2Coords[3], c2Coords[3]))
            figure[cake2Id] = createNode(m, cake2, null, null);
            break;
            // DRINKS ARE RED
        case drink1Id:
            m = translate(t1Coords[0], t1Coords[1], t1Coords[2]);
            m = mult(m, scale4(t1Coords[3], t1Coords[3], t1Coords[3]))

            // m = mult(m, rotate(0, 1, 0, 0));
            figure[drink1Id] = createNode(m, drink1, drink2Id, null);
            break;
        case drink2Id:
            m = translate(t2Coords[0], t2Coords[1], t2Coords[2]);
            m = mult(m, scale4(t2Coords[3], t2Coords[3], t2Coords[3]))

            // m = mult(m, rotate(0, 1, 0, 0));
            figure[drink2Id] = createNode(m, drink2, null, null);
            break;

    }
}

function traverse(Id) {
    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function floor() {
    instanceMatrix = mult(modelViewMatrix, translate(10.0, -10.0, 10.0));
    instanceMatrix = mult(instanceMatrix, scale4(60, 1, 80))
    // instanceMatrix = mult(instanceMatrix, scale4(0, 1, 0))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function tableLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, -5.0, -6.0));
    instanceMatrix = mult(instanceMatrix, scale4(1, 5, 1))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function table() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, -2.0, -6.0));
    instanceMatrix = mult(instanceMatrix, scale4(3, .6, 3))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function cake1() {
    instanceMatrix = mult(modelViewMatrix, translate(0, 0, 0));
    instanceMatrix = mult(instanceMatrix, scale4(.5, .5, .5))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function cake2() {
    instanceMatrix = mult(modelViewMatrix, translate(0, 0, 0));
    instanceMatrix = mult(instanceMatrix, scale4(.5, .5, .5))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function drink1() {
    instanceMatrix = mult(modelViewMatrix, translate(0, 0, 0));
    instanceMatrix = mult(instanceMatrix, scale4(.5, .5, .5))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function drink2() {
    instanceMatrix = mult(modelViewMatrix, translate(0, 0, 0));
    instanceMatrix = mult(instanceMatrix, scale4(.5, .5, .5))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

// Create each one as part of the root traversal, then animate

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[1]);

}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.86275, 0.73725, 0.82745, 1.0);
    aspect = canvas.width / canvas.height;

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    // projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
    projectionMatrix = perspective(50.0, aspect, .01, 100);
    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    configureTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureA);
    gl.uniform1i(gl.getUniformLocation(program, "Tex0"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureB);
    gl.uniform1i(gl.getUniformLocation(program, "Tex1"), 1);

    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");

    document.getElementById("Controls0").onchange = function(event) {
        switch (event.target.selectedIndex) {
            case 0:
                break;
            case 1:
                character = 1;
                break;
            case 2:
                character = 2;
                break;
        }
    };

    document.getElementById("Controls1").onchange = function(event) {
        switch (event.target.selectedIndex) {
            case 0:
                break;
            case 1:
                food = 1;
                break;
            case 2:
                food = 2;
                break;
        }
    };

    document.getElementById("CallAnim").onclick = function() {


        if (character == 1) {
            // Alice
            if (food == 1) {
                // Cake
                switch (foodCount) {
                    case 0:
                        anim = 0;
                        // Dont do animation
                        break;
                    case 1:
                        foodCount = foodCount - 1;
                        anim = 1;
                        break;
                    case 2:
                        foodCount = foodCount - 1;
                        anim = 2;
                        break;
                }
            }
            if (food == 2) {
                switch (drinkCount) {
                    case 0:
                        // Dont do animation
                        anim = 0;
                        break;
                    case 1:
                        drinkCount = drinkCount - 1;
                        anim = 3;
                        break;
                    case 2:
                        drinkCount = drinkCount - 1;
                        anim = 4;
                        break;
                }
            }
        }
        if (character == 2) {
            // Queen
            if (food == 1) {
                // Cake
                switch (foodCount) {
                    case 0:
                        anim = 0;
                        // Dont do animation
                        break;
                    case 1:
                        foodCount = foodCount - 1;
                        anim = 5;
                        break;
                    case 2:
                        foodCount = foodCount - 1;
                        anim = 6;
                        break;
                }
            }
            if (food == 2) {
                // Tonic
                switch (drinkCount) {
                    case 0:
                        // Dont do animation
                        anim = 0;
                        break;
                    case 1:
                        drinkCount = drinkCount - 1;
                        anim = 7;
                        break;
                    case 2:
                        drinkCount = drinkCount - 1;
                        anim = 8;
                        break;
                }
            }
        }

    };


    document.getElementById("reset").onclick = function() {
        document.getElementById("Controls0").selectedIndex =0;
        document.getElementById("Controls1").selectedIndex =0;

        reset= true;

    




    }
    document.getElementById("pause").onclick = function() {
        pause =!pause;
        if (pause){
            walk;
            returnTo = anim;
            returnToFoodCount= foodCount;
            returnToDrinkCount=drinkCount;
        }else if (!pause){
            anim = returnTo;
            foodCount= returnToFoodCount;
            drinkCount= returnToDrinkCount;
        }
    }


    for (i = 0; i < numNodes; i++) initNodes(i);

    render();

}

var render = function() {
    console.log("Here")

    t+=2;
    let color = HSLToRGB(t,100,50)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0); //set active texture to texture 0
    gl.bindTexture(gl.TEXTURE_2D, textureB);
    gl.uniform1i(gl.getUniformLocation(program, "Tex0"), 0);
    gl.activeTexture(gl.TEXTURE1); //set active texture to texture 1
    gl.bindTexture(gl.TEXTURE_2D, textureB);
    gl.uniform1i(gl.getUniformLocation(program, "Tex1"), 1);

    // Red
    lightAmbient = vec4(.6, .2, .2, .2);
    materialAmbient = vec4(1, 0, 0, 0);
    ambientProduct = mult(lightAmbient, materialAmbient);
    var materialShininess = 100.3;

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    
    traverse(torsoId);
    gl.uniform1f(shininessLoc, materialShininess);
    
    // Blue
    lightAmbient = vec4(0, .25, .6, 1);
    materialAmbient = vec4(.8, 1, 1, 0);
    var materialShininess = 1.3;
    ambientProduct = mult(lightAmbient, materialAmbient);

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    traverse(torsoId2);

    // Wood Color
    lightAmbient = vec4(.8,.8,.8,.8);
    materialAmbient = vec4(.6, .4, .2, 1);
    ambientProduct = mult(lightAmbient, materialAmbient);
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    traverse(tableLegId)

    lightAmbient = vec4(.6,.6,.6, 1);
    materialAmbient = vec4(color[0],color[1],color[2], 1);
    ambientProduct = mult(lightAmbient, materialAmbient);
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    traverse(cake1Id)

    lightAmbient = vec4(1, 1, 1, 1);
    materialAmbient = vec4(red, green, blue, 1);
    ambientProduct = mult(lightAmbient, materialAmbient);
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    traverse(drink1Id)

    lightAmbient = vec4(1, 1, 1, 1);
    materialAmbient = vec4(1., 1., 1, 1);
    ambientProduct = mult(lightAmbient, materialAmbient);
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.activeTexture(gl.TEXTURE0); //set active texture to texture 0
    gl.bindTexture(gl.TEXTURE_2D, textureA);
    gl.uniform1i(gl.getUniformLocation(program, "Tex0"), 0);
    gl.activeTexture(gl.TEXTURE1); //set active texture to texture 1
    gl.bindTexture(gl.TEXTURE_2D, textureA);
    gl.uniform1i(gl.getUniformLocation(program, "Tex1"), 1);

    traverse(floorId)
    modelViewMatrix = lookAt(vec3(0, 6, 10.344), vec3(0, 1.1, .5), vec3(0, 1, 0));

    if (pause){
        anim=0;
        walk;
    }
    if (reset){
        pause= false;
        a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        walk =0;
        theta = [
    90, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0,
    -90, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0];
    character = 0;
    food = 0;

    foodCount = 2;
    drinkCount = 2;
    anim = 0;
    t=0;
    torsoCoords = [-6, -6]
    c1Coords = [.5, -1.45, -6.8, 1]
    c2Coords = [-.5, -1.45, -6.8, 1]
    t1Coords = [.5, -1.45, -4.5, 1]
    t2Coords = [-.5, -1.45, -4.5, 1]
    size = [1, 1]
    traverse(torsoId)
    traverse(torsoId2)
    traverse(floorId)
    traverse(tableLegId)
    traverse(cake1Id)
    traverse(cake2Id)
    for (i = 0; i < numNodes; i++) initNodes(i);

    reset= false;
    }

    switch (anim) {
        case 0:
            walk=0;
            break;
        case 1:
            // A C 1
            if (a[1] == 0) {
                if (torsoCoords[1] < -4.4) {
                    walk +=.1

                    theta[leftUpperLegId2] =180 - Math.sin(walk)*20;
                    theta[rightUpperLegId2] = 180 + Math.sin(walk)*20;
                    initNodes(rightUpperLegId2);
                    initNodes(leftUpperLegId2);

                    torsoCoords[1] += .1;
                    initNodes(torsoId2);
                } else if (theta[leftUpperArmId2] > 100) {
                    theta[leftUpperArmId2] -= 1;
                    initNodes(leftUpperArmId2);
                } else {
                    a[1]++;
                }
            } else if (a[1] == 1) {
                if (torsoCoords[1] > -6.4) {
                    walk -=.2;
                    torsoCoords[1] -= .1;
                    c1Coords[0] += .1;

                    theta[leftUpperLegId2] =180 - Math.sin(walk)*20;
                    theta[rightUpperLegId2] = 180 + Math.sin(walk)*20;
                    initNodes(rightUpperLegId2);
                    initNodes(leftUpperLegId2);

                    initNodes(cake1Id);
                    initNodes(torsoId2);
                } else if (theta[leftUpperArmId2] > 40) {
                    theta[leftUpperArmId2] -= 1;
                    initNodes(leftUpperArmId2);
                    c1Coords[1] += .06;
                    c1Coords[0] += .02;

                    initNodes(cake1Id);
                } else if (theta[leftLowerArmId2] > -130) {
                    theta[leftLowerArmId2] -= 3.;
                    initNodes(leftLowerArmId2);

                    c1Coords[1] -= .03;
                    c1Coords[0] += .05;
                    c1Coords[3] *= .97;
                    initNodes(cake1Id);
                } else if (size[1] < 1.4) {
                    c1Coords[3] = 0.001;
                    initNodes(cake1Id);
                    size[1] += .005;
                    initNodes(torsoId2);
                } else {
                    a[1]++
                }
            } else if (a[1] == 2) {
                if (theta[leftUpperArmId2] < 180) {
                    theta[leftUpperArmId2] += 1;
                    initNodes(leftUpperArmId2);
                    theta[leftLowerArmId2] += 1.2
                    initNodes(leftLowerArmId2);

                } else {
                    theta[leftUpperArmId2] = 180;
                    initNodes(leftUpperArmId2);

                    theta[leftLowerArmId2] = 0;
                    initNodes(leftLowerArmId2);
                    a[1]++
                }
            } else if (a[1] == 3) {
                anim = 0;
            }
            break;
        case 2:
            // A C 2
            if (a[2] == 0) {
                if (torsoCoords[1] < -3.4) {
                    walk+=.1;
                    torsoCoords[1] += .02;
                    initNodes(torsoId2);

                    theta[leftUpperLegId2] =180 - Math.sin(walk)*20;
                    theta[rightUpperLegId2] = 180 + Math.sin(walk)*20;
                    initNodes(rightUpperLegId2);
                    initNodes(leftUpperLegId2);


                } else if (theta[leftUpperArmId2] > 100) {
                    theta[leftUpperArmId2] -= 1;
                    initNodes(leftUpperArmId2);
                } else {
                    a[2]++;
                }
            } else if (a[2] == 1) {
                if (torsoCoords[1] > -6.4) {
                    walk -=.2;

                    theta[leftUpperLegId2] =180 - Math.sin(walk)*20;
                    theta[rightUpperLegId2] = 180 + Math.sin(walk)*20;
                    initNodes(rightUpperLegId2);
                    initNodes(leftUpperLegId2);

                    torsoCoords[1] -= .1;
                    c2Coords[0] += .1;
                    initNodes(cake2Id);
                    initNodes(torsoId2);
                } else if (theta[leftUpperArmId2] > 40) {
                    theta[leftUpperArmId2] -= 1;
                    initNodes(leftUpperArmId2);
                    c2Coords[1] += .06;
                    c2Coords[0] += .02;

                    initNodes(cake2Id);
                } else if (theta[leftLowerArmId2] > -130) {
                    theta[leftLowerArmId2] -= 3.;
                    initNodes(leftLowerArmId2);

                    c2Coords[1] -= .03;
                    c2Coords[0] += .05;
                    c2Coords[3] *= .97;
                    initNodes(cake2Id);
                } else if (size[1] < 1.2) {
                    c2Coords[3] = 0.001;
                    initNodes(cake2Id);
                    size[1] += .005;
                    initNodes(torsoId2);
                } else {
                    a[2]++
                }
            } else if (a[2] == 2) {
                if (theta[leftUpperArmId2] < 180) {
                    theta[leftUpperArmId2] += 1;
                    initNodes(leftUpperArmId2);
                    theta[leftLowerArmId2] += 1.2
                    initNodes(leftLowerArmId2);

                } else {
                    theta[leftUpperArmId2] = 180;
                    initNodes(leftUpperArmId2);

                    theta[leftLowerArmId2] = 0;
                    initNodes(leftLowerArmId2);
                    a[2]++
                }
            } else if (a[2] == 3) {
                anim = 0;
            }
            break;
        case 3:
            // A T 1
            if (a[3] == 0) {
                if (torsoCoords[1] < -3.4) {
                    walk +=.1;
                    torsoCoords[1] += .1;

                    theta[leftUpperLegId2] =180 - Math.sin(walk)*20;
                    theta[rightUpperLegId2] = 180 + Math.sin(walk)*20;
                    initNodes(rightUpperLegId2);
                    initNodes(leftUpperLegId2);

                    initNodes(torsoId2);
                } else if (theta[rightUpperArmId2] > 100) {
                    theta[rightUpperArmId2] -= 1;
                    initNodes(rightUpperArmId2);
                } else {
                    a[3]++;
                }
            } else if (a[3] == 1) {
                if (torsoCoords[1] > -6.4) {
                    walk -=.2
                    torsoCoords[1] -= .1;
                    t1Coords[0] += .1;

                    theta[leftUpperLegId2] =180 - Math.sin(walk)*20;
                    theta[rightUpperLegId2] = 180 + Math.sin(walk)*20;
                    initNodes(rightUpperLegId2);
                    initNodes(leftUpperLegId2);

                    initNodes(drink1Id);
                    initNodes(torsoId2);
                } else if (theta[rightUpperArmId2] > 40) {
                    theta[rightUpperArmId2] -= 1;
                    initNodes(rightUpperArmId2);
                    t1Coords[1] += .03;
                    t1Coords[0] += .02;

                    initNodes(drink1Id);
                } else if (theta[rightLowerArmId2] < 130) {
                    theta[rightLowerArmId2] += 3.;
                    initNodes(rightLowerArmId2);

                    t1Coords[1] -= .03;
                    t1Coords[0] += .05;
                    t1Coords[3] *= .97;
                    initNodes(drink1Id);
                } else if (size[1] > .7) {
                    t1Coords[3] = 0.001;
                    initNodes(drink1Id);
                    size[1] -= .005;
                    initNodes(torsoId2);
                } else {
                    t1Coords[3] = 0.001;
                    initNodes(drink1Id);
                    a[3]++
                }
            } else if (a[3] == 2) {
                if (theta[rightUpperArmId2] < 180) {
                    theta[rightUpperArmId2] += 1;
                    initNodes(rightUpperArmId2);
                    theta[rightLowerArmId2] -= 1.2
                    initNodes(rightLowerArmId2);

                } else {
                    theta[rightUpperArmId2] = 180;
                    initNodes(rightUpperArmId2);

                    theta[rightLowerArmId2] = 0;
                    initNodes(rightLowerArmId2);
                    a[3]++
                }
            } else if (a[3] == 3) {
                anim = 0;
            }
            break;
        case 4:
            // A T 2
            if (a[4] == 0) {
                if (torsoCoords[1] < -3.4) {
                    walk +=.1;
                    torsoCoords[1] += .05;

                    theta[leftUpperLegId2] =180 - Math.sin(walk)*20;
                    theta[rightUpperLegId2] = 180 + Math.sin(walk)*20;
                    initNodes(rightUpperLegId2);
                    initNodes(leftUpperLegId2);

                    initNodes(torsoId2);
                } else if (theta[rightUpperArmId2] > 100) {
                    theta[rightUpperArmId2] -= 1;
                    initNodes(rightUpperArmId2);
                } else {
                    a[4]++;
                }
            } else if (a[4] == 1) {
                if (torsoCoords[1] > -6.4) {
                    walk -=.2;

                    torsoCoords[1] -= .1;
                    t2Coords[0] += .1;

                    theta[leftUpperLegId2] =180 - Math.sin(walk)*20;
                    theta[rightUpperLegId2] = 180 + Math.sin(walk)*20;
                    initNodes(rightUpperLegId2);
                    initNodes(leftUpperLegId2);

                    initNodes(drink2Id);
                    initNodes(torsoId2);
                } else if (theta[rightUpperArmId2] > 40) {
                    theta[rightUpperArmId2] -= 1;
                    initNodes(rightUpperArmId2);
                    t2Coords[1] += .06;
                    t2Coords[0] += .02;

                    initNodes(drink2Id);
                } else if (theta[rightLowerArmId2] < 130) {
                    theta[rightLowerArmId2] += 3.;
                    initNodes(rightLowerArmId2);

                    t2Coords[1] -= .03;
                    t2Coords[0] += .05;
                    t2Coords[3] *= .97;
                    initNodes(drink2Id);
                } else if (size[1] > .8) {
                    t2Coords[3] = 0.001;
                    initNodes(drink2Id);
                    size[1] -= .005;
                    initNodes(torsoId2);
                } else {
                    a[4]++
                }
            } else if (a[4] == 2) {
                if (theta[rightUpperArmId2] < 180) {
                    theta[rightUpperArmId2] += 1;
                    initNodes(rightUpperArmId2);
                    theta[rightLowerArmId2] -= 1.2
                    initNodes(rightLowerArmId2);

                } else {
                    theta[rightUpperArmId2] = 180;
                    initNodes(rightUpperArmId2);

                    theta[rightLowerArmId2] = 0;
                    initNodes(rightLowerArmId2);
                    a[4]++
                }
            } else if (a[4] == 3) {
                anim = 0;
            }
            break;
        case 5:
            // Q C 1
            if (a[5] == 0) {
                if (torsoCoords[0] < -3.5) {
                    walk +=1;
                    torsoCoords[0] += .1;

                    theta[leftUpperLegId] =180 - Math.sin(walk)*10;
                    theta[rightUpperLegId] = 180 + Math.sin(walk)*10;
                    initNodes(rightUpperLegId);
                    initNodes(leftUpperLegId);

                    initNodes(torsoId);
                } else if (theta[rightUpperArmId] > 100) {
                    theta[rightUpperArmId] -= 1;
                    initNodes(rightUpperArmId);
                } else {
                    a[5]++;
                }
            } else if (a[5] == 1) {
                if (torsoCoords[0] > -6.4) {
                    walk -=1;
                    torsoCoords[0] -= .1;
                    c1Coords[0] -= .1;

                    theta[leftUpperLegId] =180 - Math.sin(walk)*10;
                    theta[rightUpperLegId] = 180 + Math.sin(walk)*10;
                    initNodes(rightUpperLegId);
                    initNodes(leftUpperLegId);

                    initNodes(cake1Id);
                    initNodes(torsoId);
                } else if (theta[rightUpperArmId] > 40) {
                    theta[rightUpperArmId] -= 1;
                    initNodes(rightUpperArmId);
                    c1Coords[1] += .06;
                    c1Coords[0] -= .02;

                    initNodes(cake1Id);
                } else if (theta[rightLowerArmId] < 180) {
                    theta[rightLowerArmId] += 3.;
                    initNodes(rightLowerArmId);

                    c1Coords[1] -= .03;
                    c1Coords[0] -= .05;
                    c1Coords[3] *= .97;
                    initNodes(cake1Id);
                } else if (size[0] < 1.4) {
                    c1Coords[3] = 0.001;
                    initNodes(cake1Id);
                    size[0] += .005;
                    initNodes(torsoId);
                } else {
                    a[5]++
                }
            } else if (a[5] == 2) {
                if (theta[rightUpperArmId] < 180) {
                    theta[rightUpperArmId] += 1;
                    initNodes(rightUpperArmId);
                    theta[rightLowerArmId] -= 1.2
                    initNodes(rightLowerArmId);

                } else {
                    theta[rightUpperArmId] = 180;
                    initNodes(rightUpperArmId);

                    theta[rightLowerArmId] = 0;
                    initNodes(rightLowerArmId);
                    a[5]++
                }
            } else if (a[5] == 3) {
                anim = 0;
            }
            break;
        case 6:
            // Q C 2
            if (a[6] == 0) {
                if (torsoCoords[0] < -4.4) {
                    torsoCoords[0] += .05;
                    walk+=1;


                    theta[leftUpperLegId] =180 - Math.sin(walk)*10;
                    theta[rightUpperLegId] = 180 + Math.sin(walk)*10;
                    initNodes(rightUpperLegId);
                    initNodes(leftUpperLegId);
                    initNodes(torsoId);
                } else if (theta[rightUpperArmId] > 100) {
                    theta[rightUpperArmId] -= 1;
                    initNodes(rightUpperArmId);
                } else {
                    a[6]++;
                }
            } else if (a[6] == 1) {
                if (torsoCoords[0] > -6.4) {
                    torsoCoords[0] -= .1;
                    c2Coords[0] -= .1;

                    walk-=1;


                    theta[leftUpperLegId] =180 - Math.sin(walk)*10;
                    theta[rightUpperLegId] = 180 + Math.sin(walk)*10;
                    initNodes(rightUpperLegId);
                    initNodes(leftUpperLegId);

                    initNodes(cake2Id);
                    initNodes(torsoId);
                } else if (theta[rightUpperArmId] > 40) {
                    theta[rightUpperArmId] -= 1;
                    initNodes(rightUpperArmId);
                    c2Coords[1] += .06;
                    c2Coords[0] -= .02;

                    initNodes(cake2Id);
                } else if (theta[rightLowerArmId] < 180) {
                    theta[rightLowerArmId] += 3.;
                    initNodes(rightLowerArmId);

                    c2Coords[1] -= .03;
                    c2Coords[0] -= .05;
                    c2Coords[3] *= .97;
                    initNodes(cake2Id);
                } else if (size[0] < 1.2) {
                    c2Coords[3] = 0.001;
                    initNodes(cake2Id);
                    size[0] += .005;
                    initNodes(torsoId);
                } else {
                    a[6]++
                }
            } else if (a[6] == 2) {
                if (theta[rightUpperArmId] < 180) {
                    theta[rightUpperArmId] += 1;
                    initNodes(rightUpperArmId);
                    theta[rightLowerArmId] -= 1.2
                    initNodes(rightLowerArmId);

                } else {
                    theta[rightUpperArmId] = 180;
                    initNodes(rightUpperArmId);

                    theta[rightLowerArmId] = 0;
                    initNodes(rightLowerArmId);
                    a[6]++
                }
            } else if (a[6] == 3) {
                anim = 0;
            }
            break;
        case 7:
            // Q T 1
            if (a[7] == 0) {
                walk+=1;
                if (torsoCoords[0] < -3.5) {
                    torsoCoords[0] += .1;

                    theta[leftUpperLegId] =180 - Math.sin(walk)*10;
                    theta[rightUpperLegId] = 180 + Math.sin(walk)*10;
                    initNodes(rightUpperLegId);
                    initNodes(leftUpperLegId);

                    initNodes(torsoId);
                } else if (theta[leftUpperArmId] > 100) {
                    theta[leftUpperArmId] -= 1;
                    initNodes(leftUpperArmId);
                } else {
                    a[7] += 1;
                }
            } else if (a[7] == 1) {
                if (torsoCoords[0] > -6.4) {
                    walk -=.1;
                    torsoCoords[0] -= .1;
                    t1Coords[0] -= .1;

                    theta[leftUpperLegId] =180 - Math.sin(walk)*10;
                    theta[rightUpperLegId] = 180 + Math.sin(walk)*10;
                    initNodes(rightUpperLegId);
                    initNodes(leftUpperLegId);

                    initNodes(drink1Id);
                    initNodes(torsoId);
                } else if (theta[leftUpperArmId] > 60) {
                    theta[leftUpperArmId] -= 1;
                    initNodes(leftUpperArmId);
                    t1Coords[1] += .08;
                    t1Coords[0] -= .02;
                    initNodes(drink1Id);

                } else if (theta[leftLowerArmId] > -130) {
                    theta[leftLowerArmId] -= 3.;
                    initNodes(leftLowerArmId);

                    t1Coords[1] -= .03;
                    t1Coords[0] -= .05;
                    t1Coords[3] *= .97;
                    initNodes(drink1Id);

                } else if (size[0] > .7) {
                    t1Coords[3] = 0.001;
                    initNodes(drink1Id);
                    size[0] -= .005;
                    initNodes(torsoId);
                } else {
                    a[7] += 1;
                }
            } else if (a[7] == 2) {
                if (theta[leftUpperArmId] < 180) {
                    theta[leftUpperArmId] += 1;
                    initNodes(leftUpperArmId);
                    theta[leftLowerArmId] += 1.2
                    initNodes(leftLowerArmId);

                } else {
                    theta[leftLowerArmId] = 0;
                    initNodes(leftLowerArmId);
                    a[7]++
                }
            } else if (a[7] == 3) {
                anim = 0;
            }
            break;
        case 8:
            // Q T 2
            if (a[8] == 0) {
                if (torsoCoords[0] < -4.4) {
                    walk+=.1
                    torsoCoords[0] += .1;

                    theta[leftUpperLegId] =180 - Math.sin(walk)*10;
                    theta[rightUpperLegId] = 180 + Math.sin(walk)*10;
                    initNodes(rightUpperLegId);
                    initNodes(leftUpperLegId);

                    initNodes(torsoId);
                } else if (theta[leftUpperArmId] > 100) {
                    theta[leftUpperArmId] -= 1;
                    initNodes(leftUpperArmId);
                } else {
                    a[8]++;
                }
            } else if (a[8] == 1) {
                if (torsoCoords[0] > -6.4) {
                    walk-=1;
                    torsoCoords[0] -= .1;
                    t2Coords[0] -= .1;

                    theta[leftUpperLegId] =180 - Math.sin(walk)*10;
                    theta[rightUpperLegId] = 180 + Math.sin(walk)*10;
                    initNodes(rightUpperLegId);
                    initNodes(leftUpperLegId);

                    initNodes(drink2Id);
                    initNodes(torsoId);
                } else if (theta[leftUpperArmId] > 40) {
                    theta[leftUpperArmId] -= 1;
                    initNodes(leftUpperArmId);
                    t2Coords[1] += .06;
                    t2Coords[0] -= .02;

                    initNodes(drink2Id);
                } else if (theta[leftLowerArmId] > -130) {
                    theta[leftLowerArmId] -= 3.;
                    initNodes(leftLowerArmId);

                    t2Coords[1] -= .03;
                    t2Coords[0] -= .05;
                    t2Coords[3] *= .97;
                    initNodes(drink2Id);
                } else if (size[0] > .8) {
                    t2Coords[3] = 0.001;
                    initNodes(drink2Id);
                    size[0] -= .005;
                    initNodes(torsoId);
                } else {
                    a[8]++
                }
            } else if (a[8] == 2) {
                if (theta[leftUpperArmId] < 180) {
                    theta[leftUpperArmId] += 1;
                    initNodes(leftUpperArmId);
                    theta[leftLowerArmId] += 1.2
                    initNodes(leftLowerArmId);

                } else {
                    theta[leftUpperArmId] = 180;
                    initNodes(leftUpperArmId);

                    theta[leftLowerArmId] = 0;
                    initNodes(leftLowerArmId);
                    a[8]++
                }
            } else if (a[8] == 3) {
                anim = 0;
            }
            break;

    }

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(shininessLoc, materialShininess);

    requestAnimFrame(render);

}