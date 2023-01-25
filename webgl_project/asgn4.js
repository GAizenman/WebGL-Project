// Shaders (GLSL)
let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;

    uniform vec3 u_Color;
    uniform vec3 u_ambientColor;
    uniform vec3 u_diffuseColor1;
    uniform vec3 u_diffuseColor2;
    uniform vec3 u_specularColor;
    uniform float u_specularAlpha;

    uniform vec3 u_eyePosition;
    uniform vec3 u_lightPosition;
    uniform vec3 u_lightDirection;

    varying vec4 v_Color;

    vec3 calcAmbient() {
        return u_ambientColor * u_Color;
    }

    vec3 calcDiffuse(vec3 l, vec3 n, vec3 lColor) {
        float nDotL = max(dot(l, n), 0.0);
        return lColor * u_Color * nDotL;
    }

    vec3 calcSpecular(vec3 r, vec3 v) {
        float rDotV = max(dot(r, v), 0.0);
        float rDotVPowAlpha = pow(rDotV, u_specularAlpha);
        return u_specularColor * u_Color * rDotVPowAlpha;
    }

    void main() {
        // Mapping obj coord system to world coord system
        vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);

        vec3 n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz; // Normal

        vec3 l1 = normalize(u_lightPosition - worldPos.xyz); // Light direction 1
        vec3 l2 = normalize(u_lightDirection); // Light direction 2

        vec3 v = normalize(u_eyePosition - worldPos.xyz);   // View direction

        vec3 r1 = reflect(l1, n); // Reflected light direction
        vec3 r2 = reflect(l2, n); // Reflected light direction

        // Smooth shading (Goraud)
        vec3 ambient = calcAmbient();

        vec3 diffuse1 = calcDiffuse(l1, n, u_diffuseColor1);
        vec3 diffuse2 = calcDiffuse(l2, n, u_diffuseColor2);

        vec3 specular1 = calcSpecular(r1, v);
        vec3 specular2 = calcSpecular(r2, v);

        v_Color = vec4(ambient + (diffuse1 + diffuse2) + (specular1 + specular2), 1.0);

        gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
    }
`;

let FSHADER=`
    precision mediump float;
    uniform vec3 u_Color;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }
`;

let lightPosition = new Vector3([-1.0, 0.0, -1.0]);
let lightDirection = new Vector3([1.0, 1.0, -1.0]);
let lightRotation = new Matrix4().setRotate(1, 0,1,0);

let eyePosition = new Vector3([0.0, 0.0, 0.0]);
var models = [];

//GLOBAL VARIABLES
var coor;
var poly;
var modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_ViewMatrix = null;
let u_ProjMatrix = null;
let u_Color = null;
let u_diffuseColor1 = null;
let u_diffuseColor2 = null;
let u_ambientColor = null;
let u_specularColor = null;
let u_specularAlpha = null;
let u_lightPosition = null;
let u_eyePosition = null;
//let u_lightColor = null;

let pointLightSphere = null;


function draw(model){
	
	modelMatrix.setIdentity();
	
	//combine the transformation matrices
	modelMatrix.multiply(model.translateMatrix);
	modelMatrix.multiply(model.rotateXMatrix);
	modelMatrix.multiply(model.rotateYMatrix);
	modelMatrix.multiply(model.rotateZMatrix);
	modelMatrix.multiply(model.scaleMatrix);
	
	// Update eye position in the shader
    gl.uniform3fv(u_eyePosition, camera.eye.elements);

    // Update View matrix in the shader
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

    // Update Projection matrix in the shader
    gl.uniformMatrix4fv(u_ProjMatrix, false, camera.projMatrix.elements);
	
	//get u_Model var from vshader and set it
	//u_Model = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	
	// Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	
	//COLOR: get u_Color var from frag shader and set it
	gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);
	
	//upload the data to gl
	// Send vertices and indices from cube to the shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, model.coor, gl.STATIC_DRAW);
	
	//var sm = document.getElementById("shadingSelect").value;
	
	var sm = document.getElementById("sm").checked;
	var sh = document.getElementById("sh").checked;
	var wf = document.getElementById("wf").checked;
	
	if(sm){
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, model.norm, gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.poly, gl.STATIC_DRAW);
		
		gl.drawElements(gl.TRIANGLES, model.poly.length, gl.UNSIGNED_SHORT, 0);
	}
	if (sh || wf) {
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.poly, gl.STATIC_DRAW);
		
		if(wf)
			gl.drawElements(gl.LINE_LOOP, model.poly.length, gl.UNSIGNED_SHORT, 0);
		if(sh)
			gl.drawElements(gl.TRIANGLES, model.poly.length, gl.UNSIGNED_SHORT, 0);
	}
}

window.addEventListener("keydown", function(event) {
    let speed = 1.0;

    switch (event.keyCode) {
		
		case 38:	//up arrow clicked
            console.log("forward");
            camera.moveForward(speed);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
        case 37:	//left arrow clicked
            console.log("left");
			camera.moveSideways(-.1);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
		case 39:	//right arrow
            console.log("right");
			camera.moveSideways(.1);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
		case 40:	//down arrow clicked
            console.log("back");
            camera.moveForward(-speed);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
			
		case 87:	//w clicked
            console.log("tilt up");
            camera.tilt(5);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
        case 83:	//s clicked
            console.log("tilt down");
            camera.tilt(-5);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
        case 65:	//a clicked
            console.log("pan left");
            camera.pan(5);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
        case 68:	//d clicked
            console.log("pan right");
            camera.pan(-5);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
			
		case 69:	//e clicked
            console.log("zoom in");
            camera.zoom(-.1);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
		case 81:	//q clicked
            console.log("zoom out");
            camera.zoom(.1);
			for(let model1 of models){
				draw(model1);
			}
			if(document.getElementById("pl").checked)
				draw(pointLightSphere);
            break;
			
		case 32:	//space clicked
            console.log("animation");
			for (let i = 0; i < 74; i++) {
				(function(i){
					setTimeout(function(){
					// code
						camera.pan(5);
						camera.moveSideways(0.3);
						
						for(let model1 of models){
							draw(model1);
						}
						if(document.getElementById("pl").checked)
							draw(pointLightSphere);
						
					}, 50 * (i+1));
				})(i);
			}
			console.log("animation");
            break;
    }
});

function startAnimation() {
	
	camera.resetCamera();
	
	for(let i = 0; i < 100; i++){		
		var ang = Math.PI * 2 / 100;
		
		// Clear screen
		gl.enable(gl.DEPTH_TEST);

		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		camera.pan(ang);
		camera.moveSideways(0.05);

		for(let model1 of models){
			draw(model1);
		}
		if(document.getElementById("pl").checked)
			draw(pointLightSphere);
		holdUp(50);
	}
}

//got this from https://www.delftstack.com/howto/javascript/javascript-wait-for-x-seconds/
function holdUp(sec) {
	var start = new Date().getTime();
	var end=0;
	while( (end-start) < sec){
		end = new Date().getTime();
	}
}

function setProjection (){
	var proj = document.getElementById("proj").checked;
	if(proj)
		camera.setProj("perspective");
	else
		camera.setProj("orthographic");
	for(let model1 of models){
		draw(model1);
	}
	if(document.getElementById("pl").checked)
		draw(pointLightSphere);
}

//function to create buffers
function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}


//function to remove a cylinder
function removeCyl(){
	//get which one is selected and remove it from models
	let sel = document.getElementById("cyl").value;
	models.splice(sel, sel+1);
	
	//correct the values on the html side
	document.getElementById("cyl").value = 0;
	document.getElementById("cyl").max--;
	
	// Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//draw the cylinders
	for(let model1 of models){
		draw(model1);
	}
	if(document.getElementById("pl").checked)
		draw(pointLightSphere);
}

function newCylDraw(){
	
	// Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var max = document.getElementById("cyl").max*1.0;
	
	//get colors from input
	var red = document.getElementById("red").value/10.0;
	var green = document.getElementById("green").value/10.0;
	var blue = document.getElementById("blue").value/10.0;
	//set translate values from input
	var xTran = document.getElementById("xTran").value = 0;
	var yTran = document.getElementById("yTran").value = 0;
	var zTran = document.getElementById("zTran").value = 0;
	//set rotate values from input
	var xRot = document.getElementById("xRot").value = 0;
	var yRot = document.getElementById("yRot").value = 0;
	var zRot = document.getElementById("zRot").value = 0;
	//set scale values from input
	var xScale = document.getElementById("xScale").value = 5;
	var yScale = document.getElementById("yScale").value = 5;
	var zScale = document.getElementById("zScale").value = 5;
	
	//create new cylinder
	let cylinder = new Cylinder([red, green, blue]);
	cylinder.scale(0.5, 0.5, 0.5);
	
	//correct on the html side
	models[max+1] = cylinder;
	document.getElementById("cyl").max++;
	document.getElementById("cyl").value = max+1;

	//draw all the cylinders
	for(let model1 of models){
		draw(model1);
	}
	if(document.getElementById("pl").checked)
		draw(pointLightSphere);
	
}

function newSphDraw(){
	
	// Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var max = document.getElementById("cyl").max*1.0;
	
	//get colors from input
	var red = document.getElementById("red").value/10.0;
	var green = document.getElementById("green").value/10.0;
	var blue = document.getElementById("blue").value/10.0;
	//set translate values from input
	var xTran = document.getElementById("xTran").value = 0;
	var yTran = document.getElementById("yTran").value = 0;
	var zTran = document.getElementById("zTran").value = 0;
	//set rotate values from input
	var xRot = document.getElementById("xRot").value = 0;
	var yRot = document.getElementById("yRot").value = 0;
	var zRot = document.getElementById("zRot").value = 0;
	//set scale values from input
	var xScale = document.getElementById("xScale").value = 5;
	var yScale = document.getElementById("yScale").value = 5;
	var zScale = document.getElementById("zScale").value = 5;
	
	//create new sphere
	let sphere = new Sphere([red, green, blue]);
	sphere.scale(0.5, 0.5, 0.5);
	
	//correct on the html side
	models[max+1] = sphere;
	document.getElementById("cyl").max++;
	document.getElementById("cyl").value = max+1;

	//draw all the cylinders
	for(let model1 of models){
		draw(model1);
	}
	if(document.getElementById("pl").checked)
		draw(pointLightSphere);
	
}

function rocket(){
	// Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//clear the array
	models.length = 0;
	
	//set html values
	document.getElementById("cyl").value = 0;
	document.getElementById("cyl").max = 2;
	
	//create 3 cylinders for the rocket
	cylinderR = new Cylinder([1.0, 0.0, 0.0]);
	cylinderR.translate(0.5, -0.5, 0.0);
	cylinderR.scale(0.3, 0.1, 0.5);
	cylinderR.rotateX(45);
	cylinderR.rotateZ(180);
	cylinderL = new Cylinder([1.0, 0.0, 0.0]);
	cylinderL.translate(-0.5, -0.5, 0.0);
	cylinderL.scale(0.3, 0.1, 0.5);
	cylinderL.rotateX(45);
	cylinderL.rotateZ(180);
	cylinderC = new Cylinder([0.5, 0.5, 0.5]);
	cylinderC.translate(0.0, 0.11, -0.05);
	cylinderC.scale(0.5, 0.5, 1.0);
	cylinderC.rotateX(70);
	cylinderC.rotateZ(170);

	cylinderRW = new Cylinder([1.0, 0.0, 0.0]);
	cylinderRW.translate(0.8, -0.67, 0.15);
	cylinderRW.scale(0.25, 0.01, 0.3);
	cylinderRW.rotateX(45);
	cylinderRW.rotateZ(180);
	cylinderLW = new Cylinder([1.0, 0.0, 0.0]);
	cylinderLW.translate(-0.8, -0.67, 0.15);
	cylinderLW.scale(0.25, 0.01, 0.3);
	cylinderLW.rotateX(45);
	cylinderLW.rotateZ(180);
	
	//add cylinders to the array
	models.push(cylinderR);
	models.push(cylinderL);
	models.push(cylinderC);
	models.push(cylinderRW);
	models.push(cylinderLW);
	
	// Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//draw cylinders
	for(let cylinder1 of models){
		draw(cylinder1);
	}
	if(document.getElementById("pl").checked)
		draw(pointLightSphere);
	
}

function handleDrawEvent(){
	
	// Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var cyl = document.getElementById("cyl").value;
	
	//get colors from input
	var red = document.getElementById("red").value/10.0;
	var green = document.getElementById("green").value/10.0;
	var blue = document.getElementById("blue").value/10.0;
	//get translate values from input
	var xTran = document.getElementById("xTran").value/10.0;
	var yTran = document.getElementById("yTran").value/10.0;
	var zTran = document.getElementById("zTran").value/10.0;
	//get rotate values from input
	var xRot = document.getElementById("xRot").value;
	var yRot = document.getElementById("yRot").value;
	var zRot = document.getElementById("zRot").value;
	//get scale values from input
	var xScale = document.getElementById("xScale").value/10.0;
	var yScale = document.getElementById("yScale").value/10.0;
	var zScale = document.getElementById("zScale").value/10.0;
	
	//get the selected cylinder
	let model = models[cyl];
	
	//change it to the transformations
	model.translate(xTran, yTran, zTran);
	model.scale(xScale, yScale, zScale);
	model.rotateX(xRot);
	model.rotateY(yRot);
	model.rotateZ(zRot);
	
	//draw the cylinders
	for(let model1 of models){
		draw(model1);
	}
	if(document.getElementById("pl").checked)
		draw(pointLightSphere);
	
}

function handleLight() {
	var pl = document.getElementById("pl").checked;
	var dl = document.getElementById("dl").checked;
	var sp = document.getElementById("sp").checked;
	
	var aLight = document.getElementById("aLight").value/10.0;
	var pLight = document.getElementById("pLight").value/10.0;
	var dLight = document.getElementById("dLight").value/10.0;
	var sLight = document.getElementById("sLight").value*1.0;
	
	var xLPos = document.getElementById("xLPos").value/10.0;
	var yLPos = document.getElementById("yLPos").value/10.0;
	var zLPos = document.getElementById("zLPos").value/10.0;
	
	var xDPos = document.getElementById("xDPos").value/10.0;
	var yDPos = document.getElementById("yDPos").value/10.0;
	var zDPos = document.getElementById("zDPos").value/10.0;
	
	u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
	u_diffuseColor1 = gl.getUniformLocation(gl.program, "u_diffuseColor1");
	u_diffuseColor2 = gl.getUniformLocation(gl.program, "u_diffuseColor2");
	u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
	
	gl.uniform3f(u_ambientColor, aLight, aLight, aLight);
	
	//point light
	if(pl){
		gl.uniform3f(u_diffuseColor1, pLight, pLight, pLight);
	}
	else{
		gl.uniform3f(u_diffuseColor1, 0, 0, 0);
	}
		
	//diffused light
	if(dl){
		gl.uniform3f(u_diffuseColor2, dLight, dLight, dLight);
	}
	else{
		gl.uniform3f(u_diffuseColor2, 0, 0, 0);
	}	
		
	//specular
	if(sp){
		gl.uniform3f(u_specularColor, 1.0, 1.0, 1.0);
		gl.uniform1f(u_specularAlpha, sLight);
	}
	else
		gl.uniform3f(u_specularColor, 0, 0, 0);
	
	//set point light position
	gl.uniform3f(u_lightPosition, xLPos, yLPos, zLPos);
	
	//set light direction
	gl.uniform3f(u_lightDirection, xDPos, yDPos, zDPos);
	
	for(let model1 of models){
		draw(model1);
	}
	
	pointLightSphere.translate(xLPos, yLPos, zLPos);
	if(pl)
		draw(pointLightSphere);
	
}

function main() {
    // Retrieving the canvas tag from html document
    canvas = document.getElementById("canvas");
	
	//get colors from input
	var red = document.getElementById("red").value/10.0;
	var green = document.getElementById("green").value/10.0;
	var blue = document.getElementById("blue").value/10.0;
	
	document.getElementById("n").value = 100;
	document.getElementById("cyl").value = 0;

    // Get the rendering context for 2D drawing (vs WebGL)
    gl = canvas.getContext("webgl");
    if(!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

    // Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compiling both shaders and sending them to the GPU
    if(!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed to initialize shaders.");
        return -1;
    }

    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
	u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
    u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
    u_diffuseColor1 = gl.getUniformLocation(gl.program, "u_diffuseColor1");
	u_diffuseColor2 = gl.getUniformLocation(gl.program, "u_diffuseColor2");
    u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
    u_specularAlpha = gl.getUniformLocation(gl.program, "u_specularAlpha");
	
	u_eyePosition = gl.getUniformLocation(gl.program, "u_eyePosition");

    u_lightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
	u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");
	
	vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);
	
	indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }
	
	// Set light data
    gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_diffuseColor1, 0.8, 0.8, 0.8);
	gl.uniform3f(u_diffuseColor2, 0.8, 0.8, 0.8);
    gl.uniform3f(u_specularColor, 1.0, 1.0, 1.0);

    gl.uniform1f(u_specularAlpha, 32.0);

    gl.uniform3fv(u_eyePosition, eyePosition.elements);
    gl.uniform3fv(u_lightPosition, lightPosition.elements);
	gl.uniform3fv(u_lightDirection, lightDirection.elements);
	
	//draw();

	// Set camera data
    camera = new Camera("perspective");
	
	//create and draw a basic cylinder
	let cylinder = new Cylinder([red, green, blue]);
	cylinder.scale(0.5, 0.5, 0.5);
	models[0] = cylinder;
	draw(models[0]);
	
	pointLightSphere = new Sphere([1.0, 0.2, 0.1]);
	pointLightSphere.scale(0.1, 0.1, 0.1);
	pointLightSphere.translate(-1.0, 0.0, -1.0);
	
	if(document.getElementById("pl").checked)
		draw(pointLightSphere);
	
}
