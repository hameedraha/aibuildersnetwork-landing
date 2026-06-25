---
title: vibe coding checklist
description: a pre-ship checklist for builders using ai tools — what to verify before you call it done.
pubDate: 2026-06-22
category: reference
tags: [vibe-coding, shipping, quality, checklist]
downloads:
  - label: printable checklist
    url: /resources/downloads/vibe-coding-checklist.txt
    fileType: txt
---

Ai tools let you move fast. This checklist keeps you from shipping fast garbage.

## before you commit

- [ ] read every line the ai wrote — no blind accepts
- [ ] run the code locally, not just "it compiled"
- [ ] check for hardcoded secrets, api keys, localhost urls
- [ ] verify imports exist and packages are in package.json
- [ ] remove console.logs and dead code the ai left behind

## before you merge

- [ ] tests pass (or you wrote tests for the new behavior)
- [ ] no `any` types unless you can defend them
- [ ] error states handled — not just happy path
- [ ] loading and empty states exist in the ui
- [ ] mobile layout doesn't break

## before you ship

- [ ] env vars documented — nothing only works on your machine
- [ ] auth checked on every protected route
- [ ] rate limiting on public endpoints
- [ ] analytics or logging so you know when it breaks
- [ ] rollback plan — can you revert in under 5 minutes?

## ai-specific checks

- [ ] prompts versioned in git, not scattered in code
- [ ] model output parsed as structured data where possible
- [ ] fallback when the model fails or times out
- [ ] cost per request measured — no surprise bills
- [ ] pii not sent to third-party models without consent

## the rule

If you can't explain what the code does line by line, it's not ready to ship.
