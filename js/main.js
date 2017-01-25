'use strict'

var EMPTY_SYMBOL        = '&nbsp;';
var MINE_SYMBOL         = '&#x1f4a3'; 
var SUSPECTED_SYMBOL    = '&#9873';
var HAPPY_SYMBOL        = '&#9786;';
var SAD_SAD             = '&#9785;';

var gLevel = { SIZE: 8, MINES: 5 };
var gState = { shownCount: 0, markedCount: 0 };
var gBoard = [];
var gMinesLeft = gLevel.MINES;
var gRandomNumbers=[];
var gTimePassed;
var gSecsInterval;

function initGame() {
    
    clearInterval(gSecsInterval);
    gSecsInterval = undefined;
    gTimePassed=0; 
    updateTime();

    gMinesLeft = gLevel.MINES;
    updateMinesLeft();

    updateUserMsg ('enjoy the game');

    initgRandomNumbers(gRandomNumbers);
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard( gBoard, '.gameBoard');
    // disable right mouse click: dont show windows10 stuff.
    document.oncontextmenu = document.body.oncontextmenu = function() {return false;}  
}

function setLevel (button){
    console.log('button',button);
    
   var level = button.classList.value;
   switch (level) {
       case 'easy':
           gLevel.SIZE = 5;
           gLevel.MINES = 3;
           break;
       case 'medium':
           gLevel.SIZE = 8;
           gLevel.MINES = 7;
           break;
       case 'hard':
           gLevel.SIZE = 10;
           gLevel.MINES = 15;
        //    elTable.style.width = "70%"; 
           break;
   }
   initGame();
}

function initgRandomNumbers(randomNumbers){
    // randomNumbers = [];
    for (var i = 0; i < gLevel.SIZE*gLevel.SIZE; i++) {
        randomNumbers[i] = i;      
    }
}


function buildBoard() {
    var board = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = { value: EMPTY_SYMBOL, show: false, suspected: false };
        }
    }

    // put the mines randomly on the board
    for (var i = 0; i < gLevel.MINES; i++) {
        var coord = getUniqueRandom();
        board[coord.i][coord.j] = { value: MINE_SYMBOL, show: false, suspected: false };
    }
    return board;
}


function getUniqueRandom() {
    var idx = getRandomInt( 0, gRandomNumbers.length-1 );
    var num = gRandomNumbers[idx];
    gRandomNumbers.splice(idx,1);
    if (gRandomNumbers === [])  return null;

    var res = {i:0,j:0};
    res.i = Math.floor(num / gLevel.SIZE);
    res.j = num % gLevel.SIZE;  
    return res;
}


// enter number of mine-neighbors in all cells.
function setMinesNegsCount(board) {
    board.forEach(function (cells, i) {
        cells.forEach(function (cell, j) {
            if (cell.value !== MINE_SYMBOL) {
                var nNegs = getNegs(board, i, j);
                if (nNegs > 0) {
                    board[i][j].value = nNegs;
                    board[i][j].show = false;
                }
            }
        });
    });
}


// get number of mine-neighbors in single cell
function getNegs(board, cellI, cellJ) {
    var nNegs = 0;
    for (var i =cellI-1; i <= cellI+1; i++) {
        for (var j =cellJ-1; j <= cellJ+1; j++) {
            if ( i === cellI && j === cellJ ) continue;
            if ( i < 0 || i > board.length-1) continue;
            if ( j < 0 || j > board[0].length-1) continue;
            // console.log("Curr cell indexes: ", i, j);
            if (board[i][j].value === MINE_SYMBOL) nNegs++;
        }
    }
    return nNegs;
}


function renderBoard(board, elSelector) {
    var strHtml = '';

    board.forEach(function(cells, i){
        strHtml += '<tr>\n';

        cells.forEach(function(cell, j){
            var classNames = 'tdcell';
            var value = '';
            
            if (cell.suspected) {
                value = SUSPECTED_SYMBOL;
                classNames += ' suspected ';
            }else if (cell.show){        
                classNames = ' show ';
                value = cell.value;           
            }else {
                value = EMPTY_SYMBOL;
                classNames = ' hide ';
            }

            var tdId = 'cell-' + i + '-' +j;
            strHtml +=  '<td id="'+ tdId +'" onclick="cellClicked(this)" ' +
                        'oncontextmenu="cellMarked(this)" '+
                         'class=" ' + classNames + '">' + value +  '</td>\n';
        });
        strHtml += '</tr>\n';
    });

    var elMat = document.querySelector(elSelector);
    elMat.innerHTML = strHtml;
}    


// left mouse key click
function cellClicked(elCell){
 
    timerHandler(false);
    var coord = getCellCoord(elCell.id);
    var value = gBoard[coord.i][coord.j].value;
    
    if ((value>0)&&(value<9)){
        // show the number
        gBoard[coord.i][coord.j].show = true;
        // console.log('click on ngr. show ngr');        
    } else if (value === MINE_SYMBOL) {
            gBoard[coord.i][coord.j].show = true;
            // console.log('click on mine. game over');
            checkGameOver(true) ;
    } else if (value === EMPTY_SYMBOL){
        // console.log('click on empty. check ngr'); 
        expandShown(gBoard, coord.i, coord.j);
    }
  
    // console.log('gBoard',gBoard);         
    renderBoard(gBoard, '.gameBoard');
}


// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var coord = {i: 0, j : 0};
    coord.i = +strCellId.substring(5,strCellId.lastIndexOf('-'));
    coord.j = +strCellId.substring(strCellId.lastIndexOf('-')+1);
    return coord;
}

// mark/unmark cell as suspected right mouse key
function cellMarked(elCell) {
//    console.log('left click elCell.id: ', elCell.id);

    timerHandler(false);

    //    var piece = elCell.innerText;
    var coord = getCellCoord(elCell.id);

    // toggle suspected?
    if (gBoard[coord.i][coord.j].suspected){ 
        gBoard[coord.i][coord.j].suspected = false;
        elCell.classList.remove('suspected'); 
        gMinesLeft++;
    } else {
        // not toggle, new suspected cell.
        gBoard[coord.i][coord.j].suspected = true;
        elCell.classList.add('suspected');
        gMinesLeft--;
        if (gBoard[coord.i][coord.j].value===MINE_SYMBOL)
            checkGameOver(false) ;        
    } 
    renderBoard(gBoard, '.gameBoard');
    updateMinesLeft();     
    // console.log('left click elCell.id: ', elCell.id);
}


function checkGameOver(forceOut) {

    var trueSuspectedNum = 0;

    if (forceOut) {
        timerHandler(true);
        // left mouse click on mine
        // console.log('game over!!: you lost');
        updateUserMsg('game over!!: you lost');
        showAllCells(gBoard);
        renderBoard(gBoard, '.gameBoard');
        return true;
    } else {
        if (gMinesLeft === 0) {
            // scan the board and count number of true suspected cells
            gBoard.forEach(function (cells, i) {
                cells.forEach(function (cell, j) {
                    if ((cell.suspected === true) && (cell.value === MINE_SYMBOL)) {
                        trueSuspectedNum++;
                    }
                });
            });

            // if equal to number of mines, user win!
            if (trueSuspectedNum === gLevel.MINES){
                timerHandler(true);
                // console.log('game over!!: you win!!');
                updateUserMsg('game over!!: you win!!');

                showAllCells(gBoard);
                renderBoard(gBoard, '.gameBoard');
                return true;                
            }
        }
        return false;      
    }
}


function showAllCells(board){
   board.forEach(function (cells, i) {
        cells.forEach(function (cell, j){
           board[i][j].show = true;
        });
    });    
}


function expandShown(board, cellI, cellJ){

    if (board[cellI][cellJ].show ||
        board[cellI][cellJ].suspected)  return;
    
    board[cellI][cellJ].show = true;
    // loop over 1-cell distance
    for ( var i =cellI-1; i <= cellI+1; i++ ) {
        for (var j =cellJ-1; j <= cellJ+1; j++) {        
            if ( i === cellI && j === cellJ ) continue;
            if ( i < 0 || i > board.length-1) continue;
            if ( j < 0 || j > board[0].length-1) continue;
            //  console.log("expandShown: ", i, j);

            if (board[i][j].value !== MINE_SYMBOL) {
 //              console.log("show : ",board[i][j], i, j);
               if ((board[i][j].value > 0) && (board[i][j].value <= 9)){
                   board[i][j].show = true;
               } else if (( board[i][j].value === EMPTY_SYMBOL ) &&
                            board[i][j].suspected===false ){
                        expandShown(board, i, j);
                        board[i][j].show = true;
                }
            }
        }
    }

   renderBoard(gBoard, '.gameBoard');
}    


function updateTime() {
//    var elSpanTimer = document.getElementById('spanTimer');
    var elSpanTimer = document.querySelector('#spanTimer');
    elSpanTimer.innerText = gTimePassed ;
}


function timerHandler(stop) {

    // If this is the first click 
    console.log('timerHandler:',gSecsInterval);
    
    if (!gSecsInterval) {
        gSecsInterval = setInterval(function () {
            gTimePassed++;
            updateTime();
        }, 1000)
    }

    if (stop) {
        clearInterval(gSecsInterval);        
    }
}

function updateMinesLeft() {
    var elSpanNextNum = document.querySelector('#spanNextNum');
    elSpanNextNum.innerText = gMinesLeft;
}

function updateUserMsg (msg){
    document.querySelector('.userMsg').innerText = msg;
}
