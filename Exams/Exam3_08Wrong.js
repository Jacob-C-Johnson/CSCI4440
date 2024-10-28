"use strict";
var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
   ];

var lightPosition = vec4( 0.0, 0.5, 3.0, 0.0 );

var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.5, 0.5, 0.5, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;

var leftColor   = vec3(1.0, 0.0, 0.0);
var middleColor = vec3(0.0, 1.0, 0.0);
var rightColor  = vec3(0.0, 0.0, 1.0);

var modelViewMatrix, modelViewMatrixLoc;
var projectionMatrix, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;

var ambientProduct, ambientProductLoc;
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;
var lightPositionLoc;
var shininessLoc;

var near   = -4.0;
var far    =  4.0;
var left   = -2.0;
var right  =  2.0;
var ytop   =  2.0;
var bottom = -2.0;

var eye = vec3(0.25, 0.5, 1.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);




function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);

     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
}

function colorCube()
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

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
	
	ambientProductLoc = gl.getUniformLocation(program,"ambientProduct");
	diffuseProductLoc = gl.getUniformLocation(program,"diffuseProduct");
	specularProductLoc = gl.getUniformLocation(program,"specularProduct");
	lightPositionLoc = gl.getUniformLocation(program,"lightPosition");
	shininessLoc = gl.getUniformLocation(program, "shininess");

	// Event listeners 

    document.getElementById("Controls1" ).onclick = function(event) {
        switch( event.target.index ) {
			case 0: {

				break;
			}
			case 1: {

				break;
			}
			case 2: {

				break;
			}
			case 3:{

				break;
			}
			case 4: {

				break;
			}
			case 5:{

				break;       
			}
		}
    };

    document.getElementById("Controls2" ).onclick = function(event) {
        switch( event.target.index ) {
			case 0: {

				break;
			}
			case 1: {

				break;
			}
			case 2: {

				break;
			}
			case 3:{



				break;
			}
       }
    };

    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Left box //
	materialDiffuse = vec4(leftColor[0], leftColor[1], leftColor[2], 1.0);



	
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    gl.uniform4fv( diffuseProductLoc, flatten(diffuseProduct) );

    modelViewMatrix = mat4();
	modelViewMatrix = lookAt(eye, at, up);
	modelViewMatrix = mult(modelViewMatrix, translate(-1.25, 0, 0));
	modelViewMatrix = mult(modelViewMatrix, scalem(0.5, 0.75, 1.0));
	
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
	

	// Middle box //
	materialDiffuse = vec4(middleColor[0], middleColor[1], middleColor[2], 1.0);



	
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    gl.uniform4fv( diffuseProductLoc, flatten(diffuseProduct) );

    modelViewMatrix = mat4();
	modelViewMatrix = lookAt(eye, at, up);
	modelViewMatrix = mult(modelViewMatrix, scalem(1.0, 0.5, 0.75));
	
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
	

	// Right box //
	materialDiffuse = vec4(rightColor[0], rightColor[1], rightColor[2], 1.0);



	
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    gl.uniform4fv( diffuseProductLoc, flatten(diffuseProduct) );
	
    modelViewMatrix = mat4();
	modelViewMatrix = lookAt(eye, at, up);
	modelViewMatrix = mult(modelViewMatrix, translate(1.25, 0.25, 0));
	modelViewMatrix = mult(modelViewMatrix, scalem(0.75, 1.0, 0.5));
	
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


	// For all
	
    ambientProduct = mult(lightAmbient, materialAmbient);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	gl.uniform4fv( ambientProductLoc, flatten(ambientProduct) );
    gl.uniform4fv( specularProductLoc, flatten(specularProduct) );
    gl.uniform1f( shininessLoc, materialShininess );

	projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.uniform4fv( lightPositionLoc, flatten(lightPosition) );

    requestAnimFrame(render);
}
