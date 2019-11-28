$(document).ready(async () => {

    let active = $(".active-mode-button");
    let noneActive = $(".none-active-mode-button");
    let visiblePassword = false;

    $("#login-button").on("click", function () { login() })
    $("#register-button").on("click", function () { registerCompany() })

    $("#organisation-name").on("keyup", function () { checkFullInput($("#organisation-name")) })
    $("#organisation-city").on("keyup", function () { checkFullInput($("#organisation-city")) })
    $("#mail").on("blur", function () {
        if ($(this).val() !== "") {
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            var address = $(this).val();
            if (reg.test(address) == false) {
                $(this).siblings(".help-image")
                    .css("background-image", "url(./img/Error-input.png)")
                    .removeClass("help");
                $(this).siblings(".help-info")
                    .css("color", "#FE3E45")
                    .text("Неверный формат почты");
                $(this).removeClass("isFull");
            }
            else {
                $(this).siblings(".help-image")
                    .css("background-image", "url(./img/Successful-input.png)")
                    .removeClass("help more-info");
                $(this).addClass("isFull")
            }
        }
        else $(this).removeClass("isFull");
    }).on("keyup", function () {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        var address = $(this).val();
        if (reg.test(address) == true) {
            $(this).siblings(".help-image")
                .css("background-image", "url(./img/Successful-input.png)")
                .removeClass("help more-info");
            $(this).addClass("isFull")
        }
        else {
            $(this).siblings(".help-image")
                .addClass("help more-info")
                .css("background-image", "url(./img/MoreInfo.png)");
            $(this).siblings(".help-info")
                .css("color", "#FFB920")
                .text("По почте мы можем восстановить логин и пароль");
            $(this).removeClass("isFull");
        }

    })

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
    }).on("blur", function () {
        if ($(this).val() !== "") {
            if ($(this).val().length < 5) {
                $(this).siblings(".help-image")
                    .css("background-image", "url(./img/Error-input.png)")
                    .removeClass("help");
                $(this).siblings(".help-info")
                    .css("color", "#FE3E45")
                $(this).removeClass("isFull");
                if ($(this).attr("id") === "login-input")
                    $(this).siblings(".help-info").text("Логин должен содержать не менее 5 символов");
                else
                    $(this).siblings(".help-info").text("Пароль должен содержать не менее 5 символов");
            }
            else {
                $(this).siblings(".help-image")
                    .css("background-image", "url(./img/Successful-input.png)")
                    .removeClass("help more-info");
                $(this).addClass("isFull");
            }
        }
        else $(this).removeClass("isFull");

    }).on("keyup", function () {
        if ($(this).val().length >= 5) {
            $(this).siblings(".help-image")
                .css("background-image", "url(./img/Successful-input.png)")
                .removeClass("help more-info");
            $(this).addClass("isFull");
        }
        else {
            $(this).siblings(".help-image")
                .addClass("help more-info")
                .css("background-image", "url(./img/MoreInfo.png)");
            $(this).siblings(".help-info")
                .css("color", "#FFB920")
                .text("Подсказка, по правилам UI");
            $(this).removeClass("isFull");
        }

    });

    $("#organisation-name, #organisation-city, #mail, #login-input, #password-input").on("blur", function () {
        checkFullform()
    }).on("keyup", function () {
        checkFullform()
    })

    $(".password").on("click", function () {
        if (visiblePassword) {
            $(this).siblings("#password-input").attr("type", "password");
            $(this).css("opacity", "0.5");
        }
        else {
            $(this).siblings("#password-input").attr("type", "text");
            $(this).css("opacity", "1");
        }
        visiblePassword = !visiblePassword;
    })

    if (active.text() === "Вход") {
        active.css({
            "left": $(".register-button .hidden-button").offset().left - 7,
            "top": $(".register-button .hidden-button").offset().top + 3
        })
        noneActive.css({
            "left": $("#help-mode-register").offset().left - 9,
            "top": $("#help-mode-register").offset().top + 3
        }).attr("disabled", "disabled");
        $(".login-button").css({
            "opacity": "0",
            "visibility": "hidden"
        })
        active.on("click", function () {
            loginClick(active, noneActive)
        })
    }
    else {
        active.css({
            "left": $(".login-button .hidden-button").offset().left - 7,
            "top": $(".login-button .hidden-button").offset().top + 3,
        })
        noneActive.css({
            "left": $("#help-mode-login").offset().left - 9,
            "top": $("#help-mode-login").offset().top + 3
        })
        $(".circle").css({
            "top": "10vh"
        })
        $(".register-block, .register-button").css({
            "opacity": "0",
            "visibility": "hidden"
        })
        $(".login-block").css({
            "margin-left": "47%"
        })
        $(".company").css({
            "top": "5vh"
        })
        active.on("click", function () {
            registerClick(active, noneActive);
        })
    }

    setTimeout(() => {
        $(".animate").css("transition", "0.7s");
    }, 100)

    $(window).resize(function () {
        if ($(".active-mode-button").text() === "Вход") {
            $(".active-mode-button").css({
                "left": $(".register-button .hidden-button").offset().left - 7,
                "top": $(".register-button .hidden-button").offset().top + 3
            })
            $(".none-active-mode-button").css({
                "left": $("#help-mode-register").offset().left - 9,
                "top": $("#help-mode-register").offset().top + 3
            })
        }
        else {
            $(".active-mode-button").css({
                "left": $(".login-button .hidden-button").offset().left - 7,
                "top": $(".login-button .hidden-button").offset().top + 3,
            })
            $(".none-active-mode-button").css({
                "left": $("#help-mode-login").offset().left - 9,
                "top": $("#help-mode-login").offset().top + 3
            })
        }
    })

    $(window).on("keyup", function (e) {
        if (e.keyCode === 13) {
            if ($(".register-block").css("visibility") === "visible" && $("#register-button").prop("disabled") === false)
                registerCompany();
            if ($(".register-block").css("visibility") === "hidden" && $("#login-button").prop("disabled") === false)
                login();    
        }
    })

});

async function registerCompany() {
    $(".preloader").css({
        "visibility": "visible",
        "opacity": "1"
    })
    $(".preloader-text").text("Регистрируем")
    let reg = await register($("#organisation-name").val(), $("#mail").val(), $("#password-input").val(), $("#organisation-city").val(), $("#login-input").val());

    if (reg.ok) {
        $(".preloader-text").text("Регистрация пройдена");
        setTimeout(() => $(location).attr("href", "./cabinet.html"), 1000);
    }
    else {
        setTimeout(() => $(".preloader").css({
            "visibility": "hidden",
            "opacity": "0"
        }), 1000)

        messages(reg)
    }

}

async function login() {
    $(".preloader").css({
        "visibility": "visible",
        "opacity": "1"
    })
    $(".preloader-text").text("Выполняется вход")
    let auth = await authorize($("#login-input").val(), $("#password-input").val());

    if (auth.ok) {
        setTimeout(() => $(location).attr("href", "./cabinet.html"), 1000);
    }
    else {
        setTimeout(() => $(".preloader").css({
            "visibility": "hidden",
            "opacity": "0"
        }), 1000)

        messages(auth)
    }

}

function messages(data) {
    switch (data.code) {
        case 1: setTimeout(() => showMessage("error-message", "Произошла ошибка на сервере"), 1150); break;
        case 2: setTimeout(() => showMessage("error-message", "Такой пользователь уже зарегистрирован"), 1150); break;
        case 3: setTimeout(() => showMessage("error-message", "Неверный логин или почта"), 1150); break;
        case 4: setTimeout(() => showMessage("error-message", "Неверный пароль"), 1150); break;
        default: setTimeout(() => showMessage("error-message", auth.message), 1150); break;
    }
}

function checkFullform() {
    if ($("#organisation-name").hasClass("isFull") && $("#organisation-city").hasClass("isFull")
        && $("#mail").hasClass("isFull") && $("#password-input").hasClass("isFull"))
        $("#register-button").removeAttr("disabled")
    else
        $("#register-button").attr("disabled", "disabled")

    if ($("#login-input").hasClass("isFull") && $("#password-input").hasClass("isFull"))
        $("#login-button").removeAttr("disabled")
    else
        $("#login-button").attr("disabled", "disabled")

}

function checkFullInput(input) {
    if ($(input).val() === "") {
        $(input).siblings(".help-image")
            .addClass("help more-info")
            .css("background-image", "url(./img/MoreInfo.png)");
        $(input).removeClass("isFull")
    }
    else {
        $(input).siblings(".help-image")
            .removeClass("help more-info")
            .css("background-image", "url(./img/Successful-input.png)");
        $(input).addClass("isFull")
    }
    $(input).siblings("help-info").css("color", "#FFB920");
}

function loginClick(active, noneActive) {
    active.addClass("none-active-mode-button")
        .removeClass("active-mode-button");
    noneActive.addClass("active-mode-button")
        .removeClass("none-active-mode-button");
    noneActive.css({
        "left": $(".login-button .hidden-button").offset().left - 7,
        "top": $(".login-button .hidden-button").offset().top + 3,
    }).removeAttr("disabled")
    active.css({
        "left": $("#help-mode-login").offset().left - 9,
        "top": $("#help-mode-login").offset().top + 3
    }).attr("disabled", "disabled")
    $(".register-button, .register-block").css({
        "opacity": "0",
        "visibility": "hidden"
    })
    $(".login-button").css({
        "opacity": "1",
        "visibility": "visible"
    })
    $(".login-block").css({
        "margin-left": "47%"
    })
    $(".circle").css({
        "top": "10vh"
    })
    $(".company").css({
        "top": "5vh"
    })
    noneActive.off("click").on("click", function () {
        registerClick(noneActive, active)
    })
}

function registerClick(active, noneActive) {
    active.addClass("none-active-mode-button")
        .removeClass("active-mode-button");
    noneActive.addClass("active-mode-button")
        .removeClass("none-active-mode-button");
    noneActive.css({
        "left": $(".register-button .hidden-button").offset().left - 7,
        "top": $(".register-button .hidden-button").offset().top + 3,
    }).removeAttr("disabled")
    active.css({
        "left": $("#help-mode-register").offset().left - 9,
        "top": $("#help-mode-register").offset().top + 3
    }).attr("disabled", "disabled")
    $(".register-button, .register-block").css({
        "opacity": "1",
        "visibility": "visible"
    })
    $(".login-button").css({
        "opacity": "0",
        "visibility": "hidden"
    })
    $(".login-block").css({
        "margin-left": "0"
    })
    $(".circle").css({
        "top": "-80vh"
    })
    $(".company").css({
        "top": "75vh"
    })
    noneActive.off("click").on("click", function () {
        loginClick(noneActive, active)
    })
}