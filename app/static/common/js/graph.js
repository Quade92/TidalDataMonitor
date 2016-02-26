function TimeAxis(svg) {
    var self = this;
    self.parent_svg = svg;
    self.date_set = [];
    self.scale = null;
    self.axis_group = null;
    self.axis = null;
    self.init = function (data_set) {
        self.date_set = data_set.map(function (d) {
            return new Date(d.timestamp);
        });
        self.scale = d3.time.scale()
            .domain([
                d3.min(self.date_set, function (d) {
                    return d;
                }),
                d3.max(self.date_set, function (d) {
                    return d;
                })
            ])
            .range([0, self.parent_svg.node().getBoundingClientRect().width]);
        self.axis_group = d3.select(".svg-root-g")
            .append("g")
            .attr("class", "timeaxis-g")
            .attr("transform", "translate(30, 470)");
        self.axis = d3.svg.axis()
            .scale(self.scale)
            .orient("bottom")
            .ticks(5)
            .tickFormat(d3.time.format("%H:%M:%S"));
        self.axis_group.call(self.axis);
    };
    self.update = function (latest_record) {
        var latest_date = new Date(latest_record.timestamp);
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
    self.scale = null;
    self.axis_group = null;
    self.axis = null;
    self.init = function (data_set) {
        self.value_set = data_set.map(function (d) {
            return d.sensors.AN1.value;
        });
        self.scale = d3.scale.linear()
            .domain([
                d3.max(self.value_set, function (d) {
                    return d;
                }) * 1.1,
                d3.min(self.value_set, function (d) {
                    return d;
                }) * 0.9
            ])
            .range([0, self.parent_svg.node().getBoundingClientRect().height - 60])
            .nice();
        self.axis_group = d3.select(".svg-root-g")
            .append("g")
            .attr("class", "yaxis-g")
            .attr("transform", "translate(30, 30)");
        self.axis = d3.svg.axis()
            .scale(self.scale)
            .orient("left");
        self.axis_group.call(self.axis);
    };
    self.update = function (latest_record) {
        var latest_value = latest_record.sensors.AN1.value;
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
    self.paths = null;
    self.linefunction = null;
    self.init = function (data_set, timescale, yscale) {
        self.data_set = data_set.map(function (d) {
            var json = {};
            json.date = new Date(d.timestamp);
            json.value = d.sensors.AN1.value;
            return json;
        });
        self.timescale = timescale;
        self.yscale = yscale;
        var linepaths_group = d3.select(".svg-root-g")
            .append("g")
            .attr("class", "linepaths-g")
            .attr("clip-path", "url(#clip)")
            .attr("transform", "translate(30, 30)");
        self.paths = linepaths_group.append("path")
            .attr("class", "datapath");
        self.cursors = linepaths_group.selectAll("circle")
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
        self.linefunction = d3.svg.line()
            .x(function (d) {
                return self.timescale(d.date);
            })
            .y(function (d) {
                return self.yscale(d.value);
            })
            .interpolate("linear");
        self.paths.attr("d", self.linefunction(self.data_set));
    };
    self.update = function (data_set, timescale, yscale) {
        var json = {};
        json.date = new Date(data_set[0].timestamp);
        json.value = data_set[0].sensors.AN1.value;
        self.data_set.pop();
        self.data_set.unshift(json);
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
    self.svg = null;
    self.timeaxis = null;
    self.yaxis = null;
    self.linepaths = null;
    self.data_set = [];
    self.timespan = 100;
    self.w = 1000;
    self.h = 500;
    self.container_id = "live-graph-div";
    self.init = function () {
        self.svg = d3.select("#" + self.container_id)
            .append("svg")
            .attr("width", self.w)
            .attr("height", self.h)
            .attr("class", "live-graph-svg");
        self.fetch_data();
    };

    self.update = function () {
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
                            self.data_set.unshift(latest_record);
                            self.data_set.pop();
                            self.timeaxis.update(latest_record);
                            self.yaxis.update(latest_record);
                            self.linepaths.update(self.data_set, self.timeaxis.scale, self.yaxis.scale);
                        }
                    }
                }
            }
        )
    };

    self.fetch_data = function () {
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
                    self.timeaxis = new TimeAxis(self.svg);
                    self.timeaxis.init(self.data_set);
                    self.yaxis = new YAxis(self.svg);
                    self.yaxis.init(self.data_set);
                    self.linepaths = new LinePaths(self.svg);
                    self.linepaths.init(self.data_set, self.timeaxis.scale, self.yaxis.scale);
                }
            }
        })
    };
}

function HistoryData() {
    var self = this;
    self.svg = null;
    self.svg_group = null;
    self.timeaxis = null;
    self.yaxis = null;
    self.linepaths = null;
    self.data_set = [];
    self.zoom = null;
    self.container_id = "history-graph-table-div";
    self.w = d3.select(".history-graph-div").node().getBoundingClientRect().width;
    self.h = 500;
    self.start_timestamp = null;
    self.end_timestamp = null;
    self.init = function () {
        self.svg = d3.select(".history-graph-div")
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
        self.fetch_data();
    };
    self.fetch_data = function () {
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
                    self.timeaxis = new TimeAxis(self.svg);
                    self.timeaxis.init(self.data_set);
                    self.yaxis = new YAxis(self.svg);
                    self.yaxis.init(self.data_set);
                    self.linepaths = new LinePaths(self.svg);
                    self.linepaths.init(self.data_set, self.timeaxis.scale, self.yaxis.scale);
                    self.zoom = d3.behavior.zoom()
                        .x(self.timeaxis.scale)
                        .scaleExtent([1, 5])
                        .on("zoom", self.zoomed);
                    d3.select(".rect-zoom-pan").call(self.zoom);
                    var tr = d3.select(".history-table-div").append("table")
                        .selectAll("tr")
                        .data(self.data_set)
                        .enter()
                        .append("tr");
                    tr.append("td")
                        .html(function (d) {
                            return d.timestamp;
                        });
                    tr.append("td")
                        .html(function (d) {
                            return d.sensors.AN1.value;
                        });
                }
            }
        })
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

