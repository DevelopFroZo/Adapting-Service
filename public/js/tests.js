$(document).ready(() => {

    if ($(".test-block").length === 0) addTestBlock();

    $("#add-test-block").on("click", addTestBlock);
    $("#save-test").on("click", saveClick);
})

function addTestBlock() {

    //Adding test block in variable
    let block = $("<div/>").addClass("test-block").html(
        "<input type=\"text\" placeholder=\"Название вопроса\" class = \"quastion-name\" name = \"quastion-name\"><br>                                      " +
        "<textarea placeholder=\"Описание вопроса\" class = \"quastion-info\" name = \"quastion-info\"></textarea>                                          " +
        "<div class=\"line\">                                                                                                                               " +
        "    <button class = \"short-answer-button\">Короткий ответ</button>                                                                                " +
        "    <button class = \"long-answer-button\">Длинный ответ</button>                                                                                  " +
        "    <button class = \"answer-options-button\">Варианты ответа</button>                                                                             " +
        "</div>                                                                                                                                             " +
        "<div class=\"short-answer-block\">                                                                                                                 " +
        "    <input type=\"text\" placeholder=\"Правильный ответ (не более 30 символов)\" class = \"short-answer\" name = \"short-answer\">                 " +
        "</div>                                                                                                                                             " +
        "<div class=\"long-answer-block\">                                                                                                                  " +
        "    <textarea placeholder=\"Правильный ответ. Проверяется пользователем\" class = \"long-answer\" name = \"long-answer\"></textarea>               " +
        "</div>                                                                                                                                             " +
        "<div class=\"answer-options-block\">                                                                                                               " +
        "    <div class=\"line-between\">                                                                                                                   " +
        "        <div>                                                                                                                                      " +
        "            <button class = \"delete-answer-button\">x</button>                                                                                    " +
        "            <input type=\"text\" placeholder=\"Вариант ответа\" class = \"option-text\" name = \"option-text\">                                    " +
        "        </div>                                                                                                                                     " +
        "        <input type=\"checkbox\" class = \"option-check\" name = \"option-check\">                                                                 " +
        "    </div>                                                                                                                                         " +
        "    <div class=\"line-between\">                                                                                                                   " +
        "        <div>                                                                                                                                      " +
        "            <button class = \"delete-answer-button\">x</button>                                                                                    " +
        "            <input type=\"text\" placeholder=\"Вариант ответа\" class = \"option-text\" name = \"option-text\">                                    " +
        "        </div>                                                                                                                                     " +
        "        <input type=\"checkbox\" class = \"option-check\" name = \"option-check\">                                                                 " +
        "    </div>                                                                                                                                         " +
        "    <button class = \"add-answer-button\">Добавить вариант</button>                                                                                " +
        "</div>                                                                                                                                             " +
        "<button class=\"change-type-test\">Сменить тип вопроса</button><br>                                                                                " +
        "<input type = \"number\" placeholder = \"Время на ответ (мин.)\" class = \"quastion-time\" name = \"quastion-time\"/>                              "
    )

    //Adding delete test button and create event for him
    if ($(".test-block").length !== 0) {
        let closeButton = $("<button/>").text("x").addClass("delete-test-button");
        closeButton.on("click", function () {
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
            "<div>                                                                                                                          " +
            "    <button class = \"delete-answer-button\">x</button>                                                                        " +
            "    <input type=\"text\" placeholder=\"Вариант ответа\" class = \"option-text\" name = \"option-text\">                        " +
            "</div>                                                                                                                         " +
            "<input type=\"checkbox\" class = \"option-check\" name = \"option-check\">                                                     "
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

function saveClick(){
    let testInfo = [];
    for(let i = 0; i < $(".test-block").length; i++){

        let block = $(".test-block").eq(i);
        let blockInfo = {
            quastionName: block.children(".quastion-name").val(),
            quastionInfo: block.children(".quastion-info").val(),
            quastionType: "",
            answer: "",
            time: ""
        }

        if(block.children(".short-answer-block").is(":visible")){
            blockInfo["quastionType"] = "shortText";
            blockInfo["answer"] = block.find(".short-answer").val();
        }
        else if(block.children(".long-answer-block").is(":visible")){
            blockInfo["quastionType"] = "longText";
            blockInfo["answer"] = block.find(".long-answer").val();
        }
        else if(block.children(".answer-options-block").is(":visible")){
            blockInfo["quastionType"] = "choiseOfAnswer";

            let answerOptions = [], option = block.find(".line-between"),
            optionText = option.find(".option-text"), optionCheck = option.find(".option-check");

            for(let j = 0; j < option.length; j++){
                let optionInfo = [];
                optionInfo.push([optionText.eq(j).val(),
                                 optionCheck.eq(j).prop("checked")]);
                answerOptions.push(optionInfo);
            }
            blockInfo["answer"] = answerOptions;

        }
        else console.log("error")
        blockInfo["time"] = block.find(".quastion-time").val();

        testInfo.push(blockInfo);
    }

    console.log(testInfo)
}

function showAndHide(block, shows, hides) {
    block.children(shows).show();
    block.children(hides).hide();
}