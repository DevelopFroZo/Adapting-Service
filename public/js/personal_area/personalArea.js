let userBlock, signTestBlock, questionBlock;
let passedAndCheckedTests, workers;

$(document).ready(async function () {
    signTestBlock = $(".subscribe-deleteble").html();

    await initCompanyInfo();
    await initTests();
    initExit();
    await initPassedOrCheckedTests();
    await initUsers();
    initSubscribeBlock();
    initAnchors();
    initUp(window);
    initURL();
    initHeaderInfo();
    initClear();
    initCloseWindow();

    $(".subscribe-deleteble").remove();

    setTimeout(() => $(".preloader").css({
        opacity: 0,
        visibility: "hidden"
    }), 500)

    $(document).mouseup(function (e) {
        var userButtons = $(".user-buttons-block");
        var miniWindow = $(".mini-window");

        if (!userButtons.is(e.target) && userButtons.has(e.target).length === 0) {
            userButtons.css({
                visibility: "hidden",
                opacity: "0"
            });
            $(".user-active").removeClass("user-active");
            $(".user-info").addClass("active-hover")
        }

        if (!miniWindow.is(e.target) && miniWindow.has(e.target).length === 0) {
            showWindow(false, miniWindow.parent(".big-window"));
        }
    });

    initVanillaTilt(".test-block");
    initVanillaTilt("#new-test")

})

function initVanillaTilt(blockName) {
    VanillaTilt.init(document.querySelectorAll(blockName), {
        max: 5,
        speed: 1000,
        scale: 1.025,
    });
}

function initCloseWindow() {
    $(".close-window, #cansel-result").on("click", function () {
        showWindow(false, $(this).closest(".big-window"));
    })
}

function initClear() {
    $(".clear-input").on("click", function () {
        $(this).siblings("input").val("");
    })
}

function initURL() {
    let urlHash = window.location.hash;
    if (urlHash === "#editProfile")
        showWindow(true, ".company-edit-block");
    else if (urlHash === "#allTests")
        window.scrollTo({
            top: $(".tests-block").offset().top - 65,
            behavior: "auto"
        })
    else if (urlHash === "#workers")
        window.scrollTo({
            top: $(".user-block").offset().top - 65,
            behavior: "auto"
        })
    history.replaceState({}, "adapting test", "./cabinet.html");
}

async function initPassedOrCheckedTests() {
    let passedOrCheckedTests = await getPassedOrCheckedTests();
    var data;

    if(passedOrCheckedTests.code === 8)
        data = [];
    else
        data = passedOrCheckedTests.data

    if (passedOrCheckedTests.ok || passedOrCheckedTests.code === 8) {

        passedAndCheckedTests = new PassedAndCheckedTests(data);

        passedAndCheckedTests.createFullCheckedItem();
        passedAndCheckedTests.createFullPassedItem();

        $("#more-verified-users").on("click", function () { passedAndCheckedTests.createFullCheckedItem(); })
        $("#more-unverified-users").on("click", function () { passedAndCheckedTests.createFullPassedItem(); })

    }
    else {
        $(".verified-user, .unverified-user").remove();
        $("#none-unverified-tests, #none-verified-tests").show();
    }

    questionBlock = $(".question-block").html();
    $(".question-block").remove();
}

function fillWorkerAnswers(testInfo, testName, workerName, workerId, infoBlockId) {

    $("#questions-block").empty();
    $(".result-buttons").hide();
    $("#verify-worker-name").text(workerName);
    $("#verify-test-name").text(testName);
    $("#save-result").attr("disabled", "disabled");
    $(".verify-user-block").parent(".big-window").animate({
        top: 0,
    })

    let possibleAnswers = testInfo.data.groupedPossibleAnswers;
    let workerAnswers = testInfo.data.groupedWorkerAnswers;
    var points = 0;
    for (let i = 0; i < possibleAnswers.length; i++) {
        let block = $("<div/>").html(questionBlock).addClass("question-block").attr("questionId", possibleAnswers[i][0].questionid);
        block.find(".question-name").text(i + 1 + ". " + possibleAnswers[i][0].questiondescription)
        var isright = 1;
        for (let j = 0, k = 0; j < possibleAnswers[i].length; j++) {
            let possibleLi = $("<li/>").text(possibleAnswers[i][j].possibleanswerdescription);
            let workerLi = $("<li/>").text(possibleAnswers[i][j].possibleanswerdescription);

            if (!possibleAnswers[i][j].isright) {
                possibleLi.addClass("line-through");
                workerLi.addClass("line-through");
            }

            if (possibleAnswers[i][j].number === workerAnswers[i][k].number) {
                workerLi.text(workerAnswers[i][k].answer);

                if (!isNull(workerAnswers[i][k].isright)) {
                    if (workerAnswers[i][k].isright)
                        workerLi.addClass("right-variant");
                    else {
                        workerLi.addClass("wrong-variant");
                        isright = 0;
                    }
                }
                else {
                    block.addClass("unverified-answer");
                    isright = 2;
                    $(".result-buttons").css("display", "flex");
                    block.find(".true-answer-button").on("click", function () {
                        if (block.attr("isRight") === undefined || block.attr("isRight") === "false") {
                            points++;
                            $(this).addClass("answer-checked");
                            block.find(".false-answer-button").removeClass("answer-checked");
                            workerLi.addClass("right-variant").removeClass("wrong-variant");
                            $("#total-result").text(points + "/" + possibleAnswers.length);
                            block.attr("isRight", "true");
                            block.find(".question-points").text("1/1");
                            checkAllUnferifiedAnswers();
                        }
                    })
                    block.find(".false-answer-button").on("click", function () {
                        if (block.attr("isRight") === undefined || block.attr("isRight") === "true") {
                            if (block.attr("isRight") === "true")
                                points--;
                            $(this).addClass("answer-checked");
                            block.find(".true-answer-button").removeClass("answer-checked");
                            workerLi.addClass("wrong-variant").removeClass("right-variant");
                            $("#total-result").text(points + "/" + possibleAnswers.length);
                            block.attr("isRight", "false");
                            block.find(".question-points").text("0/1");
                            checkAllUnferifiedAnswers();
                        }

                    })
                }

                if (k !== workerAnswers[i].length - 1) k++;
            }
            else {
                workerLi.addClass("unchecked-variant");
                if (!possibleAnswers[i][j].isright)
                    workerLi.addClass("right-variant");
                else {
                    workerLi.addClass("wrong-variant");
                    isright = 0;
                }
            }

            block.find(".true-answer").append(possibleLi);
            block.find(".user-answer").append(workerLi);
        }

        if (possibleAnswers[i].length > 1)
            block.find(".user-answer, .true-answer").addClass("variant");

        if (isright < 2)
            block.find(".question-points").text(isright + "/1");

        if (isright === 1)
            points++;

        $("#questions-block").append(block);
    }

    $("#total-result").text(points + "/" + possibleAnswers.length);

    $("#save-result").off("click").on("click", async function () {

        var data = [];
        for (var i = 0; i < $(".unverified-answer").length; i++)
            data.push({
                questionId: parseInt($(".unverified-answer").eq(i).attr("questionId")),
                isRight: $(".unverified-answer").eq(i).attr("isright") === "true"
            })

        let saveInfo = await checkLongQuestions(workerId, data, infoBlockId);

        if (saveInfo.ok) {
            passedAndCheckedTests.verifyItem(workerId, infoBlockId, workerName, testName, points, possibleAnswers.length);
            showWindow(false, $(".verify-user-block").parent(".big-window"))
        }
        else
            showMessage("error-message", saveInfo.message)
    })

    showWindow(true, $(".verify-user-block").parent(".big-window"))
}

function checkAllUnferifiedAnswers() {
    for (let i = 0; i < $(".unverified-answer").length; i++)
        if ($(".unverified-answer").eq(i).attr("isright") === undefined)
            return false;
    $("#save-result").removeAttr("disabled");
}

function showWindow(bl, block) {
    if (bl) {
        block.css({
            visibility: "visible",
            opacity: 1
        })
        $(".blurable").addClass("blur");
        $("body").css("overflow", "hidden");
    }
    else {
        block.css({
            visibility: "hidden",
            opacity: 0
        })
        $(".blurable").removeClass("blur");
        $("body").css("overflow", "auto");
    }
}

function initExit() {
    $("#exit").on("click", function () {
        cookie.delete("token");
        $(location).attr("href", "./login.html");
    })
}

function initSubscribeBlock() {
    $("#sign-user").on("click", async function () {
        signTest = $(".subscribe-test-block");
        let id = parseInt($(".subscribe-user-block").attr("subscribe-id"));
        let subscribe = [];
        let unsubscribe = [];

        for (let i = 0; i < signTest.length; i++) {
            if (typeof (signTest.eq(i).attr("subscribe-test-id")) !== typeof (undefined) && !signTest.eq(i).find(".subscribe-checkbox").prop("checked"))
                unsubscribe.push(parseInt(signTest.eq(i).attr("test-id")));
            else if (typeof (signTest.eq(i).attr("subscribe-test-id")) === typeof (undefined) && signTest.eq(i).find(".subscribe-checkbox").prop("checked"))
                subscribe.push(parseInt(signTest.eq(i).attr("test-id")));
        }

        if (unsubscribe.length > 0) {
            let unsubWorker;
            if ($(".subscribe-user-block").attr("subscribe-type") === "worker")
                unsubWorker = await unsubscribeTest(id, unsubscribe)
            else
                unsubWorker = await unsubscribeWorker(id, unsubscribe)

            console.log(unsubWorker)
        }
        if (subscribe.length > 0) {
            let subWorker;
            if ($(".subscribe-user-block").attr("subscribe-type") === "worker")
                subWorker = await subscribeTest(id, subscribe)
            else
                subWorker = await subscribeWorker(id, subscribe)

            console.log(subWorker);
        }

        $("#subscribe-search-user").val("");
        hideSubscribeAddUser()
        showWindow(false, $(".subscribe-user-block").parent(".big-window"));
    })

    $(".search-user-block").children(".clear-input").on("click", function () {
        $(".subscribe-test-block").show().removeAttr("testIsSearch");
        hideSubscribeAddUser()
    })

    $("#cansel-subscribe-user").on("click", function () {
        $("#subscribe-search-user").val("");
        hideSubscribeAddUser()
        showWindow(false, $(".subscribe-user-block").parent(".big-window"));
    })

    $("#subscribe-search-user").on("keyup", function () {
        if ($(".subscribe-test-block").length > 0) {
            checkSearchUser();
        }
    })

    function checkSearchUser() {

        let name1 = $(".subscribe-test-block").find(".subscribe-test-name")
        let name2 = $(".subscribe-test-block").find(".subscribe-test-description")
        let name3 = $(".subscribe-test-block").find(".subscribe-user-name")

        let names = [name1, name2, name3]

        for (let i = 0; i < name1.length; i++)
            for (let j = 0; j < names.length; j++)
                if (showAndHide(names[j].eq(i), $("#subscribe-search-user").val()))
                    break;

        if ($(".subscribe-test-block.testIsSearch").length === 0) {
            if ($(".subscribe-user-block").attr("subscribe-type") === "test")
                $("#test-not-found-block").show();
            else {
                $("#user-not-found-block").show();
                $("#new-subscribe-user-name").val("");
                $("#save-subscribe-user").attr("disabled", "disabled");
                $(".new-subscribe-user-block").css({
                    opacity: 0,
                    visibility: "hidden"
                })
                $("#save-subscribe-user").removeClass("save-hover");
            }
        }
        else {
            if ($(".subscribe-user-block").attr("subscribe-type") === "test")
                $("#test-not-found-block").hide();
            else
                $("#user-not-found-block").hide();
        }
    }

    function showAndHide(name, value) {
        if (name.text().toLowerCase().includes(value.toLowerCase())) {
            name.closest(".subscribe-test-block").show().addClass("testIsSearch");
            return true;
        }
        else {
            name.closest(".subscribe-test-block").hide().removeClass("testIsSearch");
            return false;
        }
    }

    $("#all-tests").off("click").on("click", function () {
        let block = $(".subscribe-test-block");
        if ($(this).prop("checked")) {
            let = checkTests = [];
            for (let i = 0; i < block.length; i++) {
                checkTests.push(block.eq(i).find(".subscribe-checkbox").prop("checked"));
                block.eq(i).find(".subscribe-checkbox").prop("checked", true);
            }
            $("#all-tests").attr("tests-status", checkTests.join(","))
            $("#subscribe-test-length").text(block.length + " из " + block.length);
            $("#clear-subscribe-user").addClass("active-clear-button").on("click", function () {
                clearTests();
            })
        }
        else {
            checkTestsLength(block);
        }
    })

    $("#not-found-user-button").on("click", function () {
        $(".new-subscribe-user-block").css({
            opacity: 1,
            visibility: "visible"
        })
    })

    $("#new-subscribe-user-name").on("keyup", function () {
        if ($(this).val() === "") {
            $("#save-subscribe-user").attr("disabled", "disabled");
            $("#save-subscribe-user").removeClass("save-hover");
        }
        else {
            $("#save-subscribe-user").addClass("save-hover")
            $("#save-subscribe-user").removeAttr("disabled");
        }

    })

    $("#save-subscribe-user").on("click", async function () {
        let userStatus = await addWorker($("#new-subscribe-user-name").val());

        if (userStatus.ok) {
            workers.addNewUser($("#new-subscribe-user-name").val(), userStatus)
            let signTest = $("<div/>").html(signTestBlock).addClass("subscribe-test-block");
            signTest.find(".subscribe-user-name").text($("#new-subscribe-user-name").val())
            signTest.attr("test-id", userStatus.data.id);
            $("#subscribe-user-tests-block").append(signTest);

            signTest.find(".subscribe-checkbox").on("click", function () {
                checkAllSubscribeList($(".user-info"));
            })

            checkAllSubscribeList($(".user-info"));

            if (showAndHide(signTest.find(".subscribe-user-name"), $("#subscribe-search-user").val()))
                hideSubscribeAddUser()
            else {
                $(".new-subscribe-user-block").css({
                    opacity: 0,
                    visibility: "hidden"
                })
                $("#new-subscribe-user-name").val("");
                $("#save-subscribe-user").attr("disabled", "disabled");
                $("#save-subscribe-user").removeClass("save-hover");
            }
        }
    })

    $(".active-clear-button").on("click", function () {
        clearTests();
    })
}

function hideSubscribeAddUser() {
    $("#test-not-found-block, #user-not-found-block").hide();
    $(".new-subscribe-user-block").css({
        opacity: 0,
        visibility: "hidden"
    })
    $("#new-subscribe-user-name").val("");
    $("#save-subscribe-user").attr("disabled", "disabled");
    $("#save-subscribe-user").removeClass("save-hover");
}

function checkTestsLength(block) {
    let testsLength = 0;
    for (let i = 0; i < block.length; i++) {
        block.eq(i).find(".subscribe-checkbox").prop("checked", $("#all-tests").attr("tests-status").split(",")[i] === "true");
        if ($("#all-tests").attr("tests-status").split(",")[i] === "true")
            testsLength++;
    }
    $("#subscribe-test-length").text(testsLength + " из " + block.length);
    if (testsLength > 0)
        $("#clear-subscribe-user").addClass("active-clear-button").on("click", function () {
            clearTests();
        })
    else
        $("#clear-subscribe-user").removeClass("active-clear-button").off("click")
}

async function initTests() {
    let testBlock = $("#hidden-test-block");
    $("#hidden-test-block").remove();
    testBlock.removeAttr("id");

    let blocksInfo = await getAllInfoBlocks();

    if (blocksInfo.ok) {
        for (let i = 0; i < blocksInfo.data.length; i++) {

            let block = $("<div/>").addClass("test-block visible-test").html(testBlock.html());
            let description;
            block.find(".test-name").text(blocksInfo.data[i].name);
            description = blocksInfo.data[i].description;
            block.children(".test-description").text(description);

            block.find(".edit-test").attr("href", "./index.html?id=" + blocksInfo.data[i].id);

            block.find(".delete-test").on("click", async function () {
                let deleteStatus = await deleteInfoBlock(blocksInfo.data[i].id);

                if (deleteStatus.ok) {
                    let rows = "";
                    for (let j = 0; j < Math.ceil($(".visible-test").length / 3); j++)
                        rows += "1fr ";
                    $(".line-tests-block").css("grid-template-rows", rows);

                    let destroyBlock = document.querySelectorAll(".test-block");
                    for (var j = 0; j < $(".test-block").length; j++)
                        destroyBlock[j].vanillaTilt.destroy();

                    if ($(".visible-test").length - 1 >= block.index()) {
                        for (let j = $(".visible-test").length - 1; j >= block.index(); j--) {

                            if (j === block.index()) {
                                $(".test-block").eq(j - 1).css({
                                    "transform": "scale(1)",
                                    "transition": "none"
                                })
                            }

                            let animateTop = $(".visible-test").eq(j - 1).position().top;
                            let animateleft = $(".visible-test").eq(j - 1).position().left;

                            let secondTop = $(".visible-test").eq(j).position().top;
                            let secondLeft = $(".visible-test").eq(j).position().left;

                            let secondMargin = parseInt($(".visible-test").eq(j).css("margin-left"));
                            let animateMargin = parseInt($(".visible-test").eq(j - 1).css("margin-left"));

                            $(".visible-test").eq(j).css({
                                position: "absolute",
                                top: secondTop + "px",
                                left: secondLeft + secondMargin + "px",
                            })

                            setTimeout(() => {
                                $(".visible-test").eq(j).css({
                                    top: animateTop + "px",
                                    left: animateleft + animateMargin + "px",
                                    transition: "0.3s"
                                })
                            }, 10)

                            setTimeout(() => {
                                $(".visible-test").eq(j).css({
                                    position: "static",
                                    top: "initial",
                                    left: "initial",
                                })

                                if (j === block.index()) {
                                    block.remove();
                                    initVanillaTilt(".test-block");
                                }

                                setTimeout(() => {
                                    $(".visible-test").eq(j).css({
                                        transition: "none"
                                    })
                                }, 300)

                                $(".line-tests-block").css("grid-template-rows", "auto");
                                $(".tests-block").css("height", $(".line-tests-block").height() + + $(".full-tests-info").height() + "px");
                            }, 300)

                        }
                    }
                    else {
                        block.css("opacity", "0");

                        setTimeout(() => {
                            block.remove();
                            initVanillaTilt(".test-block");

                            $(".tests-block").css("height", $(".line-tests-block").height() + $(".full-tests-info").height() + "px");
                        }, 300)
                    }
                }
                else {
                    console.log(deleteStatus)
                    showMessage(".error-message", "Ошибка при удалении теста")
                }
            })

            $("#new-test").after(block);

            block.find(".sign-user").on("click", function () {
                $(".subscribe-user-block").attr("subscribe-type", "worker");
                fillSubscribeBlock(blocksInfo.data[i].id, blocksInfo.data[i].name);
            })

            block.attr("test-id", blocksInfo.data[i].id, blocksInfo.data[i].name);
        }

        $("#search-test").on("keyup", function () {
            let name1 = $(".test-name");
            let name2 = $(".test-description");

            let names = [name1, name2]

            for (let i = 0; i < name1.length; i++)
                for (let j = 0; j < names.length; j++)
                    if (showAndHide(names[j].eq(i), $(this).val()))
                        break;


            function showAndHide(name, value) {
                if (name.text().toLowerCase().includes(value.toLowerCase())) {
                    name.closest(".test-block").show().addClass("visible-test");
                    return true;
                }
                else {
                    name.closest(".test-block").hide().removeClass("visible-test");
                    return false;
                }
            }

            $(".tests-block").css("height", $(".line-tests-block").height() + $(".full-tests-info").height() + "px");
        })

        $("#search-test").siblings(".clear-input").on("click", function () {
            $(".test-block").show().addClass("visible-test");
            $(".tests-block").css("height", $(".line-tests-block").height() + $(".full-tests-info").height() + "px");

        })

        $(".tests-block").css("height", $(".line-tests-block").height() + $(".full-tests-info").height() + "px");

    }
}

async function initUsers() {

    let workersInfo = await getWorkers();
    var data;

    if(workersInfo.code === 8)
        data = [];
    else
        data = workersInfo.data;

    workers = new Workers(data);

    if (workersInfo.ok || workersInfo.code === 8) {
        workers.fillWorkers();
    }

    $(document).mouseup(function (e) {
        workers.hideOrShowMoreUsersButtons(e);
    });

    $("#search-user").on("keyup", function () {
        workers.searchUser($(this).val());
    })

    $("#search-user").siblings(".clear-input").on("click", function(){
        workers.clearSearchUser();
    })

    $("#add-user, #worker-not-found-button").on("click", function () {
        workers.showNewUserBlock();
    })

    $("#save-new-user").on("click", async function () {
        let userStatus = await addWorker($("#add-user-name").val());
        workers.addNewUser($("#add-user-name").val(), userStatus);
    })

    $("#add-user-name").on("keyup", function () {
        workers.checkNewUserButtonStatus($(this).val());
    })

    $("#close-add-user").on("click", function () {
        workers.hideAddUser();

        if ($(".user-info").length === 0)
           workers.showNotFoundUserBlock();
    })

}

function clearTests() {
    let block = $(".subscribe-test-block");

    for (let i = 0; i < block.length; i++) {
        block.eq(i).find(".subscribe-checkbox").prop("checked", false);
    }

    $("#all-tests").prop("checked", false);
    $("#subscribe-test-length").text(0 + " из " + block.length);
    $(".active-clear-button").removeClass("active-clear-button").off("click")
}

async function fillSubscribeBlock(id, name) {
    let signTestInfo;
    let type;

    if ($(".subscribe-user-block").attr("subscribe-type") === "test")
        type = "test";
    else
        type = "worker";

    $(".subscribe-user-block").attr("subscribe-id", id)

    $(".subscribe-test-block").remove();

    if (type === "test") {
        blocks = $(".test-block");
        signTestInfo = await getSubscriptions(id);
    }
    else if (type === "worker") {
        blocks = $(".user-info");
        signTestInfo = await getSubscribers(id);
    }

    $(".subscribe-user-block").children("#subscribe-user-name").text(name);

    for (let i = 0; i < blocks.length; i++) {
        let signTest = $("<div/>").html(signTestBlock).addClass("subscribe-test-block");

        if ($(".subscribe-user-block").attr("subscribe-type") === "test") {
            signTest.find(".subscribe-test-name").text(blocks.eq(i).find(".test-name").text());
            signTest.find(".subscribe-test-description").text(blocks.eq(i).find(".test-description").text());
            signTest.attr("test-id", blocks.eq(i).attr("test-id"));
            signTest.children(".subscribe-test-info-block").addClass("test-padding");
        }
        else {
            signTest.find(".subscribe-user-name").text(blocks.eq(i).find(".user-name").text())
            signTest.attr("test-id", blocks.eq(i).attr("worker-id"));
        }

        signTest.find(".subscribe-checkbox").on("click", function () {
            checkAllSubscribeList(blocks);
        })

        if (signTestInfo.code !== 8 && signTestInfo.code !== 6) {
            for (let j = 0; j < signTestInfo.data.length; j++) {
                if (signTestInfo.data[j].id === parseInt(blocks.eq(i).attr(type === "test" ? "test-id" : "worker-id"))) {
                    signTest.find(".subscribe-checkbox").attr("checked", "checked");
                    signTest.attr("subscribe-test-id", signTestInfo.data[j].id)
                }
            }

            if (signTestInfo.data.length === blocks.length)
                $("#all-tests").prop("checked", true);
        }

        $("#subscribe-user-tests-block").append(signTest);
    }

    checkAllSubscribeList(blocks);

    $("#subscribe-test-length").text()

    $(".user-active").removeClass("user-active");
    $(".user-info").addClass("active-hover");
    $(".user-buttons-block").css({
        visibility: "hidden",
        opacity: 0
    })

    showWindow(true, $(".subscribe-user-block").parent(".big-window"));
}

function checkAllSubscribeList(blocks) {
    let checkBool = true;

    let checkTests = [];

    for (let i = 0; i < blocks.length; i++) {
        checkTests.push($(".subscribe-test-block").eq(i).find(".subscribe-checkbox").prop("checked"));
        if (!$(".subscribe-test-block").eq(i).find(".subscribe-checkbox").prop("checked")) {
            checkBool = false;
        }
    }

    $("#all-tests").attr("tests-status", checkTests.join(","))

    if (checkBool)
        $("#all-tests").prop("checked", true);
    else
        $("#all-tests").prop("checked", false);

    checkTestsLength($(".subscribe-test-block"));
}

async function initCompanyInfo() {
    let companyInfo = await getCompany();

    if (companyInfo.ok) {
        printCompanyInfo(companyInfo.data);

        $("#edit-company-info, #header-edit-profile").on("click", function () {
            $("#name-input").attr("placeholder", $(".company-name").eq(0).text());
            $("#login-input").attr("placeholder", $("#company-login").text() === "" ? "Новый логин" : $("#company-login").text());
            $("#mail-input").attr("placeholder", $("#company-mail").text());
            $("#city-input").attr("placeholder", $("#company-adress").text());

            showWindow(true, $(".company-edit-block").parent(".big-window"));
        })

        $(".change-input-type").on("click", function () {
            if ($(this).hasClass("change-input-type-text")) {
                $(this).siblings("input").attr("type", "password");
                $(this).removeClass("change-input-type-text");
            }
            else {
                $(this).siblings("input").attr("type", "text");
                $(this).addClass("change-input-type-text");
            }
        })

        $(".edit-company-input:not(#old-password-input)").on("keyup", function () {
            for (let i = 0; i < $(".edit-company-input").length - 1; i++) {
                if (($("#password-input").val() !== "" && $("#repeat-password-input").val() === "") || ($("#password-input").val() === "" && $("#repeat-password-input").val() !== "")) {
                    $("#edit").attr("disabled", "disabled");
                    return 0;
                }
                if ($(".edit-company-input").eq(i).val() !== "") {
                    $("#edit").removeAttr("disabled");
                    return 0;
                }
            }
            $("#edit").attr("disabled", "disabled");
        })

        var editInfo = {};

        $("#edit").on("click", async function () {

            if ($("#name-input").val() !== "")
                editInfo.name = $("#name-input").val();
            else
                editInfo.name = $(".company-name").eq(0).text();

            if ($("#login-input").val() !== "") {
                if ($("#login-input").val().length < 5) {
                    showMessage("error-message", "Логин должен содержать не менее пяти символов");
                    return 0;
                }
                editInfo.login = $("#login-input").val();
            }
            else
                editInfo.login = $("#company-login").text();

            if ($("#mail-input").val() !== "") {
                var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                if (!reg.test($("#mail-input").val())) {
                    showMessage("error-message", "Неверный формат почты");
                    return 0;
                }
                editInfo.email = $("#mail-input").val();;
            }
            else
                editInfo.email = $("#company-mail").text();

            if ($("#city-input").val() !== "")
                editInfo.city = $("#city-input").val();
            else
                editInfo.city = $("#company-adress").text();

            if ($("#password-input").val() !== "") {
                if ($("#password-input").val().length < 5) {
                    showMessage("error-message", "Пароль должен содержать не менее пяти символов");
                    return 0;
                }
                editInfo.password = $("#password-input").val();
            }

            if ($("#password-input").val() !== $("#repeat-password-input").val()) {
                showMessage("error-message", "Новые пароли не совпадают");
                return 0;
            }

            $(".confirm-block").css({
                visibility: "visible",
                opacity: "1"
            })

            $(".left-company-edit-block, .right-company-edit-block").css({
                opacity: "0.3",
                "pointer-events": "none"
            })
        })

        $("#old-password-input").on("keyup", function () {
            if ($(this).val() !== "")
                $("#confirm-edit").removeAttr("disabled");
            else
                $("#confirm-edit").attr("disabled", "disabled");
        })

        $("#confirm-edit").on("click", async function () {
            let editStatus = await editCompany($("#old-password-input").val(), editInfo);

            if (editStatus.ok) {
                printCompanyInfo(editInfo);

                $(".confirm-block").css({
                    visibility: "hidden",
                    opacity: "0"
                })

                $(".left-company-edit-block, .right-company-edit-block").css({
                    opacity: "1",
                    "pointer-events": "auto"
                })

                showMessage("success-message", "Данные успешно изменены");
                showWindow(false, $(".company-edit-block").parent(".big-window"));
                $(".edit-company-input").val("");
            }
            else {
                if (editStatus.code === 4) {
                    showMessage("error-message", "Неверный пароль");
                }
                else {
                    showMessage("error-message", editStatus.message);
                }
            }
        })

        $("#confirm-cansel-edit").on("click", function () {
            $(".confirm-block").css({
                visibility: "hidden",
                opacity: "0"
            })

            $(".left-company-edit-block, .right-company-edit-block").css({
                opacity: "1",
                "pointer-events": "auto"
            })
        })

        $("#cansel-edit").on("click", function () {
            $(".edit-company-input").val("");
            showWindow(false, $(".company-edit-block").parent(".big-window"));
        })
    }

    $("#login-input, #password-input").keypress(function (event) {
        var ew = event.which;
        if (ew == 32)
            return true;
        if (48 <= ew && ew <= 57)
            return true;
        if (65 <= ew && ew <= 90)
            return true;
        if (97 <= ew && ew <= 122)
            return true;
        if (ew === 64 || ew === 45 || ew === 95 || ew === 46)
            return true;

        return false;
    })
}

function printCompanyInfo(companyInfo) {
    if (companyInfo.login !== null && companyInfo.login !== "")
        $("#company-login").text(companyInfo.login);
    else
        $("#company-login").parent().hide();

    $("#company-mail").text(companyInfo.email);
    $("#company-adress").text(companyInfo.city);
    $(".company-name").text(companyInfo.name);
}

function initAnchors() {
    $("#tests-anchor").on("click", function () { anchorPosition(".tests-block") })
    $("#home-anchor").on("click", function () { anchorPosition(".company-block") })
    $("#workers-anchor").on("click", function () { anchorPosition(".user-block") })

    checkAnchor();

    $(window).on("scroll", function (e) {
        checkAnchor();
    })

    function checkAnchor() {
        let offset = window.pageYOffset;

        if (offset >= 0 && offset < $(".company-block").innerHeight() - 300) {
            $("#home-anchor").prop("checked", true);
        }
        else if (offset >= $(".company-block").innerHeight() - 300 && offset < $(".tests-block").innerHeight() + $(".tests-block").offset().top - 300) {
            $("#tests-anchor").prop("checked", true);
        }
        else {
            $("#workers-anchor").prop("checked", true);
        }

        if ($(".hover-important").length === 0) {
            $(".anchor:checked").parent(".anchor-check").addClass("anchor-is-checked").removeClass("anchor-is-not-checked");
            $(".anchor:not(:checked)").parent(".anchor-check").removeClass("anchor-is-checked").addClass("anchor-is-not-checked");
        }
    }

    function anchorPosition(position) {
        window.scrollTo({
            top: $(position).offset().top - 55,
            behavior: 'smooth'
        });
    }

    $(".anchor-block").hover(
        function () {
            $(".anchor-block:not(:eq(" + $(this).index() + "))").children(".anchor-check").removeClass("anchor-is-checked").addClass("anchor-is-not-checked");
            $(this).children(".anchor-check").addClass("anchor-is-checked").removeClass("anchor-is-not-checked");
            $(this).addClass("hover-important");
        },
        function () {
            $(".anchor-check").eq($(this).index()).removeClass("anchor-is-checked").addClass("anchor-is-not-checked");
            $(".anchor:checked").parent(".anchor-check").addClass("anchor-is-checked").removeClass("anchor-is-not-checked");
            $(this).removeClass("hover-important");
        }
    )

}