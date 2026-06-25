n8n Workflows — AI Builders Network
====================================

Import any workflow JSON from /resources/workflows/ into n8n:

1. Open your n8n instance
2. Create new workflow → Import from file
3. Select the downloaded .json
4. Configure credentials for each node
5. Activate the workflow

Available workflows:
- welcome-email-sequence.json — signup → welcome email → mailing list
- otp-verification.json — request/verify OTP via SMS
- waitlist-signup.json — form → supabase → confirmation → slack
- ai-support-bot.json — chat webhook with OpenAI + history
- ai-content-pipeline.json — RSS → scrape → summarize → newsletter

Docs: https://docs.n8n.io/workflows/export-import/
