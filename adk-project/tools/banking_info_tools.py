"""
Banking Information Tools for IBM watsonx Orchestrate
Covers Workflow 1: Information Retrieval

Tools:
  - get_account_balance
  - get_recent_transactions
  - get_account_details
  - get_cheque_status

All tools call the BankMOCK API: https://bankmock-theta.vercel.app/api/v1
The customer_id is passed as a parameter and forwarded as X-Customer-ID header.
"""

import requests
from ibm_watsonx_orchestrate.agent_builder.tools import tool

BANKMOCK_BASE = "https://bankmock-theta.vercel.app/api/v1"


def _headers(customer_id: str) -> dict:
    return {
        "Content-Type": "application/json",
        "X-Customer-ID": customer_id,
    }


@tool()
def get_account_balance(customer_id: str) -> str:
    """Retrieve the current account balance for the authenticated customer.

    Args:
        customer_id (str): The unique customer identifier extracted from the authenticated session.

    Returns:
        str: A formatted string with the current account balance.
    """
    try:
        resp = requests.get(f"{BANKMOCK_BASE}/balance", headers=_headers(customer_id), timeout=10)
        resp.raise_for_status()
        data = resp.json()
        bal = data.get("data", data)
        amount = bal.get("balance") or bal.get("availableBalance") or bal.get("currentBalance") or "N/A"
        acct = bal.get("accountNumber", "")
        return f"Account balance for {acct}: ₹{amount:,.2f}" if isinstance(amount, (int, float)) else f"Balance: {amount}"
    except requests.HTTPError as e:
        return f"Error retrieving balance: {e.response.status_code} – {e.response.text}"
    except Exception as e:
        return f"Failed to retrieve balance: {str(e)}"


@tool()
def get_recent_transactions(customer_id: str, limit: int = 5) -> str:
    """Retrieve the most recent transactions for the authenticated customer.

    Args:
        customer_id (str): The unique customer identifier extracted from the authenticated session.
        limit (int): Number of transactions to return. Defaults to 5. Maximum 20.

    Returns:
        str: A formatted list of recent transactions.
    """
    try:
        limit = min(max(1, limit), 20)
        resp = requests.get(
            f"{BANKMOCK_BASE}/transactions?limit={limit}",
            headers=_headers(customer_id),
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        raw = data.get("data", data)
        txns = raw.get("transactions", raw) if isinstance(raw, dict) else raw

        if not txns:
            return "No transactions found."

        lines = []
        for i, t in enumerate(txns[:limit], 1):
            sign = "+" if t.get("type") == "CREDIT" else "-"
            lines.append(
                f"{i}. [{t.get('type','?')}] {sign}₹{t.get('amount', 0):,} | "
                f"{t.get('description') or t.get('transactionId','N/A')} | "
                f"{t.get('timestamp','')[:10]}"
            )
        return "Recent transactions:\n" + "\n".join(lines)
    except requests.HTTPError as e:
        return f"Error retrieving transactions: {e.response.status_code}"
    except Exception as e:
        return f"Failed to retrieve transactions: {str(e)}"


@tool()
def get_account_details(customer_id: str) -> str:
    """Retrieve account details such as account number, type, branch, and IFSC for the authenticated customer.

    Args:
        customer_id (str): The unique customer identifier extracted from the authenticated session.

    Returns:
        str: A formatted string with the account details.
    """
    try:
        resp = requests.get(f"{BANKMOCK_BASE}/account", headers=_headers(customer_id), timeout=10)
        resp.raise_for_status()
        data = resp.json()
        acc = data.get("data", data)
        return (
            f"Account Details:\n"
            f"• Account Number: {acc.get('accountNumber', 'N/A')}\n"
            f"• Account Type:   {acc.get('accountType', 'N/A')}\n"
            f"• Branch:         {acc.get('branch', 'N/A')}\n"
            f"• IFSC:           {acc.get('ifsc', 'N/A')}\n"
            f"• Status:         {acc.get('accountStatus') or acc.get('status', 'Active')}"
        )
    except requests.HTTPError as e:
        return f"Error retrieving account details: {e.response.status_code}"
    except Exception as e:
        return f"Failed to retrieve account details: {str(e)}"


@tool()
def get_cheque_status(customer_id: str, cheque_number: str) -> str:
    """Retrieve the clearing status of a deposited cheque.

    Args:
        customer_id (str): The unique customer identifier extracted from the authenticated session.
        cheque_number (str): The cheque number to look up (6 or more digits).

    Returns:
        str: The cheque status including amount, clearing date, and current status.
    """
    try:
        resp = requests.get(
            f"{BANKMOCK_BASE}/cheque/{cheque_number}",
            headers=_headers(customer_id),
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        c = data.get("data", data)
        return (
            f"Cheque #{cheque_number} Status:\n"
            f"• Amount:             ₹{c.get('amount', 'N/A')}\n"
            f"• Status:             {c.get('status', 'N/A')}\n"
            f"• Expected Clearance: {c.get('expectedClearanceDate', 'N/A')}"
        )
    except requests.HTTPError as e:
        if e.response.status_code == 404:
            return f"Cheque #{cheque_number} was not found. Please verify the cheque number."
        return f"Error retrieving cheque status: {e.response.status_code}"
    except Exception as e:
        return f"Failed to retrieve cheque status: {str(e)}"
