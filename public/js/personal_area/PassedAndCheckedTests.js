class PassedAndCheckedTests {

    constructor(passedOrCheckedTests) {

        var passedInfo = [], checkedInfo = [], workersTests = [];

        for (var i = 0; i < passedOrCheckedTests.length; i++) {
            var bl = false, data = passedOrCheckedTests[i];;

            for (var j = 0; j < workersTests.length; j++) {
                if (workersTests[j].workerId === passedOrCheckedTests[i].workerid) {
                    workersTests[j].data.unshift(data)
                    bl = true;
                    break;
                }
            }

            if (!bl) {
                workersTests.push({
                    workerId: passedOrCheckedTests[i].workerid,
                    data: [data]
                })
            }

            if (passedOrCheckedTests[i].status === 1)
                passedInfo.push(passedOrCheckedTests[i])
            else
                checkedInfo.push(passedOrCheckedTests[i])
        }

        this.checkedInfo = checkedInfo;
        this.passedInfo = passedInfo;
        this.minCheckedTests = checkedInfo.length - 1;
        this.minPassedTests = passedInfo.length - 1;
        this.passedHeight = 0;
        this.checkedHeight = 0;
        this.checkedBlock = $(".verified-user").html();
        this.passedBlock = $(".unverified-user").html();
        this.workersTests = workersTests;

        console.log(this.workersTests)

        $(".verified-user, .unverified-user").remove();
    }

    createFullCheckedItem() {
        this.setCheckedMax();
        this.setSecondCheckedParentBlockHeight();

        for (this.minCheckedTests = this.minCheckedTests; this.minCheckedTests >= this.checkedMax; this.minCheckedTests--)
            this.createCheckedItem(this.minCheckedTests);

        this.checkedSize = $(".verified-user").length;

        this.changeCheckedParentBlockHeight();
        this.showCheckedMoreButton();
    }

    createFullPassedItem() {
        this.setPassedMax();
        this.setSecondPassedParentBlockHeight();

        for (this.minPassedTests = this.minPassedTests; this.minPassedTests >= this.passedMax; this.minPassedTests--)
            this.createPassedItem(this.minPassedTests);

        this.changePassedParentBlockeight();
        this.showPassedMoreButton();
    }

    createPassedItem(j) {
        let block;
        let info = this.passedInfo[j];
        block = $("<div/>").addClass("unverified-user").html(this.passedBlock);
        block.find(".unverified-user-name").text(info.workername);
        block.find(".unverified-user-test-name").text(info.infoblockname)
        $(".unverified-users-block").append(block);
        this.passedParentBlockHeight += block.outerHeight() + 1;
        block.attr("workerId", info.workerid).attr("infoBlockId", info.infoblockid);

        block.find(".verify-user").on("click", async function () {
            let testInfo = await getAnswers(info.workerid, info.infoblockid);

            if (testInfo) {
                fillWorkerAnswers(testInfo, info.infoblockname, info.workername, info.workerid, info.infoblockid);
            }
        })
    }

    createCheckedItem(i) {
        let block;
        let info = this.checkedInfo[i];
        block = $("<div/>").addClass("verified-user").html(this.checkedBlock);
        block.find(".verified-user-name").text(info.workername);
        block.find(".unverified-user-test-name").text(info.infoblockname);
        block.find(".verified-user-points").text(info.workerscores + "/" + info.allscores);
        let progresProcent = info.workerscores / info.allscores * 100;
        block.find(".verified-user-progress").css("width", progresProcent + "%")
        $(".verified-users-block").append(block);
        this.checkedParentBlockHeight += block.outerHeight() + 1;
        block.attr("workerId", info.workerid).attr("infoBlockId", info.infoblockid);

        block.find(".check-verified-user-button").on("click", async function () {
            let testInfo = await getAnswers(info.workerid, info.infoblockid);

            if (testInfo.ok) {
                fillWorkerAnswers(testInfo, info.infoblockname, info.workername, info.workerid, info.infoblockid);
            }

        })
    }

    changeCheckedParentBlockHeight() {
        this.checkedHeight = this.checkedParentBlockHeight;
        $(".verified-users-block").css("height", this.checkedHeight);
    }

    changePassedParentBlockeight() {
        this.passedHeight = this.passedParentBlockHeight;
        $(".unverified-users-block").css("height", this.passedHeight);
    }

    setSecondCheckedParentBlockHeight() {
        this.checkedParentBlockHeight = this.checkedHeight;
    }

    setSecondPassedParentBlockHeight() {
        this.passedParentBlockHeight = this.passedHeight;
    }

    setCheckedMax() {
        this.checkedMax = this.minCheckedTests - 2 > 0 ? this.minCheckedTests - 2 : 0;
    }

    setPassedMax() {
        this.passedMax = this.minPassedTests - 2 > 0 ? this.minPassedTests - 2 : 0;
    }

    showCheckedMoreButton() {
        if ($(".verified-user").length !== 0) {
            if (this.minCheckedTests !== -1) {
                $("#more-verified-users").css({
                    display: "block",
                    height: "53px",
                    padding: "10px 0px",
                    opacity: 0.5
                });
            }
            else {
                $("#more-verified-users").css({
                    padding: "0",
                    height: "0",
                    opacity: "0"
                });
            }
        }
        else {
            $("#none-verified-tests").show();
        }
    }

    showPassedMoreButton() {
        if ($(".unverified-user").length !== 0) {
            if (this.minPassedTests !== -1)
                $("#more-unverified-users").css("display", "block");
            else {
                $("#more-unverified-users").css({
                    padding: "0",
                    height: "0",
                    opacity: "0"
                });
            }
        }
        else {
            $("#none-unverified-tests").show();
        }
    }

    deleteItemByTestId(ths, workerId, infoBlockId, isChecked) {
        if (!isChecked) {
            $("[class = \"unverified-user\"][infoblockid = " + infoBlockId + "]").remove();
            for (var i = 0; i < ths.passedInfo.length; i++)
                if (ths.passedInfo[i].infoblockid === infoBlockId) {
                    ths.passedInfo.splice(i, 1);
                    i--;
                }

        }
        else {
            $("[class = \"verified-user\"][infoblockid = " + infoBlockId + "]").remove();
            for (var i = 0; i < ths.checkedInfo.length; i++)
                if (ths.checkedInfo[i].infoblockid === infoBlockId) {
                    ths.checkedInfo.splice(i, 1);
                    i--;
                }

        }
    }

    deleteItemByWorkerId(ths, workerId, infoBlockId, isChecked) {
        if (!isChecked) {
            $("[class = \"unverified-user\"][workerid = " + workerId + "]").remove();
            for (var i = 0; i < ths.passedInfo.length; i++)
                if (ths.passedInfo[i].workerid === workerId) {
                    ths.passedInfo.splice(i, 1);
                    i--;
                }

        }
        else {
            $("[class = \"verified-user\"][workerid = " + workerId + "]").remove();
            for (var i = 0; i < ths.checkedInfo.length; i++)
                if (ths.checkedInfo[i].workerid === workerId) {
                    ths.checkedInfo.splice(i, 1);
                    i--;
                }

        }
    }

    deleteItemByTestIdAndWorkerId(ths, workerId, infoBlockId, isChecked) {
        if (!isChecked) {
            $("[class = \"unverified-user\"][workerid = " + workerId + "][infoblockid = " + infoBlockId + "]").remove();
            for (var i = 0; i < ths.passedInfo.length; i++)
                if (ths.passedInfo[i].infoblockid === infoBlockId && ths.passedInfo[i].workerid === workerId) {
                    ths.passedInfo.splice(i, 1);
                    break;
                }
        }
        else {
            $("[class = \"verified-user\"][workerid = " + workerId + "][infoblockid = " + infoBlockId + "]").remove();
            for (var i = 0; i < ths.checkedInfo.length; i++)
                if (ths.checkedInfo[i].infoblockid === infoBlockId && ths.checkedInfo[i].workerid === workerId) {
                    ths.checkedInfo.splice(i, 1);
                    break;
                }
        }
    }

    deleteCheckedItem(deleteType, workerId, infoBlockId) {
        this.setSecondCheckedParentBlockHeight();

        if (typeof deleteType === "function")
            deleteType(this, workerId, infoBlockId, true)

        if (this.checkedMax > 0)
            this.checkedMax--;

        if (this.minCheckedTests >= 0) {
            this.createCheckedItem(this.minCheckedTests);
            this.minCheckedTests--;
        }

        if ($(".verified-user").length > 0)
            this.checkedParentBlockHeight -= $(".verified-user").eq(0).outerHeight() + 1;
        else
            this.checkedParentBlockHeight = 0;

        this.changeCheckedParentBlockHeight();
        this.showCheckedMoreButton();
    }

    deletePassedItem(deleteType, workerId, infoBlockId) {
        this.setSecondPassedParentBlockHeight();

        if (typeof deleteType === "function")
            deleteType(this, workerId, infoBlockId, false)

        if (this.passedMax > 0)
            this.passedMax--;

        if (this.minPassedTests >= 0) {
            this.createPassedItem(this.minPassedTests);
            this.minPassedTests--;
        }

        if ($(".unverified-user").length > 0)
            this.passedParentBlockHeight -= $(".unverified-user").eq(0).outerHeight() + 1;
        else
            this.passedParentBlockHeight = 0;

        this.changePassedParentBlockeight();
        this.showPassedMoreButton();
        console.log($(".unverified-user").length )
    }

    addCheckedItem(workerId, infoBlockId, workerName, testName, workerScores, allScores) {
        this.setSecondCheckedParentBlockHeight();

        this.checkedInfo.push({
            allscores: allScores,
            infoblockid: infoBlockId,
            infoblockname: testName,
            status: 2,
            workerid: workerId,
            workername: workerName,
            workerscores: workerScores
        });

        this.createCheckedItem(this.checkedInfo.length - 1);
        $(".verified-user").last().prependTo($(".verified-users-block"));

        $("#none-verified-tests").hide();

        if (this.checkedSize <= $(".verified-user").length && $(".verified-user").length % 3 === 1 && this.checkedSize <= this.checkedInfo.length && this.checkedInfo.length !== 1) {
            this.checkedParentBlockHeight -= $(".verified-user").eq(0).outerHeight();
            this.minCheckedTests++;
            this.setCheckedMax();
            $(".verified-user").last().remove();
            $("#more-verified-users").css({
                display: "block",
                height: "53px",
                padding: "10px 0px",
                opacity: 0.5
            });
        }

        this.changeCheckedParentBlockHeight();
    }

    verifyItem(workerId, infoBlockId, workerName, testName, workerScores, allScores) {
        this.deletePassedItem(this.deleteItemByTestIdAndWorkerId, workerId, infoBlockId);
        this.addCheckedItem(workerId, infoBlockId, workerName, testName, workerScores, allScores);

        for (var i = 0; i < this.workersTests.length; i++) {
            for (var j = 0; j < this.workersTests[i].data.length; j++) {
                if (this.workersTests[i].data[j].infoblockid === infoBlockId) {
                    this.workersTests[i].data[j].status = 2;
                    this.workersTests[i].data[j].workerscores = workerScores;

                    if (j === 0)
                        this.changeLastWorkerTest(this.workersTests[i].workerId)
                }
            }
        }
    }

    getLastTestByWorkerId(workerId) {

        for (var i = 0; i < this.workersTests.length; i++) {
            if (workerId === this.workersTests[i].workerId)
                return this.workersTests[i].data[0];
        }

        var workerInfo = workers.getWorkerById(workerId);
        var workerName = workerInfo.ok ? workerInfo.data.name : "-";

        return {
            allscores: "-",
            infoblockid: "-",
            infoblockname: "-",
            status: "-",
            workerid: "-",
            workername: workerName,
            workerscores: "-"
        }
    }

    deleteAllByWorkerId(workerId) {

        for (var i = 0; i < this.passedInfo.length; i++) {
            if (this.passedInfo[i].workerid === workerId)
                this.deletePassedItem(null, workerId)
        }
        this.deleteItemByWorkerId(this, workerId, null, false);
        this.showPassedMoreButton();

        for (var i = 0; i < this.checkedInfo.length; i++) {
            if (this.checkedInfo[i].workerid === workerId)
                this.deleteCheckedItem(null, workerId);
        }
        this.deleteItemByWorkerId(this, workerId, null, true);
        this.showCheckedMoreButton();

        for (var i = 0; i < this.workersTests.length; i++)
            if (this.workersTests[i].workerId === workerId) {
                this.workersTests.splice(i, 1);
                break;
            }

    }

    deleteAllByTestId(infoBlockId) {

        for (var i = 0; i < this.passedInfo.length; i++) {
            if (this.passedInfo[i].infoblockid === infoBlockId)
                this.deletePassedItem(null, null, infoBlockId)
        }
        this.deleteItemByTestId(this, null, infoBlockId, false);
        this.showPassedMoreButton();

        for (var i = 0; i < this.checkedInfo.length; i++) {
            if (this.checkedInfo[i].infoblockid === infoBlockId)
                this.deleteCheckedItem(null, null, infoBlockId);
        }
        this.deleteItemByTestId(this, null, infoBlockId, true);
        this.showCheckedMoreButton();

        for (var i = 0; i < this.workersTests.length; i++) {
            var workerId = this.workersTests[i].workerId;
            for (var j = 0; j < this.workersTests[i].data.length; j++) {
                if (this.workersTests[i].data[j].infoblockid === infoBlockId) {
                    this.workersTests[i].data.splice(j, 1);
                    var bl = true;

                    if (this.workersTests[i].data.length === 0) {
                        this.workersTests.splice(i, 1);
                        bl = false;
                        i--;
                    }


                    if (j === 0 || this.workersTests[i].data.length === 0)
                        this.changeLastWorkerTest(workerId)

                        if (!bl)
                            break;

                }
            }
        }
    }

    changeLastWorkerTest(workerId) {
        var userInfo = this.getLastTestByWorkerId(workerId);

        var scores = "-", status = "-"

        if (userInfo.allscores !== "-" && userInfo.status === 2)
            scores = userInfo.workerscores + "/" + userInfo.allscores;

        if (userInfo.status === 2)
            status = "Проверено"
        else if (userInfo.status === 1)
            status = "Не проверено"

        for (var i = 0; i < $(".user-info").length; i++) {
            if (parseInt($(".user-info").eq(i).attr("worker-id")) === workerId) {
                $(".user-info").eq(i).find(".user-test").text(userInfo.infoblockname);
                $(".user-info").eq(i).find(".user-test").text(userInfo.infoblockname);
                $(".user-info").eq(i).find(".user-result").text(scores);
                $(".user-info").eq(i).find(".user-status").text(status);

                if (userInfo.status === 1)
                    $(".user-info").eq(i).find(".user-status").addClass("blue-text");
                else
                    $(".user-info").eq(i).find(".user-status").removeClass("blue-text");
            }
        }
    }

}