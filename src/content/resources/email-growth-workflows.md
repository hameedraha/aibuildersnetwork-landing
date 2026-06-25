---
title: email & growth workflows
description: n8n workflows for welcome emails and waitlist signups — the first automations every launch needs.
pubDate: 2026-06-24
category: workflows
tags: [n8n, email, growth, marketing]
workflows:
  - id: welcome-email-sequence
    title: welcome email sequence
    description: fires on signup — extracts user data, sends a welcome email, and adds them to your mailing list.
  - id: waitlist-signup
    title: waitlist signup
    description: validates email, saves to supabase, sends confirmation, and pings slack when someone joins.
---

Wire these before you announce. A welcome email and a working waitlist are the minimum viable growth stack.

## welcome email sequence

Triggers on a signup webhook from your app. Extracts name and email, sends a welcome message, then adds the contact to your mailing list via API.

## waitlist signup

Handles landing page form submissions. Validates the email, stores in supabase, sends a confirmation, and notifies your team in slack.
