class Sphere {
    constructor(color) {
        this.color = color;
        
		var n = document.getElementById("n").value;
		n = n*1;
		
        let vertices = this.createVertices(n);

        // Create vertices
        this.coor = new Float32Array(vertices);

        // Create Indices
        this.poly = new Uint16Array(this.createIndices(n));

        // Create Normals (note that in spheres normals are equal to positions)
        this.norm = new Float32Array(vertices);
		
		this.normals = this.norm;
		
		//create the transformation matrices
		this.scaleMatrix = new Matrix4();
		this.translateMatrix = new Matrix4();
		this.rotateXMatrix = new Matrix4();
		this.rotateYMatrix = new Matrix4();
		this.rotateZMatrix = new Matrix4();
    }

    createVertices(n) {
        let vertices = [];

        // Generate coordinates
        for (let j = 0; j <= n; j++) {
          let aj = j * Math.PI / n;
          let sj = Math.sin(aj);
          let cj = Math.cos(aj);
          for (let i = 0; i <= n; i++) {
            let ai = i * 2 * Math.PI / n;
            let si = Math.sin(ai);
            let ci = Math.cos(ai);

            vertices.push(si * sj);  // x
            vertices.push(cj);       // y
            vertices.push(ci * sj);  // z
          }
        }

        return vertices;
    }

    createIndices(n) {
        let indices = [];

        // Generate indices
        for (let j = 0; j < n; j++) {
          for (let i = 0; i < n; i++) {
            let p1 = j * (n+1) + i;
            let p2 = p1 + (n+1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
          }
        }

        return indices;
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
