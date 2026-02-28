# SwiftBank ADK Project – IBM watsonx Orchestrate

Enterprise-grade, authenticated, agentic contact center assistant for SwiftBank.
All agents run on IBM watsonx Orchestrate cloud. The Next.js frontend embeds the
WO chat widget to provide a seamless in-app experience.

---

## Architecture

```
SwiftBank_Orchestrator          ← Main router agent (style: react)
├── Banking_Info_Agent          ← Workflow 1: Information Retrieval
│   └── Tools: get_account_balance, get_recent_transactions,
│              get_account_details, get_cheque_status
├── Card_Action_Agent           ← Workflow 2: Card Management + OTP 2FA
│   ├── Tools: get_card_status, unlock_atm_card, block_atm_card
│   └── OTP_Agent (collaborator)
│       └── Tools: generate_otp, verify_otp
└── Case_Management_Agent       ← Workflow 3: Complaint Lifecycle
    └── Tools: create_complaint_case, get_complaint_case,
               close_complaint_case, escalate_complaint_case
```

---

## Project Structure

```
adk-project/
├── agents/
│   ├── hello-world-agent.yaml         # Tutorial sample
│   ├── banking-info-agent.yaml        # Workflow 1
│   ├── otp-agent.yaml                 # 2FA sub-agent
│   ├── card-action-agent.yaml         # Workflow 2
│   ├── case-management-agent.yaml     # Workflow 3
│   └── swiftbank-orchestrator.yaml    # Main orchestrator
├── tools/
│   ├── banking_info_tools.py          # balance, transactions, account, cheque
│   ├── otp_tools.py                   # generate_otp, verify_otp
│   ├── card_tools.py                  # get_card_status, unlock, block
│   └── case_tools.py                  # create, get, close, escalate cases
├── flows/
├── knowledge/
└── .env                               # WO_INSTANCE + WO_API_KEY (already configured)
```

---

## Credentials

Already configured in `.env`:
- `WO_INSTANCE` – watsonx Orchestrate instance URL (us-south)
- `WO_API_KEY`  – IBM IAM API key

---

## Project Structure Created
```
adk-project/
├── agents/                 # Agent specifications (.yaml files)
│   └── hello-world-agent.yaml
├── tools/                  # Custom Python tools for agents
├── knowledge/              # Knowledge bases for agent search
└── flows/                  # Agent workflows and orchestrations
```

## Required: Environment Configuration

To complete the setup and test your agents, you need to configure your watsonx Orchestrate credentials.

### Option 1: Use Existing watsonx Orchestrate Account
If you have a watsonx Orchestrate account, set these environment variables:
```bash
$env:WO_INSTANCE = "your-service-instance-url"
$env:WO_API_KEY = "your-api-key"
```

### Option 2: Use WatsonX AI Credentials
If you have WatsonX AI access:
```bash
$env:WATSONX_SPACE_ID = "your-space-id"
$env:WATSONX_APIKEY = "your-api-key"
```

### Option 3: Get Free Trial
Sign up for a free 30-day trial at: https://www.ibm.com/watsonx/orchestrate

## Next Steps

1. **Set Environment Variables** (choose option above)
2. **Activate Local Environment**: `orchestrate env activate local`
3. **Start Local Server**: `orchestrate server start`
4. **Import Test Agent**: `orchestrate agents import -f agents/hello-world-agent.yaml`
5. **Test Agent**: Access the Agent Builder at the provided URL

## Commands Reference

- `orchestrate env list` - List available environments
- `orchestrate env activate <name>` - Activate an environment
- `orchestrate server start` - Start local development server
- `orchestrate agents import -f <file>` - Import agent from YAML
- `orchestrate agents list` - List imported agents
- `orchestrate --help` - Full command help

## For Banking App Integration

Once you create and test your agents, you can integrate them into your banking app using:
- REST API calls to your watsonx Orchestrate instance
- WebSocket connections for real-time chat
- SDK integration for React components
- Custom webhooks for automated workflows

The agents you create will be separate from this banking app but can be called as services from your frontend application.