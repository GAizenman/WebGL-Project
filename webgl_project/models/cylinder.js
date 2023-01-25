class Cylinder {
	
	constructor(color) {
		
		var n = document.getElementById("n").value;
		
		//calculate the degrees in radians
		var rad = 2*Math.PI/n;
		
		//Create the coordinates and normals and set the first point to the origin
		this.coor = new Float32Array(n*36);
		this.normals = new Float32Array(n*36);
		
		let currx, curry, nextX, nextY;
		var k = 0;
		
		//loop through the coordinates and set the x and y positions for z=0
		for(var i = 0; i < n*9; i = i + 9){
			currx = Math.cos(rad*k);
			curry = Math.sin(rad*k);
			nextX = Math.cos(rad*(k+1));
			nextY = Math.sin(rad*(k+1));
			this.coor[i] = currx;
			this.coor[i+1] = curry;
			this.coor[i+2] = -1;
			this.coor[i+3] = 0;
			this.coor[i+4] = 0;
			this.coor[i+5] = -1;
			this.coor[i+6] = nextX;
			if(i == n*9-9)
				this.coor[i+7] = 0;
			else
				this.coor[i+7] = nextY;
			this.coor[i+8] = -1;
			k++;
		}
		
		//set the norms for the bottom face to 0, 0, -1
		for(var i = 0; i < n*9; i = i + 3){
			this.normals[i] = 0.0;
			this.normals[i+1] = 0.0;
			this.normals[i+2] = -1.0;
		}
		
		//loop through the coor and set the x and y pos for z=1
		k = 0
		for(var i = n*9; i < n*18; i = i + 9){
			currx = Math.cos(rad*k);
			curry = Math.sin(rad*k);
			nextX = Math.cos(rad*(k+1));
			nextY = Math.sin(rad*(k+1));
			this.coor[i] = currx;
			this.coor[i+1] = curry;
			this.coor[i+2] = 1;
			this.coor[i+3] = nextX;
			if(i == n*18-9)
				this.coor[i+4] = 0;
			else
				this.coor[i+4] = nextY;
			this.coor[i+5] = 1;
			this.coor[i+6] = 0;
			this.coor[i+7] = 0;
			this.coor[i+8] = 1;
			k++;
		}
		
		//set the norms for the top face to 0, 0, 1
		for(var i = n*9; i < n*18; i = i + 3){
			this.normals[i] = 0.0;
			this.normals[i+1] = 0.0;
			this.normals[i+2] = 1.0;
		}
		
		//loop through the coor and norm and set the sides
		k = 0;
		for(var i = n*18; i < n*36; i = i + 18) {
			currx = Math.cos(rad*k);
			curry = Math.sin(rad*k);
			nextX = Math.cos(rad*(k+1));
			nextY = Math.sin(rad*(k+1));
			this.coor[i] = currx;
			this.coor[i+1] = curry;
			this.coor[i+2] = -1;
			this.coor[i+3] = nextX;
			this.coor[i+4] = nextY;
			this.coor[i+5] = -1;
			this.coor[i+6] = nextX;
			this.coor[i+7] = nextY;
			this.coor[i+8] = 1;
			this.coor[i+9] = currx;
			this.coor[i+10] = curry;
			this.coor[i+11] = -1;
			this.coor[i+12] = nextX;
			this.coor[i+13] = nextY;
			this.coor[i+14] = 1;
			this.coor[i+15] = currx;
			this.coor[i+16] = curry;
			this.coor[i+17] = 1;
			k++;
			//calculate the normals
			let abX, abY, abZ;
			abX = nextX - currx;
			abY = nextY - curry;
			abZ = 0;
			let acX, acY, acZ;
			acX = nextX - currx;
			acY = nextY - curry;
			acZ = 2;
			let normI, normJ, normK;
			normI = abY*acZ - (abZ*acY);
			normJ = abZ*acX - (abX*acZ);
			normK = abX*acY - (abY*acX);
			
			//normalize
			let tot = Math.sqrt((normI*normI)+(normJ*normJ)+(normK*normK))*1.0;
			
			//set the norm values
			for(var j = i; j < i+18; j=j+3){
				this.normals[j] = normI/tot;
				this.normals[j+1] = normJ/tot;
				this.normals[j+2] = normK/tot;
			}
			
		}
		
		//create the poly
		this.poly = new Uint16Array(n*12);
		
		//loop through the poly and select which coordinates will create each triangle
		for(i = 0; i < 12*n; i++){
			this.poly[i] = i;
		}
		
		
		//create the new norms
		this.norm = new Float32Array(n*36);
		
		//set the norms for the bottom face to 0, 0, -1
		for(var i = 3; i < n*9; i = i + 9){
			//0,0,-1   0,0,-1   n*18, n*18+1, n*18+2   n*18-3, n*18-2, n*18-1
			this.norm[i] = 0.0;
			this.norm[i+1] = 0.0;
			this.norm[i+2] = -1.0;
		}
		
		k = 0;
		for(var i = 0; i < n*9; i = i + 9){
			//0,0,-1   0,0,-1   n*18, n*18+1, n*18+2   n*18-3, n*18-2, n*18-1
			let baseX, baseY, baseZ;
			if(i==0){
				baseX = this.normals[0] + this.normals[18*n] + this.normals[36*n-15];
				baseY = this.normals[1] + this.normals[18*n+1] + this.normals[36*n-14];
				baseZ = this.normals[2] + this.normals[18*n+2] + this.normals[36*n-13];
			}
			else{
				baseX = this.normals[i] + this.normals[18*n+2*i] + this.normals[18*n+2*i-15];
				baseY = this.normals[i+1] + this.normals[18*n+2*i+1] + this.normals[18*n+2*i-14];
				baseZ = this.normals[i+2] + this.normals[18*n+2*i+2] + this.normals[18*n+2*i-13];
			}
			//normalize
			let tot = Math.sqrt((baseX*baseX)+(baseY*baseY)+(baseZ*baseZ));
			
			this.norm[i] = baseX/tot;
			this.norm[i+1] = baseY/tot;
			this.norm[i+2] = baseZ/tot;
			k+=1;
		}
		
		for(var i = 6; i < n*9; i = i + 9){
			if(i == n*9-3){
				this.norm[i] = this.norm[0];
				this.norm[i+1] = this.norm[1];
				this.norm[i+2] = this.norm[2];
			}			
			else {
				this.norm[i] = this.norm[i+3];
				this.norm[i+1] = this.norm[i+4];
				this.norm[i+2] = this.norm[i+5];
			}
		}
		
		//norms for the other face
		for(var i = n*9; i < n*18; i = i + 9){
			
			this.norm[i] = this.norm[i-(n*9)];
			this.norm[i+1] = this.norm[i-(n*9)+1];
			this.norm[i+2] = -this.norm[i-(n*9)+2];
			this.norm[i+3] = this.norm[i-(n*9)+6];
			this.norm[i+4] = this.norm[i-(n*9)+7];
			this.norm[i+5] = -this.norm[i-(n*9)+8];
			this.norm[i+6] = 0;
			this.norm[i+7] = 0;
			this.norm[i+8] = 1;
			
		}
		
		//set the side norms
		k = n*18;
		for(var i = n*18; i < n*36; i = i + 18){
			this.norm[i] = this.norm[k-n*18];
			this.norm[i+1] = this.norm[k-n*18+1];
			this.norm[i+2] = this.norm[k-n*18+2];
			this.norm[i+3] = this.norm[k-n*18+6];
			this.norm[i+4] = this.norm[k-n*18+7];
			this.norm[i+5] = this.norm[k-n*18+8];
			this.norm[i+6] = this.norm[i+3];
			this.norm[i+7] = this.norm[i+4];
			this.norm[i+8] = -this.norm[i+5];
			this.norm[i+9] = this.norm[i];
			this.norm[i+10] = this.norm[i+1];
			this.norm[i+11] = this.norm[i+2];
			this.norm[i+12] = this.norm[i+6];
			this.norm[i+13] = this.norm[i+7];
			this.norm[i+14] = this.norm[i+8];
			this.norm[i+15] = this.norm[i];
			this.norm[i+16] = this.norm[i+1];
			this.norm[i+17] = -this.norm[i+2];
			k += 9;
		}
		
		this.color = color;
		
		//create the transformation matrices
		this.scaleMatrix = new Matrix4();
		this.translateMatrix = new Matrix4();
		this.rotateXMatrix = new Matrix4();
		this.rotateYMatrix = new Matrix4();
		this.rotateZMatrix = new Matrix4();
	}
	
	translate(x, y, z) {
		this.translateMatrix.setTranslate(x, y, z);
	}
	
	rotateX(angle) {
		this.rotateXMatrix.setRotate(angle, 1, 0, 0);
	}
	
	rotateY(angle) {
		this.rotateYMatrix.setRotate(angle, 0, 1, 0);
	}
	
	rotateZ(angle) {
		this.rotateZMatrix.setRotate(angle, 0, 0, 1);
	}
	
	scale(x, y, z) {
		this.scaleMatrix.setScale(x, y, z);
	}
}