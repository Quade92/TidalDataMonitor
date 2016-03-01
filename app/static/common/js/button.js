function register_signin_btn() {
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
        });
    });
}

function register_datetime_btn() {
    $("#datetime-btn").click(function (event) {
        var start_ts = $('#startdtpicker').data("DateTimePicker").date().unix() * 1000;
        var end_ts = $("#enddtpicker").data("DateTimePicker").date().unix() * 1000;
        var channelstr = $("#channel-dropdown-button:first-child")[0].childNodes[0].nodeValue;
        event.preventDefault();
        graph.update(channelstr, start_ts, end_ts);
    });
}