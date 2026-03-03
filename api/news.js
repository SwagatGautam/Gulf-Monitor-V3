// /api/news.js — Vercel Serverless Function
// Proxies requests to Claude API so the API key stays server-side
// GET: returns cached news from Upstash Redis (fast)
// POST: fetches fresh news from Claude API, caches in Redis, returns it

import { Redis } from '@upstash/redis';

const KV_KEY = 'latest_news';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---- GET: return cached news from Redis ----
  if (req.method === 'GET') {
    try {
      const redis = getRedis();
      if (!redis) return res.status(200).json({ items: [], source: 'no-kv' });
      const cached = await redis.get(KV_KEY);
      if (cached && Array.isArray(cached)) {
        return res.status(200).json({ items: cached, source: 'cache' });
      }
      return res.status(200).json({ items: [], source: 'empty' });
    } catch (err) {
      console.error('KV read error:', err);
      return res.status(200).json({ items: [], source: 'error' });
    }
  }

  // ---- POST: fetch fresh news, cache it, return it ----
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Search for the very latest breaking news about the Iran war, focusing on Kuwait, Persian Gulf, Strait of Hormuz, GCC countries.

IMPORTANT URL RULES:
- Each sourceUrl MUST link to a SPECIFIC standalone article — NOT a live blog, NOT a "live-updates" page
- NEVER use URLs containing "live-blog", "live-updates", "liveblog", or "live_" in them
- Each URL must directly correspond to the specific headline — when a user clicks it, the article should match the headline
- Prefer individual news articles from Reuters, AP, Al Jazeera, BBC, CNN standalone articles, etc.

Return ONLY a valid JSON array of up to 5 news items. Each item must have:
- "titleAr": Arabic headline (translate if English source)
- "source": Source name
- "sourceUrl": Full URL to the SPECIFIC article (no live blogs)
- "category": one of "military", "politics", "economy", "local"

No markdown, no backticks, no explanation. Just the raw JSON array starting with [ and ending with ].`
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const data = await response.json();

    // Extract text content from response
    const texts = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    const clean = texts.replace(/```json|```/g, '').trim();
    const match = clean.match(/\[[\s\S]*?\]/);

    if (match) {
      try {
        const items = JSON.parse(match[0]);
        const validItems = items
          .filter(item => item.titleAr && item.sourceUrl)
          .slice(0, 5);

        // Cache in Redis (non-blocking — don't fail the request if KV is down)
        if (validItems.length > 0) {
          try {
            const redis = getRedis();
            if (redis) await redis.set(KV_KEY, validItems);
          } catch (kvErr) {
            console.error('KV write error:', kvErr);
          }
        }

        return res.status(200).json({ items: validItems, source: 'fresh' });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return res.status(200).json({ items: [] });
      }
    }

    return res.status(200).json({ items: [] });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
