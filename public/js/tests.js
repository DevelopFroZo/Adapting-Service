$(document).ready(() => {

    if ($(".test-block").length === 0) addTestBlock();

    $("#add-test-block").on("click", addTestBlock);
})

function addTestBlock() {

    //Adding test block in variable
    let block = $("<div/>").addClass("test-block").html(
        "<input type=\"text\" placeholder=\"Название вопроса\"><br>                             " +
        "<textarea placeholder=\"Описание вопроса\"></textarea>                                 " +
        "<div class=\"line\">                                                                   " +
        "    <button class = \"short-answer-button\">Короткий ответ</button>                    " +
        "    <button class = \"long-answer-button\">Длинный ответ</button>                      " +
        "    <button class = \"answer-options-button\">Варианты ответа</button>                 " +
        "</div>                                                                                 " +
        "<div class=\"short-answer-block\">                                                     " +
        "    <input type=\"text\" placeholder=\"Правильный ответ (не более 30 символов)\">      " +
        "</div>                                                                                 " +
        "<div class=\"long-answer-block\">                                                      " +
        "    <textarea placeholder=\"Правильный ответ. Проверяется пользователем\"></textarea>  " +
        "</div>                                                                                 " +
        "<div class=\"answer-options-block\">                                                   " +
        "    <div class=\"line-between\">                                                       " +
        "        <div>                                                                          " +
        "            <button class = \"delete-answer-button\">x</button>                        " +
        "            <input type=\"text\" placeholder=\"Вариант ответа\">                       " +
        "        </div>                                                                         " +
        "        <input type=\"checkbox\">                                                      " +
        "    </div>                                                                             " +
        "    <div class=\"line-between\">                                                       " +
        "        <div>                                                                          " +
        "            <button class = \"delete-answer-button\">x</button>                        " +
        "            <input type=\"text\" placeholder=\"Вариант ответа\">                       " +
        "        </div>                                                                         " +
        "        <input type=\"checkbox\">                                                      " +
        "    </div>                                                                             " +
        "    <button class = \"add-answer-button\">Добавить вариант</button>                    " +
        "</div>                                                                                 " +
        "<button class=\"change-type-test\">Сменить тип вопроса</button><br>                    " +
        "<input type = \"number\" placeholder = \"Время на ответ (мин.)\"/>                     "                       
    )
    
    //Adding delete test button and create event for him
    if($(".test-block").length !== 0){
        let closeButton = $("<button/>").text("x").addClass("delete-test-button");
        closeButton.on("click", function(){
            $(this).parent().remove();
        })
        block.append(closeButton);
    }

    //Adding test change buttons to a variable
    let shortAnswerButton = block.find(".short-answer-button");
    let longAnswerButton = block.find(".long-answer-button");
    let answerOptionsButton = block.find(".answer-options-button");

    //Add event to add question and delete
    let addAnswerButton = block.find(".add-answer-button");
    let deleteAnswerButton = block.find(".delete-answer-button");

    //Short answer block open event
    shortAnswerButton.on("click", function () {
        showAndHide(block, ".short-answer-block, .change-type-test", ".line, .long-answer-block, .answer-options-block")
    })

    //Block open event with a long response
    longAnswerButton.on("click", function () {
        showAndHide(block, ".long-answer-block, .change-type-test", ".line, .short-answer-block, .answer-options-block")
    })

    //Response block opening event
    answerOptionsButton.on("click", function () {
        showAndHide(block, ".answer-options-block, .change-type-test", ".line, .short-answer-block, .long-answer-block")
    })

    //Answer hiding event
    block.children(".change-type-test").on("click", function () {
        showAndHide(block, ".line", ".short-answer-block, .change-type-test, .long-answer-block, .answer-options-block")
    })

    //Delete answer option
    deleteAnswerButton.on("click", function () {
        $(this).closest(".line-between").remove();
    })

    //Event add response option
    addAnswerButton.on("click", function () {
        let answer = $("<div/>").addClass("line-between").html(
            "<div>                                                                          " +
            "    <button class = \"delete-answer-button\">x</button>                        " +
            "    <input type=\"text\" placeholder=\"Вариант ответа\">                       " +
            "</div>                                                                         " +
            "<input type=\"checkbox\">                                                      "
        )
        addAnswerButton.before(answer);
        deleteAnswerButton = block.find(".delete-answer-button");
        deleteAnswerButton.off("click").on("click", function () {
            $(this).closest(".line-between").remove();
        })
    })

    //Add block to end
    $(".center").before(block)
}

function showAndHide(block, shows, hides) {
    block.children(shows).show();
    block.children(hides).hide();
}