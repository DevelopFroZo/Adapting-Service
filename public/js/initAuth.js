if (cookie.get("token") === null || cookie.get("token") === "" || cookie.get("token") === false)
    $(location).attr("href", "./login.html");