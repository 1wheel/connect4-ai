var lastPause;

function runNegamax(){
	console.log("searching for a move...");

	var boardState = JSON.parse(bstr);
	var position = JSON.parse(boardState.cArray);
	for (var x = 0; x < 8; x++){
		for (var y = 0; y < 8; y++){
			position[x][y] = (position[x][y] == 2) ? -1 : position[x][y];
		}
	}

	lastPause =  new Date().getTime();
	var depth = 2;
	while (new Date().getTime() - lastPause < 2000){
		depth++;
		var result = negamax(position,depth,1);
	}
	console.log("move " + result.move + "   score " + result.value);
	var delay = new Date().getTime() - lastPause;
	console.log("depth of " + depth + " after " + delay);
	if (result.move != undefined){
		plog = position;
		position = JSON.parse(boardState.cArray);
		position[result.move][maxY(result.move, position)] = 1;
		boardState = {	cArray: JSON.stringify(position),
						blackTurn: JSON.stringify(false),
					 };
		sendStateToServer(JSON.stringify(boardState));

	}
	else {
		boardState = JSON.parse(bstr);
		console.log("AI error... game over?");
	}
}
function runAlphabeta(){
	console.log("searching for a move...");

	var boardState = JSON.parse(bstr);
	var position = JSON.parse(boardState.cArray);
	for (var x = 0; x < 8; x++){
		for (var y = 0; y < 8; y++){
			position[x][y] = (position[x][y] == 2) ? -1 : position[x][y];
		}
	}

	lastPause =  new Date().getTime();
	var depth = 2;
	while (new Date().getTime() - lastPause < 700){
		depth++;
		var alpha = {value: -1000, move: 0};
		var beta = {value: 1000, move: 0};

		var result = alphabeta(position,depth,1,alpha.clone(),beta.clone());
	}
	console.log("move " + result.move + "   score " + result.value);
	var delay = new Date().getTime() - lastPause;
	console.log("depth of " + depth + " after " + delay);
	if (result.move != undefined){
		plog = position;
		position = JSON.parse(boardState.cArray);
		position[result.move][maxY(result.move, position)] = 1;
		boardState = {	cArray: JSON.stringify(position),
						blackTurn: JSON.stringify(false),
					 };
		sendStateToServer(JSON.stringify(boardState));

	}
	else {
		boardState = JSON.parse(bstr);
		console.log("AI error... game over?");
	}
}

function negamax(position, depth, turn) {
	//console.log("trying at depth " + depth);
	var terminalVal = terminal(position);
	if (terminalVal != null){
		return {value: terminalVal};
	}
	if (depth == 0) {
		return {value: turn*evalPosition(position)};
	}

	var best = {value: -1000, move: 0};
	var tempPosition;
	var tempValue;

	var moveOrder = randomPermutation(8);
	for (var i = 0; i<8; i++){
		tempPosition = doMove(position.clone(),moveOrder[i],turn);
		if (tempPosition){
			tempValue = -negamax(tempPosition, depth-1,-turn).value;
			if (tempValue>best.value){
				best = {value: tempValue, move: moveOrder[i]};
			}
		}
	}

	return best;
}

function alphabeta(position, depth, turn, alpha, beta) {
	//console.log("trying at depth " + depth);
	var terminalVal = terminal(position);
	if (terminalVal != null){
		return {value: terminalVal};
	}
	if (depth == 0) {
		return {value: turn*evalPosition(position)};
	}

	var tempPosition;
	var temp;

	var moveOrder = randomPermutation(8);
	for (var i = 0; i<8; i++){
		tempPosition = doMove(position.clone(),moveOrder[i],turn);
		if (tempPosition){
			temp = {value: -alphabeta(tempPosition, depth-1,-turn,-beta.clone(),-alpha.clone()).value, move: moveOrder[i]};
			alpha = (alpha.value>temp.value) ? alpha : temp;
			if (alpha.value >= beta.value){
				return beta;
			}
		}
	}

	return alpha;
}

function terminal(position){
	var cArray = position;

	var eval = null;	
	var topRowFull = true;
	for (var x = 0; x < 8; x++){
		for (var y = 0; y < 8; y++){
			if (checkGameEnd(x,y,cArray)){
				eval = (cArray[x,y] == 1) ? 500 : -500;
			}
		}
		topRowFull = (topRowFull) ? (cArray[x][0] != 0) : false;
	}

	//tie game
	if ((eval != null) && topRowFull) {
		eval = 0;
	}

	return eval;
}

function evalPosition(position){
	var cArray = position;

	var winningMoves = 0;

	for (var x = 0; x < 8; x++){
		for (var y = 0; y < 8; y++){
			if (cArray[x][y] == 0){
				cArray[x][y] = 1;
				if (checkGameEnd(x,y,cArray)){
					winningMoves++;
				} 
				cArray[x][y] = -1;
				if (checkGameEnd(x,y,cArray)){
					winningMoves--;
				} 
				cArray[x][y] = 0;
			}
		}
	}

	return winningMoves;
}

function doMove(position, i, turn){
	var cArray = position;

	if (cArray[i][0]==0){
		cArray[i][maxY(i, cArray)] = turn;
		return cArray;
	}

	return null;
}

	//returns position of lowest empty slot in column x
	maxY = function(x, cArray){
		var rv = 7;
		lcArray = cArray;
		lx = x;
		while (rv >= 0 && cArray[x][rv] != 0){
			rv--;
		}
		return rv;
	}

	checkGameEnd = function(x, y, cArray){
		var rv = false;
		if (cArray[x][y] != 0) {
			var color = cArray[x][y];
			rv = (rv) ? rv : check4(x, y, 1, 0, cArray, color);
			rv = (rv) ? rv : check4(x, y, 1, -1, cArray, color);
			rv = (rv) ? rv : check4(x, y, 0, 1, cArray, color);
			rv = (rv) ? rv : check4(x, y, 1, 1, cArray, color);
		}
		return rv;
	}


	check4 = function(x, y, dx, dy, cArray, color) {
		var length = 1;
		var i = 1;
		while (onBoard(x+dx*i,y+dy*i)) {
			if (cArray[x+dx*i][y+dy*i] == color){
				length++;
				i++;
			}
			else{
				break;
			}
		}
		i = -1;
		while (onBoard(x+dx*i,y+dy*i)) {
			if (cArray[x+dx*i][y+dy*i] == color){
				length++;
				i--;
			}
			else{
				break;
			}
		}

		return (length>=4);
	}

	onBoard = function(x, y) {
		return (0 <= x && x < 8 && 0 <= y && y < 8);
	}

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};

function randomPermutation(n){
	rv = [];
	for (var i = 0; i < n; i++){
		rv[i] = -1;
	}
	for (var i = 0; i < n; i++){
		while (rv[i] == -1){
			var prop = Math.floor(Math.random()*n);
			var unique = true;
			for (var j = 0; j < rv.length; j++){
				if (rv[j] == prop){
					unique = false;
				}
			}
			rv[i] = unique ? prop : rv[i];
		}
	}

	return rv;
}
