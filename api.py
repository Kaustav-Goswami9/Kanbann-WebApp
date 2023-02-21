from datetime import datetime

from flask import request
from flask_restful import Resource, fields, marshal_with

from custom_error import DataError, LogicError
from models import Card, List, User, db


class User_api(Resource):
    '''Api code for Login_db table'''

    output = {"user_id": fields.Integer, "email": fields.String,
              "password": fields.String, "last_logged": fields.String}

    @marshal_with(output)
    def get(self, email: str):
        '''Returns the User details for the given email'''

        obj = User.query.filter_by(email=email).first()

        # Checking whether user record is present
        if obj is None:
            raise DataError(status_code=404)

        # Update User's last login
        obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.commit()
        return obj, 200

    @marshal_with(output)
    def put(self, email: str):
        '''Modifies the User details for the given email'''

        obj = User.query.filter_by(email=email).first()

        # Checking whether user record is present
        if obj is None:
            raise DataError(status_code=404)

        obj.password = request.get_json().get("password")

        # Input data checking
        if obj.password is None or type(obj.password) != str or len(obj.password) == 0:
            raise LogicError(status_code=400, error_code="USER002",
                             error_msg="Password is required and must be string.")

        # Update User's last login
        obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.commit()
        return obj, 202

    def delete(self, email: str):
        '''Deletes the User details for the given email'''

        obj = User.query.filter_by(email=email).first()

        # Checking whether user record is present
        if not obj:
            raise DataError(status_code=404)

        db.session.delete(obj)
        db.session.commit()
        return '', 200

    @marshal_with(output)
    def post(self):
        '''Creates a new User details'''

        form = request.get_json()
        obj = User(email=form.get("email"),
                   password=form.get("password"))

        # Input data checking
        if obj.email is None or type(obj.email) != str or len(obj.email) == 0:
            raise LogicError(status_code=400, error_code="USER001",
                             error_msg="Email is required and must be string.")
        if obj.password is None or type(obj.password) != str or len(obj.password) == 0:
            raise LogicError(status_code=400, error_code="USER002",
                             error_msg="Password is required and must be string.")

        # Checking whether a user record with same email is present
        if User.query.filter_by(email=obj.email).first():
            raise DataError(status_code=409)

        db.session.add(obj)
        db.session.commit()
        return obj, 201


class List_api(Resource):
    '''Api code for List table'''

    output = {"user_id": fields.Integer, "list_id": fields.Integer,
              "name": fields.String, "description": fields.String}

    @marshal_with(output)
    def get(self, user_id):
        '''Returns all the of List details created by the User'''

        user_obj = User.query.filter_by(user_id=user_id).first()
        # Checking whether user record is present
        if user_obj is None:
            raise DataError(status_code=404)

        obj = List.query.filter_by(user_id=user_id).all()

        # Update User's last login
        user_obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.commit()
        return obj, 200

    @marshal_with(output)
    def put(self, user_id, list_id):
        '''Modifies the List details for the given user_id'''

        obj = List.query.filter_by(user_id=user_id, list_id=list_id).first()

        # Checking whether user record is present
        if obj is None:
            raise DataError(status_code=404)

        obj.description = request.get_json().get("description")

        # Input data checking
        if obj.description is None or type(obj.description) != str or len(obj.description) == 0:
            raise LogicError(status_code=400, error_code="LIST002",
                             error_msg="Description is required and must be string.")

        # Update User's last login
        user_obj = User.query.filter_by(user_id=user_id).first()
        user_obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.commit()
        return obj, 202

    @marshal_with(output)
    def delete(self, user_id, list_id):
        '''Deletes the List details for the given list_id'''

        obj = List.query.filter_by(user_id=user_id, list_id=list_id).first()

        # Checking whether List record is present
        if not obj:
            raise DataError(status_code=404)

        # Update User's last login
        user_obj = User.query.filter_by(user_id=user_id).first()
        user_obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.delete(obj)
        db.session.commit()
        return '', 200

    @marshal_with(output)
    def post(self, user_id):
        '''Creates a new List details'''

        # Checking whether user record is present
        if User.query.filter_by(user_id=user_id).first() is None:
            raise DataError(status_code=404)

        form = request.get_json()
        obj = List(name=form.get("list_name"), description=form.get('description'),
                   user_id=user_id)

        # Input data checking
        if obj.name is None or type(obj.name) != str or len(obj.name) == 0:
            raise LogicError(status_code=400, error_code="LIST001",
                             error_msg="List name is required and must be string.")
        if obj.description is None or type(obj.description) != str or len(obj.description) == 0:
            raise LogicError(status_code=400, error_code="LIST002",
                             error_msg="Description is required and must be string.")

        # Checking whether a List record with same name and user_id is present
        if List.query.filter_by(name=obj.name, user_id=user_id).first():
            raise DataError(status_code=409)

        # Update User's last login
        user_obj = User.query.filter_by(user_id=user_id).first()
        user_obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.add(obj)
        db.session.commit()
        return obj, 201


class Card_api(Resource):
    '''Api code for Card table'''

    output = {"list_id": fields.Integer, "card_id": fields.Integer,
              "title": fields.String, "content": fields.String,
              "created": fields.String, "updated": fields.String,
              "deadline": fields.String, "completed": fields.String,
              "flag": fields.Boolean}

    @marshal_with(output)
    def get(self, list_id):
        '''Returns all the card details under the given list_id'''

        list_obj = List.query.filter_by(list_id=list_id).first()
        # Checking whether List record is present
        if list_obj is None:
            raise DataError(status_code=404)

        obj = Card.query.filter_by(list_id=list_id).all()

        # Update User's last login
        user_obj = User.query.filter_by(user_id=list_obj.user_id).first()
        user_obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.commit()
        return obj, 200

    @marshal_with(output)
    def put(self, list_id, card_id):
        '''Modifies the Card details for the given list_id'''

        obj = Card.query.filter_by(card_id=card_id, list_id=list_id).first()

        # Checking whether user record is present
        if obj is None:
            raise DataError(status_code=404)

        form = request.get_json()
        obj.list_id = form.get('list_id')
        obj.content = form.get('content')
        obj.updated = datetime.now().strftime("%Y-%m-%dT%H:%M")
        obj.deadline = form.get('deadline')
        obj.flag = form.get('flag')
        if (obj.flag):
            obj.completed = datetime.now().strftime("%Y-%m-%dT%H:%M")
        else:
            obj.completed = None

        # Update User's last login
        list_obj = List.query.filter_by(list_id=list_id).first()
        user_obj = User.query.filter_by(user_id=list_obj.user_id).first()
        user_obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        # Input data checking
        if obj.content is None or type(obj.content) != str or len(obj.content) == 0:
            raise LogicError(status_code=400, error_code="CARD002",
                             error_msg="Card content is required and must be string.")
        if obj.deadline is None or type(obj.deadline) != str or len(obj.deadline) == 0:
            raise LogicError(status_code=400, error_code="CARD003",
                             error_msg="Deadline is required and must be string.")
        if List.query.filter_by(user_id=user_obj.user_id, list_id=obj.list_id).first() is None:
            raise LogicError(status_code=400, error_code="CARD004",
                             error_msg="Invalid new List details.")

        db.session.commit()
        return obj, 202

    @marshal_with(output)
    def delete(self, list_id, card_id):
        '''Deletes the Card details for the given card_id'''

        obj = Card.query.filter_by(card_id=card_id, list_id=list_id).first()

        # Checking whether List record is present
        if not obj:
            raise DataError(status_code=404)

        # Update User's last login
        list_obj = List.query.filter_by(list_id=list_id).first()
        user_obj = User.query.filter_by(user_id=list_obj.user_id).first()
        user_obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.delete(obj)
        db.session.commit()
        return '', 200

    @marshal_with(output)
    def post(self, list_id):
        '''Creates a new Card details'''

        list_obj = List.query.filter_by(list_id=list_id).first()
        # Checking whether List record is present
        if list_obj is None:
            raise DataError(status_code=404)

        form = request.get_json()
        obj = Card(list_id=list_id, title=form.get('title'), content=form.get('content'),
                   deadline=form.get('deadline'), flag=form.get('flag'))
        if (obj.flag):
            obj.completed = datetime.now().strftime("%Y-%m-%dT%H:%M")

        # Input data checking
        if obj.title is None or type(obj.title) != str or len(obj.title) == 0:
            raise LogicError(status_code=400, error_code="CARD001",
                             error_msg="Card title is required and must be string.")
        if obj.content is None or type(obj.content) != str or len(obj.content) == 0:
            raise LogicError(status_code=400, error_code="CARD002",
                             error_msg="Card content is required and must be string.")
        if obj.deadline is None or type(obj.deadline) != str or len(obj.deadline) == 0:
            raise LogicError(status_code=400, error_code="CARD003",
                             error_msg="Deadline is required and must be string.")

        # Checking whether a Card record with same title and list_id is present
        if Card.query.filter_by(title=obj.title, list_id=list_id).first():
            raise DataError(status_code=409)

        # Update User's last login
        user_obj = User.query.filter_by(user_id=list_obj.user_id).first()
        user_obj.last_logged = datetime.now().strftime("%Y-%m-%dT%H:%M")

        db.session.add(obj)
        db.session.commit()
        return obj, 201
