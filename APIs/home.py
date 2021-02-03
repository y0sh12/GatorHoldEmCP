import os
import datetime

from flask import Flask, flash, url_for, render_template, request, redirect, jsonify

from flask_sqlalchemy import SQLAlchemy

project_dir = os.path.dirname(os.path.abspath(__file__))
database_file = "sqlite:///{}".format(os.path.join(project_dir, "accounts.db"))

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = database_file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = "random string"
db = SQLAlchemy(app)


class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    username = db.Column(db.String(100), primary_key=True, unique=True, nullable=False)
    email = db.Column(db.String(80), primary_key=False, unique=True, nullable=False)
    password = db.Column(db.String(200), primary_key=False, unique=False, nullable=False)
    created_on = db.Column(db.DateTime, index=False, unique=False, nullable=True)
    balance = db.Column(db.Integer, unique=False, nullable=False)

    def __init__(self, id, username, email, password, created_on, balance):
        self.id = id
        self.username = username
        self.email = email
        self.password = password
        self.created_on = created_on
        self.balance = balance

    def __repr__(self):
        return "<Username: %r>" % self.username


@app.route("/", methods=["GET"])
def getuser():
    users = Account.query.all()
    for user in users:
        print(user)
    return jsonify(message="List of users printed in console")


@app.route("/balance", methods=["GET"])
def balance():
    username = request.json.get("username")
    found_balance = Account.query.filter_by(username=username).first().balance
    return jsonify(balance=found_balance)


@app.route("/delete", methods=["DELETE"])
def delete():
    username = request.json.get("username")
    found_user = Account.query.filter_by(username=username).first()
    db.session.delete(found_user)
    db.session.commit()
    return jsonify(response="Successfully deleted user: %s" % username)


@app.route('/new', methods=['POST'])
def new():
    username = request.json.get("username")
    password = request.json.get("password")
    balance = request.json.get("balance")
    created_on = datetime.datetime.now()
    print(username, password, balance)
    if not request.json.get("username") or not request.json.get("password") or not request.json.get("balance"):
        return "{\"response\": \"you're missing one or more values in the body\"}", 400
    else:
        try:
            account = Account(username, password, created_on, balance)
            db.session.add(account)
            db.session.commit()
            return "{\"response\": \"you have successfully added an account to the db\"}", 200
        except Exception as ex:
            if "UNIQUE constraint failed" in str(ex):
                return "{\"response\": \"username has been taken\"}", 400
            else:
                return "{\"response\": \"bruh idk what happened\"}", 500

@app.route('/auth', methods=['GET'])
def auth():
    username = request.json.get("username")
    password1 = request.json.get("password")
    if not request.json.get("username") or not request.json.get("password"):
        return "{\"response\": \"you're missing one or more values in the body\"}", 400
    else:
        try:
            password2 = Account.query.filter_by(username=username).first().password
            if password1 == password2:
                return "{\"response\": \"True\"}", 200
            else:
                return "{\"response\": \"False\"}", 403
        except Exception as ex:
            if "NoneType" in str(ex):
                return "{\"response\": \"Username doesn't exist in database\"}", 404
            else:
                return "{\"response\": \"bruh idk what happened\"}", 500

if __name__ == "__main__":
    app.run(debug=True)
