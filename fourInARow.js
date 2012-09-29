function FourInARow(){
	this.bnx = 8;						//number of boxs
	this.bny = 8;
	this.bs = Math.min(width,height) /8; //boxsize

	this.cArray = [];					//chipArray

	this.blackTurn;
	this.teamArray = ["Neutral", "Red", "Yellow"];
	this.gameOver = false;

	//sends the starting game layout to wrapper
	this.callSendState = function(){
			var boardState = {
				cArray:			JSON.stringify(this.cArray), 
				blackTurn:		JSON.stringify(this.blackTurn),
			}
		sendStateToServer(JSON.stringify(boardState));
	}
	
	this.recieveState = function (boardString) {
		var boardState = 	JSON.parse(boardString);
		this.cArray = 		JSON.parse(boardState.cArray);
		this.blackTurn = 	JSON.parse(boardState.blackTurn);
		this.drawBoard();
	}


	//initilizes empty arrays representing game state
	this.startGame = function() {		
		setupCanvasObjects();	

		//fills this.cArray with 0s
		for (var x = 0; x < this.bnx; x++) {
			this.cArray[x] = [];
			for (var y = 0; y < this.bny; y++) {
				this.cArray[x][y] = 0;
			}
		}
		
		//sets starting player
		this.blackTurn = true;
		

		this.callSendState();	
	}

	//clears canvas and redraws board
	this.drawBoard = function() {
		//clear and resize canvas
		//board.width = width;
		//board.height = height;
		
		//clears canvas
		context.fillStyle = "rgb(255,255,255)";
		context.fillRect(0, 0, width, height);
		context.fillStyle = "Blue";
		context.fillRect(0, 0, this.bnx*this.bs, this.bny*this.bs);
		
		this.drawPieces();
	}	

	//draw pieces placed by players
	this.drawPieces = function(){
		for (var x = 0; x < this.bnx; x++) {
			for (var y = 0; y < this.bny; y++) {
				this.drawPiece(x,y,this.cArray[x][y],this.bs/2.4);
			}
		}
	}

	//draws a single piece at x, y with color and size passed
	//larger size values make smaller pieces
	this.drawPiece = function(x, y, color, size) {
		if (color == 0) {
			context.fillStyle = "White";
		}
		else if (color == 1) {
			context.fillStyle = "Red";
		}
		else {
			context.fillStyle = "Yellow"
		}
		
		context.beginPath();
		context.arc((x+.5)*this.bs, (y+.5)*this.bs, size, 0, 2*Math.PI, false);
		context.fill();
		context.closePath();
	}

	//called when there are no valid moves. adds a button to start new game
	 this.endGame = function(){
	 	this.gameOver = true;

		//creates Winner text
		var winnerText = (this.blackTurn) ? "Yellow Wins!" : "Red Wins!";

		console.log(winnerText);
		gameEnded(winnerText);
	}

	//called when the page is clicked
	this.click = function(e){
		var color = (this.blackTurn) ? 1 : 2;
		var pos = this.findPos(board);		
		var cord = this.findCord(e.pageX - pos.x, e.pageY - pos.y);

		if (cord) {

			var x = cord.x;
			var y = this.maxY(cord.x);
			//if click is on the board, see if it is valid move
			if (y >= 0) {
				//checks to see if it is the local player's turn
				if (isPlayerTurn(color) && !this.gameOver) {

					this.cArray[x][y] = color;
					this.drawBoard();
					this.blackTurn = !this.blackTurn;
					
					if (this.checkGameEnd(x,y)) {
						this.endGame();
					}

					//uploads newboard state
					this.callSendState();

				}
			}
		}
	}

	//returns position of lowest empty slot in column x
	this.maxY = function(x){
		var rv = 7;
		while (rv >= 0 && this.cArray[x][rv] != 0){
			rv--;
		}
		return rv;
	}

	this.checkGameEnd = function(x, y){
		var rv = false;
		if (this.cArray[x][y] != 0) {
			rv = (rv) ? rv : this.check4(x, y, 1, 0);
			rv = (rv) ? rv : this.check4(x, y, 1, -1);
			rv = (rv) ? rv : this.check4(x, y, 0, 1);
			rv = (rv) ? rv : this.check4(x, y, 1, 1);
		}
		return rv;
	}


	this.check4 = function(x, y, dx, dy) {
		var color = this.cArray[x][y];
		var length = 1;
		var i = 1;
		while (this.onBoard(x+dx*i,y+dy*i)) {
			if (this.cArray[x+dx*i][y+dy*i] == color){
				length++;
				i++;
			}
			else{
				break;
			}
		}
		i = -1;
		while (this.onBoard(x+dx*i,y+dy*i)) {
			if (this.cArray[x+dx*i][y+dy*i] == color){
				length++;
				i--;
			}
			else{
				break;
			}
		}

		return (length>=4);
	}

	//finds which line the passed cord is closest to
	this.findCord = function(x, y){	
		var RV = new Object; 	//return value
		
		//true if point is inside grid
		if (0 < x && x < this.bs*this.bnx && 0 < y && y < this.bs*this.bnx ){
			xs = Math.floor(x/this.bs);
			ys = Math.floor(y/this.bs);
			
			RV.x = xs;
			RV.y = ys;
		}
		//cord not on grid; return false
		else {
			RV = false;
		}
		
		return RV;
	}

	//returns true if the cord is on the board
	this.onBoard = function(x, y) {
		return (0 <= x && x < this.bnx && 0 <= y && y < this.bny);
	}

	//finds how much the canvas is offset in the frame
	this.findPos = function(obj) {
		var curleft = 0, curtop = 0;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
			return { x: curleft, y: curtop };
		}
		return undefined;
	}

	this.botMove = function(x){
		var color = (this.blackTurn) ? 1 : 2;
		var y = this.maxY(x);
		//if click is on the board, see if it is valid move
		if (y >= 0) {
			//checks to see if it is the local player's turn
			if (!this.gameOver) {

				this.cArray[x][y] = color;
				this.drawBoard();
				this.blackTurn = !this.blackTurn;
				
				//uploads newboard state
				this.callSendState();

				if (this.checkGameEnd(x,y)) {
					this.endGame();
				}
			}
		}
		else {
			console.log("bot selected invalid move");
		}
	}

}