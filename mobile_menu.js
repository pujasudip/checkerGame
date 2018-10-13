$(document).ready(mobileMenu);

function mobileMenu(){
    $('.hamicon').click(function(){
        $('.hamMenuContainer').css('display', 'block');
    });

    $('.hamClose').click(function(){
        $('.hamMenuContainer').css('display', 'none');
    });

    $('.hamMenuContainer').click(function(e){
        if(e.target.className == 'hamMenuContainer'){
            $('.hamMenuContainer').css('display', 'none');
        }
    });
    $('#homeH').click(function(){
        $('.hamMenuContainer').css('display', 'none');
    });
    $('#rulesH').click(function(){
        $('.rulesModal').css('display', 'block');
        $('.hamMenuContainer').css('display', 'none');
    });
    $('#contactH').click(function(){
        $('.formModal').css('display', 'block');
        $('.hamMenuContainer').css('display', 'none');
    });
    $('#resetGameH').click(function(){
        game.resetGame();
        $('.hamMenuContainer').css('display', 'none');
    });
    $('#passTurnH').click(function(){
        game.passTurn();
        $('.hamMenuContainer').css('display', 'none');
    });
    $('#statsH').click(function(){
        $('.statsModalContainer').css('display', 'block');
        $('.hamMenuContainer').css('display', 'none');
    });
}