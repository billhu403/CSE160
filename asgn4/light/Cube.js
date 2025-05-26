class Cube{
    constructor(){
      this.type = 'cube';
      //this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      //this.size = 5.0;
      //this.segments = 3.0;
      this.matrix = new Matrix4();
      this.normalMatrix = new Matrix4();
      this.textureNum = -2;
      this.cubeVerts32 = new Float32Array([
        0,0,0,  1,1,0,  1,0,0,
        0,0,0,  0,1,0,  1,1,0,
        0,1,0,  0,1,1,  1,1,1,
        0,1,0,  1,1,1,  1,1,0,
        0,0,0, 0,0,1, 1,0,1,
        0,0,0, 1,0,1, 1,0,0,
        0,0,0, 0,1,0, 0,1,1,
        0,0,0, 0,1,1, 0,0,1,
        1,0,0, 1,0,1, 1,1,1,
        1,0,0, 1,1,1, 1,1,0,
        0,0,1, 1,1,1, 1,0,1,
        0,0,1, 0,1,1, 1,1,1


      ])

      this.cubeVerts =[
        0,0,0,  1,1,0,  1,0,0,
        0,0,0,  0,1,0,  1,1,0,
        0,1,0,  0,1,1,  1,1,1,
        0,1,0,  1,1,1,  1,1,0,
        0,0,0, 0,0,1, 1,0,1,
        0,0,0, 1,0,1, 1,0,0,
        0,0,0, 0,1,0, 0,1,1,
        0,0,0, 0,1,1, 0,0,1,
        1,0,0, 1,0,1, 1,1,1,
        1,0,0, 1,1,1, 1,1,0,
        0,0,1, 1,1,1, 1,0,1,
        0,0,1, 0,1,1, 1,1,1
      ]
      this.cubeUVs32 = new Float32Array([
        0,0, 1,1, 1,0,
        0,0, 0,1, 1,1,
  
        0,0, 0,1, 1,1,
        0,0, 1,1, 1,0,
  
        0,0, 0,1, 1,1,
        0,0, 1,1, 1,0,
 
        0,0, 0,1, 1,1,
        0,0, 1,1, 1,0,
 
        0,0, 1,0, 1,1,
        0,0, 1,1, 0,1,
 
        0,0, 1,1, 1,0,
        0,0, 0,1, 1,1
      ])
}

    render() {
      var rgba = this.color;
      gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

      // FRONT
      drawTriangle3DUVNormal([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
      drawTriangle3DUVNormal([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);
      //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
      // TOP
      drawTriangle3DUVNormal([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
      drawTriangle3DUVNormal([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);
      
    
      
      // BOTTOM
      drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
      drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
    
      
      // LEFT
      
      drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
      drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);
    
      // RIGHT
      
      drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);
      drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,1,0], [0,0, 1,1, 0,1], [1,0,0, 1,0,0, 1,0,0]);
    
      // BACK
      
      drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);
      drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
    }

    renderfast() {
      var rgba = this.color;
      //gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
      var allverts = [];
      // FRONT
      allverts = allverts.concat([0,0,0,  1,1,0,  1,0,0]);
      allverts = allverts.concat([0,0,0,  0,1,0,  1,1,0]);
      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
      // TOP
      allverts = allverts.concat([0,1,0,  0,1,1,  1,1,1]);
      allverts = allverts.concat([0,1,0,  1,1,1,  1,1,0]);
    
      // BOTTOM
      allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
      allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);
    
      // LEFT
      allverts = allverts.concat([0,0,0, 0,1,0, 0,1,1]);
      allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);
    
      // RIGHT
      allverts = allverts.concat([1,0,0, 1,0,1, 1,1,1]);
      allverts = allverts.concat([1,0,0, 1,1,1, 1,1,0]);
    
      // BACK
      allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
      allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);

      drawTriangle3D(allverts);
    }

    renderfaster(){
      const rgba = this.color;
      gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      if (!Cube.vertexBuffer) Cube.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);

  
      if (!Cube.uvBuffer) Cube.uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs32, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_UV);

      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}