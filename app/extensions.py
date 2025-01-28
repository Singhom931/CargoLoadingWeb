from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from flask_caching import Cache
import imaplib

db = SQLAlchemy()
mail_smtp = Mail()
cache = Cache(config={'CACHE_TYPE': 'simple'})
mail_imap = imaplib.IMAP4_SSL("imap.gmail.com")

# User model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class Reference(db.Model):
    __tablename__ = 'references'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=False,)
    reference = db.Column(db.String(50),unique=False, nullable=False)
    __table_args__ = (db.UniqueConstraint('email', 'reference', name='_email_reference_uc'),)

class Container(db.Model):
    __tablename__ = 'bins'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120))
    reference = db.Column(db.String(50), nullable=True)
    name = db.Column(db.String(100), nullable=False)      # Container Name
    length = db.Column(db.Float, nullable=False)          # Length in cm
    width = db.Column(db.Float, nullable=False)           # Width in cm
    height = db.Column(db.Float, nullable=False)          # Height in cm
    weight_capacity = db.Column(db.Float, nullable=False) # Weight Capacity in kg

class Cargo(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120))
    reference = db.Column(db.String(50), nullable=True)
    name = db.Column(db.String(100), nullable=False)  # Cargo Name
    length = db.Column(db.Float, nullable=False)      # Length in cm
    width = db.Column(db.Float, nullable=False)       # Width in cm
    height = db.Column(db.Float, nullable=False)      # Height in cm
    weight = db.Column(db.Float, nullable=False)      # Weight in kg
    quantity = db.Column(db.Integer, nullable=False)  # Quantity
    color = db.Column(db.String(50), nullable=True)   # Color
    rotate = db.Column(db.Boolean, default=False)  # Rotate Allowed
    loadbearing = db.Column(db.Float, nullable=False)  # Stack on top Allowed
    
class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.String(120), primary_key=True, nullable=False)
    amount = db.Column(db.Float, nullable=False)   
    date = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    number = db.Column(db.String(120), nullable=False)
    