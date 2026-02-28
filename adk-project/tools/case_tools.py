"""
Case Management Tools for IBM watsonx Orchestrate
Covers Workflow 3: Complaint / Case Lifecycle

Tools:
  - create_complaint_case   – register a new complaint and return a case ID
  - get_complaint_case      – retrieve status and details of an existing case
  - close_complaint_case    – mark a case as resolved/closed
  - escalate_complaint_case – escalate a case to a human agent with transcript

Case states: OPEN → VERIFIED → CLOSED | ESCALATED
"""

import time
import random
import string
from typing import Optional
from ibm_watsonx_orchestrate.agent_builder.tools import tool

# In-memory case store (per-agent process lifetime, sufficient for demo)
# Key: case_id → AgentCase dict
_cases: dict = {}


def _make_case_id() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"CASE-{int(time.time() * 1000)}-{suffix}"


def _now_iso() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"


@tool()
def create_complaint_case(
    customer_id: str,
    customer_name: str,
    complaint_type: str,
    description: str,
    cheque_number: Optional[str] = None,
) -> str:
    """Register a new complaint/case for the authenticated customer.

    Use this tool when the customer reports an issue such as a cheque not being
    credited, a missing transaction, or any other banking complaint.

    Args:
        customer_id (str): The unique customer identifier from the authenticated session.
        customer_name (str): The full name of the customer.
        complaint_type (str): Type of complaint. Use one of: CHEQUE_NOT_CREDITED, MISSING_TRANSACTION, CARD_ISSUE, GENERAL_COMPLAINT.
        description (str): Detailed description of the complaint as stated by the customer.
        cheque_number (str, optional): The cheque number, if the complaint relates to a cheque.

    Returns:
        str: Confirmation message with the new case ID, status, and next steps.
    """
    case_id = _make_case_id()
    created_at = _now_iso()

    _cases[case_id] = {
        "caseId": case_id,
        "customerId": customer_id,
        "customerName": customer_name,
        "type": complaint_type,
        "description": description,
        "chequeNumber": cheque_number,
        "status": "OPEN",
        "resolution": None,
        "assignedAgent": None,
        "createdAt": created_at,
        "updatedAt": created_at,
    }

    cheque_note = f"\n• Cheque Number:  {cheque_number}" if cheque_number else ""
    return (
        f"✅ Complaint registered successfully!\n\n"
        f"📁 Case Details:\n"
        f"• Case ID:        {case_id}\n"
        f"• Type:           {complaint_type.replace('_', ' ')}\n"
        f"• Status:         OPEN\n"
        f"• Description:    {description}{cheque_note}\n"
        f"• Created At:     {created_at[:10]}\n\n"
        "You will receive updates at your registered mobile/email. "
        "Is this resolved to your satisfaction, or would you like to escalate to a human agent?"
    )


@tool()
def get_complaint_case(customer_id: str, case_id: str) -> str:
    """Retrieve the current status and details of an existing complaint case.

    Args:
        customer_id (str): The unique customer identifier from the authenticated session.
        case_id (str): The case ID to look up (format: CASE-XXXXXXXXXX-XXXXX).

    Returns:
        str: The case details including current status, description, and resolution.
    """
    case = _cases.get(case_id)

    if not case:
        return f"Case {case_id} not found. Please verify the case ID and try again."

    if case.get("customerId") != customer_id:
        return f"Case {case_id} does not belong to your account."

    agent_note = f"\n• Assigned Agent: {case['assignedAgent']}" if case.get("assignedAgent") else ""
    resolution_note = f"\n• Resolution:     {case['resolution']}" if case.get("resolution") else ""

    return (
        f"📁 Case {case_id}:\n"
        f"• Status:         {case.get('status', 'OPEN')}\n"
        f"• Type:           {case.get('type', '').replace('_', ' ')}\n"
        f"• Description:    {case.get('description', 'N/A')}\n"
        f"• Created:        {case.get('createdAt', '')[:10]}\n"
        f"• Last Updated:   {case.get('updatedAt', '')[:10]}"
        f"{agent_note}{resolution_note}"
    )


@tool()
def close_complaint_case(customer_id: str, case_id: str, resolution_note: str = "Resolved – customer satisfied") -> str:
    """Close a complaint case when the customer is satisfied with the resolution.

    Args:
        customer_id (str): The unique customer identifier from the authenticated session.
        case_id (str): The case ID to close.
        resolution_note (str): A brief note on how the issue was resolved.

    Returns:
        str: Confirmation that the case has been closed.
    """
    case = _cases.get(case_id)

    if not case:
        return f"Case {case_id} not found."

    if case.get("customerId") != customer_id:
        return f"Case {case_id} does not belong to your account."

    case["status"] = "CLOSED"
    case["resolution"] = resolution_note
    case["updatedAt"] = _now_iso()

    return (
        f"✅ Case {case_id} has been CLOSED.\n"
        f"Resolution: {resolution_note}\n\n"
        "Thank you for banking with SwiftBank. Is there anything else I can help you with?"
    )


@tool()
def escalate_complaint_case(
    customer_id: str,
    case_id: str,
    reason: str = "Customer not satisfied with initial resolution",
) -> str:
    """Escalate an open complaint case to a human senior agent.

    Use this tool when the customer explicitly requests escalation or is not
    satisfied with the automated resolution.

    Args:
        customer_id (str): The unique customer identifier from the authenticated session.
        case_id (str): The case ID to escalate.
        reason (str): Reason for escalation.

    Returns:
        str: Confirmation of escalation with the assigned human agent name and expected contact time.
    """
    case = _cases.get(case_id)

    # Create a new case if case_id not yet in memory (e.g., first message is escalation)
    if not case:
        case_id = _make_case_id()
        _cases[case_id] = {
            "caseId": case_id,
            "customerId": customer_id,
            "customerName": "Customer",
            "type": "GENERAL_COMPLAINT",
            "description": reason,
            "status": "OPEN",
            "resolution": None,
            "assignedAgent": None,
            "createdAt": _now_iso(),
            "updatedAt": _now_iso(),
        }
        case = _cases[case_id]

    agents = ["Priya Verma", "Rohit Sharma", "Anita Desai", "Karan Mehta"]
    assigned = random.choice(agents)

    case["status"] = "ESCALATED"
    case["assignedAgent"] = assigned
    case["updatedAt"] = _now_iso()

    return (
        f"🔴 Case {case_id} has been ESCALATED to a senior agent.\n\n"
        f"• Assigned Agent:  {assigned}\n"
        f"• Reason:          {reason}\n"
        f"• Escalation Time: {_now_iso()[:10]}\n\n"
        "Our agent will contact you within 30 minutes on your registered mobile number. "
        "The full conversation transcript has been forwarded. "
        "Is there anything else you'd like to note for the agent?"
    )
