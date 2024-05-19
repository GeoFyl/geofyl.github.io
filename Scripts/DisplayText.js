function HomeReady() {
    var text = 'George Fyles Portfolio.... ';
    type(text);
    
}
function PageReady() {
    setInterval('cursorAnimation()', 700);
} 

function type(text, new_caption_length) {
    captionLength = new_caption_length || 0;

    $('#PageTitle').html(text.substr(0, captionLength++));
    if (captionLength < text.length + 1) {
        setTimeout(function () {
            type(text, captionLength);
        }, 80);
    }
    else { setInterval('cursorAnimation()', 700); }
}

function cursorAnimation() {
    $('#cursor').animate({
        opacity: 0
    }, 'fast', 'swing').animate({
        opacity: 1
    }, 'fast', 'swing');
}