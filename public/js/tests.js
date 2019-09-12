$(document).ready(() => {

    if (getTest()["questions"].length === 0) addTestBlock(false);
    else createTest();

    initSide()

    // $("#save-test").on("click", saveClick);
})

function addTestBlock(isReady) {

    //Adding test block in variable
    let fullBlock = $("<div/>").addClass("full-test-block").append(
        $("#block-for-js").html()
    )

    let testBlock = fullBlock.children(".test-block");
    let readyBlock = fullBlock.children(".ready-block")

    $("#add-test-block").remove();

    let addTestButton = $("<button/>").attr("id", "add-test-block").text("+");
    addTestButton.on("click", function () {
        addTestBlock(false);
    });
    fullBlock.append(addTestButton);

    //Adding delete test button and create event for him
    if ($(".test-block").length > 1) {
        let closeButton = $("<button/>").text("×").addClass("delete-test-button");
        closeButton.on("click", function () {
            if (isReady) {
                readyBlock.show();
                testBlock.hide();
            }
            else {
                $(this).closest(".full-test-block").remove();
                deleteBlock();
            }
        })
        testBlock.append(closeButton);
    }
    else {
        readyBlock.find(".delete-test-block").remove();
        if (isReady) {
            let closeButton = $("<button/>").text("×").addClass("delete-test-button");
            closeButton.on("click", function () {
                readyBlock.show();
                testBlock.hide();
            })
            testBlock.append(closeButton);
        }
    }

    //Adding test change buttons to a variable
    let shortAnswerButton = testBlock.find(".short-answer-button");
    let longAnswerButton = testBlock.find(".long-answer-button");
    let answerOptionsButton = testBlock.find(".answer-options-button");

    //Add event to add question and delete
    let addAnswerButton = testBlock.find(".add-answer-button");
    let deleteAnswerButton = testBlock.find(".delete-answer-button");

    let saveTest = testBlock.find(".save-block-button");

    //Short answer block open event
    shortAnswerButton.on("click", function () {
        showAndHide(testBlock, ".short-answer-block, .time-block", ".long-answer-block, .answer-options-block");
        showActiveTestMode(shortAnswerButton, longAnswerButton, answerOptionsButton);
    })

    //Block open event with a long response
    longAnswerButton.on("click", function () {
        showAndHide(testBlock, ".long-answer-block, .time-block", ".short-answer-block, .answer-options-block");
        showActiveTestMode(longAnswerButton, shortAnswerButton, answerOptionsButton);
    })

    //Response block opening event
    answerOptionsButton.on("click", function () {
        showAndHide(testBlock, ".answer-options-block, .time-block", ".short-answer-block, .long-answer-block");
        showActiveTestMode(answerOptionsButton, longAnswerButton, shortAnswerButton);
    })

    //Delete answer option
    deleteAnswerButton.on("click", function () {
        $(this).closest(".option-block").remove();
    })

    saveTest.on("click", function () {

        if (testBlock.find(".question-name").val() !== "" &&
            testBlock.find(".question-info").val() !== "" &&
            testBlock.find(".question-time").val() !== "" &&
            checkFull(testBlock)) {

            let question = {
                name: testBlock.find(".question-name").val(),
                description: testBlock.find(".question-info").val(),
                type: checkTestType(testBlock),
                time: testBlock.find(".question-time").val(),
                possibleAnswers: []
            }

            setReadyBlock(question, readyBlock, testBlock);

            testBlock.hide();
            readyBlock.show();
        }
        else alert("Заполните все поля в блоке")
    })

    //Event add response option
    addAnswerButton.on("click", function () {
        let answer = $("<div/>").addClass("option-block line-between").html(
            $("#block-for-js").find(".option-block").html()
        )
        addAnswerButton.before(answer);
        deleteAnswerButton = testBlock.find(".delete-answer-button");
        deleteAnswerButton.off("click").on("click", function () {
            $(this).closest(".option-block").remove();
        })
    })

    //Block number assignment
    fullBlock.find(".number-of-test").text($(".test-block").length)

    //Add block to end
    $(".end-tests").before(fullBlock);

    $(".clear-button").click(function () {
        $(this).siblings().val("")
    })

    addTestButton.css("height", testBlock.height() + 40)

    $(".question-time").on("keyup", function (e) {
        if ($(this).val() < 0) $(this).val(0)
        if ($(this).val() > 5) $(this).val(5)
    })

    readyBlock.hide();
    testBlock.show();
}

function checkFull(block) {
    if (block.children(".short-answer-block").is(":visible")) {
        if (block.find(".short-answer").val() !== "")
            return true;
        else
            return false;
    }
    else if (block.children(".long-answer-block").is(":visible")) {
        if (block.find(".long-answer").val() !== "")
            return true;
        else
            return false;
    }
    else if (block.children(".answer-options-block").is(":visible")) {
        option = block.find(".option-text");
        for (let i = 0; i < option.length; i++) {
            if (option.eq(i).val() === "")
                return false;
        }
        return true;
    }
}

function checkTestType(block) {
    if (block.children(".short-answer-block").is(":visible"))
        return "short"
    else if (block.children(".long-answer-block").is(":visible"))
        return "long"
    else if (block.children(".answer-options-block").is(":visible"))
        return "variant"
}

// function saveClick() {
//     let testInfo = [];
//     for (let i = 1; i < $(".test-block").length; i++) {

//         let block = $(".test-block").eq(i);
//         let question = {
//             name: block.find(".question-name").val(),
//             description: block.find(".question-info").val(),
//             type: "",
//             time: "",
//             possibleAnswers: []
//         }

//         if (block.children(".short-answer-block").is(":visible")) {
//             question["type"] = "short";
//             question["possibleAnswers"].push({
//                 description: block.find(".short-answer").val(),
//                 isRight: true
//             });
//         }
//         else if (block.children(".long-answer-block").is(":visible")) {
//             question["type"] = "long";
//             question["possibleAnswers"].push({
//                 description: block.find(".long-answer").val(),
//                 isRight: true
//             });
//         }
//         else if (block.children(".answer-options-block").is(":visible")) {
//             question["type"] = "variant";

//             let option = block.find(".option-block"),
//                 optionText = option.find(".option-text"), optionCheck = option.find(".option-check");

//             for (let j = 0; j < option.length; j++)
//                 question["possibleAnswers"].push({
//                     description: optionText.eq(j).val(),
//                     isRight: optionCheck.eq(j).prop("checked")
//                 })

//         }
//         else console.log("error")
//         question["time"] = parseInt(block.find(".question-time").val());

//         testInfo.push(question);
//     }

//     let fullInfo = {
//         test: {
//             name: "Test",
//             description: "Description"
//         },
//         questions: testInfo
//     }

//     console.log(fullInfo)

//     return fullInfo;
// }

function createTest() {
    questions = getTest()["questions"];
    for (let i = 0, j = 1; i < questions.length; i++ , j++) {
        addTestBlock(true);

        let blockInfo = questions[i];

        let fullBlock = $(".full-test-block").eq(j);
        let readyBlock = fullBlock.children(".ready-block");
        let testBlock = fullBlock.children(".test-block");
        let sideBlockList = $(".side-tests-block");

        fullBlock.addClass("block-is-ready");

        setReadyBlock(blockInfo, readyBlock, testBlock);

        let sideBlock = $("<li/>").text(blockInfo["name"]);
        sideBlockList.append(sideBlock)
        sideBlock.on("click", function () {
            testsScroll(sideBlock);
        })

        testBlock.hide();
        readyBlock.show();

    }
}

function testsScroll(sideBlock) {
    let top = $(".block-is-ready").eq(sideBlock.index()).position().top;
    let second = $(".tests-block").scrollTop()
    console.log(top, second)
    $('.tests-block').stop().animate({ scrollTop: second + top - 70 }, 1000);
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

function setReadyBlock(blockInfo, readyBlock, testBlock) {

    let sideBlockList = $(".side-tests-block").children();

    let editTestBlock = readyBlock.find(".edit-test-block");
    let deleteTestBlock = readyBlock.find(".delete-test-block");

    readyBlock.children(".ready-name").text(blockInfo["name"]);
    readyBlock.children(".ready-description").text(blockInfo["description"]);
    readyBlock.find(".ready-time").text(blockInfo["time"]);

    readyBlock.children(".ready-list").empty();

    if (blockInfo["type"] === "short") {
        if (blockInfo["possibleAnswers"].length === 0)
            blockInfo["possibleAnswers"].push({
                description: testBlock.find(".short-answer").val(),
                isRight: true
            });
        let readyOption = $("<li/>").addClass(".ready-option");
        readyOption.text(blockInfo["possibleAnswers"][0]["description"]);
        readyBlock.children(".ready-list").append(readyOption);
    }
    else if (blockInfo["type"] === "long") {
        if (blockInfo["possibleAnswers"].length === 0)
            blockInfo["possibleAnswers"].push({
                description: testBlock.find(".long-answer").val(),
                isRight: true
            });
        let readyOption = $("<li/>").addClass(".ready-option");
        readyOption.text(blockInfo["possibleAnswers"][0]["description"]);
        readyBlock.children(".ready-list").append(readyOption);
    }
    else if (blockInfo["type"] === "variant") {

        let isFull = blockInfo["possibleAnswers"].length !== 0;
        let option, optionText, optionCheck;

        if (isFull) {
            option = blockInfo["possibleAnswers"];
            optionText = []
            optionCheck = [];

            for (let j = 0; j < option.length; j++) {
                optionText.push(option[j]["description"]);
                optionCheck.push(option[j]["isRight"])
            }
        }
        else {
            option = testBlock.find(".option-block"),
                optionText = option.find(".option-text"), optionCheck = option.find(".option-check");
        }

        for (let j = 0; j < option.length; j++) {
            if (!isFull)
                blockInfo["possibleAnswers"].push({
                    description: optionText.eq(j).val(),
                    isRight: optionCheck.eq(j).prop("checked")
                })
            let readyOption = $("<li/>").addClass(".ready-option");
            readyOption.text(blockInfo["possibleAnswers"][j]["description"]);
            if (blockInfo["possibleAnswers"][j]["isRight"] === false)
                readyOption.addClass("false-answer");
            readyBlock.children(".ready-list").append(readyOption);
        }
    }

    testBlock.children(".delete-test-button").off("click").on("click", function () {
        readyBlock.show();
        testBlock.hide();
    })

    editTestBlock.on("click", function () {

        testBlock.find(".question-name").val(blockInfo["name"])
        testBlock.find(".question-info").val(blockInfo["description"])
        testBlock.find(".question-time").val(blockInfo["time"])

        if (blockInfo["type"] === "short") {
            testBlock.find(".short-answer").val(blockInfo["possibleAnswers"][0]["description"]);
        }
        else if (blockInfo["type"] === "long") {
            testBlock.find(".long-answer").val(blockInfo["possibleAnswers"][0]["description"]);
        }
        else if (blockInfo["type"] === "variant") {
            let options = blockInfo["possibleAnswers"];

            let addAnswerButton = testBlock.find(".add-answer-button");
            let deleteAnswerButton = testBlock.find(".delete-answer-button");

            testBlock.find(".option-block").remove();

            for (let j = 0; j < options.length; j++) {
                let answer = $("<div/>").addClass("option-block line-between").html(
                    $("#block-for-js").find(".option-block").html()
                )

                answer.find(".option-text").val(options[j]["description"])
                answer.find(".option-check").attr("checked", options[j]["isRight"]);

                addAnswerButton.before(answer);
                deleteAnswerButton = testBlock.find(".delete-answer-button");
                deleteAnswerButton.off("click").on("click", function () {
                    $(this).closest(".option-block").remove();
                })
            }
        }

        activeTestType(blockInfo["type"], testBlock)

        testBlock.show();
        readyBlock.hide();
    })

    deleteTestBlock.on("click", function () {
        $(".side-tests-block li").eq(readyBlock.parent().index() - 1).remove();
        $(this).closest(".full-test-block").remove();
        deleteBlock();
    })

    if (readyBlock.parent().hasClass("block-is-ready")) {
        $(".side-tests-block li").eq(readyBlock.parent().index() - 1).text(blockInfo["name"])
    }
    else {
        readyBlock.parent().addClass("block-is-ready");
        let sideBlock = $("<li/>").text(blockInfo["name"]);
        sideBlockList.eq(readyBlock.parent().index(".block-is-ready") - 1).after(sideBlock)
        sideBlock.on("click", function () {
            testsScroll(sideBlock);
        })
    }



}

function initSide() {
    let openSideButton = $(".open-side-button");
    let closeSideButton = $(".close-side-button");

    openSideButton.on("click", function () {
        $(".body-block").css("width", "calc(100% - 275px)");
        $(".left-side-block").css("width", "275px");
        $(this).css({
            "opacity": "0",
            "visibility": "hidden",
        })
        $(".open-side-block").css({
            "visibility": "visible",
            "opacity": "1"
        })
    })

    closeSideButton.on("click", function () {
        $(".body-block").css("width", "calc(100% - 70px)");
        $(".left-side-block").css("width", "70px");
        $(".open-side-block").css({
            "visibility": "hidden",
            "opacity": "0"
        })
        $(".open-side-button").css({
            "opacity": "1",
            "visibility": "visible",
        })
    })

}

function deleteBlock() {
    let addTestButton = $("<button/>").attr("id", "add-test-block").text("+");
    for (let i = 1; i < $(".full-test-block").length; i++)
        $(".full-test-block").eq(i).children(".number-of-test").text(i);
    if ($("#add-test-block").length === 0) {
        addTestButton.off("click").on("click", function () {
            addTestBlock(false);
        });
        $(".full-test-block").eq($(".full-test-block").length - 1).append(addTestButton);
    }
}

function activeTestType(type, testBlock) {

    let shortAnswerButton = testBlock.find(".short-answer-button");
    let longAnswerButton = testBlock.find(".long-answer-button");
    let answerOptionsButton = testBlock.find(".answer-options-button");

    switch (type) {
        case "short":
            showAndHide(testBlock, ".short-answer-block, .time-block", ".long-answer-block, .answer-options-block");
            showActiveTestMode(shortAnswerButton, longAnswerButton, answerOptionsButton);
            break;
        case "long":
            showAndHide(testBlock, ".long-answer-block, .time-block", ".short-answer-block, .answer-options-block");
            showActiveTestMode(longAnswerButton, shortAnswerButton, answerOptionsButton);
            break;
        case "variant":
            showAndHide(testBlock, ".answer-options-block, .time-block", ".short-answer-block, .long-answer-block");
            showActiveTestMode(answerOptionsButton, longAnswerButton, shortAnswerButton);
            break;
    }
}