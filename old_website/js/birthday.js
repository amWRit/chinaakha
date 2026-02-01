
// Set the date we're counting down to
var birthday = "Aug 27";
var curr_year = new Date().getFullYear();

// use for testing 
//var curr_year = "2021";
var full_birthday = birthday + ", " + curr_year + " 00:00:00";
var endDate = new Date(full_birthday).getTime();

// Update the count down every 1 second
var x = setInterval(function() {
    // Get todays date and time
    var now = new Date().getTime();
    // Find the distance between now an the count down date
    var distance = endDate - now;
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    // Output the result in elements with id="cdHour/cdMin/cdSec"
    document.getElementById("daysNum").innerHTML = ("0" + days).slice(-3);  
	//document.getElementById("daysNum").innerHTML = ("0" + days).slice(1);
    document.getElementById("hoursNum").innerHTML = ("0" + hours).slice(-2);
    document.getElementById("minsNum").innerHTML = ("0" + minutes).slice(-2);
    document.getElementById("secsNum").innerHTML = ("0" + seconds).slice(-2);
    // If the count down is over, write some text 
    if (distance < 0) {
        clearInterval(x);
		document.getElementById("mata-text").style.display = 'block';
		document.getElementById("countdown").style.display = 'none'
		document.getElementById("be-ready").style.display ='none'
        //document.getElementById("container").innerHTML = "THE WAIT IS OVER";
		//document.getElementById("daysNum").innerHTML = ("00");  
		//document.getElementById("hoursNum").innerHTML = ("00");
		//document.getElementById("minsNum").innerHTML = ("00");
		//document.getElementById("secsNum").innerHTML = ("00");
    }
}, 1000);

// additional js
const element = document.getElementById("show-btn");
element.addEventListener("click", function() {
	document.getElementById("countdown").style.display = "block";
});