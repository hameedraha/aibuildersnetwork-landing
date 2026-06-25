---
title: rag from scratch
description: a builder's guide to retrieval-augmented generation — chunking, embeddings, and shipping a working search layer in a day.
pubDate: 2026-06-18
category: guides
tags: [ai, rag, embeddings, search]
downloads:
  - label: rag architecture checklist
    url: /resources/downloads/rag-checklist.txt
    fileType: txt
---

RAG is the fastest path from "chat with my data" to something users actually trust. This guide covers the decisions that matter when you're building v1 — not the theory.

## what rag actually does

Your app retrieves relevant chunks from a knowledge base, injects them into the prompt, and lets the model answer using that context. The model doesn't "know" your docs — it reads the snippets you fetch at query time.

## step 1: chunk your content

Split documents into 300–800 token chunks with 50–100 token overlap. Smaller chunks = more precise retrieval. Larger chunks = more context per hit.

Rules that work:
- Split on headings first, then paragraphs
- Keep code blocks intact
- Store metadata: source url, section title, last updated

## step 2: embed and store

Use an embedding model (text-embedding-3-small is fine for v1). Store vectors in pgvector, pinecone, or supabase vector.

Index structure:
```
{ id, content, embedding, metadata: { source, title, chunk_index } }
```

## step 3: retrieve at query time

1. Embed the user's question
2. Cosine similarity search — top 5–10 chunks
3. Re-rank if needed (optional for v1)
4. Inject chunks into system prompt with source citations

## step 4: generate with citations

Tell the model to only answer from provided context and cite sources. If context is insufficient, say so — don't hallucinate.

## common mistakes

- **Chunks too large** — retrieval returns irrelevant walls of text
- **No metadata filtering** — searching across docs the user shouldn't see
- **Skipping eval** — keep 20 test questions and score retrieval quality before tuning prompts
- **Embedding mismatch** — same model for indexing and querying

## ship order

1. Static docs → chunk → embed → search UI (no generation)
2. Add generation with citations
3. Add feedback loop (thumbs up/down on answers)
4. Tune chunk size and top-k based on real queries
