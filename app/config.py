import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_key')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

    # Configure the app for SQLAlchemy
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_TYPE = 'sqlalchemy'  
    SESSION_PERMANENT = False  # Make session data non-permanent

    # Set up Flask-Mail
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = 'smtp931@gmail.com'


