from flask import Flask
from .config import Config
from .extensions import db , mail_smtp , mail_imap , cache

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    mail_smtp.init_app(app)
    mail_imap.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
    cache.init_app(app)

    print("Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])

    # Create the database tables
    with app.app_context():
        db.create_all()

    # Register blueprints
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/auth')

    from .payment import payment as payment_blueprint
    app.register_blueprint(payment_blueprint, url_prefix='/payment')

    return app
