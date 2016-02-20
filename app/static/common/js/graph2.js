function Cursors(svg, wps) {
    var self = this;
    self.parent_svg = svg;
    self.cursor_x = [];
    self.cursor_count = 10;
    self.cursor_svg_margin = 30;
    self.wps = wps;
    self.init = function () {
        for (var i = 0; i < self.cursor_count; i++) {
            self.cursor_x[i] = self.parent_svg.attr("width") / self.cursor_count * i;
        }
        var cursor_svg = self.parent_svg.append("svg")
            .attr("x", self.cursor_svg_margin)
            .attr("y", self.cursor_svg_margin)
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
    self.data_set = [];
    self.timespan = 600;
    self.w = 800;
    self.h = 500;
    self.wps = self.w / self.timespan;
    self.container_id = "live-graph-div";

    self.init = function () {
        self.svg = d3.select("#" + self.container_id)
            .append("svg")
            .attr("width", self.w)
            .attr("height", self.h);
        self.cursors = new Cursors(self.svg, self.wps);
        self.cursors.init();
        // TODO: init scaled axis
        // TODO: load data from api
        // TODO: draw line
    };
    self.render_graph = function () {
        // render cursor lines
        self.cursors.update();
    };
}

var graph = new LiveLineGraph();
graph.init();