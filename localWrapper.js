//interacts with GAPI, sending updates to gameboard object
var width = 400;
var height = 400;
var board;			//canva
var context;		//canvas context
var container;		//holds color score, player names and join button

var bstr;

var gameList = ["Checkers", "Dots", "Reversi", "Four in a Row"];
var gameFunctionList = ["Checkers", "Dots", "Reversi", "FourInARow"];
var dropDownMenu;
var lastSelection = 0;
createDropDownMenu(lastSelection);
function createDropDownMenu(selectedID){
	dropDownMenu = "";
	for (var i = 0; i < gameList.length; i++){
		if (i == selectedID) {
			dropDownMenu += '<option selected = "selected" value="' + gameList[i] + '">' + gameList[i] +'</option>';
		}
		else{
		dropDownMenu += '<option value="' + gameList[i] + '">' + gameList[i] +'</option>';
		}
	}
	dropDownMenu = '<select  id="gameMenu">' + dropDownMenu + '</select>';
}


var startGameButton = "<input type='button' value='Play' onclick='startNewGameClick();' />";
var startGameHTML = startGameButton + " a game of " + dropDownMenu;

//displays below game canvas
var infoDisplay = startGameHTML;
updateInfoDisplay();

//contains game state and methods
var Game;

function updateInfoDisplay() {
	document.getElementById("info").innerHTML = infoDisplay;
}

function startNewGameClick(){
	var selectedGame = gameFunctionList[document.getElementById("gameMenu").selectedIndex];
	lastSelection = document.getElementById("gameMenu").selectedIndex;
	eval("Game = new " + selectedGame +"();");
	setupCanvasObjects();
	Game.startGame();
}

//called by game object when it has data to send out
function sendStateToServer(boardString){
	bstr=boardString;
	sendStateToGame(boardString);
	//gapi.hangout.data.submitDelta({boardString: boardString})
}

//passes updated state to gameboard
function sendStateToGame(boardString){
	Game.recieveState(boardString);
}

function sendClickToGame(e) {
	Game.click(e);
}

function isPlayerTurn(color) {
	return true;
}

//updates info div with winner info and button to start new game
function gameEnded(winnerText){
	createDropDownMenu(lastSelection);
	infoDisplay = winnerText + startGameButton + " a new game of " + dropDownMenu;
	document.getElementById("info").innerHTML = infoDisplay; 
}

//creates on context object and listener
function setupCanvasObjects() {
	board = document.getElementById("board");
	context = board.getContext("2d"); 
	container = document.getElementById("container");
	//listens for clicks on the board	
	board.addEventListener("mousedown",sendClickToGame,false);
}

document.getElementById("gameMenu").selectedIndex = 3;
startNewGameClick();