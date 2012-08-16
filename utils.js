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
		if (!transitions[fromState][toState]) {
			transitions[fromState][toState] = new Array();
		}		
		transitions[fromState][toState].push(func);
	}
	
	this.changeState = function(newState) {
		var state = currentState;
		currentState = newState;
		var funcs = transitions[state][newState];
		for (var i in funcs) {
			funcs[i]();
		}
	}
	
	this.debug = function() {
		for (var i in transitions) {
			for (var j in transitions[i]) {
				alert(transitions[i][j]);
			}
		}
	}
}

function visitNeighbourCells(cellsArray, xx, yy, callback) {
	var x = Number(xx), y = Number(yy);
	for (var i = x - 2; ++i <= x + 1; ) {
		for (var j = y - 2; ++j <= y + 1; ) {
			if (i >= 0 && i < cellsArray.length &&
				(j >= 0 && j < cellsArray[i].length) &&
				!(i === x && j === y)) {
				callback(cellsArray[i][j], i, j);
			}
		}
	}
}