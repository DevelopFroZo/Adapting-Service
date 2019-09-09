(function() {
    function scrollHorizontally(e) {
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.getElementById('tests-block').scrollLeft -= (delta*80);
        e.preventDefault();
    }
    if (document.getElementById('tests-block').addEventListener) {
        // IE9, Chrome, Safari, Opera
        document.getElementById('tests-block').addEventListener("mousewheel", scrollHorizontally, false);
        // Firefox
        document.getElementById('tests-block').addEventListener("DOMMouseScroll", scrollHorizontally, false);
    } else {
        // IE 6/7/8
        document.getElementById('tests-block').attachEvent("onmousewheel", scrollHorizontally);
    }
})();