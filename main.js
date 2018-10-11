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
    game.updateFromLocalStorage();
    $(window).on('load',function(){
        $('#rulesModal').css('display', 'block');
    });

    $('.newGame').on('click', function(){
        $('.gameAction').empty();
        $('#choosePlayer').modal('show');
        $('.player1Modal').click(function () {
            game.currentPlayer = 0;
            game.startUp();
        });
        $('.player2Modal').click(function () {
            game.currentPlayer = 1;
            game.startUp();
        });
    });
    $('.resetGame').click(()=>{
        game.resetGame();
    });

    $('#passTurn').click(()=>{
        game.passTurn();
    });

    var winModal = $('#wM');
    var startBtn = $('#startBtn');

    startBtn.click(function(){
        winModal.css('display', 'none');
        game.startNewGame();
    });

    $('#sendMessage').click(game.sendMessage);

    game.rulesModal();
    game.sendMessage();
    game.setMenuActive();
    $('#home').addClass('menuOnFocus');
}

class CheckerGame{
    constructor(){
        //player is from the matrix 1&10 - player 1 and 2&20 is player 2
        this.player = '';
        this.boardRowIndex = '';
        this.boardColIndex = '';
        this.selectPiece = this.selectPiece.bind(this);
        this.origin = [];
        this.deceasedPlayer1Count = 0;
        this.deceasedPlayer2Count = 0;
        this.currentPlayer = 1;
        this.playerChips = ['blackPiece', 'whitePiece'];
        this.wWon = 0;
        this.wLost = 0;
        this.bWon = 0;
        this.bLost = 0;
        this.totalPlayed = 0;
        this.justMovedTo = [];
        this.justCapturedOneOrMore = false;
    }

    startUp(){
        this.buildGameBoard();
        this.populateChips();
        this.applyClickHandlers();
        this.updateFromLocalStorage();
    }
    passTurn(){
        this.currentPlayer = 1 - this.currentPlayer;
        $('.rowOfPieces div').removeClass('highlightPiece');
        $('.rowOfPieces div').removeClass('selectedToMove');

        if(this.currentPlayer === 0){
            $('.player1Active').addClass('playerSelected');
            $('.player2Active').removeClass('playerSelected');
        } else{
            $('.player2Active').addClass('playerSelected');
            $('.player1Active').removeClass('playerSelected');
        }
    }

    updateFromLocalStorage(){
        if(localStorage.stats){
            var stats = JSON.parse(localStorage.stats);
            this.wWon = stats.wWon;
            this.wLost = stats.wLost;
            this.bWon = stats.bWon;
            this.bLost = stats.bLost;
        }

        let wRatio = 0;

        $('.wWon').text(this.wWon);
        $('.bLost').text(this.bLost);
        $('.wTotalPlayed').text(this.wWon + this.wLost);

        if(this.wWon === 0 && this.wLost === 0){
            wRatio = '0.00';
        } else if(this.wWon !== 0 && this.wLost === 0){
            wRatio = '100.00';
        } else {
            wRatio = ((this.wWon / (this.wWon + this.wLost)) * 100).toFixed(2);
        }
        $('.wRatio').text(wRatio);

        $('.bWon').text(this.bWon);
        $('.wLost').text(this.wLost);
        $('.bTotalPlayed').text(this.bWon + this.bLost);

        let bRatio = 0;

        if(this.bWon === 0 && this.bLost === 0){
            bRatio = '0.00%';
        } else if(this.bWon !== 0 && this.bLost === 0){
            bRatio = '100.00%';
        } else {
            bRatio = ((this.bWon / (this.bWon + this.bLost)) * 100).toFixed(2);
        }
        $('.bRatio').text(bRatio + '%');
    }

    resetGlobalVariables(){
        this.origin = [];
        this.boardRowIndex = '';
        this.boardColIndex = '';
        this.player = '';
    }

    startNewGame(currentPlayerArg){
        this.resetGlobalVariables();
        $('.killedPlayer1').empty();
        $('.killedPlayer2').empty();
        $('.gameAction').empty();
        board2DArray = [
            [0,1,0,1,0,1,0,1],
            [1,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [2,0,2,0,2,0,2,0],
            [0,2,0,2,0,2,0,2],
            [2,0,2,0,2,0,2,0]
        ];
        this.deceasedPlayer1Count = 0;
        this.deceasedPlayer2Count = 0;
        this.buildGameBoard();
        this.populateChips();
        this.applyClickHandlers();

        if(currentPlayerArg){
            this.currentPlayer = currentPlayerArg;
        } else {
            $('#choosePlayer').modal('show');
            $('.player1Modal').click(() => {
                this.currentPlayer = 0;
            });
            $('.player2Modal').click(() => {
                this.currentPlayer = 1;
            });
        }
    }

    resetGame(){
        if($('.gameAction').find('Button').length === 1){
            return;
        }

        $('#resetGame').modal('show');
        $('#resetCancel').click(function(){
            $('#resetGame').modal('hide');
        });
        $('.player1Modal').click(() => {
            this.currentPlayer = 0;
            this.startNewGame(this.currentPlayer);
        });
        $('.player2Modal').click(() => {
            this.currentPlayer = 1;
            this.startNewGame(this.currentPlayer);
        });
    }

    buildGameBoard(){
        var squareColorClassArray = ['light', 'dark'];
        var colorIndex = 0;
        for(var arrayIndexOuter = 0; arrayIndexOuter < board2DArray.length; arrayIndexOuter++){
            var outerDiv = $('<div>').addClass('rowOfPieces');
            for(var arrayIndexInner = 0; arrayIndexInner < board2DArray[arrayIndexOuter].length; arrayIndexInner++){
                var squareDiv = $('<div>').addClass('square ' + squareColorClassArray[colorIndex]);
                outerDiv.append(squareDiv);
                colorIndex = 1 - colorIndex;
            }
            $('.gameAction').append(outerDiv);
            colorIndex = 1 - colorIndex;
        }
        $('.newGame').css('display', 'none');
    }

    populateChips(){
        var rowsInGameBoard = $('.gameAction > .rowOfPieces');

        // var squares = $('.square');
        // $(squares).animate({
        //     width: '0px',
        //     height: '0px'
        // }, 1);

        // for(let i = 0; i < squares.length; i++){
        //     (function(){setTimeout(function(){
        //         $(squares[i]).animate({
        //             width: '12.5%',
        //             height: '100%'
        //         }, 10000);
        //     }, 10000)})(i);


        // }

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
        if(this.currentPlayer === 0){
            $('.player1Active').addClass('playerSelected');
            $('.player2Active').removeClass('playerSelected');
        } else{
            $('.player2Active').addClass('playerSelected');
            $('.player1Active').removeClass('playerSelected');
        }
    }

    applyClickHandlers(){
        // var blackTokenPlayers = $('.rowOfPieces > div:not(.whitePiece)');
        // var whiteTokenPlayers = $('.rowOfPieces > div:not(.blackPiece)');

        $(".rowOfPieces > div").click(this.selectPiece);

    }

    selectPiece(event){
        var killerMultiple = $('.killerMultiple');
        if(killerMultiple.length > 0){
            if(!$(event.target).hasClass('killerMultiple')){
                return;
            }
        }
        this.boardRowIndex = $(event.target).parent().index();
        this.boardColIndex = $(event.target).index();
        var clickedPlayer = board2DArray[this.boardRowIndex][this.boardColIndex];

        if(this.currentPlayer === 0 && clickedPlayer === 2){
            this.displayNotYourTurnMessage();
            return;
        } else if (this.currentPlayer === 1 && clickedPlayer === 1) {
            this.displayNotYourTurnMessage();
            return;
        } else if (this.currentPlayer === 0 && clickedPlayer === 20){
            this.displayNotYourTurnMessage();
            return;
        } else if(this.currentPlayer === 1 && clickedPlayer === 10){
            this.displayNotYourTurnMessage();
            return;
        }

        // this will remove selection if you clicked on empty box which is not intended to move and returns
        if(board2DArray[this.boardRowIndex][this.boardColIndex] === 0 && !$(event.target).hasClass('selectedToMove')){
            $('.rowOfPieces div').removeClass('highlightPiece');
            $('.rowOfPieces div').removeClass('selectedToMove');
            return;
        }

        if($(event.target).hasClass('selectedToMove')){
            if(board2DArray[this.boardRowIndex][this.boardColIndex] === 0){
                board2DArray[this.boardRowIndex][this.boardColIndex] = this.player;
                this.justMovedTo = [this.boardRowIndex, this.boardColIndex];
                board2DArray[this.origin[0]][this.origin[1]] = 0;
                if($(event.target).hasClass('killer') || $(event.target).hasClass('killerMultiple')){
                    var enemyKilled = this.enemyBeingKilled();
                    if(!this.isLocationOutOfBounds(enemyKilled)){
                        this.updateDeceasedPlayerCount(enemyKilled);
                        board2DArray[enemyKilled[0]][enemyKilled[1]] = 0;
                        this.justCapturedOneOrMore = true;
                    }
                    $('.rowOfPieces div').removeClass('killer');
                    $('.rowOfPieces div').removeClass('killerMultiple');
                }
                if($(event.target).parent().index() === 0 && this.player === 2){
                    board2DArray[this.boardRowIndex][this.boardColIndex] = 20;
                    this.populateChips();
                }
                if($(event.target).parent().index() === 7 && this.player === 1){
                    board2DArray[this.boardRowIndex][this.boardColIndex] = 10;
                    this.populateChips();
                }
                $('.rowOfPieces div').removeClass('highlightPiece');
                $('.rowOfPieces div').removeClass('selectedToMove');

                if(this.justCapturedOneOrMore){
                    this.checkForMultipleJumps();
                    var killerMultiple = $('.killerMultiple');
                    if(killerMultiple.length > 0){
                        this.updateOrigin();
                        this.populateChips();
                        $('.rowOfPieces').eq(this.origin[0]).children().eq(this.origin[1]).addClass('highlightPiece');
                        return;
                    } else {
                        this.currentPlayer = 1 - this.currentPlayer;
                        this.justCapturedOneOrMore = false;
                    }

                } else {
                    this.currentPlayer = 1 - this.currentPlayer;
                    this.justCapturedOneOrMore = false;
                }

                this.populateChips();
                this.resetGlobalVariables();
                return;

                // let killer = $('.killer');
                // if(killer.length === 0){
                //     this.currentPlayer = 1 - this.currentPlayer;
                //     this.resetGlobalVariables();
                //     return;
                // }
            }
        }

        if(this.origin.length === 0){
            this.updateOrigin();
        }

        if(board2DArray[this.boardRowIndex][this.boardColIndex] !== 0){

            if($(event.target).hasClass('highlightPiece')){
                $('.rowOfPieces div').removeClass('highlightPiece');
                $('.rowOfPieces div').removeClass('selectedToMove');
                return;
            } else {
                $('.rowOfPieces div').removeClass('highlightPiece');
                $('.rowOfPieces div').removeClass('selectedToMove');
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

    checkForMultipleJumps(){
        if(this.justMovedTo.length !== 0){
            this.boardRowIndex = this.justMovedTo[0];
            this.boardColIndex = this.justMovedTo[1];

            if(this.player === 1){
                var downRight = [this.boardRowIndex + 1, this.boardColIndex + 1];
                var downRightNext = [this.boardRowIndex + 2, this.boardColIndex + 2];
                var downLeft = [this.boardRowIndex + 1, this.boardColIndex - 1];
                var downLeftNext = [this.boardRowIndex + 2, this.boardColIndex - 2];

                if(!this.isLocationOutOfBounds(downRight)){
                    if(board2DArray[downRight[0]][downRight[1]] === 2 || board2DArray[downRight[0]][downRight[1]] === 20){
                        if(!this.isLocationOutOfBounds(downRightNext)){
                            if(board2DArray[downRightNext[0]][downRightNext[1]] === 0){
                                $('.rowOfPieces').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }
                if(!this.isLocationOutOfBounds(downLeft)){
                    if(board2DArray[downLeft[0]][downLeft[1]] === 2 || board2DArray[downLeft[0]][downLeft[1]] === 20){
                        if(!this.isLocationOutOfBounds(downLeftNext)){
                            if(board2DArray[downLeftNext[0]][downLeftNext[1]] === 0){
                                $('.rowOfPieces').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killerMultiple');
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
                  if(board2DArray[upRight[0]][upRight[1]] === 1 || board2DArray[upRight[0]][upRight[1]] === 10){
                        if(!this.isLocationOutOfBounds(upRightNext)){
                            if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                                $('.rowOfPieces').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }

                if(!this.isLocationOutOfBounds(upLeft)){
                    if(board2DArray[upLeft[0]][upLeft[1]] === 1 || board2DArray[upLeft[0]][upLeft[1]] === 10){
                        if(!this.isLocationOutOfBounds(upLeftNext)){
                            if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                                $('.rowOfPieces').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }

            } else if (this.player === 10) {
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
                    if (board2DArray[downRight[0]][downRight[1]] === 2 || board2DArray[downRight[0]][downRight[1]] === 20) {
                        if(!this.isLocationOutOfBounds(downRightNext)){
                            if (board2DArray[downRightNext[0]][downRightNext[1]] === 0) {
                                $('.rowOfPieces').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }

                if(!this.isLocationOutOfBounds(downLeft)){
                    if (board2DArray[downLeft[0]][downLeft[1]] === 2 || board2DArray[downLeft[0]][downLeft[1]] === 20) {
                        if(!this.isLocationOutOfBounds(downLeftNext)){
                            if (board2DArray[downLeftNext[0]][downLeftNext[1]] === 0) {
                                $('.rowOfPieces').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }

                if(!this.isLocationOutOfBounds(upRight)){
                    if(board2DArray[upRight[0]][upRight[1]] === 2 || board2DArray[upRight[0]][upRight[1]] === 20){
                        if(!this.isLocationOutOfBounds(upRightNext)){
                            if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                                $('.rowOfPieces').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }

                if(!this.isLocationOutOfBounds(upLeft)){
                    if(board2DArray[upLeft[0]][upLeft[1]] === 2 || board2DArray[upLeft[0]][upLeft[1]] === 20){
                        if(!this.isLocationOutOfBounds(upLeftNext)){
                            if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                                $('.rowOfPieces').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killerMultiple');
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
                    if (board2DArray[downRight[0]][downRight[1]] === 1 || board2DArray[downRight[0]][downRight[1]] === 10) {
                        if(!this.isLocationOutOfBounds(downRightNext)){
                            if (board2DArray[downRightNext[0]][downRightNext[1]] === 0) {
                                $('.rowOfPieces').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }

                if(!this.isLocationOutOfBounds(downLeft)){
                    if (board2DArray[downLeft[0]][downLeft[1]] === 1 || board2DArray[downLeft[0]][downLeft[1]] === 10) {
                        if(!this.isLocationOutOfBounds(downLeftNext)){
                            if (board2DArray[downLeftNext[0]][downLeftNext[1]] === 0) {
                                $('.rowOfPieces').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }

                if(!this.isLocationOutOfBounds(upRight)){
                    if(board2DArray[upRight[0]][upRight[1]] === 1 || board2DArray[upRight[0]][upRight[1]] === 10){
                        if(!this.isLocationOutOfBounds(upRightNext)){
                            if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                                $('.rowOfPieces').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }

                if(!this.isLocationOutOfBounds(upLeft)){
                    if(board2DArray[upLeft[0]][upLeft[1]] === 1 || board2DArray[upLeft[0]][upLeft[1]] === 10){
                        if(!this.isLocationOutOfBounds(upLeftNext)){
                            if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                                $('.rowOfPieces').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killerMultiple');
                            }
                        }

                    }
                }
            }
        }

    }

    updateOrigin(){
        this.origin[0] = this.boardRowIndex;
        this.origin[1] = this.boardColIndex;
        this.player = board2DArray[this.boardRowIndex][this.boardColIndex];
    }

    updateDeceasedPlayerCount(enemyKilled){
        if( board2DArray[enemyKilled[0]][enemyKilled[1]] === 1 || board2DArray[enemyKilled[0]][enemyKilled[1]] === 10){
            this.deceasedPlayer1Count++;
            if(this.deceasedPlayer1Count === 12){
                $('.modalHeader').text("Player 2 is the winner");
                $('.winnerImg').addClass('whitePiece');
                $('.winModal').css('display', 'block');
                this.wWon++;
                this.bLost++;
                this.totalPlayed++;
                $('.wWon').text(this.wWon);
                $('.bLost').text(this.bLost);
                $('.wTotalPlayed').text(this.totalPlayed);
                $('.bTotalPlayed').text(this.totalPlayed);
                let ratio = ((this.wWon / (this.wWon + this.wLost)) * 100).toFixed(2);
                $('.wRatio').text(ratio);
                $('.bRatio').text((100 - ratio).toFixed(2));
                var stats = {
                    "wWon": this.wWon,
                    "wLost": this.wLost,
                    "bWon": this.bWon,
                    "bLost": this.bLost
                };
                localStorage.setItem('stats', JSON.stringify(stats));
            }
            let divEnemy = $('<div>').addClass('killedPlayer1Img blackPieceRemoved');
            $('.killedPlayer1').append(divEnemy);
        } else if(board2DArray[enemyKilled[0]][enemyKilled[1]] === 2 || board2DArray[enemyKilled[0]][enemyKilled[1]] === 20){
            this.deceasedPlayer2Count++;
            if(this.deceasedPlayer2Count === 12){
                $('.winnerImg').addClass('blackPiece');
                $('.modalHeader').text("Player 1 is the winner");
                $('.winModal').css('display', 'block');
                this.bWon++;
                this.wLost++;
                this.totalPlayed++;
                $('.bWon').text(this.bWon);
                $('.wLost').text(this.wLost);
                $('.bTotalPlayed').text(this.totalPlayed);
                $('.wTotalPlayed').text(this.totalPlayed);
                let ratio = ((this.bWon / (this.bWon + this.bLost)) * 100).toFixed(2);
                $('.bRatio').text(ratio);
                $('.wRatio').text((100 - ratio).toFixed(2));
                var stats = {
                    "wWon": this.wWon,
                    "wLost": this.wLost,
                    "bWon": this.bWon,
                    "bLost": this.bLost
                };
                localStorage.setItem('stats', JSON.stringify(stats));
            }
            let divEnemy = $('<div>').addClass('killedPlayer2Img whitePieceRemoved');
            $('.killedPlayer2').append(divEnemy);
        }
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
                    $('.rowOfPieces').eq(downRight[0]).children().eq(downRight[1]).addClass('selectedToMove');
                }  else if(board2DArray[downRight[0]][downRight[1]] === 1){
                    // do nothing
                } else if(board2DArray[downRight[0]][downRight[1]] === 2 || board2DArray[downRight[0]][downRight[1]] === 20){
                    if(!this.isLocationOutOfBounds(downRightNext)){
                        if(board2DArray[downRightNext[0]][downRightNext[1]] === 0){
                            $('.rowOfPieces').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(downLeft)){
                if(board2DArray[downLeft[0]][downLeft[1]] === 0){
                    $('.rowOfPieces').eq(downLeft[0]).children().eq(downLeft[1]).addClass('selectedToMove');
                } else if(board2DArray[downLeft[0]][downLeft[1]] === 1){
                    // do nothing
                } else if(board2DArray[downLeft[0]][downLeft[1]] === 2 || board2DArray[downLeft[0]][downLeft[1]] === 20){
                    if(!this.isLocationOutOfBounds(downLeftNext)){
                        if(board2DArray[downLeftNext[0]][downLeftNext[1]] === 0){
                            $('.rowOfPieces').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killer');
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
                    $('.rowOfPieces').eq(upRight[0]).children().eq(upRight[1]).addClass('selectedToMove');
                } else if(board2DArray[upRight[0]][upRight[1]] === 2){
                    // do nothing
                } else if(board2DArray[upRight[0]][upRight[1]] === 1 || board2DArray[upRight[0]][upRight[1]] === 10){
                    if(!this.isLocationOutOfBounds(upRightNext)){
                        if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                            $('.rowOfPieces').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upLeft)){
                if(board2DArray[upLeft[0]][upLeft[1]] === 0){
                    $('.rowOfPieces').eq(upLeft[0]).children().eq(upLeft[1]).addClass('selectedToMove');
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 2){
                    // do nothing
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 1 || board2DArray[upLeft[0]][upLeft[1]] === 10){
                    if(!this.isLocationOutOfBounds(upLeftNext)){
                        if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                            $('.rowOfPieces').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

        }
    }

    possibleMovesKing() {
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
                    $('.rowOfPieces').eq(downRight[0]).children().eq(downRight[1]).addClass('selectedToMove');
                } else if (board2DArray[downRight[0]][downRight[1]] === 1) {
                    // do nothing
                } else if (board2DArray[downRight[0]][downRight[1]] === 2 || board2DArray[downRight[0]][downRight[1]] === 20) {
                    if(!this.isLocationOutOfBounds(downRightNext)){
                        if (board2DArray[downRightNext[0]][downRightNext[1]] === 0) {
                            $('.rowOfPieces').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(downLeft)){
                if (board2DArray[downLeft[0]][downLeft[1]] === 0) {
                    $('.rowOfPieces').eq(downLeft[0]).children().eq(downLeft[1]).addClass('selectedToMove');
                } else if (board2DArray[downLeft[0]][downLeft[1]] === 1) {
                    // do nothing
                } else if (board2DArray[downLeft[0]][downLeft[1]] === 2 || board2DArray[downLeft[0]][downLeft[1]] === 20) {
                    if(!this.isLocationOutOfBounds(downLeftNext)){
                        if (board2DArray[downLeftNext[0]][downLeftNext[1]] === 0) {
                            $('.rowOfPieces').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upRight)){
                if(board2DArray[upRight[0]][upRight[1]] === 0){
                    $('.rowOfPieces').eq(upRight[0]).children().eq(upRight[1]).addClass('selectedToMove');
                } else if(board2DArray[upRight[0]][upRight[1]] === 1){
                    // do nothing
                } else if(board2DArray[upRight[0]][upRight[1]] === 2 || board2DArray[upRight[0]][upRight[1]] === 20){
                    if(!this.isLocationOutOfBounds(upRightNext)){
                        if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                            $('.rowOfPieces').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upLeft)){
                if(board2DArray[upLeft[0]][upLeft[1]] === 0){
                    $('.rowOfPieces').eq(upLeft[0]).children().eq(upLeft[1]).addClass('selectedToMove');
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 1){
                    // do nothing
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 2 || board2DArray[upLeft[0]][upLeft[1]] === 20){
                    if(!this.isLocationOutOfBounds(upLeftNext)){
                        if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                            $('.rowOfPieces').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killer');
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
                    $('.rowOfPieces').eq(downRight[0]).children().eq(downRight[1]).addClass('selectedToMove');
                } else if (board2DArray[downRight[0]][downRight[1]] === 2) {
                    // do nothing
                } else if (board2DArray[downRight[0]][downRight[1]] === 1 || board2DArray[downRight[0]][downRight[1]] === 10) {
                    if(!this.isLocationOutOfBounds(downRightNext)){
                        if (board2DArray[downRightNext[0]][downRightNext[1]] === 0) {
                            $('.rowOfPieces').eq(downRightNext[0]).children().eq(downRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(downLeft)){
                if (board2DArray[downLeft[0]][downLeft[1]] === 0) {
                    $('.rowOfPieces').eq(downLeft[0]).children().eq(downLeft[1]).addClass('selectedToMove');
                } else if (board2DArray[downLeft[0]][downLeft[1]] === 2) {
                    // do nothing
                } else if (board2DArray[downLeft[0]][downLeft[1]] === 1 || board2DArray[downLeft[0]][downLeft[1]] === 10) {
                    if(!this.isLocationOutOfBounds(downLeftNext)){
                        if (board2DArray[downLeftNext[0]][downLeftNext[1]] === 0) {
                            $('.rowOfPieces').eq(downLeftNext[0]).children().eq(downLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upRight)){
                if(board2DArray[upRight[0]][upRight[1]] === 0){
                    $('.rowOfPieces').eq(upRight[0]).children().eq(upRight[1]).addClass('selectedToMove');
                } else if(board2DArray[upRight[0]][upRight[1]] === 2){
                    // do nothing
                } else if(board2DArray[upRight[0]][upRight[1]] === 1 || board2DArray[upRight[0]][upRight[1]] === 10){
                    if(!this.isLocationOutOfBounds(upRightNext)){
                        if(board2DArray[upRightNext[0]][upRightNext[1]] === 0){
                            $('.rowOfPieces').eq(upRightNext[0]).children().eq(upRightNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }

            if(!this.isLocationOutOfBounds(upLeft)){
                if(board2DArray[upLeft[0]][upLeft[1]] === 0){
                    $('.rowOfPieces').eq(upLeft[0]).children().eq(upLeft[1]).addClass('selectedToMove');
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 2){
                    // do nothing
                } else if(board2DArray[upLeft[0]][upLeft[1]] === 1 || board2DArray[upLeft[0]][upLeft[1]] === 10){
                    if(!this.isLocationOutOfBounds(upLeftNext)){
                        if(board2DArray[upLeftNext[0]][upLeftNext[1]] === 0){
                            $('.rowOfPieces').eq(upLeftNext[0]).children().eq(upLeftNext[1]).addClass('selectedToMove killer');
                        }
                    }

                }
            }
        }
    }

    displayNotYourTurnMessage(){
        var notYourTurn = document.getElementById('notYourTurnMessage');
        notYourTurn.style.display = 'block';
        setTimeout(function(){
            notYourTurn.style.display = 'none';
        }, 500);
    };

    //it receives movement location and returns if exists or not
    isLocationOutOfBounds(location){
        // location = [8, 1]; // this hard code is just for testing
        var isOutOfBound = false;
        location.forEach(function(ele){
            if(ele > 7 || ele < 0){
                isOutOfBound = true;
            } else if(ele % 1 !== 0){
                isOutOfBound = true;
            }
        });

        return isOutOfBound;
    }

    rulesModal(){
        var rulesNav = document.getElementById('rules');
        var closeBtn = document.getElementById('closeBtnRules');
        var cancelBtn = document.getElementById('rulesCancelBtn');
        var rulesModal = document.getElementById('rulesModal');
        closeBtn.addEventListener('click', function(){
            rulesModal.style.display = 'none';
            $('.navbar > ul > li').removeClass('menuOnFocus');
            $('#home').addClasss('menuOnFocus');
        });
        cancelBtn.addEventListener('click', function(){
            rulesModal.style.display = 'none';
            $('.navbar > ul > li').removeClass('menuOnFocus');
            $('#home').addClass('menuOnFocus');
        });
        rulesNav.addEventListener('click', function(){
            rulesModal.style.display = 'block';
        });
        rulesModal.addEventListener('click', function(event) {
            if(event.target.id == 'rulesModal'){
                rulesModal.style.display = 'none';
                $('.navbar > ul > li').removeClass('menuOnFocus');
                $('#home').addClass('menuOnFocus');
            }
        })

    }
    sendMessage(){
        var sendBtn = document.getElementById('sendMessage');
        var contactToast = document.getElementById('contactToastMessage');
        var contact = document.getElementById('contact');
        var formModal = document.getElementById('formModal');
        var name = document.getElementById('name');
        var email = document.getElementById('email');
        var message = document.getElementById('message');
        var hasError = false;

        name.addEventListener('blur', function () {
            if(name.value === ""){
                hasError = true;
                $('.nameError').text('Name cannot be empty.');
            }
        });
        name.addEventListener('keyup', function () {
            if(name.value.length > 0){
                hasError = false;
                $('.nameError').text('');
            }
        });

        email.addEventListener('blur', function () {
            if(email.value === ""){
                hasError = true;
                $('.emailError').text('No email was supplied.');
            }
        });
        message.addEventListener('keyup', function () {
            if(email.value.length > 0){
                hasError = false;
                $('.emailError').text('');
            }
        });

        message.addEventListener('blur', function () {
            if(message.value === ""){
                hasError = true;
                $('.messageError').text('You left no message.');
            }
        });
        message.addEventListener('keyup', function () {
            if(message.value.length > 0){
                hasError = false;
                $('.messageError').text('');
            }
        });

        contact.addEventListener('click', ()=>{
            formModal.style.display = 'block';
            $('.nameError').text('');
            $('.emailError').text('');
            $('.messageError').text('');
        });

        sendBtn.addEventListener('click', ()=>{
            if(document.getElementById('name').value.length === 0){
                hasError = true;
                $('.nameError').text('Name cannot be empty.');
            }
            if (document.getElementById('email').value.length === 0){
                hasError = true;
                $('.emailError').text('No email was supplied.');
            }
            if (document.getElementById('message').value.length === 0){
                hasError = true;
                $('.messageError').text('You left no message.');
            }

            if(!hasError){
                formModal.style.display = 'none';
                $('.navbar > ul > li').removeClass('menuOnFocus');
                $('#home').addClass('menuOnFocus');
                contactToast.style.display = 'block';
                setTimeout(function(){
                    contactToast.style.display = 'none';
                }, 1000);

                var data = $('#formData').serialize();
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('message').value = '';

                $.ajax({
                    data: data,
                    method: 'post',
                    url: 'contact.php',
                    success: function(){
                        console.log('success');
                    },
                    error: function(){
                        console.log('failed');
                    }
                });
            }
        });

        window.onclick = function(event){
            if(event.target == formModal){
                formModal.style.display = 'none';
                $('.navbar > ul > li').removeClass('menuOnFocus');
                $('#home').addClass('menuOnFocus');
            }
        }
    }
    setMenuActive(){
        $('.navbar > ul > li').on('click', function(){
            $('.navbar > ul > li').removeClass('menuOnFocus');
            $(this).addClass('menuOnFocus');
        });
    }
}