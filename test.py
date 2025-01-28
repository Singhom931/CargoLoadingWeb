import imaplib
import email
from email.header import decode_header
from bs4 import BeautifulSoup

# Connect to Gmail IMAP server
mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login("smtp931@gmail.com", "rtno kzhw fgpf grga")

# Select inbox
mail.select("inbox")

# Search for emails with a specific subject
status, messages = mail.search(None, 'SUBJECT "Successful payment on Payment Page - Buy Monthly Subscription"')

# Fetch the most recent email
messages = messages[0].split()
# latest_email_id = messages[-1]
for msg_id in messages:
    print(msg_id)
    status, msg_data = mail.fetch(msg_id, "(RFC822)")
    # status, msg_data = mail.fetch(latest_email_id, "(RFC822)")

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
                            if "singhom931@gmail.com" in html_body and "8655417452" in html_body: pass
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


# Close connection
mail.close()
mail.logout()
