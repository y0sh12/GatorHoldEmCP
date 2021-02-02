import os

from flask import Flask, render_template, request, redirect

from flask_sqlalchemy import SQLAlchemy

project_dir = os.path.dirname(os.path.abspath(__file__))
database_file = "sqlite:///{}".format(os.path.join(project_dir, "accounts.db"))

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = database_file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Account(db.Model):
    username = db.Column(db.String(80), primary_key=True, unique=True, nullable=False, )
    password = db.Column(db.String(200), primary_key=False, unique=False, nullable=False)
    created_on = db.Column(db.DateTime, index=False, unique=False, nullable=True)
    balance = db.Column(db.Integer, unique=False, nullable=False)

    def __repr__(self):
        return "<Username: %r>" % self.username


@app.route("/", methods=["GET", "POST"])
def home():
    users = Account.query.all()
    return render_template("home.html", users=users)
