# IBM Watson/Orchestrate Chatbot Integration

This banking app now includes an AI-powered chatbot using IBM Watson Assistant (IBM Orchestrate).

## Features

- ✅ Real-time AI responses powered by IBM Watson
- ✅ Fallback to rule-based responses when IBM Watson is not configured
- ✅ Loading states and smooth animations
- ✅ Context-aware conversations
- ✅ Quick reply buttons for common queries
- ✅ Beautiful floating chat interface

## Setup Instructions

### 1. Create an IBM Cloud Account

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Sign up for a free account (Lite plan available)
3. Navigate to the Watson Assistant service

### 2. Create a Watson Assistant Instance

1. In IBM Cloud Dashboard, go to **Catalog**
2. Search for "Watson Assistant"
3. Click on Watson Assistant
4. Select the **Lite** plan (free)
5. Choose a region (e.g., Dallas/us-south)
6. Click **Create**

### 3. Get Your API Credentials

1. Once created, go to your Watson Assistant instance
2. Click on **Manage** in the left sidebar
3. Copy the following:
   - **API Key**: Your service API key
   - **URL**: The service endpoint URL (e.g., https://api.us-south.assistant.watson.cloud.ibm.com)

### 4. Create an Assistant

1. Click **Launch Watson Assistant**
2. Create a new Assistant
3. Go to **Assistant Settings** → **API Details**
4. Copy your **Assistant ID**

### 5. Train Your Assistant (Optional but Recommended)

Add intents for banking queries:

**Balance Intent:**
- Check my balance
- What's my account balance?
- How much money do I have?
- Show my balance

**Transaction Intent:**
- Show my transactions
- Recent transactions
- Transaction history
- What did I spend?

**Transfer Intent:**
- Transfer money
- Send money
- Make a transfer
- How do I transfer funds?

**Statement Intent:**
- Download statement
- Get my statement
- Account statement
- Bank statement

**Card Help Intent:**
- Help with my card
- Card issues
- Manage cards
- Card services

### 6. Configure Environment Variables

Update your `.env.local` file:

```env
# IBM Watson/Orchestrate Configuration
IBM_ORCHESTRATE_API_KEY=your_api_key_here
IBM_ORCHESTRATE_API_URL=https://api.us-south.assistant.watson.cloud.ibm.com
IBM_ORCHESTRATE_ASSISTANT_ID=your_assistant_id_here
```

### 7. Restart Your Development Server

```bash
npm run dev
```

## How It Works

### Architecture

1. **User sends message** → Frontend chatbot component
2. **API call** → `/api/chatbot` route
3. **Watson Assistant** → Processes message using AI
4. **Response** → Returned to user

### Fallback System

If IBM Watson is not configured or fails:
- The chatbot automatically falls back to rule-based responses
- Users still get helpful answers to common banking questions
- No error messages shown to users

### API Route

The chatbot API route ([app/api/chatbot/route.ts](app/api/chatbot/route.ts)) handles:
- Creating Watson sessions
- Sending messages to Watson Assistant
- Parsing Watson responses
- Fallback logic
- Error handling

### Frontend Component

The chatbot component ([components/dashboard/chatbot.tsx](components/dashboard/chatbot.tsx)) includes:
- Floating chat button
- Expandable chat window
- Real-time messaging
- Loading states with animated dots
- Quick reply buttons
- Message history
- Responsive design

## Customization

### Update Quick Replies

Edit the `quickReplies` array in `chatbot.tsx`:

```typescript
const quickReplies = [
  'Check my balance',
  'Recent transactions',
  'Transfer money',
  'Account statement',
  'Help with cards',
];
```

### Modify Fallback Responses

Edit the `fallbackResponses` object in `app/api/chatbot/route.ts`:

```typescript
const fallbackResponses: Record<string, string> = {
  'balance': 'Your custom response here...',
  // Add more...
};
```

### Styling

The chatbot uses Tailwind CSS and shadcn/ui components. Customize:
- Colors: Update the Tailwind theme
- Size: Modify `h-[600px] w-[380px]` in the Card component
- Position: Change `bottom-6 right-6` classes

## Testing

1. **Without IBM Watson**: The chatbot works with fallback responses
2. **With IBM Watson**: Test by asking various banking questions
3. **Error handling**: Disconnect network to test error states

## Costs

- **IBM Watson Lite Plan**: Free tier includes:
  - 10,000 messages per month
  - Unlimited assistants
  - Basic NLU features
  - Perfect for development and small apps

## Troubleshooting

### "I'm having trouble connecting"

- Check your API credentials in `.env.local`
- Verify the Watson Assistant is active in IBM Cloud
- Check the API URL matches your region
- Restart the development server

### Slow Responses

- Watson API can take 1-3 seconds
- Consider implementing caching for common queries
- Use the fallback system for instant responses

### Session Errors

- The API creates a new session for each message
- For production, implement session management
- Store session IDs in state or cookies

## Production Considerations

1. **Session Management**: Implement persistent sessions
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Caching**: Cache common responses
4. **Error Logging**: Add logging for debugging
5. **Analytics**: Track chatbot usage and effectiveness

## Resources

- [IBM Watson Assistant Documentation](https://cloud.ibm.com/apidocs/assistant/assistant-v2)
- [Watson Assistant Best Practices](https://cloud.ibm.com/docs/watson-assistant)
- [IBM Cloud Free Tier](https://www.ibm.com/cloud/free)

## Support

For issues or questions:
1. Check IBM Watson logs in IBM Cloud
2. Review browser console for errors
3. Test with fallback responses first
4. Verify environment variables are loaded

---

**Note**: This integration works seamlessly whether IBM Watson is configured or not, ensuring a great user experience in all scenarios.
