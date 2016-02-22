function TimeAxis(timescale) {
    var self = this;
    self.parent_svg = d3.select(".live-graph-svg");
    self.timeaxis_group = self.parent_svg.append("g")
        .attr("class", "timeaxis-g")
        .attr("transform", "translate(0," + (500 - 30) + ")");
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
            .duration(0.5)
            .call(self.timeaxis);
    }
}

function TimeScale(data_set) {
    var self = this;
    self.data_set = data_set.map(function (d) {
        return new Date(d["timestamp"]);
    });
    self.scale = d3.time.scale()
        .domain([
            d3.max(self.data_set, function (d) {
                return d;
            }),
            d3.min(self.data_set, function (d) {
                return d;
            })
        ])
        .range([0, 740]);
    self.update = function (data_set) {
        self.data_set = data_set.map(function (d) {
            return new Date(d["timestamp"]);
        });
        self.scale.domain([
            d3.max(self.data_set, function (d) {
                return d;
            }),
            d3.min(self.data_set, function (d) {
                return d;
            })
        ]);
    }
}

function LiveLineGraph() {
    var self = this;
    self.svg = null;
    self.timeaxis = null;
    self.timescale = null;
    self.data_set = [];
    self.timespan = 600;
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
        // TODO: draw line
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
                        latest_record["timestamp"] += 1000;
                    }
                    self.data_set.push(data);
                    self.data_set.shift();
                    self.timescale.update(self.data_set);
                    self.timeaxis.slide();
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
                self.timescale = new TimeScale(self.data_set);
                self.timeaxis = new TimeAxis(self.timescale.scale);
                self.timeaxis.init();
            }
        })
    };
}

var graph = new LiveLineGraph();
graph.init();