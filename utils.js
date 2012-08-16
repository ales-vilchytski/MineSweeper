//class Enum
function Enum(list) {
	var en = new Object();
	for (var i in list) {
		en[list[i]] = { str : list[i], toString : function() { return this.str; } };
	}
	//add Object.freeze(en) here
	return en;
}

//class FSM - finite state machine
function FSM(initialState) {
	var currentState = initialState;
	this.getCurrentState = function() { return currentState; }
	
	var transitions = new Object();
	
	this.addTransition = function(fromState, toState, func) {
		if (!transitions[fromState]) { 
			transitions[fromState] = new Object(); 
		}
		transitions[fromState][toState] = func;
	}
	
	this.changeState = function(newState) {
		var state = currentState;
		currentState = newState;
		var f = transitions[state][newState];
		f();
		
	}
	
	this.debug = function() {
		for (var i in transitions) {
			for (var j in transitions[i]) {
				alert(transitions[i][j]);
			}
		}
	}
}

function visitNeighbourCells(cellsArray, x, y, callback) {
	for (var i = x - 1; i <= x + 1; ++i) {
		for (var j = y - 1; j <= y + 1; ++j) {
			if (i == x && j == y) {
				continue;
			} else {
				if (i >= 0 && i < cellsArray.length &&
					j >= 0 && j < cellsArray[i].length) {
					callback(cellsArray[i][j], i, j);
				}
			}
		}
	}
}