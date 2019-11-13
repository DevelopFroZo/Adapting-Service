function initHeaderInfo() {
    $("#more-user-info").on("click", function () {
        $(".header-user-more-block").css({
            visibility: "visible",
            opacity: 1
        })
        $(".header-user-more-button").css("transform", "rotate(180deg)");
        $(this).css("pointer-events", "none")
    })

    $(document).mouseup(function (e) {
        var div = $(".header-user-more-block");
        if (!div.is(e.target)
            && div.has(e.target).length === 0) {
            hideMoreBlock();
        }
    });

    $(".header-user-more-block").on("click", function () {
        hideMoreBlock();
    })

    function hideMoreBlock() {
        $(".header-user-more-block").css({
            visibility: "hidden",
            opacity: "0"
        })
        $(".header-user-more-button").css("transform", "rotate(0deg)");
        $("#more-user-info").css("pointer-events", "auto")
    }
}