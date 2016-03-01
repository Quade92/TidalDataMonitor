from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def hello_world():
    return render_template("index.html")


@app.route("/real-time")
def real_time_graph():
    return render_template("realtime-graph.html")


@app.route("/history")
def history_graph():
    return render_template("history-graph.html")

if __name__ == '__main__':
    app.run(port=5001, threaded=True)
