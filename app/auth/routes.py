from flask import render_template, redirect, url_for, flash, request, session
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash

from . import auth
from ..extensions import mail_smtp , db, User
import random
import string


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        session['email'] = email

        # Find user in the database by email
        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password_hash, password):
            # Password is correct
            session['user_id'] = user.id  # Store user ID in session
            flash('Login successful!', 'success')
            return redirect(url_for('main.tools'))
        else:
            flash('Invalid login credentials. Please try again.', 'danger')
    return render_template('auth/login.html')

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        repeatpassword = request.form['repeatpassword']

        # Generate OTP and store it in session
        otp = ''.join(random.choices(string.digits, k=6))  # 6-digit OTP
        session['otp'] = otp
        session['email'] = email
        session['password'] = password
        session['repeatpassword'] = repeatpassword

        if password == repeatpassword:

            # Send OTP to user's email
            send_otp(email, otp)
            
            return redirect(url_for('auth.verify'))
        
        else:
            flash("Password Did Not Match", 'try again')

    return render_template('auth/register.html')

# Route to display the OTP verification form
@auth.route('/verify', methods=['GET', 'POST'])
def verify():
    if request.method == 'POST':
        entered_otp = request.form['otp']
        stored_otp = session.get('otp')

        # Verify if the entered OTP matches the one sent to the user's email
        if entered_otp == stored_otp:
            flash('OTP verified successfully!', 'success')

            # Hash the password before storing it
            hashed_password = generate_password_hash(session['password'], method='pbkdf2:sha256')

            existing_user = User.query.filter_by(email=session['email']).first()
            if not existing_user:
                # Create a new user record
                new_user = User(email=session['email'], password_hash=hashed_password)
                db.session.add(new_user)
                db.session.commit()

            return redirect(url_for('main.reference'))
        else:
            flash('Invalid OTP. Please try again.', 'danger')

    return render_template('auth/verify.html')

# Route to show a welcome message after successful OTP verification
@auth.route('/welcome')
def welcome():
    return 'Welcome! You have successfully registered using OTP.'

# Function to send OTP email using Flask-Mail
def send_otp(email, otp):
    msg = Message('Your OTP Code', recipients=[email])
    msg.body = f'Your OTP code is: {otp}. This will expire in 5 minutes.'
    try:
        mail_smtp.send(msg)
    except Exception as e:
        flash(f"Error sending OTP: {e}", 'danger')
