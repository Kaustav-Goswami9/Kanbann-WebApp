import os

import requests as rq
from flask import Flask, jsonify, redirect, render_template, request
from flask_login import (LoginManager, current_user, login_required,
                         login_user, logout_user)
from flask_restful import Api
from matplotlib import pyplot as plt
from cache_config import make_cache
import celery_task
from api import Card_api, List_api, User_api
from celery_config import create_celery_inst
from models import User, db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+os.getcwd() + \
    '/DB_project.sqlite3'
api = Api(app)

app.config['SECRET_KEY'] = '#918(-p$d}'
db.init_app(app)
celery = create_celery_inst(app)
app.app_context().push()
cache = make_cache(app)
app.app_context().push()
db.create_all()

login_manager = LoginManager(app)

api.add_resource(User_api, '/api/user', '/api/user/<string:email>')
api.add_resource(List_api, '/api/list/<int:user_id>/<int:list_id>',
                 '/api/list/<int:user_id>')
api.add_resource(Card_api, '/api/card/<int:list_id>',
                 '/api/card/<int:list_id>/<int:card_id>')


@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(user_id=user_id).first()


@login_manager.unauthorized_handler
def unauthorized_callback():
    return redirect('/')


@app.route('/')
def dashboard():
    return render_template('index.html')


@app.route('/login', methods=["POST"])
def login():
    email = request.json.get("email")
    pasw = request.json.get("password")
    print(email, pasw)

    # check if email and password matches
    data = rq.get(request.url_root+'api/user/'+email)
    if data.status_code == 200 and data.json().get('password') == pasw:
        login_user(User.query.filter_by(email=email).first(), remember=True)

        return jsonify({'message': 'Log In Succesfull', 'id': data.json().get('user_id')}), 200
    else:
        return jsonify({'message': 'Incorrect email/password'}), 404


@app.route('/logout')
@login_required
def logout():
    print('logged out', current_user)
    logout_user()
    return jsonify('Logged out'), 200


@app.route('/graph/<int:lid>')
@login_required
def graph(lid):
    c_data = rq.get(url=request.url_root+'api/card/'+str(lid)).json()
    time = sorted([i.get('completed')
                   for i in c_data if i.get('completed')])

    if len(time):
        plt.xlabel('Timestamp')
        plt.ylabel('Number of Task completed')
        plt.xticks(rotation=45)
        plt.tight_layout(pad=3)

        plt.hist([t.split('T')[0] for t in time])

        plt.savefig('static/'+str(lid)+'.jpg')
        plt.close()

    return jsonify('Graph created for list-id:', lid)


@app.route('/exportList/<string:lid>')
@login_required
def exportList(lid):
    celery_task.exList.delay(int(lid), email=current_user.email,
                             uid=current_user.user_id)

    return jsonify('Task submitted')


@app.route('/exportCard/<int:cid>')
@login_required
def exportCard(cid):
    celery_task.exCard.delay(cid, current_user.email)
    return jsonify('Task submitted')


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
