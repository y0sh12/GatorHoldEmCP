import datetime
import os
import smtplib
import uuid
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import flask
from cryptography.fernet import Fernet
from flask import Flask, request, jsonify
from flask import Response
from flask_cors import cross_origin
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
    email_verified = db.Column(db.String, unique=False, nullable=False)
    forgot_pass_code = db.Column(db.Integer, unique=False, nullable=True)
    forgot_expiry = db.Column(db.DateTime, unique=False, nullable=True)

    def __init__(self, idd, username, email, password, created_on, balance):
        self.id = idd
        self.username = username
        self.email = email
        self.password = password
        self.created_on = created_on
        self.balance = balance
        self.email_verified = False
        self.forgot_pass_code = None
        self.forgot_expiry = None

    def __repr__(self):
        return "<Username: %r>" % self.username


@app.route("/", methods=["GET"])
def root_route():
    return jsonify(response="Welcome to the GatorHoldEm Account API!")


@app.route("/users/all", methods=["GET"])
# Gives all users and their information
# FORMAT: link.com/users/all
def all_users():
    all_users_list = []
    users = Account.query.all()
    for user in users:
        new_user = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "created_on": user.created_on.strftime("%m/%d/%Y"),
            "email_verified": user.email_verified
        }
        all_users_list.append(new_user)
    response = jsonify(all_users_list)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/users/find/<username>", methods=["GET"])
def get_user(username):
    found_user = Account.query.filter_by(username=username).first()
    if found_user:
        response = jsonify(
            id=found_user.id,
            email=found_user.email,
            username=found_user.username,
            balance=found_user.balance,
            created_on=found_user.created_on.strftime("%m/%d/%Y"),
            email_verified=found_user.email_verified
        )
    else:
        response = jsonify(response="Error: User not found"), 404
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/users/find/<username>/balance", methods=["GET"])
# Balance of a user
# FORMAT: link.com/users/find/<username_to_query>/balance
def find_balance(username):
    found_balance = Account.query.filter_by(username=username).first()
    if found_balance:
        response = jsonify(balance=found_balance.balance)
    else:
        response = Response(jsonify(response="Error: User not found"), 404)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/users/delete/<username>", methods=["DELETE"])
@cross_origin()
# Deletes a user based on the username
# FORMAT: link.com/users/delete/<username_to_delete>
def delete(username):
    found_user = Account.query.filter_by(username=username).first()
    if found_user:
        db.session.delete(found_user)
        db.session.commit()
        response = jsonify(message="Successfully deleted user: %s" % username)
    else:
        response = Response(jsonify(response="Error: User not found"), 404)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/new', methods=['POST'])
@cross_origin()
def new():
    username = request.json.get("username").lower()
    password = request.json.get("password")
    password = encryptString(password)
    balance = 1000
    created_on = datetime.datetime.utcnow()
    idd = str(uuid.uuid1())
    email = request.json.get("email")
    print(username, password, balance)
    if not request.json.get("username") or not request.json.get("password") or not request.json.get("email"):
        response = Response("{\"response\": \"you're missing one or more values in the body\"}", 400)
    else:
        try:
            account = Account(idd, username, email, password, created_on, balance)
            print(account.email_verified)
            db.session.add(account)
            db.session.commit()
            sendEmail(email, "emailVerification", "Verify Your Email!", idd)
            response = Response("{\"response\": \"you have successfully added an account to the db\"}", 200)
        except Exception as ex:
            if "UNIQUE constraint failed" in str(ex):
                response = Response("{\"response\": \"username has been taken\"}", 400)
            else:
                print(ex)
                response = Response("{\"response\": \"bruh idk what happened\"}", 500)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/auth', methods=['POST'])
@cross_origin()
def auth():
    username = request.json.get("username").lower()
    password1 = request.json.get("password")
    if not request.json.get("username") or not request.json.get("password"):
        response = Response("{\"response\": \"you're missing one or more values in the body\"}")
        response.status = 400
    else:
        try:
            password2 = Account.query.filter_by(username=username).first().password
            password2 = decryptString(password2)
            if password1 == password2:
                response = Response("{\"response\": \"True\"}", 200)
            else:
                response = Response("{\"response\": \"False\"}", 403)
        except Exception as ex:
            if "NoneType" in str(ex):
                response = Response("{\"response\": \"Username doesn't exist in database\"}", 404)
            else:
                response = Response("{\"response\": \"bruh idk what happened\"}", 500)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/change_password', methods=['PATCH'])
@cross_origin()
def change_password():
    username = request.json.get("username").lower()
    old_password = request.json.get("old_password")
    new_password = encryptString(request.json.get("new_password"))
    if not request.json.get("username") or not request.json.get("old_password") or not request.json.get("new_password"):
        response = Response("{\"response\": \"you're missing one or more values in the body\"}", 400)
    else:
        try:
            real_password = Account.query.filter_by(username=username).first().password
            real_password = decryptString(real_password)
            account = Account.query.filter_by(username=username).first()
            if old_password == real_password:
                account.password = new_password
                db.session.commit()
                response = Response("{\"response\": \"Your password has been updated!\"}", 200)
            else:
                response = Response("{\"response\": \"Old password doesn\'t match records\"}", 403)
        except Exception as ex:
            if "NoneType" in str(ex):
                response = Response("{\"response\": \"Username doesn't exist in database\"}", 404)
            else:
                print(str(ex))
                response = Response("{\"response\": \"bruh idk what happened\"}", 500)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/forgot_password', methods=['PATCH'])
@cross_origin()
def forgot_password():
    email = request.json.get("email")
    found_user = Account.query.filter_by(email=email).first()

    if found_user:
        found_user.forgot_expiry = datetime.datetime.now(datetime.timezone.utc)
        db.session.commit()
        sendEmail(found_user.email, "ForgotPassword", "Reset Your Password!", found_user.id)
        response = jsonify(response=datetime.datetime.strftime(found_user.forgot_expiry, '%Y-%m-%d %H:%M:%S UTC'))

    else:
        response = jsonify(response="Error: User not found"), 404
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/forgot_password/change_password/<idd>', methods=['GET'])
def return_forgot_password_page(idd):
    try:
        account = Account.query.filter_by(id=idd).first()
        account.email_verified = True
        db.session.commit()
        response = flask.render_template('VerificationSuccess.html')
    except Exception as ex:
        response = flask.render_template('VerificationFail.html')
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/forgot_password/change_password', methods=['PATCH'])
@cross_origin()
def change_password_email():
    email = request.json.get("email")
    new_password = encryptString(request.json.get("new_password"))
    if not request.json.get("email") or not request.json.get("new_password"):
        response = Response("{\"response\": \"you're missing one or more values in the body\"}", 400)
    else:
        try:
            real_password = decryptString(Account.query.filter_by(email=email).first().password)
            account = Account.query.filter_by(email=email).first()
            if decryptString(new_password) != real_password:
                current_time = datetime.datetime.now(datetime.timezone.utc)
                stored_time = account.forgot_expiry.replace(tzinfo=datetime.timezone.utc)
                test_time = current_time - stored_time

                if test_time < datetime.timedelta(minutes=15):
                    account.password = new_password
                    db.session.commit()
                    response = Response(jsonify(response="Your password has been updated!"), 200)
                else:
                    response = Response(jsonify(response="Password reset has expired"), 403)
            else:
                response = Response(jsonify(response="Please choose a different password"), 403)
        except Exception as ex:
            if "NoneType" in str(ex):
                response = Response(jsonify(response="Username doesn't exist in database"), 404)
            else:
                print(str(ex))
                response = Response(jsonify(response="bruh idk what happened"), 500)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/change_balance', methods=['PATCH'])
@cross_origin()
def change_balance():
    idd = request.json.get("id")
    change = int(request.json.get("change"))
    if not request.json.get("id") or not request.json.get("change"):
        response = Response("{\"response\": \"you're missing one or more values in the body\"}", 400)
    else:
        try:
            account = Account.query.filter_by(id=idd).first()
            account.balance = account.balance + change
            if account.balance < 0:
                account.balance = 0
            db.session.commit()
            response = Response("{\"response\": \"Balance has been updated to " + str(account.balance) + "\"}", 200)
        except Exception as ex:
            if "NoneType" in str(ex):
                response = Response("{\"response\": \"Id doesn't exist in database\"}", 404)
            else:
                print(str(ex))
                response = Response("{\"response\": \"bruh idk what happened\"}", 500)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/reset_balance', methods=['PATCH'])
@cross_origin()
def reset_balance():
    idd = request.json.get("id")
    if not request.json.get("id"):
        response = Response(jsonify(response="you're missing one or more values in the body"), 400)
    else:
        try:
            account = Account.query.filter_by(id=idd).first()
            account.balance = 1000
            db.session.commit()
            response = Response(jsonify(response="Balance has been reset to 1000"), 200)
        except Exception as ex:
            if "NoneType" in str(ex):
                response = Response(jsonify(response="ID doesn't exist in database"), 404)
            else:
                print(str(ex))
                response = Response(jsonify(response="bruh idk what happened"), 500)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/email_verified/<idd>', methods=['GET'])
def email_verified(idd):
    try:
        account = Account.query.filter_by(id=idd).first()
        account.email_verified = True
        db.session.commit()
        response =  flask.render_template('VerificationSuccess.html')
    except Exception as ex:
        response = flask.render_template('VerificationFail.html')
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


def sendEmail(email, htmlFileName, subject, idd):
    fromaddr = 'gatorholdem@gmail.com'
    password = 'nwfxjyuvbylruzkv'
    html = open(htmlFileName + ".html").read()
    html = html.replace("UUID", idd)
    msg = MIMEMultipart('related')
    msg['From'] = fromaddr
    msg['To'] = email
    msg['Subject'] = subject
    msgAlternative = MIMEMultipart('alternative')
    msg.attach(msgAlternative)
    msgText = MIMEText('This is the alternative plain text message.')
    msgAlternative.attach(msgText)
    msgText = MIMEText(html, 'html')
    msgAlternative.attach(msgText)
    fp = open('gators.png', 'rb')
    msgImage = MIMEImage(fp.read())
    fp.close()
    msgImage.add_header('Content-ID', '<gatorImage>')
    msg.attach(msgImage)
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(fromaddr, password)
    text = msg.as_string()
    server.sendmail(fromaddr, email, text)
    server.quit()


def encryptString(plaintext):
    file = open('key.key', 'rb')
    key = file.read()
    file.close()
    encoded = plaintext.encode('ascii')
    print(key)
    f = Fernet(key)
    return f.encrypt(encoded)


def decryptString(encryptedString):
    file = open('key.key', 'rb')
    key = file.read()
    file.close()
    f = Fernet(key)
    return f.decrypt(encryptedString).decode('ascii')


if __name__ == "__main__":
    app.run(debug=True)
    pass
