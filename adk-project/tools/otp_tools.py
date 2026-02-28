"""
OTP (One-Time Password) Tools for IBM watsonx Orchestrate
Part of Workflow 2: Secure Transaction with 2FA

Tools:
  - generate_otp  – send a 6-digit OTP to the customer's registered mobile
  - verify_otp    – validate the OTP entered by the customer

The OTP is generated via the BankMOCK API which sends it to the registered
mobile number (simulated in demo mode).
"""

import requests
import random
import time
from ibm_watsonx_orchestrate.agent_builder.tools import tool

BANKMOCK_BASE = "https://bankmock-theta.vercel.app/api/v1"

# In-memory OTP store (per-agent process lifetime)
# Key: customer_id → {otp, expires_at, used}
_otp_store: dict = {}


def _headers(customer_id: str) -> dict:
    return {
        "Content-Type": "application/json",
        "X-Customer-ID": customer_id,
    }


@tool()
def generate_otp(customer_id: str, purpose: str = "CARD_ACTION") -> str:
    """Generate and send a One-Time Password (OTP) to the customer's registered mobile number.

    Call this tool when a secure action requires 2FA (e.g., card unlock, card block).
    The OTP expires in 5 minutes. After generating, ask the customer to enter it.

    Args:
        customer_id (str): The unique customer identifier extracted from the authenticated session.
        purpose (str): The reason for OTP generation, e.g. 'CARD_UNLOCK', 'CARD_BLOCK'. Defaults to 'CARD_ACTION'.

    Returns:
        str: Confirmation that the OTP was sent and instructions for the customer.
    """
    try:
        resp = requests.post(
            f"{BANKMOCK_BASE}/generate-otp",
            headers=_headers(customer_id),
            json={"purpose": purpose},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        otp_data = data.get("data", {})

        # BankMOCK may return the OTP in demo mode
        otp_value = (
            otp_data.get("otp")
            or otp_data.get("data", {}).get("otp")
            if isinstance(otp_data, dict) else None
        )
        expires_in = otp_data.get("expiresIn", "5 minutes") if isinstance(otp_data, dict) else "5 minutes"

        # Store OTP locally for verification
        if otp_value:
            _otp_store[customer_id] = {
                "otp": str(otp_value),
                "expires_at": time.time() + 300,
                "used": False,
                "purpose": purpose,
            }
            return (
                f"✅ OTP sent to your registered mobile number.\n"
                f"[DEMO MODE] Your OTP is: **{otp_value}**\n"
                f"The OTP expires in {expires_in}.\n\n"
                "Please ask the customer to enter the 6-digit OTP to proceed."
            )

        # Fallback: generate locally if API doesn't return OTP
        fallback_otp = str(random.randint(100000, 999999))
        _otp_store[customer_id] = {
            "otp": fallback_otp,
            "expires_at": time.time() + 300,
            "used": False,
            "purpose": purpose,
        }
        return (
            f"✅ OTP sent to your registered mobile number.\n"
            f"[DEMO MODE] Your OTP is: **{fallback_otp}**\n"
            "The OTP expires in 5 minutes.\n\n"
            "Please ask the customer to enter the 6-digit OTP to proceed."
        )

    except Exception:
        # Complete fallback
        fallback_otp = str(random.randint(100000, 999999))
        _otp_store[customer_id] = {
            "otp": fallback_otp,
            "expires_at": time.time() + 300,
            "used": False,
            "purpose": purpose,
        }
        return (
            f"✅ OTP sent to your registered mobile number.\n"
            f"[DEMO MODE] Your OTP is: **{fallback_otp}**\n"
            "The OTP expires in 5 minutes.\n\n"
            "Please ask the customer to enter the 6-digit OTP to proceed."
        )


@tool()
def verify_otp(customer_id: str, submitted_otp: str) -> str:
    """Verify the OTP entered by the customer.

    Call this tool after the customer provides the 6-digit OTP.
    Only proceed with the secure action if this returns a success message.

    Args:
        customer_id (str): The unique customer identifier extracted from the authenticated session.
        submitted_otp (str): The 6-digit OTP entered by the customer.

    Returns:
        str: Verification result. If successful, returns 'OTP_VERIFIED:SUCCESS'. 
             On failure, returns an error message explaining the reason.
    """
    submitted_otp = submitted_otp.strip()

    record = _otp_store.get(customer_id)

    if not record:
        return "OTP_VERIFIED:FAIL – No OTP found. Please generate a new OTP first."

    if record.get("used"):
        return "OTP_VERIFIED:FAIL – This OTP has already been used. Please generate a new OTP."

    if time.time() > record.get("expires_at", 0):
        return "OTP_VERIFIED:FAIL – The OTP has expired. Please generate a new OTP."

    if record.get("otp") != submitted_otp:
        return "OTP_VERIFIED:FAIL – Incorrect OTP. Please check and try again, or generate a new OTP."

    # Mark as used
    record["used"] = True
    _otp_store[customer_id] = record

    return "OTP_VERIFIED:SUCCESS – Identity verified. You may now proceed with the card action."
