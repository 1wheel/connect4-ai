var lastPause;

function runAI(boardString, turn, aiType, aiTimer){
	if (!Game.gameOver){
		var boardState = JSON.parse(boardString);
		var position = JSON.parse(boardState.cArray);
		for (var x = 0; x < 8; x++){
			for (var y = 0; y < 8; y++){
				position[x][y] = (position[x][y] == 2) ? -1 : position[x][y];
			}
		}

		if (aiType == 1){
			//console.log("negamax started " + turn);
			lastPause =  new Date().getTime();
			var depth = 2;
			while (new Date().getTime() - lastPause < aiTimer/7){
				depth++;
				var result = negamax(position,depth,turn);
			}
		}

		if (aiType == 2){
			//console.log("alphabeta started " + turn);
			lastPause =  new Date().getTime();
			var depth = 2;
			while (new Date().getTime() - lastPause < aiTimer/7){
				depth++;
				var alpha = {value: -1000, move: 0};
				var beta = {value: 1000, move: 0};

				var result = alphabeta(position,depth,turn,alpha.clone(),beta.clone());
				for (var i = 0; i < HHR.length; i++){
					for (var j = 0; j < HHR.length; j++){
						HHR[i][j] = Math.min(Math.floor(HHR[i][j]/2),32);
						HHY[i][j] = Math.min(Math.floor(HHY[i][j]/2),32);
					}
				}
			}		
			//console.log(JSON.stringify(HHR));
		}

		var delay = new Date().getTime() - lastPause;
		console.log("turn " + turn + " move " + result.move + "  score " + result.value + " depth " + depth + " time " + delay);
		//console.log("depth of " + depth + " after " + delay);
		if (result.move != undefined){
			Game.botMove(result.move);
		}

		else {
			boardState = JSON.parse(boardString);
			console.log("AI error... game over?");
		}
	}
}

function negamax(position, depth, turn) {
	if (position == 500){
		//console.log("winnerfound returning " + -500);
		return {value: -500, depth: depth};
	}
	if (depth == 0) {
		return {value: turn*evalPosition(position)};
	}

	var best = {value: -1000, move: 0};
	var tempPosition;
	var result;

	var moveOrder = randomPermutation(8);
	//console.log(moveOrder);
	for (var i = 0; i<8; i++){
		tempPosition = doMove(position.clone(),moveOrder[i],turn);
		if (tempPosition){
			result = negamax(tempPosition, depth-1,-turn);
			result.value = -result.value;
			//console.log(result.value + " >? " + best.value + "  current best value is " + best.move);
			if (result.value>best.value){
				//console.log("best value updated");
				best = {value: result.value, move: moveOrder[i], depth: result.depth};
			}
			//winning faster/losing slow is better
			else if (Math.abs(result.value) == 500 && result.value == best.value){
				if ( (result.depth - best.depth)*(result.value/500) > 0) {
					best = {value: result.value, move: moveOrder[i], depth: result.depth};
				}
			}
		}
	}

	return best;
}

function alphabeta(position, depth, turn, alpha, beta) {
	//console.log("trying at depth " + depth);
	if (position == 500){
		//console.log("winnerfound returning " + -500);
		return {value: -500, depth: depth};
	}
	if (depth == 0) {
		return {value: turn*evalPosition(position)};
	}

	var tempPosition;
	var result;

	var moveOrder = HHsort(position, turn);
	for (var i = 0; i<8; i++){
		tempPosition = doMove(position.clone(),moveOrder[i],turn);
		if (tempPosition ){
			result = alphabeta(tempPosition, depth-1,-turn,-beta.clone(),-alpha.clone());
			result.value = -result.value;
			result.move = moveOrder[i];
			alpha = (alpha.value>result.value) ? alpha : result.clone();
			if (alpha.value >= beta.value){
				return beta.clone();
			}

			if (Math.abs(result.value) == 500 && result.value == result.value){
				if ( (result.depth - alpha.depth)*(result.value/500) < 0) {
					alpha = result.clone();
				}
			}
		}
	}
	updateHH(position, depth, turn, alpha.move);
	return alpha.clone();
}

function updateHH(position, depth, turn, x){
	var y = maxY(x, position);
	if (turn == 1){
		HHR[x][y] = HHR[x][y] + Math.pow(2,depth);
	}
	else {
		HHY[x][y] = HHY[x][y] + Math.pow(2,depth);
	}
}

//returns best move order, based on HH table
function HHsort(position, turn){
			//return randomPermutation(8);

	var rv = [];
	var tempHH = (turn==1) ? HHR.clone() : HHY.clone();
	for (var i = 0; i< 8; i++){
		tempHH[i] = tempHH[i][maxY(i,position)];
		tempHH[i] = (tempHH[i] == undefined) ? 0 : tempHH[i];
	}
	if (eval(tempHH.join('+'))==0){
		return randomPermutation(tempHH.length);
	}

	for (var i = 0; i < 8; i++){
		var maxValue = -1;
		var maxIndex = 0;
		for (var x=0; x<8;x++){
			if (tempHH[x] > maxValue){
				maxValue = tempHH[x];
				maxIndex = x;
			}
		}
		rv[i] = maxIndex;
		tempHH[maxIndex] = -10;

	}
	return rv;
}

function evalPosition(position){
	var cArray = position;

	//finds next valid move in all columns
	var maxYArray = [];
	for (var x = 0; x<8; x++){
		maxYArray[x] = maxY(x,cArray);
	}
	//finds the heighest piece in each column touching another piece
	var maxYHArray = [];
	for (var x = 0; x<8; x++){
		maxYHArray[x] = (x != 0 && maxYArray[x-1] < maxYArray[x]) ? maxYArray[x-1]  : maxYArray[x];
		maxYHArray[x] = (x != 7 && maxYArray[x+1] < maxYArray[x]) ? maxYArray[x+1]  : maxYHArray[x];
		maxYHArray[x] = Math.min(0, maxYHArray[x]-1);
	}

	var winningMoves = 0;
	for (var x = 0; x < 8; x++){
		for (var y = maxYHArray[x]; y <= maxYArray[x] ; y++){
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
	var y = maxY(i, cArray);
	//console.log(i + "   " + y);
	cs = cArray;
	ts = turn;
	if (cArray[i][0]==0){
		cArray[i][y] = turn;
		if (checkGameEnd(i,y,cArray)){
			return 500;
			console.log("game end found");
		}
		return cArray;
	}

	return null;
}

	//returns position of lowest empty slot in column x
	maxY = function(x, cArray){
		var rv = 7;
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

function print2D (A){
	rv = "";
	for (var y = 0; y<A.length; y++){
		for (var x = 0; x<A[y].length;x++){
			rv += A[y][x];
		}
		rv += "/n"
	}
	return rv;
}

var HHR = [];
var HHY = [];
for (var x = 0; x<8; x++){
	HHR[x] = [];
	HHY[x] = [];
	for (var y = 0; y<8; y++){
		HHR[x][y] = 0;
		HHY[x][y] = 0;
	}
}

function changeFrom2(position){
	for (var x = 0; x < 8; x++){
		for (var y = 0; y < 8; y++){
			position[x][y] = (position[x][y] == 2) ? -1 : position[x][y];
		}
	}
	return position;
}
