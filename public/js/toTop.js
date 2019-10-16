function initUp(body) {
    $(body).on("scroll", function () {
        if ($(this).scrollTop() > $(window).height() / 3)
            $("#up").addClass("visible")
        else
            $("#up").removeClass("visible")
    })

    $("#up").on("click", function () {
        if (body == window) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        else
            $(body).animate({
                scrollTop: 0
            }, 300)
    })
}