# Gmail AI Reply Assistant

A Chrome extension that helps you write email responses faster by giving AI context about what you want to say.

## The Problem

Email automation is tricky because:
- Full auto-reply doesn't work - you need control over what gets sent
- Writing drafts for every email wastes API calls
- You still need to give the AI direction on what YOU want to say

## The Solution

This extension adds an "AI Reply" button to Gmail that:
1. Lets you give quick context (e.g., "decline politely", "accept meeting", "ask for pricing")
2. Sends the email + your context to an n8n workflow
3. AI generates a response based on YOUR input
4. You review, copy, and send

**You stay in control. AI just saves you time writing.**

## Demo

![Demo](demos/demo.gif)

## How It Works
```
Gmail Email → Click "AI Reply" → Add Context → n8n Workflow → AI Agent → Generated Response → Copy & Send
```

## Setup

### 1. Clone this repo
```bash
git clone https://github.com/YOUR_USERNAME/gmail-ai-reply.git
cd gmail-ai-reply
```

### 2. Configure your webhook

Open `extension/config.js` and replace `YOUR_WEBHOOK_URL_HERE` with your n8n webhook URL:
```javascript
const CONFIG = {
  webhookUrl: 'https://your-n8n-instance.com/webhook/email-data'
};
```

### 3. Set up the n8n workflow

Import the workflow from `n8n-workflow.json` (instructions below).

The workflow receives:
```json
{
  "author": "sender@example.com",
  "subject": "Email subject",
  "email": "Email body text",
  "userInput": "Your context/instructions",
  "timestamp": "2024-10-22T..."
}
```

Your workflow should:
1. Receive the webhook data
2. Pass it to your AI agent/LLM with a prompt like:
   - "Based on this email and the user's intent, generate an appropriate response"
3. Return the AI response as plain text or JSON with an `output` field

### 4. Load the extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `gmail-ai-reply` folder
5. Open Gmail and test it on any email!

## n8n Workflow Setup

### Basic Workflow Structure
```
Webhook → AI Agent (Claude/GPT/etc) → Respond to Webhook
```

### Example n8n Setup

1. **Webhook Node**
   - Method: POST
   - Path: `/webhook/email-data`
   - Response Mode: "Respond to Webhook"

2. **AI Agent Node** (Claude, ChatGPT, or your preferred LLM)
   - Prompt template:
```
   You are an email response assistant.
   
   Original Email:
   From: {{ $json.author }}
   Subject: {{ $json.subject }}
   Body: {{ $json.email }}
   
   User Intent: {{ $json.userInput }}
   
   Generate a professional email response that matches the user's intent.
   Keep it concise and natural.
```

3. **Respond to Webhook Node**
   - Response: `{{ $json.output }}` (or whatever field your AI returns)

### Import the Workflow

1. Download `n8n-workflow.json` from this repo
2. In n8n, click "Import from File"
3. Select the JSON file
4. Update the AI node with your API key
5. Activate the workflow
6. Copy the webhook URL to `extension/config.js`

## Usage

1. Open any email in Gmail
2. Click the "AI Reply" button next to the Reply button
3. Enter what you want to say (e.g., "accept but ask to reschedule to next week")
4. Click "Generate"
5. Review the response, edit if needed
6. Click "Copy & Close"
7. Paste into Gmail and send!

## Cost Efficiency

You only make API calls when YOU choose to use the assistant, not for every incoming email. This keeps costs low while maintaining full control.

## Customization Ideas

- Add different response templates
- Integrate with your CRM for context
- Support multiple languages
- Add tone selection (formal, casual, friendly)
- Save frequently used responses

## Tech Stack

- Chrome Extension (Manifest V3)
- n8n for workflow automation
- Any AI model (Claude, GPT-4, Llama, etc.)

## Troubleshooting

**Button not appearing?**
- Make sure you're viewing a single email (not inbox list)
- Refresh the Gmail tab
- Check browser console for errors

**Webhook not working?**
- Verify your webhook URL in `config.js`
- Check n8n workflow is activated
- Check browser console and n8n logs

**AI response not showing?**
- Check your n8n workflow returns text in the correct format
- Verify your AI node has valid API credentials

## Contributing

Feel free to fork and submit PRs! Some ideas:
- Add support for other email clients
- Improve UI/UX
- Add more AI providers
- Better error handling

## License

MIT License - feel free to use and modify!

## Questions?

Open an issue or reach out. Happy to help with setup!
