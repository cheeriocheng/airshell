"use strict";

class Seashell {


  constructor(){
    //default: boat ear mooon 
    this.A =   2.5; //2.5
    
    this.deltaTheta = degToRad(18) ; //degrees per new session //18 23
    
    this.minStep = 2;   //allow gaps in first few rings
    this.D = 1 ;  //direction : 1 or -1 
    this.steps = 45; //30,100 how many ellipses C to draw
    this.cSteps = 12; //18 how many straight lines makes an ellipse C
    this.alpha= degToRad(83);  //83
    this.beta=degToRad(25);  //42 how steep the cone of spiral is 
    this.phi=degToRad(70);  //70
    this.mu=degToRad(10);  //10 how twisty the spiral is 
    this.omega=degToRad(30);  //30 ,  70
    
    //opening of the tube 
    this.a=1.3; //1.2 /1.5
    this.b=1.76; //2.0/1/5

    //extrusion
    this.eA = .5; // 1.2;
    this.eB = .5; // 1.2;
    
    this.L=0; //2
    this.P=4; 
    this.W1=5; 
    this.W2=3; 
    this.N=18;

    this._spiral = null;
    this._shell = null; 
  }
  
  // loadMoon(){
  //     this.A =   2.5; //2.5
 
  //     this.deltaTheta = degToRad(18) ; //degrees per new session //18 23
      
  //     this.minStep = 2;   //allow gaps in first few rings
  //     this.D = 1 ;  //direction : 1 or -1 
  //     this.steps = 55; //30,100 how many ellipses C to draw
  //     this.cSteps = 18; //18 how many straight lines makes an ellipse C
  //     this.alpha= degToRad(82.5);  //83
  //     this.beta=degToRad(25);  //42 how steep the cone of spiral is 
  //     this.phi=degToRad(70);  //70
  //     this.mu=degToRad(10);  //10 how twisty the spiral is 
  //     this.omega=degToRad(30);  //30 ,  70
      
  //     //opening of the tube 
  //     this.a=1.34; //1.2 /1.5
  //     this.b=1.76; //2.0/1/5

  //     //extrusion
  //     this.eA = 1.2; // 1.2;
  //     this.eB = 1.2; // 1.2;
   
  //     this.L=0; //2
  //     this.P=4; 
  //     this.W1=5; 
  //     this.W2=3; 
  //     this.N=18;

  // }



  updateParams( p )
  {

    // this.loadMoon(); 


    //// get data from UI 
    // this.A = p["A"];
    // this.turns = p["turns"];
    // this.deltaTheta = degToRad(p["deltaTheta"]);
    // this.D = p["D"];
    // this.steps = p["steps"];
    // this.cSteps = p["cSteps"];
    this.alpha = degToRad(p["alpha"]);
    this.beta = degToRad(p["beta"]);
    // this.phi = degToRad(p["phi"]);
    // this.mu = degToRad(p["mu"]);
    // this.omega = degToRad(p["omega"]);
    this.a = p["ellipse_a"];
          

    //generates this._spiral
    this.calcSpiral();
  }

  //equal angular steps means many small steps at the center of the shell,
  //which is a lot of triangles wasted on small area
  //this also jams support material inside model
 //while distance is smaller than step, keep adding to theta 
  getNextVertexOnSpiral(theta , lastVertex ){
    
    theta += this.deltaTheta;
    var newVertex = this.getVertexAtTheta(theta);
    var dist = newVertex.distanceTo(lastVertex); 

    while(dist< this.minStep ) {
     theta += this.deltaTheta;
     newVertex = this.getVertexAtTheta(theta);
     dist = newVertex.distanceTo(lastVertex); 
    }

    return [theta , newVertex] ;
  }

  getRadAtTheta(theta){
    return  Math.exp( theta * Math.cos(this.alpha) / Math.sin(this.alpha) );
  }

  getVertexAtTheta(theta){
      
    var rad = this.getRadAtTheta(theta);
    
    var x =  this.A * rad * Math.sin(this.beta) * Math.cos(theta) * this.D;
    var y =  this.A * rad * Math.sin(this.beta) * Math.sin(theta);
    var z = -this.A * rad * Math.cos(this.beta);    

    return new THREE.Vector3(x,y,z);

  }

  calcSpiral(){
      var spiralPointArray = [];
      var shellEllipseArray = [];
    
      // console.log ("generating spiral. total steps in spiral: ", this.steps); 
      var theta = 0 ;  
      var rad; 
      var lastVertex = this.getVertexAtTheta(theta ); 
      
      for ( var i = 0; i < this.steps; i ++ ) {
                   
          // //V1 equal angualar increments ----
          theta +=  this.deltaTheta ; // maplinear (i, 0, n, 0, turns);
          rad = Math.exp( theta * Math.cos(this.alpha) / Math.sin(this.alpha) );     
          var newVertex = this.getVertexAtTheta (theta) ;

          //V2 minimal space between steps ---
          //  var newVertex; 
          // [theta, newVertex] = this.getNextVertexOnSpiral(theta, lastVertex ); 
          // // console.log(i, newVertex);
          // rad = this.getRadAtTheta (theta);
         
          //Qtip : keep newVertex at (0,0,0) to make a furball

          spiralPointArray.push(newVertex);
          lastVertex = newVertex; 

          // Generate ellipse around each point of spiral
          shellEllipseArray[i] = [];
        
         
          for (var j = 0; j < this.cSteps ; j++) 
          {
            
            var s= j * Math.PI * 2.0 / this.cSteps;  //angular step around the ellipse 

           //   console.log (s); 
            var r2 = Math.pow( Math.pow(Math.cos(s)/this.a,2) + Math.pow(Math.sin(s)/this.b,2), -0.5 ); //radius at this given angle s
       
           // //  // add surface manipulations
           var surfrad = 0;
            if (this.W1==0 || this.W2==0 || this.N==0) surfrad = 0;
            else {
              var lt = (Math.PI * 2 / this.N) * ( this.N* theta / Math.PI / 2 - Math.round(this.N* theta / Math.PI / 2) );
              surfrad = this.L * Math.exp( -( Math.pow(2*(s-this.P)/this.W1, 2) + Math.pow(2*lt/this.W2, 2) ) );          
            }
    //         console.log(surfrad)       ;
           r2 += surfrad;
                // console.log(r2)       ;


            var ellipseX = lastVertex.x + Math.cos(s + this.phi) * Math.cos(theta + this.omega) * r2 * rad * this.D;   // here  rad - 1 closes the opening of the curve at the origin
            var ellipseY = lastVertex.y + Math.cos(s + this.phi) * Math.sin(theta + this.omega) * r2 * rad;
            var ellipseZ = lastVertex.z + Math.sin(s + this.phi) * r2 * rad;
            
            // adjust orientation of the 
            // x -= Math.sin(this.mu) * Math.sin(s + this.phi) * Math.sin(theta + this.omega) * r2;
            ellipseX -= Math.sin(this.mu) * Math.sin(s + this.phi) * Math.sin(theta + this.omega) * r2 * rad ;

            // y += Math.sin(this.mu) * Math.sin(s + this.phi) * Math.cos(theta + this.omega) * r2 ;
            ellipseY += Math.sin(this.mu) * Math.sin(s + this.phi) * Math.cos(theta + this.omega) * r2 * rad;

        
            
            shellEllipseArray[i].push(new THREE.Vector3(ellipseX,ellipseY,ellipseZ));
            
          }
       }

      // Return complete curve.
      this._spiral = spiralPointArray;
      //and 
      this._shell = shellEllipseArray; 
  }

// render spiral spine 
  renderSpine(scene, ifRenderSpine){
    
  

    if (ifRenderSpine) { 
      // console.log("rendering spine");
      var geometrySpiral = new THREE.Geometry();
      
      for (var i = 0 ; i<this._spiral.length; i++){
        geometrySpiral.vertices.push(this._spiral[i]);  
      }
      var lineMaterial = new THREE.LineBasicMaterial({
        color: 0xee00ee
      });
      var spineLine = new THREE.Line( geometrySpiral, lineMaterial );
      scene.add( spineLine );
    }
  }

  buildTube( scene, ifRenderTube ) {

    // console.log("building tube");
    // console.log(this);
    var extrudeShapePoints = [], count =60;
    //section 
    var a = this.eA;  //
    var b = this.eB;//1
    var t =0;

    var c =2; //0.2 
    var k = 3 ; //5
    var tempX;
    var tempY;

    var extrudeMaterial = new THREE.MeshLambertMaterial( {
     color: 0xeeeeee, 
     wireframe: false,

   } );
    var extrudeMaterial = new THREE.MeshPhongMaterial( {
                
                color: 0xeeeeee,
                specular: 0x6698AA,
                reflectivity: 0.5,
                shading: THREE.SmoothShading
              } );


    for ( var i = 0; i < count; i ++ ) {
        
      t = 2 * i / count * Math.PI;
      tempX = Math.cos( t ) * b; 
      tempY = Math.sin( t ) * a; 

      // tempX += c* Math.cos(t)*  Math.cos(t*k) ;
      // tempY += c* Math.cos(t)*  Math.sin(t*k) ;

      extrudeShapePoints.push( new THREE.Vector2 ( tempX, tempY));
    }

    var extrudeShape = new THREE.Shape( extrudeShapePoints );

  
    // add tube mesh for each point on the spiral 
    var l = this._spiral.length ;  
    for (var i = 3 ; i<l; i++){

      // geometrySpiral.vertices.push(this._spiral[i]);  
      var oneEllipse = new THREE.Geometry(); 
       
      // var c = 0x011000 + 0x0000e0* i;

      for (var j = 0 ; j < this._shell[i].length; j++){
      // for (var j = this._shell[i].length-1; j >=0  ; j--){
        // oneEllipse= new THREE.Geometry(); 
        oneEllipse.vertices.push(this._shell[i][j]);  
      }
      // oneEllipse.vertices.push(this._shell[i][0]);  //completes full loop

   

      var extrusionSpline =  new THREE.CatmullRomCurve3( oneEllipse.vertices );
      extrusionSpline.type = 'catmullrom';
      extrusionSpline.closed = true;
      var extrudeSettings = {
        steps           : this.cSteps*2, //int. number of points used for subdividing segements of extrude spline 
        bevelEnabled    : false,
        extrudePath     : extrusionSpline
      };
      

      var extrudeGeometry = new THREE.ExtrudeGeometry( extrudeShape, extrudeSettings );

      if(ifRenderTube){
         var mesh = new THREE.Mesh( extrudeGeometry, extrudeMaterial );
         
         // var mesh = new THREE.Mesh( extrudeGeometry, skyBoxMaterial );
        scene.add( mesh );  
      } 
    }
  }


}


function degToRad (deg){
    return deg*Math.PI/180.0; 
}