from flask import render_template, redirect, url_for, flash, request, session, jsonify, copy_current_request_context
from ..extensions import db, User, Reference, Payment, mail_imap
from . import payment
import json
import email
from email.header import decode_header
from bs4 import BeautifulSoup

@payment.route('/user_email', methods=['GET', 'POST'])
def user_email():
    if request.method == 'POST':
        email = request.form['email']
        session['email'] = email
        return redirect(url_for('payment.pay'))
    return render_template('payment/email.html')

@payment.route('/pay', methods=['GET', 'POST'])
def pay():
    # resp = razorpay_client.payment.fetch("pay_PObzFr3exsFK1d")
    # print(resp)
    # for payment in payments:
    #     print(payment)
        # print(f"Payment ID: {payment['id']}, Amount: {payment['amount']}, Status: {payment['status']}")
    
    return redirect('https://rzp.io/rzp/ExxdqSv')

@payment.route('/update', methods=['GET', 'POST'])
def update():
    scan_mail()
    return redirect(url_for('payment.verify'))

@payment.route('/verify', methods=['GET', 'POST'])
def verify():
    print(session['email'])
    payments = Payment.query.filter_by(email=session['email']).all()
    print(payments)
    return render_template('payment/verify.html',payments=payments)

def scan_mail():
    # Select inbox
    mail_imap.select("inbox")

    # Search for emails with a specific subject
    status, messages = mail_imap.search(None, 'SUBJECT "Successful payment on Payment Page - Buy Monthly Subscription"')

    # Fetch the most recent email
    messages = messages[0].split()
    # latest_email_id = messages[-1]
    for msg_id in messages:
        status, msg_data = mail_imap.fetch(msg_id, "(RFC822)")
        # status, msg_data = mail_imap.fetch(latest_email_id, "(RFC822)")

        # Parse the email
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                # Extract subject and from address
                subject, encoding = decode_header(msg["Subject"])[0]
                from_ = msg.get("From")
                # If the email is multipart, get the payload
                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        content_disposition = str(part.get("Content-Disposition"))
                        if "attachment" not in content_disposition:
                            if content_type == "text/plain":
                                body = part.get_payload(decode=True).decode(part.get_content_charset())
                            elif content_type == "text/html":
                                html_body = part.get_payload(decode=True).decode(part.get_content_charset())
                                if session['email'] in html_body : pass
                                else: continue
                                # Parse and extract text from HTML
                                soup = BeautifulSoup(html_body, "html.parser")
                                text_only = soup.get_text(separator="<sep>", strip=True)
                                txt = text_only.split("<sep>")
                                tab = "   "
                                print("Payment Details:", )
                                print(tab,"Amount: ",float(txt[3]+txt[4]), txt[2])
                                print(tab,txt[6],": ",txt[7])
                                print(tab,txt[8],": ",txt[9])
                                print(tab,txt[13],": ",txt[14])
                                print(tab,txt[15],": ",txt[16])
                                
                                existing_payment = Payment.query.filter_by(id=txt[7]).first()
                                if not existing_payment:
                                    new_payment = Payment(id=txt[7], amount=float(txt[3]+txt[4]), date=txt[9], number=txt[14], email=txt[16] )
                                    db.session.add(new_payment)
                                    db.session.commit()





    # # Close connection
    # mail_imap.close()
    # mail_imap.logout()
