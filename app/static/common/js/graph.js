function TimeAxis() {
    var self = this;
    self.parent_svg = d3.select(".live-graph-svg");
    self.date_set = [];
    self.scale = null;
    self.timeaxis_group = null;
    self.timeaxis = null;
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
            .range([0, 740]);
        self.timeaxis_group = self.parent_svg.append("g")
            .attr("class", "timeaxis-g")
            .attr("transform", "translate(30, 470)");
        self.timeaxis = d3.svg.axis()
            .scale(self.scale)
            .orient("bottom")
            .ticks(10)
            .tickFormat(d3.time.format("%H:%M:%S"));
        self.timeaxis_group.call(self.timeaxis);
    };
    self.update_scale = function (latest_record) {
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
    };
    self.slide = function () {
        var duration = self.date_set[0] - self.date_set[1];
        self.timeaxis_group.transition()
            .duration(duration)         //TODO:duration need to be calculated
            .call(self.timeaxis);
    }
}

function LinePaths() {
    var self = this;
    self.parent_svg = d3.select(".live-graph-svg");
    self.timescale = null;
    self.yscale = null;
    self.data_set = [];
    self.linepaths_group = null;
    self.linegraph = null;
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
        self.linepaths_group = self.parent_svg.append("g")
            .attr("class", "linepaths-g")
            .attr("transform", "translate(30, 30)");
        self.linegraph = self.linepaths_group.append("path");
        self.linefunction = d3.svg.line()
            .x(function (d) {
                return self.timescale(d.date);
            })
            .y(function (d) {
                return self.yscale(d.value);
            })
            .interpolate("basis");
        self.linegraph.attr("d", self.linefunction(self.data_set));
    };
    self.update = function (data_set, timescale, yscale) {
        var second_latest_date = self.data_set[0].date;
        var json = {};
        json.date = new Date(data_set[0].timestamp);
        json.value = data_set[0].sensors.AN1.value;
        self.data_set.pop();
        self.timescale = timescale;
        self.yscale = yscale;
        self.linegraph
            .attr("d", self.linefunction(self.data_set))
            .attr("transform", null)
            .transition()
            .duration(json.date - second_latest_date)
            .attr("transform", "translate(" + (self.timescale(second_latest_date)
            - self.timescale(json.date)) + ")");
        self.data_set.unshift(json);
    };
}

function YAxis() {
    var self = this;
    self.parent_svg = d3.select(".live-graph-svg");
    self.value_set = [];
    self.scale = null;
    self.yaxis_group = null;
    self.yaxis = null;
    self.init = function (data_set) {
        self.value_set = data_set.map(function (d) {
            return d.sensors.AN1.value;
        });
        self.scale = d3.scale.linear()
            .domain([
                d3.max(self.value_set, function (d) {
                    return d;
                }),
                d3.min(self.value_set, function (d) {
                    return d;
                })
            ])
            .range([0, 440])
            .nice();
        self.yaxis_group = self.parent_svg.append("g")
            .attr("class", "yaxis-g")
            .attr("transform", "translate(30, 30)");
        self.yaxis = d3.svg.axis()
            .scale(self.scale)
            .orient("left");
        self.yaxis_group.call(self.yaxis);
    };
    self.update_scale = function (latest_record) {
        var latest_value = latest_record.sensor.AN1.value;
        self.value_set.unshift(latest_value);
        self.value_set.pop();
        self.scale.domain([
            d3.max(self.value_set, function (d) {
                return d;
            }),
            d3.min(self.value_set, function (d) {
                return d;
            })
        ]);
    };
    self.update = function () {
        self.yaxis_group.transition()
            .duration(500)         //TODO:duration need to be calculated
            .call(self.yaxis);
    };
}

function LiveLineGraph() {
    var self = this;
    self.svg = null;
    self.timeaxis = null;
    self.yaxis = null;
    self.linepaths = null;
    self.data_set = [];
    self.timespan = 100;
    self.w = 800;
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
                complete: function (data) {
                    if (data["responseJSON"]["err"] == "False") {
                        var latest_record = data["responseJSON"]["result"];
                        // for testing
                        latest_record["timestamp"] = self.data_set[0]["timestamp"] + 1000;
                        latest_record.sensors.AN1.value = Math.floor(Math.random() * 100);
                    }
                    self.data_set.unshift(latest_record);
                    self.data_set.pop();
                    self.linepaths.update(self.data_set, self.timeaxis.scale, self.yaxis.scale);
                    self.timeaxis.update_scale(latest_record);
                    self.timeaxis.slide();
                    self.yaxis.update(latest_record);
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
                }
                // for testing
                for (var i = 0; i != self.data_set.length; i++) {
                    self.data_set[i].sensors.AN1.value = Math.floor(Math.random() * 100);
                }
                self.timeaxis = new TimeAxis();
                self.timeaxis.init(self.data_set);
                self.yaxis = new YAxis();
                self.yaxis.init(self.data_set);
                self.linepaths = new LinePaths();
                self.linepaths.init(self.data_set, self.timeaxis.scale, self.yaxis.scale);
            }
        })
    };
}

var graph = new LiveLineGraph();
graph.init();

// for test
setInterval(function () {
    graph.update();
}, 2000);