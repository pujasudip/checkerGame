$(document).ready(startStatModal);

function startStatModal(){
    hideStatModal();
}

function hideStatModal(){
    $('.statsModalShowBtn').click(function(){
        $('.statsModalContainer').css('display', 'block');
    });
    $('.statsModalHideBtn').click(function(){
        $('.statsModalContainer').css('display', 'none');
    });
}