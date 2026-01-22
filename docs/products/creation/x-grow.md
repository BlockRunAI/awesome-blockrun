# x-grow

Write high-performing X posts using real algorithm knowledge.

x-grow is a Claude Code skill that helps you draft, review, and optimize posts for X (Twitter) based on how the algorithm actually ranks content.

## Features

| Mode | Command | What It Does |
|------|---------|--------------|
| **Draft** | `/x-grow draft "topic"` | Creates researched, algorithm-optimized posts |
| **Review** | `/x-grow review` | Analyzes drafts with scoring and suggestions |
| **Image** | `/x-grow image "description"` | Generates visuals optimized for X engagement |

## Installation

x-grow is a Claude Code skill. Install via:

```bash
# Add the skill to Claude Code
claude skill add x-grow
```

Or manually add to your skills directory. See [Skills](../../mcp/skills.md) for details.

## Usage

### Draft Mode

```
/x-grow draft "AI agents in crypto"
```

Claude will:
1. Research current trends on the topic
2. Apply algorithm optimization rules
3. Generate multiple post variations
4. Explain why each variation works

Example output:
```
Draft 1 (Engagement-optimized):
"AI agents aren't just trading crypto.
They're paying for their own intelligence.
No API keys. No subscriptions.
Just USDC and execution.
This is what economic autonomy looks like."

Why it works:
- Short lines for mobile readability
- Pattern interrupt at end
- No external links (algorithm penalty)
- Strong hook in first line
```

### Review Mode

```
/x-grow review
```

Paste your draft, and Claude will:
- Score it (1-100) on algorithm factors
- Identify weaknesses
- Suggest specific improvements
- Check for common mistakes

Example:
```
Your draft: "Check out our new AI trading bot! Link: https://..."

Score: 35/100

Issues:
❌ External link (severe algorithm penalty)
❌ "Check out" is weak CTA
❌ No hook in first line
❌ Too promotional

Suggestions:
→ Remove link, put in reply
→ Start with bold claim or question
→ Add line breaks for readability
→ End with engagement prompt
```

### Image Mode

```
/x-grow image "futuristic AI agent trading crypto"
```

Claude generates an image optimized for X using nano-banana or DALL-E. Images are:
- 16:9 aspect ratio (optimal for X feed)
- High contrast for mobile viewing
- Text-free (captions go in post)

**Pricing:** ~$0.05 per image

## Algorithm Factors

x-grow optimizes for these known X algorithm signals:

| Factor | Impact | What x-grow Does |
|--------|--------|------------------|
| Dwell time | High | Creates readable, engaging content |
| Replies | High | Adds conversation hooks |
| Links | Negative | Moves links to replies |
| Media | Positive | Suggests when to add images |
| First line | Critical | Optimizes hook |
| Post length | Variable | Recommends optimal length |

## Pricing

| Feature | Cost |
|---------|------|
| Draft mode | Free (uses Claude) |
| Review mode | Free (uses Claude) |
| Image generation | ~$0.05/image |

## Best Practices

### DO:
- Use draft mode for ideation
- Always run review before posting
- Put links in first reply, not main post
- Add images for 2x+ engagement

### DON'T:
- Copy drafts verbatim — add your voice
- Ignore review warnings
- Include links in main post
- Use generic CTAs ("check out", "click here")

## Example Workflow

```
1. /x-grow draft "building with AI agents"
   → Get 3 optimized draft variations

2. Pick best draft, customize with your voice

3. /x-grow review
   → Paste customized draft
   → Get score and improvements

4. /x-grow image "AI agent network visualization"
   → Get engagement-optimized image

5. Post main content + image
6. Reply with link (if needed)
```

## Limitations

- Algorithm changes frequently — tips are best-effort
- Can't guarantee viral posts
- Image generation requires funded wallet
- English optimization only (for now)

## Links

- [GitHub: x-grow](https://github.com/BlockRunAI/x-grow)
- [nano-banana (image generation)](nano-banana.md)
- [Skills Overview](../../mcp/skills.md)
