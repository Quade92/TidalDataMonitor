function TimeAxis(svg) {
    var self = this;
    self.parent_svg = svg;
    self.date_set = [];
    self.scale = d3.time.scale()
        .range([0, self.parent_svg.node().getBoundingClientRect().width - 80]);
    self.axis_group = d3.select(".svg-root-g")
        .append("g")
        .attr("class", "timeaxis-g")
        .attr("transform", "translate(50, 510)");
    self.axis = d3.svg.axis()
        .scale(self.scale)
        .orient("bottom")
        .ticks(5)
        .tickFormat(d3.time.format("%H:%M:%S"));
    self.axis_label = self.axis_group.append("text")
        .attr("class", "timeaxis label")
        .attr("text-anchor", "middle")
        .attr("x", $(".history-graph-svg")[0].getBoundingClientRect().width / 2)
        .attr("y", 35)
        .text("时间");
    self.update_date_set = function (date_set) {
        self.date_set = date_set;
        self.scale.domain([
            d3.min(self.date_set, function (d) {
                return d;
            }),
            d3.max(self.date_set, function (d) {
                return d;
            })
        ]);
        self.axis_group
            .call(self.axis);
    };
    self.update_latest_date = function (latest_date) {
        self.date_set.unshift(latest_date);
        self.date_set.pop();
        self.scale.domain([
            d3.min(self.date_set, function (d) {
                return d;
            }),
            d3.max(self.date_set, function (d) {
                return d;
            })
        ]);
        self.axis_group
            .call(self.axis);
    };
}

function YAxis(svg) {
    var self = this;
    self.parent_svg = svg;
    self.value_set = [];
    self.scale = d3.scale.linear()
        .range([10, self.parent_svg.node().getBoundingClientRect().height - 80])
        .nice();
    self.axis_group = d3.select(".svg-root-g")
        .append("g")
        .attr("class", "yaxis-g")
        .attr("transform", "translate(50, 40)");
    self.axis = d3.svg.axis()
        .scale(self.scale)
        .orient("left");
    self.axis_label = self.axis_group.append("text")
        .attr("class", "yaxis label")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", 0);
    self.update_label = function (str) {
        self.axis_label.text(str);
    };
    self.update_value_set = function (value_set) {
        self.value_set = value_set;
        // self.scale.domain([
        //     d3.max(self.value_set, function (d) {
        //         return d;
        //     }) + 0.1 * Math.abs(d3.max(self.value_set, function (d) {
        //         return d;
        //     })),
        //     d3.min(self.value_set, function (d) {
        //         return d;
        //     }) - 0.1 * Math.abs(d3.min(self.value_set, function (d) {
        //         return d;
        //     }))
        // ]);
        var min = d3.min(self.value_set, function (d) {
            return d;
        });
        var max = d3.max(self.value_set, function (d) {
            return d;
        });
        if (min == 0 && max == 0) {
            self.scale.domain([1, -1]);
        }
        else if (max < 0) {
            self.scale.domain([max, min])
        }
        else {
            self.scale.domain([1.1 * max, 0]);
        }
        self.axis_group.transition()
            .duration(500)
            .call(self.axis);

    };
    self.update_latest_value = function (latest_value) {
        self.value_set.unshift(latest_value);
        self.value_set.pop();
        var min = d3.min(self.value_set, function (d) {
            return d;
        });
        var max = d3.max(self.value_set, function (d) {
            return d;
        });
        if (min == 0 && max == 0) {
            self.scale.domain([1, -1]);
        }
        else if (max < 0) {
            self.scale.domain([max, min])
        }
        else {
            self.scale.domain([1.1 * max, 0]);
        }
        // self.scale.domain([
        // d3.min(self.value_set, function (d) {
        //     return d;
        // }) - 0.1 * Math.abs(d3.min(self.value_set, function (d) {
        //     return d;
        // }))
        // ]);
        self.axis_group.transition()
            .duration(500)
            .call(self.axis);
    };
}

function LinePaths(svg) {
    var self = this;
    self.parent_svg = svg;
    self.timescale = null;
    self.yscale = null;
    self.data_set = [];
    self.cursors = null;
    self.linefunction = d3.svg.line()
        .x(function (d) {
            return self.timescale(d.date);
        })
        .y(function (d) {
            return self.yscale(d.value);
        })
        .interpolate("linear");
    self.linepaths_group = d3.select(".svg-root-g")
        .append("g")
        .attr("class", "linepaths-g")
        .attr("clip-path", "url(#clip)")
        .attr("transform", "translate(50, 30)");
    self.paths = self.linepaths_group.append("path")
        .attr("class", "datapath");
    self.update_circle_cursors = function () {
        d3.selectAll("circle.circle-cursor").remove();
        self.cursors = d3.select(".linepaths-g")
            .selectAll("circle")
            .data(self.data_set)
            .enter()
            .append("circle")
            .attr("class", "circle-cursor")
            .attr("cx", function (d) {
                return self.timescale(d.date);
            })
            .attr("cy", function (d) {
                return self.yscale(d.value);
            })
            .attr("r", "3")
            .on("mouseover", function (d) {
                d3.select(this)
                    .attr("fill", "red");
                self.parent_svg.append("g")
                    .attr("class", "rect-cursor-g")
                    .attr("transform", "translate(50, 30)")
                    .append("rect")
                    .attr("class", "rect-cursor")
                    .attr("width", 220)
                    .attr("height", 50)
                    .attr("rx", 15)
                    .attr("ry", 15)
                    .attr("x", function () {
                        if (self.timescale(d.date) > $(".history-graph-svg")[0].getBoundingClientRect().width / 5 * 3) {
                            return self.timescale(d.date) - 230;
                        }
                        else {
                            return self.timescale(d.date) + 10;
                        }
                    })
                    .attr("y", self.yscale(d.value) - 20);
                d3.select(".rect-cursor-g").append("text")
                    .attr("class", "text-cursor")
                    .attr("x", function () {
                        if (self.timescale(d.date) > $(".history-graph-svg")[0].getBoundingClientRect().width / 5 * 3) {
                            return self.timescale(d.date) - 230;
                        }
                        else {
                            return self.timescale(d.date) + 20;
                        }
                    })
                    .attr("y", self.yscale(d.value))
                    .append("tspan")
                    .attr("x", function () {
                        if (self.timescale(d.date) > $(".history-graph-svg")[0].getBoundingClientRect().width / 5 * 3) {
                            return self.timescale(d.date) - 220;
                        }
                        else {
                            return self.timescale(d.date) + 20;
                        }
                    })
                    .attr("dy", 0)
                    .text("时间: " + d.date.toLocaleString())
                    .append("tspan")
                    .attr("x", function () {
                        if (self.timescale(d.date) > $(".history-graph-svg")[0].getBoundingClientRect().width / 5 * 3) {
                            return self.timescale(d.date) - 220;
                        }
                        else {
                            return self.timescale(d.date) + 20;
                        }
                    })
                    .attr("dy", 20)
                    .text("数值: " + d.value);
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .attr("fill", "blue");
                d3.selectAll(".text-cursor")
                    .remove();
                d3.select(".rect-cursor-g")
                    .remove();
            });
    };
    self.update_data_set = function (data_set, timescale, yscale) {
        self.data_set = data_set;
        self.timescale = timescale;
        self.yscale = yscale;
        self.update_circle_cursors();
        self.paths.attr("d", self.linefunction(self.data_set));
    };
    self.update_latest_json = function (json, timescale, yscale) {
        self.data_set.unshift(json);
        self.data_set.pop();
        self.timescale = timescale;
        self.yscale = yscale;
        self.cursors.data(self.data_set)
            .attr("cx", function (d) {
                return self.timescale(d.date);
            })
            .attr("cy", function (d) {
                return self.yscale(d.value);
            });
        self.paths
            .attr("d", self.linefunction(self.data_set));
    };
}

function LiveLinegraph(graph_div) {
    var self = this;
    self.graph_div = d3.select(graph_div);
    self.w = self.graph_div.node().getBoundingClientRect().width;
    self.h = 550;
    self.svg = self.graph_div
        .append("svg")
        .attr("width", self.w - 20)
        .attr("height", self.h)
        .attr("class", "history-graph-svg");
    self.svg_group = self.svg.append("g")
        .attr("class", "svg-root-g");
    self.svg_group.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", -2)// circle-cursor's radius is 1.5
        .attr("width", self.w - 80)
        .attr("height", self.h - 60);
    self.svg_group.append("rect")
        .attr("class", "rect-zoom-pan")
        .attr("x", 30)
        .attr("y", 30)
        .attr("width", self.w - 80)
        .attr("height", self.h - 60);
    self.timeaxis = new TimeAxis(self.svg);
    self.yaxis = new YAxis(self.svg);
    self.linepaths = new LinePaths(self.svg);
    self.data_set = [];
    self.timespan = 100;
    self.w = 1000;
    self.h = 500;
    self.chNO = null;
    self.update_latest_record = function () {
        $.ajax({
                type: "GET",
                url: "http://123.56.80.4:5000/latest-record",
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token")
                },
                dataType: "json",
                complete: function (resp) {
                    if (resp["responseJSON"]["err"] == "False") {
                        var latest_record = resp["responseJSON"]["result"];
                        var chNO = $("#gen-A-channel-selection").find(">button")[0].childNodes[0].nodeValue;
                        chNO = chNO.indexOf("CH") == -1 ? "CH1" : chNO.split("：")[0].substring(2);
                        d3.select("#gen-A-rtd-label").html(
                            latest_record["channel"][chNO]["value"].toFixed(2) + latest_record["channel"][chNO]["unit"]
                        ).style("font-size", "30px");
                        if (latest_record.timestamp != self.data_set[0].timestamp) {
                            var labelsd = {};
                            for (var i in self.data_set[0].channel) {
                                labelsd[i] = self.data_set[0].channel[i].label;
                            }
                            var unitsd = {};
                            for (var j in self.data_set[0].channel) {
                                unitsd[j] = self.data_set[0].channel[j].unit;
                            }
                            self.yaxis.update_label(labelsd[self.chNO] + " / " + unitsd[self.chNO]);
                            var latest_date = new Date(latest_record.timestamp);
                            var latest_value = latest_record.channel[self.chNO].value;
                            var latest_json = {
                                date: latest_date,
                                value: latest_value
                            };
                            self.data_set.unshift(latest_record);
                            self.data_set.pop();
                            self.update_table("#table-div");
                            self.timeaxis.update_latest_date(latest_date);
                            self.yaxis.update_latest_value(latest_value);
                            self.linepaths.update_latest_json(latest_json, self.timeaxis.scale, self.yaxis.scale);
                        }
                    }
                }
            }
        );
    };

    self.get_latest_data = function (channel_selector) {
        $.ajax({
            type: "GET",
            url: "http://123.56.80.4:5000/latest-record-set/" + self.timespan,
            headers: {
                "Authorization": "Bearer " + Cookies.get("token")
            },
            dataType: "json",
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    self.data_set = data["responseJSON"]["result"];
                    var labelsd = {};
                    // var chNO = $("#gen-A-channel-dropdown-button:first-child")[0].childNodes[0].nodeValue;
                    var chNO = $(channel_selector + ">button")[0].childNodes[0].nodeValue;
                    self.chNO = chNO.indexOf("CH") == -1 ? "CH1" : chNO.split("：")[0].substring(2);
                    for (var i in self.data_set[0].channel) {
                        labelsd[i] = self.data_set[0].channel[i].label;
                    }
                    self.yaxis.update_label(labelsd[self.chNO]);
                    self.init_control(labelsd, self.chNO, "#gen-A-channel-selection");
                    self.update_table("#table-div");
                    var date_set = self.data_set.map(function (d) {
                        return new Date(d.timestamp);
                    });
                    var value_set = self.data_set.map(function (d) {
                        return d.channel[self.chNO].value;
                    });
                    var path_data_set = self.data_set.map(function (d) {
                        var json = {};
                        json.date = new Date(d.timestamp);
                        json.value = d.channel[self.chNO].value;
                        return json;
                    });
                    self.timeaxis.update_date_set(date_set);
                    self.yaxis.update_value_set(value_set);
                    self.linepaths.update_data_set(path_data_set, self.timeaxis.scale, self.yaxis.scale);
                }
            }
        });
    };
    self.init_control = function (labelsd, chNO, channel_selector) {
        chNO = typeof chNO !== "undefined" ? chNO : "CH1";
        var labels = $.map(labelsd, function (ele, key) {
            return key;
        });
        // d3.select("#gen-A-channel-dropdown-button")
        d3.select(channel_selector + ">button")
            .html("通道" + chNO + "：" + labelsd[chNO] + "<span class='caret'></span>");
        // d3.select("#gen-A-channel-dropdown-menu")
        d3.select(channel_selector + ">ul")
            .selectAll("li")
            .data(labels)
            .enter()
            .append("li")
            .html(function (d) {
                return "<a>通道" + d + "：" + labelsd[d] + "</a>";
            });
    };
    self.update_table = function (table_div) {
        d3.select(table_div).select("table").remove();
        var table = d3.select(table_div)
            .append("table")
            .attr("class", "table table-bordered table-condensed");
        var hrow = table.append("thead")
            .append("tr");
        var tr = table.append("tbody")
            .selectAll("tr")
            .data(self.data_set)
            .enter()
            .append("tr");
        hrow.append("th")
            .attr("class", "text-left")
            .html("日期时间");
        tr.append("td")
            .attr("class", "text-left")
            .html(function (d) {
                var date = new Date(d.timestamp);
                return date.toLocaleString("zh-CN", {hour12: false});
            });
        var chNOArr = ["CH1","CH5","CH2","CH6","CH7","CH3","CH8","CH4","CH9","CH10","CH11"]
        for (var i = 0; i != chNOArr.length; i++) {
            hrow.append("th")
                .attr("class", "text-left")
                .html(self.data_set[0].channel[chNOArr[i]].label);
//                .html(self.data_set[0].channel["CH" + chNO].label);
            tr.append("td")
                .attr("class", "text-left")
                .html(function (d) {
                    return parseFloat(d.channel[chNOArr[i]].value).toFixed(2);
//                    return parseFloat(d.channel["CH" + chNO].value).toFixed(2);
                });
        }
    };
}

function HistoryData() {
    var self = this;
    self.w = d3.select("#gen-A-graph-div").node().getBoundingClientRect().width;
    self.h = 550;
    self.svg = d3.select("#gen-A-graph-div")
        .append("svg")
        .attr("width", self.w - 20)
        .attr("height", self.h)
        .attr("class", "history-graph-svg");
    self.svg_group = self.svg.append("g")
        .attr("class", "svg-root-g");
    self.svg_group.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", -2)// circle-cursor's radius is 1.5
        .attr("width", self.w - 80)
        .attr("height", self.h - 60);
    self.svg_group.append("rect")
        .attr("class", "rect-zoom-pan")
        .attr("x", 30)
        .attr("y", 30)
        .attr("width", self.w - 80)
        .attr("height", self.h - 60);
    self.timeaxis = new TimeAxis(self.svg);
    self.yaxis = new YAxis(self.svg);
    self.linepaths = new LinePaths(self.svg);
    self.data_set = [];
    self.zoom = d3.behavior.zoom();
    self.data_span = 600;
    self.init = function () {
        $.ajax({
            type: "GET",
            url: "http://123.56.80.4:5000/latest-record-set/600",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + Cookies.get("token")
            },
            dataType: "json",
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    self.data_set = data["responseJSON"]["result"];
                    var labelsd = {};
                    for (var i in self.data_set[0].channel) {
                        labelsd[i] = self.data_set[0].channel[i].label;
                    }
                    var unitsd = {};
                    for (var j in self.data_set[0].channel) {
                        unitsd[j] = self.data_set[0].channel[j].unit;
                    }
                    self.yaxis.update_label(labelsd["CH1"] + " / " + unitsd["CH1"]);
                    self.update_graph_components("CH1");
                    self.update_table();
                    self.init_control(labelsd);
                    self.zoom
                        .x(self.timeaxis.scale)
                        .scaleExtent([1, 5])
                        .on("zoom", self.zoomed);
                    d3.select(".rect-zoom-pan").call(self.zoom);
                }
            }
        })
    };
    self.update = function (chNo, start_ts, end_ts) {
        $.ajax({
            type: "GET",
            url: "http://123.56.80.4:5000/record-series/" + start_ts + "/" + end_ts,
            headers: {
                "Authorization": "Bearer " + Cookies.get("token")
            },
            dataType: "json",
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    if (data["responseJSON"]["result"].length > 600) {
                        self.data_set = data["responseJSON"]["result"].filter(function (e, i, arr) {
                            return i % Math.floor(arr.length / 600) == 0;
                        });
                    }
                    else {
                        self.data_set = data["responseJSON"]["result"];
                    }
                    //var labelsd = {};
                    //for (var i in self.data_set[0].channel) {
                    //    labelsd[i] = self.data_set[0].channel[i].label;
                    //}
                    //self.yaxis.update_label(labelsd[chNo]);
                    var labelsd = {};
                    for (var i in self.data_set[0].channel) {
                        labelsd[i] = self.data_set[0].channel[i].label;
                    }
                    var unitsd = {};
                    for (var j in self.data_set[0].channel) {
                        unitsd[j] = self.data_set[0].channel[j].unit;
                    }
                    self.yaxis.update_label(labelsd[chNo] + " / " + unitsd[chNo]);
                    self.update_graph_components(chNo);
                    self.update_table();
                }
            }
        })
    };
    self.update_graph_components = function (chNO) {
        var date_set = self.data_set.map(function (d) {
            return new Date(d.timestamp);
        });
        var value_set = self.data_set.map(function (d) {
            return d.channel[chNO].value;
        });
        var path_data_set = self.data_set.map(function (d) {
            var json = {};
            json.date = new Date(d.timestamp);
            json.value = d.channel[chNO].value;
            return json;
        });
        self.timeaxis.update_date_set(date_set);
        self.yaxis.update_value_set(value_set);
        self.linepaths.update_data_set(path_data_set, self.timeaxis.scale, self.yaxis.scale);
        self.zoom
            .x(self.timeaxis.scale)
            .scaleExtent([1, 5])
            .on("zoom", self.zoomed);
    };
    self.init_control = function (labelsd) {
        var labels = $.map(labelsd, function (ele, key) {
            return key;
        });
        d3.select("#gen-A-channel-dropdown-button")
            .html("通道CH1：" + labelsd.CH1 + "<span class='caret'></span>");
        d3.select("#gen-A-channel-dropdown-menu")
            .selectAll("li")
            .data(labels)
            .enter()
            .append("li")
            .html(function (d) {
                return "<a>通道" + d + "：" + labelsd[d] + "</a>";
            });
        var date_set = self.data_set.map(function (d) {
            return new Date(d.timestamp);
        });
        $('#startdtpicker').data("DateTimePicker").date(d3.min(date_set));
        $("#enddtpicker").data("DateTimePicker").date(d3.max(date_set));
    };
    self.update_table = function () {
        d3.select("#table-div").select("table").remove();
        var table = d3.select("#table-div")
            .append("table")
            .attr("class", "table table-bordered table-condensed");
        var hrow = table.append("thead")
            .append("tr");
        var tr = table.append("tbody")
            .selectAll("tr")
            .data(self.data_set)
            .enter()
            .append("tr");
        hrow.append("th")
            .attr("class", "text-left")
            .html("日期时间");
        tr.append("td")
            .attr("class", "text-left")
            .html(function (d) {
                var date = new Date(d.timestamp);
                return date.toLocaleString("zh-CN", {hour12: false});
            });
        for (var chNO = 1; chNO != 12; chNO++) {
            hrow.append("th")
                .attr("class", "text-left")
                .html(self.data_set[0].channel["CH" + chNO].label);
            tr.append("td")
                .attr("class", "text-left")
                .html(function (d) {
                    return parseFloat(d.channel["CH" + chNO].value).toFixed(2);
                });
        }
    };
    self.zoomed = function () {
        self.timeaxis.axis_group.call(self.timeaxis.axis);
        self.linepaths.timescale = self.timeaxis.scale;
        self.linepaths.linefunction.x(function (d) {
            return self.linepaths.timescale(d.date);
        });
        self.linepaths.paths.attr("d", self.linepaths.linefunction(self.linepaths.data_set));
        self.linepaths.cursors.data(self.linepaths.data_set)
            .attr("cx", function (d) {
                return self.linepaths.timescale(d.date);
            })
            .attr("cy", function (d) {
                return self.linepaths.yscale(d.value);
            });
    }
}

