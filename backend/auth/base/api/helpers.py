import os
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.core.mail import send_mail
import string, random
from django.conf import settings

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(otp, receiver_email):
    subject = "Your OTP for ft_transcendence Authentication"
    message = (
        f"<p>Hi,</p>"
        f"<p>Here is your OTP: <strong>{otp}</strong></p>"
        f"<p>Use this to authenticate. It will expire in 5 minutes.</p>"
        f"<br>"
        f"<p>Best regards,<br>"
        f"The ft_transcendence Team</p>"
    )
    # message = f"""

    #             <html>

    #                 <body>

    #                     <p>Hi, here is your OTP <b>{otp}</b></p>

    #                     <p>Use this to authenticate. It will expire in 5 minutes.</p>

    #                 </body>

    #             </html>

    #             """
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [receiver_email],
        html_message=message
    )
    # body = f"Your OTP is: {otp}. Use this to authenticate. It will expire in 5 minutes."

    # message = MIMEMultipart()
    # message['From'] = os.getenv('GMAIL')
    # message['To'] = receiver_email
    # message['Subject'] = subject
    # message.attach(MIMEText(body, 'plain'))

    # try:
    #     smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
    #     smtp_server.starttls()
    #     smtp_server.login(os.getenv('GMAIL'), os.getenv('GMAIL_APP_PASSWORD'))
    #     smtp_server.sendmail(os.getenv('GMAIL'), receiver_email, message.as_string())
    #     smtp_server.quit()
    # except Exception as e:
    #     raise Exception(str(e))