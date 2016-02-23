function TimeAxis(timescale) {
    var self = this;
    self.parent_svg = d3.select(".live-graph-svg");
    self.timeaxis_group = self.parent_svg.append("g")
        .attr("class", "timeaxis-g")
        .attr("transform", "translate(30, 470)");
    self.timeaxis = d3.svg.axis()
        .scale(timescale)
        .orient("bottom")
        .ticks(10)
        .tickFormat(d3.time.format("%H:%M:%S"));
    self.init = function () {
        self.timeaxis_group.call(self.timeaxis);
    };
    self.slide = function () {
        self.timeaxis_group.transition()
            .duration(500)         //TODO:duration need to be calculated
            .call(self.timeaxis);
    }
}

function LinePaths(data_set, timescale) {
    var self = this;
    self.parent_svg = d3.select(".live-graph-svg");
    self.timescale = timescale;
    self.data_set = data_set.map(function (d) {
        var json = {};
        json.timestamp = d.timestamp;
        json.value = d.sensors.AN1.value;
        return json;
    });
    self.linepaths_group = self.parent_svg.append("g")
        .attr("class", "linepaths-g")
        .attr("transform", "translate(30, 30)");
    self.linegraph = self.linepaths_group.append("path");
    self.linefunction = d3.svg.line()
        .x(function (d) {
            var date = new Date(d.timestamp);
            return self.timescale(date);
        })
        .y(function (d) {
            return d.value;
        })
        .interpolate("basis");
    self.init = function () {
        self.linegraph.attr("d", self.linefunction(self.data_set));
    };
    self.update = function (data_set, timescale) {
        var json = {};
        json.timestamp = data_set[0].timestamp;
        var second_latest_date = self.data_set[0].timestamp;
        json.value = data_set[0].sensors.AN1.value;
        self.data_set.pop();
        self.linegraph
            .attr("d", self.linefunction(self.data_set))
            .attr("transform", null)
            .transition()
            .duration(200)
            .attr("transform", "translate(" +(timescale.scale(second_latest_date)
            -timescale.scale(json.timestamp))+ ")");
        self.data_set.unshift(json);
    };
}

function TimeScale(data_set) {
    var self = this;
    self.data_set = data_set.map(function (d) {
        return new Date(d["timestamp"]);
    });
    self.scale = d3.time.scale()
        .domain([
            d3.min(self.data_set, function (d) {
                return d;
            }),
            d3.max(self.data_set, function (d) {
                return d;
            })
        ])
        .range([0, 740]);
    self.update = function (data_set) {
        self.data_set = data_set.map(function (d) {
            return new Date(d["timestamp"]);
        });
        self.scale.domain([
            d3.min(self.data_set, function (d) {
                return d;
            }),
            d3.max(self.data_set, function (d) {
                return d;
            })
        ]);
    }
}

function YScale(data_set) {
    var self = this;
    self.data_set = data_set.map(function (d) {
        return d.sensors.AN1.value;
    });
    self.scale = d3.scale.linear()
        .domain([
            d3.min(self.data_set, function (d) {
                return d;
            }),
            d3.max(self.data_set, function (d) {
                return d;
            })
        ])
        .range([0, 440]);
    self.update = function (data_set) {
        var latest_value = data_set[0].sensor.AN1.value;
        self.data_set.unshift(latest_value);
        self.data_set.pop();
        self.domain([
            d3.min(self.data_set, function (d) {
                return d;
            }),
            d3.max(self.data_set, function (d) {
                return d;
            })
        ]);
    };
}

function YAxis(yscale) {
    var self = this;
    self.parent_svg = d3.select(".live-graph-svg");
    self.yaxis_group = self.parent_svg.append("g")
        .attr("class", "yaxis-g")
        .attr("transform", "translate(30, 30)");
    self.yaxis = d3.svg.axis()
        .scale(yscale)
        .orient("left");
    self.init = function(){
        self.yaxis_group.call(self.yaxis);
    };
    self.update = function (){
        self.yaxis_group.transition()
            .duration(200)         //TODO:duration need to be calculated
            .call(self.yaxis);
    };
}

function LiveLineGraph() {
    var self = this;
    self.svg = null;
    self.timeaxis = null;
    self.timescale = null;
    self.yscale = null;
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
                        latest_record.sensors.AN1.value = Math.floor(Math.random()*100);
                    }
                    self.data_set.unshift(latest_record);
                    self.data_set.pop();
                    self.linepaths.update(self.data_set, self.timescale);
                    self.timescale.update(self.data_set);
                    self.timeaxis.slide();
                    self.yaxis.update();
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
                for (var i=0; i!=self.data_set.length; i++){
                    self.data_set[i].sensors.AN1.value = Math.floor(Math.random()*100);
                }
                self.timescale = new TimeScale(self.data_set);
                self.timeaxis = new TimeAxis(self.timescale.scale);
                self.timeaxis.init();
                self.yscale = new YScale(self.data_set);
                self.yaxis = new YAxis(self.yscale.scale);
                self.yaxis.init();
                self.linepaths = new LinePaths(self.data_set, self.timescale.scale);
                self.linepaths.init();
            }
        })
    };
}

var graph = new LiveLineGraph();
graph.init();

// for test
setInterval(function () {
    graph.update();
}, 1000);