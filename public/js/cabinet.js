$(document).ready(async function () {

    initCompanyInfo();
    initTests();
    initExit();
    initUsers();
    initUp(window)

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

async function initTests() {
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
        }
    }
}

async function initUsers() {

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

        $(".users").append(block)

        block.find(".user-more").on("click", function () {
            block.children(".hoverable").addClass("user-active");
            $(".user-info:not(.user-active)").removeClass("active-hover");
            block.children(".user-buttons-block").css({
                opacity: 1,
                visibility: "visible"
            })
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