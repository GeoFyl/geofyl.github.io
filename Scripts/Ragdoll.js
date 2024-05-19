//Note: coordinates in the canvas start with (0,0) at the top left corner and increase as you move down the screen and to the right.
//Note: a lot of the time when I'm talking about "objects" I mean a physical shape being simulated.

//Get the canvas, define point and line arrays, whether the simulation is ongoing(animating), get the Number of Objects, Object Type and Show Vertices inputs,
//and set the framerate to 60fps.
var canvas = document.querySelector("canvas");
var	c = canvas.getContext("2d");
var points = [];
var	lines = [];
var	numberInput = document.getElementById("Number");
var typeInput = document.getElementById("Type");
var verticesInput = document.getElementById("vertices");
var	animating = false;
var frameRate = 60;

//Define Point class
class Point {
	constructor(x,y,oldx,oldy){
		this.x = x;
		this.y = y;
		this.oldx = oldx;
		this.oldy = oldy;
		this.vx = 0;
		this.vy = 0;
	}
}

//Define Line class
class Line {
	constructor(start, end, invisible=false, ridgidity=1) {
		this.start = start;
		this.end = end;
		var distance = Math.sqrt(((start.x - end.x)**2) + ((start.y - end.y)**2));
		this.distance = distance;
		this.invisible = invisible;
		this.ridgidity = ridgidity;
	}
}

//Define generic class for shapes
class ShapeClass {
	constructor() {
		this.value = 0;
		this.lineNo = 0;
		this.dragCoefficient = 0;
		this.doll = false;
		this.velocityMultiplier = Math.floor(Math.random()*2) == 1 ? 1 : -1;
	}
	generateShape(zoneX, zoneY, zoneArrayX, zoneArrayY) {}
}

//Define particle class as subclass of ShapeClass
class particleClass extends ShapeClass {
	constructor() {
		super();
		this.value = 1;
		this.dragCoefficient = 0.04;
	}
	//Generates a point in the selected zone
	generateShape(zoneX, zoneY, zoneArrayX, zoneArrayY) {
		generatePoint(((Math.random() * (canvas.width/4)) + zoneArrayX[zoneX]) , ((Math.random() * (canvas.height/4)) + zoneArrayY[zoneY]));
	}
}

//Define triangle class as subclass of ShapeClass
class triangleClass extends ShapeClass {
	constructor() {
		super();
		this.value = 2;
		this.lineNo = 3;
		this.dragCoefficient = 0.4;
	}
	generateShape(zoneX, zoneY, zoneArrayX, zoneArrayY) {
		//Define a new array to temporarily store points generated and a boolean variable whether the angles are good.
		var trianglePoints = []
		var goodAngles = false;

		//Keep generating three random points in the selected zone until the angles between them are all at least 30 degrees (0.524 radians = 30 degrees)
		while(goodAngles == false) {
			trianglePoints.length = 0;
			for(var i = 0; i < 3; i++) {
				trianglePoints.push(new Point(((Math.random() * (canvas.width/4)) + zoneArrayX[zoneX]),((Math.random() * (canvas.height/4)) + zoneArrayY[zoneY]),0,0));
			}
			var a = Math.sqrt(((trianglePoints[0].x - trianglePoints[1].x)**2) + ((trianglePoints[0].y - trianglePoints[1].y)**2));
			var b = Math.sqrt(((trianglePoints[1].x - trianglePoints[2].x)**2) + ((trianglePoints[1].y - trianglePoints[2].y)**2));
			var c = Math.sqrt(((trianglePoints[2].x - trianglePoints[0].x)**2) + ((trianglePoints[2].y - trianglePoints[0].y)**2));
			
			var A = Math.acos(Math.abs((b**2 + c**2 - a**2)/(2*b*c)));
			var B = Math.acos(Math.abs((a**2 + c**2 - b**2)/(2*a*c)));
			var C = Math.acos(Math.abs((b**2 + a**2 - c**2)/(2*b*a)));
			if(A >= 0.524 && B >= 0.524 && C >= 0.524 ) {goodAngles = true}			
		}
		//Push these points to the points array
		for(var f = 0; f < 3; f++) {
			generatePoint(trianglePoints[f].x, trianglePoints[f].y);
		}
	}
}

//Define square class as subclass of ShapeClass
class squareClass extends ShapeClass {
	constructor() {
		super();
		this.value = 3;
		this.lineNo = 6;
		this.dragCoefficient = 0.9;
	}
	generateShape(zoneX, zoneY, zoneArrayX, zoneArrayY) {
		//Generate a random x and y coordinate in the selected zone and a random length for the sides (addOn)
		var x1 = (Math.random() * (canvas.width/4)) + zoneArrayX[zoneX];
		var y1 = (Math.random() * (canvas.height/4)) + zoneArrayY[zoneY];
		var addOn = (Math.random() * (canvas.width/6)) + (canvas.width/6)*0.2 ;

		//If this point is near the right side or the bottom of the canvas, move it away so the square will definitely fit in the canvas
		if(zoneX == 3) {x1 -= 1.5*addOn}
		if(y1 > canvas.height-(1.5*addOn)) {y1 = canvas.height-(1.5*addOn)}

		//Create the two other needed x and y values and create the four points of the square
		var x2 = x1 + addOn;
		var y2 = y1 + addOn;
		generatePoint(x1, y1);
		generatePoint(x1, y2);
		generatePoint(x2, y2);
		generatePoint(x2, y1);
	}
}

//Define pentagon class as subclass of ShapeClass
class pentagonClass extends ShapeClass {
	constructor() {
		super();
		this.value = 4;
		this.lineNo = 9;
		this.dragCoefficient = 0.6;
	}
	generateShape(zoneX, zoneY, zoneArrayX, zoneArrayY) {
		//Generate a random x and y coordinate in the selected zone and a random length for the sides (addOn)
		//If this point is near the right side or the bottom of the canvas, move it away so the pentagon will definitely fit in the canvas
		var addOn = (Math.random() * (canvas.width/200)) + (canvas.width/200)*0.2;
		var x1 = (Math.random() * (canvas.width/4)) + zoneArrayX[zoneX];
		if(zoneX == 3) {x1 -= 30*addOn}
		var y1 = (Math.random() * (canvas.height/4)) + zoneArrayY[zoneY];
		if(y1 > canvas.height-(35*addOn)) {y1 = canvas.height-(35*addOn)}
		
		//Create other needed x and y values and create points
		var x2 = x1 + 4.5*addOn;
		var x3 = x2 + 9.5*addOn;
		var x4 = x3 + 6.5*addOn;
		var x5 = x4 + 6*addOn;

		var y2 = y1 + addOn;
		var y3 = y2 + 14*addOn;
		var y4 = y3 + 2*addOn;
		var y5 = y4 + 9*addOn;
		
		generatePoint (x2, y2);
		generatePoint (x1, y4);
		generatePoint (x3, y5);
		generatePoint (x5, y3);
		generatePoint (x4, y1);
	}
}

//Define ragdoll class as subclass of ShapeClass
class dollClass extends ShapeClass{
	constructor() {
		super();
		this.doll = true;
		this.dragCoefficient = 1.2;
	}
	generateShape(zoneX, zoneY, zoneArrayX, zoneArrayY) {
		//Generate a random x and y coordinate in the selected zone and set addOn to 150px
		//If this point is near the right side, bottom or top of the canvas, move it away so the pentagon will definitely fit in the canvas
		var x1 = (Math.random() * (canvas.width/4)) + zoneArrayX[zoneX];
		var y1 = (Math.random() * (canvas.height/4)) + zoneArrayY[zoneY];
		var addOn = 150;
		if(zoneX == 3) {x1 -= 1.5*(addOn/3)}
		if(y1 > canvas.height-(1.5*(5*addOn/4))) {y1 = canvas.height-(1.5*(5*addOn/4))}
		if(y1 < 5-(1.5*(addOn/2))) {y1 = 5-(1.5*(addOn/2))}

		//Create other needed x and y values and create points
		var x2 = x1 + addOn/4;
		var x3 = x1 + addOn/3;
		var x4 = x1 - addOn/4;
		var x5 = x1 - addOn/3;
		var y2 = y1 - addOn/3;
		
		generatePoint(x1, y2); // Head 0
		generatePoint(x1, y1); // Chest 1
		generatePoint(x2, y1+=addOn/6); // Right Elbow 2 (directions relative to viewer)
		generatePoint(x4, y1); // Left Elbow 3
		generatePoint(x1, y1+=addOn/6) // Torso 4
		generatePoint(x3, y1+=addOn/12); // Right Hand 5
		generatePoint(x5, y1); // Left Hand 6
		generatePoint(x1, y1+=addOn/4); // Pelvis 7
		generatePoint(x2, y1+=addOn/4); // Right Knee 8
		generatePoint(x4, y1); // Left Knee 9
		generatePoint(x2, y1+=addOn/3); // Right Foot 10
		generatePoint(x4, y1); // Left Foot 11
		generatePoint(x1+addOn/6, y2); // Head Right 12
		generatePoint(x1-addOn/6, y2); // Head Left 13
		generatePoint(x1, y2-addOn/6); // Head Top 14

		//Have to manually create lines instead of letting createLines() handle it, 
		//because the points being connected are all over the place instead of just connecting to the next one in the array and so on
		for(var i = 0; i < 2; i++) {
			addLine(points[i], points[i+1]);
		}
		addLine(points[1], points[3]); // Left bicep
		addLine(points[2], points[5]); // Right forearm
		addLine(points[3], points[6]); // Left forearm
		addLine(points[1], points[4]); // Chest to torso
		addLine(points[4], points[7]); // Torso to pelvis
		addLine(points[7], points[8]); // Right thigh
		addLine(points[8], points[10]); // Right shin
		addLine(points[7], points[9]); // Left thigh
		addLine(points[9], points[11]); // Left shin

		//Invisible lines to keep head rigid
		addLine(points[12], points[0], true);
		addLine(points[12], points[1], true);
		addLine(points[12], points[13], true);
		addLine(points[0], points[13], true);
		addLine(points[0], points[14], true);
		addLine(points[13], points[14], true);
		addLine(points[14], points[12], true);
		addLine(points[13], points[1], true);
		addLine(points[14], points[1], true);

		//Invisible lines act like springs to keep body cohesive
		addLine(points[2], points[3], true, 0.001); // Between elbows
		addLine(points[1], points[6], true, 0.01); // Left arm
		addLine(points[1], points[5], true, 0.01); // Right arm
		addLine(points[0], points[7], true, 0.002); // Main body
		addLine(points[8], points[9], true, 0.001); // Between knees
		addLine(points[8], points[4], true, 0.01); // Torso to right knee
		addLine(points[9], points[4], true, 0.01); // Torso to left knee
		addLine(points[10], points[7], true, 0.01); // Right leg
		addLine(points[11], points[7], true, 0.01); // Left leg
		
	}
}

//Instantiates new Point object and pushes to array of points along with a random velocity
function generatePoint(x, y) {
	var multiplier = shape.velocityMultiplier;
	var velocity = (Math.floor(Math.random()*5) + 1)*100*multiplier; 
	points.push(new Point(x,y,(x - velocity/frameRate),(y-(velocity/frameRate))));
}

//Called soon after user clicks Start. Instantiates shape as new object of the relevant class (whatever object type user selected)
function generateStartPoints() {

	//Gets the Number of Objects and checks if it is an allowed number. For ragdoll, just sets it to 1.
	var no_ofObjects = +numberInput.value;
	if(Number.isInteger(no_ofObjects) == false) throw "no_notInteger";	
	if(typeInput.value== "Ragdoll") {
		no_ofObjects = 1;
		numberInput.value = 1;
	}
	else if(typeInput.value== "Particles") {
		if(no_ofObjects < 1 || no_ofObjects > 100) throw "invalid particles";
		verticesInput.checked=true;
		verticesInput.disabled=true;
		vertexRad = 5;
	}
	else {
		if(no_ofObjects < 1 || no_ofObjects > 5) throw "invalid shape";
	}

	//Delete points and lines from last simulation. Disable number and type inputs.
	points.length = 0;
	lines.length = 0;
	numberInput.disabled=true;
	typeInput.disabled=true;

	//Creates new function to instantiate shape as a new object of the relevant type of object
	if(typeInput.value == "Particles") {var shapeGen = function(){shape = new particleClass();}}
	else if(typeInput.value == "Triangle") {var shapeGen = function(){shape = new triangleClass();}}
	else if(typeInput.value == "Square") {var shapeGen = function(){shape = new squareClass();}}
	else if(typeInput.value == "Pentagon") {var shapeGen = function(){shape = new pentagonClass();}}
	else {var shapeGen = function(){shape = new dollClass();}}
	
	//Basically splits the canvas into eight zones (four horizontal and four vertical)
	var zoneArrayX = [0, canvas.width/4, canvas.width/2, 3*canvas.width/4];
	var zoneArrayY = [0, canvas.height/4, canvas.height/2, 3*canvas.height/4];

	//Repeat as many times as user wants number of objects
	for(var i=0; i < no_ofObjects; i++) {

		//Randomly selects a zone and calls the function to generate the vertices of the shape, starting in this zone
		var zoneX = Math.floor(Math.random() * 4);
		var zoneY = Math.floor(Math.random() * 4);
		shapeGen();
		shape.generateShape(zoneX, zoneY, zoneArrayX, zoneArrayY);
	}
	//Create lines as long as shape isnt particles (doesn't need lines) or ragdoll (lines done manually)
	if(typeInput.value!= "Particles" && typeInput.value!= "Ragdoll") {
		createLines(shape.value);
	}

	//Amount of points devided by number of objects will serve as each object's mass
	return points.length/no_ofObjects;
}

//Instantiates new Line object and pushes to array of lines.
function addLine(a, b, c, d) {
	lines.push (new Line(a, b, c, d));
}

//Creates lines. It works by iterating through each point and adding a line connecting the current point to the next one.
//If the next point is not part of the current shape, a line is added between the current point and the first point in the shape.
//At the same time if the shape is a square or pentagon, invisible lines are added as needed to keep the shape rigid.
//Then the next point in the array becomes the starting point (for the next shape).
function createLines(shapeValue) {

	//shapeValue = number of points in shape, accounting for the fact that the first index of an array is 0 (eg. square has 4 points so shapeValue = 3)
	//tracker = index of final point in current shape, trackerLast = index of first point in current shape
	var tracker = shapeValue;
	var trackerLast = 0;
	for (var i = 0; i < points.length; i++) {
		var next = i+1;
		if (next > tracker) {
			if(shapeValue == 3) {
				addLine(points[trackerLast], points[trackerLast+2], true);
				addLine(points[trackerLast+1], points[trackerLast+3], true);
			}
			else if(shapeValue == 4) {
				addLine(points[trackerLast], points[trackerLast+2], true);
				addLine(points[trackerLast+1], points[trackerLast+3], true);
				addLine(points[trackerLast+2], points[trackerLast+4], true);
				addLine(points[trackerLast+3], points[trackerLast], true);
			}
			next = trackerLast;
			trackerLast = tracker + 1;
			tracker = trackerLast + shapeValue;
		}
		addLine(points[i], points[next]);
	}
	
}

//Calculates force of air resistance
function Drag(Vobject, line, sideways, airDensity) {

	//Finds "cross section" of the line from a horizontal or vertical perspective depending on whether the line is moving more horizontal or vertical
	var cross_Section = 1;
	if(typeInput.value!= "Particles") {
		if(sideways) {
			cross_Section = Math.abs(line.start.y - line.end.y)/100;
		}
		else {
			cross_Section = Math.abs(line.start.x - line.end.x)/100;
		}
	}

	//Calculates drag using the drag equation Fd = (1/2)pv^2(Cd)A  where Fd = drag, p = air density, 
	//v = speed of the object relative to the air, Cd = coefficient of drag, A = cross sectional area
	var drag = 0.5*airDensity*(Vobject**2)*shape.dragCoefficient*cross_Section;
	return drag;
}

//Called each frame. Updates points.
function UpdatePoints(mass) {
	try {
		//Get air density, gravity and ground friction values
		var density = +(document.getElementById("Density").value);
		var gravity = +(document.getElementById("Gravity").value);
		var friction = +(document.getElementById("Friction").value);

		//If any of these values are not allowed, throw an error
		if(density < 0 || density > 5 || gravity < 0 || gravity > 25 || friction < 0 || friction > 4) throw "invalid number";

		//Iterate through points array
		for (var i = 0; i < points.length; i++) {
			var p = points[i];

			//Calculate new horizontal and vertical velocities based on how far point moved last frame
			p.vx = (p.x - p.oldx);
			p.vy = (p.y - p.oldy);

			//Calculate resultant velocity of point and calculate the air resistance
			var Vobject = Math.sqrt((p.vx**2) + (p.vy**2));
			var drag = Drag(Vobject, lines[i], (Math.abs(p.vx) > Math.abs(p.vy)), density)/mass;

			//Old coordinates become current coordinates and then current coordinates are updated according to velocity.
			p.oldx = p.x;
			p.x += p.vx;
			p.oldy = p.y;
			p.y += p.vy;

			//If the point is moving and not on the ground, apply the effects of air resistance
			if(Math.round(p.y) != canvas.height-vertexRad) {
				var ratio = drag/Vobject;
				if(Vobject != 0) {
					if(p.vy < 0) {p.y += (Math.abs(p.vy*ratio))/frameRate;}
					else {p.y -= (Math.abs(p.vy*ratio))/frameRate;}
					if(p.vx < 0) {p.x += (Math.abs(p.vx*ratio))/frameRate;}
					else {p.x -= (Math.abs(p.vx*ratio))/frameRate;}
				}	
			}
			//If the point is on the ground, apply the effects of ground friction
			else {
				if(p.vx > 0) {
					p.x -= ((friction*100)/frameRate**2)/mass;
				}
				else if(p.vx < 0) {
					p.x += ((friction*100)/frameRate**2)/mass;
				}
				p.vx = (p.x - p.oldx);
			}	

			//Y coordinate moved down for gravity.
			p.y += (gravity*100)/frameRate**2;

			//If the mouse is dragging and no points are being dragged, pick a point within 25px of the mouse and move it to the mouse.
			//Mouse coordinates are from the InteractionHandler.js script
			if(mousePoint == 0 || mousePoint == p) {
				if(mouseDragging && (mouseCoords[0]-25 <= p.x) && (p.x <= mouseCoords[0]+25) && (mouseCoords[1]-25 <= p.y) && (p.y <= mouseCoords[1]+25)) {
					if(mousePoint == 0) {mousePoint = p;}
					p.x = mouseCoords[0];
					p.y = mouseCoords[1];
				}
			}
		}
	}
	catch(err) {
		//Inform user of any errors
		if(err == "invalid number") {
			//Stop simulation
			startStop();
			alert("Gravity, air density and friction cannot be less than 0.\n- Gravity cannot be more than 25.\n- Air density cannot be more than 5.\n- Friction cannot be more than 4.");
		}
		else{
			alert(err+"\nPlease reload the page.");
		}
	}
}

//Called each frame. Checks if any points have moved outside of the canvas. 
//Moves them back to edge and changes their velocity so they bounce away back into the canvas.
function check_Points() {
	for (var i = 0; i < points.length; i++) {
		var p = points[i];

		//Check if point is outside canvas
		if(p.x > canvas.width-vertexRad || p.x < vertexRad || p.y > canvas.height-vertexRad || p.y < vertexRad) {

			//Find where it intersected the edge
			var intersect = findIntersect(p.x, p.y, p.oldx, p.oldy);

			//Move point back to intersect
			if(Math.floor(intersect[0]) == canvas.width-vertexRad || Math.floor(intersect[0]) == vertexRad) {
				p.x = intersect[0];
			}
			p.y = intersect[1];
			
			//Changes old coordinates so when velocities are calculated, point will move off in opposite direction.
			if(p.x == canvas.width-vertexRad || p.x == vertexRad) {
				p.vx *= 0.5;
				p.vy *= 0.9;
				p.oldx = p.x + p.vx;
				p.oldy = p.y - p.vy;
			}
		
			if(p.y == canvas.height-vertexRad || p.y == vertexRad) {
				if(p.oldy != canvas.height-vertexRad) {
					p.vy *= 0.5;
					p.vx *= 0.9;
				}
				p.oldy = p.y + p.vy;
				if(p.x == canvas.width-vertexRad || p.x == vertexRad) {
					p.oldx = p.x + p.vx;
				}
				else {p.oldx = p.x - p.vx;}
				
			}
		}
	}
}

//Called each frame. Finds and returns coordinates where a point intersected the edge on its way out.
//Using the line equation y=mx+b, it finds the line from the old coordinates to the current coordinates.
//The point of intersection is then found between this line and the edge.
function findIntersect(a,b,x,y) {
	var m = ((y - b) / (x - a));
	var Y = vertexRad;
	var X = vertexRad;

	if((a > canvas.width-vertexRad || a < vertexRad) && b > canvas.height-vertexRad) {
		
		if(a > canvas.width-vertexRad) {
			X = canvas.width-vertexRad;
		}
		Y = canvas.height-vertexRad;
	}

	else if(a > canvas.width-vertexRad || a < vertexRad) {
		if(a > canvas.width-vertexRad) {
			X = canvas.width-vertexRad;
		}
		Y = ((m*X) - (m*a) + b);
	}

	else {
		if(b > canvas.height-vertexRad){
			Y = canvas.height-vertexRad;
		}
		if(!isFinite(m)) {
			X = a;
		}
		else {
			var foundX = (Y - b + m*a) / m;
			if(foundX == canvas.width-vertexRad || foundX == vertexRad) {X = a}
			else{X = foundX}
		}
		
	}
	return [X, Y];
}

//Called each frame. For each shape checks if that shape is touching the ground and constrains the lines in that shape
function Constrain(material) {
	if(shape.doll == true) {
		var f = 0;
		var grounded = groundCheck(f, points.length);
		for (var i = 0; i < lines.length; i++) {constrainLines(material, grounded, i)}
	}
	else {
		var add = 0;
		for (var g = 0; g < +numberInput.value*shape.value; g += shape.value) {
			var f = g;
			var grounded = groundCheck(f, g+shape.value);
			for (var i = g+add; i < shape.lineNo+g+add; i++) {
				constrainLines(material, grounded, i)
			}
			add += shape.lineNo-shape.value;
		}		
	}
}

//Checks if a shape is touching the ground
function groundCheck(f, limit) {
	var grounded = false;

	//Checks if any points in the points array starting at index "f" and ending at index "limit" are at the bottom of the canvas
	while(grounded == false && f < limit) {
		if(Math.floor(points[f].y) == canvas.height-vertexRad) {
			grounded = true;
		}
		f += 1;
	}
	return grounded;	
}

//Called each frame. Constrains lines to keep them either fully or somewhat rigid.
function constrainLines(material, grounded, i) {
	var line = lines[i];

	//Calculate how long the line now is
	var delta_x = line.start.x - line.end.x;
	var delta_y = line.start.y - line.end.y;
	var newLength = Math.sqrt((delta_x**2) + (delta_y**2));

	//Find the difference between the new length and how long it should be and move the ends of the line towards each other so the line is the proper length.
	//If the line isn't fully rigid, the ends are only partially moved the distance they otherwise would be.
	var difference = newLength - line.distance;
	var adjustment = (difference / newLength) / 2;
	var adjust_x = (delta_x * adjustment)*line.ridgidity;
	var adjust_y = (delta_y * adjustment)*line.ridgidity;
			
	line.start.x -= adjust_x;
	line.end.x += adjust_x;	
	line.start.y -= adjust_y;
	line.end.y += adjust_y;

	//If the material is rubber and the shape is touching the ground, have to update oldx and oldy of the ends of the line.
	//If this didn't happen, points on the ground would get dragged along by points on the shape not on the ground, effectively bypassing the effect of friction.
	if(material == 10 && grounded) {
		line.end.oldx -= adjust_x;
		line.start.oldx += adjust_x;
		line.start.oldy += adjust_y;
		line.end.oldy -= adjust_y;
	}
}

//Called each frame. Renders points
function RenderPoints() {
	//Begin path. The path contains everything to be drawn.
	c.beginPath();

	//Iterate through points array
	for (var i = 0; i < points.length; i++) {
		var p = points[i];

		//If the shape is ragdoll and this is the first point (the head), add a large circular line in a 25px radius around the point to the path,
		//draw the path and begin a new path for the rest of the points 
		if(i == 0 && shape.doll == true) {
			c.arc(p.x, p.y, 25, 0, Math.PI * 2);
			c.closePath();
			c.stroke();
			c.beginPath();
		}
		//Otherwise, if the Show Vertices box is checked, add a 5px radius circle around the point to the path
		else if(verticesInput.checked){c.arc(p.x, p.y, 5, 0, Math.PI * 2);}
		c.closePath();	
	}
	//Fill in the points
	c.fill();
}

//Called each frame. Renders lines
function RenderLines() {
	//Begin path. The path contains everything to be drawn.
	c.beginPath();

	//Iterate through lines array
	for (var i = 0; i < lines.length; i++) {
		var l = lines[i];

		//If the line is meant to be visible or the Show Constraints box is checked, move to start and a line to the end is added to the path.
		if(l.invisible == false || document.getElementById("constraints").checked) {
			c.moveTo(l.start.x, l.start.y);
			c.lineTo(l.end.x, l.end.y);
		}
	}
	//End and draw the path.
	c.closePath();
	c.stroke();
}

//Called when the Start button is clicked. Begins simulation.
function startStop() {
	try {
		//Toggles Start button between Start and Stop - this function is in the InteractionHandler.js script
		change();
		
		animating = !animating;

		//If the simulation has just been started, generate the shapes and begin calling Run() every 16.667ms (this is for a framerate of 60fps).
		if(animating) {
			var mass = generateStartPoints();
			timeInterval = setInterval(function(){Run(mass)}, 1000/frameRate);
		}

		//If the simulation has just been stopped, un-disable the inputs, stop calling Run() and clear anything rendered in the final frame.
		else if(!animating){
			numberInput.disabled=false;
			typeInput.disabled=false;
			verticesInput.disabled=false;
			clearInterval(timeInterval);
			c.clearRect(0, 0, canvas.width, canvas.height);
		}
	}
	catch(err) {
		//Inform user of any errors and change Stop button back to Start button
		if(err == "invalid particles") {
			alert("Number of objects cannot be less than 1 or more than 100.");
		}
		else if(err == "invalid shape") {
			alert("Number of objects cannot be less than 1 or more than 5.");
		}
		else if(err == "no_notInteger") {
			alert("Number of objects must be an integer (whole number).")
		}
		else {
			alert(err+"\nPlease reload the page.");
		}
		change();
	}
}

//Called every frame. Calls all needed functions.
function Run(mass) {
	try {	
		//Update all points
		UpdatePoints(mass);

		if(animating) {
			//Get material and constrain lines
			var material = +(document.getElementById("Material").value);
			if(typeInput.value != "Particles") {
				for (var i = 0; i < material; i++) {
					Constrain(material);
				}
			}

			//Check if any points have gone outside the canvas
			check_Points();

			//Clear anything rendered in the last frame and render points and lines
			c.clearRect(0, 0, canvas.width, canvas.height);
			RenderPoints();
			if(typeInput.value != "Particles") {
				RenderLines();
			}
		}
	}
	catch(err) {
		//Inform user of any errors
		alert(err+"\nPlease reload the page.");
	}
}