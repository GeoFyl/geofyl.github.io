var configArray = [];

//Create generic Config class to store user settings
class Config {
	constructor(name) {
		this.Name = name;
	}
}

//Create config class for ragdoll demo as subclass of Config
class RagdollConfig extends Config {
    constructor(name, gravity, drag, friction, num, type, material) {
		super(name);
        this.Gravity = gravity;
        this.Drag = drag;
        this.Friction = friction;
		this.Num_objects = num;
		this.Type = type;
		this.Material = material;
    }
}

//Create config class for cloth demo as subclass of Config
class ClothConfig extends Config {
	constructor(name, vertices, strength) {
		super(name)
		this.Vertices = vertices;
		this.Strength = strength;
	}
}

//This function is called when the user presses the "Save" button
function save() {
	try{
		//Get the name the user wants to save the current configuration under, then check if it already exists in the array
		var saveValue = document.getElementById("saveValue").value;
		var exists = binarySearch(configArray, saveValue);
		if (exists) throw "pre-exists";
		if (saveValue == "") throw "empty";
		
		//Get and validate values from HTML and append as a new object (depending on what demo is running) to array 
		if(document.title == "Ragdoll Simulation") {
			var number = +document.getElementById("Number").value;
			if(Number.isInteger(number) == false) throw "no_notInteger";
			
			var type = document.getElementById("Type").value
			if(type== "Ragdoll") {
				number = 1;
			}
			else if(type== "Particles") {
				if(number < 1 || number > 100) throw "invalid particles";
			}
			else {
				if(number < 1 || number > 5) throw "invalid shape";
			}

			var gravity = +document.getElementById("Gravity").value
			var density = +document.getElementById("Density").value
			var friction = +document.getElementById("Friction").value
			if(density < 0 || density > 5 || gravity < 0 || gravity > 25 || friction < 0 || friction > 4) throw "invalid number";

			var x = configArray.push(new RagdollConfig(saveValue, gravity, density, friction, number, type, document.getElementById("Material").value));
		}
		else if(document.title == "Cloth Simulation") {
			var x = configArray.push(new ClothConfig(saveValue, document.getElementById("VerticesNo").value, document.getElementById("Strength").value));
		}

		//Add info to html and sort array
		format(x);
		insertionSort(configArray);	
	}
	catch(err) {
		console.log(err)
		//Alert messages
		if (err == "empty") {
			alert("Name cannot be left empty.");
		}
		else if (err == "pre-exists") {
			alert("A configuration with this name already exists.");
		}
		else if(err == "invalid number") {
			alert("Gravity, air density and friction cannot be less than 0.\n- Gravity cannot be more than 25.\n- Air density cannot be more than 5.\n- Friction cannot be more than 4.");
		}
		else if(err == "invalid particles") {
			alert("Number of objects cannot be less than 1 or more than 100.");
		}
		else if(err == "invalid shape") {
			alert("Number of objects cannot be less than 1 or more than 5.");
		}
		else if(err == "no_notInteger") {
			alert("Number of objects must be an integer (whole number).")
		}
	}
	//Reset text input
	document.getElementById("saveValue").value = "";
}

//Format and add to HTML to be displayed
function format(x) {
	var ul = document.getElementById("list");
	var li = document.createElement("li");
	if(document.title == "Ragdoll Simulation") {
		var material = "Rubber";
		if(configArray[x-1].Material == 1) {material = "Jelly";}

		li.appendChild(document.createTextNode(configArray[x-1].Name+" - Number of objects: "+configArray[x-1].Num_objects+", Gravity: "+configArray[x-1].Gravity+
		", Density: "+configArray[x-1].Drag+", Friction: "+configArray[x-1].Friction+", Type: "+configArray[x-1].Type+", Material: "+material));
		ul.appendChild(li);
	}
	else if(document.title == "Cloth Simulation") {
		var strength = "Strong"
		if(configArray[x-1].Strength == 5.5) {strength = "Medium"}
		else if(configArray[x-1].Strength == 4.95) {strength = "Weak"}

		li.appendChild(document.createTextNode(configArray[x-1].Name+" - Number of vertices: "+(configArray[x-1].Vertices)**2+", Strength: "+strength));
		ul.appendChild(li);
	}
}

//This function is called when the user presses the "Set" button
function set() {
	try {
		//Get the name of the configuration the user wants to use then search for it in the array
		var target = document.getElementById("setValue").value;
		var toSetTo = binarySearch(configArray, target);
		if (!toSetTo) {
			throw "not found";
		}
		//Set values to the values stored in the object found
		if(document.title == "Ragdoll Simulation") {
			document.getElementById("Gravity").value = toSetTo.Gravity;
			document.getElementById("Density").value = toSetTo.Drag;
			document.getElementById("Friction").value = toSetTo.Friction;
			document.getElementById("Number").value = toSetTo.Num_objects;
			document.getElementById("Type").value = toSetTo.Type;
			document.getElementById("Material").value = toSetTo.Material;
		}
		else if(document.title == "Cloth Simulation") {
			document.getElementById("VerticesNo").value = toSetTo.Vertices;
			document.getElementById("Strength").value = toSetTo.Strength;
		}
	}
	catch(err) {
		if(err == "not found"){alert("Configuration could not be found. Please try again.");}
	}
	document.getElementById("setValue").value = "";
}

//Insertion sort to sort array so it can be searched through later
function insertionSort(array) {
	//Run for length of unsorted array
	for (var i = 1; i < array.length; i++) {
		var currentValue = array[i];
		var position = i;

		//Sort array
		while (position > 0 && array[position-1].Name > currentValue.Name) {
			array[position] = array[position-1]; 
			position -= 1;
		}
		array[position] = currentValue
	}
}

//Binary search to search for target in array
function binarySearch(array, target) {
	//Initialise low and high and if target has been found
	var low = 0;
	var high = array.length-1;
	var found = false;
	
	while (low<=high && !found) {
		//Check if value at average of high and low is the target
		var mid = Math.floor((low+high)/2);
		if (array[mid].Name == target) {
			found = true;
			return array[mid];
		}
		else {
			//If not, high becomes 1 less or low becomes 1 more than mid depending on if target is less or more than mid
			if (target < array[mid].Name) {
				high = mid-1;	
			}
			else {
				low = mid+1
			}
		}
	}
	if (!found) {
		return false;
	}
}

//If the ragdoll demo is being used, load a few preset configs the user may use
function preLoad() {
	var planets = [["Earth", 9.8, 1.2, 1, 1,"Particles", 10], ["Moon", 1.6, 0, 1, 1,"Particles", 10], ["Mars", 3.7, 0.02, 1, 1,"Particles", 10], ["Jupiter", 24.8, 0.16, 1, 1,"Particles", 10]]
	for (var i = 0; i < planets.length; i++) {
		var x = configArray.push(new RagdollConfig(planets[i][0], planets[i][1], planets[i][2], planets[i][3], planets[i][4],planets[i][5], planets[i][6]));
		format(x)
	}
	insertionSort(configArray);
}
if(document.title == "Ragdoll Simulation") {
	preLoad();
}
