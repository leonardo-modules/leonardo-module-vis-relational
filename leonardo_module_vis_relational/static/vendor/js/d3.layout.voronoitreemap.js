// convexhull.js

var epsilon = 1E-10;

// IN: vectors or dertices
var dot = function(v1, v2){
    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z); 
}

// IN: Face face
var Plane3D = function(face){
    var p1 = face.verts[0];
    var p2 = face.verts[1];
    var p3 = face.verts[2];
    this.a=p1.y*(p2.z-p3.z)+p2.y*(p3.z-p1.z)+p3.y*(p1.z-p2.z);
    this.b=p1.z*(p2.x-p3.x)+p2.z*(p3.x-p1.x)+p3.z*(p1.x-p2.x);
    this.c=p1.x*(p2.y-p3.y)+p2.x*(p3.y-p1.y)+p3.x*(p1.y-p2.y);
    this.d=-1*(p1.x*(p2.y*p3.z-p3.y*p2.z)+p2.x*(p3.y*p1.z-p1.y*p3.z)+p3.x*(p1.y*p2.z-p2.y*p1.z));	
}
// OUT: int2D
Plane3D.prototype.getDualPointMappedToPlane = function(){
    var nplane = this.getNormZPlane();
    var dualPoint = new Point2D(nplane[0]/2, nplane[1]/2);
    return dualPoint;
}
Plane3D.prototype.getNormZPlane = function(){
    return [
        -1 * (this.a / this.c),
        -1 * (this.b / this.c),
        -1 * (this.d / this.c)
    ];
}

// IN: doubles x and y
var Point2D = function(x,y){
    this.x = x;
    this.y = y;
}

// IN: boolean face
var ConflictList = function(face){
    this.face = face;
    this.head = null;
}
// IN: GraphEdge
ConflictList.prototype.add = function(e){
    if(this.head === null){
	this.head = e;
    }else{
	if(this.face){//Is FaceList
	    this.head.prevv = e;
	    e.nextv = this.head;
	    this.head = e;
	}else{//Is VertexList
	    this.head.prevf = e;
	    e.nextf = this.head;
	    this.head = e;
	}
    }
}
ConflictList.prototype.empty = function() {
    return this.head === null;
}
// Array of faces visible
ConflictList.prototype.fill = function(visible) {
    if(this.face){
	return;
    }
    var curr = this.head;
    do{
	visible.push(curr.face);
	curr.face.marked = true;
	curr = curr.nextf;
    }while(curr !== null);
}
ConflictList.prototype.removeAll = function() {
    if(this.face){//Remove all vertices from Face
        var curr = this.head;
	do{
	    if(curr.prevf === null){//Node is head
		if(curr.nextf === null){
		    curr.vert.conflicts.head = null;
		}else{
		    curr.nextf.prevf = null;
		    curr.vert.conflicts.head = curr.nextf;
		}
	    }else{//Node is not head
		if(curr.nextf != null){
		    curr.nextf.prevf = curr.prevf;
                }
		curr.prevf.nextf = curr.nextf;
	    }
	    curr = curr.nextv;
	    if(curr != null){
		curr.prevv = null;
            }
	}while(curr != null);
    }else{//Remove all JFaces from vertex
        var curr = this.head;
	do{
	    if(curr.prevv == null){ //Node is head
		if(curr.nextv == null){
		    curr.face.getList().head = null;
		}else{
		    curr.nextv.prevv = null;
		    curr.face.getList().head = curr.nextv;
		}
	    }else{//Node is not head
		if(curr.nextv != null){
		    curr.nextv.prevv = curr.prevv;
		}
		curr.prevv.nextv = curr.nextv;
	    }
	    curr = curr.nextf;
	    if(curr != null)
		curr.prevf = null;
	}while(curr != null);
    }
    
}
// IN: list of vertices
ConflictList.prototype.getVertices = function(l1) {
    curr = this.head;
    while(curr !== null){
	l1.push(curr.vert);
	curr = curr.nextv;
    }
    return l1;
}



// IN: coordinates x, y, z
var Vertex = function(x, y, z, weight, orig, isDummy, percentage) {
    this.x = x;
    this.y = y;
    this.index = 0;
    this.conflicts = new ConflictList(false);
    this.neighbours = null; // Potential trouble
    this.nonClippedPolygon = null;
    this.polygon = null;
    
    this.percentage = percentage;

    if (orig == undefined){
        this.originalObject = null;
    }
    else{
        this.originalObject = orig;
    }
    if (isDummy != undefined){
        this.isDummy = isDummy;
    }
    else{
        this.isDummy = false;
    }

    if (weight != null){
        this.weight = weight;
    }
    else{
        this.weight = epsilon;        
    }

    if (z != null){
        this.z = z;
    }
    else{
        this.z = this.projectZ(this.x, this.y, this.weight);
    }
}
Vertex.prototype.setWeight = function(weight){
    this.weight = weight;
    this.z = this.projectZ(this.x, this.y, this.weight);
}
Vertex.prototype.projectZ = function(x, y, weight){
    return ((x*x) + (y*y) - weight);
}
Vertex.prototype.subtract = function(v){
    return new Vertex(v.x - this.x, v.y - this.y, v.z - this.z);
}
Vertex.prototype.crossproduct = function(v){
    return new Vertex((this.y * v.z) - (this.z * v.y), (this.z * v.x) - (this.x * v.z), (this.x * v.y) - (this.y *v.x)); }
Vertex.prototype.equals = function(v){
    return (this.x === v.x && this.y === v.y && this.z === v.z);
}


// IN: coordinates x, y, z
var Vector = function(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
}
Vector.prototype.negate = function(){
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
}

// Normalizes X Y and Z in-place
Vector.prototype.normalize = function(){
    var len = Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    if (len > 0){
        this.x /= len;
        this.y /= len;
        this.z /= len;
    }
}

// IN: Vertices a, b, c
var Face = function(a, b, c, orient){
    this.conflicts = new ConflictList(true);
    this.verts = [a,b,c];
    this.marked = false;
    var t = ((a.subtract(b)).crossproduct(b.subtract(c)));
    // var t = (this.verts[0].subtract(this.verts[1])).crossproduct(this.verts[1].subtract(this.verts[2]));
    
    this.normal = (new Vector(-t.x, -t.y, -t.z));
    this.normal.normalize();
    this.createEdges();
    this.dualPoint = null;

    if (orient != undefined){
        this.orient(orient);
    }
}
// OUT: Point2D
Face.prototype.getDualPoint = function(){
    if (this.dualPoint == null){
        var plane3d = new Plane3D(this);
        this.dualPoint = plane3d.getDualPointMappedToPlane();
    }
    return this.dualPoint;
}
Face.prototype.isVisibleFromBelow = function(){
    return (this.normal.z < -1.4259414393190911E-9);
}
Face.prototype.createEdges = function(){
    this.edges = [];
    this.edges[0] = new HEdge(this.verts[0], this.verts[1], this);
    this.edges[1] = new HEdge(this.verts[1], this.verts[2], this);
    this.edges[2] = new HEdge(this.verts[2], this.verts[0], this);
    this.edges[0].next = this.edges[1];
    this.edges[0].prev = this.edges[2];
    this.edges[1].next = this.edges[2];
    this.edges[1].prev = this.edges[0];
    this.edges[2].next = this.edges[0];
    this.edges[2].prev = this.edges[1];
}
// IN: vertex orient
Face.prototype.orient = function(orient){
    if (!(dot(this.normal,orient) < dot(this.normal, this.verts[0]))){
        var temp = this.verts[1];
        this.verts[1] = this.verts[2];
        this.verts[2] = temp;
        this.normal.negate();
        this.createEdges();
    }
}
// IN: two vertices v0 and v1
Face.prototype.getEdge = function(v0, v1){
    for (var i = 0; i < 3; i++){
        if (this.edges[i].isEqual(v0,v1)){
            return this.edges[i];
        }
    }
    return null;
}
// IN: Face face, vertices v0 and v1
Face.prototype.link = function(face, v0, v1){
    if (face instanceof Face){
        var twin = face.getEdge(v0, v1);
        if (twin === null){
            // error
            console.log("ERROR: twin is null");
        }
        var edge = this.getEdge(v0, v1);
        twin.twin = edge;
        edge.twin = twin;
    } 
    else{
        var e = face;
        var edge = this.getEdge(e.orig, e.dest);
        e.twin = edge;
        edge.twin = e;
    }
}
// IN: vertex v
Face.prototype.conflict = function(v){
    return (dot(this.normal, v) > dot(this.normal, this.verts[0]) + epsilon);
}
Face.prototype.getHorizon = function(){
    for (var i = 0; i < 3; i++){
        if (this.edges[i].twin !== null && this.edges[i].twin.isHorizon()){
            return this.edges[i];
        }
    }
    return null;
}
Face.prototype.removeConflict = function(){
    this.conflicts.removeAll();
}


// IN: vertex orig, vertex dest, Face face
var HEdge = function(orig, dest, face){
    this.next = null;
    this.prev = null;
    this.twin = null;
    this.orig = orig;
    this.dest = dest;
    this.iFace = face;
}
HEdge.prototype.isHorizon = function(){
    return this.twin !== null && this.twin.iFace.marked && !this.iFace.marked;
}

// IN: array horizon
HEdge.prototype.findHorizon = function(horizon) {
    if (this.isHorizon()) {
	if (horizon.length > 0 && this === horizon[0]) {
	    return;
	} else {
	    horizon.push(this);
	    this.next.findHorizon(horizon);
	}
    } else {
	if (this.twin !== null) {
	    this.twin.next.findHorizon(horizon);
	}
    }
}
// IN: vertices origin and dest
HEdge.prototype.isEqual = function(origin, dest){
    return ((this.orig.equals(origin) && this.dest.equals(dest)) || (this.orig.equals(dest) && this.dest.equals(origin)));
}

var GraphEdge = function(face, vert){
    this.face = face;
    this.vert = vert;
    this. nextf = null;
    this.prevf = null;
    this.nextv = null;
    this.prevv = null;
}


var ConvexHull = {

    points: [],
    facets: [],
    created: [],
    horizon: [],
    visible: [],
    current: 0,

    // IN: sites (x,y,z)
    init: function(boundingSites, sites){
        this.points = [];
        for (var i = 0; i < sites.length; i++){
            this.points[i] = new Vertex(sites[i].x, sites[i].y, sites[i].z, null, sites[i], false);
        }
        
        
        // var temppoints = boundingSites.map(function(a) {return new Vertex(a[0], a[1], a[2], null, new Vertex(a[0], a[1], a[2], null, null, true), true);});

//        this.points = this.points.concat(temppoints);
        this.points = this.points.concat(boundingSites);


//         for (var i = 0; i < this.points.length; i++){
//             var p = this.points[i];            
        //            console.log(p.x + ", " + p.y + ", " + p.z)
//         }

    },

    permutate: function(){
        var pointSize = this.points.length;
        for (var i = pointSize -1; i > 0; i--){
            var ra = Math.floor(Math.random()*i);
            var temp = this.points[ra];
            temp.index = i;
            var currentItem = this.points[i];
            currentItem.index = ra;
            this.points.splice(ra, 1, currentItem);
            this.points.splice(i, 1, temp);
        }
    },

    prep: function(){
        if (this.points.length <= 3){
            // error
            console.log("ERROR: Less than 4 points");
        }

        // set vertex indices
        for (var i = 0; i <  this.points.length; i++){
            this.points[i].index = i;
        }

        var v0, v1, v2, v3;
        var f1, f2, f3, f0;
        v0 = this.points[0];
        v1 = this.points[1];
        v2 = v3 = null;
        
        for (var i = 2; i < this.points.length; i++){
            if (!(this.linearDependent(v0, this.points[i]) && this.linearDependent(v1, this.points[i]))){
                v2 = this.points[i];
                v2.index = 2;
                this.points[2].index = i;
                this.points.splice(i, 1, this.points[2]);
                this.points.splice(2, 1, v2);
                break;
            }
        }
        if (v2 === null){
            // error
            console.log("ERROR: v2 is null");
        }

        f0 = new Face(v0, v1, v2);
        for (var i = 3; i < this.points.length; i++){
            if (dot(f0.normal, f0.verts[0]) !== dot(f0.normal, this.points[i])) {
                v3 = this.points[i];
                v3.index = 3;
                this.points[3].index = i;
                this.points.splice(i, 1, this.points[3]);
                this.points.splice(3,1,v3);
                break;
            }
        }

        if (v3 === null){
            //error
            console.log("ERROR: v3 is null");
        }
        
        f0.orient(v3);
        f1 = new Face(v0,v2,v3,v1);
        f2 = new Face(v0,v1,v3,v2);
	f3 = new Face(v1,v2,v3,v0);
	
	this.addFacet(f0);
	this.addFacet(f1);
	this.addFacet(f2);
	this.addFacet(f3);
	//Connect facets
	f0.link(f1, v0, v2);
	f0.link(f2,v0,v1);
	f0.link(f3,v1,v2);
	f1.link(f2,v0,v3);
	f1.link(f3, v2, v3);
	f2.link(f3,v3,v1);

        this.current = 4;
        
        var v;
	for(var i = this.current; i < this.points.length; i++){
	    v = this.points[i];
	    if(f0.conflict(v)){
		this.addConflict(f0,v);
	    }
	    //!f1.behind(v)
	    if(f1.conflict(v)){
		this.addConflict(f1,v);
	    }
	    if(f2.conflict(v)){
		this.addConflict(f2,v);
	    }
	    if(f3.conflict(v)){
		this.addConflict(f3,v);
	    }
	}		


    },

    // IN: Faces old1 old2 and fn
    addConflicts: function(old1, old2, fn){
	//Adding the vertices
        var l1 = [];
        old1.conflicts.getVertices(l1);
	var l2 = [];
        old2.conflicts.getVertices(l2);
	var nCL = [];
	var v1,v2;
	var i,l;
	var i = l = 0;
	//Fill the possible new Conflict List
	while(i < l1.length || l < l2.length){
	    if(i < l1.length && l < l2.length){
		v1 = l1[i];
		v2 = l2[l];
		//If the index is the same, its the same vertex and only 1 has to be added
		if(v1.index === v2.index){
		    nCL.push(v1);
		    i++;
		    l++;
		}else if(v1.index > v2.index){
		    nCL.push(v1);
		    i++;
		}else{
		    nCL.push(v2);
		    l++;
		}
	    }else if( i < l1.length){
		nCL.push(l1[i++]);
	    }else{
		nCL.push(l2[l++]);
	    }
	}
	//Check if the possible conflicts are real conflicts
	for(var i = nCL.length -1; i >= 0; i--){
	    v1 = nCL[i];
	    if(fn.conflict(v1))
		this.addConflict(fn,v1);
	}
    },

    // IN: Face face, Vertex v
    addConflict: function(face, vert){
        var e = new GraphEdge(face, vert);
        face.conflicts.add(e);
        vert.conflicts.add(e);
    },

    // IN: Face f
    removeConflict: function(f){
        f.removeConflict();
        var index = f.index;
	f.index = -1;
	if(index === this.facets.length - 1){
	    this.facets.splice(this.facets.length - 1, 1);
	    return;
	}
	if(index >= this.facets.length|| index < 0)
	    return;
	var last = this.facets.splice(this.facets.length - 1, 1);
	last[0].index = index;
	this.facets.splice(index, 1, last[0]);

    },

    // IN: Face face
    addFacet: function(face){
        face.index = this.facets.length;
        this.facets.push(face);
    },

    compute: function(){
        this.prep();

        while(this.current < this.points.length){
            var next = this.points[this.current];

            if (next.conflicts.empty()){ //No conflict, point in hull
		this.current++;
		continue;
	    }
	    this.created = [];// TODO: make sure this is okay and doesn't dangle references
	    this.horizon = []; 
	    this.visible = [];
	    //The visible faces are also marked
	    next.conflicts.fill(this.visible);
	    //Horizon edges are orderly added to the horizon list
	    var e;
	    for(var jF = 0; jF < this.visible.length; jF++){
		e = this.visible[jF].getHorizon();
		if(e !== null){
		    e.findHorizon(this.horizon);
		    break;
		}
	    }

            var last = null, first = null;

	    //Iterate over horizon edges and create new faces oriented with the marked face 3rd unused point
	    for(var hEi = 0; hEi < this.horizon.length; hEi++){
                var hE = this.horizon[hEi];
		var fn = new Face(next,hE.orig,hE.dest,hE.twin.next.dest);
		fn.conflicts = new ConflictList(true);
		
		//Add to facet list
		this.addFacet(fn);
		this.created.push(fn);
		
		//Add new conflicts
		this.addConflicts(hE.iFace,hE.twin.iFace,fn);
		
		//Link the new face with the horizon edge
		fn.link(hE);
		if(last !== null)
		    fn.link(last, next, hE.orig);
		last = fn;
		if(first === null)
		    first = fn;
	    }
	    //Links the first and the last created JFace
	    if(first !== null && last !== null){
		last.link(first, next, this.horizon[0].orig);
	    }
	    if(this.created.length != 0){
		//update conflict graph
		for(var f = 0; f <  this.visible.length; f++){
		    this.removeConflict(this.visible[f]);
		}
		this.current++;
		this.created = [];
	    }
	}
	return this.facets;
    },

    // IN: two vertex objects, p1 and p2
    // OUT: true if they are linearly dependent, false otherwise
    linearDependent: function(p1, p2){
        if (p1.x == 0 && p2.x == 0){
            if (p1.y == 0 && p2.y == 0){
                if (p1.z == 0 && p2.z == 0){
                    return true;
                }
                if (p1.z == 0 || p2.z == 0){
                    return false;
                }
            }
            if (p1.y == 0 || p2.y == 0){
                return false;
            }
            if (p1.z/p1.y >= p2.z / p2.y - epsilon && p1.z / p1.y <= p2.z / p2.y + epsilon){
                return true;
            }
            else{
                return false;
            }
        }
        if (p1.x == 0 || p1.x == 0){
            return false;
        }
        if (p1.y/p1.x <= p2.y/p2.x + epsilon && p1.y / p1.x >= p2.y / p2.x - epsilon && p1.z / p1.x >= p2.y / p2.x - epsilon && p1.z / p1.x <= p2.z / p2.x + epsilon){
            return true;
        }
        else{
            return false;
        }
    },

    clear: function(){
        this.points = [];
        this.facets = [];
        this.created = [];
        this.horizon = [];
        this.visible = [];
        this.current = 0;
    }
}


// powerdiagram.js



// IN: sites and weights
// OUT: sites with Z coordinate based on X,Y,and W
function applyDeltaPi(S, W){
    var result = [];
    for (var i = 0; i < S.length; i++){
        var x = S[i].p[0], y = S[i].p[1], w = W[i];
        result[i] = [x,y, (x*x) + (y*y) - w];
    }

    return result;
}

function max(list){
    var max = null;
    for (var i = 1; i < list.length; i++) {
        if (list[i] > max){
            max = list[i];
        }
    }
    return max;
} 
function min(list){
    var min = null;
    for (var i = 1; i < list.length; i++) {
        if (list[i] < min){
            min = list[i];
        }
    }
    return min;
} 


// As applyDeltaPi, but applies a minimum weight
// IN: sites
// OUT: sites with Z coordinate based on X,Y,and W
function applyDeltaPiToBounds(S){
    var result = [];

    var maxX = max(S.map(function(a) {return a[0];}));
    var minX = min(S.map(function(a) {return a[0];}));
    var maxY = max(S.map(function(a) {return a[1];}));
    var minY = min(S.map(function(a) {return a[1];}));

    var x0 = minX - maxX;
    var x1 = 2 * maxX;
    var y0 = minY - maxY;
    var y1 = 2 * maxY;

    result[0] = [x0, y0, (x0 * x0) + (y0 * y0) - epsilon];
    result[1] = [x1, y0, (x1 * x1) + (y0 * y0) - epsilon];
    result[2] = [x1, y1, (x1 * x1) + (y1 * y1) - epsilon];
    result[3] = [x0, y1, (x0 * x0) + (y1 * y1) - epsilon];

    return result;
}


// IN: HEdge edge
function getFacesOfDestVertex(edge) {
    var faces = [];
    var previous = edge;
    var first = edge.dest;

    var site = first.originalObject;
    var neighbours = [];
    do {
	previous = previous.twin.prev;

	// add neighbour to the neighbourlist
	var siteOrigin = previous.orig.originalObject;
	if (!siteOrigin.isDummy) {
	    neighbours.push(siteOrigin);
	}
	var iFace = previous.iFace;

	if (iFace.isVisibleFromBelow()) {
	    faces.push(iFace);
	}
    } while (previous !== edge);
    site.neighbours = neighbours;
    return faces;
}


// IN: Omega = convex bounding polygon
// IN: S = unique set of sites
// IN: W = set of weights for sites
// OUT: Set of lines making up the voronoi power diagram
// function computePowerDiagram(S, W, boundingPolygon){
//     var sStar = applyDeltaPi(S, W);
//     var width = 1000;
//     var height = 1000;
//     // var temp = [];
//     // temp[0] = [0, 0];
//     // temp[1] = [width, 0];
//     // temp[2] = [width,height];
//     // temp[3] = [0, width];

//     // temp[0] = [-width, -height];
//     // temp[1] = [2 * width,  -height];
//     // temp[2] = [2*width, 2*height];
//     // temp[3] = [-width,  2 * height];
//     var bounds = applyDeltaPiToBounds(boundingPolygon);

//     ConvexHull.clear();

//     ConvexHull.init(bounds, sStar);
    
//     var facets = ConvexHull.compute(sStar);

//     // for (var i = 0; i < facets.length; i++){
//     //     var f = facets[i];
//     //     console.log(i + ": " + f.verts[0].x + ", " + f.verts[1].x + ", " + + f.verts[2].x);
//     // }
    
//     var polygons = [];
//     var vertexCount = ConvexHull.points.length; 
//     var verticesVisited = [];

//     var facetCount = facets.length;
//     for (var i = 0; i < facetCount; i++) {
// 	var facet = facets[i];

// 	if (facet.isVisibleFromBelow()) {

// 	    for (var e = 0; e < 3; e++) {
// 		// got through the edges and start to build the polygon by
// 		// going through the double connected edge list
// 		var edge = facet.edges[e];
// 		var destVertex = edge.dest;
// 		var site = destVertex.originalObject; 

// 		if (!verticesVisited[destVertex.index]) {
// 		    verticesVisited[destVertex.index] = true;
// 		    if (site.isDummy) { // Check if this is one of the
//                         // sites making the bounding polygon
// 			continue;
// 		    }

// 		    // faces around the vertices which correspond to the
// 		    // polygon corner points

// 		    var faces = getFacesOfDestVertex(edge);
//                     var protopoly = [];
// 		    var lastX = null;
// 		    var lastY = null;
// 		    var dx = 1;
//                     var dy = 1;
// 		    for (var j =0; j < faces.length; j++) {
// 			var point = faces[j].getDualPoint();
// 			var x1 = point.x;
//                         var y1 = point.y;
// 			if (lastX !== null){

// 			    dx = lastX - x1;
// 			    dy = lastY - y1;
// 			    if (dx < 0) {
// 				dx = -dx;
// 			    }
// 			    if (dy < 0) {
// 				dy = -dy;
// 			    }
// 			}
// 			if (dx > epsilon || dy > epsilon) {

// 			    protopoly.push([x1, y1]);
// 			    lastX = x1;
// 			    lastY = y1;

// 			}

// 		    }
// 		    site.nonClippedPolygon = d3.geom.polygon(protopoly.reverse());

// 		    if (!site.isDummy && site.nonClippedPolygon.length > 0) {
//                         //                        site.polygon = boundingPolygon.clip(site.nonClippedPolygon);
//                         var clippedPoly = boundingPolygon.clip(site.nonClippedPolygon);
//                         if (clippedPoly.length > 0){
//                             site.polygon = clippedPoly;
// 			    polygons.push(clippedPoly);
//                             console.log("pushed: " + polygons[polygons.length - 1]);
//                         }

// 		    }
// 		}
// 	    }
// 	}
//     }
//     console.log("finished computing power diagram");

//     return polygons;
// }


// IN: Omega = convex bounding polygon
// IN: S = unique set of sites with weights
// OUT: Set of lines making up the voronoi power diagram
function computePowerDiagramIntegrated(sites, boundingSites, clippingPolygon){
    //    var sStar = applyDeltaPi(S, S.map(function(s) {return s.weight;}));
    var width = 1000;
    var height = 1000;

    //    var bounds = applyDeltaPiToBounds(boundingPolygon);

    ConvexHull.clear();

    ConvexHull.init(boundingSites, sites);
    
    var facets = ConvexHull.compute(sites);

    // for (var i = 0; i < facets.length; i++){
    //     var f = facets[i];
    //     console.log(i + ": " + f.verts[0].x + ", " + f.verts[1].x + ", " + + f.verts[2].x);
    // }
    
    var polygons = [];
    var vertexCount = ConvexHull.points.length; 
    var verticesVisited = [];

    var facetCount = facets.length;
    for (var i = 0; i < facetCount; i++) {
	var facet = facets[i];

	if (facet.isVisibleFromBelow()) {

	    for (var e = 0; e < 3; e++) {
		// got through the edges and start to build the polygon by
		// going through the double connected edge list
		var edge = facet.edges[e];
		var destVertex = edge.dest;
		var site = destVertex.originalObject; 

		if (!verticesVisited[destVertex.index]) {
		    verticesVisited[destVertex.index] = true;
		    if (site.isDummy) { // Check if this is one of the
                        // sites making the bounding polygon
			continue;
		    }

		    // faces around the vertices which correspond to the
		    // polygon corner points

		    var faces = getFacesOfDestVertex(edge);
                    var protopoly = [];
		    var lastX = null;
		    var lastY = null;
		    var dx = 1;
                    var dy = 1;
		    for (var j =0; j < faces.length; j++) {
			var point = faces[j].getDualPoint();
			var x1 = point.x;
                        var y1 = point.y;
			if (lastX !== null){

			    dx = lastX - x1;
			    dy = lastY - y1;
			    if (dx < 0) {
				dx = -dx;
			    }
			    if (dy < 0) {
				dy = -dy;
			    }
			}
			if (dx > epsilon || dy > epsilon) {

			    protopoly.push([x1, y1]);
			    lastX = x1;
			    lastY = y1;

			}

		    }
		    site.nonClippedPolygon = d3.geom.polygon(protopoly.reverse());

		    if (!site.isDummy && site.nonClippedPolygon.length > 0) {
                        //                        site.polygon = boundingPolygon.clip(site.nonClippedPolygon);
                        var clippedPoly = clippingPolygon.clip(site.nonClippedPolygon);
                        site.polygon = clippedPoly;
                        if (clippedPoly.length > 0){
			    polygons.push(clippedPoly);
//                            console.log("pushed: " + polygons[polygons.length - 1]);
                        }

		    }
		}
	    }
	}
    }
//    console.log("finished computing power diagram");
    

    return polygons;
}


// voronoitreemap.js


var VoronoiTreemap = {

    debugMode: false,
    firstIteration: true,
    nearlyOne: 0.99,
    preflowPercentage: 0.08,
    useNegativeWeights: true,
    useExtrapolation: false,
    cancelOnAreaErrorThreshold: true,
    cancelOnMaxIterat: true,
    errorAreaThreshold: 0,
	//errorAreaThreshold: 5.0, // try to stop the crashes (doesn't seem to help too much)
    clipPolygon: [],
    guaranteeInvariant:false,
    sites: [],
    numberMaxIterations: 0,
    completeArea: 1,
    preflowFinished: false,
    maxDelta: 0,
    diagram: [],
    currentMaxError: 0,
    currentAreaError: 0,
    currentEuclidChange: 0,
    lastMaxWeight: 0,
    lastAreaError: 1,
    lastAVGError: 1,
    lastMaxError: 1E10,
    lastSumErrorChange: 1,
    lastEuclidChange: 0,
    currentMaxNegativeWeight: 0,
    aggressiveMode: false,
    boundingSites: [],
    seed: 25, 

    init:function(bounding_polygon, node) {
        this.clear();
        var sites = [];
        var random_points = this.getRandomPointsInPolygon(bounding_polygon, node.children.length);
        for (var c = 0; c < node.children.length; c++) {
	    // calculate percentage weights
            var size = (node.children[c].value * 1.0 / node.value)
            sites.push(new Vertex(random_points[c][0],random_points[c][1], null, epsilon, null, false, size));
        }


        return sites;
    },

    getPolygonBoundingRect:function(polygon) {
	var x_list = polygon.map(function(p) {return p[0];});
	var y_list = polygon.map(function(p) {return p[1];});
	var x_min = Math.min.apply(null, x_list);
	var x_max = Math.max.apply(null, x_list);
	var y_min = Math.min.apply(null, y_list);
	var y_max = Math.max.apply(null, y_list);
	return {"x":x_min,"y":y_min,"w":(x_max-x_min),"h":(y_max-y_min)};
    },
    doesPolygonContain:function(polygon, point) {
	var contains = false;
	// could check bounds first (as above)
	for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
	    if ((((polygon[i][1] <= point[1]) && (point[1] < polygon[j][1]) ||
		  ((polygon[j][1] <= point[1]) && (point[1] < polygon[i][1]))) &&
		 (point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))) {
		contains = !contains;
	    }
	}
	return contains;
    },

    random:function() {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    },

    getRandomPointsInPolygon:function(polygon, n_points) {
	// get bounding rect
	var rect = this.getPolygonBoundingRect(polygon);
	var result = []
	for (var i = 0; i < n_points; i++) {
            var p = [rect.x + Math.random() * rect.w, rect.y + Math.random() * rect.h];
            //	    var p = [rect.x + this.random() * rect.w, rect.y + this.random() * rect.h];
	    // see if p in polygon itself
	    //console.log(p)
	    if (this.doesPolygonContain(polygon, p)) {
		//console.log("does contain");
		result.push(p);
	    }
	    else {
		//console.log("does NOT contain");
		i--; // try again
	    }
	}

        // result = [];
	// result[0] = [130.92696687905118,91.98442592052743];
	// result[1] = [392.4537549354136,212.1577649912797];
	// result[2] = [260.31649184413254,26.87118007801473];
        // result[3] = [327.5536074768752,504.62498559616506];
	// result[4] = [261.0148494830355,14.232384245842695];
	// result[5] = [424.6814074809663,501.3572446606122];
	// result[6] = [234.0266134799458,33.144795794505626];
	// result[7] = [325.7570087816566,298.1421837885864];

        //console.log("Result: " + result);
	return result;
    },
    

    clear: function(){
        this.debugMode = false;
        this.firstIteration = true;
        this.nearlyOne = 0.99;
        this.preflowPercentage = 0.08;
        this.useNegativeWeights = true;
        this.useExtrapolation = false;
        //        this.cancelOnAreaErrorThreshold = true;
        this.cancelOnMaxIterat = true;
        //        this.errorAreaThreshold = 1000;
        this.firstIteration = true;
        this.clipPolygon= [];
        this.sites= [];
        this.numberMaxIterations= 0;
        this.completeArea= 1;
        this.preflowFinished= false;
        this.maxDelta= 0;
        this.diagram= [];
        this.currentMaxError= 0;
        this.currentAreaError= 0;
        this.currentEuclidChange = 0;
        this.lastMaxWeight = 0;
        this.lastAreaError = 1;
        this.lastAVGError = 1;
        this.lastMaxError = 1E10;
        this.lastSumErrorChange = 1;
        this.lastEuclidChange = 0;
        this.currentMaxNegativeWeight = 0;
        this.aggressiveMode = false;
        this.boundingSites = [];
    },
    max: function(list){
        var max = null;
        for (var i = 1; i < list.length; i++) {
            if (list[i] > max){
                max = list[i];
            }
        }
        return max;
    },
    min: function(list){
        var min = null;
        for (var i = 1; i < list.length; i++) {
            if (list[i] < min){
                min = list[i];
            }
        }
        return min;
    },

    setClipPolygon: function(polygon){
        this.clipPolygon = d3.geom.polygon(polygon);
        this.maxDelta = Math.max(polygon[2][0] - polygon[0][0], polygon[2][1] - polygon[0][1]); // TODO: assumes polygon is a square starting in the upper left corner.

        this.boundingSites = [];

        var maxX = this.max(polygon.map(function(a) {return a[0];}));
        var minX = this.min(polygon.map(function(a) {return a[0];}));
        var maxY = this.max(polygon.map(function(a) {return a[1];}));
        var minY = this.min(polygon.map(function(a) {return a[1];}));

        var x0 = minX - maxX;
        var x1 = 2 * maxX;
        var y0 = minY - maxY;
        var y1 = 2 * maxY;

        var result = [];
        result[0] = [x0, y0];
        result[1] = [x1, y0];
        result[2] = [x1, y1];
        result[3] = [x0, y1];

        for (var i = 0; i < result.length; i++){
            this.boundingSites[i] = new Vertex(result[i][0], result[i][1], null, epsilon, new Vertex(result[i][0], result[i][1], null, epsilon, null, true), true);
        }


    },

    // getMinDistanceToBorder(polygon, point){
    //     var result = this.computeDistanceBorder(polygon, point);
    //     for (var i = 0; i < polygon.length; i++){
            
    //     }
    // },

    // http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    computeDistanceBorder:function(polygon, point) { // Getting somewhat higher results than Java
	for (var i = 0; i < polygon.length; i++) {
	    var p1 = polygon[i];
	    if (i+1 < polygon.length) {
                var p2 = polygon[i+1];
            }
	    else {
                var p2 = polygon[0];
            }
	    
	    var dx = p1[0] - p2[0];
	    var dy = p1[1] - p2[1];
	    
	    var d = Math.abs(dy * point[0] - dx * point[1] + p1[0]*p2[1] - p2[0]-p1[1]) / Math.sqrt(dx*dx + dy*dy);
            
	    if (i == 0 || d < result) {
                var result = d;
            }
	}
        
	return result;
    },

    // final double px = x2-x1;
    // 	final double py = y2-y1;
    // 	final double d= Math.sqrt(px * px + py * py);
    
    // 	final double u = ((x3-x1)*(x2-x1)+(y3-y1)*(y2-y1))/(d*d);
    // 	final double kx = x1+u*(x2-x1);
    // 	final double ky=y1+u*(y2-y1);
    
    // 	final double dkx = x3-kx;
    // 	final double dky = y3-ky;
    // 	return Math.sqrt(dkx*dkx+dky*dky);

	// public double getMinDistanceToBorder(double x, double y) {
	//     double result = Geometry.distancePointToSegment(this.x[length - 1],
	// 			                            this.y[length - 1], this.x[0], this.y[0], x, y);
	//     for (int i = 0; i < (length - 1); i++) {
	// 	double distance = Geometry.distancePointToSegment(this.x[i],
	// 				                          this.y[i], this.x[i + 1], this.y[i + 1], x, y);
	// 	if (distance < result) {
	// 	    result = distance;
	// 	}
	//     }
	//     return result;

	// }
    normalizeSites: function(sites){
        var sum = 0;
        for (var z = 0; z < sites.length; z++){
            var s = sites[z];
            sum += s.percentage; // TODO: actually the same as getPercentage?
        }
        for (var z = 0; z < sites.length; z++){
            var s = sites[z];
            s.percentage = (s.percentage / sum);
        }
    },

    voroDiagram: function(){
        this.diagram = computePowerDiagramIntegrated(this.sites, this.boundingSites, this.clipPolygon);
    },

    distance: function(p1, p2){
        var dx = p1[0] - p2[0];
        var dy = p1[1] - p2[1]
        return Math.sqrt((dx*dx) + (dy*dy));
    },

    getMinNeighbourDistance: function(point){
        var minDistance = 1E10; // TODO: max value?
        for (var i = 0; i < point.neighbours.length; i++){
            var distance = this.distance(point.neighbours[i], point);
            if (distance < minDistance){
                minDistance = distance;
            }
        }
        return minDistance;
    },

    iterate: function(){
        var polygons = [];
//        console.log("iterate()");
        
	this.currentMaxNegativeWeight=0;
	this.currentEuclidChange = 0;
	this.currentAreaError = 0;
	this.currentMaxError = 0;

        this.completeArea = this.clipPolygon.area(); // TODO: make sure this works

        var errorArea = 0;

        // ***
        // TODO: omitting extrapolation code here
        // ***

        // Move to centers
        for (var z = 0; z < this.sites.length; z++){
            var point = this.sites[z];
            var error = 0;
            var percentage = point.percentage; // TODO: Same as percentage?

            var poly = point.polygon; // TODO: make site a "class"? Anyways, this may be null
            if (poly != null){
                var centroid = poly.centroid();
                var centroidX = centroid[0];
                var centroidY = centroid[1];
                var dx = centroidX - point.x;
                var dy = centroidY - point.y;
                this.currentEuclidChange += (dx*dx) + (dy*dy);
                var currentArea = poly.area();
                var wantedArea = completeArea * point.percentage; // TODO: Same as percentage?
                // var increase = (wantedArea / currentArea); // not used
                error = Math.abs(wantedArea - currentArea);
                // Omitted minDistanceClipped because its use is within extrapolation code
                //
                //

                //                var minDistance = point.nonClippedPolygon.getMinDistanceToBorder(centroidX, centroidY); // TODO
                var minDistance = this.computeDistanceBorder(point.nonClippedPolygon, centroid);
   
                var weight = Math.min(point.weight, minDistance * minDistance);
                if (weight < 1E-8){
                    weight = 1E-8;
                }
                
                point.x = centroidX;
                point.y = centroidY;
                point.setWeight(weight);

            }
            
            error = error / (completeArea * 2);
            
            errorArea += error;
        }

        this.currentAreaError += errorArea;

        this.voroDiagram();

        // var sitesCopy = null;
        // Omitting because guaranteeInvariant is always false
        //
        //
        for (var z = 0; z < this.sites.length; z++){
            var point = this.sites[z];
            var poly = point.polygon; // Definitely should not be null
            var completeArea = this.clipPolygon.area();
            var currentArea = poly.area();
            var wantedArea = completeArea * point.percentage // TODO: same as percentage?

            var currentRadius = Math.sqrt(currentArea/Math.PI);
            var wantedRadius = Math.sqrt(wantedArea/Math.PI);
            var deltaCircle = currentRadius - wantedRadius;

            var increase = wantedArea / currentArea;
            
            if (!this.aggressiveMode){
                increase = Math.sqrt(increase);
            }

            var minDistance = 0;
            // Omitted because guaranteeInvariant is never true
            //
            minDistance = this.getMinNeighbourDistance(point); // TODO
            minDistance = minDistance * this.nearlyOne;

            var radiusOld = Math.sqrt(point.weight);
            var radiusNew = radiusOld * increase;
            
            var deltaRadius = radiusNew - radiusOld;
            if (radiusNew > minDistance){
                radiusNew = minDistance;
            }
            
            var finalWeight = radiusNew*radiusNew;
            
            if (this.useNegativeWeights){
                var center = poly.centroid();
                var distanceBorder = this.computeDistanceBorder(poly, center);
                var maxDelta = Math.min(distanceBorder, deltaCircle);
                if (finalWeight < 1E-4){
                    var radiusNew2 = radiusNew - maxDelta;
                    if (radiusNew2 < 0){
                    finalWeight = -(radiusNew2 * radiusNew2);
                        if (finalWeight < this.currentMaxNegativeWeight){
                            this.currentMaxNegativeWeight = finalWeight;
                        }
                    }
                }
            }

            //console.log("new weight: " + finalWeight + " : " + point);

            point.setWeight(finalWeight);
        }

        if (this.useNegativeWeights){
            
            if (this.currentMaxNegativeWeight < 0){
                this.currentMaxNegativeWeight += (1-this.nearlyOne);
                this.currentMaxNegativeWeight = -this.currentMaxNegativeWeight;
                for (var z = 0; z < this.sites.length; z++){
                    var s = this.sites[z];
                    var w = s.weight;
                    w += this.currentMaxNegativeWeight;
                    s.setWeight(w);
                }
            }
        }

        this.voroDiagram();

        this.currentMaxError = 0;
        for (var z = 0; z < this.sites.length; z++){
            var site = this.sites[z];
            var poly = site.polygon;
            var percentage = site.percentage // TODO: same as percentage?
            var wantedArea = completeArea * percentage;
            var currentArea = poly.area();
            var singleError = Math.abs(1 - ( currentArea / wantedArea));
            if (singleError > this.currentMaxError){
                this.currentMaxError = singleError;
            }
        }

        this.lastEuclidChange = this.currentEuclidChange / this.sites.length;
        this.lastSumErrorChange = Math.abs(this.lastAreaError - this.currentAreaError);
        this.lastAreaError = this.currentAreaError;
        this.lastMaxError = this.currentMaxError;
        this.lastAVGError = this.currentAreaError / this.sites.length;

        return this.sites.map(function(s) {return s.polygon;});
    },

    // Return list of polygons
    doIterate: function(iterationAmount){
        
        var polygons = [];
        
        if (this.sites.length == 1){
            polygons.push(this.clipPolygon);
            return polygons;
        }

        if (this.firstIteration){
            this.voroDiagram();
        }

        var k = 0;
        for (var i = 0; i < iterationAmount; i++){
            polygons = this.iterate();
            //console.log(i + ": error: " + this.lastMaxError);
            if (this.cancelOnAreaErrorThreshold && this.lastMaxError < this.errorAreaThreshold){
                break;
            }
        }

        return polygons;
    }

}


///////// from hierarchy.js

// A method assignment helper for hierarchy subclasses.
function d3_layout_hierarchyRebind(object, hierarchy) {
    d3.rebind(object, hierarchy, "sort", "children", "value");

    // Add an alias for nodes and links, for convenience.
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;

    return object;
}

// Returns an array source+target objects for the specified nodes.
function d3_layout_hierarchyLinks(nodes) {
    return d3.merge(nodes.map(function(parent) {
        return (parent.children || []).map(function(child) {
            return {source: parent, target: child};
        });
    }));
}




///////////////////////
// the actual implementation

d3.layout.voronoitreemap = function() {
    var hierarchy = d3.layout.hierarchy().sort(null),
    root_polygon = [[0,0],[500,0],[500,500],[0,500]], // obviously stupid...set somehow
    iterations = 100,
    somenewvariable = 0;
    
    function voronoitreemap(d, depth) {
	var nodes = hierarchy(d),
	root = nodes[0];

	root.polygon = root_polygon;
	root.site = null; // hmm?

	if (depth != null){
		max_depth = depth;
	}
	else{
		max_depth = "Infinity";
	}
	var date = new Date();
	var startTime = 0 + date.getTime();
	computeDiagramRecursively(root, 0);
	var endTime = (new Date).getTime();
	//alert("TIME: " + (endTime - startTime));
        
	return nodes;
    }

    function computeDiagramRecursively(node, level) {
	var children = node.children;


	if (children && children.length && level < max_depth) {
	    node.sites = VoronoiTreemap.init(node.polygon, node);  // can't say dataset, how about node?
	    VoronoiTreemap.normalizeSites(node.sites);
	    VoronoiTreemap.sites = node.sites;
	    VoronoiTreemap.setClipPolygon(node.polygon);
	    VoronoiTreemap.useNegativeWeights = false;
	    VoronoiTreemap.cancelOnAreaErrorThreshold =  true;
	    var polygons = VoronoiTreemap.doIterate(iterations);
	    
	    // set children polygons and sites
	    for (var i = 0; i < children.length; i++) {
		children[i].polygon = polygons[i];
		children[i].site = VoronoiTreemap.sites[i];
		// goes all the way down

  //               if (children[i].polygon.area() > 900){
		computeDiagramRecursively(children[i], (level + 1));
//                 }
	    }

	}
    }
    
    
    voronoitreemap.root_polygon = function(x) {
		if (!arguments.length) return root_polygon;
		root_polygon = x;
		return voronoitreemap;
    };
	
	voronoitreemap.iterations = function(x) {
		if (!arguments.length) return iterations;
		iterations = x;
		return voronoitreemap;
    };
    
    
    return d3_layout_hierarchyRebind(voronoitreemap, hierarchy); 
}
