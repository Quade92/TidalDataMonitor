function TimeAxis(svg) {
    var self = this;
    self.parent_svg = svg;
    self.date_set = [];
    self.scale = d3.time.scale()
        .range([0, self.parent_svg.node().getBoundingClientRect().width - 60]);
    self.axis_group = d3.select(".svg-root-g")
        .append("g")
        .attr("class", "timeaxis-g")
        .attr("transform", "translate(30, 470)");
    self.axis = d3.svg.axis()
        .scale(self.scale)
        .orient("bottom")
        .ticks(5)
        .tickFormat(d3.time.format("%H:%M:%S"));
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
        .range([0, self.parent_svg.node().getBoundingClientRect().height - 60])
        .nice();
    self.axis_group = d3.select(".svg-root-g")
        .append("g")
        .attr("class", "yaxis-g")
        .attr("transform", "translate(30, 30)");
    self.axis = d3.svg.axis()
        .scale(self.scale)
        .orient("left");
    self.update_value_set = function (value_set) {
        self.value_set = value_set;
        self.scale.domain([
            d3.max(self.value_set, function (d) {
                return d;
            }) * 1.1,
            d3.min(self.value_set, function (d) {
                return d;
            }) * 0.9
        ]);
        self.axis_group.transition()
            .duration(500)
            .call(self.axis);
    };
    self.update_latest_value = function (latest_value) {
        self.value_set.unshift(latest_value);
        self.value_set.pop();
        self.scale.domain([
            d3.max(self.value_set, function (d) {
                return d;
            }) * 1.1,
            d3.min(self.value_set, function (d) {
                return d;
            }) * 0.9
        ]);
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
        .attr("transform", "translate(30, 30)");
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
                    .attr("transform", "translate(30, 30)")
                    .append("rect")
                    .attr("class", "rect-cursor")
                    .attr("width", 220)
                    .attr("height", 50)
                    .attr("rx", 15)
                    .attr("ry", 15)
                    .attr("x", self.timescale(d.date) + 10)
                    .attr("y", self.yscale(d.value) - 20);
                d3.select(".rect-cursor-g").append("text")
                    .attr("class", "text-cursor")
                    .attr("x", self.timescale(d.date))
                    .attr("y", self.yscale(d.value))
                    .append("tspan")
                    .attr("x", self.timescale(d.date) + 20)
                    .attr("dy", 0)
                    .text("时间: " + d.date.toLocaleString())
                    .append("tspan")
                    .attr("x", self.timescale(d.date) + 20)
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

function LiveLinegraph() {
    var self = this;
    self.w = d3.select("#graph-div").node().getBoundingClientRect().width;
    self.h = 500;
    self.svg = d3.select("#graph-div")
        .append("svg")
        .attr("width", self.w)
        .attr("height", self.h)
        .attr("class", "history-graph-svg");
    self.svg_group = self.svg.append("g")
        .attr("class", "svg-root-g");
    self.svg_group.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", -2)// circle-cursor's radius is 1.5
        .attr("width", self.w - 60)
        .attr("height", self.h - 60);
    self.svg_group.append("rect")
        .attr("class", "rect-zoom-pan")
        .attr("x", 30)
        .attr("y", 30)
        .attr("width", self.w - 60)
        .attr("height", self.h - 60);
    self.timeaxis = new TimeAxis(self.svg);
    self.yaxis = new YAxis(self.svg);
    self.linepaths = new LinePaths(self.svg);
    self.data_set = [];
    self.timespan = 100;
    self.w = 1000;
    self.h = 500;
    self.init = function () {
        self.get_latest_data();
    };

    self.update_latest_record = function () {
        var basic_auth = btoa(Cookies.get("un") + ":" + Cookies.get("pwd"));
        $.ajax({
                type: "GET",
                url: "http://localhost:5000/latest-record",
                headers: {
                    "Authorization": "Basic " + basic_auth
                },
                dataType: "json",
                complete: function (resp) {
                    if (resp["responseJSON"]["err"] == "False") {
                        var latest_record = resp["responseJSON"]["result"];
                        if (latest_record.timestamp != self.data_set[0].timestamp) {
                            var latest_date = new Date(latest_record.timestamp);
                            var latest_value = latest_record.sensors.AN1.value;
                            var latest_json = {
                                date: latest_date,
                                value: latest_value
                            };
                            self.data_set.unshift(latest_record);
                            self.data_set.pop();
                            self.timeaxis.update_latest_date(latest_date);
                            self.yaxis.update_latest_value(latest_value);
                            self.linepaths.update_latest_json(latest_json, self.timeaxis.scale, self.yaxis.scale);
                        }
                    }
                }
            }
        );
    };

    self.get_latest_data = function () {
        var basic_auth = btoa(Cookies.get("un") + ":" + Cookies.get("pwd"));
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/latest-record-set/" + self.timespan,
            headers: {
                "Authorization": "Basic " + basic_auth
            },
            dataType: "json",
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    self.data_set = data["responseJSON"]["result"];
                    var labelsd = {};
                    for (var i in self.data_set[0].sensors) {
                        labelsd[i] = self.data_set[0].sensors[i].label;
                    }
                    self.init_control(labelsd);
                    self.update_table();
                    var date_set = self.data_set.map(function (d) {
                        return new Date(d.timestamp);
                    });
                    var value_set = self.data_set.map(function (d) {
                        return d.sensors["AN1"].value;
                    });
                    var path_data_set = self.data_set.map(function (d) {
                        var json = {};
                        json.date = new Date(d.timestamp);
                        json.value = d.sensors["AN1"].value;
                        return json;
                    });
                    self.timeaxis.update_date_set(date_set);
                    self.yaxis.update_value_set(value_set);
                    self.linepaths.update_data_set(path_data_set, self.timeaxis.scale, self.yaxis.scale);
                }
            }
        });
    };
    self.init_control = function (labelsd) {
        var labels = $.map(labelsd, function (ele, key) {
            return key;
        });
        d3.select("#channel-dropdown-button")
            .html("通道" + labelsd.AN1 + "<span class='caret'></span>");
        d3.select("#channel-dropdown-menu")
            .selectAll("li")
            .data(labels)
            .enter()
            .append("li")
            .html(function (d) {
                return "<a>通道" + labelsd[d] + "</a>";
            });
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
        for (var chNO = 1; chNO != 9; chNO++) {
            hrow.append("th")
                .attr("class", "text-left")
                .html(self.data_set[0].sensors["AN" + chNO].label);
            tr.append("td")
                .attr("class", "text-left")
                .html(function (d) {
                    return d.sensors["AN" + chNO].value;
                });
        }
    };
}

function HistoryData() {
    var self = this;
    self.w = d3.select("#graph-div").node().getBoundingClientRect().width;
    self.h = 500;
    self.svg = d3.select("#graph-div")
        .append("svg")
        .attr("width", self.w)
        .attr("height", self.h)
        .attr("class", "history-graph-svg");
    self.svg_group = self.svg.append("g")
        .attr("class", "svg-root-g");
    self.svg_group.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", -2)// circle-cursor's radius is 1.5
        .attr("width", self.w - 60)
        .attr("height", self.h - 60);
    self.svg_group.append("rect")
        .attr("class", "rect-zoom-pan")
        .attr("x", 30)
        .attr("y", 30)
        .attr("width", self.w - 60)
        .attr("height", self.h - 60);
    self.timeaxis = new TimeAxis(self.svg);
    self.yaxis = new YAxis(self.svg);
    self.linepaths = new LinePaths(self.svg);
    self.data_set = [];
    self.zoom = d3.behavior.zoom();
    self.init = function () {
        var basic_auth = btoa(Cookies.get("un") + ":" + Cookies.get("pwd"));
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/latest-record-set/600",
            headers: {
                "Authorization": "Basic " + basic_auth
            },
            dataType: "json",
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    self.data_set = data["responseJSON"]["result"];
                    var labelsd = {};
                    for (var i in self.data_set[0].sensors) {
                        labelsd[i] = self.data_set[0].sensors[i].label;
                    }
                    self.update_graph_components("AN1");
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
    self.update = function (channelstring, start_ts, end_ts) {
        var basic_auth = btoa(Cookies.get("un") + ":" + Cookies.get("pwd"));
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/record-series/" + start_ts + "/" + end_ts,
            headers: {
                "Authorization": "Basic " + basic_auth
            },
            dataType: "json",
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    self.data_set = data["responseJSON"]["result"];
                    var channelNO = null;
                    var channel = channelstring.substring(2, 11);
                    for (var i in self.data_set[0].sensors) {
                        if (self.data_set[0].sensors[i].label == channel) {
                            channelNO = i;
                        }
                    }
                    self.update_graph_components(channelNO);
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
            return d.sensors[chNO].value;
        });
        var path_data_set = self.data_set.map(function (d) {
            var json = {};
            json.date = new Date(d.timestamp);
            json.value = d.sensors[chNO].value;
            return json;
        });
        self.timeaxis.update_date_set(date_set);
        self.yaxis.update_value_set(value_set);
        self.linepaths.update_data_set(path_data_set, self.timeaxis.scale, self.yaxis.scale);
    };
    self.init_control = function (labelsd) {
        var labels = $.map(labelsd, function (ele, key) {
            return key;
        });
        d3.select("#channel-dropdown-button")
            .html("通道" + labelsd.AN1 + "<span class='caret'></span>");
        d3.select("#channel-dropdown-menu")
            .selectAll("li")
            .data(labels)
            .enter()
            .append("li")
            .html(function (d) {
                return "<a>通道" + labelsd[d] + "</a>";
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
        for (var chNO = 1; chNO != 9; chNO++) {
            hrow.append("th")
                .attr("class", "text-left")
                .html(self.data_set[0].sensors["AN" + chNO].label);
            tr.append("td")
                .attr("class", "text-left")
                .html(function (d) {
                    return d.sensors["AN" + chNO].value;
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

