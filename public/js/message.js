function showMessage(type, text) {

    $("#text-message").text(text);
    $("#message").attr("class", type).css("transform", "translateX(0%)");

    let timeout = setTimeout(() => {
        hideMessage();
    }, 3000);

    $("#close-message").off("click").on("click", function(){
        hideMessage();
        clearTimeout(timeout);
    })

    function hideMessage(){
        $("#message").css("transform", "translateX(100%)");
    }

}