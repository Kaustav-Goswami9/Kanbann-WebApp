from datetime import datetime

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = 'Login_db'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    last_logged = db.Column(db.String,
                            default=datetime.now().strftime("%Y-%m-%dT%H:%M"))
    lists = db.relationship("List", cascade="delete")

    def get_id(self):
        return self.user_id


class List(db.Model):
    __tablename__ = 'List'
    list_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("Login_db.user_id"),
                        nullable=False)
    cards = db.relationship('Card', cascade="delete")


class Card(db.Model):
    __tablename__ = 'Card'
    card_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    title = db.Column(db.String, nullable=False)
    content = db.Column(db.String, nullable=False)
    created = db.Column(db.String,
                        default=datetime.now().strftime("%Y-%m-%dT%H:%M"))
    updated = db.Column(db.String,
                        default=datetime.now().strftime("%Y-%m-%dT%H:%M"))
    deadline = db.Column(db.String, nullable=False)
    completed = db.Column(db.String, nullable=True)
    flag = db.Column(db.Boolean, default=False)
    list_id = db.Column(db.Integer,
                        db.ForeignKey("List.list_id"), nullable=False)
