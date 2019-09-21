$(document).ready(() => {

    let active = $(".active-mode-button");
    let noneActive = $(".none-active-mode-button");

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
            "opacity" : "0",
            "visibility" : "hidden"
        })
        $(".login-block").css({
            "margin-left" : "47%"
        })
        $(".company").css({
            "top" : "5vh"
        })
        active.on("click", function () {
            registerClick(active, noneActive);
        })
    }

    setTimeout(() => {
      $(".animate").css("transition", "0.7s");  
    }, 100)
    
    $(window).resize(function(){
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

});

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
        "top" : "5vh"
    })
    noneActive.off("click").on("click", function(){
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
        "top" : "75vh"
    })
    noneActive.off("click").on("click", function(){
        loginClick(noneActive, active)
    })
}