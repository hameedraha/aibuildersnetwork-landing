---
title: auth workflows
description: phone otp verification with n8n — generate, store, send, and verify codes without custom auth infrastructure.
pubDate: 2026-06-24
category: workflows
tags: [n8n, auth, otp, security]
workflows:
  - id: otp-verification
    title: otp verification
    description: phone auth flow — generates a 6-digit code, stores it in redis, sends via sms, and verifies on callback.
---

Phone auth is table stakes for mobile-first products. This workflow handles the full otp loop so your app just calls two webhooks.

## how it works

**request otp** — your app posts a phone number. n8n generates a 6-digit code, stores it in redis with a 5-minute ttl, and sends it via twilio.

**verify otp** — your app posts phone + code. n8n looks up the stored code, returns a session token on match or 401 on failure.

## what to configure

- redis connection for code storage
- twilio credentials for sms delivery
- jwt signing in the "return session" node (replace placeholder)
