$.get("poems.txt", function(data) {    
	let lines = data.split("\n");
	
	let poems = data.split(/--/);
	poems = shuffleArray(poems);
	
	jQuery.each( poems, function( i, poem ) {

		poem = poem.trim()
		if (i < 3) {
			$('#output').append('<div class="blockquote"><h1>' + poem + '</h1></div>');
		} else {
			$('#output').append('<div class="blockquote hide-me"><h1>' + poem + '</h1></div>');
		}
	});
	
});

// https://stackoverflow.com/a/60785713
function showMore() {
    var hiddenPNodes = document.querySelectorAll('.hide-me');
    // Keep in mind this is an ES6 syntax so browser compatibility should be checked before using it.
    var first3 = Array.from(hiddenPNodes).slice(0, 3);
    first3.forEach(element => {
        element.classList.remove('hide-me');
    });
    // Assuming you want to hide the button when all elements are shown.
    if (hiddenPNodes.length <= 3) {
        hideShowMoreButton();
    }
}
function hideShowMoreButton() {
    document.getElementById('show-more').classList.add('hide-me');;
}

// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
	return array;
}