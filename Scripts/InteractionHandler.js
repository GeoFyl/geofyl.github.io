//Define variables for if the mouse is dragging, what point is being dragged and vertex radius.
var mouseDragging = false;
var mousePoint = 0;
var vertexRad = 0;
var mouseCoords = [];
var canvasRect = canvas.getBoundingClientRect();

//Called when the size of the window changes. Updates width and height to correct values.
function canvasResize() {
	canvasRect = canvas.getBoundingClientRect();
	canvas.width = canvasRect.width;
	canvas.height = canvasRect.height;
}

//Called whenever the mouse is moved. Returns the coordinates of the mouse relative to the canvas.
function getMouseCoords(event) {
	var mouseX = event.clientX - canvasRect.left;
	var mouseY = event.clientY - canvasRect.top;
	mouseCoords = [mouseX, mouseY];
}

//Called when the mouse is pushed or released.
function toggleMouse() {
	mouseDragging = !mouseDragging;
	mousePoint = 0;
}

//Called when Show Vertices is checked. Toggles vertex radius.
function changeVertexRad() {
	if(verticesInput.checked) {vertexRad = 5;}
	else {vertexRad = 0;}
}

//Changes whats written in the start button when clicked.
function change() {
	var elem = document.getElementById("start");
	if (elem.value=="Start") elem.value = "Stop";
	else elem.value = "Start";
}

//Changes max number of Number of Objects depending on selected object type.
function restrictNumber() {
	if(typeInput.value == "Particles") {numberInput.max = 100;}
	else {numberInput.max = 5;}
}