import os
import datetime
import uuid

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
    id = db.Column(db.String(400), primary_key=True, unique=True, nullable=False)
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
    return jsonify(message="Root route")


@app.route("/users/get/all", methods=["GET"])
# Gives all users and their information
# PASSWORD IS FETCHED FOR TESTING, DO NOT KEEP IN FINAL
def get_all_users():
    users = Account.query.all()
    for user in users:
        print(user.id, end=' ')
        print(user.email, end=' ')
        print(user.username, end=' ')
        print(user.password, end=' ')
        print(user.created_on)


    return jsonify(message="List of users printed in console")


@app.route("/balance", methods=["GET"])
# Balance of a user
# FORMAT: link.com/balance/?username=[username_to_query]
def balance():
    if 'username' in request.args:
        username = str(request.args['username'])
    else:
        return jsonify(message="Error: No username provided")
    found_balance = Account.query.filter_by(username=username).first()
    if found_balance:
        return jsonify(balance=found_balance.balance)
    else:
        return jsonify(message="Error: User not found")


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
    id = str(uuid.uuid1())
    email = request.json.get("email")
    print(username, password, balance)
    if not request.json.get("username") or not request.json.get("password") or not request.json.get("balance") \
            or not request.json.get("email"):
        return "{\"response\": \"you're missing one or more values in the body\"}", 400
    else:
        try:
            account = Account(id, username, email, password, created_on, balance)
            db.session.add(account)
            db.session.commit()
            return "{\"response\": \"you have successfully added an account to the db\"}", 200
        except Exception as ex:
            if "UNIQUE constraint failed" in str(ex):
                return "{\"response\": \"username has been taken\"}", 400
            else:
                print(ex)
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


@app.route('/change_password', methods=['PATCH'])
def change_password():
    username = request.json.get("username")
    old_password = request.json.get("old_password")
    new_password = request.json.get("new_password")
    if not request.json.get("username") or not request.json.get("old_password") or not request.json.get("new_password"):
        return "{\"response\": \"you're missing one or more values in the body\"}", 400
    else:
        try:
            real_password = Account.query.filter_by(username=username).first().password
            account = Account.query.filter_by(username=username).first()
            if old_password == real_password:
                account.password = new_password
                db.session.commit()
                return "{\"response\": \"Your password has been updated!\"}", 200
            else:
                return "{\"response\": \"Old password doesn\'t match records\"}", 403
        except Exception as ex:
            if "NoneType" in str(ex):
                return "{\"response\": \"Username doesn't exist in database\"}", 404
            else:
                print(str(ex))
                return "{\"response\": \"bruh idk what happened\"}", 500


@app.route('/change_balance', methods=['PATCH'])
def change_balance():
    id = request.json.get("id")
    change = int(request.json.get("change"))
    if not request.json.get("id") or not request.json.get("change"):
        return "{\"response\": \"you're missing one or more values in the body\"}", 400
    else:
        try:
            account = Account.query.filter_by(id=id).first()
            account.balance = account.balance + change
            if account.balance < 0:
                account.balance = 0
            db.session.commit()
            return "{\"response\": \"Balance has been updated to " + str(account.balance) + "\"}", 200
        except Exception as ex:
            if "NoneType" in str(ex):
                return "{\"response\": \"Id doesn't exist in database\"}", 404
            else:
                print(str(ex))
                return "{\"response\": \"bruh idk what happened\"}", 500


if __name__ == "__main__":
    app.run(debug=True)
