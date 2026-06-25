---
title: prompt engineering cheatsheet
description: the patterns that actually move output quality — system prompts, few-shot examples, and structured outputs for production use.
pubDate: 2026-06-20
category: reference
tags: [prompts, llm, production]
downloads:
  - label: prompt patterns cheatsheet
    url: /resources/downloads/prompt-patterns-cheatsheet.txt
    fileType: txt
---

Prompt engineering is less about magic words and more about giving the model the right context, constraints, and output format. These are the patterns builders in the network use daily.

## system prompt structure

A reliable system prompt has four parts:

1. **Role** — who the model is (`you are a code reviewer focused on security`)
2. **Context** — what it knows (`the user is building a Next.js app with Supabase`)
3. **Constraints** — what it must and must not do (`never suggest deprecated APIs`)
4. **Output format** — how to respond (`respond in JSON with keys: issue, severity, fix`)

Keep it under 500 tokens when possible. Long system prompts dilute attention.

## few-shot beats instructions

One good example is worth ten rules. Show the model what you want:

```
Input: "refactor this to use async/await"
Output: [show the exact refactor style you expect]
```

Two to three examples cover most formatting and tone requirements. More than five usually hurts generalization.

## structured outputs

For production, always request structured output when you need to parse results:

- Use JSON mode or response schemas where supported
- Define required fields explicitly
- Include an `error` or `unable_to_complete` field for graceful failure

Parsing free-form text in production is a bug waiting to happen.

## chain of thought (when it helps)

Ask the model to reason step-by-step for:

- Multi-step math or logic
- Complex code debugging
- Decisions with trade-offs

Skip it for simple transformations — it adds latency and cost without benefit.

## testing prompts

Treat prompts like code:

- Keep a test set of 10–20 real inputs
- Run them on every prompt change
- Score outputs manually or with a second model pass

The builders who ship reliable AI features version their prompts in git and regression-test them.

## quick reference

| Pattern | Use when |
|---------|----------|
| System role + constraints | Every production prompt |
| Few-shot examples | Formatting, tone, edge cases |
| JSON / schema output | Anything downstream parses |
| Step-by-step reasoning | Complex logic, debugging |
| Delimiters (`"""`, `###`) | Separating user content from instructions |

Download the full cheatsheet below for copy-paste templates.
