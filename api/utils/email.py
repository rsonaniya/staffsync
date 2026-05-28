from datetime import datetime
import os
import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
FRONT_END_URL = os.getenv("FRONT_END_URL")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


async def send_brevo_email(
    subject: str,
    email_to: str,
    html_content: str,
):
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
    }

    payload = {
        "sender": {
            "name": "StaffSync Team",
            "email": "rajatsonaniya28@gmail.com",
        },
        "to": [{"email": email_to}],
        "subject": subject,
        "htmlContent": html_content,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                BREVO_API_URL,
                headers=headers,
                json=payload,
            )

            if response.status_code not in [200, 201, 202]:
                print(f"Brevo error response: {response.text}")

                raise HTTPException(
                    status_code=500,
                    detail=f"Email delivery failed: {response.text}",
                )

            print(f"Email successfully sent to {email_to}")

        except httpx.HTTPError as exc:
            print(f"Network error while connecting to Brevo: {exc}")

            raise HTTPException(
                status_code=500,
                detail="Internal network error during email dispatch.",
            )


async def send_account_activation_email(
    email_to: str,
    fullname: str,
    token: str,
):
    activation_link = (
        f"{FRONT_END_URL}/activate-account" f"?token={token}&email={email_to}"
    )

    html_content = f"""
    <html>
        <body style="
            margin: 0;
            padding: 0;
            background-color: #F5F7FB;
            font-family: Arial, sans-serif;
            color: #1F2937;
        ">

            <div style="
                max-width: 640px;
                margin: 40px auto;
                background: #FFFFFF;
                border: 1px solid #E5E7EB;
                border-radius: 18px;
                overflow: hidden;
            ">

                <!-- Header -->
                <div style="
                    padding: 28px 34px;
                    border-bottom: 1px solid #E5E7EB;
                    background-color: #FFFFFF;
                ">

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>

                            <td width="56">
                                <div style="
                                    width: 46px;
                                    height: 46px;
                                    background-color: #0F4DB8;
                                    border-radius: 12px;
                                    text-align: center;
                                    line-height: 46px;
                                    color: #FFFFFF;
                                    font-size: 22px;
                                    font-weight: 700;
                                ">
                                    S
                                </div>
                            </td>

                            <td style="padding-left: 14px;">
                                <div style="
                                    font-size: 25px;
                                    font-weight: 700;
                                    color: #0F172A;
                                ">
                                    StaffSync
                                </div>

                                <div style="
                                    margin-top: 4px;
                                    font-size: 13px;
                                    color: #6B7280;
                                ">
                                    Enterprise Workforce Management Suite
                                </div>
                            </td>

                        </tr>
                    </table>

                </div>

                <!-- Main Content -->
                <div style="padding: 42px 34px;">

                    <h1 style="
                        margin: 0;
                        font-size: 34px;
                        line-height: 1.2;
                        color: #111827;
                        font-weight: 700;
                    ">
                        Welcome, {fullname}
                    </h1>

                    <p style="
                        margin-top: 20px;
                        font-size: 16px;
                        line-height: 1.8;
                        color: #4B5563;
                    ">
                        Your StaffSync employee account has been successfully created.
                        To activate your account and securely configure your password,
                        please continue using the button below.
                    </p>

                    <!-- CTA Button -->
                    <div style="
                        margin-top: 38px;
                        text-align: center;
                    ">

                        <a
                            href="{activation_link}"
                            style="
                                display: inline-block;
                                background-color: #0F4DB8;
                                color: #FFFFFF;
                                text-decoration: none;
                                padding: 15px 34px;
                                border-radius: 10px;
                                font-size: 15px;
                                font-weight: 600;
                            "
                        >
                            Activate Account & Set Password
                        </a>

                    </div>

                    <!-- Alternative Link -->
                    <div style="
                        margin-top: 34px;
                        padding: 18px;
                        background-color: #F9FAFB;
                        border: 1px solid #E5E7EB;
                        border-radius: 12px;
                    ">

                        <p style="
                            margin: 0 0 10px 0;
                            font-size: 13px;
                            color: #6B7280;
                        ">
                            If the button above does not work, copy and paste the following link into your browser:
                        </p>

                        <p style="
                            margin: 0;
                            font-size: 13px;
                            color: #0F4DB8;
                            word-break: break-all;
                            line-height: 1.6;
                        ">
                            {activation_link}
                        </p>

                    </div>

                    <!-- Expiry Notice -->
                    <p style="
                        margin-top: 30px;
                        font-size: 13px;
                        line-height: 1.7;
                        color: #6B7280;
                    ">
                        This secure activation link will expire in
                        <strong>24 Hours</strong>.
                        If you were not expecting this email, you may safely ignore it.
                    </p>

                </div>

                <!-- Footer -->
                <div style="
                    padding: 24px 34px;
                    background-color: #F9FAFB;
                    border-top: 1px solid #E5E7EB;
                    text-align: center;
                ">

                    <p style="
                        margin: 0;
                        font-size: 12px;
                        color: #9CA3AF;
                    ">
                        © {datetime.now().year} StaffSync Enterprise Suite
                    </p>

                </div>

            </div>

        </body>
    </html>
    """

    await send_brevo_email(
        "Activate Your StaffSync Account",
        email_to,
        html_content,
    )


async def send_reset_password_email(
    email_to: str,
    fullname: str,
    token: str,
):
    reset_password_link = (
        f"{FRONT_END_URL}/reset-password" f"?token={token}&email={email_to}"
    )

    html_content = f"""
    <html>
        <body style="
            margin: 0;
            padding: 0;
            background-color: #F5F7FB;
            font-family: Arial, sans-serif;
            color: #1F2937;
        ">

            <div style="
                max-width: 640px;
                margin: 40px auto;
                background: #FFFFFF;
                border: 1px solid #E5E7EB;
                border-radius: 18px;
                overflow: hidden;
            ">

                <!-- Header -->
                <div style="
                    padding: 28px 34px;
                    border-bottom: 1px solid #E5E7EB;
                    background-color: #FFFFFF;
                ">

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>

                            <td width="56">
                                <div style="
                                    width: 46px;
                                    height: 46px;
                                    background-color: #0F4DB8;
                                    border-radius: 12px;
                                    text-align: center;
                                    line-height: 46px;
                                    color: #FFFFFF;
                                    font-size: 22px;
                                    font-weight: 700;
                                ">
                                    S
                                </div>
                            </td>

                            <td style="padding-left: 14px;">
                                <div style="
                                    font-size: 25px;
                                    font-weight: 700;
                                    color: #0F172A;
                                ">
                                    StaffSync
                                </div>

                                <div style="
                                    margin-top: 4px;
                                    font-size: 13px;
                                    color: #6B7280;
                                ">
                                    Enterprise Workforce Management Suite
                                </div>
                            </td>

                        </tr>
                    </table>

                </div>

                <!-- Main Content -->
                <div style="padding: 42px 34px;">

                    <h1 style="
                        margin: 0;
                        font-size: 34px;
                        line-height: 1.2;
                        color: #111827;
                        font-weight: 700;
                    ">
                        Password Reset Request
                    </h1>

                    <p style="
                        margin-top: 20px;
                        font-size: 16px;
                        line-height: 1.8;
                        color: #4B5563;
                    ">
                        Hello {fullname},
                        <br /><br />
                        We received a request to reset the password for your
                        StaffSync account.
                        To securely create a new password, please continue
                        using the button below.
                    </p>

                    <!-- CTA Button -->
                    <div style="
                        margin-top: 38px;
                        text-align: center;
                    ">

                        <a
                            href="{reset_password_link}"
                            style="
                                display: inline-block;
                                background-color: #0F4DB8;
                                color: #FFFFFF;
                                text-decoration: none;
                                padding: 15px 34px;
                                border-radius: 10px;
                                font-size: 15px;
                                font-weight: 600;
                            "
                        >
                            Reset Password
                        </a>

                    </div>

                    <!-- Alternative Link -->
                    <div style="
                        margin-top: 34px;
                        padding: 18px;
                        background-color: #F9FAFB;
                        border: 1px solid #E5E7EB;
                        border-radius: 12px;
                    ">

                        <p style="
                            margin: 0 0 10px 0;
                            font-size: 13px;
                            color: #6B7280;
                        ">
                            If the button above does not work, copy and paste the following link into your browser:
                        </p>

                        <p style="
                            margin: 0;
                            font-size: 13px;
                            color: #0F4DB8;
                            word-break: break-all;
                            line-height: 1.6;
                        ">
                            {reset_password_link}
                        </p>

                    </div>

                    <!-- Expiry Notice -->
                    <p style="
                        margin-top: 30px;
                        font-size: 13px;
                        line-height: 1.7;
                        color: #6B7280;
                    ">
                        This secure password reset link will expire in
                        <strong>4 Hours</strong>.
                        <br /><br />
                        If you did not request a password reset, you may safely
                        ignore this email and your account will remain secure.
                    </p>

                </div>

                <!-- Footer -->
                <div style="
                    padding: 24px 34px;
                    background-color: #F9FAFB;
                    border-top: 1px solid #E5E7EB;
                    text-align: center;
                ">

                    <p style="
                        margin: 0;
                        font-size: 12px;
                        color: #9CA3AF;
                    ">
                        © {datetime.now().year} StaffSync Enterprise Suite
                    </p>

                </div>

            </div>

        </body>
    </html>
    """

    await send_brevo_email(
        "Reset Your StaffSync Password",
        email_to,
        html_content,
    )
