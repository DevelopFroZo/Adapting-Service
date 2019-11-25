class Workers {

    constructor(workersInfo) {
        this.workers = workersInfo;
        this.userBlock = $(".user-deleteble").html();

        $(".user-deleteble").remove();
    }

    fillWorkers() {
        $(".user-length").hide();

        for (let i = 0; i < this.workers.length; i++) {
            this.showUser(this.workers[i].name, this.workers[i].key, this.workers[i].id);
        }

        if (this.workers.length === 0)
            this.showNotFoundUserBlock("Список сотрудников пуст");
    }

    showUser(name, key, id) {
        let block = $("<div/>").addClass("user-info active-hover").html(this.userBlock);

        var userInfo = passedAndCheckedTests.getLastTestByWorkerId(id);
        var scores = "-", status = "-"

        if (userInfo.allscores !== "-" && userInfo.status === 2)
            scores = userInfo.workerscores + "/" + userInfo.allscores;

        if (userInfo.status === 2)
            status = "Проверено"
        else if (userInfo.status === 1)
            status = "Не проверено"

        block.find(".user-name").text(name);
        block.find(".user-code").text(key);
        block.find(".user-test").text(userInfo.infoblockname);
        block.find(".user-result").text(scores);
        block.find(".user-status").text(status)

        if (userInfo.status === 1)
            block.find(".user-status").addClass("blue-text");

        $(".users").prepend(block)

        block.attr("worker-id", id)

        block.find(".user-more").on("click", function () {
            block.children(".hoverable").addClass("user-active");
            $(".user-info:not(.user-active)").removeClass("active-hover");
            block.children(".user-buttons-block").css({
                opacity: 1,
                visibility: "visible"
            })
        })

        block.find(".delete-user-button").on("click", async () => {
            let deleteStatus = await deleteWorker(id);

            if (deleteStatus.ok) {
                block.remove();

                $(".user-active").removeClass("user-active");
                $(".user-info").addClass("active-hover");

                if ($(".user-info").length === 0)
                    this.showNotFoundUserBlock("Список сотрудников пуст")
                else if ($(".isSearch").length === 0 && $("#search-user").val() !== "")
                    this.showNotFoundUserBlock("Сотрудник с таким именем не найден")
            }
            else
                showMessage("error-message", deleteStatus.description)
        })

        block.find(".sign-user-button").on("click", function () {
            $(".subscribe-user-block").attr("subscribe-type", "test");
            fillSubscribeBlock(id, name);
        })

        if ($("#search-user").val().toLowerCase().includes(name.toLowerCase()) || $("#search-user").val() === "")
            this.hideNotFoundUserBlock();
        else {
            block.hide();
            this.showNotFoundUserBlock("Сотрудник с таким именем не найден");
        }

    }

    hideAddUser() {
        $(".add-user-block").removeClass("add-user-block-active");
        $("#worker-not-found-button").removeClass("not-found-button-not-active");
        $("#add-user-name").val("");
        $("#add-user").removeAttr("disabled");
        $("#save-new-user").attr("disabled", "disabled");
    }

    searchUser(value) {
        if ($(".user-info").length > 0) {

            if ($(".add-user-block").hasClass("add-user-block-active")) {
                this.hideAddUser();
            }

            let name = $(".user-name")
            for (let i = 0; i < name.length; i++) {
                if (name.eq(i).text().toLowerCase().includes(value.toLowerCase()))
                    name.eq(i).closest(".user-info").show().addClass("isSearch")
                else
                    name.eq(i).closest(".user-info").hide().removeClass("isSearch")
            }
            if ($(".isSearch").length === 0)
                this.showNotFoundUserBlock("Сотрудник с таким именем не найден");
            else
                this.hideNotFoundUserBlock();
        }
    }

    clearSearchUser() {
        $(".user-info").show();

        if ($(".user-info").length === 0)
            this.showNotFoundUserBlock("Список сотрудников пуст");
        else
            this.hideNotFoundUserBlock();
    }

    hideOrShowMoreUsersButtons(e) {
        var div = $(".user-buttons-block");
        if (!div.is(e.target)
            && div.has(e.target).length === 0) {
            div.css({
                visibility: "hidden",
                opacity: "0"
            });
            $(".user-active").removeClass("user-active");
            $(".user-info").addClass("active-hover")
        }
    }

    showNewUserBlock() {
        $(".add-user-block").addClass("add-user-block-active");
        $("#worker-not-found-button").addClass("not-found-button-not-active");
        $("#add-user").attr("disabled", "disabled");
    }

    addNewUser(userName, userStatus) {
        if (userStatus.ok) {
            this.showUser(userName, userStatus.data.code, userStatus.data.id);

            this.workers.push({
                id: userStatus.data.id,
                key: userStatus.data.code,
                name: userName
            })

            this.hideAddUser();
        }
        else
            showMessage("error-message", userStatus.description);
    }

    checkNewUserButtonStatus(value) {
        if (value.length > 0)
            $("#save-new-user").removeAttr("disabled");
        else
            $("#save-new-user").attr("disabled", "disabled")
    }

    showNotFoundUserBlock(text) {
        $(".worker-not-found-block").show();
        $("#worker-not-found-text").text(text);
    }

    hideNotFoundUserBlock() {
        $(".worker-not-found-block").hide();
        $("#worker-not-found-button").removeClass("not-found-button-not-active");
    }

    getWorkerById(workerId) {

        for (var i = 0; i < this.workers.length; i++) {
            if (this.workers[i].id = workerId)
                return {
                    data: this.workers[i],
                    ok: true
                }
        }

        return {
            message: "User not found",
            ok: false
        }

    }

}