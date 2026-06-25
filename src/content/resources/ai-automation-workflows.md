---
title: ai automation workflows
description: n8n workflows for ai-powered support and content — chat bots with memory and scheduled newsletter pipelines.
pubDate: 2026-06-24
category: workflows
tags: [n8n, ai, support, content]
workflows:
  - id: ai-support-bot
    title: ai support bot
    description: webhook-powered chat endpoint with conversation history stored in redis and openai responses.
  - id: ai-content-pipeline
    title: ai content pipeline
    description: daily digest workflow — fetches rss, scrapes articles, summarizes with ai, and sends a newsletter.
---

Ai in production means endpoints and schedules, not just chat windows. These two workflows cover the most common patterns builders ship in week two.

## ai support bot

A webhook your app calls with `{ message, userId }`. Loads chat history from redis, sends to openai, saves the updated history, and returns the reply as json.

## ai content pipeline

Runs on a daily schedule. Fetches your rss feed, scrapes each article, summarizes with openai, compiles a newsletter, sends it, and notifies slack.
