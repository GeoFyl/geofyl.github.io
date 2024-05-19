//Note: coordinates in the canvas start with (0,0) at the top left corner and increase as you move down the screen and to the right.

//Get the canvas, define point and line arrays, whether the simulation is ongoing(animating), and get the input for tensile strength.
var canvas = document.querySelector("canvas");
var	c = canvas.getContext("2d");
var points = [];
var	lines = [];
var	animating = false;
var strengthInput = document.getElementById("Strength");

//Define Point class
class Point {
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.oldx = x;
		this.oldy = y;
		this.vx = 0;
		this.vy = 0;
		this.interactable = true;
	}
}

//Define Line class
class Line {
	constructor(start, end, invisible=false, ridgidity=1, distance, normalLength) {
		this.start = start;
		this.end = end;
		this.distance = distance;
		this.invisible = invisible;
		this.ridgidity = ridgidity;
		this.constraining = false;
		this.strengthMultiply = normalLength/distance;
	}
}

//Instantiates new Point object and pushes to array of points.
function generatePoint(x, y) {
	var position = points.push(new Point(x,y));
	return position-1;
}

//Called soon after user clicks Start. Generates the cloth.
function generateCloth(no_ofVertices) {
	//Delete points and lines from last simulation
	points.length = 0;
	lines.length = 0;

	//Define cloth width and height, and how rigid vertical lines should be.
	var clothWidth = (canvas.width*3)/5;
	var clothHeight = (canvas.height*4)/5;
	var yRigidity = no_ofVertices/20;

	//The more vertices you have, the more rigid lines must be, so Constrain() must be called more than once 
	//and you need a different rigidity. The largest cloth is also heavy so stretches more so needs to be shorter.
	var constrainTime = 1;
	if (no_ofVertices == 100) {
		clothHeight = (canvas.height*3)/5;
		yRigidity = 1;
		constrainTime = 5;
	}
	else if(no_ofVertices == 32) {
		yRigidity = 0.8;
		constrainTime = 2;
	}

	//Generates a grid of vertices and connects them with lines(instantiates new Line objects and pushes them to line array).
	var x = clothWidth/3;
	var y = 0;
	for(var i=0; i < no_ofVertices; i++) {
		for(var f=0; f < no_ofVertices; f++) {
			var position = generatePoint(x, y);
			if(f > 0) {lines.push (new Line(points[position], points[position-1], false, no_ofVertices*0.001, clothWidth/(no_ofVertices-1), 7.952));} //Horizontal lines
			if(y > 0) {lines.push (new Line(points[position], points[position-no_ofVertices], false, yRigidity, clothHeight/(no_ofVertices-1), 4.5394));} //Vertical lines
			x += clothWidth/(no_ofVertices-1);
		}
		x = clothWidth/3;
		y += clothHeight/(no_ofVertices-1);
	}

	//If the tensile strength is strong, moves points to top of screen for nice rolling effect.
	if(+strengthInput.value == 100) {
		for(var f=0; f < points.length; f++) {
			points[f].y = 0;
			points[f].oldy = 0;
		}
	}
	return constrainTime;
}

//Called each frame. Updates points.
function UpdatePoints(frameRate, no_ofVertices) {
	try {
		//Iterate through points array
		for (var i = no_ofVertices; i < points.length; i++) {
			var p = points[i];
			
			//Calculate new horizontal and vertical velocities based on how far point moved last frame
			p.vx = (p.x - p.oldx);
			p.vy = (p.y - p.oldy);

			//Old coordinates become current coordinates and then current coordinates are updated according to velocity. 
			//Y coordinate then moved down for gravity.
			p.oldx = p.x;
			p.x += p.vx;
			p.oldy = p.y;
			p.y += p.vy;
			p.y += 980/frameRate**2;

			//If the mouse is dragging and no points are being dragged, pick a point in a certain range and move it towards the mouse until it's out of range again.
			//Mouse coordinates are from the InteractionHandler.js script
			if(mouseDragging && (mousePoint == 0 || mousePoint == p) && p.interactable == true) {
				var range = canvas.width/52.48;
				if(no_ofVertices == 100) {range *= 4;}
				if((mouseCoords[0]-range <= p.x) && (p.x <= mouseCoords[0]+range) && (mouseCoords[1]-range <= p.y) && (p.y <= mouseCoords[1]+range)) {
					if(mousePoint == 0) {mousePoint = p;}
					p.x = mouseCoords[0];
					p.y = mouseCoords[1];
				}
				else {mousePoint = 0}
			}
		}
	}
	catch(err) {
		//Inform user of any errors
		alert(err+"\nPlease reload the page.");
	}
}

//Called each frame. Checks if any points have moved outside of the canvas. 
//Moves them back to edge and changes their velocity so they bounce away back into the canvas.
function check_Points(no_ofVertices) {
	for (var i = no_ofVertices; i < points.length; i++) {
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

//Called each frame. Constrains lines to keep them either fully or somewhat rigid.
function Constrain(counter, constrainTime, strengthDensity) {
	//Iterate through lines array
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];

		//Calculate how long the line now is
		var delta_x = line.start.x - line.end.x;
		var delta_y = line.start.y - line.end.y;
		var newLength = Math.sqrt((delta_x**2) + (delta_y**2));
		
		//Don't start constraining until line has already been its proper length (so it doesnt constrain while cloth is still dropping from top of screen)
		if(line.constraining == false && (newLength >= line.distance)) {
			line.constraining = true;
		}

		if(line.constraining) {
			//Find the difference between the new length and how long it should be.
			var difference = newLength - line.distance;

			//Get the tensile strength. If the line has stretched past a certain value, delete the line.
			var strength = +strengthInput.value;
			strength *= strengthDensity;
			if((counter == constrainTime) && (difference > strength*line.distance*line.strengthMultiply)) {
				line.start.interactable = false;
				line.end.interactable = false;
				mousePoint = 0;
				lines.splice(i, 1);				
			}

			//Otherwise, move the ends of the line towards each other so the line is the proper length.
			//If the line isn't fully rigid, the ends are only partially moved the distance they otherwise would be.
			else {
				var adjustment = (difference / newLength) / 2;
				var adjust_x = (delta_x * adjustment)*line.ridgidity;
				var adjust_y = (delta_y * adjustment)*line.ridgidity;
						
				line.start.x -= adjust_x;
				line.start.y -= adjust_y;

				//Can't move the points fixed to the top of the screen.
				if(line.end.y != 0) {
					line.end.x += adjust_x;	
					line.end.y += adjust_y;
				}
				else {
					line.start.x -= adjust_x;
					line.start.y -= adjust_y;
				}	
			}	
		}
	}
}

//Called each frame. Renders lines
function RenderLines() {
	//Begin path. The path contains everything to be drawn.
	c.beginPath();

	//Iterate through lines array
	for (var i = 0; i < lines.length; i++) {
		var l = lines[i];

		//Move to start, and line to end is added to the path.
		c.moveTo(l.start.x, l.start.y);
		c.lineTo(l.end.x, l.end.y);
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

		//Toggle animating
		animating = !animating;

		//Gets and disables the Number of Vertices input
		var no_ofVerticesInput = document.getElementById("VerticesNo");
		no_ofVerticesInput.disabled = true;
		var no_ofVertices = +no_ofVerticesInput.value;
		
		//If the simulation has just been started, generate the cloth and begin calling Run() every 16.667ms (this is for a framerate of 60fps).
		if(animating) {
			//Depending on how many vertices there are, the the tensile strength needs modified. strengthDensity is passed through to Constrain().
			var strengthDensity = 1;
			if(no_ofVertices == 32) {strengthDensity = 1.11}
			else if(no_ofVertices == 22) {strengthDensity = 2.7}
			else if(no_ofVertices == 10) {strengthDensity = 4.3}
			else if(no_ofVertices == 7) {strengthDensity = 5}

			//Set framerate to 60fps
			var frameRate = 60;
			
			var constrainTime = generateCloth(no_ofVertices);
			timeInterval = setInterval(function(){Run(frameRate, no_ofVertices, constrainTime, strengthDensity)}, 1000/frameRate);
		}

		//If the simulation has just been stopped, un-disable the vertices input, stop calling Run() and clear anything rendered in the final frame.
		else if(!animating){
			no_ofVerticesInput.disabled = false;
			clearInterval(timeInterval);
			c.clearRect(0, 0, canvas.width, canvas.height);
		}
	}
	catch(err) {
		//Inform user of any errors and change Stop button back to Start button
		alert(err+"\nPlease reload the page.");
		change();
	}
}

//Called every frame. Calls all needed functions.
function Run(frameRate, no_ofVertices, constrainTime, strengthDensity) {
	try {	
		
		//Update all points
		UpdatePoints(frameRate, no_ofVertices);

		if(animating) {
			//Constrain all lines
			var counter = 1;
			for (var i = 0; i < constrainTime; i++) {
				Constrain(counter, constrainTime, strengthDensity);
				counter += 1;
			}

			//Check if any points have gone outside the canvas
			check_Points(no_ofVertices);

			//Clear anything rendered in the last frame and render lines
			c.clearRect(0, 0, canvas.width, canvas.height);
			RenderLines();
		}
	}
	catch(err) {
		//Inform user of any errors
		alert(err+"\nPlease reload the page.");
	}
}