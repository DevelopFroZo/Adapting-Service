$(document).ready(() => {

    if ($(".test-block").length === 1) addTestBlock();

    // $("#save-test").on("click", saveClick);
})

function addTestBlock() {

    //Adding test block in variable
    let block = $("<div/>").addClass("test-block").html(
        $("#block-for-js").html()
    )

    $("#add-test-block").remove();

    let addTestButton = $("<button/>").attr("id", "add-test-block").text("+");
    addTestButton.on("click", function () {
        addTestBlock();
    });
    block.append(addTestButton);

    //Adding delete test button and create event for him
    if ($(".test-block").length > 1) {
        let closeButton = $("<button/>").text("×").addClass("delete-test-button");
        closeButton.on("click", function () {
            $(this).parent().remove();
            for (let i = 1; i < $(".test-block").length; i++)
                $(".test-block").eq(i).children(".number-of-test").text(i);
            if ($("#add-test-block").length === 0) {
                addTestButton.off("click").on("click", function () {
                    addTestBlock();
                });
                $(".test-block").eq($(".test-block").length - 1).append(addTestButton);
            }
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
        showAndHide(block, ".short-answer-block, .time-block", ".long-answer-block, .answer-options-block");
        showActiveTestMode(shortAnswerButton, longAnswerButton, answerOptionsButton);
    })

    //Block open event with a long response
    longAnswerButton.on("click", function () {
        showAndHide(block, ".long-answer-block, .time-block", ".short-answer-block, .answer-options-block");
        showActiveTestMode(longAnswerButton, shortAnswerButton, answerOptionsButton);
    })

    //Response block opening event
    answerOptionsButton.on("click", function () {
        showAndHide(block, ".answer-options-block, .time-block", ".short-answer-block, .long-answer-block");
        showActiveTestMode(answerOptionsButton, longAnswerButton, shortAnswerButton);
    })

    //Delete answer option
    deleteAnswerButton.on("click", function () {
        $(this).closest(".option-block").remove();
    })

    //Event add response option
    addAnswerButton.on("click", function () {
        let answer = $("<div/>").addClass("option-block line-between").html(

            $("#block-for-js").find(".option-block").html()
        )
        addAnswerButton.before(answer);
        deleteAnswerButton = block.find(".delete-answer-button");
        deleteAnswerButton.off("click").on("click", function () {
            $(this).closest(".option-block").remove();
        })
    })

    //Block number assignment
    block.find(".number-of-test").text($(".test-block").length)

    //Add block to end
    $(".end-tests").before(block);

    $(".clear-button").click(function () {
        $(this).siblings().val("")
    })

    addTestButton.css("height", block.height() + 40)

    $(".question-time").on("keyup", function (e) {
        if ($(this).val() < 0) $(this).val(0)
        if ($(this).val() > 5) $(this).val(5)
    })
}

function saveClick() {
    let testInfo = [];
    for (let i = 1; i < $(".test-block").length; i++) {

        let block = $(".test-block").eq(i);
        let question = {
            name: block.children(".question-name").val(),
            description: block.children(".question-info").val(),
            type: "",
            time: "",
            possibleAnswers: []
        }

        if (block.children(".short-answer-block").is(":visible")) {
            question["type"] = "short";
            question["possibleAnswers"].push({
                description: block.find(".short-answer").val(),
                isRight: true
            });
        }
        else if (block.children(".long-answer-block").is(":visible")) {
            question["type"] = "long";
            question["possibleAnswers"].push({
                description: block.find(".long-answer").val(),
                isRight: true
            });
        }
        else if (block.children(".answer-options-block").is(":visible")) {
            question["type"] = "variant";

            let option = block.find(".option-block"),
                optionText = option.find(".option-text"), optionCheck = option.find(".option-check");

            for (let j = 0; j < option.length; j++)
                question["possibleAnswers"].push({
                    description: optionText.eq(j).val(),
                    isRight: optionCheck.eq(j).prop("checked")
                })

        }
        else console.log("error")
        question["time"] = parseInt(block.find(".question-time").val());

        testInfo.push(question);
    }

    let fullInfo = {
        test: {
            name: "Test",
            description: "Description"
        },
        questions: testInfo
    }

    return fullInfo;
}

function showAndHide(block, shows, hides) {
    block.children(shows).show();
    block.children(hides).hide();
    block.children(".save-block-button").css("display", "block");
}

function showActiveTestMode(active, dontActive1, dontActive2) {
    active.addClass("test-button-active").siblings().css("opacity", "1");
    dontActive1.removeClass("test-button-active").siblings().css("opacity", "0");
    dontActive2.removeClass("test-button-active").siblings().css("opacity", "0");
}