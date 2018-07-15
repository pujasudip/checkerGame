var game = null;

$(document).ready(initializeApp);

var board2DArray = [
    [0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [2,0,2,0,2,0,2,0],
    [0,2,0,2,0,2,0,2],
    [2,0,2,0,2,0,2,0]
];


function initializeApp(){
    game = new CheckerGame();
    game.startUp();
}

class CheckerGame{
    constructor(){
        this.player = '';
        this.boardRowIndex = '';
        this.boardColIndex = '';
        this.selectPiece = this.selectPiece.bind(this);
        this.origin = [];
        this.deceasedPlayer1Count = 0;
        this.deceasedPlayer2Count = 0;
    }

    startUp(){
        this.buildGameBoard();
        this.populateChips();
        this.applyClickHandlers();
    }

    resetGlobalVariables(){
        this.origin = [];
        this.boardRowIndex = '';
        this.boardColIndex = '';
        this.player = '';
    }

    switchPlayer(){

    }

    buildGameBoard(){
        var squareColorClassArray = ['light', 'dark'];
        var colorIndex = 0;
        for(var arrayIndexOuter = 0; arrayIndexOuter < board2DArray.length; arrayIndexOuter++){
            var outerDiv = $('<div>').addClass('row');
            for(var arrayIndexInner = 0; arrayIndexInner < board2DArray[arrayIndexOuter].length; arrayIndexInner++){
                var squareDiv = $('<div>').addClass('square ' + squareColorClassArray[colorIndex]);
                outerDiv.append(squareDiv);
                colorIndex = 1 - colorIndex;
            }
            $('.gameAction').append(outerDiv);
            colorIndex = 1 - colorIndex;
        }
    }

    populateChips(){
        var rowsInGameBoard = $('.gameAction > .row');
        for(var i = 0; i < board2DArray.length; i++){
            var row = rowsInGameBoard.eq(i);
            for(var j = 0; j < board2DArray[i].length; j++){
                if(board2DArray[i][j] === 1){
                    row.children().eq(j).addClass('blackPiece');
                }
                if(board2DArray[i][j] === 2){
                    row.children().eq(j).addClass('whitePiece');
                }
                if(board2DArray[i][j] === 0){
                    row.children().eq(j).removeClass('blackPiece whitePiece player1King player2King');
                }
                if(board2DArray[i][j] === 20){
                    row.children().eq(j).addClass('player2King');
                }
                if(board2DArray[i][j] === 10){
                    row.children().eq(j).addClass('player1King');
                }
            }
        }
    }

    applyClickHandlers(){
        $('div.gameAction > div *').on('click', this.selectPiece);
    }
    removeClickHandlers(){
        $('.gameAction *').off();
    }

    selectPiece(event){
        this.boardRowIndex = $(event.target).parent().index();
        this.boardColIndex = $(event.target).index();

        // this will remove selection if you clicked on empty box which is not intended to move and returns
        if(board2DArray[this.boardRowIndex][this.boardColIndex] === 0 && !$(event.target).hasClass('selectedToMove')){
            $('.row div').removeClass('highlightPiece');
            $('.row div').removeClass('selectedToMove');
            return;
        }

        if($(event.target).hasClass('selectedToMove')){
            if(board2DArray[this.boardRowIndex][this.boardColIndex] === 0){
                board2DArray[this.boardRowIndex][this.boardColIndex] = this.player;
                board2DArray[this.origin[0]][this.origin[1]] = 0;
                if($(event.target).hasClass('killer')){
                    var enemyKilled = this.enemyBeingKilled();
                    board2DArray[enemyKilled[0]][enemyKilled[1]] = 0;
                    $('.row div').removeClass('killer');
                }
                if($(event.target).parent().index() === 0 && this.player === 2){
                    board2DArray[this.boardRowIndex][this.boardColIndex] = 20;
                    this.populateChips();
                }
                if($(event.target).parent().index() === 7 && this.player === 1){
                    board2DArray[this.boardRowIndex][this.boardColIndex] = 10;
                    this.populateChips();
                }
                $('.row div').removeClass('highlightPiece');
                $('.row div').removeClass('selectedToMove');
                this.populateChips();
                this.resetGlobalVariables();
                this.switchPlayer();
                return;
            }
        }

        if(this.origin.length === 0){
            this.updateOrigin();
        }




        if(board2DArray[this.boardRowIndex][this.boardColIndex] !== 0){
            if($(event.target).hasClass('highlightPiece')){
                $('.row div').removeClass('highlightPiece');
                $('.row div').removeClass('selectedToMove');
            } else {
                $('.row div').removeClass('highlightPiece');
                $('.row div').removeClass('selectedToMove');
                $(event.target).addClass('highlightPiece');
                this.updateOrigin();
            }
        }

        if($(event.target).hasClass('player1King') || $(event.target).hasClass('player2King')){
            this.possibleMovesKing();
        } else {
            this.possibleMovesNormalPiece();
        }
    }

    updateOrigin(){
        this.origin[0] = this.boardRowIndex;
        this.origin[1] = this.boardColIndex;
        this.player = board2DArray[this.boardRowIndex][this.boardColIndex];
    }

    enemyBeingKilled(){
        // mid point formula
        var enemyKilled = [(this.boardRowIndex + this.origin[0])/2, (this.boardColIndex + this.origin[1])/2];
        return enemyKilled;
    }

    possibleMovesNormalPiece(){
        if(this.player === 1){
            var downRight = [this.boardRowIndex + 1, this.boardColIndex + 1];
            var downRightNext = [this.boardRowIndex + 2, this.boardColIndex + 2];
            var downLeft = [this.boardRowIndex + 1, this.boardColIndex - 1];
            var downLeftNext = [this.boardRowIndex + 2, this.boardColIndex - 2];

            if(!this.isLocationOutOfBounds(downRight)){
                if(board2DArray[downRight[0]][downRight[1]] === 0){
                    $('.row').eq(downRight[0]).children().eq(downRight[1]).addClass('selectedToMove');
                }  else if(board2DArray[downRight[0]][downRight[1]] === 1){
                    // do nothing
                } else if(board2DArray[downRight[0]][downRight[1]] === 2){
                    if(!this.isLocationOutOfBounds(downRightNext)){
                        if(board2DArray[downRightNext[0]][downRightNext[1]] === 0){
                            $('.row').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(downLeft)){
                if(board2DArray[downLeft[0]][downLeft[1]] === 0){
                    $('.row').eq(downLeft[0]).children().eq(downLeft[1]).addClass('selectedToMove');
                } else if(board2DArray[downLeft[0]][downLeft[1]] === 1){
                    // do nothing
                } else if(board2DArray[downLeft[0]][downLeft[1]] === 2){
                    if(!this.isLocationOutOfBounds(downLeftNext)){
                        if(board2DArray[downLeftNext[0]][downLeftNext[1]] === 0){
                            $('.row').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

        } else if(this.player === 2){
            var upRight = [this.boardRowIndex - 1, this.boardColIndex + 1];
            var upRightNext = [this.boardRowIndex - 2, this.boardColIndex + 2];
            var upLeft = [this.boardRowIndex - 1, this.boardColIndex - 1];
            var upLeftNext = [this.boardRowIndex - 2, this.boardColIndex - 2];

            if(!this.isLocationOutOfBounds(upRight)){
                if(board2DArray[upRight[0]][upRight[1]] === 0){
                    $('.row').eq(upRight[0]).children().eq(upRight[1]).addClass('selectedToMove');
                } else if(board2DArray[upRight[0]][upRight[1]] === 2){
                    // do nothing
                } else if(board2DArray[upRight[0]][upRight[1]] === 1){
                    if(!this.isLocationOutOfBounds(upRightNext)){
                        if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                            $('.row').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upLeft)){
                if(board2DArray[upLeft[0]][upLeft[1]] === 0){
                    $('.row').eq(upLeft[0]).children().eq(upLeft[1]).addClass('selectedToMove');
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 2){
                    // do nothing
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 1){
                    if(!this.isLocationOutOfBounds(upLeftNext)){
                        if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                            $('.row').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

        }
    }

    possibleMovesKing() {
        console.log('this is king');
        // 10 is king of player 1
        if (this.player === 10) {
            var downRight = [this.boardRowIndex + 1, this.boardColIndex + 1];
            var downRightNext = [this.boardRowIndex + 2, this.boardColIndex + 2];
            var downLeft = [this.boardRowIndex + 1, this.boardColIndex - 1];
            var downLeftNext = [this.boardRowIndex + 2, this.boardColIndex - 2];
            var upRight = [this.boardRowIndex - 1, this.boardColIndex + 1];
            var upRightNext = [this.boardRowIndex - 2, this.boardColIndex + 2];
            var upLeft = [this.boardRowIndex - 1, this.boardColIndex - 1];
            var upLeftNext = [this.boardRowIndex - 2, this.boardColIndex - 2];

            // console.log(this.isLocationOutOfBounds(downRight));

            if(!this.isLocationOutOfBounds(downRight)){
                if (board2DArray[downRight[0]][downRight[1]] === 0) {
                    $('.row').eq(downRight[0]).children().eq(downRight[1]).addClass('selectedToMove');
                } else if (board2DArray[downRight[0]][downRight[1]] === 1) {
                    // do nothing
                } else if (board2DArray[downRight[0]][downRight[1]] === 2 || board2DArray[downRight[0]][downRight[1]] === 20) {
                    if(!this.isLocationOutOfBounds(downRightNext)){
                        if (board2DArray[downRightNext[0]][downRightNext[1]] === 0) {
                            $('.row').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(downLeft)){
                if (board2DArray[downLeft[0]][downLeft[1]] === 0) {
                    $('.row').eq(downLeft[0]).children().eq(downLeft[1]).addClass('selectedToMove');
                } else if (board2DArray[downLeft[0]][downLeft[1]] === 1) {
                    // do nothing
                } else if (board2DArray[downLeft[0]][downLeft[1]] === 2 || board2DArray[downLeft[0]][downLeft[1]] === 20) {
                    if(!this.isLocationOutOfBounds(downLeftNext)){
                        if (board2DArray[downLeftNext[0]][downLeftNext[1]] === 0) {
                            $('.row').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upRight)){
                if(board2DArray[upRight[0]][upRight[1]] === 0){
                    $('.row').eq(upRight[0]).children().eq(upRight[1]).addClass('selectedToMove');
                } else if(board2DArray[upRight[0]][upRight[1]] === 1){
                    // do nothing
                } else if(board2DArray[upRight[0]][upRight[1]] === 2 || board2DArray[upRight[0]][upRight[1]] === 20){
                    if(!this.isLocationOutOfBounds(upRightNext)){
                        if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                            $('.row').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upLeft)){
                if(board2DArray[upLeft[0]][upLeft[1]] === 0){
                    $('.row').eq(upLeft[0]).children().eq(upLeft[1]).addClass('selectedToMove');
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 1){
                    // do nothing
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 2 || board2DArray[upLeft[0]][upLeft[1]] === 20){
                    if(!this.isLocationOutOfBounds(upLeftNext)){
                        if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                            $('.row').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }
        }

        // player 20 - king of player 2
        if (this.player === 20) {
            var downRight = [this.boardRowIndex + 1, this.boardColIndex + 1];
            var downRightNext = [this.boardRowIndex + 2, this.boardColIndex + 2];
            var downLeft = [this.boardRowIndex + 1, this.boardColIndex - 1];
            var downLeftNext = [this.boardRowIndex + 2, this.boardColIndex - 2];
            var upRight = [this.boardRowIndex - 1, this.boardColIndex + 1];
            var upRightNext = [this.boardRowIndex - 2, this.boardColIndex + 2];
            var upLeft = [this.boardRowIndex - 1, this.boardColIndex - 1];
            var upLeftNext = [this.boardRowIndex - 2, this.boardColIndex - 2];

            // console.log(this.isLocationOutOfBounds(downRight));

            if(!this.isLocationOutOfBounds(downRight)){
                if (board2DArray[downRight[0]][downRight[1]] === 0) {
                    $('.row').eq(downRight[0]).children().eq(downRight[1]).addClass('selectedToMove');
                } else if (board2DArray[downRight[0]][downRight[1]] === 2) {
                    // do nothing
                } else if (board2DArray[downRight[0]][downRight[1]] === 1 || board2DArray[downRight[0]][downRight[1]] === 10) {
                    if(!this.isLocationOutOfBounds(downRightNext)){
                        if (board2DArray[downRightNext[0]][downRightNext[1]] === 0) {
                            $('.row').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(downLeft)){
                if (board2DArray[downLeft[0]][downLeft[1]] === 0) {
                    $('.row').eq(downLeft[0]).children().eq(downLeft[1]).addClass('selectedToMove');
                } else if (board2DArray[downLeft[0]][downLeft[1]] === 2) {
                    // do nothing
                } else if (board2DArray[downLeft[0]][downLeft[1]] === 1 || board2DArray[downLeft[0]][downLeft[1]] === 10) {
                    if(!this.isLocationOutOfBounds(downLeftNext)){
                        if (board2DArray[downLeftNext[0]][downLeftNext[1]] === 0) {
                            $('.row').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upRight)){
                if(board2DArray[upRight[0]][upRight[1]] === 0){
                    $('.row').eq(upRight[0]).children().eq(upRight[1]).addClass('selectedToMove');
                } else if(board2DArray[upRight[0]][upRight[1]] === 2){
                    // do nothing
                } else if(board2DArray[upRight[0]][upRight[1]] === 1 || board2DArray[upRight[0]][upRight[1]] === 10){
                    if(!this.isLocationOutOfBounds(upRightNext)){
                        if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                            $('.row').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upLeft)){
                if(board2DArray[upLeft[0]][upLeft[1]] === 0){
                    $('.row').eq(upLeft[0]).children().eq(upLeft[1]).addClass('selectedToMove');
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 2){
                    // do nothing
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 1 || board2DArray[upLeft[0]][upLeft[1]] === 10){
                    if(!this.isLocationOutOfBounds(upLeftNext)){
                        if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                            $('.row').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }
        }
    }

    //it receives movement location and returns if exists or not
    isLocationOutOfBounds(location){
        // location = [8, 1]; // this hard code is just for testing
        var isOutOfBound = false;

        location.forEach(function(ele){
            if(ele > 7 || ele < 0){
                isOutOfBound = true;
            }
        });

        return isOutOfBound;
    }
}