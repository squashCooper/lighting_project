//citation: https://codepen.io/dbrandt/pen/mEbqZz


class Cube {
    constructor() {
        this.type = 'cube';
  //      this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.textureNumber = -1; 
    //    this.size = 5.0;
     //   this.segments = 10;
     
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.shiny = 0;  
       

    }

    render() {
      //  var xy = this.position;
        var rgba = this.color;
       // var size = this.size;

    
      gl.uniform1i(u_whichTexture, this.textureNumber);
      gl.uniform1i(u_shiny, this.shiny);
        // Pass the color of a point to u_FragColor variable 
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw
       // var d = this.size/200.0;
       // let angleStep = 360/this.segments;
        
       // for(var angle = 0; angle < 360; angle = angle + angleStep) {
         //   let centerPt = [xy[0], xy[1]];
           // let angle1 = angle;
           // let angle2 = angle+angleStep;
            
          //  let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
           // let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
            
           // let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
            //let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

            // Draw triangle from center point to two points on the circle
            //drawTriangle([
              //  xy[0], xy[1],      // center point
                //pt1[0], pt1[1],    // first point on circle
                //pt2[0], pt2[1]     // second point on circle
            //]);
        //}

// Front face

drawTriangle3DUVNormal([0,0,0, 1,0,0, 1,1,0], [0,0, 1,0, 1,1], [0,0,1, 0,0,1, 0,0,1]);
drawTriangle3DUVNormal([0,0,0, 1,1,0, 0,1,0], [0,0, 1,1, 0,1], [0,0,1, 0,0,1, 0,0,1]);

// Top face

drawTriangle3DUVNormal([0,1,0, 1,1,0, 1,1,1], [0,0, 1,0, 1,1], [0,1,0, 0,1,0, 0,1,0]);    // First triangle
drawTriangle3DUVNormal([0,1,0, 1,1,1, 0,1,1], [0,0, 1,1, 0,1], [0,1,0, 0,1,0, 0,1,0]);    // Second triangle

// Back face
drawTriangle3DUVNormal([0,0,1, 1,0,1, 1,1,1], [1,0, 0,0, 0,1], [0,0,1, 0,0,1, 0,0,1]); 
drawTriangle3DUVNormal([0,0,1, 1,1,1, 0,1,1], [1,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);

// Bottom face

drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,1, 1,0, 1,1], [0,-1, 0,   0,-1,0, 0,-1,0]);
drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,1, 0,0, 1,0], [0,-1, 0,   0,-1,0, 0,-1,0]);

// Right face

drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);

// Left face

drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1], [1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1], [1,0, 0,1, 0,0], [-1,0,0, -1,0,0, -1,0,0]);
    }

   

renderfast(){
  //  var xy = this.position;
    var rgba = this.color;
   // var size = this.size;


  gl.uniform1i(u_whichTexture, this.textureNumber);

    // Pass the color of a point to u_FragColor variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


    var allverts = [];
    var uv = [];
   // Front face
allverts = allverts.concat([0,0,0, 1,0,0, 1,1,0]);
uv = uv.concat([0,0, 1,0, 1,1]);      
allverts = allverts.concat([0,0,0, 1,1,0, 0,1,0]);
uv = uv.concat([0,0, 1,1, 0,1]);       

// Top face
allverts = allverts.concat([0,1,0, 1,1,0, 1,1,1]);
uv = uv.concat([0,0, 1,0, 1,1]);       
allverts = allverts.concat([0,1,0, 1,1,1, 0,1,1]);
uv = uv.concat([0,0, 1,1, 0,1]);    
// Right face
allverts = allverts.concat([1,0,0, 1,1,0, 1,1,1]);
uv = uv.concat([0,0, 0,1, 1,1]);     
allverts = allverts.concat([1,0,0, 1,1,1, 1,0,1]);
uv = uv.concat([0,0, 1,1, 1,0]);    



//if there are problems they start after this comment 
// Left face
allverts = allverts.concat([0,0,0, 0,1,0, 0,1,1]);
uv = uv.concat([1,0, 1,1, 0,1]);      
allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);
uv = uv.concat([1,0, 0,1, 0,0]);       




// Bottom face
allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
uv = uv.concat([0,1, 1,1, 1,0]);     
allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);
uv = uv.concat([0,1, 1,0, 0,0]);   

// Back face
allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
uv = uv.concat([1,0, 0,1, 0,0]);     
allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
uv = uv.concat([1,0, 1,1, 0,1])

 drawTriangle3DUV(allverts, uv);



}
}
