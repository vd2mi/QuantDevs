# Backend Environment Setup

Your `.env` file should contain:

```
PORT=7860
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4.1
```

**Important Notes:**
- Replace `your_openai_api_key_here` with your actual OpenAI API key (starts with `sk-`)
- The model name is set to `gpt-4.1` as specified
- You can change it to other valid models if needed:
  - `gpt-4.1`
  - `gpt-4o-mini`
  - `gpt-4o`
  - `gpt-4-turbo`
  - `gpt-4`

**To edit your .env file:**
1. Open `backend\.env` in Notepad
2. Replace `your_openai_api_key_here` with your actual key
3. Make sure the model is `gpt-4o-mini` (or another valid model)
4. Save the file
5. Restart the backend server

