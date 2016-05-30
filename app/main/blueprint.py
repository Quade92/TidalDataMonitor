# coding: utf-8
import flask

profile = flask.Blueprint("profile", __name__, template_folder="templates")


@profile.route("/realtime")
def realtime():
    token = flask.request.cookies.get("token")
    if not token:
        flask.flash(u"请先登录", "error")
        return flask.redirect(flask.url_for("profile.index"))
    return flask.render_template("realtime-graph.html")


@profile.route("/index")
@profile.route("/")
def index():
    token = flask.request.cookies.get("token")
    un = flask.request.cookies.get("un")
    if un and token:
        flask.session["un"] = un
    return flask.render_template("index.html")


@profile.route("/history")
def history():
    token = flask.request.cookies.get('token')
    if not token:
        flask.flash(u"请先登录", "error")
        return flask.redirect(flask.url_for("profile.index"))
    return flask.render_template("history-graph.html")


@profile.route("/logout")
def logout():
    flask.session.clear()
    resp = flask.make_response(flask.redirect(flask.url_for("profile.index")))
    resp.set_cookie("un","",expires=0)
    resp.set_cookie("token", "", expires=0)
    return resp