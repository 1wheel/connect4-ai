function runNegamax(){
	var s = bstr;
	console.log(negamax(s,3,1));
	Game.recieveState(s);
}

function negamax(position, depth, turn) {
	console.log("trying at depth " + depth);
	var terminalVal = terminal(position);
	if (terminalVal != null){
		console.log("terminal fond " + terminalVal);
		return {value: terminalVal};
	}
	if (depth == 0) {
		console.log("evaling position");
		save = {value: turn*evalPosition(position)};
		return {value: turn*evalPosition(position)};
	}


	var best = {value: -1000, move: 0};
	var tempPosition;
	var tempValue
	for (var i = 0; i<8; i++){
		tempPosition = doMove(position,i,turn);
		if (tempPosition){
			tempValue = -negamax(tempPosition, depth-1,-turn).value;
			if (tempValue>best.value){
				best = {value: tempValue, move: i};
			}
		}
	}
	save2 = best;
	return best;
}

function terminal(position){
	var Game = new FourInARow();
	Game.recieveState(position);

	var eval = null;	
	var topRowFull = true;
	for (var x = 0; x < 8; x++){
		for (var y = 0; y < 8; y++){
			if (Game.checkGameEnd(x,y)){
				eval = (Game.cArray[x,y] == 1) ? 1 : -1;
				eval = eval*500;
			}
		}
		topRowFull = (topRowFull) ? (Game.cArray[x][0] != 0) : false;
	}

	//tie game
	if ((eval != null) && topRowFull) {
		eval = 0;
	}

	return eval;
}

function evalPosition(position){
	var Game = new FourInARow();
	Game.recieveState(position);

	var winningMoves = 0;

	for (var x = 0; x < 8; x++){
		for (var y = 0; y < 8; y++){
			if (Game.cArray[x][y] == 0){
				Game.cArray[x][y] = 1;
				if (Game.checkGameEnd(x,y)){
					winningMoves++;
				} 
				Game.cArray[x][y] = 2;
				if (Game.checkGameEnd(x,y)){
					winningMoves--;
				} 
				Game.cArray[x][y] = 0;
			}
		}
	}

	return winningMoves;
}

function doMove(position, i, turn){
	var Game = new FourInARow();
	Game.recieveState(position);

	if (Game.cArray[i][0]==0){
		Game.cArray[i][Game.maxY(i)] = (turn == 1) ? 1 : 2;
			var boardState = {
				cArray:			JSON.stringify(Game.cArray), 
				blackTurn:		JSON.stringify(Game.blackTurn),
			}
		return JSON.stringify(boardState);
	}

	return null;
}