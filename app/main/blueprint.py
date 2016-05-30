# coding: utf-8
import flask

profile = flask.Blueprint("profile", __name__, template_folder="templates")


@profile.route("/realtime")
def realtime_graph():
    token = flask.request.cookies.get("token")
    if not token:
        flask.flash(u"请先登录")
        return flask.redirect(flask.url_for("profile.index"))
    return flask.render_template("realtime-graph.html")


@profile.route("/index")
@profile.route("/")
def index():
    return flask.render_template("index.html")


@profile.route("/history")
def history_graph():
    token = flask.request.cookies.get('token')
    if not token:
        flask.flash(u"请先登录")
        return flask.redirect(flask.url_for("profile.index"))
    return flask.render_template("history-graph.html")
