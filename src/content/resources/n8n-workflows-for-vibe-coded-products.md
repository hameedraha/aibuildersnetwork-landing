---
title: n8n workflow starter kit
description: an overview of the automation workflows every vibe-coded product needs — with links to import-ready packs for email, auth, and ai.
pubDate: 2026-06-25
category: workflows
tags: [n8n, automation, saas, starter-kit]
downloads:
  - label: import guide
    url: /resources/downloads/n8n-workflows-readme.txt
    fileType: txt
---

Every vibe-coded product hits the same automation needs in week one. This starter kit maps the patterns and points you to import-ready n8n workflows you can run today.

## the three packs

**email & growth** — welcome sequences and waitlist signups. the first automations you wire after launch.

**auth** — otp request and verify flow with redis + sms. phone auth without building it from scratch.

**ai automation** — support bot with chat history and a content pipeline for newsletters. ai that runs on a schedule, not just in a chat window.

## how to import

1. open your n8n instance
2. create new workflow → import from file
3. download the `.json` from any workflow page below
4. swap credentials (resend, twilio, openai, supabase) for your own
5. activate and point your app webhooks at the n8n urls

## workflow packs

- [email & growth workflows](/resources/email-growth-workflows) — welcome email, waitlist signup
- [auth workflows](/resources/auth-workflows) — otp verification
- [ai automation workflows](/resources/ai-automation-workflows) — support bot, content pipeline
