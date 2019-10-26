$(document).ready(async function () {
    let signTestBlock = $(".subscribe-deleteble").html();

    initCompanyInfo();
    initTests(signTestBlock);
    initExit();
    initUsers(signTestBlock);
    initSubscribeBlock();
    initUp(window);

    $(".subscribe-deleteble").remove();

    setTimeout(() => $(".preloader").css({
        opacity: 0,
        visibility: "hidden"
    }), 500)

})

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

        $(".subscribe-user-block").css({
            visibility: "hidden",
            opacity: 0
        })
        $(".blurable").removeClass("blur");
        $("body").css("overflow", "hidden");
    })

    $("#cansel-subscribe-user").on("click", function () {
        $(".subscribe-user-block").css({
            visibility: "hidden",
            opacity: 0
        })
        $(".blurable").removeClass("blur");
        $("body").css("overflow", "auto");
    })

    $("#subscribe-search-user").on("keyup", function () {
        if ($(".subscribe-test-block").length > 0) {
            let name1 = $(".subscribe-test-block").find(".subscribe-test-name")
            let name2 = $(".subscribe-test-block").find(".subscribe-test-description")
            let name3 = $(".subscribe-test-block").find(".subscribe-user-name")

            let names = [name1, name2, name3]

            for (let i = 0; i < name1.length; i++)
                for (let j = 0; j < names.length; j++)
                    if (showAndHide(names[j].eq(i), $(this).val()))
                        break;

            // if ($(".testIsSearch").length === 0)
            //     $(".user-length").text("Пользователь не найден").show();
            // else
            //     $(".user-length").hide();

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

        }
    })

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

    $(".active-clear-button").on("click", function () {
        clearTests();
    })
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

async function initTests(signTestBlock) {
    let testBlock = $("#hidden-test-block");
    $("#hidden-test-block").remove();
    testBlock.removeAttr("id");

    let blocksInfo = await getAllInfoBlocks();

    if (blocksInfo.ok) {
        for (let i = 0; i < blocksInfo.data.length; i++) {

            let block = $("<div/>").addClass("test-block").html(testBlock.html());
            let description;
            block.find(".test-name").text(blocksInfo.data[i].name);
            if (blocksInfo.data[i].description.length > 72)
                description = (blocksInfo.data[i].description).substring(0, 73) + "...";
            else
                description = blocksInfo.data[i].description;
            block.children(".test-description").text(description);

            block.find(".edit-test").attr("href", "./index.html?id=" + blocksInfo.data[i].id);

            block.find(".delete-test").on("click", async function () {
                let deleteStatus = await deleteInfoBlock(blocksInfo.data[i].id);

                if (deleteStatus.ok) {
                    block.remove();
                }
                else {
                    console.log("Ошибка при удалении " + blocksInfo.data[i].id + " блока")
                }
            })

            $("#new-test").after(block);

            block.find(".sign-user").on("click", function () {
                $(".subscribe-user-block").attr("subscribe-type", "worker");
                fillSubscribeBlock(blocksInfo.data[i].id, signTestBlock, blocksInfo.data[i].name);
            })

            block.attr("test-id", blocksInfo.data[i].id, blocksInfo.data[i].name);
        }
    }
}

async function initUsers(signTestBlock) {

    let workersInfo = await getWorkers();

    let userBlock = $(".user-deleteble").html();


    if (workersInfo.ok) {
        let workers = workersInfo.data;

        $(".user-length").hide();

        for (let i = 0; i < workers.length; i++) {
            showUser(workers[i].name, workers[i].key, workers[i].id);
        }
    }
    else if (workersInfo.code === 8) {
        $(".user-length").text("Добавьте сотрудника кнопкой сверху")
    }

    $(document).mouseup(function (e) { // событие клика по веб-документу
        var div = $(".user-buttons-block"); // тут указываем ID элемента
        if (!div.is(e.target) // если клик был не по нашему блоку
            && div.has(e.target).length === 0) { // и не по его дочерним элементам
            div.css({
                visibility: "hidden",
                opacity: "0"
            });
            $(".user-active").removeClass("user-active");
            $(".user-info").addClass("active-hover")
        }
    });

    function showUser(name, key, id) {
        let block = $("<div/>").addClass("user-info active-hover").html(userBlock);

        block.find(".user-name").text(name);
        block.find(".user-code").text(key);

        $(".users").append(block)

        block.attr("worker-id", id)

        block.find(".user-more").on("click", function () {
            block.children(".hoverable").addClass("user-active");
            $(".user-info:not(.user-active)").removeClass("active-hover");
            block.children(".user-buttons-block").css({
                opacity: 1,
                visibility: "visible"
            })
        })

        block.find(".delete-user-button").on("click", async function () {
            let deleteStatus = await deleteWorker(id);

            if (deleteStatus.ok) {
                block.remove();

                $(".user-active").removeClass("user-active");
                $(".user-info").addClass("active-hover");

                if ($(".user-info").length === 0)
                    $(".user-length").text("Добавьте сотрудника кнопкой сверху").show();
            }
            else
                showMessage("error-message", deleteStatus.description)
        })

        block.find(".sign-user-button").on("click", function () {
            $(".subscribe-user-block").attr("subscribe-type", "test");
            fillSubscribeBlock(id, signTestBlock, name);
        })

        $(".user-length").hide();
    }

    function hideAddUser() {
        $(".add-user-block").hide();
        $("#add-user-name").val("");
        $("#add-user").removeAttr("disabled");
        $("#save-new-user").attr("disabled", "disabled");
    }

    $("#search-user").on("keyup", function () {
        if ($(".user-info").length > 0) {
            let name = $(".user-name")
            for (let i = 0; i < name.length; i++) {
                if (name.eq(i).text().toLowerCase().includes($(this).val().toLowerCase()))
                    name.eq(i).closest(".user-info").show().addClass("isSearch")
                else
                    name.eq(i).closest(".user-info").hide().removeClass("isSearch")
            }
            if ($(".isSearch").length === 0)
                $(".user-length").text("Пользователь не найден").show();
            else
                $(".user-length").hide();
        }
    })

    $("#add-user").on("click", function () {
        $(".add-user-block").css("display", "flex");
        $(this).attr("disabled", "disabled");
        $(".user-length").hide();
    })

    $("#save-new-user").on("click", async function () {
        let userStatus = await addWorker($("#add-user-name").val());

        if (userStatus.ok) {
            showUser($("#add-user-name").val(), userStatus.data.code, userStatus.data.id);
            hideAddUser();
        }
        else
            showMessage("error-message", userStatus.description);
    })

    $("#add-user-name").on("keyup", function () {
        if ($(this).val().length > 0)
            $("#save-new-user").removeAttr("disabled");
        else
            $("#save-new-user").attr("disabled", "disabled")
    })

    $("#close-add-user").on("click", function () {
        hideAddUser();

        if ($(".user-info").length === 0)
            $(".user-length").show();
    })

    $(".user-deleteble").remove();
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

async function fillSubscribeBlock(id, signTestBlock, name) {
    let checkTests = [];
    let signTestInfo;
    let type;

    if ($(".subscribe-user-block").attr("subscribe-type") === "test")
        type = "test";
    else
        type = "worker";

    $(".subscribe-user-block").attr("subscribe-id", id)

    $("#subscribe-user-tests-block").empty();

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
            let checkBool = true;
            let checkLength = 0;

            checkTests = [];

            for (let i = 0; i < blocks.length; i++) {
                checkTests.push($(".subscribe-test-block").eq(i).find(".subscribe-checkbox").prop("checked"));
                if (!$(".subscribe-test-block").eq(i).find(".subscribe-checkbox").prop("checked")) {
                    checkBool = false;
                }
                else checkLength++;
            }

            $("#all-tests").attr("tests-status", checkTests.join(","))

            if (checkBool)
                $("#all-tests").prop("checked", true);
            else
                $("#all-tests").prop("checked", false);

            checkTestsLength($(".subscribe-test-block"));
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

    for (let i = 0; i < blocks.length; i++)
        checkTests.push($(".subscribe-test-block").eq(i).find(".subscribe-checkbox").prop("checked"))

    $(".subscribe-user-block").css({
        visibility: "visible",
        opacity: 1
    })

    $(".blurable").addClass("blur");

    $("#all-tests").attr("tests-status", checkTests.join(","))

    checkTestsLength($(".subscribe-test-block"));

    $("#subscribe-test-length").text()

    $(".user-active").removeClass("user-active");
    $(".user-info").addClass("active-hover");
    $(".user-buttons-block").css({
        visibility: "hidden",
        opacity: 0
    })

    $("body").css("overflow", "hidden");
}

async function initCompanyInfo() {
    let companyInfo = await getCompany();

    if (companyInfo.ok) {
        if (companyInfo.data.login !== null)
            $("#company-login").text(companyInfo.data.login);
        else
            $("#company-login").parent().hide();

        $("#company-mail").text(companyInfo.data.email);
        $("#company-adress").text(companyInfo.data.city);
        $("#company-name").text(companyInfo.data.name);
    }
}