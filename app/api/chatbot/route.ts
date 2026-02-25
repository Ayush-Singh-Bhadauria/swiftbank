import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface IBMOrchestrateRequest {
  input: {
    message_type: string;
    text: string;
  };
  context?: {
    skills?: Record<string, any>;
  };
}

interface IBMOrchestrateResponse {
  output: {
    generic: Array<{
      response_type: string;
      text?: string;
    }>;
    intents?: Array<{
      intent: string;
      confidence: number;
    }>;
  };
  context?: Record<string, any>;
}

// Fallback responses if IBM Orchestrate is not configured
const fallbackResponses: Record<string, string> = {
  'check my balance': 'You can view your current balance in the Account Summary section at the top of your dashboard.',
  'recent transactions': 'To view your recent transactions, navigate to the Transactions page from the sidebar or click the "View Transactions" quick action.',
  'transfer money': 'To transfer money, click on the "Transfer" option in the sidebar or use the quick action button on your dashboard.',
  'account statement': 'You can download your account statement by going to the Transactions page and clicking the "Download Statement" button.',
  'help with cards': 'For card-related queries, please visit your Profile page where you can manage your cards and settings.',
  'dispute': 'To raise a dispute, go to the Dispute page from the sidebar and fill out the dispute form with relevant details.',
  'cheque': 'You can deposit cheques by visiting the Cheque page from the sidebar menu.',
  'password': 'To change your password, go to your Profile page and use the Change Password form.',
  'help': 'I can help you with:\n• Checking balances\n• Viewing transactions\n• Transferring money\n• Account statements\n• Card management\n• Disputes\n• And more!',
};

function getFallbackResponse(message: string): string {
  const lowercaseText = message.toLowerCase();
  
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (lowercaseText.includes(key)) {
      return response;
    }
  }
  
  return "I'm here to help! You can ask me about:\n• Account balance\n• Recent transactions\n• Money transfers\n• Account statements\n• Card management\n• Raising disputes\n• Cheque deposits\n\nWhat would you like to know?";
}

// Generate IAM access token from API key
async function getIAMToken(apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
    });

    if (!response.ok) {
      throw new Error('Failed to get IAM token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('IAM token error:', error);
    throw error;
  }
}

async function callIBMOrchestrate(message: string): Promise<string> {
  const apiKey = process.env.IBM_ORCHESTRATE_API_KEY;
  const apiUrl = process.env.IBM_ORCHESTRATE_API_URL;
  const assistantId = process.env.IBM_ORCHESTRATE_ASSISTANT_ID;

  if (!apiKey || !apiUrl || !assistantId) {
    console.warn('IBM Orchestrate not configured, using fallback responses');
    return getFallbackResponse(message);
  }

  try {
    // Get IAM access token
    const accessToken = await getIAMToken(apiKey);
    
    // Watson Orchestrate Chat API endpoint (OpenAI-compatible format)
    const chatEndpoint = `${apiUrl}/api/v1/orchestrate/${assistantId}/chat/completions`;
    
    console.log('Calling Watson Orchestrate endpoint:', chatEndpoint);
    
    const messageResponse = await fetch(chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: message,
          }
        ],
        stream: false,
      }),
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error('Watson Orchestrate response failed:', errorText);
      throw new Error('Failed to get Watson Orchestrate response');
    }

    const data = await messageResponse.json();
    console.log('Watson Orchestrate response received:', JSON.stringify(data).substring(0, 200));
    
    // Extract response text (OpenAI-compatible format)
    let responseText = '';
    
    if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      // OpenAI format response
      responseText = data.choices[0].message?.content || '';
    } else if (data.output?.generic && Array.isArray(data.output.generic)) {
      // Watson Assistant format
      responseText = data.output.generic
        .filter((item: any) => item.response_type === 'text' && item.text)
        .map((item: any) => item.text)
        .join('\n');
    } else if (data.response) {
      responseText = typeof data.response === 'string' 
        ? data.response 
        : JSON.stringify(data.response);
    } else if (data.result) {
      responseText = typeof data.result === 'string' 
        ? data.result 
        : data.result.text || JSON.stringify(data.result);
    }

    if (!responseText) {
      console.warn('No response text found in Watson response, using fallback');
      return getFallbackResponse(message);
    }

    return responseText;
  } catch (error) {
    console.error('IBM Orchestrate error:', error);
    return getFallbackResponse(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call IBM Orchestrate or use fallback
    const response = await callIBMOrchestrate(message);

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
