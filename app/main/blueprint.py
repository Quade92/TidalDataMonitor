import flask

profile = flask.Blueprint("profile", __name__, template_folder="templates")


@profile.route("/realtime")
def realtime_graph():
    return flask.render_template("realtime-graph.html")


@profile.route("/index")
def index():
    return flask.render_template("index.html")


@profile.route("/history")
def history_graph():
    return flask.render_template("history-graph.html")
