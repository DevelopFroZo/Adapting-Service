function initHeaderInfo() {
    $("#more-user-info").on("click", function () {
        $(".header-user-more-block").css({
            visibility: "visible",
            opacity: 1
        })
        $(".header-user-more-button").css("transform", "rotate(180deg)");
    })

    $(document).mouseup(function (e) { // событие клика по веб-документу
        var div = $(".header-user-more-block"); // тут указываем ID элемента
        if (!div.is(e.target) // если клик был не по нашему блоку
            && div.has(e.target).length === 0) { // и не по его дочерним элементам
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
    }
}