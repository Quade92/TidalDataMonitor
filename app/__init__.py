from flask import Flask
from main import blueprint

def create_app():
    app = Flask(__name__)
    app.register_blueprint(blueprint.profile)
    return app