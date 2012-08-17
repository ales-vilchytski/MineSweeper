//uses utils.js

//class Cell
function Cell(clicked, content, mark) {
	this.clicked = clicked;
	this.content = content;
	this.mark = mark;
}

var Content = new Enum ([
	'NONE', 'MINE', 'ONE', 'TWO', 'THREE', 'FOUR', 
	'FIVE', 'SIX', 'SEVEN', 'EIGHT'
]);

var State = new Enum([
	'BEGIN', 'RUNNING', 'GAME_OVER', 'FINISH'
]); 

var Mark = new Enum ([
	'NONE', 'FLAG', 'QUESTION'
]);

//class Sweeper
function Sweeper(_x, _y, _mines, _ui) {	
	var x = (_x > 5) ? (_x) : (5);
	var y = (_y > 5) ? (_y) : (5);
	var mines = (_mines > 1) ? ( (_mines < x * y) ? (_mines) : (x * y - 1) ) 
							 : (1);
	
	this.getX = function() { return x; };
	this.getY = function() { return y; };
	this.getMines = function() { return mines; };
	
	var ui = _ui;
	ui.setSweeper(this);
	
	var cells = new Array();
	this.getCells = function() { return cells; }

	//generate cells
	{
		var minesMap = new Array();
		for (var i = 0; i < x; ++i) {
			minesMap.push(new Array(y));
		}
		var minesCount = 0;
		
		while (minesCount < mines) {
			var xm = Math.floor(Math.random() * x);
			var	ym = Math.floor(Math.random() * y);
			if (minesMap[xm][ym] != true) {
				minesMap[xm][ym] = true;
				++minesCount;
			}
		}
		
		for (var i = 0; i < x; ++i) {
			cells.push(new Array());
			for (var j = 0; j < y; ++j) {
				var content;
				if (minesMap[i][j] === true) {
					content = Content.MINE;
				} else {
					content = Content.NONE;
				}
				cells[i].push(new Cell(false, content, Mark.NONE));
			}
		}
		//calculate mines around each cell
		var contentMap = new Array();
		contentMap[0] = Content.NONE;
		contentMap[1] = Content.ONE;
		contentMap[2] = Content.TWO;
		contentMap[3] = Content.THREE;
		contentMap[4] = Content.FOUR;
		contentMap[5] = Content.FIVE;
		contentMap[6] = Content.SIX;
		contentMap[7] = Content.SEVEN;
		contentMap[8] = Content.EIGHT;
			
		for (var i = 0; i < x; ++i) {
			for (var j = 0; j < y; ++j) {
				if (cells[i][j].content != Content.MINE) {
					var count = 0;
					visitNeighbourCells(cells, i, j, 
						function(cell, x, y) {
							if (cell.content === Content.MINE) { 
								++count;
							}
						});
					cells[i][j].content = contentMap[count];
				}
			}
		}			
	} 
	//end generate cells
	
	var stateManager = new FSM(State.BEGIN);
	this.getStateManager = function() { return stateManager; }
			
	var interval;
	var seconds = 0;
	this.getSeconds = function() { return seconds; }
		
	//initialize state manager with transitions
	{
		var finishGame = function() { 
			for (var i in cells) {
				for (var j in cells[i]) {
					ui.refreshCell(cells[i][j], i, j);		
				}
			}
			clearInterval(interval);		
		};
		stateManager.addTransition(State.RUNNING, State.GAME_OVER, finishGame);
		stateManager.addTransition(State.BEGIN, State.GAME_OVER, finishGame);
		
		stateManager.addTransition(State.BEGIN, State.RUNNING, 
			function() {
				interval = setInterval(function() { ui.refreshSeconds(++seconds); }, 1000);
		});
		stateManager.addTransition(State.RUNNING, State.FINISH, 
			function() {
				finishGame();
				minesRemained = 0;
				ui.refreshMinesRemained(minesRemained);
		});
	}
	//end initialize state manager
	
	var notClickedCells = x * y;
	
	var doClickCell = function(x, y) {
		cells[x][y].clicked = true;
		ui.refreshCell(cells[x][y], x, y);
		--notClickedCells;
	};
	
	//click and mark cell actions	
	var checkClickPreconditions = function(x, y) {
		if (stateManager.getCurrentState() === State.GAME_OVER ||
			stateManager.getCurrentState() === State.FINISH ||
			cells[x][y].clicked) {
			return false;
		} else {
			return true;
		}
	};
	
	
	var _clickCell = function(x, y) { 
		if (!checkClickPreconditions(x, y)) {
			return;
		}
		if (stateManager.getCurrentState() === State.BEGIN) {
			stateManager.changeState(State.RUNNING);
		}
		
		var mark = cells[x][y].mark;
		if (mark == Mark.FLAG) { 
			return; 
		}
	
		doClickCell(x, y);
			
		var content = cells[x][y].content;
		if (content === Content.MINE) {
			stateManager.changeState(State.GAME_OVER);
		} else if ((stateManager.getCurrentState() === State.RUNNING ||
				    stateManager.getCurrentState() === State.BEGIN) &&
				   notClickedCells == mines) {
			stateManager.changeState(State.FINISH);
		} else if (content === Content.NONE) {
			visitNeighbourCells(cells, x, y, 
				function(cell, m, n) {
					_clickCell(m, n);
				});
		}
	};
	this.clickCell = _clickCell;	//make _clickCell public
	
	var minesRemained = mines;
	this.minesRemained = function() { return minesRemained; };
	
	this.markCell = function(x, y) {
		if (!checkClickPreconditions(x, y)) {
			return;
		}
		
		var cell = cells[x][y];
		switch (cell.mark) {
			case Mark.NONE:
				cell.mark = Mark.FLAG;
				--minesRemained;
				ui.refreshMinesRemained(minesRemained);
				break;
			case Mark.FLAG:
				cell.mark = Mark.QUESTION;
				++minesRemained;
				ui.refreshMinesRemained(minesRemained);
				break;
			case Mark.QUESTION:
				cell.mark = Mark.NONE;
				break;
			default:
				throw "unknown mark " + cell.mark;
		}
		
		ui.refreshCell(cell, x, y);
	};

	ui.show(cells, minesRemained, seconds);
	
	this.dispose = function(x, y, mines) {
		if (interval) {
			clearInterval(interval);
		}
	};
	
	this.debug = function() {
		var cellsStr = '';
		for (var i in cells) {
			cellsStr += '\n';
			for (var j in cells[i]) {
				cellsStr += cells[i][j].content + '|';
			}
		}
	};
}