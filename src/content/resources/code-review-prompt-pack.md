---
title: code review prompt pack
description: prompts for security reviews, performance audits, and pr summaries — run before you merge ai-generated code.
pubDate: 2026-06-21
category: prompts
tags: [prompts, code-review, security, quality]
prompts:
  - id: security-review
    title: security review
    description: scan a diff for auth, injection, and secret exposure issues.
  - id: performance-review
    title: performance review
    description: find n+1 queries, missing indexes, and render bottlenecks.
  - id: pr-summary
    title: pr summary
    description: generate a clear pr description from a diff or file list.
---

Ai writes fast. These prompts help you review fast too. Paste your code or diff after the prompt.
