function TimeAxis(timescale) {
    var self = this;
    self.parent_svg = d3.select(".cursor-svg");
    self.timeaxis = d3.svg.axis()
        .scale(timescale)
        .orient("bottom")
        .ticks(10)
        .tickFormat(d3.time.format("%H:%M:%S"));
    self.init = function () {
        self.parent_svg.append("g")
            .attr("class", "timeaxis-g")
            .call(self.timeaxis);
    }
}


function TimeScale(data_set) {
    var self = this;
    self.data_set = data_set;
    self.data_set.forEach(function (d){
        d["timestamp"] = new Date(d["timestamp"]);
    });
    // TODO: default width is 800
    self.scale = d3.time.scale()
        .domain([
            d3.min(self.data_set, function (d) {
                return d["timestamp"];
            }),
            d3.max(self.data_set, function (d) {
                return d["timestamp"];
            })
        ])
        .range([0, 740]);
}

function Cursors(svg, cursor_count, wps) {
    var self = this;
    self.parent_svg = svg;
    self.cursor_x = [];
    self.cursor_count = cursor_count;
    self.cursor_svg_margin = 30;
    self.wps = wps;
    self.init = function () {
        for (var i = 0; i < self.cursor_count; i++) {
            self.cursor_x[i] = self.parent_svg.attr("width") / self.cursor_count * i;
        }
        var cursor_svg = self.parent_svg.append("svg")
            .attr("x", self.cursor_svg_margin)
            .attr("y", self.cursor_svg_margin)
            .attr("class", "cursor-svg")
            .attr("width", self.parent_svg.attr("width") - 2 * self.cursor_svg_margin)
            .attr("height", self.parent_svg.attr("height") - 2 * self.cursor_svg_margin);
        var cursor_g = cursor_svg.append("g")
            .attr("class", "cursor-g");
        cursor_g.selectAll("line")
            .data(self.cursor_x)
            .enter()
            .append("line")
            .attr("x1", function (d, i) {
                return d;
            })
            .attr("x2", function (d, i) {
                return d;
            })
            .attr("y1", 0)
            .attr("y2", cursor_svg.attr("height"))
            .attr("stroke", "gray")
            .attr("stroke-width", 1);
    };
    self.update = function () {
        for (var i = 0; i < self.cursor_x.length; i++) {
            self.cursor_x[i] -= self.wps;
            if (self.cursor_x[i] < 0) {
                self.cursor_x[i] += self.parent_svg.attr("width");
            }
            console.log(self.cursor_x);
            self.parent_svg.select("g")
                .selectAll("line")
                .data(self.cursor_x)
                .attr("x1", function (d, i) {
                    return d;
                })
                .attr("x2", function (d, i) {
                    return d;
                });
        }
    };
}


function LiveLineGraph() {
    var self = this;
    self.svg = null;
    self.cursors = null;
    self.timeaxis = null;
    self.timescale = null;
    self.data_set = [];
    self.timespan = 600;
    self.w = 800;
    self.h = 500;
    self.cursor_count = 10;
    self.wps = self.w / self.timespan;
    self.container_id = "live-graph-div";

    self.init = function () {
        self.fetch_data();
        self.svg = d3.select("#" + self.container_id)
            .append("svg")
            .attr("width", self.w)
            .attr("height", self.h);
        // TODO: draw line
    };

    self.render_graph = function () {
        self.cursors.update();
    };

    self.fetch_data = function () {
        var basic_auth = btoa(Cookies.get("un") + ":" + Cookies.get("pwd"));
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/latest-record-set/" + self.timespan,
            headers: {
                "Authorization": "Basic " + basic_auth
            },
            dataType: 'json',
            complete: function (data) {
                if (data["responseJSON"]["err"] == "False") {
                    self.data_set = data["responseJSON"]["result"];
                }
                self.timescale = new TimeScale(self.data_set);
                self.cursors = new Cursors(self.svg, self.cursor_count, self.wps);
                self.cursors.init();
                self.timeaxis = new TimeAxis(self.timescale.scale);
                self.timeaxis.init();
            }
        })
    };
}

var graph = new LiveLineGraph();
graph.init();