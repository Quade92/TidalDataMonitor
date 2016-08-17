function register_signin_btn() {
    $("#signin-submit-btn").click(function (event) {
        var un = $("#inputUsername").val();
        var pwd = $("#inputPassword").val();
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "http://123.56.80.4:5000/authenticate",
            headers: {
                "Content-Type": "application/json"
            },
            dataType: 'json',
            data: JSON.stringify({
                "un": un,
                "pwd": pwd
            }),
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    alert("登录成功!");
                    window.location.href = "/";
                    Cookies.set("un", data.responseJSON.result.un);
                    Cookies.set("token", data.responseJSON.result.token);
                }
                else {
                    alert("登录失败!");
                    window.location.href = "/"
                }
            }
        });
    });
}

function register_datetime_btn() {
    $("#datetime-btn").click(function (event) {
        var start_ts = $('#startdtpicker').data("DateTimePicker").date().unix() * 1000;
        var end_ts = $("#enddtpicker").data("DateTimePicker").date().unix() * 1000;
        var chNo = $("#gen-A-channel-dropdown-button:first-child")[0].childNodes[0].nodeValue.split("：")[0].substring(2);
        event.preventDefault();
        graph.update(chNo, start_ts, end_ts);
    });
}

function register_channel_btn() {
    $("#channel-btn").click(function (event) {
        livegraph.chNO = $("#gen-A-channel-dropdown-button:first-child")[0].childNodes[0].nodeValue.split("：")[0].substring(2);
        livegraph.get_latest_data("#gen-A-channel-selection");
    });
}

function register_download_csv_btn() {
    $("#download-csv-btn").click(function (event) {
        var start_ts = $('#startdtpicker').data("DateTimePicker").date().unix() * 1000;
        var end_ts = $("#enddtpicker").data("DateTimePicker").date().unix() * 1000;
        $.ajax({
            type: "GET",
            url: "http://123.56.80.4:5000/history-csv/" + start_ts + "/" + end_ts,
            headers: {
                "Authorization": "Bearer " + Cookies.get("token")
            },
            xhr: function(){
                var xhr = $.ajaxSettings.xhr() ;
                xhr.onprogress = function(evt){
                    var percentComplete = (evt.loaded / evt.total)*100;
                    $('#progressbar').attr("aria-valuenow", percentComplete);
                    $('#progressbar').attr("style", "width: "+percentComplete+"%");
                };
                xhr.onreadystatechange = function(evt){
                    if (xhr.readyState==1){
                        $("#progressbar-div").attr("class", "row monitor-row");
                    }
                }
                return xhr ;
            },
            complete: function (data) {
                if (data["status"] == "200") {
                    $("#progressbar-div").attr("class", "row monitor-row sr-only");
                    alert("下载成功!");
                    csvData = new Blob([data.responseText], { type: 'text/csv' });
                    var csvUrl = URL.createObjectURL(csvData);
                    var a = document.createElement('a');
                    a.href =  csvUrl;
                    a.target = '_blank';
                    a.download = 'myFile.csv';
                    document.body.appendChild(a);
                    a.click();
                }
                else {
                    alert("下载失败!");
                }
            }
        });
    });
}