function LiveLineGraph() {
    var self = this;
    self.svg = null;
    self.data_set = [];
    self.timespan = 600;
    self.cursor_x = [];
    self.cursor_count = 10;
    self.w = 800;
    self.h = 500;
    self.wps = self.w / self.timespan;
    self.container_id = "live-graph-div";

    self.init = function () {
        self.svg = d3.select("#" + self.container_id)
            .append("svg")
            .attr("width", self.w)
            .attr("height", self.h);
        for(var i=0; i<self.cursor_count; i++){
            self.cursor_x[i]=self.w/self.cursor_count*i;
        }
        self.svg.selectAll("line")
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
            .attr("y2", self.h)
            .attr("stroke", "gray")
            .attr("stroke-width", 1);
    };
    // TODO: calculate cusor_x by latest status
    self.render_graph = function () {
        // render cursor lines
        for (var i = 0; i < self.cursor_x.length; i++) {
            self.cursor_x[i] -= self.wps;
        }
        // TODO: no appending new cursor lines
        self.svg.selectAll("line")
            .data(self.cursor_x)
            .attr("x1", function (d, i) {
                return d;
            })
            .attr("x2", function (d, i) {
                return d;
            });
    };
}

var graph = new LiveLineGraph();
graph.init();