//interacts with GAPI, sending updates to gameboard object
var width = 400;
var height = 400;
var board;			//canva
var context;		//canvas context
var container;		//holds color score, player names and join button

var stepRequired = false;

var bstr;

var redPlayer;
var yellowPlayer;
var timerArray = [100,500,5000,20000];
var aiRedTimer;
var aiYellowTimer;

var redWins = 0;
var yellowWins = 0;
var yellowMoves = 0 ;
var redMoves = 0;
var yellowDepth = 0;
var redDepth = 0;
//contains game state and methods
var Game;

function updateInfoDisplay() {
	document.getElementById("info").innerHTML = infoDisplay;
}

function startNewGameClick(){
	redPlayer = document.getElementById("redMenu").selectedIndex;
	yellowPlayer = document.getElementById("yellowMenu").selectedIndex;
	aiRedTimer = timerArray[document.getElementById("redCalc").selectedIndex];
	aiYellowTimer = timerArray[document.getElementById("yellowCalc").selectedIndex];
	stepRequired = (document.getElementById("stepMenu").selectedIndex == 2);
	Game = new FourInARow();
	setupCanvasObjects();
	Game.startGame();
	Game.drawBoard();
	document.getElementById("info").innerHTML = ""; 
}

//called by game object when it has data to send out
function sendStateToServer(boardString){
	if (!Game.gameOver){
		bstr = boardString;
		if (JSON.parse(boardString).blackTurn == "true"){
			if (redPlayer != 0){
				if (stepRequired) {
					document.getElementById("stepButton").onclick = function () {runAI(bstr, 1, redPlayer, aiRedTimer);};
				}
				else {
					setTimeout('runAI(bstr, 1, redPlayer, aiRedTimer)',10);
				}
				return;
			}
		}
		else{
			if (yellowPlayer != 0){
				if (stepRequired) {
					document.getElementById("stepButton").onclick =  function () {runAI(bstr, -1, yellowPlayer, aiYellowTimer);};
				}
				else {
					setTimeout('runAI(bstr, -1, yellowPlayer, aiYellowTimer)',10);
				}
				return;
			}

		}
	//next move not a bot, let player pick
	sendStateToGame(boardString);
}
	
}

//passes updated state to gameboard
function sendStateToGame(boardString){
	Game.recieveState(boardString);
}

function sendClickToGame(e) {
	Game.click(e);
}

function isPlayerTurn(color) {
	if (color == 1 && redPlayer == 0){
		return true;
	}
	if (color == 2 && yellowPlayer == 0){
		return true;
	}
}

//updates info div with winner info and button to start new game
function gameEnded(winnerText){
	infoDisplay = winnerText;
	document.getElementById("info").innerHTML = infoDisplay; 
	if (infoDisplay == "Red Wins!") {
		document.getElementById("redWins").innerHTML = ++redWins;
	} 
	else {
		document.getElementById("yellowWins").innerHTML = ++yellowWins;		
	}

	document.getElementById("redAvgDepth").innerHTML = redDepth/redMoves;		
	document.getElementById("yellowAvgDepth").innerHTML = yellowDepth/yellowMoves;		


	if (document.getElementById("stepMenu").selectedIndex == 0){
		startNewGameClick();
	}

}

//creates on context object and listener
function setupCanvasObjects() {
	board = document.getElementById("board");
	context = board.getContext("2d"); 
	container = document.getElementById("container");
	//listens for clicks on the board	
	board.addEventListener("mousedown",sendClickToGame,false);
}


