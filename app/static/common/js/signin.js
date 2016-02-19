function registerSigninBtn() {
    $("#signin-submit-btn").click(function (event) {
        var un = $("#inputUsername").val();
        var pwd = $("#inputPassword").val();
        var basicAuthorization = btoa(un + ':' + pwd);
        event.preventDefault();
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/authenticate",
            headers: {
                "Authorization": "Basic " + basicAuthorization
            },
            dataType: 'json',
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    alert("sign in success!");
                    window.location.href = "/";
                    // TODO: let's save pwd in cookies and get it run first
                    Cookies.set("un", un);
                    Cookies.set("pwd", pwd);
                }
            }
        })
    });
}
