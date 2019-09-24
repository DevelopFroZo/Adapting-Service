$(document).ready(() => {

    if (getTest()["questions"].length === 0) addTestBlock(false);
    else createTest();

    initTestInfo();
    initSide();

    // $("#save-test").on("click", saveClick);
})

function initTestInfo() {
    let block = $(".test-info-block");
    let fullTestBlock = $(".test-info");
    let testNameInputBlock = $(".test-name-input-block");
    let testDescriptionTextareaBlock = $(".test-description-textarea-block");
    let readyTestNameBlock = $(".ready-test-name");
    let readyTestDescriptionBlock = $(".ready-test-description");

    let fullTestButton = $("#full-test-info-button");
    let closeFullTestButton = $("#close-test-info");
    let changeTestNameButton = $("#change-test-name-button");
    let changeTestDescriptionButton = $("#change-test-description-button");
    let saveTextInfoButton = $("#test-info-save");

    let testName = $(".test-name");
    let testDescription = $(".test-description");

    let testNameInput = $(".test-name-input");
    let testDescriptionTextarea = $(".test-description-textarea");

    let readyHeight = readyTestNameBlock.height() + 40;

    block.css("height", readyHeight)

    if (getTest()["test"]["name"] === "" && getTest()["test"]["description"] === "") {
        testNameInputBlock.show();
        testDescriptionTextareaBlock.show();
        fullTestBlock.show();
        readyTestNameBlock.hide();
        readyTestDescriptionBlock.hide();
        readyTestBlock.hide();
        saveTextInfoButton.css("visibility", "visible");
    }
    else {
        testName.text(getTest()["test"]["name"]);
        testDescription.text(getTest()["test"]["description"]);
        testNameInput.val(getTest()["test"]["name"]);
        testDescriptionTextarea.val(getTest()["test"]["description"]);
    }

    fullTestButton.on("click", function () {
        block.css({
            "height": fullTestBlock.height() + 85,
            "padding": "65px 0 20px 80px"
        });
        closeFullTestButton.css({
            "visibility": "visible",
            "opacity": "1",
        })
        $(".hide-pencil").addClass("pencil-hover");
        $(this).css({
            "opacity": "0",
            "visibility": "hidden"
        })
        $(".test-info-question").css({
            "left": block.width() - 70,
            "font-size": "325px"
        })
    })

    closeFullTestButton.on("click", function () {
        block.css({
            "height": readyHeight,
            "padding": "20px 40px"
        });
        closeFullTestButton.css({
            "visibility": "hidden",
            "opacity": "0"
        })
        $(".test-info-question").css({
            "left": "25px",
            "font-size": "80px"
        })
        fullTestButton.css({
            "visibility": "visible",
            "opacity": "0.3"
        })
        $(".hide-pencil").removeClass("pencil-hover");
    })

    changeTestNameButton.on("click", function () {
        testNameInputBlock.show();
        setTimeout(() => {
            testNameInputBlock.css({
                "opacity": "1",
                "transition": "0.3s"
            });
        }, 1)

        readyTestNameBlock.css({
            "position": "absolute",
            "visibility": "hidden",
            "opacity": "0"
        })
        block.css("height", fullTestBlock.height() + 85)
        saveTextInfoButton.css({
            "visibility": "visible",
            "opacity": "1"
        });
        closeFullTestButton.css({
            "visibility": "hidden",
            "opacity": "0",
        })
    })

    changeTestDescriptionButton.on("click", function () {
        testDescriptionTextareaBlock.show();
        setTimeout(() => {
            testDescriptionTextareaBlock.css({
                "opacity": "1",
                "transition": "0.3s"
            });
        }, 1)

        readyTestDescriptionBlock.css({
            "position": "absolute",
            "visibility": "hidden",
            "opacity": "0"
        });
        block.css("height", fullTestBlock.height() + 85)
        saveTextInfoButton.css({
            "visibility": "visible",
            "opacity": "1"
        });
        closeFullTestButton.css({
            "visibility": "hidden",
            "opacity": "0",
        })
    })

    saveTextInfoButton.on("click", function () {
        if (testNameInputBlock.is(":visible")) {
            readyTestNameBlock.css({
                "visibility": "visible",
                "opacity": "1",
                "position": "static"
            });
            testNameInputBlock.css({
                "position": "absolute",
                "opacity": "0",
                "top": "0"
            });
            setTimeout(() => {
                testNameInputBlock.hide().css("position", "static")
            }, 800)

            testName.text(testNameInput.val());
        }
        if (testDescriptionTextareaBlock.is(":visible")) {
            testDescriptionTextareaBlock.css({
                "position": "absolute",
                "opacity": "0",
                "top": "0"
            });
            readyTestDescriptionBlock.css({
                "visibility": "visible",
                "opacity": "1",
                "position": "static"
            });
            setTimeout(() => {
                testDescriptionTextareaBlock.hide().css("position", "static")
            }, 800)
            testDescription.text(testDescriptionTextarea.val());
        }
        saveTextInfoButton.css({
            "visibility": "hidden",
            "opacity": "0"
        });
        closeFullTestButton.css({
            "visibility": "visible",
            "opacity": "1",
        })
        block.css("height", fullTestBlock.height() + 85)
    })

}

function addTestBlock(isReady) {

    //Adding test block in variable
    let fullBlock = $("<div/>").addClass("full-test-block").append(
        $("#block-for-js").html()
    )

    let testBlock = fullBlock.children(".test-block");
    let readyBlock = fullBlock.children(".ready-block")

    $("#add-test-block").remove();

    let addTestButton = $("<div/>").attr("id", "add-test-block").html(
        "<button/>"
    );
    addTestButton.on("click", function () {

        animateAddBlock();
    });
    fullBlock.append(addTestButton);

    //Adding delete test button and create event for him
    if ($(".test-block").length > 1) {
        let closeButton = $("<button/>").addClass("delete-test-button");
        if (isReady)
            closeButton.text("Отмена")
        else
            closeButton.text("Удалить")
        closeButton.on("click", function () {
            if (isReady) {
                readyBlock.show();
                testBlock.hide();
                fullBlock.addClass("short-block");
                checkAddBlockDisabled();
            }
            else {
                animateDeleteBlock($(this));
            }
        })
        testBlock.append(closeButton);
    }
    else {
        readyBlock.find(".delete-test-block").remove();
        if (isReady) {
            let closeButton = $("<button/>").text("Отмена").addClass("delete-test-button");
            closeButton.on("click", function () {
                readyBlock.show();
                testBlock.hide();
                fullBlock.addClass("short-block");
                checkAddBlockDisabled();
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

        if (testBlock.find(".question-info").val() !== "" &&
            testBlock.find(".question-time").val() !== "" &&
            checkFull(testBlock)) {

            let question = {
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
        deleteAnswerButton = $("<button/>").addClass("delete-answer-button").text("×");
        answer.children(".left-option").append(deleteAnswerButton)
        deleteAnswerButton.on("click", function () {
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

    $(".question-time").on("keyup", function (e) {
        if ($(this).val() < 0) $(this).val(0)
        if ($(this).val() > 5) $(this).val(5)
    })

    if (isReady)
        fullBlock.addClass("short-block");

    readyBlock.hide();
    testBlock.show();

    checkAddBlockDisabled();
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

        let sideBlock = $("<li/>").text(blockInfo["description"]);
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
        readyBlock.parent().addClass("short-block");
        checkAddBlockDisabled();
        readyBlock.show();
        testBlock.hide();
    })

    editTestBlock.on("click", function () {

        readyBlock.parent().removeClass("short-block");
        checkAddBlockDisabled();

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

            testBlock.find(".option-block").remove();

            for (let j = 0; j < options.length; j++) {
                let answer = $("<div/>").addClass("option-block line-between").html(
                    $("#block-for-js").find(".option-block").html()
                )

                answer.find(".option-text").val(options[j]["description"])
                answer.find(".option-check").attr("checked", options[j]["isRight"]);

                addAnswerButton.before(answer);

                if (j > 1) {
                    let deleteAnswerButton = $("<button/>").addClass("delete-answer-button").text("×");
                    answer.children(".left-option").append(deleteAnswerButton)
                    deleteAnswerButton.off("click").on("click", function () {
                        $(this).closest(".option-block").remove();
                    })
                }

            }
        }

        activeTestType(blockInfo["type"], testBlock)

        testBlock.show();
        readyBlock.hide();
    })

    deleteTestBlock.on("click", function () {
        $(".side-tests-block li").eq(readyBlock.parent().index(".block-is-ready")).remove();
        animateDeleteBlock($(this));
    })

    if (readyBlock.parent().hasClass("block-is-ready")) {
        $(".side-tests-block li").eq(readyBlock.parent().index(".block-is-ready")).text(blockInfo["description"])
    }
    else {
        readyBlock.parent().addClass("block-is-ready");
        let sideBlock = $("<li/>").text(blockInfo["description"]);
        sideBlockList.eq(readyBlock.parent().index(".block-is-ready") - 1).after(sideBlock)
        sideBlock.on("click", function () {
            testsScroll(sideBlock);
        })
    }

    fullBlock = readyBlock.parent();

    fullBlock.children(".block-info").val(JSON.stringify(blockInfo));

    fullBlock.addClass("short-block")
    checkAddBlockDisabled()
}

function animateDeleteBlock(ths) {
    let parent = ths.closest(".full-test-block")
    parent.css({
        "opacity": "0",
        "margin-top": "0px",
        "padding": "0px",
        "height": parent.outerHeight(),
    })

    if (parent.index(".full-test-block") === $(".full-test-block").length - 1) {
        let second = $(".tests-block").scrollTop();
        let height = $(".full-test-block").eq($(".full-test-block").length - 2).outerHeight();
        let testsHeight = $(".tests-block").outerHeight()
        let top = $(".full-test-block").eq($(".full-test-block").length - 2).position().top + height;

        $('.tests-block').animate({ scrollTop: second - (testsHeight - top) + 20 }, 500);

        let helpButton = $("<div/>").addClass("help-add-test").html("<button/>");
        $(".full-test-block").eq($(".full-test-block").length - 2).append(helpButton);
        var opacity;
        if( checkAddBlockDisabled()[0] || checkAddBlockDisabled()[2] - checkAddBlockDisabled()[1] === 1) opacity = 1;
        else opacity = 0.5;
        helpButton.animate({ "opacity": opacity }, 250)
        setTimeout(() => {
            helpButton.remove();
        }, 500)
    }
    else {
        parent.css({
            "height": "0",
            "min-height": "0"
        })
        for (let i = parent.index(".full-test-block") + 1; i <= $(".full-test-block").length; i++) {
            let helpNumber = $("<div/>").addClass("help-number").text(i - 1);
            $(".full-test-block").eq(i).append(helpNumber);
            $(".full-test-block").eq(i).children(".help-number").css("opacity", "0.3");
            $(".full-test-block").eq(i).children(".number-of-test").css({
                "opacity": "0",
                "transition": "0.5s"
            });
        }
    }


    setTimeout(() => {
        parent.remove()
        deleteBlock(parent.index(".full-test-block"));
    }, 500)

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

function deleteBlock(index) {
    let addTestButton = $("<div/>").attr("id", "add-test-block").html(
        "<button/>"
    );
    for (let i = index + 1; i < $(".full-test-block").length; i++) {
        $(".full-test-block").eq(i).children(".number-of-test").text(i).css({
            "opacity": "0.3",
            "transition": "none"
        });
        $(".full-test-block").eq(i).children(".help-number").remove();
    }

    if ($("#add-test-block").length === 0) {
        addTestButton.off("click").on("click", function () {
            animateAddBlock()
            checkAddBlockDisabled();
        });
        $(".full-test-block").eq($(".full-test-block").length - 1).append(addTestButton);
    }
    checkAddBlockDisabled();
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

function animateAddBlock() {
    let second = $(".tests-block").scrollTop()
    addTestBlock(false);
    $(".tests-block").scrollTop(second)

    $(".full-test-block").eq($(".full-test-block").length - 1).css({
        "opacity": "0",
        "transition": "none",
    })

    setTimeout(() => {
        $(".full-test-block").eq($(".full-test-block").length - 1).css({
            "opacity": "1",
            "transition": "0.5s"
        })
    }, 1)


    let top = $(".full-test-block").eq($(".full-test-block").length - 1).position().top;
    second = $(".tests-block").scrollTop()
    $('.tests-block').animate({ scrollTop: second + top - $(".tests-block").height() + $(".full-test-block").eq($(".full-test-block").length - 1).height() + 60 }, 500);

    let helpButton = $("<div/>").addClass("help-add-test").html("<button/>");
    $(".full-test-block").eq($(".full-test-block").length - 2).append(helpButton)
    helpButton.css("opacity", "1")
    helpButton.animate({ "opacity": "0" }, 150)
    setTimeout(() => {
        helpButton.remove();
    }, 500)
}

function checkAddBlockDisabled() {
    let shortBlock = $(".short-block");
    let fullBlock = $(".full-test-block");
    console.log(shortBlock.length, fullBlock.length - 1)
    if (shortBlock.length < fullBlock.length - 1) {
        $("#add-test-block").children("button").attr("disabled", "disabled");
        return [false, shortBlock.length, fullBlock.length - 1];
    }
    else {
        $("#add-test-block").children("button").removeAttr("disabled");
        return [true, shortBlock.length, fullBlock.length - 1];
    }
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